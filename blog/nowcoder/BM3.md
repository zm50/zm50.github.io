# 牛客: BM3 链表中的节点每k个一组翻转

@[toc]

# 题目描述
![题目描述](https://img-blog.csdnimg.cn/55e4afa688b944c690246c02028c43d9.png#pic_center)

# 题解思路
用一个[]int保存一组节点的val,一个快节点先遍历k个节点将节点的val顺序保存在[]int中,然后慢节点再遍历k个节点,逆序将[]int的val设置给节点的val

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
 * @param head ListNode类 
 * @param k int整型 
 * @return ListNode类
*/
func reverseKGroup( head *ListNode ,  k int ) *ListNode {
    // write code here
    if head == nil || head.Next == nil || k == 1 || k == 0 {
        return head
    }
    vals := make([]int, k)
    pre := head
    post := head
    for pre != nil {
        for i := k - 1; i >= 0; i-- {
            if post == nil {
                return head
            }
            vals[i] = post.Val
            post = post.Next
        }

        for i := 0; i < k; i++ {
            pre.Val = vals[i]
            pre = pre.Next
        }
    }

    return head
}
```
