# GO语言篇之发布开源软件包

@[toc]

我们写GO语言程序的时候难免会引用第三方的软件包，那么你知道别人是怎么发布自己的软件包吗，别急，这篇博客教你怎么做

## 新建仓库
![新建仓库](https://img-blog.csdnimg.cn/703185db8d9441f78f24a19e7a72d635.png#pic_center)

## 拉取到本地
```sh
git clone https://github.com/zm50/my-package.git
```

## 初始化项目
```sh
go mod init github.com/zm50/my-package.git
```

## 编写代码
```sh
mkdir utils
echo "
package utils

func PrintHello() {
    print("Hello")
}" > utils/hello.go
```

## 提交代码
```sh
git add .
git commit -m "update"
git push
```

## 发布
![发布](https://img-blog.csdnimg.cn/f1f2ee299ddb444085bdebee6ad6c30f.png#pic_center)
![发布](https://img-blog.csdnimg.cn/0422e490b59643ce9204275e2f1220c0.png#pic_center)

## 引用软件包
```sh
go get github.com/zm50/my-package/utils
```
![引用软件包](https://img-blog.csdnimg.cn/3c3d2e524ada48a3b8d8bdfacdf32ade.png#pic_center)


至此，少年你已经发布了第一个属于自己的GO语言开源软件包