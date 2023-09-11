# Debian安装Docker环境

@[toc]

### 删除旧版本
```sh
sudo apt-get remove docker docker-engine docker.io
```

### 更新系统
```sh
apt update
apt upgrade -y
```

### 安装Docker
```sh
apt install curl vim wget gnupg dpkg apt-transport-https lsb-release ca-certificates
```

### 设置Docker的GPG公钥
```sh
curl -sSL https://download.docker.com/linux/debian/gpg | gpg --dearmor > /usr/share/keyrings/docker-ce.gpg
```

### 为Docker设置清华源
```sh
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-ce.gpg] https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian $(lsb_release -sc) stable" > /etc/apt/sources.list.d/docker.list
```

### 安装Docker
```sh
apt update
apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 配置Docker
```sh
# 查看Docker版本
docker version

# 启动docker
sudo systemctl start docker

# 检测docker状态
systemctl status docker
 
# 设置docker开机自启动
sudo systemctl enable docker
```

### 配置普通用户权限
```sh
# 添加docker组
sudo groupadd docker
 
# 添加用户至docker组
sudo usermod -aG docker $USER
 
# 更新docker组
newgrp docker
```