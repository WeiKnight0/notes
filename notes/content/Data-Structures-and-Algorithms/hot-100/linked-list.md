---
title: Hot 100：链表
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 160. 相交链表

给定两个无环单链表的头节点 `headA` 和 `headB`，返回它们开始相交的节点；若不相交则返回 `nullptr`。相交按节点地址判断，不是节点值相等。

[题目链接](https://leetcode.cn/problems/intersection-of-two-linked-lists/)

### 示例

#### 示例 1

- 输入：`listA = [4,1,8,4,5]`，`listB = [5,6,1,8,4,5]`
- 相交位置：`listA` 下标 `2`、`listB` 下标 `3` 指向同一个值为 `8` 的节点
- 输出：相交节点 `8`

#### 示例 2

- 输入：`listA = [1,9,1,2,4]`，`listB = [3,2,4]`
- 相交位置：`listA` 下标 `3`、`listB` 下标 `1` 指向同一个值为 `2` 的节点
- 输出：相交节点 `2`

#### 示例 3

- 输入：`listA = [2,6,4]`，`listB = [1,5]`
- 输出：`nullptr`

### 相交的含义

单链表节点只有一个后继。两个链表一旦共享某个节点，此后的所有节点也必然相同，整体呈 Y 形。即使两个节点的值相等，只要地址不同，就不算相交。

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：记录第一个链表的节点

把 `headA` 经过的节点地址加入哈希集合，再遍历 `headB`，第一个已在集合中的节点就是相交起点。

```cpp
class Solution {
public:
    ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {
        unordered_set<ListNode*> visited;
        for (ListNode* node = headA; node; node = node->next) {
            visited.insert(node);
        }
        for (ListNode* node = headB; node; node = node->next) {
            if (visited.count(node)) {
                return node;
            }
        }
        return nullptr;
    }
};
```

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(m)$

### 方法二：交换起点

两个指针分别从 `headA`、`headB` 出发。走到链表末尾后，改从另一条链表的头部继续：

```text
a 经过的路径：A 的独有部分 → 公共部分 → B 的独有部分 → 公共部分
b 经过的路径：B 的独有部分 → 公共部分 → A 的独有部分 → 公共部分
```

两条路径总长度相同。若链表相交，两个指针会在相交起点同时到达；若不相交，最终会同时成为 `nullptr`。

```cpp
class Solution {
public:
    ListNode* getIntersectionNode(ListNode* headA, ListNode* headB) {
        ListNode* a = headA;
        ListNode* b = headB;
        while (a != b) {
            a = a ? a->next : headB;
            b = b ? b->next : headA;
        }
        return a;
    }
};
```

设两条链表的独有部分长度分别为 $a$、$b$，公共部分长度为 $c$。两个指针到相交点前都走了 $a+b+c$ 步，只是先后经过的独有部分顺序不同，所以会同时到达相交点。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

### 易错点

- 必须比较节点指针，不能比较 `node->val`。
- 指针走到 `nullptr` 时应切换到另一条链表的头节点，而不是自己的头节点。
- 不相交时两个指针会同时为 `nullptr`，循环能够正常结束，无须额外计数。
- 题目要求保持链表结构不变，不能通过断链或拼接来判定。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/intersection-of-two-linked-lists/solutions/)

## 206. 反转链表

给定单链表头节点 `head`，反转链表并返回新的头节点。

[题目链接](https://leetcode.cn/problems/reverse-linked-list/)

### 示例

#### 示例 1

- 输入：`head = [1,2,3,4,5]`
- 输出：`[5,4,3,2,1]`

#### 示例 2

- 输入：`head = [1,2]`
- 输出：`[2,1]`

#### 示例 3

- 输入：`head = []`
- 输出：`[]`

### 数据范围

- 链表节点数为 $[0,5000]$
- $-5000 \leq Node.val \leq 5000$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：迭代

维护两个部分：`prev` 是已经反转部分的头节点，`head` 是尚未处理部分的头节点。修改 `head->next` 前必须先保存原后继，否则会丢失未处理链表。

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }
};
```

每轮结束后，原链表前若干个节点已经被完整反转并由 `prev` 指向，`head` 仍指向剩余链表。处理结束时剩余部分为空，`prev` 就是新头节点。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法二：递归

先递归反转 `head->next` 开始的链表。递归返回后，原后继 `head->next` 已成为反转链表的尾节点，把它的 `next` 指回 `head`，再断开 `head` 原来的正向连接。

```cpp
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* newHead = reverseList(head->next);
        head->next->next = head;
        head->next = nullptr;
        return newHead;
    }
};
```

例如 `1 → 2 → 3`：递归先得到 `3 → 2`，此时执行 `2->next = 1` 并断开 `1->next`，最终得到 `3 → 2 → 1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，来自递归调用栈

### 易错点

- 迭代时要在改写 `next` 前保存原后继。
- 递归回溯时必须令 `head->next = nullptr`，否则原来的前两节点会形成环。
- 空链表和单节点链表直接返回原头节点。
- 返回的是反转后的新头节点，不是原来的 `head`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/reverse-linked-list/solutions/)

## 234. 回文链表

给定单链表头节点 `head`，判断从头到尾的节点值序列是否为回文。

