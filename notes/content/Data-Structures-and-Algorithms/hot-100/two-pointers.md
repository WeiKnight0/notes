---
title: Hot 100：双指针
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 283. 移动零

给定整数数组 `nums`，将所有 `0` 移到数组末尾，同时保持非零元素的相对顺序。必须在原数组上操作，不能复制整个数组。

[题目链接](https://leetcode.cn/problems/move-zeroes/)

### 示例

#### 示例 1

- 输入：`nums = [0,1,0,3,12]`
- 输出：`[1,3,12,0,0]`

#### 示例 2

- 输入：`nums = [0]`
- 输出：`[0]`

### 数据范围

- $1 \leq nums.length \leq 10^4$
- $-2^{31} \leq nums[i] \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：写入非零元素后补零

用 `write` 表示下一个非零元素的写入位置。第一次遍历依次写入所有非零元素，第二次把剩余位置填成 `0`。

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int write = 0;
        for (int x : nums) {
            if (x != 0) {
                nums[write++] = x;
            }
        }
        while (write < nums.size()) {
            nums[write++] = 0;
        }
    }
};
```

非零元素按原来的遍历顺序写入，所以相对顺序不变；写入结束后，数组前半部分恰好包含所有非零元素，其余位置都应为零。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法二：同向双指针

`slow` 指向下一个非零元素应放置的位置，`fast` 负责寻找非零元素。发现非零元素时，交换 `nums[slow]` 和 `nums[fast]`，再令 `slow` 后移。

遍历到 `fast` 之前时，数组满足：

- `[0, slow)` 是已处理的非零元素，顺序与原数组一致；
- `[slow, fast)` 全部为零。

```cpp
class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        int slow = 0;
        for (int fast = 0; fast < nums.size(); fast++) {
            if (nums[fast] == 0) {
                continue;
            }
            swap(nums[slow], nums[fast]);
            slow++;
        }
    }
};
```

交换后，当前非零元素进入 `[0, slow]` 的末尾；被换到 `fast` 位置的元素只能是零或自身，因此上述区间性质继续成立。遍历结束后，所有非零元素都已稳定地移到前面，零位于末尾。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- 不能直接删除零再追加，这会改变数组长度，通常还会引入额外空间或 $O(n^2)$ 的移动开销。
- 题目要求保持非零元素的相对顺序，不能使用普通的左右交换把任意零换到末尾。
- `slow` 表示写入位置，不是当前找到的零的数量。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/move-zeroes/)

## 11. 盛最多水的容器

给定长度为 $n$ 的整数数组 `height`。第 $i$ 条竖线的两个端点是 $(i,0)$ 和 $(i,height[i])$。选择两条竖线与 $x$ 轴组成容器，求容器最多能装多少水。容器不能倾斜。

[题目链接](https://leetcode.cn/problems/container-with-most-water/)

### 示例

#### 示例 1

- 输入：`height = [1,8,6,2,5,4,8,3,7]`
- 输出：`49`
- 解释：选择下标 `1` 和 `8`，高度分别为 `8` 和 `7`，面积为 $(8-1)\times 7=49$。

#### 示例 2

- 输入：`height = [1,1]`
- 输出：`1`

### 数据范围

- $2 \leq n \leq 10^5$
- $0 \leq height[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 面积公式

选择下标 $left<right$ 的两条竖线，容器宽度为 $right-left$，有效高度由较短的竖线决定：

$$
S=(right-left)\times\min(height[left],height[right])
$$

### 方法一：枚举两条边

枚举所有 $(left,right)$，直接计算面积。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int ans = 0;
        for (int left = 0; left < height.size(); left++) {
            for (int right = left + 1; right < height.size(); right++) {
                ans = max(ans, (right - left) * min(height[left], height[right]));
            }
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

该方法能够直接验证定义，但在 $n=10^5$ 时会超时。

### 方法二：相向双指针

左右指针从数组两端开始。每次计算当前面积，然后移动较短的竖线：

1. 计算 `left` 与 `right` 组成的面积并更新答案；
2. 若左边更短，令 `left++`；
3. 否则令 `right--`。

为什么只能移动短边？假设 $height[left]\leq height[right]$。如果保留 `left` 并向左移动 `right`，宽度变小，而新容器的高度仍不可能超过 $height[left]$，面积一定不会更大。因此，以 `left` 为一端的其余方案都可排除，应移动 `left` 寻找更高的边。

```cpp
class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int ans = 0;
        while (left < right) {
            ans = max(ans, (right - left) * min(height[left], height[right]));
            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        return ans;
    }
};
```

每轮都安全地排除较短端点对应的所有未检查方案，并保留其中可能超过当前答案的方案。左右指针相遇时，全部候选端点均已被排除或计算，`ans` 即最大面积。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- 高度应取两端的较小值，而不是较大值。
- 移动较高的一侧无法突破当前短边的高度限制，会漏掉答案。
- 面积使用下标之差 `right - left`，不是元素个数 `right - left + 1`。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/container-with-most-water/)

## 15. 三数之和

给定整数数组 `nums`，找出所有满足 $i\neq j$、$i\neq k$、$j\neq k$ 且 $nums[i]+nums[j]+nums[k]=0$ 的三元组。答案中不能包含重复的三元组。

[题目链接](https://leetcode.cn/problems/3sum/)

### 示例

#### 示例 1

- 输入：`nums = [-1,0,1,2,-1,-4]`
- 输出：`[[-1,-1,2],[-1,0,1]]`
- 解释：`nums[0] + nums[1] + nums[2] = 0`，`nums[1] + nums[2] + nums[4] = 0`，`nums[0] + nums[3] + nums[4] = 0`。去除重复三元组后得到答案。

#### 示例 2

- 输入：`nums = [0,1,1]`
- 输出：`[]`

#### 示例 3

- 输入：`nums = [0,0,0]`
- 输出：`[[0,0,0]]`

### 数据范围

- $3 \leq nums.length \leq 3000$
- $-10^5 \leq nums[i] \leq 10^5$

<details class="note-solution">
<summary>查看解析</summary>

### 从三重枚举到双指针

直接枚举三个下标需要 $O(n^3)$。排序后固定第一个数 `nums[i]`，问题变为：在区间 `[i + 1, n - 1]` 中寻找两个数，其和等于 `-nums[i]`。

排序数组具有单调性。令 `left = i + 1`、`right = n - 1`：

1. 三数之和小于 `0` 时，只有增大较小的数才可能接近 `0`，令 `left++`；
2. 三数之和大于 `0` 时，只有减小较大的数才可能接近 `0`，令 `right--`；
3. 三数之和等于 `0` 时记录答案，两侧同时移动并跳过重复值。

### 去重

去重分为两层：

- 若 `nums[i] == nums[i - 1]`，当前首元素会产生与上一次相同的三元组，应跳过；
- 找到答案后，`left` 和 `right` 必须跨过所有相同值，否则会重复加入同一个三元组。

例如排序后的 `[-2,0,0,2,2]`。固定 `-2` 后只能记录一次 `[-2,0,2]`，随后两个指针分别跨过连续的 `0` 和 `2`。

### 剪枝

固定 `nums[i]` 后：

- 若当前最小的三数之和 `nums[i] + nums[i + 1] + nums[i + 2] > 0`，后面的数只会更大，可以结束枚举；
- 若当前最大的三数之和 `nums[i] + nums[n - 2] + nums[n - 1] < 0`，当前 `nums[i]` 不可能组成答案，应枚举下一个 `i`。

### 代码

```cpp
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> ans;
        int n = nums.size();

        for (int i = 0; i < n - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) {
                continue;
            }
            if (nums[i] + nums[i + 1] + nums[i + 2] > 0) {
                break;
            }
            if (nums[i] + nums[n - 2] + nums[n - 1] < 0) {
                continue;
            }

            int left = i + 1, right = n - 1;
            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right];
                if (sum < 0) {
                    left++;
                } else if (sum > 0) {
                    right--;
                } else {
                    ans.push_back({nums[i], nums[left], nums[right]});
                    left++;
                    right--;
                    while (left < right && nums[left] == nums[left - 1]) {
                        left++;
                    }
                    while (left < right && nums[right] == nums[right + 1]) {
                        right--;
                    }
                }
            }
        }
        return ans;
    }
};
```

### 正确性

固定 `i` 后，若当前和小于零，减小 `right` 只会使和更小，因此必须增大 `left`；若当前和大于零，同理必须减小 `right`。每次移动都只排除不可能满足条件的组合，所以不会漏解。

排序使同值相邻。首元素去重和匹配后的两端去重共同保证每组数值只记录一次，因此答案也不会重复。

- 时间复杂度：排序为 $O(n\log n)$，双指针枚举为 $O(n^2)$，总复杂度为 $O(n^2)$
- 空间复杂度：忽略排序栈与返回结果时为 $O(1)$

### 易错点

- 跳过重复的 `nums[i]` 应与前一个数比较，不能与后一个数比较，否则可能漏掉 `[-1,-1,2]`。
- 找到答案后两侧都要移动，否则循环可能停在原地。
- 答案按数值去重，不是按下标去重。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/3sum/)

## 42. 接雨水

给定 $n$ 个非负整数表示宽度均为 `1` 的柱子高度，计算这些柱子在下雨后能够接住多少水。

[题目链接](https://leetcode.cn/problems/trapping-rain-water/)

### 示例

#### 示例 1

- 输入：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`
- 输出：`6`

