# GO语言篇之交叉编译

GO可以使用交叉编译来生成各种平台的可执行文件

我的系统是debian12，所以我今天只讲解在linux下GO语言如何交叉编译，windows和mac所用到的命令也差不多

```sh
#linux下生成windows的可执行程序
go env -w CGO_ENABLED=0
go env -w GOOS=windows
go env -w GOARCH=amd64
go build .
```

```sh
#linux下生成mac的可执行程序
go env -w CGO_ENABLED=0
go env -w GOOS=darwin
go env -w GOARCH=amd64
go build .
```

可以看到GO语言的交叉编译真的是相当方便