[题目链接](https://leetcode.cn/problems/palindrome-linked-list/)

### 示例

#### 示例 1

- 输入：`head = [1,2,2,1]`
- 输出：`true`

#### 示例 2

- 输入：`head = [1,2]`
- 输出：`false`

### 数据范围

- 链表节点数为 $[1,10^5]$
- $0 \leq Node.val \leq 9$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：复制到数组

链表不能向前访问。把节点值复制到数组后，使用首尾双指针比较。

```cpp
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        vector<int> values;
        for (ListNode* node = head; node; node = node->next) {
            values.push_back(node->val);
        }
        for (int left = 0, right = values.size() - 1; left < right; left++, right--) {
            if (values[left] != values[right]) {
                return false;
            }
        }
        return true;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

### 方法二：反转后半段

使用快慢指针寻找前半段末尾：`slow` 每次走一步，`fast` 每次走两步。当 `fast` 无法再走两步时，`slow` 位于前半段最后一个节点。

反转 `slow->next` 开始的后半段，再从链表头和反转后的头部同时向后比较。奇数长度链表的中间节点无需参与比较。

```cpp
class Solution {
    ListNode* reverse(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) {
            ListNode* next = head->next;
            head->next = prev;
            prev = head;
            head = next;
        }
        return prev;
    }

public:
    bool isPalindrome(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast->next && fast->next->next) {
            slow = slow->next;
            fast = fast->next->next;
        }

        ListNode* second = reverse(slow->next);
        ListNode* right = second;
        ListNode* left = head;
        bool answer = true;
        while (right) {
            if (left->val != right->val) {
                answer = false;
                break;
            }
            left = left->next;
            right = right->next;
        }
        slow->next = reverse(second);
        return answer;
    }
};
```

比较完成后再次反转后半段，将链表恢复为输入时的结构。题目没有强制恢复，但调用者通常不会预期一个判定函数永久修改输入链表。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 正确性

快慢指针把链表分成长度相同的左右两部分；奇数长度时忽略正中间节点。后半段反转后，其访问顺序正好对应原链表从尾到中间的顺序。逐项比较前半段与反转后的后半段，全部相等当且仅当原值序列回文。

### 易错点

- 奇数长度链表的中间节点不影响回文性。
- 寻找前半段末尾时循环条件需要同时检查 `fast->next` 和 `fast->next->next`。
- 反转后半段会修改链表；若需要保持输入结构，应在返回前恢复。
- 比较次数由后半段长度决定，不能要求两个遍历指针同时为空。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/palindrome-linked-list/solutions/)

## 141. 环形链表

给定单链表头节点 `head`，判断链表中是否存在环。若沿 `next` 指针不断前进能够再次到达已经访问过的节点，则链表有环。评测参数 `pos` 表示尾节点连接到的下标，不会传入函数。

[题目链接](https://leetcode.cn/problems/linked-list-cycle/)

### 示例

#### 示例 1

- 输入：`head = [3,2,0,-4], pos = 1`
- 输出：`true`
- 解释：尾节点连接到下标 `1` 的节点。

#### 示例 2

- 输入：`head = [1,2], pos = 0`
- 输出：`true`

#### 示例 3

- 输入：`head = [1], pos = -1`
- 输出：`false`

### 数据范围

- 链表节点数为 $[0,10^4]$
- $-10^5 \leq Node.val \leq 10^5$
- `pos` 为 `-1` 或链表中的合法下标

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：记录访问过的节点

遍历链表并保存节点地址。若再次遇到相同地址，说明存在环；若到达 `nullptr`，说明无环。

```cpp
class Solution {
public:
    bool hasCycle(ListNode* head) {
        unordered_set<ListNode*> visited;
        while (head) {
            if (visited.count(head)) {
                return true;
            }
            visited.insert(head);
            head = head->next;
        }
        return false;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

### 方法二：Floyd 快慢指针

`slow` 每轮走一步，`fast` 每轮走两步：

- 无环时，`fast` 会先到达链表末尾；
- 有环时，两个指针进入环后，`fast` 每轮相对 `slow` 前进一步，最终一定相遇。

```cpp
class Solution {
public:
    bool hasCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow == fast) {
                return true;
            }
        }
        return false;
    }
};
```

环长有限。两个指针都进入环后，它们的环内距离每轮减少一，因此至多再经过一个环长就会相遇。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- 判断的是节点地址是否重复，不是节点值是否重复。
- `fast` 每次访问 `fast->next->next`，循环条件必须先保证 `fast` 和 `fast->next` 存在。
- `pos` 仅用于描述测试数据，不是函数参数。
- 不应通过修改节点或断链来留下访问标记。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/linked-list-cycle/solutions/)

## 142. 环形链表 II

给定单链表头节点 `head`。若链表有环，返回开始入环的第一个节点；否则返回 `nullptr`。不能修改链表。

[题目链接](https://leetcode.cn/problems/linked-list-cycle-ii/)

### 示例

#### 示例 1

- 输入：`head = [3,2,0,-4], pos = 1`
- 输出：下标 `1` 的节点
- 解释：尾节点连接到第二个节点，环入口的值为 `2`。

#### 示例 2

- 输入：`head = [1,2], pos = 0`
- 输出：下标 `0` 的节点

#### 示例 3

- 输入：`head = [1], pos = -1`
- 输出：`nullptr`

### 数据范围

- 链表节点数为 $[0,10^4]$
- $-10^5 \leq Node.val \leq 10^5$
- `pos` 为 `-1` 或链表中的合法下标

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：哈希集合

第一个被再次访问的节点就是环入口。

```cpp
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        unordered_set<ListNode*> visited;
        while (head) {
            if (visited.count(head)) {
                return head;
            }
            visited.insert(head);
            head = head->next;
        }
        return nullptr;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

### 方法二：Floyd 判环并定位入口

第一阶段用快慢指针找到环内相遇点。相遇后，把一个指针放回链表头；两个指针改为每次各走一步，再次相遇的位置就是环入口。

```cpp
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {
        ListNode* slow = head;
        ListNode* fast = head;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
            if (slow != fast) {
                continue;
            }

            ListNode* fromHead = head;
            while (fromHead != slow) {
                fromHead = fromHead->next;
                slow = slow->next;
            }
            return fromHead;
        }
        return nullptr;
    }
};
```

### 为什么第二次相遇是入口

设头节点到环入口的距离为 $a$，入口到第一次相遇点的距离为 $b$，环长为 $c$。第一次相遇时：

- 慢指针走过 $a+b$；
- 快指针走过慢指针的两倍，并比慢指针多走若干整圈。

因此存在正整数 $k$，满足：

$$
2(a+b)=a+b+kc
$$

整理得：

$$
a=(k-1)c+(c-b)
$$

从相遇点继续走到入口需要 $c-b$ 步；再多走整圈仍回到入口。因此，从头节点走 $a$ 步与从相遇点走 $a$ 步会同时到达环入口。

### 复杂度

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- 第一次相遇点通常不是环入口。
- 第二阶段两个指针都必须每次走一步。
- 无环时快指针会到达 `nullptr`，应直接返回 `nullptr`。
- `pos` 不会传入函数，不能依赖它寻找入口。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/linked-list-cycle-ii/solutions/)

## 21. 合并两个有序链表

给定两个按非递减顺序排列的链表 `list1` 和 `list2`，将它们的节点重新连接成一条非递减链表，并返回新链表的头节点。

[题目链接](https://leetcode.cn/problems/merge-two-sorted-lists/)

### 示例

#### 示例 1

- 输入：`list1 = [1,2,4], list2 = [1,3,4]`
- 输出：`[1,1,2,3,4,4]`

#### 示例 2

- 输入：`list1 = [], list2 = []`
- 输出：`[]`

#### 示例 3

- 输入：`list1 = [], list2 = [0]`
- 输出：`[0]`

### 数据范围

- 两条链表的节点数均为 $[0,50]$
- $-100 \leq Node.val \leq 100$
- 两条链表均按非递减顺序排列

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：迭代合并

使用虚拟头节点统一处理结果链表的第一个节点，`tail` 始终指向结果链尾。比较两条链表的当前节点，把较小者接到 `tail` 后面并移动对应指针。

当一条链表耗尽后，另一条链表本身已经有序，可直接整体接到结果末尾。

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                tail->next = list1;
                list1 = list1->next;
            } else {
                tail->next = list2;
                list2 = list2->next;
            }
            tail = tail->next;
        }
        tail->next = list1 ? list1 : list2;
        return dummy.next;
    }
};
```

