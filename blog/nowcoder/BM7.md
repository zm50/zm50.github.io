# 牛客: BM7 链表中环的入口结点

@[toc]

# 题目描述
![题目描述](https://img-blog.csdnimg.cn/780573a8b4314ad882e8eee2b4905463.png#pic_center)

# 题解思路
用一个哈希表存储链表节点,遍历链表,将节点加入哈希表,如果该节点在哈希表中出现过,意味着该节点是入口节点

# 题解代码
```go
package main

func EntryNodeOfLoop(pHead *ListNode) *ListNode{
    m := make(map[*ListNode]struct{})
    for pHead != nil {
        if _, ok := m[pHead]; ok {
            return pHead   
        }
        m[pHead] = struct{}{}
        pHead = pHead.Next
    }
    return nil
}
```