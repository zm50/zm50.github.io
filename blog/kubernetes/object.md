# Kubernetes学习篇之对象

@[toc]

## 前言
对象是k8s系统中持久化的实体，k8s中用这些实体表示系统的状态，该博客是从k8s官网消化吸收后总结提炼的

## 期望状态
k8s的对象是你期望k8s达到的状态，k8s会逐渐的向你期望的方向逼近

## 对象规约(spec)
k8s对象基本都有spec字段，spec描述你的期望状态

## 对象状态(status)
k8s对象基本都有status字段，status描述当前对象的状态

## 描述对象
通过spec和和一些对象的基本信息（如名称）来描述k8s对象

## 创建对象
创建对象可以直接使用Kubernetes API创建对象，可以使用kubectl将编写好的yaml文件的资源清单发送给Kubernetes API创建，所以最终真正创建对象的是Kubernetes API

yaml示例文件： application/deployment.yaml
```yaml
apiVersion: apps/v1 # 创建该对象的Kubernetes API的版本
kind: Deployment # 创建的对象的类别
metadata: # 唯一标识对象的一些数据，包括name、UID和可选的namespace
  name: nginx-deployment
spec: # 资源规格，该对象的期望状态
  selector:
    matchLabels:
      app: nginx
  replicas: 2 # 以该模板创建2个Pod示例
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers: # 容器
      - name: nginx
        image: nginx:1.14.2 # 使用nginx的1.14.2版本的容器镜像
        ports:
        - containerPort: 80 # 容器使用80端口
```
执行kubectl apply命令，该命令会让kubectl将yaml文件的资源清单发送给Kubernetes API，Kubernetes API拿到数据后创建对象

```sh
kubectl apply -f https://k8s.io/examples/application/deployment.yaml
```

## 字段验证
API服务器提供了服务器端字段验证，检测对象使用错误的字段

kubectl --validate标志来设置字段验证级别，接受ignore，warn，strict。还接受值true（等于strict）和false（等于ignore）。kubectl 的默认验证设置为--validate=true

>Strict：严格的字段验证，验证失败时会报错
>
>Warn：执行字段验证，但错误会以警告形式提供而不是拒绝请求
>
>Ignore：不执行服务器端字段验证

当kubectl无法连接到支持字段验证的API服务器时，它将回退为客户端验证