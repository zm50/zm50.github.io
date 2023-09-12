# GO语言篇之unsafe

@[toc]

## 前言
Go语言的unsafe包可以让我们绕过类型系统，直接操作内存，但是它的操作内存的能力还是有限的

unsafe包中的函数有以下几种类型：

    关于指针的函数：如Pointer型函数可以将指针转化为uintptr型，以及指针的比较、加减等操作
    关于引用的函数：如Sizeof函数可以计算一个变量的字节大小，Align函数返回一个类型的对齐方式，Offsetof函数返回一个结构体字段相对于结构体起始地址的偏移量

## 获取变量的内存地址
```go
import (
    "unsafe"
    "fmt"
)

func main() {
    var num int = 666
    ptr := unsafe.Pointer(&num)
    fmt.Println(ptr)  // 输出变量num的内存地址
}
```

## 将指针转换为不同类型的指针
```go
import (
    "unsafe"
    "fmt"
)

func main() {
    var num int = 666
    var uintNum uint = *(*uint)(unsafe.Pointer(&num))
    fmt.Println(num, uintNum)
}
```

## 获取结构体字段的偏移量
```go
import (
    "unsafe"
    "fmt"
)

type Person struct {
    Name   string
    Age    int
    Height float64
}

func main() {
    nameOffset := unsafe.Offsetof(Person{}.Name)
    ageOffset := unsafe.Offsetof(Person{}.Age)
    heightOffset := unsafe.Offsetof(Person{}.Height)
    fmt.Println(nameOffset, ageOffset, heightOffset)  // 输出字段的偏移量
}
```

## 获取变量的大小和对齐方式
```go
import (
    "unsafe"
    "fmt"
)

type Person struct {
    Age    int
    Weight float64
    Height float64
}

func main() {
    size := unsafe.Sizeof(Person{})
    align := unsafe.Alignof(Person{})
    fmt.Println(size, align)  // 输出结构体的大小和对齐方式
}
```