@[toc]

# 开发前言
分布式系统具有高可靠性、高性能、可扩展性、灵活性、数据共享、可靠性和地理分布等优点，使得其在各种应用场景下都具有巨大的优势，当然分布式系统实现复杂度要高于单体系统🫠

项目代码使用纯粹的Go语言标准库实现，不借用任何其它第三方库😁

我是醉墨居士，废话不多说，我们现在开始吧🤗

# 分布式模型
- Hub & Spoke模型
- 优点：集中管理，安全性，降低成本
- 缺点：单点故障，延迟，有限的扩展性

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/36562f67d2486c59cb19dcd7174a5f24.png#pic_center)

- Peer to Peer模型
- 优点：去中心化，高度可扩展性，资源共享
- 缺点：管理复杂性，安全性，性能问题

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/82d724c5820084524174166aab8c2e1c.png#pic_center)

- Message Queues模型
- 优点：解耦合，异步处理，可靠性
- 缺点：系统复杂度，准确性，消息顺序

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/231638c36ddb36b07bdade3314dbd5e3.png#pic_center)

我们将要开发的分布式系统将会取其精华，去其糟粕，使用采用上述模型的混合模式😎


# 基础系统图解
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/0458061e7d16d413f15203737fb0492f.png#pic_center)

# 业务系统图解
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/01de3034d7e04f0fe713bc8b19e28fb5.png#pic_center)

# 注册中心模块
- 服务信息
```go
package registry

import (
	"encoding/json"
	"io"
)

type ServiceInfo struct {
	Name             string
	Addr             string
	RequiredServices []string
}

func buildServiceInfo(reader io.ReadCloser) (*ServiceInfo, error) {
	defer reader.Close()

	data, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	serviceInfo := new(ServiceInfo)
	err = json.Unmarshal(data, serviceInfo)
	if err != nil {
		return nil, err
	}

	return serviceInfo, nil
}
```

- 服务信息表
```go
package registry

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"sync"
)

type serviceTable struct {
	serviceInfos map[string][]*ServiceInfo
	lock *sync.RWMutex
}

func newServiceTable() *serviceTable {
	return &serviceTable{
		serviceInfos: make(map[string][]*ServiceInfo),
		lock: new(sync.RWMutex),
	}
}

func (t *serviceTable) parseServiceInfos(reader io.ReadCloser) (err error){
	data, err := io.ReadAll(reader)
	if err != nil {
		return err
	}
	defer func() {
		err = reader.Close()
	}()
	t.lock.Lock()
	defer t.lock.Unlock()
	err = json.Unmarshal(data, &t.serviceInfos)
	return
}

func (t *serviceTable) buildRequiredServiceInfos(service *ServiceInfo) map[string][]*ServiceInfo {
	m := make(map[string][]*ServiceInfo, len(service.RequiredServices))
	t.lock.RLock()
	defer t.lock.RUnlock()
	
	for _, serviceName := range service.RequiredServices {
		m[serviceName] = t.serviceInfos[serviceName]
	}

	return m
}

func (t *serviceTable) add(service *ServiceInfo) {
	t.lock.Lock()
	defer t.lock.Unlock()

	log.Printf("Service table add %s with address %s\n", service.Name, service.Addr)
	t.serviceInfos[service.Name] = append(t.serviceInfos[service.Name], service)
}

func (t *serviceTable) remove(service *ServiceInfo) {
	t.lock.Lock()
	defer t.lock.Unlock()

	log.Printf("Service table remove %s with address %s\n", service.Name, service.Addr)
	services := t.serviceInfos[service.Name]
	for i := len(services) - 1; i >= 0; i-- {
		if services[i].Addr == service.Addr {
			t.serviceInfos[service.Name] = append(services[:i], services[i+1:]...)
		}
	}
}

func (t *serviceTable) get(serviceName string) *ServiceInfo {
	t.lock.RLock()
	defer t.lock.RUnlock()
	services, ok := t.serviceInfos[serviceName]
	if !ok || len(services) < 1 {
		return nil
	}
	idx := rand.Intn(len(services))
	return services[idx]
}

func (t *serviceTable) dump() {
	t.lock.RLock()
	defer t.lock.RUnlock()
	fmt.Println("==========Dump Service Table Start==========")
	for k, v := range t.serviceInfos {
		fmt.Print("Service " + k + ": [ ")
		for i := 0; i < len(v); i++ {
			fmt.Print(v[i].Addr + " ")
		}
		fmt.Println("]")
	}
	fmt.Println("==========Dump Service Table End==========")
}
```

