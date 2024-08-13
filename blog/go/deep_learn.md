
@[toc]

# 开发前言
正向传播是指从神经网络的输入层开始，通过逐层计算和传递，将输入数据一直传递到输出层。在每一层中，通过对输入数据进行加权求和并应用激活函数，得到该层的输出。这个过程可以看作是将输入数据在网络中前进（向前传播），直至得到模型的预测结果。

反向传播是指根据模型的预测结果和实际标签之间的差异，从输出层向输入层反向计算梯度，并利用梯度来更新网络参数。

这篇博客我将使用Go语言实现正向传播和反向传播，帮助你理解其底层的运转规律

项目代码使用纯粹的Go语言标准库实现，不借用任何其它第三方库。用轮子是生活，造轮子是信仰。

我是醉墨居士，我们现在开始吧🤗
# 开发理论
一个数学函数，由一系列数据和一系列运算方式构成，我们将数据对应为数据节点，将运算方式对应为算子节点，这样我们就可以将数学函数转化为由一系列数据节点和一系列算子节点组成的数据流图

正向传递数据流图，不断运算数据，就是正向传播的过程
反向传递数据流图，不断累加梯度，就是反向传播的过程

# 图解理论
我画了两张图来表示函数3 * pow(x, 2) + 2 * x + 1的正向传播和反向传播的过程

