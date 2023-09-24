# 牛客: BM8 链表中倒数最后k个结点

@[toc]

# 题目描述
![题目描述](https://img-blog.csdnimg.cn/4144cbc09b2540e7b666ab7d20aacd68.png#pic_center)

# 题解思路
快指针比慢指针先走k个位置,链表链表,快指针和慢指针同时往下跳,知道快指针遍历完毕,此时的慢指针就是倒数的第k个节点

# 题解代码
```go
package main

import . "nc_tools"
/*
 * type ListNode struct{
 *   Val int
 *   Next *ListNode
 * }
 */

/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 * 
 * @param pHead ListNode类 
 * @param k int整型 
 * @return ListNode类
*/
func FindKthToTail( pHead *ListNode ,  k int ) *ListNode {
    // write code here
    if k == 0 {
        return nil
    }
    fast := pHead
    for k > 0 {
        if fast == nil {
            return nil
        }
        fast=fast.Next
        k--
    }
    for fast!=nil {
        fast, pHead = fast.Next, pHead.Next
    }
    return pHead
}
```