- 注册服务
```go
package registry

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

const (
	serviceAddr = "127.0.0.1:20000"
)

type RegistryService struct {
	serviceInfos            *serviceTable
	heartBeatWorkerNumber   int
	heartBeatAttempCount    int
	heartBeatAttempDuration time.Duration
	heartBeatCheckDuration  time.Duration
}

func Default() *RegistryService {
	return New(3, 3, time.Second, 30*time.Second)
}

func New(heartBeatWorkerNumber, heartBeatAttempCount int, heartBeatAttempDuration, heartBeatCheckDuration time.Duration) *RegistryService {
	return &RegistryService{
		serviceInfos:            newServiceTable(),
		heartBeatWorkerNumber:   heartBeatWorkerNumber,
		heartBeatAttempCount:    heartBeatAttempCount,
		heartBeatAttempDuration: heartBeatAttempDuration,
		heartBeatCheckDuration:  heartBeatCheckDuration,
	}
}

func (s *RegistryService) Run() error {
	go s.heartBeat()

	http.HandleFunc("/services", func(w http.ResponseWriter, r *http.Request) {
		statusCode := http.StatusOK
		switch r.Method {
		case http.MethodPost:
			serviceInfo, err := buildServiceInfo(r.Body)
			if err != nil {
				log.Println("build service info err:", err)
				statusCode = http.StatusInternalServerError
				goto END
			}

			err = s.regist(serviceInfo)
			if err != nil {
				log.Println("regist service err: ", err)
				statusCode = http.StatusInternalServerError
				goto END
			}

			serviceInfos := s.serviceInfos.buildRequiredServiceInfos(serviceInfo)
			data, err := json.Marshal(serviceInfos)
			if err != nil {
				log.Println("marshal srevice infos err: ", err)
				statusCode = http.StatusInternalServerError
				goto END
			}
			defer w.Write(data)


		case http.MethodDelete:
			serviceInfo, err := buildServiceInfo(r.Body)
			if err != nil {
				log.Println("build service info err:", err)
				statusCode = http.StatusInternalServerError
				goto END
			}

			s.unregist(serviceInfo)
			if err != nil {
				log.Println("unregist service err: ", err)
				statusCode = http.StatusInternalServerError
				goto END
			}

		default:
			statusCode = http.StatusMethodNotAllowed
			goto END
		}

	END:
		w.WriteHeader(statusCode)
	})

	return http.ListenAndServe(serviceAddr, nil)
}

func (s *RegistryService) heartBeat() {
	channel := make(chan *ServiceInfo, 1)
	for i := 0; i < s.heartBeatWorkerNumber; i++ {
		go func() {
			for service := range channel {
				for j := 0; j < s.heartBeatAttempCount; j++ {
					resp, err := http.Get("http://" + service.Addr + "/heart-beat")
					if err == nil && resp.StatusCode == http.StatusOK {
						goto NEXT
					}
					time.Sleep(s.heartBeatAttempDuration)
				}

				s.unregist(service)

			NEXT:
			}
		}()
	}

	for {
		s.serviceInfos.lock.RLock()
		for _, serviceInfos := range s.serviceInfos.serviceInfos {
			for i := len(serviceInfos) - 1; i >= 0; i-- {
				channel <- serviceInfos[i]
			}
		}
		s.serviceInfos.lock.RUnlock()
		time.Sleep(s.heartBeatCheckDuration)
	}
}

func (s *RegistryService) regist(service *ServiceInfo) error {
	s.serviceInfos.add(service)
	return s.notify(http.MethodPost, service)
}

func (s *RegistryService) unregist(service *ServiceInfo) error {
	s.serviceInfos.remove(service)
	return s.notify(http.MethodDelete, service)
}

func (s *RegistryService) notify(method string, serviceInfo *ServiceInfo) error {
	if method != http.MethodPost && method != http.MethodDelete {
		return fmt.Errorf("method not allowed with method: %s", method)
	}

	s.serviceInfos.lock.RLock()
	defer s.serviceInfos.lock.RUnlock()

	data, err := json.Marshal(serviceInfo)
	if err != nil {
		return err
	}

	for _, services := range s.serviceInfos.serviceInfos {
		for _, service := range services {
			for _, requiredServiceName := range service.RequiredServices {
				if requiredServiceName == serviceInfo.Name {
					req, err := http.NewRequest(method, "http://" + service.Addr + "/services", bytes.NewReader(data))
					if err != nil {
						log.Println("create http request with url http://" + service.Addr + "/services err:", err)
						continue
					}
					_, err = http.DefaultClient.Do(req)
					if err != nil {
						log.Println("nogify http://" + service.Addr + "/services err:", err)
						continue
					}
					log.Println("update url: ", service.Addr + "/services")
				}
			}
		}
	}

	return nil
}
```

