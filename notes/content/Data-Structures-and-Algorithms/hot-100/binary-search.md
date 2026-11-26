---
title: Hot 100：二分查找
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 35. 搜索插入位置

给定一个无重复元素的升序数组 `nums` 和目标值 `target`。如果数组中存在目标值，返回它的下标；否则返回将它插入数组并保持升序的位置。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/search-insert-position/)

### 示例

#### 示例 1

- 输入：`nums = [1,3,5,6], target = 5`
- 输出：`2`

#### 示例 2

- 输入：`nums = [1,3,5,6], target = 2`
- 输出：`1`

#### 示例 3

- 输入：`nums = [1,3,5,6], target = 7`
- 输出：`4`

### 数据范围

- $1 \leq nums.length \leq 10^4$
- $-10^4 \leq nums[i], target \leq 10^4$
- `nums` 严格递增

<details class="note-solution">
<summary>查看解析</summary>

### 查找插入位置

目标位置是数组中第一个大于或等于 `target` 的下标。若所有元素都小于 `target`，答案就是数组长度 $n$。

使用左闭右开区间 $[left,right)$：

- `nums[mid] < target` 时，`mid` 不可能是答案，令 `left = mid + 1`；
- `nums[mid] >= target` 时，`mid` 可能是答案，令 `right = mid`。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }
};
```

循环结束时 `left == right`。该位置左侧的元素都小于 `target`，该位置及其右侧的元素都大于或等于 `target`，所以它正是目标值的位置或合法插入位置。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

### 标准库写法

`lower_bound` 返回有序区间中第一个大于或等于目标值的迭代器，与上面的查找目标完全相同。

```cpp
class Solution {
public:
    int searchInsert(vector<int>& nums, int target) {
        return lower_bound(nums.begin(), nums.end(), target) - nums.begin();
    }
};
```

### 易错点

- `right` 初值为 `nums.size()`，表示搜索区间不包含右端点。
- 当目标值大于所有元素时，返回 `nums.size()`，不能把答案限制在最后一个有效下标。
- 这里找的是第一个大于或等于目标值的位置，不是任意一个相等位置。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-insert-position/solutions/)

## 74. 搜索二维矩阵

给定一个 $m\times n$ 的整数矩阵 `matrix`，每行从左到右递增，并且每行第一个整数都大于上一行最后一个整数。判断目标值 `target` 是否在矩阵中。算法的时间复杂度必须为 $O(\log(mn))$。

[题目链接](https://leetcode.cn/problems/search-a-2d-matrix/)

### 示例

#### 示例 1

- 输入：`matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3`
- 输出：`true`

#### 示例 2

- 输入：`matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13`
- 输出：`false`

### 数据范围

- $1 \leq m,n \leq 100$
- $-10^4 \leq matrix[i][j], target \leq 10^4$
- 每行严格递增
- 每行首元素大于上一行末元素

<details class="note-solution">
<summary>查看解析</summary>

### 将矩阵视为有序数组

矩阵按行依次连接后是一个长度为 $mn$ 的严格递增数组。无需真的创建新数组：虚拟数组下标 `index` 对应矩阵坐标

$$
row=\left\lfloor\frac{index}{n}\right\rfloor,\qquad col=index\bmod n
$$

于是可以直接在虚拟下标 $[0,mn-1]$ 上二分查找。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int left = 0, right = m * n - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int value = matrix[mid / n][mid % n];
            if (value == target) {
                return true;
            }
            if (value < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return false;
    }
};
```

由于题目保证行内递增且下一行首元素大于上一行末元素，虚拟数组严格递增。每次比较都能排除不可能包含目标值的一半区间，因此循环返回 `true` 当且仅当矩阵含有 `target`。

- 时间复杂度：$O(\log(mn))$
- 空间复杂度：$O(1)$

### 易错点

- 列数是 `n`，因此坐标转换是 `mid / n` 和 `mid % n`。
- 本题条件强于“每行、每列分别递增”；只有满足相邻两行首尾衔接时，才能把整个矩阵看成一个有序数组。
- `right = m * n - 1` 对应左闭右闭区间，循环条件应为 `left <= right`。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-a-2d-matrix/solutions/)

## 34. 在排序数组中查找元素的第一个和最后一个位置

给定一个非递减数组 `nums` 和目标值 `target`，返回目标值在数组中第一次和最后一次出现的下标。如果目标值不存在，返回 `[-1,-1]`。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/)

### 示例

#### 示例 1

- 输入：`nums = [5,7,7,8,8,10], target = 8`
- 输出：`[3,4]`

#### 示例 2

- 输入：`nums = [5,7,7,8,8,10], target = 6`
- 输出：`[-1,-1]`

#### 示例 3

- 输入：`nums = [], target = 0`
- 输出：`[-1,-1]`

### 数据范围

