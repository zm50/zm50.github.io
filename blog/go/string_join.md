# GO语言篇之高效拼接字符串

Go语言拼接字符串的方式
```go
func main(){
	a := "aaa"
    b := "bbb"
    c := "ccc"

    //+号操作符，遍历字符串，计算并开辟新的空间来存储原来的两个字符串
	s := a + b + c

	//fmt.Sprintf，接口入参，使用反射获取值，有性能损耗
	s := fmt.Sprintf("%s%s%s", a, b, c)
	
    //strings.Builder，WriteString()拼接，String()返回字符串，内部实现是指针+切片，它是直接把[]byte转换为string，从而避免变量拷贝
	var builder strings.Builder
	builder.WriteString(a)
	builder.WriteString(b)
	builder.WriteString(c)
	s := builder.String()

	//bytes.Buffer，bytes.Buffer是底层是[]byte
	buf := new(bytes.Buffer)
	buf.Write(a)
	buf.Write(b)
	buf.Write(c)
	s := buf.String()

	//strings.Join，基于strings.builder来实现的，可添加分隔符，内部调用了b.Grow(n)方法来进行初始容量分配，计算的n的长度就是我们要拼接的slice的长度，[]string和分隔符进行拼接后的长度固定，对于多个字符串相加只需进行一次容量分配
	s := strings.Join([]string{a,b,c},"")
}
```

性能：strings.Join ≈ strings.Builder > bytes.Buffer > "+" > fmt.Sprintf