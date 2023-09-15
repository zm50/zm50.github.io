# Kubernetes学习篇之组件

@[toc]

# 前言
今天聊一下Kubernetes集群中有哪些组件,顺便聊聊这些组件各自是干啥的

# 概述
运行容器化应用程序的机器称为节点(Node),工作节点托管Pod,Pod就是应用负载的组件,控制平面(Control Plane)管理集群中的工作节点和Pod

生产环境中,控制平面通常跨多台计算机运行,一个集群通常运行多个节点，提供容错性和高可用性

![组成](https://img-blog.csdnimg.cn/0d98198ad0d74fd09cb818369cf88ffb.png#pic_center)


# 控制平面组件(Control Plane Components)
控制平面组件在集群执行全局决策,例如(资源调度,接受和响应集群事件)

### kube-apiserver
处理请求的工作,采用水平扩缩的设计,可通过部署多个实例来进行扩缩,并在其之间平衡负载

### etcd
一致且高可用的键值存储,Kubernetes所有集群数据的后台数据库

### kube-scheduler
负责监视新创建的未指定运行节点(node)的Pods,并选择节点来让Pod在上面运行,调度决策考虑的因素包括单个Pod及Pods集合的资源需求,软硬件及策略约束,亲和性及反亲和性规范,数据位置,工作负载间的干扰及最后时限

### kube-controller-manager
负责运行控制器进程

从逻辑上讲,每个控制器都是一个单独的进程,但是为了降低复杂性,它们都被编译到同一个可执行文件,并在一个进程中运行

有不同类型的控制器,例如:

>节点控制器(Node Controller):负责节点出现故障后通知和响应

>任务控制器(Job Controller):监测代表一次性任务的Job对象,然后创建 Pods来运行这些任务直至完成

>端点分片控制器(EndpointSlice Controller):填充端点分片(EndpointSlice)对象,以提供Service和Pod之间的链接

>服务账号控制器(ServiceAccount Controller):为新的命名空间创建默认的服务账号(ServiceAccount)

### cloud-controller-manager
仅运行特定于云平台的控制器,允许将集群连接到云提供商的API上,并将与该云平台交互的组件同与你的集群交互的组件分离开来

与kube-controller-manager类似,cloud-controller-manager将若干逻辑上独立的控制回路组合到同一个可执行文件中,在一个进程上运行,可执行水平扩容来提升性能或增强容错能力

下面的控制器依赖于云平台驱动:

>节点控制器(Node Controller):用于在节点终止响应后检查云提供商以确定节点是否已被删除

>路由控制器(Route Controller):用于在底层云基础架构中设置路由

>服务控制器(Service Controller):用于创建、更新和删除云提供商负载均衡器

# Node 组件
负责维护运行的Pod并提供Kubernetes运行环境

### kubelet
在集群中每个节点上运行,保证容器运行在Pod中,接收一组通过各类机制提供给它的PodSpecs,确保这些PodSpecs中描述的容器状态正常,kubelet只管理Kubernetes创建的容器

### kube-proxy
集群中每个节点上运行的网络代理,维护节点上的一些网络规则,允许从集群内部或外部的网络会话与Pod进行网络通信

若操作系统提供了可用的数据包过滤层,则kube-proxy会通过它来实现网络规则,否则kube-proxy只做流量转发

### 容器运行时(Container Runtime)
负责管理Kubernetes环境中容器的执行和生命周期

Kubernetes支持许多容器运行环境,例如containerd,CRI-O以及Kubernetes CRI(容器运行环境接口)的实现

# 插件(Addons)
使用Kubernetes资源(DaemonSet,Deployment等)实现集群功能,这些插件提供集群级别的功能,插件中命名空间域的资源属于kube-system命名空间

下面介绍几种插件

### DNS
集群DNS是一个DNS服务器,和环境中的其他DNS服务器一起工作,Kubernetes启动的容器自动将此DNS服务器包含在其DNS搜索列表中

### Web界面(仪表盘)
Dashboard是Kubernetes集群的Web的用户界面,它使用户可以管理集群中运行的应用程序以及集群本身,并进行故障排除

### 容器资源监控
将关于容器的一些常见的时间序列度量值保存到一个集中的数据库中,并提供浏览这些数据的界面

### 集群层面日志
将容器的日志数据保存到一个集中的日志存储中,这种集中日志存储提供搜索和浏览接口

### 网络插件
实现容器网络接口(CNI)规范,负责为Pod分配IP地址,并使这些Pod能在集群内部相互通信