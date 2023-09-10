# GO语言篇之WebAssembly

WebAssembly是一种高效的二进制编码方式，可以在现代浏览器中以接近原生的性能运行

GO语言支持WebAssembly（简称Wasm）编译目标，通过使用GO语言编写Wasm，将GO程序转化为可以在现代浏览器中运行的Web应用程序

0. 我使用的编辑器是vscode，需要在项目的根目录下新建.vscode/settings.json

.vscode/settings.json
```json
{
    "go.toolsEnvVars": {
        "GOARCH": "wasm",
        "GOOS": "js"
    },
    "go.testEnvVars": {
        "GOARCH": "wasm",
        "GOOS": "js"
    },
    "go.installDependenciesWhenBuilding": false
}
```

1. 编写GO代码
```go
package main

import "syscall/js"

func main() {
    //获取全局对象
    global:=js.Global()
    //获取alert函数
    alert:=global.Get("alert")
    //调用alert函数
    alert.Invoke("Hello WebAssembly")
}
```

2. 编译成wasm
```sh
GOOS=js GOARCH=wasm go build -o go.wasm
```

3. 拷贝js胶水文件
```sh
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```

4. 编写html文件
```html
<html>
    <script src="wasm_exec.js"></script>
    <script>
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("go.wasm"), go.importObject).then((result) => go.run(result.instance));
    </script>
</html>
```

5. 启动web服务
```sh
# 安装全局的serve
npm i -g serve
# 启动web服务加载当前页面
serve
```

6. 浏览器访问http://localhost:3000，不出意外，此时你的浏览器已经弹出Hello WebAssembly的提示了

总体来说，GO语言编写WebAssembly还是比较简单的