正向传播图解
![forward](https://i-blog.csdnimg.cn/blog_migrate/e747bfc6aea5a94f5253d3c2b351c4d0.png)

反向传播图解
![backward](https://i-blog.csdnimg.cn/blog_migrate/de471635c67c01c8cdcc83e336e8eade.png)

# 数据类型
data/type.go
```go
package data

type Type interface {
    ~int | ~int32 | ~int64 |
    ~uint | ~uint32 | ~uint64 |
    ~float32 | ~float64
}
```

# 数学函数
math/math.go
```go
package math

import (
	"dl/node"
	stmath "math"
)

func Pow[T node.Type](a, b T) T {
	return T(stmath.Pow(float64(a), float64(b)))
}

func Ln[T node.Type](a T) T {
	return T(stmath.Log(float64(a)))
}

func Tan[T node.Type](a T) T {
	return T(stmath.Tan(float64(a)))
}

func Sin[T node.Type](a T) T {
	return T(stmath.Sin(float64(a)))
}

func Cos[T node.Type](a T) T {
	return T(stmath.Cos(float64(a)))
}
```

# 数据节点统一抽象
fm/datanode.go
```go
type DataNode[T data.Type] interface {
	Data()T
	SetData(T)
	Grad()T
	setGrad(T)
	preNode() CalNode[T]
	backNodes() *[]CalNode[T]
	fm()FlowMap[T]
	Add(DataNode[T]) DataNode[T]
	Sub(DataNode[T]) DataNode[T]
	Mul(DataNode[T]) DataNode[T]
	Div(DataNode[T]) DataNode[T]
	Pow(DataNode[T]) DataNode[T]
	Ln() DataNode[T]
	Tan() DataNode[T]
	Sin() DataNode[T]
	Cos() DataNode[T]
}
```

# 变量数据节点
```go
package fm

import "dl/data"

type varDataNode[T data.Type] struct {
	data T
	grad T
	prenode CalNode[T]
	backnodes []CalNode[T]
	flowmap FlowMap[T]
}

func (n *varDataNode[T]) Data() T {
	return n.data
}

func (n *varDataNode[T]) SetData(i T) {
	n.data = i
}

func (n *varDataNode[T]) Grad() T {
	return n.grad
}

func (n *varDataNode[T]) setGrad(i T) {
	n.grad = i
}

func (n *varDataNode[T]) preNode() CalNode[T] {
	return n.prenode
}

func (n *varDataNode[T]) backNodes() *[]CalNode[T] {
	return &n.backnodes
}

func (n *varDataNode[T]) fm() FlowMap[T] {
	return n.flowmap
}

func (n *varDataNode[T]) Add(node DataNode[T]) DataNode[T] {
	return calTwo(newAdd[T](), n, node)
}

func (n *varDataNode[T]) Sub(node DataNode[T]) DataNode[T] {
	return calTwo(newSub[T](), n, node)
}

func (n *varDataNode[T]) Mul(node DataNode[T]) DataNode[T] {
	return calTwo(newMul[T](), n, node)
}

func (n *varDataNode[T]) Div(node DataNode[T]) DataNode[T] {
	return calTwo(newDiv[T](), n, node)
}

func (n *varDataNode[T]) Pow(node DataNode[T]) DataNode[T] {
	return calTwo(newPow[T](), n, node)
}

func (n *varDataNode[T]) Ln() DataNode[T] {
	return calOne(newLn[T](), n)
}

func (n *varDataNode[T]) Tan() DataNode[T] {
	return calOne(newTan[T](), n)
}

func (n *varDataNode[T]) Sin() DataNode[T] {
	return calOne(newSin[T](), n)
}

func (n *varDataNode[T]) Cos() DataNode[T] {
	return calOne(newCos[T](), n)
}
```

# 常量数据节点
```go
type constDataNode[T data.Type] struct {
	data      T
	prenode   CalNode[T]
	backnodes []CalNode[T]
	flowmap   FlowMap[T]
}

func (n *constDataNode[T]) Data() T {
	return n.data
}

func (n *constDataNode[T]) SetData(i T) {
	n.data = i
}
func (n *constDataNode[T]) Grad() T {
	return 0
}

func (n *constDataNode[T]) setGrad(T) {}

func (n *constDataNode[T]) preNode() CalNode[T] {
	return n.prenode
}

func (n *constDataNode[T]) backNodes() *[]CalNode[T] {
	return &n.backnodes
}

func (n *constDataNode[T]) fm() FlowMap[T] {
	return n.flowmap
}

func (n *constDataNode[T]) Add(node DataNode[T]) DataNode[T] {
	return calTwo(newAdd[T](), n, node)
}

func (n *constDataNode[T]) Sub(node DataNode[T]) DataNode[T] {
	return calTwo(newSub[T](), n, node)
}

func (n *constDataNode[T]) Mul(node DataNode[T]) DataNode[T] {
	return calTwo(newMul[T](), n, node)
}

func (n *constDataNode[T]) Div(node DataNode[T]) DataNode[T] {
	return calTwo(newDiv[T](), n, node)
}

func (n *constDataNode[T]) Pow(node DataNode[T]) DataNode[T] {
	return calTwo(newPow[T](), n, node)
}

func (n *constDataNode[T]) Ln() DataNode[T] {
	return calOne(newLn[T](), n)
}

func (n *constDataNode[T]) Tan() DataNode[T] {
	return calOne(newTan[T](), n)
}

func (n *constDataNode[T]) Sin() DataNode[T] {
	return calOne(newSin[T](), n)
}

func (n *constDataNode[T]) Cos() DataNode[T] {
	return calOne(newCos[T](), n)
}
```

# 单目运算封装
```go
func calOne[T data.Type](operation CalNode[T], a DataNode[T]) DataNode[T] {
	*a.fm().calnodes = append(*a.fm().calnodes, operation)
	*a.backNodes() = append(*a.backNodes(), operation)
	res := &varDataNode[T]{
		prenode: operation,
		flowmap: a.fm(),
	}
	*a.fm().datanodes = append(*a.fm().datanodes, res)
	operation.CalNode().PreNodes = []DataNode[T]{a}
	operation.CalNode().BackNode = res
	return res
}
```

# 双目运算封装
```go
func calTwo[T data.Type] (operation CalNode[T], a, b DataNode[T]) DataNode[T] {
	if a.fm() != b.fm() {
		return nil
	}
	*a.fm().calnodes = append(*a.fm().calnodes, operation)
	*a.backNodes() = append(*a.backNodes(), operation)
	*b.backNodes() = append(*b.backNodes(), operation)
	res := &varDataNode[T]{
		prenode: operation,
		flowmap: a.fm(),
	}
	*a.fm().datanodes = append(*a.fm().datanodes, res)
	operation.CalNode().PreNodes = []DataNode[T]{a, b}
	operation.CalNode().BackNode = res
	return res
}
```

# 算子节点统一抽象
fm/calnode.go
```go
type CalNode[T data.Type] interface {
	CalNode() *BaseCalNode[T]
	Forward()
	Backward()
}
```

# 基础算子
```go
type BaseCalNode[T data.Type] struct {
	PreNodes []DataNode[T]
	BackNode DataNode[T]
}
```

# 加法算子
```go
type AddNode[T data.Type] BaseCalNode[T]

func newAdd[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*AddNode[T])(basenode)
}

func (n *AddNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *AddNode[T]) Forward() {
	n.BackNode.SetData(n.CalNode().PreNodes[0].Data() + n.CalNode().PreNodes[1].Data())
}

func (n *AddNode[T]) Backward() {
	// selfgrad + backgrad
	grad0 := n.PreNodes[0].Grad() + n.BackNode.Grad()
	// selfgrad + backgrad
	grad1 := n.PreNodes[1].Grad() + n.BackNode.Grad()

	n.PreNodes[0].setGrad(grad0)
	n.PreNodes[1].setGrad(grad1)
}
```

# 减法算子
```go
type SubNode[T data.Type] BaseCalNode[T]

func newSub[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*SubNode[T])(basenode)
}

func (n *SubNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *SubNode[T]) Forward() {
	n.BackNode.SetData(n.CalNode().PreNodes[0].Data() - n.CalNode().PreNodes[1].Data())
}

func (n *SubNode[T]) Backward() {
	// selfgrad + backgrad
	grad0 := n.PreNodes[0].Grad() + n.BackNode.Grad()
	// selfgrad - backgrad
	grad1 := n.PreNodes[1].Grad() - n.BackNode.Grad()

	n.PreNodes[0].setGrad(grad0)
	n.PreNodes[1].setGrad(grad1)
}
```

# 乘法算子
```go
type MulNode[T data.Type] BaseCalNode[T]

func newMul[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*MulNode[T])(basenode)
}

func (n *MulNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *MulNode[T]) Forward() {
	n.BackNode.SetData(n.CalNode().PreNodes[0].Data() * n.CalNode().PreNodes[1].Data())
}

func (n *MulNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	b := n.PreNodes[1].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad * b)
	grad0 := n.PreNodes[0].Grad() + (backgrad * b)
	// selfgrad + (backgrad * a)
	grad1 := n.PreNodes[1].Grad() + (backgrad * a)

	n.PreNodes[0].setGrad(grad0)
	n.PreNodes[1].setGrad(grad1)
}
```

# 除法算子
```go
type DivNode[T data.Type] BaseCalNode[T]

func newDiv[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*DivNode[T])(basenode)
}

func (n *DivNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *DivNode[T]) Forward() {
	n.BackNode.SetData(n.CalNode().PreNodes[0].Data() / n.CalNode().PreNodes[1].Data())
}

func (n *DivNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	b := n.PreNodes[1].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad / b)
	grad0 := n.PreNodes[0].Grad() + (backgrad / b)
	// selfgrad - (backgrad * a / pow(b, 2))
	grad1 := n.PreNodes[1].Grad() - (backgrad * a / math.Pow(b, 2))

	n.PreNodes[0].setGrad(grad0)
	n.PreNodes[1].setGrad(grad1)
}
```

# 指数算子
```go
type PowNode[T data.Type] BaseCalNode[T]

func newPow[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*PowNode[T])(basenode)
}

func (n *PowNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *PowNode[T]) Forward() {
	n.BackNode.SetData(math.Pow(n.CalNode().PreNodes[0].Data(), n.CalNode().PreNodes[1].Data()))
}

func (n *PowNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	b := n.PreNodes[1].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad * b * pow(a, b-1))
	grad0 := n.PreNodes[0].Grad() + (backgrad * b * math.Pow(a, b-1))
	// selfgrad + (backgrad * pow(a, b) * ln(a))
	grad1 := n.PreNodes[1].Grad() + (backgrad * math.Pow(a, b) * math.Ln(a))

	n.PreNodes[0].setGrad(grad0)
	n.PreNodes[1].setGrad(grad1)
}
```

# 对数算子
```go
type LnNode[T data.Type] BaseCalNode[T]

func newLn[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*LnNode[T])(basenode)
}

func (n *LnNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *LnNode[T]) Forward() {
	n.BackNode.SetData(math.Ln(n.CalNode().PreNodes[0].Data()))
}

func (n *LnNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad / a)
	grad0 := n.PreNodes[0].Grad() + (backgrad / a)

	n.PreNodes[0].setGrad(grad0)
}
```

# 正切算子
```go
type TanNode[T data.Type] BaseCalNode[T]

func newTan[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*TanNode[T])(basenode)
}

func (n *TanNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *TanNode[T]) Forward() {
	n.BackNode.SetData(math.Tan(n.CalNode().PreNodes[0].Data()))
}

func (n *TanNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad / pow(cos(a), 2))
	grad0 := n.PreNodes[0].Grad() + (backgrad / math.Pow(math.Cos(a), 2))

	n.PreNodes[0].setGrad(grad0)
}
```

# 正弦算子
```go
type SinNode[T data.Type] BaseCalNode[T]

func newSin[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*SinNode[T])(basenode)
}

func (n *SinNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *SinNode[T]) Forward() {
	n.BackNode.SetData(math.Sin(n.CalNode().PreNodes[0].Data()))
}

func (n *SinNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad + (backgrad * cos(a))
	grad0 := n.PreNodes[0].Grad() + (backgrad * math.Cos(a))

	n.PreNodes[0].setGrad(grad0)
}
```

# 余弦算子
```go
type CosNode[T data.Type] BaseCalNode[T]

func newCos[T data.Type]() CalNode[T] {
	basenode := &BaseCalNode[T]{}
	return (*CosNode[T])(basenode)
}

func (n *CosNode[T]) CalNode() *BaseCalNode[T] {
	return (*BaseCalNode[T])(n)
}

func (n *CosNode[T]) Forward() {
	n.BackNode.SetData(math.Cos(n.CalNode().PreNodes[0].Data()))
}

func (n *CosNode[T]) Backward() {
	a := n.PreNodes[0].Data()
	backgrad := n.BackNode.Grad()

	// selfgrad - (backgrad * sin(a))
	grad0 := n.PreNodes[0].Grad() - (backgrad * math.Sin(a))

	n.PreNodes[0].setGrad(grad0)
}
```

# 数据流图
fm/flowmap.go
```go
type FlowMap[T data.Type] struct {
	calnodes  *[]CalNode[T]
	datanodes *[]DataNode[T]
}

func NewFlowMap[T data.Type]() *FlowMap[T] {
	calnodes := make([]CalNode[T], 0)
	datanods := make([]DataNode[T], 0)

	return &FlowMap[T]{
		calnodes:  &calnodes,
		datanodes: &datanods,
	}
}

func (m FlowMap[T]) NewData() DataNode[T] {
	node := &varDataNode[T]{
		backnodes: make([]CalNode[T], 0),
		flowmap:   m,
	}
	*m.datanodes = append(*m.datanodes, node)
	return node
}

func (m FlowMap[T]) NewConstData(i T) DataNode[T] {
	return &constDataNode[T]{
		backnodes: make([]CalNode[T], 0),
		data:      i,
		flowmap:   m,
	}
}
```

# 正向传播
```go
func (m FlowMap[T]) Forward() {
	n := len(*m.calnodes)
	for i := 0; i < n; i++ {
		(*m.calnodes)[i].Forward()
	}
}
```

# 反向传播
```go
func (m FlowMap[T]) Backward() {
	for i := len(*m.datanodes) - 1; i >= 0; i-- {
		(*m.datanodes)[i].setGrad(0)
	}

	n := len(*m.calnodes)-1
	(*m.calnodes)[n].CalNode().BackNode.setGrad(1)

	for i := n; i >= 0; i-- {
		(*m.calnodes)[i].Backward()
	}
}
```

# 正向训练
```go
func (m FlowMap[T]) ForwardWalk(step T) {
	for i := len(*m.datanodes) - 1; i >= 0; i-- {
		(*m.datanodes)[i].SetData((*m.datanodes)[i].Data() + (*m.datanodes)[i].Grad() * step)
	}
}
```

# 反向训练
```go
func (m FlowMap[T]) BackwardWalk(step T) {
	for i := len(*m.datanodes) - 1; i >= 0; i-- {
		(*m.datanodes)[i].SetData((*m.datanodes)[i].Data() - (*m.datanodes)[i].Grad() * step)
	}
}
```

# 运行示例
我们的运行示例使用理论图解的那个例子： 3 * pow(x, 2) + 2 * x + 1
```go
// 3 * pow(x, 2) + 2 * x + 1
func main() {
	m := fm.NewFlowMap[float64]()
	x := m.NewData()
	three := m.NewConstData(3)
	two := m.NewConstData(2)
	one := m.NewConstData(1)
	res := three.Mul(x.Pow(two)).Add(two.Mul(x)).Add(one)

	x.SetData(2)
	m.Forward()
	m.Backward()
	// data = 3 * pow(2, 2) + 2 * 2 + 1 = 17
	// grad = 2 + 6 * x = 14
	fmt.Println("x=2 -> ", "res.data =", res.Data(), ",", "x.grad =", x.Grad())

	x.SetData(3)
	m.Forward()
	m.Backward()
	// data = 3 * pow(3, 2) + 2 * 3 + 1 = 34
	// grad = 2 + 6 * x = 20
	fmt.Println("x=3 -> ", "res.data =", res.Data(), ",", "x.grad =", x.Grad())

	x.SetData(4)
	m.Forward()
	m.Backward()
	// data = 3 * pow(4, 2) + 2 * 4 + 1 = 57
	// grad = 2 + 6 * x = 26
	fmt.Println("x=4 -> ", "res.data =", res.Data(), ",", "x.grad =", x.Grad())
}
```

运行结果
![result](https://i-blog.csdnimg.cn/blog_migrate/fcf47e485dbeb71ecc5eb7756a92b2a5.png)

# 开发总结
恭喜你，我们一起使用Go语言完成了深度学习的正向传播和反向传播，希望这个项目能让你有所收获😊

我的特色就是用最简单的方式帮助你学会最硬核的知识，一起加油吧❤️

我是醉墨居士，之前这个账号改了好几次名称，从此之后这个账号的名称大概率不会再变动😜

如果有什么错误，请你评论区或者私信我指出，让我们一起进步✌️

请你多多关注我，开发这个项目，并且整理总结，花费了很多的精力，博客热度越高，更新速度越快😎