每次选择两个当前节点中的较小者，它不大于两条链表中任何尚未处理的节点，因此一定是结果链表的下一个节点。重复选择直到一条链表为空，得到完整有序链表。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

### 方法二：递归合并

若两个头节点都存在，较小的头节点一定是合并结果的头节点；它的后继是“剩余部分与另一条链表”的合并结果。

```cpp
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        if (!list1) {
            return list2;
        }
        if (!list2) {
            return list1;
        }
        if (list1->val <= list2->val) {
            list1->next = mergeTwoLists(list1->next, list2);
            return list1;
        }
        list2->next = mergeTwoLists(list1, list2->next);
        return list2;
    }
};
```

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(m+n)$，最坏情况下递归深度等于节点总数

### 易错点

- 虚拟头节点只用于简化接链，返回值是 `dummy.next`。
- 每次接入节点后，既要移动来源链表的指针，也要移动 `tail`。
- 剩余链表可以直接接入，不需要逐节点复制。
- 合并的是原节点，不需要创建一套值相同的新节点。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-two-sorted-lists/solutions/)

## 2. 两数相加

两个非空链表分别表示两个非负整数，数字按逆序存放，每个节点保存一位数字。将两数相加，返回同样按逆序保存结果的链表。除数字 `0` 外，输入不会以多余的零结尾。

