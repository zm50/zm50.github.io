# GO语言篇之embed

@[toc]

## 前言
embed是Go语言提供的一种机制，可使静态文件或文件夹嵌入Go语言程序中，使我们Go语言的可执行文件包含了这些数据，这样就可以只使用一个Go语言的可执行程序就能运行了

## 目录结构
![目录结构](https://img-blog.csdnimg.cn/bbde2b41344c4ff5b2da9d093131a905.png#pic_center)

## 文件转[]byte
```go
import (
	_ "embed"
)

//go:embed static/cat.png
var catImg []byte
```

## 文件转string
```go
import (
	_ "embed"
)

//go:embed static/sentence.txt
var sentence []byte
```

## 多文件转embed.FS
```go
import (
    "embed"
)

//go:embed static/image/cat.png static/image/dog.png static/sentence.txt static/dog.png
var fs embed.FS
```

## 目录转embed.FS
```go
import (
    "embed"
)

//go:embed static/*
var fs embed.FS
```

## 文件和目录组合的方式转embed.FS
```go
import (
    "embed"
)

//go:embed static/image/* static/sentence.txt static/words.txt
var fs embed.FS
```