# GO语言篇之CGO

@[toc]

## 前言
Go语言可以通过内置的CGO调用C语言接口，从而实现C语言代码的交互，CGO提供了一种将Go代码嵌入到C代码中，或者从Go代码中调用C函数的方法

## C代码嵌入GO代码

```go
package main

/*
// 注意C代码要以注释的形式存在

#include <stdio.h>

static void SayHello(const char* s) {
    puts(s);
}
*/
import "C"

func main() {
    C.SayHello(C.CString("Hello CGO"))
}
```

## C文件嵌入GO代码
目录结构，注意c代码文件和main.go处于同一级别

![Alt text](assets/images/cgo.png)
```c
// clib.c
#include <stdio.h>

void SayHello(const char* s) {
    puts(s);
}
```
```go
// main.go
package main

//声明引用的C函数

//void SayHello(const char* s);
import "C"

func main() {
    C.SayHello(C.CString("Hello CGO"))
}
```

## 缺点
>1. 性能损失：CGO中存在Go代码和C代码之间内存分配和拷贝，及函数调用的开销，这可能导致性能下降，特别是频繁调用的函数
>2. 复杂性增加：CGO需要熟悉C和Go两种语言，并理解它们之间的交互，和纯粹的Go开发相比，CGO具有更高的复杂度和学习曲线
>3. 平台依赖性：因为C代码可能依赖于特定的操作系统或编译器特性，因此CGO可能在不同平台上表现不一致
>4. 调试困难：因为CGO涉及C，Go间的交互，错误可能发生在C代码或Go代码中的任何地方，导致调试变得更加困难
>5. 安全性问题：Go代码调用C代码中访问底层系统资源，执行不受Go语言安全保护的操作，这可能增加代码中的安全风险