[题目链接](https://leetcode.cn/problems/add-two-numbers/)

### 示例

#### 示例 1

- 输入：`l1 = [2,4,3], l2 = [5,6,4]`
- 输出：`[7,0,8]`
- 解释：两条链表分别表示 `342` 和 `465`，相加得到 `807`。

#### 示例 2

- 输入：`l1 = [0], l2 = [0]`
- 输出：`[0]`

#### 示例 3

- 输入：`l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]`
- 输出：`[8,9,9,9,0,0,0,1]`

### 数据范围

- 每条链表的节点数为 $[1,100]$
- $0 \leq Node.val \leq 9$
- 每条链表都按最低位到最高位的顺序存储数字

<details class="note-solution">
<summary>查看解析</summary>

### 逐位相加

链表头保存个位，遍历方向正好与手算加法从低位到高位的顺序一致。每一位计算：

$$
sum=x+y+carry
$$

当前结果位为 `sum % 10`，下一位进位为 `sum / 10`。两条链表长度可以不同，缺少的位按 `0` 处理；最后若仍有进位，还要增加一个节点。

```cpp
class Solution {
public:
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        int carry = 0;

        while (l1 || l2 || carry) {
            int sum = carry;
            if (l1) {
                sum += l1->val;
                l1 = l1->next;
            }
            if (l2) {
                sum += l2->val;
                l2 = l2->next;
            }
            tail->next = new ListNode(sum % 10);
            tail = tail->next;
            carry = sum / 10;
        }
        return dummy.next;
    }
};
```

### 过程示例

对于 `[2,4,3] + [5,6,4]`：

| 位 | 计算 | 结果位 | 新进位 |
| --- | --- | --- | --- |
| 个位 | $2+5+0=7$ | `7` | `0` |
| 十位 | $4+6+0=10$ | `0` | `1` |
| 百位 | $3+4+1=8$ | `8` | `0` |

得到逆序链表 `[7,0,8]`。

### 正确性

处理第 $i$ 个节点时，算法使用两个整数的第 $i$ 位和上一位产生的进位，按照十进制加法规则确定结果第 $i$ 位与下一位进位。因此每轮结束后，结果链表已经正确表示所有处理过的低位。两条输入与最终进位全部耗尽时，所有数位均已计算。

### 复杂度

- 时间复杂度：$O(\max(m,n))$
- 空间复杂度：$O(1)$，不计算返回结果所占空间

### 易错点

- 输入按逆序存储，链表头是个位而不是最高位。
- 两条链表长度可能不同，循环条件不能写成 `l1 && l2`。
- 两条链表都结束后仍可能有进位，例如 `5 + 5 = 10`。
- 结果节点需要新建，不能直接改写某条输入链表并假设它一定足够长。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/add-two-numbers/solutions/)

## 19. 删除链表的倒数第 N 个结点

给定单链表头节点 `head` 和整数 `n`，删除链表的倒数第 `n` 个节点，返回删除后的头节点。

[题目链接](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/)

### 示例

#### 示例 1

- 输入：`head = [1,2,3,4,5], n = 2`
- 输出：`[1,2,3,5]`

#### 示例 2

- 输入：`head = [1], n = 1`
- 输出：`[]`

#### 示例 3

- 输入：`head = [1,2], n = 1`
- 输出：`[1]`

### 数据范围

- 链表节点数为 $sz$
- $1 \leq sz \leq 30$
- $0 \leq Node.val \leq 100$
- $1 \leq n \leq sz$

<details class="note-solution">
<summary>查看解析</summary>

### 为什么使用虚拟头节点

删除节点需要修改其前驱的 `next`。若删除的是原头节点，它没有前驱。令 `dummy.next = head` 后，原头节点也有统一的前驱 `dummy`，无需单独判断。

### 方法一：计算链表长度

先得到链表长度 `length`。倒数第 `n` 个节点是正数第 `length - n + 1` 个节点，其前驱距离虚拟头节点 `length - n` 步。

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        int length = 0;
        for (ListNode* node = head; node; node = node->next) {
            length++;
        }

        ListNode dummy(0);
        dummy.next = head;
        ListNode* prev = &dummy;
        for (int i = 0; i < length - n; i++) {
            prev = prev->next;
        }
        prev->next = prev->next->next;
        return dummy.next;
    }
};
```

- 时间复杂度：$O(L)$
- 空间复杂度：$O(1)$

虽然有两次遍历，但总步数不超过 $2L$，仍是线性时间。

### 方法二：前后指针

先让 `fast` 从头节点向前走 `n` 步，再令 `slow` 从虚拟头节点出发。之后两个指针同步前进。当 `fast` 到达链表末尾时，二者间始终相隔 `n` 个节点，`slow` 正好位于待删除节点的前驱。

```cpp
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* slow = &dummy;
        ListNode* fast = head;
        for (int i = 0; i < n; i++) {
            fast = fast->next;
        }
        while (fast) {
            slow = slow->next;
            fast = fast->next;
        }
        slow->next = slow->next->next;
        return dummy.next;
    }
};
```

- 时间复杂度：$O(L)$
- 空间复杂度：$O(1)$

### 易错点

- 需要找到待删除节点的前驱，而不是待删除节点本身。
- 删除头节点时也应返回 `dummy.next`，不能始终返回原 `head`。
- 题目保证 `n` 合法，不需要在内部重复校验链表是否足够长。
- 前后指针的初始位置与领先步数必须配套；本写法是 `fast = head` 先走 `n` 步，`slow = dummy`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/solutions/)

## 24. 两两交换链表中的节点

给定单链表，每两个相邻节点交换一次，返回交换后的头节点。不能只交换节点中的值，必须改变节点连接关系。

[题目链接](https://leetcode.cn/problems/swap-nodes-in-pairs/)

### 示例

#### 示例 1

- 输入：`head = [1,2,3,4]`
- 输出：`[2,1,4,3]`

#### 示例 2

- 输入：`head = []`
- 输出：`[]`

#### 示例 3

- 输入：`head = [1]`
- 输出：`[1]`

#### 示例 4

- 输入：`head = [1,2,3]`
- 输出：`[2,1,3]`

### 数据范围

- 链表节点数为 $[0,100]$
- $0 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：迭代交换

`prev` 指向当前一对节点的前驱，`first` 和 `second` 是待交换节点。原连接：

```text
prev → first → second → next
```

改为：

```text
prev → second → first → next
```

随后 `first` 成为这一对的尾节点，也是下一对的前驱。

```cpp
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* prev = &dummy;

        while (prev->next && prev->next->next) {
            ListNode* first = prev->next;
            ListNode* second = first->next;
            first->next = second->next;
            second->next = first;
            prev->next = second;
            prev = first;
        }
        return dummy.next;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法二：递归交换

