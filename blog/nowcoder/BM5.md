# 牛客: BM5 合并k个已排序的链表

@[toc]

# 题目描述
![在这里插入图片描述](https://img-blog.csdnimg.cn/d2e79baf2aac47f08d4d61f2d211448a.png#pic_center)

# 题解思路
合并链表数组中的前两条链表,直到链表数组的长度为一, 返回这个唯一的链表

# 题解代码
```go
package main

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
 * @param lists ListNode类一维数组
 * @return ListNode类
 */
func mergeKLists( lists []*ListNode ) *ListNode {
    length := len(lists)
    if length == 0 {return nil}
    if length == 1 {return lists[0]}

    for len(lists) > 1 {
        lists[1] = meger(lists[0], lists[1])
        lists = lists[1:]
    }
    return lists[0]
}

func meger(l1 *ListNode, l2 *ListNode) *ListNode{
    tmp := new(ListNode)
    ans := tmp
    for l1 != nil && l2 != nil {
        if l1.Val > l2.Val {
            tmp.Next = l2
            l2 = l2.Next
            tmp = tmp.Next
        }else{
            tmp.Next = l1
            l1 = l1.Next
            tmp = tmp.Next
        }
    }
    if l2 != nil {
        tmp.Next = l2
    }
    if l1 != nil {
        tmp.Next = l1
    }
    return ans.Next
}
```