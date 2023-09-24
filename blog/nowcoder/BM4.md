# 牛客: BM4 合并两个排序的链表

@[toc]

# 题目描述
![题目描述](https://img-blog.csdnimg.cn/94c5afa068fe42c6a0e4a87909b1dce7.png#pic_center)

# 题解思路
以链表一为主链表,遍历两条链表

若当前链表二的节点val小于当前链表一的下一个节点val,则将链表链表二的该节点连到链表一的节点的下一个,链表一的当前节点往后跳,链表二的节点往后跳

若当前链表二的节点val大于当前链表一的下一个节点val,链表一的节点往后跳

若链表一的节点先遍历完毕,则将链表二接到链表一的后面

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
 * @param pHead1 ListNode类 
 * @param pHead2 ListNode类 
 * @return ListNode类
*/
func Merge( pHead1 *ListNode ,  pHead2 *ListNode ) (head *ListNode) {
    // write code here
    if pHead1 == nil {
        return pHead2
    }
    if pHead2 == nil {
        return pHead1
    }

    if pHead1.Val > pHead2.Val {
        head = pHead2
        pHead2 = pHead2.Next
        head.Next = pHead1
    } else {
        head = pHead1
    }

    for pHead1.Next != nil && pHead2 != nil {
        if pHead1.Next.Val > pHead2.Val {
            tmp := pHead2.Next
            pHead2.Next = pHead1.Next
            pHead1.Next = pHead2
            pHead2 = tmp
        } else {
            pHead1 = pHead1.Next
        }
    }

    if pHead2 != nil {
        pHead1.Next = pHead2
    }

    return head
}
```