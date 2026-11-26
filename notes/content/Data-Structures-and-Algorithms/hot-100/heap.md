---
title: Hot 100：堆
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 215. 数组中的第 K 个最大元素

给定整数数组 `nums` 和整数 `k`，返回数组排序后的第 `k` 个最大元素。这里按元素的位置计数，不是第 `k` 个不同的值。

[题目链接](https://leetcode.cn/problems/kth-largest-element-in-an-array/)

### 示例

#### 示例 1

- 输入：`nums = [3,2,1,5,6,4], k = 2`
- 输出：`5`

#### 示例 2

- 输入：`nums = [3,2,3,1,2,4,5,5,6], k = 4`
- 输出：`4`

### 数据范围

- $1 \leq k \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：维护大小为 k 的小根堆

小根堆保存目前见过的最大 `k` 个元素，堆顶是这 `k` 个元素中最小的一个：

1. 元素入堆；
2. 堆大小超过 `k` 时弹出堆顶，删除当前候选中最小的元素；
3. 扫描结束后，堆中正好是整个数组最大的 `k` 个元素，堆顶就是第 `k` 大。

重复值必须分别入堆。例如 `[5,5,4]` 的第 `2` 大仍然是 `5`。

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> largest;
        for (int value : nums) {
            largest.push(value);
            if (largest.size() > static_cast<size_t>(k)) {
                largest.pop();
            }
        }
        return largest.top();
    }
};
```

处理完任意前缀后，堆中保存该前缀最大的至多 `k` 个元素。加入新元素再删除其中最小者后，这一性质继续成立。因此处理完整个数组后，堆顶就是全局第 `k` 大元素。

- 时间复杂度：$O(n\log k)$
- 空间复杂度：$O(k)$

这是通用 Top K 解法，但不满足当前题面要求的线性时间；需要满足该要求时使用下面的快速选择。

### 方法二：快速选择

第 `k` 大元素在升序数组中的目标下标是 `n-k`。快速选择进行一次类似快速排序的划分，但只继续处理目标下标所在的一侧，不必把整个数组排好序。

下面直接使用项目算法模板中的双指针划分：划分结束后，`[left,j]` 不大于基准，`[i,right]` 不小于基准；目标落在哪一侧，就只缩小到该侧继续处理。目标位于中间的基准值区域时，可以直接返回。

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        int target = nums.size() - k;
        int left = 0;
        int right = nums.size() - 1;

        while (left <= right) {
            int pivot = nums[left + (right - left) / 2];
            int i = left;
            int j = right;

            while (i <= j) {
                while (nums[i] < pivot) i++;
                while (nums[j] > pivot) j--;
                if (i <= j) swap(nums[i++], nums[j--]);
            }

            if (target <= j) right = j;
            else if (target >= i) left = i;
            else return nums[target];
        }

        return nums[target];
    }
};
```

每次划分后，目标下标之外的另一侧无需再排序。算法最终把目标位置收缩到已经确定的划分区域，`nums[n-k]` 就是第 `k` 大元素。

- 平均时间复杂度：$O(n)$
- 最坏时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

若要求严格保证线性最坏复杂度，需要使用中位数的中位数选择基准；工程和竞赛中通常使用随机基准或上述快速选择。

### 易错点

- 第 `k` 大不是第 `k` 个不同元素，不能先去重。
- C++ 的 `priority_queue<int>` 默认是大根堆；固定保存最大的 `k` 个元素需要小根堆。
- 升序下标是 `n-k`，不是 `k-1`。
- 快速选择会修改原数组；若后续仍需原顺序，应先复制数组。

</details>

### 参考

- [项目快速选择模板](/notes/algorithm-templates/)
- [项目现有堆笔记](../tree-basics.md#heap-%E5%A0%86)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/kth-largest-element-in-an-array/solutions/)

## 347. 前 K 个高频元素

给定整数数组 `nums` 和整数 `k`，返回出现频率最高的 `k` 个元素，答案顺序不限。题目保证前 `k` 高频元素的集合唯一。

[题目链接](https://leetcode.cn/problems/top-k-frequent-elements/)

### 示例

#### 示例 1

- 输入：`nums = [1,1,1,2,2,3], k = 2`
- 输出：`[1,2]`

#### 示例 2

- 输入：`nums = [1], k = 1`
- 输出：`[1]`

#### 示例 3

- 输入：`nums = [1,2,1,2,1,2,3,1,3,2], k = 2`
- 输出：`[1,2]`

### 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$
- $1 \leq k \leq$ 不同元素的数量
- 前 `k` 高频元素的集合唯一

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：哈希计数与小根堆

先用哈希表统计每个值的出现次数，再用大小为 `k` 的小根堆保存当前频率最高的 `k` 个元素。堆中存放 `(frequency,value)`，频率最低的候选位于堆顶；候选超过 `k` 个时弹出堆顶。

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> frequency;
        for (int value : nums) {
            frequency[value]++;
        }

        using Entry = pair<int, int>;
        priority_queue<Entry, vector<Entry>, greater<Entry>> top;
        for (auto [value, count] : frequency) {
            top.push({count, value});
            if (top.size() > static_cast<size_t>(k)) {
                top.pop();
            }
        }

        vector<int> answer;
        while (!top.empty()) {
            answer.push_back(top.top().second);
            top.pop();
        }
        return answer;
    }
};
```

处理完任意若干种元素后，堆中保存其中频率最高的至多 `k` 种。全部处理后，堆里正是全局前 `k` 高频元素。

- 时间复杂度：$O(n+u\log k)$，$u$ 为不同元素数量
- 空间复杂度：$O(u+k)$

### 方法二：按频率分桶

任一元素的频率都在 $[1,n]$ 内。建立 `n+1` 个桶，令 `buckets[f]` 保存所有出现 `f` 次的元素，再从最高频率向下取满 `k` 个元素。

这种方法不对不同元素排序，能够达到线性时间。

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> frequency;
        for (int value : nums) {
            frequency[value]++;
        }

        int n = nums.size();
        vector<vector<int>> buckets(n + 1);
        for (auto [value, count] : frequency) {
            buckets[count].push_back(value);
        }

        vector<int> answer;
        for (int count = n; count > 0; count--) {
            for (int value : buckets[count]) {
                answer.push_back(value);
                if (answer.size() == static_cast<size_t>(k)) {
                    return answer;
                }
            }
        }
        return answer;
    }
};
```