若当前不足两个节点，保持原样。否则先保存第二个节点，递归处理第三个节点开始的剩余链表，再把前两个节点交换。

```cpp
class Solution {
public:
    ListNode* swapPairs(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* second = head->next;
        head->next = swapPairs(second->next);
        second->next = head;
        return second;
    }
};
```

递归返回的链表已经完成后续所有交换。把当前两个节点交换并接在它前面后，整个当前链表也完成交换。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，来自递归调用栈

### 易错点

- 题目禁止只交换 `val`，必须交换节点。
- 改写连接前要保存这一对之后的链表，避免断链。
- 节点数为奇数时，最后一个节点保持不变。
- 每轮后 `prev` 应移动到交换后的第二个位置，即原来的 `first`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/swap-nodes-in-pairs/solutions/)

## 25. K 个一组翻转链表

给定单链表头节点 `head` 和正整数 `k`，每 `k` 个节点分为一组并翻转组内节点。若最后剩余节点不足 `k` 个，保持原顺序。不能只修改节点值。

[题目链接](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

### 示例

#### 示例 1

- 输入：`head = [1,2,3,4,5], k = 2`
- 输出：`[2,1,4,3,5]`

#### 示例 2

- 输入：`head = [1,2,3,4,5], k = 3`
- 输出：`[3,2,1,4,5]`

### 数据范围

- 链表节点数为 $n$
- $1 \leq k \leq n \leq 5000$
- $0 \leq Node.val \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

### 一组翻转前后的连接

设 `groupPrev` 是当前组前驱，`groupEnd` 是第 `k` 个节点，`groupNext` 是下一组的头节点：

```text
groupPrev → 1 → 2 → 3 → groupNext
```

当 `k = 3` 时，翻转后为：

```text
groupPrev → 3 → 2 → 1 → groupNext
```

原组首节点 `1` 会变成组尾，并成为下一组的 `groupPrev`。

### 方法一：迭代

每组执行三个阶段：

1. 从 `groupPrev` 向后走 `k` 步找到 `groupEnd`；若不存在，说明剩余节点不足一组，直接结束；
2. 以 `groupNext` 作为反转时 `prev` 的初值，翻转 `[groupPrev->next, groupNext)`；
3. 把前驱接到原组尾，并把 `groupPrev` 移到原组首。

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        ListNode dummy(0);
        dummy.next = head;
        ListNode* groupPrev = &dummy;

        while (true) {
            ListNode* groupEnd = groupPrev;
            for (int i = 0; i < k && groupEnd; i++) {
                groupEnd = groupEnd->next;
            }
            if (!groupEnd) {
                break;
            }

            ListNode* groupNext = groupEnd->next;
            ListNode* current = groupPrev->next;
            ListNode* prev = groupNext;
            while (current != groupNext) {
                ListNode* next = current->next;
                current->next = prev;
                prev = current;
                current = next;
            }

            ListNode* oldFirst = groupPrev->next;
            groupPrev->next = groupEnd;
            groupPrev = oldFirst;
        }
        return dummy.next;
    }
};
```

把 `prev` 初始化为 `groupNext` 后，原组首节点在反转时会直接连接下一组，无须结束后再次补链。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法二：递归

先确认从 `head` 开始至少存在 `k` 个节点。若不足一组，直接返回 `head`。否则反转这一组，并令原组首节点连接递归处理后的下一组。

```cpp
class Solution {
public:
    ListNode* reverseKGroup(ListNode* head, int k) {
        if (!head) {
            return nullptr;
        }
        ListNode* groupEnd = head;
        for (int i = 1; i < k; i++) {
            if (!groupEnd->next) {
                return head;
            }
            groupEnd = groupEnd->next;
        }

        ListNode* groupNext = groupEnd->next;
        ListNode* current = head;
        ListNode* prev = groupNext;
        while (current != groupNext) {
            ListNode* next = current->next;
            current->next = prev;
            prev = current;
            current = next;
        }
        head->next = reverseKGroup(groupNext, k);
        return groupEnd;
    }
};
```

本组反转后 `groupEnd` 成为组首，原来的 `head` 成为组尾。递归返回的是下一段处理后的头节点，把它接到 `head->next` 即可。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n/k)$，来自每组一次的递归调用

### 正确性

算法只在确认存在完整 `k` 个节点后翻转，因此最后不足一组的节点不会被修改。局部反转使当前组顺序完全颠倒，同时首尾分别连接上一组和下一组；随后对剩余链表执行相同操作。所有完整分组都被翻转一次且连接关系完整，结果符合要求。

### 易错点

- 必须先确认一整组存在，再开始修改指针；边翻转边计数会使不足 `k` 个的末尾难以恢复。
- 局部反转的终点是 `groupNext`，不应继续进入下一组。
- 翻转后原组首成为组尾，下一轮的前驱应更新为它。
- `k = 1` 时每组只有一个节点，两种写法仍应正常结束。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/reverse-nodes-in-k-group/solutions/)

## 138. 随机链表的复制

链表节点除 `next` 外还有 `random` 指针，它可以指向链表中的任意节点或 `nullptr`。构造链表的深拷贝：复制链表的节点值和连接关系与原链表一致，但所有节点均为新节点，任何指针都不能指回原链表。

[题目链接](https://leetcode.cn/problems/copy-list-with-random-pointer/)

### 输入表示

示例用 `[val, random_index]` 描述节点，其中 `random_index` 是随机指针指向的节点下标，`null` 表示空指针。

#### 示例 1

- 输入：`head = [[7,null],[13,0],[11,4],[10,2],[1,0]]`
- 输出：`[[7,null],[13,0],[11,4],[10,2],[1,0]]`

#### 示例 2

- 输入：`head = [[1,1],[2,1]]`
- 输出：`[[1,1],[2,1]]`

#### 示例 3

- 输入：`head = [[3,null],[3,0],[3,null]]`
- 输出：`[[3,null],[3,0],[3,null]]`

输出表示相同不代表复用原节点；评测会检查复制节点与原节点的地址不同。

### 数据范围

- 链表节点数为 $[0,1000]$
- $-10^4 \leq Node.val \leq 10^4$
- `random` 为 `nullptr` 或指向链表中的某个节点

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：哈希表映射

建立映射 `copies[原节点] = 复制节点`：

1. 第一次遍历为每个原节点创建复制节点；
2. 第二次遍历通过映射设置复制节点的 `next` 和 `random`。

必须先创建完所有节点，因为某个 `random` 可以指向尚未遍历到的节点。

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        unordered_map<Node*, Node*> copies;
        for (Node* node = head; node; node = node->next) {
            copies[node] = new Node(node->val);
        }
        for (Node* node = head; node; node = node->next) {
            copies[node]->next = node->next ? copies[node->next] : nullptr;
            copies[node]->random = node->random ? copies[node->random] : nullptr;
        }
        return head ? copies[head] : nullptr;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$，不计算返回链表

### 方法二：复制节点穿插在原节点后

若复制节点紧跟在对应原节点之后，则原节点 `node` 的复制节点就是 `node->next`，原随机目标 `node->random` 的复制节点就是 `node->random->next`。这样可以用链表位置关系代替哈希映射。

#### 第一步：穿插复制节点

```text
A → B → C
A → A' → B → B' → C → C'
```

#### 第二步：设置随机指针

若 `A.random = C`，则 `A'.random = C'`，也就是：

即 `node->next->random = node->random->next`。

#### 第三步：拆分两条链表

恢复原链表的 `next`，并把所有复制节点连接成新链表。

```cpp
class Solution {
public:
    Node* copyRandomList(Node* head) {
        if (!head) {
            return nullptr;
        }

        for (Node* node = head; node;) {
            Node* copy = new Node(node->val);
            copy->next = node->next;
            node->next = copy;
            node = copy->next;
        }
        for (Node* node = head; node; node = node->next->next) {
            if (node->random) {
                node->next->random = node->random->next;
            }
        }

        Node* copiedHead = head->next;
        for (Node* node = head; node;) {
            Node* copy = node->next;
            node->next = copy->next;
            copy->next = copy->next ? copy->next->next : nullptr;
            node = node->next;
        }
        return copiedHead;
    }
};
```

拆分后原链表恢复原状。每个复制节点的 `next` 和 `random` 都只指向复制节点，满足深拷贝要求。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，不计算新链表节点

### 易错点

- 深拷贝不能让新链表的 `next` 或 `random` 指向原节点。
- 节点值可能重复，不能用 `val` 作为原节点到复制节点的映射键。
- 穿插法设置 `random` 时，目标复制节点是 `node->random->next`。
- 拆分时要同时恢复原链表并连接复制链表，不能只取出奇数位置的节点。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/copy-list-with-random-pointer/solutions/)

## 148. 排序链表

给定单链表头节点 `head`，将链表按节点值升序排列并返回。要求时间复杂度为 $O(n\log n)$；进阶要求额外空间复杂度为 $O(1)$。

[题目链接](https://leetcode.cn/problems/sort-list/)

### 示例

#### 示例 1

- 输入：`head = [4,2,1,3]`
- 输出：`[1,2,3,4]`

#### 示例 2

- 输入：`head = [-1,5,3,4,0]`
- 输出：`[-1,0,3,4,5]`

#### 示例 3

- 输入：`head = []`
- 输出：`[]`

### 数据范围

- 链表节点数为 $[0,5\times10^4]$
- $-10^5 \leq Node.val \leq 10^5$

<details class="note-solution">
<summary>查看解析</summary>

### 为什么选择归并排序

链表不能按下标随机访问，不适合依赖中间下标与交换的数组排序。归并排序只需要顺序扫描：

1. 把链表分成两半；
2. 分别排序；
3. 线性合并两条有序链表。

每层合并处理全部 $n$ 个节点，共有 $O(\log n)$ 层。

### 方法一：自顶向下归并

快慢指针找到中点前一个节点，断开为两条链表。递归排序后再合并。

```cpp
class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) {
                tail->next = a;
                a = a->next;
            } else {
                tail->next = b;
                b = b->next;
            }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }

