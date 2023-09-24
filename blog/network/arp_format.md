# 计算机网络篇之ARP包结构

@[toc]

# ARP包格式
```c
struct arp_hdr
{
    uint16_t hwtype; 		//数据链路层的类型,若是以太网,值是0x0001
    uint16_t protype; 		//通信协议类型,若是ipv4,值是0x0800
    unsigned char hwsize;	//硬件字段大小(单位字节),若是mac地址就是6
    unsigned char prosize;	//协议字段大小(单位字节),若是ip地址就是4
    uint16_t opcode;		//ARP消息的类型,ARP请求是1,ARP回复是2,RARP请求是3,RARP回复是4
    unsigned char data[];	//ARP协议的数据负载
} __attribute__((packed));
```

# ARP包里面的数据负载格式
若是ipv4, ARP协议的数据负载就是这个结构
```c
struct arp_ipv4
{
    unsigned char smac[6];//发送方的6字节mac地址
    uint32_t sip;		  //发送方的4字节ip地址
    unsigned char dmac[6];//接受方的6字节mac地址
    uint32_t dip;		  //接受方的4字节ip地址
} __attribute__((packed));
```

ok, 简单胜于复杂, 就聊这么多