#### 示例 2

- 输入：`height = [4,2,0,3,2,5]`
- 输出：`9`

### 数据范围

- $1 \leq n \leq 2\times 10^4$
- $0 \leq height[i] \leq 10^5$

<details class="note-solution">
<summary>查看解析</summary>

### 每根柱子上方的水量

下标 $i$ 上方的水面由左侧最高柱与右侧最高柱中较矮的一侧决定。设两侧最高值分别为 $leftMax[i]$ 和 $rightMax[i]$，则：

$$
water[i]=\min(leftMax[i],rightMax[i])-height[i]
$$

只要能高效得到每个位置左右两侧的最高值，就能求出总水量。

### 方法一：前后缀最大值

分别预处理每个位置左侧与右侧的最高柱，再按照公式累加。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        vector<int> leftMax(n), rightMax(n);
        leftMax[0] = height[0];
        for (int i = 1; i < n; i++) {
            leftMax[i] = max(leftMax[i - 1], height[i]);
        }
        rightMax[n - 1] = height[n - 1];
        for (int i = n - 2; i >= 0; i--) {
            rightMax[i] = max(rightMax[i + 1], height[i]);
        }

        int ans = 0;
        for (int i = 0; i < n; i++) {
            ans += min(leftMax[i], rightMax[i]) - height[i];
        }
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