从频率 `n` 向下扫描保证先取到的元素频率不低于后取到的元素。题目保证答案集合唯一，因此取满 `k` 个时得到的就是唯一的前 `k` 高频集合。

- 时间复杂度：$O(n+u)$
- 空间复杂度：$O(n+u)$

### 易错点

- 堆的比较关键字是频率，不是元素值。
- 固定保留前 `k` 名要使用小根堆，便于淘汰候选中频率最低的元素。
- 返回顺序不限，不需要再对答案排序。
- 桶数组长度应为 `n+1`，因为某个元素最多可能出现 `n` 次。

</details>

### 参考

- [项目现有堆笔记](../tree-basics.md#heap-%E5%A0%86)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/top-k-frequent-elements/solutions/)

## 295. 数据流的中位数

中位数是有序整数序列的中间值：元素数量为奇数时取正中间的元素；为偶数时取中间两个元素的平均值。

设计 `MedianFinder`，支持向数据流加入整数，并随时返回当前所有元素的中位数。

[题目链接](https://leetcode.cn/problems/find-median-from-data-stream/)

### 示例

- 输入：

  ```text
  ["MedianFinder","addNum","addNum","findMedian","addNum","findMedian"]
  [[],[1],[2],[],[3],[]]
  ```

- 输出：

  ```text
  [null,null,null,1.50000,null,2.00000]
  ```

- 解释：加入 `1、2` 后中位数为 $(1+2)/2=1.5$；再加入 `3` 后中位数为 `2`

### 数据范围

- $-10^5 \leq num \leq 10^5$
- 调用 `findMedian` 前至少已经加入一个元素
- `addNum` 和 `findMedian` 最多共调用 $5\times 10^4$ 次

<details class="note-solution">
<summary>查看解析</summary>

### 用两个堆划分数据

把数据分成前后两半：

- `lower` 是大根堆，保存较小的一半，堆顶是前半部分最大值；
- `upper` 是小根堆，保存较大的一半，堆顶是后半部分最小值。

始终维护两个不变量：

1. `lower` 中所有元素都不大于 `upper` 中所有元素；
2. `lower.size()` 等于 `upper.size()`，或比它多一个元素。

加入新数时，先放入 `lower`，再把 `lower` 的最大值移动到 `upper`。这一步保证两边的大小关系。若 `upper` 元素更多，再把它的最小值移回 `lower`，恢复数量平衡。

```cpp
class MedianFinder {
    priority_queue<int> lower;
    priority_queue<int, vector<int>, greater<int>> upper;

public:
    MedianFinder() = default;

    void addNum(int num) {
        lower.push(num);
        upper.push(lower.top());
        lower.pop();

        if (lower.size() < upper.size()) {
            lower.push(upper.top());
            upper.pop();
        }
    }

    double findMedian() {
        if (lower.size() > upper.size()) {
            return lower.top();
        }
        return (lower.top() + upper.top()) / 2.0;
    }
};
```

由于两堆之间有序且大小相差不超过一，元素总数为奇数时多出的中间元素一定是 `lower.top()`；总数为偶数时，中间两个元素分别是 `lower.top()` 和 `upper.top()`。

- `addNum` 时间复杂度：$O(\log n)$
- `findMedian` 时间复杂度：$O(1)$
- 空间复杂度：$O(n)$

### 插入过程示例

依次加入 `5、2、8、3`：

| 操作后 | `lower` 保存的值 | `upper` 保存的值 | 中位数 |
| --- | --- | --- | --- |
| 加入 `5` | `{5}` | `{}` | `5` |
| 加入 `2` | `{2}` | `{5}` | `3.5` |
| 加入 `8` | `{5,2}` | `{8}` | `5` |
| 加入 `3` | `{3,2}` | `{5,8}` | `4` |

表中只展示两个堆各自包含的值，不表示堆底层数组的排列顺序。

### 易错点

- `lower` 必须是大根堆，`upper` 必须是小根堆，才能在 $O(1)$ 时间取得中间边界。
- 平衡后让 `lower` 数量不少于 `upper`，奇数情况才能统一读取 `lower.top()`。
- 不能每次查询时再排序全部数据，否则连续调用的总成本过高。
- 本题值域保证两个堆顶相加不会溢出 `int`；若值域扩展到完整 32 位整数，应先转换为 `long long` 或 `double`。

</details>

### 参考

- [项目现有堆笔记](../tree-basics.md#heap-%E5%A0%86)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-median-from-data-stream/solutions/)