- 客户端接口
```go
package registry

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func registerMonitorHandler() {
	http.HandleFunc("/services", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			service, err := buildServiceInfo(r.Body)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			provider.add(service)
			fmt.Printf("add service %s\n", service.Name)

		case http.MethodDelete:
			service, err := buildServiceInfo(r.Body)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			provider.remove(service)
			fmt.Printf("remove service %s\n", service.Name)

		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	http.HandleFunc("/heart-beat", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

func RegistService(service *ServiceInfo) error {
	registerMonitorHandler()

	data, err := json.Marshal(service)
	if err != nil {
		return err
	}

	resp, err := http.Post("http://"+serviceAddr+"/services", "application/json", bytes.NewReader(data))
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("regist %s error with code %d", service.Name, resp.StatusCode)
	}

	err = provider.parseServiceInfos(resp.Body)
	if err != nil {
		return err
	}

	provider.dump()

	return nil
}

func UnregistService(service *ServiceInfo) error {
	data, err := json.Marshal(service)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodDelete, "http://"+serviceAddr+"/services", bytes.NewReader(data))
	if err != nil {
		return err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unregist %s error with code %d", service.Name, resp.StatusCode)
	}

	return nil
}

var provider = newServiceTable()

func Get(serviceName string) string {
	service := provider.get(serviceName)
	if service != nil {
		return service.Addr
	}
	return ""
}
```

- 服务入口
```go
package main

import (
	"log"
	"services/registry"
)

func main() {
	registryService := registry.Default()
	err := registryService.Run()
	if err != nil {
		log.Fatalln(err)
	}
}
```

# 基础服务模块
```go
package service

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"services/registry"
)

type Service interface {
	Init()
}

func Run(service *registry.ServiceInfo) (err error) {
	err = registry.RegistService(service)
	if err != nil {
		return err
	}
	defer func() {
		err = errors.Join(err, registry.UnregistService(service))
	}()

	srv := http.Server{Addr: service.Addr}

	go func() {
		fmt.Println("Press any key to stop.")
		var s string
		fmt.Scan(&s)
		srv.Shutdown(context.Background())
	}()

	err = srv.ListenAndServe()
	if err != nil {
		return err
	}

	return nil
}
```

# 网关服务模块
- 业务服务
```go
package gatewayservice

import (
	"io"
	"net/http"
	"services/registry"
	"strings"
)

func Init() {
	register()
}

func register() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.SplitN(r.URL.Path, "/", 3)
		if len(parts) < 2 {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		addr := registry.Get(parts[1])
		if addr == "" {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		req, err := http.NewRequest(r.Method, "http://" + addr + r.URL.String(), r.Body)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		for k, v := range resp.Header {
			w.Header()[k] = v
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})
}
```