### 方法二：相向双指针

前后缀数组中，每个位置只需要较小的那一侧。双指针可以在移动过程中确定这一侧，无须保存两个数组。

维护：

- `leftMax`：区间 `[0, left]` 的最大高度；
- `rightMax`：区间 `[right, n - 1]` 的最大高度。

若 `leftMax < rightMax`，右侧已经存在一根至少高为 `rightMax` 的柱子，因此 `left` 位置的水量只由 `leftMax` 决定，可以立即结算。反之结算 `right`。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int leftMax = 0, rightMax = 0;
        int ans = 0;

        while (left <= right) {
            leftMax = max(leftMax, height[left]);
            rightMax = max(rightMax, height[right]);
            if (leftMax < rightMax) {
                ans += leftMax - height[left];
                left++;
            } else {
                ans += rightMax - height[right];
                right--;
            }
        }
        return ans;
    }
};
```

以 `[4,2,0,3,2,5]` 为例，右侧最高值始终至少为 `5`，内部位置受到左侧高度 `4` 限制，水量依次为 `2、4、1、2`，总和为 `9`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 方法三：单调栈

前两种方法按列计算水量；单调栈按横向的一层水计算。

栈中保存下标，并使对应高度单调不增。遇到更高的柱子 `i` 时，栈顶柱子成为凹槽底部：

1. 弹出槽底 `bottom`；
2. 若栈为空，槽底左侧没有边界，不能接水；
3. 新栈顶 `left` 是左边界，`i` 是右边界；
4. 宽度为 `i - left - 1`，水层高度为 `min(height[left], height[i]) - height[bottom]`。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        stack<int> st;
        int ans = 0;

        for (int i = 0; i < height.size(); i++) {
            while (!st.empty() && height[i] > height[st.top()]) {
                int bottom = st.top();
                st.pop();
                if (st.empty()) {
                    break;
                }
                int left = st.top();
                int width = i - left - 1;
                int level = min(height[left], height[i]) - height[bottom];
                ans += width * level;
            }
            st.push(i);
        }
        return ans;
    }
};
```

每次弹栈都结算由当前左右边界封闭、位于 `bottom` 高度之上的一层水。不同弹栈过程对应互不重叠的水层，因此所有水量恰好被计算一次。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

### 易错点

- 双指针比较的是 `leftMax` 与 `rightMax`，这能直接说明当前哪一侧可结算。
- 单调栈必须保存下标，计算横向宽度时不能只保存高度。
- 单调栈弹出槽底后若栈为空，说明没有左边界，不能计算水量。
- 柱子本身占据一个单位宽度，所以两边界之间的宽度是 `right - left - 1`。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题解：接雨水](https://leetcode.cn/problems/trapping-rain-water/solutions/692342/jie-yu-shui-by-leetcode-solution-tuvc/)
