@[toc]

# 前言
大模型的tokenizer用于将原始文本输入转化为模型可处理的输入形式。tokenizer将文本分割成单词、子词或字符，并将其编码为数字表示。大模型的tokenizer通常基于词表进行编码，使用词嵌入将单词映射为向量表示。tokenizer还可以将输入文本进行填充和截断，以确保所有输入序列的长度一致，以便于模型的批量处理。

这篇博客的tokenizer分析器使用纯粹的Go语言标准库实现，不借用任何其它第三方库。用轮子是生活，造轮子是信仰。

# 核心结构体定义
```go
type BytePairEncoder struct {
	wsToken  string
	unkToken string
	// k: word, v: tokens
	wordToken map[string]*[]string
	// k: word, v: count
	wordCount map[string]int
	// k: token, v: count
	tokenCount map[string]int
	// k: id, v: token
	idToken map[int]string
	// k: token, v: id
	tokenId map[string]int
}
```

# 构造函数
```go
func DefaultBytePairEncoder() *BytePairEncoder {
	return NewBytePairEncoder("_", " ")
}

func NewBytePairEncoder(wsToken, unkToken string) *BytePairEncoder {
	return &BytePairEncoder{
		wsToken:    wsToken,
		unkToken:   unkToken,
		wordToken:  make(map[string]*[]string),
		wordCount:  make(map[string]int),
		tokenCount: make(map[string]int),
		idToken:   make(map[int]string),
		tokenId:   make(map[string]int),
	}
}
```

# 文本初始处理
```go
func (e *BytePairEncoder) wordToTokens(word string) *[]string {
	parts := []rune(word)
	n := len(parts)
	res := make([]string, n)
	for i := 0; i < n; i++ {
		token := string(parts[i])
		e.tokenCount[token]++
		res[i] = token
	}
	return &res
}

func (e *BytePairEncoder) preprocess(text string) []string {
	text = strings.TrimSpace(text)
	return strings.Fields(text)
}

func (e *BytePairEncoder) processWord(word string) {
	e.wordToken[word] = e.wordToTokens(word)
	e.wordCount[word]++
}

func (e *BytePairEncoder) initState(text string) {
	words := e.preprocess(text)
	for _, word := range words {
		e.processWord(e.wsToken + word)
	}
}
```

# 组词
```go
func (e *BytePairEncoder) mergePair() {
	// k: token, v: count
	m := make(map[string]int)
	for word, tokens := range e.wordToken {
		n := len(*tokens) - 1
		for i := 0; i < n; i++ {
			m[(*tokens)[i]+(*tokens)[i+1]] += e.wordCount[word]
		}
	}

	maxToken := ""
	maxCount := 0
	for k, v := range m {
		if v > maxCount {
			maxToken = k
			maxCount = v
		}
	}

	if maxCount < 2 {
		return
	}

	e.tokenCount[maxToken] = maxCount

	for _, tokens := range e.wordToken {
		n := len(*tokens) - 1
		for i := 0; i < n; i++ {
			if (*tokens)[i]+(*tokens)[i+1] == maxToken {
				e.tokenCount[(*tokens)[i]]--
				e.tokenCount[(*tokens)[i+1]]--
				post := (*tokens)[i+1:]
				post[0] = maxToken
				*tokens = (*tokens)[:i]
				*tokens = append((*tokens), post...)
				*tokens = (*tokens)[:len(*tokens)]

				i--
				n -= 2
			}
		}
	}
}

func (e *BytePairEncoder) merge(steps int) {
	for i := 0; i < steps; i++ {
		e.mergePair()
	}
}
```

# 构建词组索引
```go
func (e *BytePairEncoder) buildIndex() {
	e.tokenId[e.unkToken] = 0
	e.idToken[0] = e.unkToken
	i := 1
	for token := range e.tokenCount {
		e.tokenId[token] = i
		e.idToken[i] = token
		i++
	}
}
```

# 训练数据
```go
func (e *BytePairEncoder) Train(text string, steps int) {
	e.initState(text)
	e.merge(steps)
	e.buildIndex()
}
```