- 服务入口
```go
package main

import (
	"log"
	"services/gatewayservice"
	"services/registry"
	"services/service"
)

func main() {
	gatewayservice.Init()
	err := service.Run(&registry.ServiceInfo{
		Name: "gateway",
		Addr: "127.0.0.1:20001",
		RequiredServices: []string{"log", "visist"},
	})

	if err != nil {
		log.Fatalln(err)
	}
}
```

# 日志服务模块
- 业务服务
```go
package logservice

import (
	"io"
	"log"
	"net/http"
	"os"
)

type logService struct {
	destination string
	logger *log.Logger
}

func Init(destination string) {
	s := &logService{
		destination: destination,
	}
	s.logger = log.New(s, "Go:", log.Ltime | log.Lshortfile)
	s.register()
}

func (s *logService)Write(data []byte) (int, error) {
	file, err := os.OpenFile(s.destination, os.O_CREATE | os.O_APPEND | os.O_WRONLY, 0600)
	if err != nil {
		return 0, err
	}
	defer file.Close()
	return file.Write(data)
}

func (s *logService)register() {
	http.HandleFunc("/log", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		data, err := io.ReadAll(r.Body)
		if err != nil || len(data) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		s.logger.Println(string(data))
	})
}
```

- 客户端接口
```go
package logservice

import (
	"bytes"
	"errors"
	"fmt"
	"net/http"
	"services/registry"
)

func Println(s string) error {
	serviceAddr := registry.Get("log")
	fmt.Println("service addr: " + serviceAddr)
	if serviceAddr == "" {
		return errors.New("No services are available")	
	}
	resp, err := http.Post("http://"+serviceAddr+"/log", "text/plain", bytes.NewReader([]byte(s)))
	if err != nil {
		return err
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Response Error with code: %d", resp.StatusCode)
	}
	return nil
}
```

- 服务入口
```go
package main

import (
	"log"
	"services/logservice"
	"services/registry"
	"services/service"
)

func main() {
	logservice.Init("./services.log")
	err := service.Run(&registry.ServiceInfo{
		Name:      "log",
		Addr:      "127.0.0.1:20002",
		RequiredServices: make([]string, 0),
	})
	if err != nil {
		log.Fatalln(err)
	}
}
```

# 访问服务模块
- 业务服务
```go
package visistservice

import (
	"log"
	"net/http"
	"services/logservice"
	"strconv"
	"sync/atomic"
)

type visistService struct {
	visistCount atomic.Int32
}

func Init() {
	s := &visistService{
		visistCount: atomic.Int32{},
	}
	s.register()
}

func (s *visistService) register() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		s.visistCount.Add(1)
		count := strconv.Itoa(int(s.visistCount.Load()))
		err := logservice.Println(count)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Printf("Log service println error: %s\n", err)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(count))
	})
}
```

- 服务入口
```go
package main

import (
	"log"
	"services/registry"
	"services/service"
	"services/visistservice"
)

func main() {
	visistservice.Init()
	err := service.Run(&registry.ServiceInfo{
		Name:      "visist",
		Addr:      "127.0.0.1:20003",
		RequiredServices: []string{"log"},
	})
	if err != nil {
		log.Fatalln(err)
	}
}
```
# 运行效果
依次运行注册服务，日志服务，浏览服务
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/c2e1ddf562fdef0b07b567f95d4be8d2.png#pic_center)

运行完毕之后，访问http://127.0.0.1:20003，返回访问量
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/02788569f86a97e4c315996f3e6321ba.png#pic_center)

日志记录对应访问量数据
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/61d93282f8538b317b2c24b849bac70b.png#pic_center)

这里只是用了一个简单的示例，你可以使用这套基础组件，然后让服务变得更加复杂，更加丰富。

# 开发总结
恭喜你，我们一起完成了简易分布式系统的开发，麻雀虽小，五脏俱全😉
希望这个项目能让你有所收获😊
如果有什么错误，请你评论区或者私信我指出，让我们一起进步✌️