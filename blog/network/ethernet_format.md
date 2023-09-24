# 以太网帧的结构

```c
#include <linux/if_ether.h>

struct eth_hdr
{
    unsigned char dmac[6];  //目的mac地址(6字节)
    unsigned char smac[6];  //源mac地址(6字节)
    uint16_t ethertype;     //如果字段的值大于或等于1536,则该字段包含有效载荷的类型(例如IPv4,ARP),如果该值小于该值,则它包含有效载荷的长度
    unsigned char payload[];//数据字段,最小长度必须为46字节以保证帧长至少为64字节,最大长度为1500字节
} __attribute__((packed));
```

以太网帧的后面还跟随一个循环冗余校验字段(FCS)提供错误检测机制,字段长度4字节

就聊这么多, 简单胜于复杂