@[TOC]

# 前言
你好，我是醉墨居士，最近在开发文件传输相关的项目，然后顺手写了一个多协程文件下载器，代码非常精简，核心代码只有100行左右，适合分享给大家学习使用

# 流程图
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/1e67e7fac44a465280e5d23cbdcf5765.png)

# 主函数
```go
func main() {
	fileURL := flag.String("u", "", "downloade url of the file")
	flag.Parse()

	if *fileURL == "" {
		log.Println("Please input a download url")
		flag.Usage()
		return
	}

	fileDir, err := os.Getwd()
	if err != nil {
		log.Println(err)
		return
	}

	// 下载文件保存路径
	filePath := filepath.Join(fileDir, filepath.Base(*fileURL))

	err = downloadFile(*fileURL, filePath)
	if err != nil {
		log.Println(err)
		return
	}

	log.Println("download file success:", filePath)
}
```

# 下载文件
```go
// 下载文件
func downloadFile(fileURL string, filePath string) error {
	log.Println("downloading file:", fileURL, "to", filePath)

	taskCh := make(chan [2]int64, runtime.NumCPU())
	wg := new(sync.WaitGroup)

	// 创建执行下载任务的 worker
	err := initWorker(fileURL, filePath, taskCh, wg)
	if err != nil {
		return fmt.Errorf("init worker failed: %v", err)
	}

	// 分发下载任务
	err = dispatchTask(fileURL, taskCh)
	if err != nil {
		return fmt.Errorf("dispacth task failed: %v", err)
	}

	// 等待所有下载任务完成
	wg.Wait()

	return nil
}
```

# 初始化分片下载worker
```go
// 初始化 下载 worker
func initWorker(url string, filePath string, taskCh chan [2]int64, wg *sync.WaitGroup) error {
	for i := 0; i < runtime.NumCPU(); i++ {
		// 打开文件句柄
		file, err := os.OpenFile(filePath, os.O_CREATE|os.O_RDWR, 0644)
		if err != nil {
			return err
		}

		wg.Add(1)
		go func(file *os.File, taskCh chan [2]int64) {
			defer wg.Done()
			defer file.Close()

			// 循环从 taskCh 中获取下载任务并下载
			for part := range taskCh {
				log.Printf("downloading part, start offset: %d, end offset: %d", part[0], part[1])

				// 重试下载，最大重试次数为 10 次，每次下载失败后等待 1 秒
				err := retryWithWaitTime(10, func() error {
					return downloadPart(url, file, part[0], part[1])
				}, time.Second)
				if err != nil {
					log.Printf("download part %d failed: %v", part, err)
				}
			}
		}(file, taskCh)
	}

	return nil
}
```

# 分发下载任务
```go
// 分发下载任务
func dispatchTask(url string, taskCh chan [2]int64) error {
	defer close(taskCh)

	fileSize, err := getFileSize(url)
	if err != nil {
		return err
	}
	

	// 分片大小 1MB
	const chunkSize = 1024 * 1024

	parts := fileSize / chunkSize

	log.Println("file size:", fileSize, "parts:", parts, "chunk size:", chunkSize)

	for i := int64(0); i < parts; i++ {
		// 计算分片的起始和结束位置
		startOffset := i * chunkSize
		endOffset := startOffset + chunkSize - 1

		// 发送下载任务
		taskCh <- [2]int64{startOffset, endOffset}
	}

	// 发送最后一个分片的下载任务
	if fileSize % chunkSize != 0 {
		taskCh <- [2]int64{parts * chunkSize, fileSize - 1}
	}

	return nil
}
```

# 获取下载文件的大小
```go
// 获取文件大小
func getFileSize(url string) (int64, error) {
	resp, err := http.Head(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	return resp.ContentLength, nil
}
```

# 下载文件分片
```go
// 下载文件分片
func downloadPart(url string, file *os.File, startPos, endPos int64) error {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	// 设置文件分片区间的请求头
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", startPos, endPos))
	resp, err := http.DefaultTransport.RoundTrip(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// 如果服务器返回的状态码不是 206 Partial Content，则说明下载失败
	if resp.StatusCode != http.StatusPartialContent {
		data, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		log.Println("unexpected data:", string(data))
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// 文件指针移动到分片的起始位置
	_, err = file.Seek(startPos, 0)
	if err != nil {
		return err
	}

	// 写入分片数据到文件
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return err
	}

	return nil
}
```

# 错误重试
```go
// 重试函数
func retryWithWaitTime(retryCount int, fn func() error, waitTime time.Duration) error {
	var err error
	for i := 0; i < retryCount; i++ {
		e := fn()
		if e != nil {
			errors.Join(err, e)
			time.Sleep(waitTime)
			continue
		}

		return nil
	}

	return err
}
```

# 项目演示
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/57d6a8a74813494295170c4ddb9b1d99.png)
![在这里插入图片描述](https://i-blog.csdnimg.cn/direct/f4c45150d44f4c4ca51d8b6d33468ca2.png)

# 最后
我是醉墨居士，如果这个项目对你有所帮助，希望你能多多支持，我们下期再见