# GO语言篇之文件操作

@[toc]

## 前言
Go语言提供了丰富的操作文件的函数，这为我们开发者减少了不少负担

## 使用
```go
// 打开文件
file, err := os.Open("filepath")
if err != nil {
    panic(err)
}

// 关闭文件，每次该文件使用完后都要关闭，通常配合defer使用
defer file.Close()

// 读取文件
buf := make([]byte, 1024)
// n是读取的字节数量
n, err := file.Read(buf)
fmt.Println(n)

// 从固定位置开始读取文件
// n是读取的字节数量
n, err = file.ReadAt(buf, 128)
fmt.Println(n)

// 写入文件
// n是写入的字节数量
n, err = file.Write(buf)

// 从固定位置开始读取文件
// n是写入的字节数量
n, err = file.WriteAt(buf, 128)

// 获取文件名
filename := file.Name()
fmt.Println(filename)

// 切换到这个目录
err = file.Chdir()

// 修改权限
err= file.Chmod(0666)

// 设置文件的指针
// 相对于开始位置的偏移量
var offset int64 = 128
// 起始位置，io.SeekStart 文件的开头位置，io.SeekCurrent 文件的当前位置， o.SeekEnd 文件的结尾位置
whence := io.SeekStart
// start是指针的开始位置
start, err := file.Seek(offset, whence)
fmt.Println(start)

// 截断文件
// size是截断后的文件长度
var size int64 = 10
err = file.Truncate(size)
```

## 总结
都是一些比较常用的操作，不难，但是需要熟悉一下