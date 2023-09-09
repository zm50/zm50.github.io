# Kubernetes学习篇之数据加密

>大家好，今天聊一下kubernetes中数据加密的方式

>加密数据在日常开发中使用的非常广泛，kubernetes中Projected Volume提供了Secret这种机制来保存我们的加密数据

>举个常见的例子，在数据库mysql中我们的用户信息，账号和密码这些数据需要加密处理，而kubernetes中给我提供了一种方式，来实现这个功能

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret-projected-volume
spec:
  containers:
  - name: secret-secret-volume
    image: busybox
    volumeMounts:
    - name: mysql-cred
      mountPath: "/projected-volume"
      readOnly: true
  volumes:
  - name: mysql-cred
    projected:
      sources:
      - secret:
          name: username
      - secret:
          name: password
```

>在这个pod的yaml文件中，我们定义了一个容器，并挂载了projected类型的Volume，由username对象和passward对象提供mysql用户名和mysql密码

>执行命令
```shell
#username对象绑定mysql用户名
kubectl create secret generic username --from-file=./mysql_username.txt
#password对象绑定mysql密码
kubectl create secret generic password --from-file=./mysql_password.txt
#查看secret对象
kubectl get secrets
```

>我们还可以通过直接编写yaml文件来生成Secret对象

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  username: cm9vdA==
  password: MTIzNA==
```

>我们通过k-v这种方式定义了username，password和它们对应的数据，而它们对应的数据是需要我们将原始数据通过base64编码后的加密数据