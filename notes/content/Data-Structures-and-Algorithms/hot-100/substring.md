---
title: Hot 100：子串
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 560. 和为 K 的子数组

给定整数数组 `nums` 和整数 `k`，统计和等于 `k` 的连续非空子数组个数。

[题目链接](https://leetcode.cn/problems/subarray-sum-equals-k/)

### 示例

#### 示例 1

- 输入：`nums = [1,1,1], k = 2`
- 输出：`2`

#### 示例 2

- 输入：`nums = [1,2,3], k = 3`
- 输出：`2`
- 解释：满足条件的子数组是 `[1,2]` 和 `[3]`。

### 数据范围

- $1 \leq nums.length \leq 2\times 10^4$
- $-1000 \leq nums[i] \leq 1000$
- $-10^7 \leq k \leq 10^7$

<details class="note-solution">
<summary>查看解析</summary>

### 前缀和关系

令 $prefix[i]$ 表示前 $i$ 个元素的和，且 $prefix[0]=0$。下标区间 `[left, right]` 的和为：

$$
prefix[right+1]-prefix[left]
$$

它等于 $k$ 当且仅当：

$$
prefix[left]=prefix[right+1]-k
$$

因此，遍历到当前前缀和 `sum` 时，只需知道此前出现过多少次 `sum - k`。

### 方法一：枚举左端点

固定右端点并向左累加，枚举所有以该位置结尾的子数组。

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        int ans = 0;
        for (int right = 0; right < nums.size(); right++) {
            int sum = 0;
            for (int left = right; left >= 0; left--) {
                sum += nums[left];
                if (sum == k) {
                    ans++;
                }
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

### 方法二：前缀和与哈希表

哈希表 `count[x]` 记录当前下标之前，前缀和 `x` 出现的次数。初始放入 `count[0] = 1`，这样从数组下标 `0` 开始、和恰好为 `k` 的子数组也能被统计。

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        count[0] = 1;
        int sum = 0, ans = 0;

        for (int x : nums) {
            sum += x;
            ans += count[sum - k];
            count[sum]++;
        }
        return ans;
    }
};
```

查询必须在记录当前前缀和之前完成，否则当 `k = 0` 时，当前前缀会与自身配对，错误地统计空子数组。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

### 正确性

每个以当前位置为右端点、和为 `k` 的子数组，都唯一对应一个值为 `sum - k` 的历史前缀和。哈希表保存了这些历史前缀的准确数量，所以本轮增加的计数恰好等于以当前位置结尾的合法子数组数。遍历全部右端点即可统计所有答案，且不会重复。

### 易错点

- 数组含负数，窗口和不具有单调性，不能使用普通滑动窗口。
- 必须初始化 `count[0] = 1`。
- 先查询 `sum - k`，再把当前 `sum` 加入哈希表。
- 题目统计子数组个数，不是不同的和或不同的数值排列。

</details>

### 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目](https://leetcode.cn/problems/subarray-sum-equals-k/)

## 239. 滑动窗口最大值

给定整数数组 `nums` 和大小为 `k` 的滑动窗口。窗口从数组最左侧向右移动，每次移动一个位置，返回每个窗口中的最大值。

[题目链接](https://leetcode.cn/problems/sliding-window-maximum/)

### 示例

#### 示例 1

- 输入：`nums = [1,3,-1,-3,5,3,6,7], k = 3`
- 输出：`[3,3,5,5,6,7]`
- 解释：六个窗口依次为 `[1,3,-1]`、`[3,-1,-3]`、`[-1,-3,5]`、`[-3,5,3]`、`[5,3,6]`、`[3,6,7]`。

#### 示例 2

- 输入：`nums = [1], k = 1`
- 输出：`[1]`

### 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$
- $1 \leq k \leq nums.length$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：优先队列

大根堆保存 `{数值, 下标}`。加入右端元素后，不断弹出下标已经离开窗口的堆顶，剩余堆顶就是当前最大值。

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        priority_queue<pair<int, int>> heap;
        vector<int> ans;

        for (int right = 0; right < nums.size(); right++) {
            heap.push({nums[right], right});
            while (heap.top().second <= right - k) {
                heap.pop();
            }
            if (right >= k - 1) {
                ans.push_back(heap.top().first);
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n\log n)$
- 空间复杂度：$O(n)$，失效但未到堆顶的元素不会立即删除

### 方法二：单调队列

双端队列保存元素下标，并使对应数值从队首到队尾单调不增：

1. 删除队首已经离开窗口的下标；
2. 当前值不小于队尾值时删除队尾，因为当前元素更大且离开窗口更晚，旧队尾不可能再成为最大值；
3. 把当前下标加入队尾；
4. 窗口形成后，队首对应当前最大值。

```cpp
class Solution {
public:
    vector<int> maxSlidingWindow(vector<int>& nums, int k) {
        deque<int> q;
        vector<int> ans;

        for (int right = 0; right < nums.size(); right++) {
            while (!q.empty() && q.front() <= right - k) {
                q.pop_front();
            }
            while (!q.empty() && nums[q.back()] <= nums[right]) {
                q.pop_back();
            }
            q.push_back(right);
            if (right >= k - 1) {
                ans.push_back(nums[q.front()]);
            }
        }
        return ans;
    }
};
```

每个下标最多入队、出队各一次。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(k)$

### 正确性

队列删除两类不可能成为答案的元素：已经离开窗口的元素，以及左侧不大于当前值的元素。后者在数值上不占优，又会比当前元素更早离开窗口，因此可永久丢弃。剩余元素按值单调不增且都位于窗口内，所以队首必然是窗口最大值。

### 易错点

- 队列保存下标而不是数值，否则无法判断元素是否离开窗口。
- 窗口左边界是 `right - k + 1`，所以失效条件为 `index <= right - k`。
- 必须在窗口形成后，即 `right >= k - 1` 时才记录答案。
- 弹出队尾使用 `<=` 可移除更早的相同值；使用 `<` 也能正确求最大值，但会保留更多下标。

</details>

### 参考

- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目](https://leetcode.cn/problems/sliding-window-maximum/)

## 76. 最小覆盖子串

给定字符串 `s` 和 `t`，返回 `s` 中涵盖 `t` 所有字符的最短连续子串。若 `t` 中某个字符出现多次，窗口中也必须至少包含相同次数。若不存在这样的子串，返回空字符串。题目保证非空答案唯一。

[题目链接](https://leetcode.cn/problems/minimum-window-substring/)

### 示例

#### 示例 1

- 输入：`s = "ADOBECODEBANC", t = "ABC"`
- 输出：`"BANC"`
- 解释：`"BANC"` 同时包含 `A`、`B`、`C`，并且不存在更短的覆盖子串。

#### 示例 2

- 输入：`s = "a", t = "a"`
- 输出：`"a"`

#### 示例 3

- 输入：`s = "a", t = "aa"`
- 输出：`""`
- 解释：`t` 需要两个 `a`，而 `s` 只有一个。

### 数据范围

- $1 \leq s.length,t.length \leq 10^5$
- `s` 和 `t` 由大写及小写英文字母组成

<details class="note-solution">
<summary>查看解析</summary>

### 窗口状态

`need[c]` 表示当前窗口还缺少多少个字符 `c`：

- `need[c] > 0`：仍缺少该字符；
- `need[c] == 0`：数量恰好足够；
- `need[c] < 0`：窗口中有多余的该字符。

`missing` 记录总共还缺少多少个字符，初始为 `t.length()`。右端加入一个仍然缺少的字符时，`missing` 减一；`missing == 0` 表示当前窗口已经覆盖 `t`。

### 算法流程

1. 右移 `right`，把新字符加入窗口；
2. 当 `missing == 0` 时，当前窗口合法，记录更短的答案；
3. 继续右移 `left` 缩小窗口；
4. 若移除某字符后 `need[c] > 0`，窗口重新缺少该字符，停止收缩并继续扩张右端。

```cpp
class Solution {
public:
    string minWindow(string s, string t) {
        array<int, 128> need{};
        for (char c : t) {
            need[c]++;
        }

        int missing = t.size();
        int left = 0, answerLeft = 0, answerLength = INT_MAX;
        for (int right = 0; right < s.size(); right++) {
            if (need[s[right]] > 0) {
                missing--;
            }
            need[s[right]]--;

            while (missing == 0) {
                if (right - left + 1 < answerLength) {
                    answerLeft = left;
                    answerLength = right - left + 1;
                }
                need[s[left]]++;
                if (need[s[left]] > 0) {
                    missing++;
                }
                left++;
            }
        }
        return answerLength == INT_MAX ? "" : s.substr(answerLeft, answerLength);
    }
};
```

### 过程示例

对于 `s = "ADOBECODEBANC"`、`t = "ABC"`：

- 右端到达第一个 `C` 时，窗口 `"ADOBEC"` 首次覆盖 `t`；
- 收缩左端后移除 `A`，窗口失效，继续扩张；
- 后续得到合法窗口 `"CODEBA"`，收缩为 `"BANC"`；
- `"BANC"` 长度为 `4`，已经等于 `t` 的长度，不可能存在更短的覆盖窗口。

### 正确性

`missing == 0` 与“窗口覆盖 `t`”等价，因为它精确统计尚未满足的字符总数。对每个右端点，内层循环持续移动左端，直到窗口刚好失效，所以期间检查了该右端点对应的所有可能最短合法窗口。枚举全部右端点并取最短值，即得到全局最短覆盖子串。

### 复杂度

左右指针都只向右移动，每个字符最多进入和离开窗口各一次。

- 时间复杂度：$O(|s|+|t|)$
- 空间复杂度：$O(|\Sigma|)=O(1)$

### 易错点

- 字符有大小写之分，`A` 与 `a` 不同。
- 只统计字符种类不够，还要满足每个字符的出现次数。
- `need[c] < 0` 表示字符多余，移除它不会让窗口立即失效。
- 更新最短答案必须放在窗口仍合法时，不能在收缩结束后才更新。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题解：最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/solutions/257359/zui-xiao-fu-gai-zi-chuan-by-leetcode-solution/)
