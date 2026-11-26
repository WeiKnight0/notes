---
title: Hot 100：普通数组
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 53. 最大子数组和

给定整数数组 `nums`，找出和最大的连续非空子数组，返回该子数组的元素和。

[题目链接](https://leetcode.cn/problems/maximum-subarray/)

### 示例

#### 示例 1

- 输入：`nums = [-2,1,-3,4,-1,2,1,-5,4]`
- 输出：`6`
- 解释：连续子数组 `[4,-1,2,1]` 的和最大，为 `6`。

#### 示例 2

- 输入：`nums = [1]`
- 输出：`1`

#### 示例 3

- 输入：`nums = [5,4,-1,7,8]`
- 输出：`23`

### 数据范围

- $1 \leq nums.length \leq 10^5$
- $-10^4 \leq nums[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：动态规划

令 `current` 表示以当前位置结尾的最大子数组和。加入当前元素 `x` 时只有两种选择：

1. 抛弃此前的子数组，从 `x` 重新开始；
2. 把 `x` 接在此前的子数组后面。

因此状态转移为：

$$
current=\max(x,current+x)
$$

每个 `current` 只代表以当前位置结尾的最优解，最终答案是所有位置的 `current` 的最大值。

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int current = nums[0], ans = nums[0];
        for (int i = 1; i < nums.size(); i++) {
            current = max(nums[i], current + nums[i]);
            ans = max(ans, current);
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法二：前缀和

设当前前缀和为 `sum`。若一个子数组在当前位置结束，其和等于当前前缀和减去此前某个前缀和。要使结果最大，应减去当前位置之前出现过的最小前缀和。

```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int sum = 0, minPrefix = 0;
        int ans = INT_MIN;
        for (int x : nums) {
            sum += x;
            ans = max(ans, sum - minPrefix);
            minPrefix = min(minPrefix, sum);
        }
        return ans;
    }
};
```

必须先用 `minPrefix` 更新答案，再把当前 `sum` 纳入最小前缀。否则会允许两个前缀取在同一位置，错误地把空子数组作为候选。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 正确性

动态规划中，以当前位置结尾的连续子数组要么只含当前元素，要么由前一位置结尾的连续子数组追加当前元素得到，不存在第三种情况。选取两者中较大者就得到当前状态的最优解。

前缀和方法则枚举了每个右端点，并为它选择此前最小的前缀和，所以得到以该右端点结束的最大和。两种方法最终都比较了所有可能的右端点。

### 易错点

- 子数组必须非空，答案不能初始化为 `0`；全负数组的答案是其中最大的负数。
- 题目要求连续子数组，不能跳过中间元素。
- `current` 变成负数并不需要单独清零，转移式会在下一位置决定是否重新开始。

</details>

### 参考

- [灵茶山艾府：动态规划题单](https://leetcode.cn/discuss/post/tXLS3i/)
- [LeetCode 官方题解](https://leetcode.cn/problems/maximum-subarray/solutions/)

## 56. 合并区间

给定若干闭区间 `intervals[i] = [start_i, end_i]`，合并所有重叠区间，返回恰好覆盖原有区间且互不重叠的区间数组。

[题目链接](https://leetcode.cn/problems/merge-intervals/)

### 示例

#### 示例 1

- 输入：`intervals = [[1,3],[2,6],[8,10],[15,18]]`
- 输出：`[[1,6],[8,10],[15,18]]`
- 解释：`[1,3]` 与 `[2,6]` 重叠，合并为 `[1,6]`。

#### 示例 2

- 输入：`intervals = [[1,4],[4,5]]`
- 输出：`[[1,5]]`
- 解释：两个闭区间在端点 `4` 相交，因此可以合并。

#### 示例 3

- 输入：`intervals = [[4,7],[1,4]]`
- 输出：`[[1,7]]`

### 数据范围

- $1 \leq intervals.length \leq 10^4$
- `intervals[i].length == 2`
- $0 \leq start_i \leq end_i \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 排序后合并

先按区间左端点升序排列。设答案的最后一个区间为 `[left, right]`，下一个区间为 `[start, end]`：

- 若 `start <= right`，两个闭区间重叠，把右端点更新为 `max(right, end)`；
- 若 `start > right`，后续区间的左端点只会更大，不可能再与 `[left, right]` 重叠，应开始一个新区间。

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> ans;

        for (const auto& interval : intervals) {
            if (ans.empty() || interval[0] > ans.back()[1]) {
                ans.push_back(interval);
                continue;
            }
            ans.back()[1] = max(ans.back()[1], interval[1]);
        }
        return ans;
    }
};
```

以 `[[1,3],[2,6],[8,10],[15,18]]` 为例：

1. `[1,3]` 作为第一个结果区间；
2. `[2,6]` 的左端点不大于 `3`，合并为 `[1,6]`；
3. `[8,10]` 与 `[1,6]` 分离，加入新区间；
4. `[15,18]` 与 `[8,10]` 分离，加入新区间。

### 正确性

排序后，尚未处理的区间不会从当前区间左侧开始。遇到左端点不大于当前右端点的区间时，两者必然相交，扩展右端点即可覆盖二者；遇到左端点更大的区间时，当前区间与此后所有区间都不再相交，可以安全写入结果。依次处理后，答案互不重叠且覆盖全部原区间。

### 复杂度

- 时间复杂度：$O(n\log n)$，主要来自排序
- 空间复杂度：忽略返回结果时为 $O(\log n)$，取决于排序实现使用的栈空间

### 易错点

- 输入是闭区间，`[1,4]` 与 `[4,5]` 在 `4` 处相交，判断不重叠应使用 `start > right`。
- 合并后的右端点要取最大值，不能直接替换为新区间的右端点，例如 `[1,10]` 与 `[2,3]` 合并后仍是 `[1,10]`。
- 必须先按左端点排序，否则只与答案末尾比较没有意义。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/merge-intervals/solutions/)

## 189. 轮转数组

给定整数数组 `nums` 和非负整数 `k`，将数组中的元素向右轮转 `k` 个位置。要求直接修改 `nums`。

[题目链接](https://leetcode.cn/problems/rotate-array/)

### 示例

#### 示例 1

- 输入：`nums = [1,2,3,4,5,6,7], k = 3`
- 输出：`[5,6,7,1,2,3,4]`
- 解释：向右轮转三次后，末尾的 `[5,6,7]` 移到数组开头。

#### 示例 2

- 输入：`nums = [-1,-100,3,99], k = 2`
- 输出：`[3,99,-1,-100]`

### 数据范围

- $1 \leq nums.length \leq 10^5$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$
- $0 \leq k \leq 10^5$

轮转 `n` 次会回到原数组，因此首先令 `k %= n`。原下标 $i$ 的元素在轮转后位于：

$$
(i+k)\bmod n
$$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：辅助数组

按照目标下标公式把每个元素写入新数组，最后整体赋回 `nums`。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        vector<int> rotated(n);
        for (int i = 0; i < n; i++) {
            rotated[(i + k) % n] = nums[i];
        }
        nums = move(rotated);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

### 方法二：三次反转

数组可分为两段：

```text
[1,2,3,4] [5,6,7]
```

目标是交换两段的位置，同时保持各段内部顺序。依次执行：

1. 反转整个数组：`[7,6,5,4,3,2,1]`；
2. 反转前 `k` 个元素：`[5,6,7,4,3,2,1]`；
3. 反转剩余元素：`[5,6,7,1,2,3,4]`。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin(), nums.begin() + k);
        reverse(nums.begin() + k, nums.end());
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法三：环状替换

直接把下标 `current` 的元素放到 `(current + k) % n`。目标位置原来的元素不能丢失，用 `previous` 暂存并继续放置。

下标变换可能形成多个互不相交的环。例如 `n = 6, k = 2` 时，下标形成 `0 → 2 → 4 → 0` 和 `1 → 3 → 5 → 1` 两个环，所以完成一个环后还要寻找下一个起点。用 `moved` 统计已放置的元素，达到 `n` 时结束。

```cpp
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n = nums.size();
        k %= n;
        int moved = 0;

        for (int start = 0; moved < n; start++) {
            int current = start;
            int previous = nums[current];
            do {
                int next = (current + k) % n;
                swap(previous, nums[next]);
                current = next;
                moved++;
            } while (current != start);
        }
    }
};
```

每一步都把一个元素送到唯一的目标位置，并保存被覆盖的元素。一个环闭合后，该环中的所有元素都已就位；所有环互不相交且覆盖全部下标，因此移动 `n` 个元素后数组完成轮转。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- `k` 可能大于数组长度，必须先取模。
- 逐次把末尾元素插入开头需要反复移动数组，时间复杂度为 $O(nk)$。
- 三次反转的范围分别是整个数组、前 `k` 个元素和后 `n-k` 个元素。
- 环状替换不能只处理从下标 `0` 出发的一个环。

</details>

### 参考

- [LeetCode 官方题解：三种轮转方法](https://leetcode.cn/problems/rotate-array/solutions/792968/rotate-array-by-yi-fan-dn-052r/)

## 238. 除自身以外数组的乘积

给定整数数组 `nums`，返回数组 `answer`，其中 `answer[i]` 等于 `nums` 中除 `nums[i]` 之外其余所有元素的乘积。不能使用除法，并要求在 $O(n)$ 时间内完成。

[题目链接](https://leetcode.cn/problems/product-of-array-except-self/)

### 示例

#### 示例 1

- 输入：`nums = [1,2,3,4]`
- 输出：`[24,12,8,6]`

#### 示例 2

- 输入：`nums = [-1,1,0,-3,3]`
- 输出：`[0,0,9,0,0]`

### 数据范围

- $2 \leq nums.length \leq 10^5$
- $-30 \leq nums[i] \leq 30$
- 任意前缀或后缀的乘积都在 32 位整数范围内

<details class="note-solution">
<summary>查看解析</summary>

### 前缀乘积与后缀乘积

对下标 $i$，答案可以拆成左右两部分：

$$
answer[i]=\left(\prod_{j=0}^{i-1}nums[j]\right)
\left(\prod_{j=i+1}^{n-1}nums[j]\right)
$$

空区间的乘积为 `1`，所以首元素没有左侧元素时左侧乘积为 `1`，末元素没有右侧元素时右侧乘积也为 `1`。

### 方法一：两个辅助数组

`prefix[i]` 保存 `nums[i]` 左侧所有元素的乘积，`suffix[i]` 保存右侧所有元素的乘积。

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> prefix(n, 1), suffix(n, 1), answer(n);
        for (int i = 1; i < n; i++) {
            prefix[i] = prefix[i - 1] * nums[i - 1];
        }
        for (int i = n - 2; i >= 0; i--) {
            suffix[i] = suffix[i + 1] * nums[i + 1];
        }
        for (int i = 0; i < n; i++) {
            answer[i] = prefix[i] * suffix[i];
        }
        return answer;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$，不计算返回数组

### 方法二：复用答案数组

先把左侧乘积直接写入 `answer`。随后从右向左扫描，用一个变量 `suffix` 保存当前位置右侧的乘积：

1. `answer[i] *= suffix`，合并左右两侧；
2. `suffix *= nums[i]`，供下一个位置使用。

```cpp
class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> answer(n, 1);
        for (int i = 1; i < n; i++) {
            answer[i] = answer[i - 1] * nums[i - 1];
        }

        int suffix = 1;
        for (int i = n - 1; i >= 0; i--) {
            answer[i] *= suffix;
            suffix *= nums[i];
        }
        return answer;
    }
};
```

以 `[1,2,3,4]` 为例，第一次扫描得到左侧乘积 `[1,1,2,6]`。从右向左乘上后缀乘积 `1、4、12、24` 后，得到 `[24,12,8,6]`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，返回数组不计入额外空间

### 正确性

第一次扫描后，`answer[i]` 恰好等于下标 `i` 左侧全部元素的乘积。第二次扫描处理 `i` 时，`suffix` 恰好等于下标 `i` 右侧全部元素的乘积。二者相乘正好排除 `nums[i]`，并包含其他每个元素一次。

### 易错点

- 不能用数组总乘积除以 `nums[i]`，题目禁止除法，而且数组可能含零。
- 更新 `suffix` 必须在写入 `answer[i]` 之后，否则会把 `nums[i]` 乘入自己的答案。
- 前缀和后缀的初值都是乘法单位元 `1`，不是 `0`。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/product-of-array-except-self/solutions/)

## 41. 缺失的第一个正数

给定未排序整数数组 `nums`，返回其中没有出现的最小正整数。进阶要求时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

[题目链接](https://leetcode.cn/problems/first-missing-positive/)

### 示例

#### 示例 1

- 输入：`nums = [1,2,0]`
- 输出：`3`

#### 示例 2

- 输入：`nums = [3,4,-1,1]`
- 输出：`2`
- 解释：数组中存在 `1`，但不存在 `2`。

#### 示例 3

- 输入：`nums = [7,8,9,11,12]`
- 输出：`1`

### 数据范围

- $1 \leq nums.length \leq 10^5$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

### 答案范围

长度为 $n$ 的数组最多同时包含正整数 $1,2,\ldots,n$。若它们全部出现，答案为 $n+1$；否则答案一定在 `[1, n]` 中。

因此，负数、零和大于 `n` 的数都不影响答案。只需判断 `[1, n]` 中每个整数是否出现。

### 方法一：哈希集合

把所有数加入集合，再从 `1` 开始寻找第一个不在集合中的正整数。

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        for (int x = 1; x <= nums.size(); x++) {
            if (!values.count(x)) {
                return x;
            }
        }
        return nums.size() + 1;
    }
};
```

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(n)$

