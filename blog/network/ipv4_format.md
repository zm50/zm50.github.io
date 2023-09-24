# 计算机网络篇之IPV4数据报格式

```c
struct iphdr {
    uint8_t version : 4;		//4位版本字段表示Internet标头的格式,ipv4值是4
    uint8_t ihl : 4;			//4位因特网报头长度,ip报头中32位字的数量
    uint8_t tos;				//服务类型字段,该字段传达IP数据报的服务质量,源于第一个IP规范,在以后的规范中,它被划分为较小的字段,为了简单起见,我们按照原始规范中的定义该字段
    uint16_t len;				//总长度字段,len传达整个ip数据报的长度
    uint16_t id;				//数据报索引,用于重新组装分段的IP数据报,字段的值是一个计数器,由发送方递增,接收方对接受的片段进行排序
    uint16_t flags : 3;			//标志字段,定义数据报的各种控制标志,比如指定是否允许对数据报进行分段,是最后一个分段还是有更多的分段传入
    uint16_t frag_offset : 13;	//片段偏移字段,指示片段在数据报中的位置,比如第一个数据报将该索引设置为0
    uint8_t ttl;				//生存时间,通常由原始发送器设置为64,每个接收器将该计数器递减一,当它达到零时,数据报将被丢弃,并且可能会回复ICMP消息以指示错误
    uint8_t proto;				//上层协议类型,比如UDP是16,TCP是6
    uint16_t csum;				//标头校验用于验证ip标头的完整性
    uint32_t saddr;				//源地址,32位的ipv4地址
    uint32_t daddr;				//目的地址,32的ipv4地址
} __attribute__((packed));
```

csum校验和字段用于检查IP数据报的完整性,原始IP
规范的定义: 校验和字段是报头中所有16位字的补码和的16位1的补码,为了计算校验和,校验和字段的值为零

实际代码
```c
uint16_t checksum(void *addr, int count)
{
    /* Compute Internet Checksum for "count" bytes
     *         beginning at location "addr".
     * Taken from https://tools.ietf.org/html/rfc1071
     */

    register uint32_t sum = 0;
    uint16_t * ptr = addr;

    while( count > 1 )  {
        // 每两位一组,计算和
        sum += * ptr++;
        count -= 2;
    }

    // 如果有剩余字段,累加
    if( count > 0 )
        sum += * (uint8_t *) ptr;

    /*  Fold 32-bit sum to 16 bits */
    // 将其转换为补码, 进位比特添加到前16比特
    while (sum>>16)
        sum = (sum & 0xffff) + (sum >> 16);


    return ~sum;
}
```

以IP标头45 00 00 54 41 e0 40 00 40 01 00 00 0a 00 04 0a 00 00 05为例：

>将这些字段加在一起得到二者的补码和01 1b 3e

>然后，为了将其转换为补码，将进位位添加到前16位：1b 3e+01=1b 3f

>最后, 取和的1的补码, 得到校验和值e4c0

>IP标头变为45 00 00 54 41 e0 40 00 40 01 (e4 c0) 0a 00 04 0a 00 00 05

>校验和可以通过再次应用算法进行验证, 如果结果为0, 则数据可能无误

简单胜于复杂, 就聊这么多