- $0 \leq nums.length \leq 10^5$
- $-10^9 \leq nums[i], target \leq 10^9$
- `nums` 非递减

<details class="note-solution">
<summary>查看解析</summary>

### 两次边界查找

把问题拆成两个明确的边界：

- 左边界是第一个大于或等于 `target` 的位置；
- 右边界的后一位是第一个大于 `target` 的位置。

两个函数都在左闭右开区间 $[left,right)$ 上搜索。这样即使答案在数组末尾之后，也能返回 `nums.size()`。

```cpp
class Solution {
    int lowerBound(const vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

    int upperBound(const vector<int>& nums, int target) {
        int left = 0, right = nums.size();
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] <= target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }

public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int n = nums.size();
        int first = lowerBound(nums, target);
        if (first == n || nums[first] != target) {
            return {-1, -1};
        }
        return {first, upperBound(nums, target) - 1};
    }
};
```

`lowerBound` 结束时，`first` 左侧都小于目标值；若 `nums[first] == target`，它就是第一次出现的位置。`upperBound` 返回值左侧都小于或等于目标值，因此减一就是最后一次出现的位置。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

### 易错点

- 读取 `nums[first]` 前必须先判断 `first == nums.size()`，这是数组下标的外部边界。
- 不要在找到一次目标值后向两侧线性扫描，否则最坏时间复杂度会退化为 $O(n)$。
- `upperBound` 查找的是第一个严格大于目标值的位置，最终需要减一。
- 用 `lowerBound(target + 1)` 代替上界搜索可能产生整数溢出；直接实现 `upperBound` 更稳妥。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/solutions/)

## 33. 搜索旋转排序数组

一个由不同整数构成的严格递增数组，可能在某个下标处旋转。例如 `[0,1,2,4,5,6,7]` 旋转后可以变成 `[4,5,6,7,0,1,2]`。给定旋转后的数组 `nums` 和目标值 `target`，返回目标值的下标；不存在则返回 `-1`。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/search-in-rotated-sorted-array/)

### 示例

#### 示例 1

- 输入：`nums = [4,5,6,7,0,1,2], target = 0`
- 输出：`4`

#### 示例 2

- 输入：`nums = [4,5,6,7,0,1,2], target = 3`
- 输出：`-1`

#### 示例 3

- 输入：`nums = [1], target = 0`
- 输出：`-1`

### 数据范围

- $1 \leq nums.length \leq 5000$
- $-10^4 \leq nums[i], target \leq 10^4$
- `nums` 中的值互不相同
- `nums` 是一个严格递增数组旋转后的结果

<details class="note-solution">
<summary>查看解析</summary>

### 判断有序的一半

旋转数组整体不一定有序，但任取区间中点，左右两半中至少有一半保持有序：

- `nums[left] <= nums[mid]`，左半段有序；
- 否则右半段有序。

确定有序的一半后，就能通过端点判断 `target` 是否落在该半段的值域内。若在，保留该半段；否则舍弃它并搜索另一半。

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) {
                return mid;
            }

            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        return -1;
    }
};
```

每轮先排除 `mid`。剩余两半中至少一半有序，而有序半段的端点能够准确判断目标值是否属于它。算法始终保留可能含有目标值的一半，因此找到时返回正确下标；区间为空时，目标值不存在。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

### 易错点

- 判断左半段有序时需要使用 `<=`，单元素区间也应归入有序情况。
- 左半段目标值范围是 `nums[left] <= target && target < nums[mid]`，不能在两端都使用闭区间，因为 `mid` 已经比较过。
- 本题元素互不相同。若允许重复值，`nums[left] == nums[mid]` 时可能无法判断旋转点在哪一侧，需要额外处理。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-in-rotated-sorted-array/solutions/)

## 153. 寻找旋转排序数组中的最小值

一个由不同整数构成的严格递增数组被旋转了若干次。给定旋转后的数组 `nums`，返回其中的最小元素。算法的时间复杂度必须为 $O(\log n)$。

[题目链接](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/)

### 示例

#### 示例 1

- 输入：`nums = [3,4,5,1,2]`
- 输出：`1`

#### 示例 2

- 输入：`nums = [4,5,6,7,0,1,2]`
- 输出：`0`

#### 示例 3

- 输入：`nums = [11,13,15,17]`
- 输出：`11`

### 数据范围

- $1 \leq nums.length \leq 5000$
- $-5000 \leq nums[i] \leq 5000$
- `nums` 中的值互不相同
- `nums` 是一个严格递增数组旋转后的结果

<details class="note-solution">
<summary>查看解析</summary>

### 与区间末尾比较

在候选区间 $[left,right]$ 中，用 `nums[mid]` 与 `nums[right]` 比较：

- `nums[mid] > nums[right]`：`mid` 位于旋转前较大的那一段，最小值一定在 `mid` 右侧；
- `nums[mid] < nums[right]`：从 `mid` 到 `right` 递增，`mid` 可能就是最小值，因此保留 `mid`。

循环中 `mid < right`，并且数组元素互不相同，所以不会出现 `nums[mid] == nums[right]`。

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return nums[left];
    }
};
```