public:
    ListNode* sortList(ListNode* head) {
        if (!head || !head->next) {
            return head;
        }
        ListNode* slow = head;
        ListNode* fast = head->next;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        ListNode* right = slow->next;
        slow->next = nullptr;
        return merge(sortList(head), sortList(right));
    }
};
```

`fast` 从 `head->next` 开始，使偶数个节点时 `slow` 停在左半部分末尾。断开 `slow->next` 很重要，否则递归处理左半部分时链表长度不会缩小。

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(\log n)$，来自递归调用栈

### 方法二：自底向上归并

要达到 $O(1)$ 额外空间，可以消除递归。依次合并长度为 `1、2、4、8...` 的相邻有序段：

```text
长度 1： [4] [2] [1] [3]
长度 2： [2,4] [1,3]
长度 4： [1,2,3,4]
```

`split(head, size)` 从 `head` 截取最多 `size` 个节点，断开后返回下一段的头节点。

```cpp
class Solution {
    ListNode* split(ListNode* head, int size) {
        if (!head) {
            return nullptr;
        }
        for (int i = 1; i < size && head->next; i++) {
            head = head->next;
        }
        ListNode* next = head->next;
        head->next = nullptr;
        return next;
    }

    pair<ListNode*, ListNode*> merge(ListNode* a, ListNode* b) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) {
                tail->next = a;
                a = a->next;
            } else {
                tail->next = b;
                b = b->next;
            }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        while (tail->next) {
            tail = tail->next;
        }
        return {dummy.next, tail};
    }

