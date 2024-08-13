@[toc]

# 前言
你好，我是醉墨居士，在当今的技术领域，区块链技术无疑是一颗璀璨的明珠，其去中心化、不可篡改和安全可靠的特性吸引了无数开发者的目光，在这篇博客中我将介绍如何使用强大和高效的Go语言开发一个极简的区块链模型

# 交易结构体
```go
type Transaction struct {
    Sender    string   // 交易的发送方的唯一标识符
    Receiver  string   // 交易的接收方的唯一标识符
    Amount    float64  // 交易金额
}
```

# 区块结构体
```go
type Block struct {
    Index        int     	   // 区块的索引
    Timestamp    string  	   // 区块创建的时间戳
    Data         string  	   // 区块携带的数据
    PrevHash     string  	   // 前一个区块的哈希值
    Hash         string  	   // 当前区块的哈希值
	Transactions []Transaction // 交易列表
    Nonce        int           // 证明工作量的随机数
}
```

# 区块链结构体
```go
type Blockchain struct {
    Chain []Block  // 区块链条
}
```

# 计算区块哈希值
```go
func (b *Block) CalculateHash() string {
    data := strconv.Itoa(block.Index) + block.Timestamp + fmt.Sprintf("%v", block.Transactions) + block.PrevHash + strconv.Itoa(block.Nonce)
    hash := sha256.Sum256([]byte(data))
    return fmt.Sprintf("%x", hash)
}
```

# 工作量证明（PoW）
通过不断调整 Nonce 值，计算出满足一定难度要求的哈希值，确保新区块的生成需要一定的计算量
```go
func (b *Block) ProofOfWork(difficulty int) int {
    var nonce int
    for {
        hash := b.CalculateHash()
        if strings.HasPrefix(hash, strings.Repeat("0", difficulty)) {
            return nonce
        }
        nonce++
    }
}
```

# 生成新区块
```go
func (b *Block) GenerateBlock(data string) Block {
    block := Block{
        Index:     oldBlock.Index + 1,
        Timestamp: time.Now().String(),
        Data:      data,
        PrevHash:  b.Hash,
    }
    block.Hash = block.CalculateHash()
    return newBlock
}
```

# 验证区块合法性
```go
func (b *Block) VaildBlock(prevBlock Block) bool {
    // 检查索引是否连续递增
    if b.Index!= prevBlock.Index + 1 {
        return false
    }

    // 检查时间戳是否合理（简单示例，实际可能更复杂）
    newTime, _ := time.Parse("2006-01-02 15:04:05", b.Timestamp)
    prevTime, _ := time.Parse("2006-01-02 15:04:05", prevBlock.Timestamp)
    if newTime.Before(prevTime) {
        return false
    }

    // 重新计算哈希值并与存储的哈希值比较
    calculatedHash := b.CalculateHash()
    if calculatedHash!= b.Hash {
        return false
    }

    // 检查前一区块哈希值是否匹配
    if b.PrevHash!= prevBlock.Hash {
        return false
    }

    return true
}
```

# 添加新区块
```go
func (bc *Blockchain) AddBlock(transactions []Transaction) {
    lastBlock := bc.Chain[len(bc.Chain)-1]
    block := Block{
        Index:         lastBlock.Index + 1,
        Timestamp:     time.Now().String(),
        Transactions:  transactions,
        PrevHash:      lastBlock.Hash,
        Nonce:         0,
    }
    block.Nonce = block.ProofOfWork(2) 
    block.Hash = block.CalculateHash()
    bc.Chain = append(bc.Chain, block)
}
```

# 最后
我是醉墨居士，我们已经完成了区块链的基本模型，希望大家多收藏、点赞、关注，我们下篇博客再见