该方法容易理解，但不满足 $O(1)$ 额外空间的进阶要求。

### 方法二：原地放置

把输入数组本身当作哈希表：数值 `x` 若位于 `[1, n]`，就应放在下标 `x - 1`。

遍历每个位置时，只要当前数属于 `[1, n]` 且尚未位于正确位置，就将它与目标位置交换。交换后当前位置得到了一个新数，需要继续判断，所以这里使用 `while` 而不是 `if`。

```cpp
class Solution {
public:
    int firstMissingPositive(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            while (nums[i] >= 1 && nums[i] <= n &&
                   nums[nums[i] - 1] != nums[i]) {
                swap(nums[i], nums[nums[i] - 1]);
            }
        }

        for (int i = 0; i < n; i++) {
            if (nums[i] != i + 1) {
                return i + 1;
            }
        }
        return n + 1;
    }
};
```

以 `[3,4,-1,1]` 为例：

1. `3` 放到下标 `2`，数组变为 `[-1,4,3,1]`；
2. `4` 放到下标 `3`，数组变为 `[-1,1,3,4]`；
3. 下标 `1` 的 `1` 放到下标 `0`，数组变为 `[1,-1,3,4]`；
4. 最终下标 `1` 上不是 `2`，所以缺失的最小正整数是 `2`。

### 为什么是线性时间

虽然代码中存在嵌套的 `while`，但每次交换都会把一个 `[1,n]` 内的数放到其目标下标。一个目标位置确定后不会因相同数值再次交换而被破坏，所以成功交换次数不超过 $n$，总时间复杂度仍为 $O(n)$。

### 正确性

放置结束后，若数值 `x` 存在，则下标 `x - 1` 上一定是 `x`；重复值会因目标位置已经具有同值而停止交换。随后从左向右检查，第一个不满足 `nums[i] == i + 1` 的位置对应最小缺失正整数。若所有位置都满足，`1` 到 `n` 全部存在，答案为 `n + 1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- 访问 `nums[nums[i] - 1]` 前，必须先确认 `nums[i]` 位于 `[1, n]`。
- 交换条件必须排除目标位置已经等于当前值的情况，否则重复值会导致死循环。
- 需要反复处理交换到当前位置的新值，因此不能把 `while` 改为 `if`。
- 最终返回的是缺失的正整数 `i + 1`，不是数组下标 `i`。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/first-missing-positive/solutions/)