public:
    ListNode* sortList(ListNode* head) {
        int length = 0;
        for (ListNode* node = head; node; node = node->next) {
            length++;
        }

        ListNode dummy(0);
        dummy.next = head;
        for (int size = 1; size < length; size *= 2) {
            ListNode* tail = &dummy;
            ListNode* current = dummy.next;
            while (current) {
                ListNode* left = current;
                ListNode* right = split(left, size);
                current = split(right, size);
                auto [mergedHead, mergedTail] = merge(left, right);
                tail->next = mergedHead;
                tail = mergedTail;
            }
        }
        return dummy.next;
    }
};
```

每轮开始时，链表由若干条长度不超过 `size` 的有序段组成；两两合并后得到长度不超过 `2 * size` 的有序段。`size` 达到链表长度时，整条链表有序。

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(1)$

### 易错点

- 自顶向下写法必须在递归前断开左右链表。
- 快慢指针的初始位置要保证长度为 `2` 时也能正确分开。
- 自底向上时最后一段可能不足 `size`，`split` 需要允许提前到达链尾。
- 每次合并后必须让 `tail` 指向合并结果的尾节点，下一对链表才能接在正确位置。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/sort-list/solutions/)

## 23. 合并 K 个升序链表

给定包含 `k` 条升序链表的数组 `lists`，将所有节点合并成一条升序链表并返回。

[题目链接](https://leetcode.cn/problems/merge-k-sorted-lists/)

### 示例

#### 示例 1

- 输入：`lists = [[1,4,5],[1,3,4],[2,6]]`
- 输出：`[1,1,2,3,4,4,5,6]`

三条输入链表为：

```text
1 → 4 → 5
1 → 3 → 4
2 → 6
```

#### 示例 2

- 输入：`lists = []`
- 输出：`[]`

#### 示例 3

- 输入：`lists = [[]]`
- 输出：`[]`

### 数据范围

- $k=lists.length$
- $0 \leq k \leq 10^4$
- 每条链表的节点数为 $[0,500]$
- $-10^4 \leq Node.val \leq 10^4$
- 所有链表的节点总数不超过 $10^4$

设所有链表的节点总数为 $N$。

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：小根堆

任意时刻，合并结果的下一个节点一定是各条链表当前头节点中的最小者。把所有非空链表的头节点放入小根堆：

1. 取出最小节点并接到结果末尾；
2. 若该节点还有后继，将后继加入堆；
3. 重复直到堆为空。

```cpp
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto greater = [](ListNode* a, ListNode* b) {
            return a->val > b->val;
        };
        priority_queue<ListNode*, vector<ListNode*>, decltype(greater)> heap(greater);
        for (ListNode* head : lists) {
            if (head) {
                heap.push(head);
            }
        }

        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (!heap.empty()) {
            ListNode* node = heap.top();
            heap.pop();
            tail->next = node;
            tail = node;
            if (node->next) {
                heap.push(node->next);
            }
        }
        return dummy.next;
    }
};
```

堆中每条链表最多保留一个候选节点，所以堆大小不超过 `k`。

- 时间复杂度：$O(N\log k)$
- 空间复杂度：$O(k)$

### 方法二：两两归并

复用“合并两个有序链表”的方法，按归并排序的方式成对合并：

```text
第 1 轮：0 与 1 合并，2 与 3 合并……
第 2 轮：0 与 2 合并，4 与 6 合并……
第 3 轮：0 与 4 合并……
```

每轮步长翻倍，经过 $\lceil\log_2 k\rceil$ 轮后只剩一条链表。

```cpp
class Solution {
    ListNode* merge(ListNode* a, ListNode* b) {
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (a && b) {
            if (a->val <= b->val) {
                tail->next = a;
                a = a->next;
            } else {
                tail->next = b;
                b = b->next;
            }
            tail = tail->next;
        }
        tail->next = a ? a : b;
        return dummy.next;
    }

public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        for (int step = 1; step < lists.size(); step *= 2) {
            for (int i = 0; i + step < lists.size(); i += step * 2) {
                lists[i] = merge(lists[i], lists[i + step]);
            }
        }
        return lists.empty() ? nullptr : lists[0];
    }
};
```

每一轮所有节点至多参与一次合并，共有 $O(\log k)$ 轮。

- 时间复杂度：$O(N\log k)$
- 空间复杂度：$O(1)$

### 易错点

- 堆中应保存节点指针；弹出节点后只加入它的直接后继。
- `priority_queue` 默认是大根堆，比较函数需要让较小值具有更高优先级。
- 两两归并不能每次都把结果与下一条链表顺序合并，否则在链表长度接近时可能退化为 $O(Nk)$。
- `lists` 可能为空，不能直接返回 `lists[0]`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-k-sorted-lists/solutions/)

## 146. LRU 缓存

设计最近最少使用缓存 `LRUCache`：

- `LRUCache(capacity)`：使用正整数容量初始化缓存；
- `get(key)`：键存在时返回对应值，并把它标记为最近使用；否则返回 `-1`；
- `put(key, value)`：更新或插入键值，并把它标记为最近使用；插入后超过容量时，删除最久未使用的键。

`get` 和 `put` 都必须达到平均 $O(1)$ 时间复杂度。

[题目链接](https://leetcode.cn/problems/lru-cache/)

### 示例

- 输入：`["LRUCache","put","put","get","put","get","put","get","get","get"]`
- 参数：`[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]`
- 输出：`[null,null,null,1,null,-1,null,-1,3,4]`

执行过程：

| 操作 | 从最近到最久的缓存顺序 | 返回值 |
| --- | --- | --- |
| `put(1,1)` | `1` | — |
| `put(2,2)` | `2, 1` | — |
| `get(1)` | `1, 2` | `1` |
| `put(3,3)` | `3, 1`，淘汰 `2` | — |
| `get(2)` | `3, 1` | `-1` |
| `put(4,4)` | `4, 3`，淘汰 `1` | — |
| `get(1)` | `4, 3` | `-1` |
| `get(3)` | `3, 4` | `3` |
| `get(4)` | `4, 3` | `4` |

### 数据范围

- $1 \leq capacity \leq 3000$
- $0 \leq key \leq 10^4$
- $0 \leq value \leq 10^5$
- `get` 与 `put` 最多调用 $2\times10^5$ 次

<details class="note-solution">
<summary>查看解析</summary>

### 为什么需要两种数据结构

哈希表可以在平均 $O(1)$ 时间内按键找到元素，但不能维护最近使用顺序。双向链表可以在已知节点位置时以 $O(1)$ 完成移动和删除，但不能按键快速定位。

组合二者：

- 双向链表从头到尾按“最近使用 → 最久未使用”排列；
- 哈希表保存 `key → 链表迭代器`；
- 访问元素时，用 `list::splice` 把已有节点移动到链表头；
- 超出容量时，链表尾就是要淘汰的元素。

```cpp
class LRUCache {
    int capacity;
    list<pair<int, int>> items;
    unordered_map<int, list<pair<int, int>>::iterator> positions;