# 编码
```go
func (e *BytePairEncoder) segment(words []string) []int {
	res := make([]int, 0)
	for _, word := range words {
		parts := []rune(word)
	NEXT:
		for i := len(parts); i >= 1; i-- {
			if code, ok := e.tokenId[string(parts[:i])]; ok {
				parts = parts[i:]
				res = append(res, code)
				goto NEXT
			}
		}
		if len(parts) == 0 {
			continue
		}
		code := e.tokenId[string(parts[0])]
		res = append(res, code)
		parts = parts[1:]
		if len(parts) != 0 {
			goto NEXT
		}
	}

	return res
}

func (e *BytePairEncoder) Encode(text string) []int {
	words := e.preprocess(text)
	return e.segment(words)
}
```

# 解码
```go
func (e *BytePairEncoder) Decode(codes []int) []string {
	res := make([]string, 0)
	for _, code := range codes {
		res = append(res, e.idToken[code])
	}

	return res
}
```

# 打印状态信息
```go
func (e *BytePairEncoder) Dump() {
	fmt.Println("===== dump state ======")
	fmt.Println("===> dump wordToken <===")
	for word, tokens := range e.wordToken {
		fmt.Println(word, "=>", *tokens)
	}
	fmt.Println()
	fmt.Println("===> dump wordcnt <===")
	for word, count := range e.wordCount {
		fmt.Println(word, "=>", count)
	}
	fmt.Println()
	fmt.Println("===> dump tokenCount <===")
	for token, count := range e.tokenCount {
		fmt.Println(token, "=>", count)
	}
	fmt.Println()
	fmt.Println("===> dump idTokens <===")
	for code, token := range e.idToken {
		fmt.Println(code, "=>", token)
	}
	fmt.Println()
	fmt.Println("===> dump tokenIds <===")
	for token, code := range e.tokenId {
		fmt.Println(token, "=>", code)
	}
	fmt.Println()
}
```

# 运行效果
我们的tokenizer已经开发完毕，现在可以运行我们的tokenizer，看看是否能达到我们想要的效果
```go
package main

import (
	"fmt"
	"os"
	"tokenizer"
)

func main() {
	trainData, err := os.ReadFile("./data.txt")
	if err != nil {
		panic(err)
	}
	steps := 50
	enc := tokenizer.DefaultBytePairEncoder()
	enc.Train(string(trainData), steps)
	input := "提取数据特征进行预测"
	codes := enc.Encode(input)
	tokens := enc.Decode(codes)
	fmt.Println(codes)
	fmt.Println(tokens)
}
```

输入数据集
data.txt
```txt
机器学习、深度学习和强化学习是人工智能领域中的三个重要技术方向。以下是它们的区别：
机器学习：机器学习是一种通过从数据中自动学习模式和规律来进行预测和决策的方法。它涉及到使用算法和统计模型，从数据中提取特征并进行模型训练，进而对未知数据进行预测或分类。机器学习的重点在于自动学习和泛化能力，它不需要明确的指令或规则来执行任务，而是通过数据和经验来改善性能。
深度学习：深度学习是机器学习的一个分支，它使用包含多个神经网络层的深度神经网络进行学习和预测。深度学习模型通过层层堆叠的方式，从原始数据中学习到多个抽象层次的特征表示。深度学习的优势在于可以自动提取复杂的特征，并通过大规模数据的训练来优化模型性能。它被广泛应用于计算机视觉、自然语言处理和语音识别等领域。
强化学习：强化学习是一种机器学习的方法，旨在让机器学习从环境中的交互中通过试错来改善性能。它通过不断与环境进行交互，观察环境状态并执行动作，然后从环境的反馈中学习如何在给定环境中做出最优的决策。强化学习的目标是通过学习最优的策略来最大化累积奖励。强化学习在游戏、机器人控制和优化问题等领域有着广泛应用。
总的来说，机器学习是从数据中学习模式和规律，深度学习是机器学习的一种方法，使用深度神经网络来提取复杂的特征表示，强化学习是通过试错学习从环境中改善性能。
```

运行效果
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/a340d3df14f8e62069a7f03cd56d2871.png)

可以根据情况使用Dump函数打印状态信息查看更多细节

# 总结
恭喜你已经制作了一个属于自己的tokenizer分词器，我们实现的相对粗糙一点，但是对于初学者是难得的实战项目，麻雀虽小，五脏俱全。