每次更新都保留最小值所在下标：第一种情况排除较大段及 `mid`，第二种情况排除 `mid` 右侧但保留可能为最小值的 `mid`。区间最终收缩到一个位置，该位置就是旋转点，也就是数组最小值。

- 时间复杂度：$O(\log n)$
- 空间复杂度：$O(1)$

### 易错点

- `right = mid` 不能写成 `mid - 1`，因为 `nums[mid] < nums[right]` 时 `mid` 可能正是最小值。
- 比较对象应是当前区间的 `nums[right]`，不是固定的数组末尾元素。
- 数组可能没有发生有效旋转，此时算法会收缩到下标 `0`。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/solutions/)

## 4. 寻找两个正序数组的中位数

给定两个非递减数组 `nums1` 和 `nums2`，返回它们合并后的中位数。要求算法的时间复杂度为 $O(\log(m+n))$。

[题目链接](https://leetcode.cn/problems/median-of-two-sorted-arrays/)

### 示例

#### 示例 1

- 输入：`nums1 = [1,3], nums2 = [2]`
- 输出：`2.00000`
- 解释：合并后为 `[1,2,3]`，中位数是 `2`

#### 示例 2

- 输入：`nums1 = [1,2], nums2 = [3,4]`
- 输出：`2.50000`
- 解释：合并后为 `[1,2,3,4]`，中位数是 $(2+3)/2=2.5$

### 数据范围

- $0 \leq m,n \leq 1000$
- $1 \leq m+n \leq 2000$
- $-10^6 \leq nums1[i], nums2[i] \leq 10^6$
- 两个数组都按非递减顺序排列

<details class="note-solution">
<summary>查看解析</summary>

### 在较短数组中寻找划分线

分别在两个数组中放置划分线。`nums1` 左侧取 `i` 个元素，`nums2` 左侧取 `j` 个元素，并令左侧元素总数为

$$
i+j=\left\lfloor\frac{m+n+1}{2}\right\rfloor
$$

这样奇数长度时左侧比右侧多一个元素，偶数长度时两侧数量相同。一个合法划分需要满足：

$$
nums1[i-1]\leq nums2[j],\qquad nums2[j-1]\leq nums1[i]
$$

也就是左侧所有元素都不大于右侧所有元素。固定 `i` 后，`j` 随之确定，因此只需在较短数组中二分 `i`：

- `nums1` 左边界过大，即 `left1 > right2`，需要减小 `i`；
- `nums2` 左边界过大，即 `left2 > right1`，需要增大 `i`；
- 两个条件都不成立，当前划分合法。

划分线落在数组边界时，用负无穷或正无穷补足缺失的边界值。

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) {
            return findMedianSortedArrays(nums2, nums1);
        }

        int m = nums1.size(), n = nums2.size();
        int left = 0, right = m;
        int leftSize = (m + n + 1) / 2;

        while (true) {
            int i = left + (right - left) / 2;
            int j = leftSize - i;
            int left1 = i == 0 ? INT_MIN : nums1[i - 1];
            int right1 = i == m ? INT_MAX : nums1[i];
            int left2 = j == 0 ? INT_MIN : nums2[j - 1];
            int right2 = j == n ? INT_MAX : nums2[j];

            if (left1 > right2) {
                right = i - 1;
                continue;
            }
            if (left2 > right1) {
                left = i + 1;
                continue;
            }
            if ((m + n) % 2 == 1) {
                return max(left1, left2);
            }
            return (max(left1, left2) + min(right1, right2)) / 2.0;
        }
    }
};
```

合法划分使左侧数量符合中位数定义，并保证左侧最大值不大于右侧最小值。总长度为奇数时，中位数是左侧最大值；总长度为偶数时，中位数是左侧最大值与右侧最小值的平均数。二分调整始终朝唯一的合法划分移动。

- 时间复杂度：$O(\log\min(m,n))$
- 空间复杂度：$O(1)$

### 易错点

- 必须在较短数组上二分，否则由 `j = leftSize - i` 得到的下标可能越界。
- 奇数长度时左侧要多放一个元素，所以使用 `(m + n + 1) / 2`。
- 空数组和划分线位于端点的情况由 `INT_MIN`、`INT_MAX` 统一处理。
- 偶数长度必须除以 `2.0`，避免整数除法。

</details>

### 参考

- [项目现有二分查找笔记](../techniques.md#binary-search-%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE)
- [灵茶山艾府：二分算法题单](https://leetcode.cn/discuss/post/3579164/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/median-of-two-sorted-arrays/solutions/)
