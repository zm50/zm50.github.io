# 牛客: BM6 判断链表中是否有环

@[toc]

# 题目描述
![题目描述](https://img-blog.csdnimg.cn/87cd72d4dca74b9ca76e2373290bf146.png#pic_center)

# 题解思路
一个慢指针,每次跳一次,一个快指针,每次跳两次,如果快指针遍历到链表终点,则链表无环,若慢指针和快指针相遇,则链表有环

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
 * 
 * @param head ListNode类 
 * @return bool布尔型
*/
func hasCycle( head *ListNode ) bool {
    // write code here
    fast, slow := head, head
    for fast != nil && fast.Next != nil {
        // 快指针跳两次
        fast = fast.Next.Next
        // 慢指针跳一次
        slow = slow.Next
        // 如果快指针和慢指针到了一个位置,证明有环
        if fast == slow {
            return true
        }
    }
    // 快指针将链表顺序遍历完毕,证明无环
    return false
}
```