    void touch(list<pair<int, int>>::iterator node) {
        items.splice(items.begin(), items, node);
    }

public:
    LRUCache(int capacity) : capacity(capacity) {}

    int get(int key) {
        auto found = positions.find(key);
        if (found == positions.end()) {
            return -1;
        }
        touch(found->second);
        return found->second->second;
    }

    void put(int key, int value) {
        auto found = positions.find(key);
        if (found != positions.end()) {
            found->second->second = value;
            touch(found->second);
            return;
        }

        items.emplace_front(key, value);
        positions[key] = items.begin();
        if (items.size() <= capacity) {
            return;
        }
        positions.erase(items.back().first);
        items.pop_back();
    }
};
```

`list::splice` 只重新连接链表节点，不复制元素，而且不会使该节点的迭代器失效，所以哈希表中的迭代器仍然有效。

### 正确性

链表头始终是最近一次被 `get` 或 `put` 成功访问的键，因为每次成功访问都会把对应节点移动到头部。未被访问的节点相对顺序不变，因此链表尾始终是最久未使用的键。插入导致超出容量时删除尾节点，恰好符合 LRU 淘汰规则。哈希表与链表在每次插入和删除时同步更新，所以按键查找结果始终与缓存内容一致。

### 复杂度

- `get`：平均时间复杂度 $O(1)$
- `put`：平均时间复杂度 $O(1)$
- 空间复杂度：$O(capacity)$

### 易错点

- `get` 成功也算一次使用，必须更新顺序。
- 更新已有键的值后也要把它移到最近使用位置。
- 淘汰节点时要同时从链表和哈希表中删除。
- 仅使用 `deque` 无法在已知键时以 $O(1)$ 删除中间元素；应使用 `list`。

</details>

### 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/lru-cache/solutions/)
