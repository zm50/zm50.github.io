# Kubernetes设计篇之声明式API

Kubernetes的声明式API是一种用于管理Kubernetes资源的方法，它基于配置文件而不是命令行操作，通过声明式API，用户通过编写资源清单文件定义系统状态，将该清单文件发送到Kubernetes API服务器，Kubernetes将负责根据该清单文件的内容来创建、更新或删除资源

>声明式API优点：
>
>1.简单易用：用户只需编写资源定义文件，而不需要记住复杂的命令和参数。
>
>2.可重复性：每次使用相同的清单文件创建资源时，Kubernetes会确保系统状态与文件中描述的状态一致，避免了手动操作的错误
>
>3.可跟踪性：声明式API允许用户跟踪资源的历史状态和更改，可以轻松地回滚到先前的状态
>
>4.自动化：可以使用工具或脚本自动化资源的创建，更新和删除

使用声明式API时，需要了解和使用Kubernetes资源对象的API规范，例如Deployment，Pod，Service等，清单文件使用yaml格式编写，并包含有关资源的详细信息，例如名称，标签，副本数，容器镜像等

示例清单文件（yaml格式）：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-container
        image: my-image:1.0
        ports:
        - containerPort: 80
```

使用kubectl apply命令行一键申请创建创建资源

```sh
kubectl apply -f deployment.yaml
```

这将发送清单文件中描述的资源定义到Kubernetes API服务器，Kubernetes将创建并维护所需的资源状态，可以使用类似的方法来更新或删除资源


Kubernetes这种通过声明式API来自动化管理资源的方式真的是相当方便