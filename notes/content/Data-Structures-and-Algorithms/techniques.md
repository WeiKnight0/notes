---
title: Techniques 算法技巧
date: 2026-07-10
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## Binary Search 二分查找

二分查找（Binary Search）是一种在有序数组中查找特定元素的高效算法。它通过反复将搜索区间减半来快速定位目标元素的位置。二分查找的时间复杂度为 $O(\log n)$，远优于线性查找的 $O(n)$。

核心介绍视频：[二分查找 红蓝染色法](https://www.bilibili.com/video/BV1AP41137w7)

对于二分查找的实现，主要有三种区间划分方式，每种方式又分为第一个 大于等于、大于、小于等于、小于 `target`四种情况。
下面给出大于等于的代码。其余情况可以转化成大于等于。
#### 情况1：`[left, right]` 左闭右闭区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标（lower_bound），找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1;    // [mid+1, right]
        } else {
            right = mid - 1;   // [left, mid-1]
        }
    }
    if (left == n){ // 如果找不到，最终left一定在数组外面
        return -1;
    }
    return left;
}
```
#### 情况2：`[left, right)` 左闭右开区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标，找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = 0, right = n; // [left, right)
    
    while (left < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1; // 搜索右半部分 [mid+1, right)
        } else {
            right = mid; // 搜索左半部分 [left, mid)
        }
    }
    if (left == n){
        return -1;
    }
    return left; // 也可以return right
}
```
#### 情况3：`(left, right)` 左开右开区间
```cpp
// 在arr[0..n-1]中查找第一个大于等于target的元素下标（lower_bound），找不到返回-1
int binary_search_lower_bound(int arr[], int n, int target) {
    int left = -1, right = n; // (left, right)
    
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid; // 搜索右半部分 (mid, right)
        } else {
            right = mid; // 搜索左半部分 (left, mid)
        }
    }
    if (right == n) {
        return -1; // 没有不小于target的元素
    }
    return right;
}
```

#### 关键：循环不变量
二分查找的循环不变量和题目本身密切相关，不能完全套模板。核心要求在于：**确保 `target` 总是会在规定的区间内**，并且在每次迭代后正确更新区间边界以保持这个不变量。

注意，**循环不变量关心的是区间外的元素**，而不是区间内的元素。例如，left的左边永远小于target，right的右边永远大于等于target。这样才能保证在循环结束时，left和right指向的区间内包含target。

一定要分三种情况来分析循环不变量：`arr[mid] < target`、`arr[mid] == target`、`arr[mid] > target`。对于每种情况，分析 `target` 在哪个区间内，并更新 `left` 和 `right` 来保持循环不变量。为了保证准确，可以不合并 `arr[mid] == target` 的情况。

例1：查找 `target` 的下标
- 循环不变量：`target` 在 `[left, right]` 内
- 更新：如果 `arr[mid] < target`，则 `left = mid + 1`；若 `arr[mid] > target`，则 `right = mid - 1`；若 `arr[mid] == target`，则直接返回 `mid`。
```cpp
int binary_search(int arr[], int n, int target) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < target) {
            left = mid + 1;    // [mid+1, right]
        } else if (arr[mid] > target) {
            right = mid - 1;   // [left, mid-1]
        } else {
            return mid; // 找到目标元素，返回下标
        }
    }
    return -1; // 没有找到目标元素
}
```
例2：
已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次 旋转 后，得到输入数组。例如，原数组 nums = [0,1,2,4,5,6,7] 在变化后可能得到：
若旋转 4 次，则可以得到 [4,5,6,7,0,1,2]
若旋转 7 次，则可以得到 [0,1,2,4,5,6,7]
注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次 的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]] 。

给你一个元素值 互不相同 的数组 nums ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 最小元素 。

你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。
- 关键：循环不变量：最小值的下标 在 `[left, right]` 内
- 更新：如果 `arr[mid] < arr[right]`，则 `right = mid`（**注意：这里不能是 `right = mid - 1`！因为mid可能就是最小值的下标**）；若 `arr[mid] > arr[right]`，则 `left = mid + 1`（**注意这里要加1，因为mid不可能是最小值的下标**）；若 `arr[mid] == arr[right]`，则 `return mid`，因为此时 `mid` 就是最小值的下标。
- 注意，对于高手，可以把 `arr[mid] == arr[right]` 的情况合并到 `arr[mid] > arr[right]` 中，因为当 `arr[mid] == arr[right]` 时，`mid` 就是最小值的下标，此时 `left = mid + 1` 也不会错，此时 `left == right + 1`，循环结束后 `right` 就是最小值的下标。但不建议这样写，因为不够直观，容易出错。
```cpp
int findMin(int arr[], int n) {
    int left = 0, right = n - 1; // [left, right]
    
    while (left < right) { // 注意这里是 <，而不是 <=
        int mid = left + (right - left) / 2;
        
        if (arr[mid] < arr[right]) {
            right = mid; // 最小值在 [left, mid]
        } else if (arr[mid] > arr[right]) {
            left = mid + 1; // 最小值在 [mid+1, right]
        } else {
            return mid; // arr[mid] == arr[right]，mid就是最小值的下标
        }
    }
    return right; // 循环结束后，left == right，指向最小值的下标
}
```

### STL中的二分查找
在 C++ STL 中，二分查找相关的函数主要有 `std::lower_bound` 和 `std::upper_bound`。这些函数都要求输入的范围是有序的。
- `lower_bound(first, last, num)`：返回第一个 **不小于（大于等于）** 目标值的元素位置。
- `upper_bound(first, last, num)`：返回第一个 **大于** 目标值的元素位置。
注意，这两个函数返回的是指针或迭代器；此外，如果目标值不存在，`lower_bound` 返回的是第一个大于目标值的位置。
两个函数的输入均为 **左闭右开区间** `[first, last)`。
```cpp
int arr[] = {1, 2, 2, 3, 4};
int n = 5;
int* lower = std::lower_bound(arr, arr + n, 2); // 指向第一个2的位置
int* upper = std::upper_bound(arr, arr + n, 2); // 指向第一个大于2的位置（即3的位置）
```
```cpp
// 查找第一个不小于target的元素下标
int lower_bound_search(int arr[], int n, int target) {
    int* it = std::lower_bound(arr, arr + n, target);
    if (it != arr + n && *it == target) {
        return it - arr;
    }
    return -1;
}
```
```cpp
// 查找第一个大于target的元素的前一个下标（即最后一个等于target的元素下标）
int upper_bound_search(int arr[], int n, int target) {
    int* it = std::upper_bound(arr, arr + n, target);
    if (it != arr && *(it - 1) == target) {
        return (it - 1) - arr;
    }
    return -1;
}
```
此外，还有 `std::binary_search` 函数，用于判断一个元素是否存在于有序范围内。
```cpp
bool is_exist(int arr[], int n, int target) {
    return std::binary_search(arr, arr + n, target);
}
```

### 二分答案
当问题的答案具有**单调性**、有明确的`check()`函数、答案范围明确（一般是闭区间`[left, right]`）时，就可以尝试二分答案。

主要分为以下两种情况：
- 找最大值的`true`，`check()`随`x`增大从`true`变为`false`
代码示例：
```cpp
int binary_search_max(int left, int right) { // [left, right]
    while (left <= right) {
        int mid = left + (right - left + 1) / 2; // 向上取整
        if (check(mid)) { // check()随x增大从true变为false
            left = mid + 1; // [mid, right]
        } else {
            right = mid - 1; // [left, mid-1]
        }
    }
    return right;
}
```
- 找最小值，`check()`随`x`增大从`false`变为`true`
代码示例：
```cpp
int binary_search_min(int left, int right) { // [left, right]
    while (left <= right) {
        int mid = left + (right - left) / 2; // 向下取整
        if (check(mid)) { // check()随x增大从false变为true
            right = mid - 1; // [left, mid]
        } else {
            left = mid + 1; // [mid+1, right]
        }
    }
    return left;
}
```
总结表格：
| 问题类型 | check(x) 单调性 | 目标答案 | 状态更新 | 循环结束时状态 | 返回值 |
|---------|----------------|----------|----------|----------------|---------|
| **最大化问题**<br>(找最大的可行x) | `[T, T, ..., T, F, F, ..., F]`<br>x增大从true变false | 最后一个true | `if(check(mid)) l=mid+1;`<br>`else r=mid-1;` | `l` → 第一个false<br>`r` → 最后一个true | **`r`** |
| **最小化问题**<br>(找最小的可行x) | `[F, F, ..., F, T, T, ..., T]`<br>x增大从false变true | 第一个true | `if(check(mid)) r=mid-1;`<br>`else l=mid+1;` | `l` → 第一个true<br>`r` → 最后一个false | **`l`** |

## Two Pointers 双指针

双指针是一类用两个位置变量协同移动来减少枚举量的技巧。

### 双指针

| 类型 | 适用场景 | 代表题 |
| --- | --- | --- |
| 同向双指针 | 原地整理、按条件分区 | 移动零 |
| 倒序双指针 | 正向写会覆盖未处理数据 | 复写零 |
| 快慢指针 | 判环、中点、循环过程 | 快乐数 |
| 对撞指针 | 左右夹逼、舍弃不可能答案 | 盛最多水的容器 |
| 排序 + 对撞指针 | 两数/三数求和、去重 | 三数之和 |
| 三指针 | 同时维护三个单调位置或边界 | 等差三元组、区间子数组个数 |

#### Move Zeroes 移动零

题目描述：给定一个整数数组 `nums`，将所有 `0` 移动到数组末尾，同时保持非零元素的相对顺序。

要求：必须在原数组上操作，不能复制一个额外数组。

示例：

**示例 1：**

- 输入：`nums = [0,1,0,3,12]`

- 输出：`[1,3,12,0,0]`

**示例 2：**

- 输入：`nums = [0]`

- 输出：`[0]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- `cur` 从左到右扫描数组。
- `dest` 表示下一个非零元素应该放的位置。
- 遇到非零元素，就和 `dest` 位置交换，然后 `dest++`。

区间含义：
- `[0, dest)`：已经放好的非零元素。
- `[dest, cur)`：已经处理过的零元素。
- `[cur, n)`：还没处理的元素。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    int dest = 0;
    for (int cur = 0; cur < n; cur++) {
        if (nums[cur] != 0) {
            swap(nums[dest], nums[cur]);
            dest++;
        }
    }

    for (int i = 0; i < n; i++) {
        if (i > 0) {
            cout << ' ';
        }
        cout << nums[i];
    }
    cout << '\n';

    return 0;
}
```

</details>

#### Duplicate Zeros 复写零

题目描述：给定一个固定长度的整数数组 `arr`，把数组中出现的每个 `0` 都复写一遍，并把后面的元素向右平移。

要求：数组长度不变，超出数组长度的位置直接丢弃；必须原地修改数组，不返回新数组。

示例：

**示例 1：**

- 输入：`arr = [1,0,2,3,0,4,5,0]`

- 输出：`[1,0,0,2,3,0,0,4]`

- 解释：最后一个 0 复写后会超过数组长度，因此被丢弃。

**示例 2：**

- 输入：`arr = [1,2,3]`

- 输出：`[1,2,3]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- `i` 从右到左扫描数组。**从右到左是因为如果从左到右，会覆盖后面的元素。如果是新开一个数组则可以使用，但题目要求原地修改**。
- `j` 表示在复写0后的新数组中，`i` 位置的元素应该对应的位置。
- 如果 `j` 越界了，则不复制；否则复制 `arr[i]` 到 `arr[j]` 处。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> a(n);
    for (int &x : a) cin >> x;

    int cnt = 0;
    for (int x : a)
        if (x == 0) cnt++; // 0 的个数

    int i = n - 1;
    int j = n + cnt - 1; // 新数组长为 n+cnt，最后一个位置为 n+cnt-1

    while (i >= 0) {
        if (a[i] == 0) {
            if (j < n) a[j] = 0;
            j--;

            if (j < n) a[j] = 0;
            j--;

            i--;
        } else {
            if (j < n) a[j] = a[i];
            i--;
            j--;
        }
    }

    for (int i = 0; i < n; i++) {
        cout << a[i] << (i == n - 1 ? '\n' : ' ');
    }

    return 0;
}
```

</details>

#### Happy Number 快乐数

题目描述：编写一个算法判断正整数 `n` 是否是快乐数。

快乐数定义：每次把 `n` 替换为它每一位数字的平方和，重复这个过程。如果最终变成 `1`，那么它是快乐数；如果进入无限循环且始终无法变成 `1`，那么它不是快乐数。

示例：

**示例 1：**

- 输入：`n = 19`

- 输出：`true`

- 解释：`1^2 + 9^2 = 82 → 8^2 + 2^2 = 68 → 6^2 + 8^2 = 100 → 1^2 + 0^2 + 0^2 = 1`

**示例 2：**

- 输入：`n = 2`

- 输出：`false`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 把每次变化看成链表中的“下一个节点”。
- 如果不是快乐数，变化过程会进入环。
- 用快慢指针判环：`slow` 每次走一步，`fast` 每次走两步。
- 相遇后判断相遇点是否为 `1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int nextNumber(int n) {
    int sum = 0;
    while (n > 0) {
        int digit = n % 10;
        sum += digit * digit;
        n /= 10;
    }
    return sum;
}

int main() {
    int n;
    cin >> n;

    int slow = n;
    int fast = nextNumber(n);

    while (slow != fast) {
        slow = nextNumber(slow);
        fast = nextNumber(nextNumber(fast));
    }

    cout << (slow == 1 ? "true" : "false") << '\n';
    return 0;
}
```

</details>

#### Container With Most Water 盛最多水的容器

题目描述：给定一个长度为 `n` 的整数数组 `height`。第 `i` 条垂线的两个端点是 `(i, 0)` 和 `(i, height[i])`。选择其中两条线，使它们和 x 轴共同构成一个容器，返回容器可以容纳的最大水量。

注意：容器不能倾斜。

示例：

**示例 1：**

- 输入：`height = [1,8,6,2,5,4,8,3,7]`

- 输出：`49`

- 解释：选择高度为 8 和 7 的两条线，宽度为 7，面积为 min(8, 7) * 7 = 49。

**示例 2：**

- 输入：`height = [1,1]`

- 输出：`1`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 左右指针分别指向两端。
- 当前面积是 `min(height[left], height[right]) * (right - left)`。
- 每次移动较短的一边。如果固定较短边并向内移动另一边，宽度变小，高度上限仍然不超过较短边，所以面积不可能变大。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> height(n);
    for (int i = 0; i < n; i++) {
        cin >> height[i];
    }

    int left = 0;
    int right = n - 1;
    int ans = 0;

    while (left < right) {
        int h = min(height[left], height[right]);
        int w = right - left;
        ans = max(ans, h * w);

        if (height[left] < height[right]) {
            left++;
        } else {
            right--;
        }
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

#### Three Sum 三数之和

题目描述：给定一个整数数组 `nums`，判断是否存在三元组 `[nums[i], nums[j], nums[k]]`，满足 `i != j`、`i != k`、`j != k`，并且 `nums[i] + nums[j] + nums[k] == 0`。

返回所有和为 `0` 且不重复的三元组。答案中不能包含重复三元组，输出顺序不限。

示例：

**示例 1：**

- 输入：`nums = [-1,0,1,2,-1,-4]`

- 输出：`[[-1,-1,2],[-1,0,1]]`

- 解释：`-1 + 0 + 1 = 0`、`0 + 1 + (-1) = 0`、`-1 + 2 + (-1) = 0`；去重后答案为 `[-1,-1,2]` 和 `[-1,0,1]`。

**示例 2：**

- 输入：`nums = [0,1,1]`

- 输出：`[]`

**示例 3：**

- 输入：`nums = [0,0,0]`

- 输出：`[[0,0,0]]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 先排序。
- 枚举第一个数 `nums[i]`。
- 在右侧区间用左右指针找两数之和 `-nums[i]`。
- 对 `i`、`left`、`right` 都要去重。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    sort(nums.begin(), nums.end());
    vector<vector<int>> ans;

    for (int i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) {
            continue;
        }
        if (nums[i] > 0) {
            break;
        }

        int left = i + 1;
        int right = n - 1;
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

    for (auto &triple : ans) {
        cout << triple[0] << ' ' << triple[1] << ' ' << triple[2] << '\n';
    }

    return 0;
}
```

</details>

### Three Pointers 三指针

三指针在一次扫描中同时维护三个位置，并利用有序性或边界的单调变化，避免指针回退。只要每个指针从头到尾最多移动 $n$ 次，总时间复杂度仍然是 $O(n)$。

常见形式：

| 形式 | 三个位置的含义 | 计数方式 |
| --- | --- | --- |
| 三个有序值 | 分别寻找三元组的第一、第二、第三项 | 三个值同时满足关系时计数 |
| 一个右端点 + 两个边界 | 枚举子数组右端点，维护合法起点范围 | 合法起点区间长度 |
| 三个有序序列 | 每个指针指向一个序列的当前元素 | 移动当前值最小的指针 |

“三数之和”虽然也使用 `i`、`left`、`right` 三个位置，但 `left` 和 `right` 会随每个 `i` 重新扫描，因此复杂度为 $O(n^2)$。下面的等差三元组中，三个指针在整个算法中都不回退，所以复杂度为 $O(n)$。

#### Arithmetic Triplets 等差三元组的数目

题目描述：给定一个严格递增数组 `nums` 和正整数 `diff`，统计满足下列条件的三元组 `(i, j, k)` 数量：

$$
i<j<k,\quad nums[j]-nums[i]=diff,\quad nums[k]-nums[j]=diff
$$

示例：

**示例 1：**

- 输入：`nums = [0,1,4,6,7,10], diff = 3`

- 输出：`2`

- 解释：满足条件的是 (1,4,7) 和 (4,7,10)。

<details class="note-solution">
<summary>查看解析</summary>

枚举第三项 `nums[k]` 时，前两项只能是 `nums[k] - 2 * diff` 和 `nums[k] - diff`：

- `j` 指向第一个不小于 `nums[k] - diff` 的元素。
- 只有 `nums[j] == nums[k] - diff` 时，才继续寻找第一项。
- `i` 指向第一个不小于 `nums[j] - diff` 的元素。
- 数组严格递增，因此每个目标值至多出现一次；随着 `k` 增大，两个目标值也增大，`i` 和 `j` 都不需要回退。

```cpp
int arithmeticTriplets(const vector<int>& nums, int diff) {
    int ans = 0;
    int i = 0;
    int j = 0;

    for (int k = 0; k < nums.size(); k++) {
        while (nums[j] < nums[k] - diff) {
            j++;
        }
        if (nums[j] != nums[k] - diff) {
            continue;
        }

        while (nums[i] < nums[j] - diff) {
            i++;
        }
        if (nums[i] == nums[j] - diff) {
            ans++;
        }
    }

    return ans;
}
```

三个指针都只向右移动，时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

</details>

#### Number of Subarrays with Bounded Maximum 区间子数组个数

题目描述：给定数组 `nums` 和两个整数 `lower`、`upper`，统计最大元素位于闭区间 `[lower, upper]` 的非空连续子数组数量。

示例：

**示例 1：**

- 输入：`nums = [2,1,4,3], lower = 2, upper = 3`

- 输出：`3`

- 解释：满足条件的子数组是 [2]、[2,1] 和 [3]。

<details class="note-solution">
<summary>查看解析</summary>

枚举子数组右端点 `right`，另外维护两个位置：

- `lastInvalid`：最近一个大于 `upper` 的元素位置。子数组左端点必须在它右侧，否则最大值会超过 `upper`。
- `lastInRange`：最近一个位于 `[lower, upper]` 的元素位置。子数组左端点不能在它右侧，否则子数组中的所有值都可能小于 `lower`。

因此，对于固定的 `right`，合法左端点满足：

$$
lastInvalid<left\le lastInRange
$$

本轮新增的合法子数组数量为：

$$
\max(0,lastInRange-lastInvalid)
$$

以示例为例：

| `right` | `nums[right]` | `lastInvalid` | `lastInRange` | 新增数量 |
| ---: | ---: | ---: | ---: | ---: |
| 0 | 2 | -1 | 0 | 1 |
| 1 | 1 | -1 | 0 | 1 |
| 2 | 4 | 2 | 0 | 0 |
| 3 | 3 | 2 | 3 | 1 |

```cpp
int numSubarrayBoundedMax(const vector<int>& nums, int lower, int upper) {
    int ans = 0;
    int lastInvalid = -1;
    int lastInRange = -1;

    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] > upper) {
            lastInvalid = right;
        }
        if (nums[right] >= lower && nums[right] <= upper) {
            lastInRange = right;
        }
        ans += max(0, lastInRange - lastInvalid);
    }

    return ans;
}
```

`right`、`lastInvalid` 和 `lastInRange` 都单调向右，时间复杂度为 $O(n)$，额外空间复杂度为 $O(1)$。

同类题：

- [2563. 统计公平数对的数目](https://leetcode.cn/problems/count-the-number-of-fair-pairs/)：排序后同时维护满足和的下界与上界。
- [2444. 统计定界子数组的数目](https://leetcode.cn/problems/count-subarrays-with-fixed-bounds/)：维护最近的非法位置、`minK` 位置和 `maxK` 位置。
- [1213. 三个有序数组的交集](https://leetcode.cn/problems/intersection-of-three-sorted-arrays/)：每个数组各使用一个指针。

</details>

### 常见坑

- 是否需要排序：三数之和这类题通常需要先排序，移动零不需要。
- 是否需要去重：返回方案列表时通常需要去重；只返回数量或最大值时不一定需要。
- 指针移动条件必须来自单调性，否则不能随便移动。
- 原地写数组时，先判断正向写会不会覆盖未处理数据；如果会，考虑倒序写。
- 快慢指针不只用于链表，也可以用于任何会进入循环的状态转移过程。

### 参考

- [LeetCode 2367. 等差三元组的数目](https://leetcode.cn/problems/number-of-arithmetic-triplets/)
- [LeetCode 795. 区间子数组个数](https://leetcode.cn/problems/number-of-subarrays-with-bounded-maximum/)
- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/0viNMK/)

## Sliding Window 滑动窗口

滑动窗口用于处理数组或字符串中的连续子数组、连续子串问题。核心思想是维护一个区间 `[left, right]`，让右端点扩展窗口，让左端点在需要时收缩窗口，从而避免重复计算。

### 滑动窗口适用场景

常见信号：
- 题目要求连续子数组或连续子串。
- 需要求最长、最短、最大、最小。
- 需要统计满足条件的连续区间个数。
- 暴力枚举所有区间是 $O(n^2)$，但窗口状态可以增量维护。

常见类型：
- 定长滑动窗口：窗口长度固定为 `k`。
- 不定长滑动窗口：窗口长度变化，通过条件决定何时移动 `left`。
- 计数型滑动窗口：统计满足条件的子数组或子字符串个数。
- 恰好型滑动窗口：把“恰好 k”转换成“至多 k”或“至少 k”的差。

### 定长滑动窗口

定长滑动窗口用于计算长度恰好为 `k` 的子数组或子串中的某个属性，例如和、最大值、字符个数等。

三步法：
1. **入**：下标为 `right` 的元素进入窗口，更新统计量。
2. **更新**：窗口长度达到 `k` 后，更新答案。
3. **出**：下标为 `right - k + 1` 的元素离开窗口，更新统计量。

#### 1456. 定长子串中元音的最大数目

题目来源：[1456. 定长子串中元音的最大数目](https://leetcode.cn/problems/maximum-number-of-vowels-in-a-substring-of-given-length/description/)

题目描述：给你字符串 `s` 和整数 `k`，请返回字符串 `s` 中长度为 `k` 的单个子字符串中可能包含的最大元音字母数。英文中的元音字母为 `a`、`e`、`i`、`o`、`u`。

示例：

**示例 1：**

- 输入：`s = "abciiidef", k = 3`

- 输出：`3`

- 解释：子字符串 `"iii"` 包含 3 个元音字母。

**示例 2：**

- 输入：`s = "aeiou", k = 2`

- 输出：`2`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- `right` 从左到右扫描，每次把 `s[right]` 加入窗口。
- 当窗口长度达到 `k` 时，用当前元音个数更新答案。
- 更新后移出窗口最左侧字符。

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isVowel(char c) {
    return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
}

int main() {
    string s;
    int k;
    cin >> s >> k;

    int ans = 0;
    int cur = 0;
    int n = s.size();

    for (int right = 0; right < n; right++) {
        if (isVowel(s[right])) {
            cur++; // 入
        }

        int left = right - k + 1;
        if (left < 0) {
            continue; // 没有形成窗口
        }

        ans = max(ans, cur); // 更新

        if (isVowel(s[left])) {
            cur--; // 出
        }
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

### 不定长滑动窗口

不定长滑动窗口用两个指针维护 `[left, right]`。右端点负责扩大窗口，左端点负责在窗口不满足或已经满足某个条件时收缩窗口。

关键是判断窗口的合法性如何随长度变化：
- 窗口越短越容易合法：通常用于求最长。
- 窗口越长越容易合法：通常用于求最短。

#### 3. 无重复字符的最长子串

题目来源：[3. 无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/)

题目描述：给定一个字符串 `s`，请你找出其中不含有重复字符的最长子串的长度。

示例：

**示例 1：**

- 输入：`s = "abcabcbb"`

- 输出：`3`

- 解释：答案是 "abc"，长度为 3。

**示例 2：**

- 输入：`s = "bbbbb"`

- 输出：`1`

- 解释：答案是 "b"，长度为 1。

**示例 3：**

- 输入：`s = "pwwkew"`

- 输出：`3`

- 解释：答案是 "wke"，长度为 3。

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 右端点扩展窗口，并记录字符出现次数。
- 如果 `s[right]` 出现次数超过 `1`，说明窗口不合法，移动 `left` 直到合法。
- 每次窗口合法后更新最大长度。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;

    unordered_map<char, int> cnt;
    int ans = 0;
    int left = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right]]++;

        while (cnt[s[right]] > 1) {
            cnt[s[left]]--;
            left++;
        }

        ans = max(ans, right - left + 1);
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

#### 2904. 最短且字典序最小的美丽子字符串

题目来源：[2904. 最短且字典序最小的美丽子字符串](https://leetcode.cn/problems/shortest-and-lexicographically-smallest-beautiful-string/description/)

题目描述：给你一个二进制字符串 `s` 和一个正整数 `k`。如果 `s` 的某个子字符串中 `1` 的个数恰好等于 `k`，则称这个子字符串是美丽子字符串。返回长度最短且字典序最小的美丽子字符串；如果不存在，返回空字符串。

示例：

**示例 1：**

- 输入：`s = "100011001", k = 3`

- 输出：`"11001"`

- 解释：包含 3 个 1 的最短子字符串有 "10001" 和 "11001"，字典序更小的是 "11001"。

**示例 2：**

- 输入：`s = "1011", k = 2`

- 输出：`"11"`

**示例 3：**

- 输入：`s = "000", k = 1`

- 输出：`""`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 右端点扩展窗口，维护窗口内 `1` 的数量。
- 当 `1` 的数量超过 `k`，或者左端点是多余的 `0`，就移动 `left`。
- 当窗口内 `1` 的数量等于 `k` 时，用当前子串更新答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    int k;
    cin >> s >> k;

    if (count(s.begin(), s.end(), '1') < k) {
        cout << "" << '\n';
        return 0;
    }

    string ans = s;
    int left = 0;
    int cnt = 0;

    for (int right = 0; right < (int)s.size(); right++) {
        if (s[right] == '1') {
            cnt++;
        }

        while (cnt > k || s[left] == '0') {
            if (s[left] == '1') {
                cnt--;
            }
            left++;
        }

        if (cnt == k) {
            string cur = s.substr(left, right - left + 1);
            if (cur.size() < ans.size() ||
                (cur.size() == ans.size() && cur < ans)) {
                ans = cur;
            }
        }
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

### 求子数组个数

计数型滑动窗口通常不是只更新最大/最小值，而是一次性统计以 `right` 为右端点的多个合法区间。

#### 越短越合法：713. 乘积小于 K 的子数组

题目来源：[713. 乘积小于 K 的子数组](https://leetcode.cn/problems/subarray-product-less-than-k/description/)

题目描述：给你一个整数数组 `nums` 和一个整数 `k`，请返回子数组内所有元素的乘积严格小于 `k` 的连续子数组数目。

示例：

**示例 1：**

- 输入：`nums = [10,5,2,6], k = 100`

- 输出：`8`

- 解释：满足条件的子数组为 [10], [5], [2], [6], [10,5], [5,2], [2,6], [5,2,6]。

**示例 2：**

- 输入：`nums = [1,2,3], k = 0`

- 输出：`0`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 窗口乘积小于 `k` 时合法。
- 如果乘积大于等于 `k`，移动 `left` 缩小窗口。
- 内层循环结束后，`[left, right]` 合法；由于越短越容易合法，所以 `[left, right]`、`[left + 1, right]`、...、`[right, right]` 都合法。
- 因此每次贡献 `right - left + 1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    if (k <= 1) {
        cout << 0 << '\n';
        return 0;
    }

    long long product = 1;
    int ans = 0;
    int left = 0;

    for (int right = 0; right < n; right++) {
        product *= nums[right];

        while (product >= k) {
            product /= nums[left];
            left++;
        }

        ans += right - left + 1;
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

#### 越长越合法：1358. 包含所有三种字符的子字符串数目

题目来源：[1358. 包含所有三种字符的子字符串数目](https://leetcode.cn/problems/number-of-substrings-containing-all-three-characters/description/)

题目描述：给你一个字符串 `s`，它只包含 `a`、`b`、`c` 三种字符。请返回 `a`、`b`、`c` 都至少出现过一次的子字符串数目。

示例：

**示例 1：**

- 输入：`s = "abcabc"`

- 输出：`10`

**示例 2：**

- 输入：`s = "aaacb"`

- 输出：`3`

**示例 3：**

- 输入：`s = "abc"`

- 输出：`1`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 窗口越长，越容易同时包含 `a`、`b`、`c`。
- 当窗口已经包含三种字符时，持续移动 `left`，直到窗口不再合法。
- 内层循环结束后，最后一个被移出的左端点 `left - 1` 对应的窗口是合法的。
- 因此以 `right` 为右端点时，左端点在 `[0, left - 1]` 的子字符串都合法，贡献 `left`。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;

    int ans = 0;
    int left = 0;
    int cnt[3]{};

    for (int right = 0; right < (int)s.size(); right++) {
        cnt[s[right] - 'a']++;

        while (cnt[0] && cnt[1] && cnt[2]) {
            cnt[s[left] - 'a']--;
            left++;
        }

        ans += left;
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

### 恰好型滑动窗口

“恰好”等于某个值的滑动窗口题，常常可以转化为两个“至多”或两个“至少”的问题相减。

例如，计算元素和恰好等于 `k` 的子数组个数，可以转化为：
- 元素和至少为 `k` 的子数组个数。
- 元素和至少为 `k + 1` 的子数组个数。
- 答案是 `atLeast(k) - atLeast(k + 1)`。

也可以转化为：
- 元素和至多为 `k` 的子数组个数。
- 元素和至多为 `k - 1` 的子数组个数。
- 答案是 `atMost(k) - atMost(k - 1)`。

选择“至少”还是“至多”，取决于题目中哪个方向更容易维护窗口合法性。

### 常见坑

- 先判断题目是否要求连续子数组或连续子串。
- 定长窗口通常是“入、更新、出”。
- 不定长窗口要明确什么时候移动 `left`。
- 计数型题目要判断贡献是 `right - left + 1` 还是 `left`。
- 恰好型题目通常不要硬写复杂窗口，可以转成两个至多或两个至少。

## Prefix Sum and Difference 前缀和与差分

给定长度为 $n$ 的数组 $a[0\ldots n-1]$，定义长度为 $n+1$ 的前缀和数组 $s$：

$$
s[0]=0,\qquad s[i+1]=s[i]+a[i]\quad(0\le i<n)
$$

因此，$s[i]$ 表示原数组前 $i$ 个元素之和：

$$
s[i]=\sum_{k=0}^{i-1}a[k]
$$

闭区间 $[l,r]$ 的元素和为：

$$
\sum_{k=l}^{r}a[k]=s[r+1]-s[l]
$$

```cpp
// sum[i] 表示前 i 个数的求和
vector<int> buildPrefix(const vector<int>& arr) {
    int n = arr.size();
    vector<int> sum(n + 1);
    for (int i = 0; i < n; i++) {
        sum[i + 1] = sum[i] + arr[i];
    }
    return sum;
}

int rangeSum(const vector<int>& sum, int l, int r) {
    return sum[r + 1] - sum[l]; // 返回 arr[l]~arr[r]的求和
}
```

#### 560. 和为 K 的子数组

题目来源：[560. 和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/description/)

题目描述：给你一个整数数组 `nums` 和一个整数 `k`，请统计并返回数组中和为 `k` 的连续子数组个数。

示例：

**示例 1：**

- 输入：`nums = [1,1,1], k = 2`

- 输出：`2`

**示例 2：**

- 输入：`nums = [1,2,3], k = 3`

- 输出：`2`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 设当前前缀和为 `sum`。
- 如果存在之前的前缀和 `sum - k`，那么从那个位置之后到当前位置的子数组和就是 `k`。
- 用 `unordered_map<long long, int>` 统计每种前缀和出现过几次。
- 初始 `cnt[0] = 1`，表示空前缀，方便统计从下标 `0` 开始的子数组。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long k;
    cin >> n >> k;

    unordered_map<long long, int> cnt;
    cnt[0] = 1;

    long long sum = 0;
    int ans = 0;

    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        sum += x;

        if (cnt.count(sum - k)) {
            ans += cnt[sum - k];
        }
        cnt[sum]++;
    }

    cout << ans << '\n';
    return 0;
}
```

</details>

### 一维差分

给定长度为 $n$ 的数组 $a[0\ldots n-1]$，定义差分数组 $d$：

$$
d[i]=
\begin{cases}
a[0], & i=0 \\
a[i]-a[i-1], & 1\le i<n
\end{cases}
$$

实际实现额外令 $d[n]=0$，作为区间结束位置的哨兵。

原数组可以由差分数组的前缀和恢复：

$$
a[i]=\sum_{k=0}^{i}d[k]
$$

将闭区间 $[l,r]$ 中的每个元素增加 $x$，只需修改变化开始和结束的位置：

$$
d[l]\mathrel{+}=x,\qquad d[r+1]\mathrel{-}=x
$$

代码让 `diff` 的长度为 $n+1$，最后一项作为哨兵，因此 `r = n - 1` 时也不需要单独判断。

```cpp
vector<int> buildDifference(const vector<int>& arr) {
    int n = arr.size();
    vector<int> diff(n + 1); // diff[n]只是为了rangeAdd的时候r+1不会越界
    diff[0] = arr[0];
    for (int i = 1; i < n; i++) {
        diff[i] = arr[i] - arr[i - 1];
    }
    return diff;
}

void rangeAdd(vector<int>& diff, int l, int r, int x) {
    // 增加
    diff[l] += x;
    diff[r + 1] -= x;
}

vector<int> restoreArray(const vector<int>& diff) {
    // 使用前缀和恢复原数组，但是注意第一个元素不是0而是diff[0]，与标准前缀和有差别
    int n = diff.size() - 1;
    vector<int> arr(n);
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += diff[i];
        arr[i] = sum;
    }
    return arr;
}
```

#### 1109. 航班预订统计

题目来源：[1109. 航班预订统计](https://leetcode.cn/problems/corporate-flight-bookings/description/)

题目描述：这里有 `n` 个航班，编号从 `1` 到 `n`。给你若干条预订记录 `bookings[i] = [first, last, seats]`，表示从 `first` 到 `last` 的每个航班都预订了 `seats` 个座位。请返回每个航班被预订的座位总数。

示例：

**示例 1：**

- 输入：`bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5`

- 输出：`[10,55,45,25,25]`

**示例 2：**

- 输入：`bookings = [[1,2,10],[2,2,15]], n = 2`

- 输出：`[10,25]`

<details class="note-solution">
<summary>查看解析</summary>

思路：
- 题目中的航班编号从 1 开始，读入后减 1，内部统一使用 0 下标。
- 每条预订记录都是一次闭区间加法。
- 最后对差分数组求前缀和，得到每个航班的座位数。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    vector<int> diff(n + 1);
    for (int i = 0; i < m; i++) {
        int first, last, seats;
        cin >> first >> last >> seats;
        first--;
        last--;
        diff[first] += seats;
        diff[last + 1] -= seats;
    }

    int cur = 0;
    for (int i = 0; i < n; i++) {
        cur += diff[i];
        if (i > 0) {
            cout << ' ';
        }
        cout << cur;
    }
    cout << '\n';

    return 0;
}
```

</details>

### 二维前缀和

给定 $m$ 行 $n$ 列的矩阵 $a$，原矩阵从 `a[0][0]` 开始。定义 $(m+1)\times(n+1)$ 的前缀和矩阵 $s$：

$$
s[i+1][j+1]=\sum_{x=0}^{i}\sum_{y=0}^{j}a[x][y]
$$

易知 `s[0][]` 和 `s[][0]` 均为0。

由容斥原理得到递推式：

$$
s[i+1][j+1]=s[i+1][j]+s[i][j+1]-s[i][j]+a[i][j]
$$

第一行和第一列均为 0。左上角为 $(r_1,c_1)$、右下角为 $(r_2,c_2)$ 的闭区间子矩阵之和为：

$$
\sum_{i=r_1}^{r_2}\sum_{j=c_1}^{c_2}a[i][j]
=s[r_2+1][c_2+1]-s[r_2+1][c_1]-s[r_1][c_2+1]+s[r_1][c_1]
$$

```cpp
vector<vector<int>> buildPrefix2D(const vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> sum(m + 1, vector<int>(n + 1));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            sum[i + 1][j + 1] = sum[i + 1][j] + sum[i][j + 1]
                                    - sum[i][j] + matrix[i][j];
        }
    }
    return sum;
}

int sumRegion(const vector<vector<int>>& sum,
                    int r1, int c1, int r2, int c2) {
    return sum[r2 + 1][c2 + 1] - sum[r2 + 1][c1]
           - sum[r1][c2 + 1] + sum[r1][c1];
}
```

#### 304. 二维区域和检索 - 矩阵不可变

题目来源：[304. 二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/description/)

题目描述：给定一个二维矩阵 `matrix`，多次查询子矩阵范围内元素的总和。子矩阵由左上角 `(row1, col1)` 和右下角 `(row2, col2)` 确定。

示例：

**示例 1：**

- 输入：

  ```text
  matrix = [
    [3,0,1,4,2],
    [5,6,3,2,1],
    [1,2,0,1,5],
    [4,1,0,1,7],
    [1,0,3,0,5]
  ]
  sumRegion(2,1,4,3)
  ```

- 输出：

  ```text
  8
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：预处理 `sum` 后，每次查询用右下角大矩形减去上方和左方，再加回被重复减去的左上方。上述 `buildPrefix2D` 和 `sumRegion` 可以直接完成预处理与查询。

</details>

### 二维差分

给定从 `a[0][0]` 开始的 $m \times n$矩阵，二维差分$(m+1) \times (n+1)$定义为：

$$
d[i][j] = a[i][j]-a[i-1][j]-a[i][j-1]+a[i-1][j-1]
$$
对于式中 $a$ 矩阵越界的数字，直接定义为0。此外 `d[m][]` 和 `d[][n]` 也均为0。

原矩阵由二维前缀和恢复：

$$
a[i][j]=\sum_{x=0}^{i}\sum_{y=0}^{j}d[x][y]
$$

如果要将`a`中的左上角为 $(r_1,c_1)$、右下角为 $(r_2,c_2)$ 的闭区间子矩阵全部增加 $x$，可以如下操作差分矩阵：

$$
\begin{aligned}
d[r_1][c_1]&\mathrel{+}=x \\
d[r_1][c_2+1]&\mathrel{-}=x \\
d[r_2+1][c_1]&\mathrel{-}=x \\
d[r_2+1][c_2+1]&\mathrel{+}=x
\end{aligned}
$$

由于差分矩阵额外补了一行和一列，因此更新右边界与下边界时无需特判。

```cpp
vector<vector<int>> buildDifference2D(
    const vector<vector<int>>& matrix) {
    int m = matrix.size(), n = matrix[0].size();
    vector<vector<int>> diff(m + 1, vector<int>(n + 1));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            diff[i][j] = matrix[i][j];
            if (i > 0) diff[i][j] -= matrix[i - 1][j];
            if (j > 0) diff[i][j] -= matrix[i][j - 1];
            if (i > 0 && j > 0) diff[i][j] += matrix[i - 1][j - 1];
        }
    }
    return diff;
}

void rectangleAdd(vector<vector<int>>& diff,
                  int r1, int c1, int r2, int c2, int x) {
    diff[r1][c1] += x;
    diff[r1][c2 + 1] -= x;
    diff[r2 + 1][c1] -= x;
    diff[r2 + 1][c2 + 1] += x;
}

vector<vector<int>> restoreMatrix(
    const vector<vector<int>>& diff) {
    int m = diff.size() - 1, n = diff[0].size() - 1;
    vector<vector<int>> matrix(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            matrix[i][j] = diff[i][j];
            if (i > 0) matrix[i][j] += matrix[i - 1][j];
            if (j > 0) matrix[i][j] += matrix[i][j - 1];
            if (i > 0 && j > 0) matrix[i][j] -= matrix[i - 1][j - 1];
        }
    }
    return matrix;
}
```

#### 例题：花园积水

小明有一座位于平面直角坐标系第一象限的矩形花园，左下角位于原点。花园由 $a$ 列、$b$ 行单位方格组成，方格坐标记为 $(X,Y)$。横坐标从左向右递增，纵坐标从下向上递增，因此花园内的方格满足 $0\le X<a$、$0\le Y<b$。

花园附近有 $n$ 片矩形积水区域。每片区域由左下角方格坐标 $(x,y)$、横向长度 $l$ 和纵向宽度 $w$ 描述，覆盖满足以下条件的方格：

$$
x\le X<x+l,\qquad y\le Y<y+w
$$

积水区域可以相交，也可能有一部分位于花园外。请输出花园内部的积水图案：普通方格用 `.` 表示，积水方格用 `x` 表示。按照从最上方一行到最下方一行的顺序输出，每行从左向右排列。

输入格式：

- 第一行包含两个整数 $a$ 和 $b$，分别表示花园的列数和行数。
- 第二行包含整数 $n$，表示积水区域的数量。
- 接下来 $n$ 行，每行包含四个整数 $x$、$y$、$l$ 和 $w$。

输出格式：输出 $b$ 行，每行恰有 $a$ 个字符。

数据范围：

$$
1\le a,b\le10^3,\qquad 1\le a\times b\le2\times10^5
$$

$$
0\le n\le10^5,\qquad -10^9\le x,y\le10^9,\qquad 1\le l,w\le10^9
$$

**示例：**

- 输入：

  ```text
  8 4
  2
  1 0 2 4
  6 1 2 2
  ```

- 输出：

  ```text
  .xx.....
  .xx...xx
  .xx...xx
  .xx.....
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：矩形坐标可能超出花园，先把横坐标范围裁剪到 $[0,a)$，纵坐标范围裁剪到 $[0,b)$。裁剪结果仍是半开矩形 $[x_1,x_2)\times[y_1,y_2)$，可直接在二维差分矩阵的四个角更新。所有矩形处理完后求二维前缀和，值大于 0 的方格被积水覆盖。

差分矩阵的行下标就是纵坐标 $Y$，所以恢复时按 $Y$ 从小到大计算；题目要求从花园顶部开始输出，因此输出时再按 $Y$ 从 $b-1$ 到 0 遍历。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int a, b, n;
    cin >> a >> b >> n;

    vector<vector<int>> diff(b + 1, vector<int>(a + 1));
    while (n--) {
        long long x, y, l, w;
        cin >> x >> y >> l >> w;

        int x1 = max(0LL, x);
        int y1 = max(0LL, y);
        int x2 = min((long long)a, x + l);
        int y2 = min((long long)b, y + w);
        if (x1 >= x2 || y1 >= y2) continue;

        diff[y1][x1]++;
        diff[y1][x2]--;
        diff[y2][x1]--;
        diff[y2][x2]++;
    }

    for (int y = 0; y < b; y++) {
        for (int x = 0; x < a; x++) {
            if (y > 0) diff[y][x] += diff[y - 1][x];
            if (x > 0) diff[y][x] += diff[y][x - 1];
            if (y > 0 && x > 0) diff[y][x] -= diff[y - 1][x - 1];
        }
    }

    for (int y = b - 1; y >= 0; y--) {
        for (int x = 0; x < a; x++) {
            cout << (diff[y][x] > 0 ? 'x' : '.');
        }
        cout << '\n';
    }
    return 0;
}
```

</details>

### 树上前缀和
树上前缀和是前缀和在树结构上的应用。对于树上前缀和，主要分为点权和边权两种情况。

#### 点权前缀和
点权前缀和是指计算从根节点到某个节点的路径上所有节点的权值之和。有递推关系：
$$
sum[u] = w[u] + sum[fa[u]]
$$
其中$sum[u]$表示从根节点到节点$u$的路径上所有节点的权值之和，$w[u]$表示节点$u$的权值，$fa[u]$表示节点$u$的父节点。可以通过DFS遍历树来实现。

预处理完成后，可以在$O(1)$的时间内计算出节点$u$到节点$v$路径上所有节点的权值之和：
$$
\sum_{x \in path(u,v)} w[x] = sum[u] + sum[v] - sum[lca(u,v)] - sum[parent[lca(u,v)]]
$$
其中$lca(u,v)$表示节点$u$和节点$v$的最近公共祖先。

#### 边权前缀和
边权前缀和是指计算从根节点到某个节点的路径上所有边的权值之和。可以假设边权存储在离根远的结点上，根结点处存储的权值是0。此时，节点$u$到节点$v$路径上所有边的权值之和可以表示为：
$$
\sum_{e \in path(u,v)} w[e] = sum[u] + sum[v] - 2 \times sum[lca(u,v)]
$$

#### 子树和
子树和是指计算以某个节点为根的子树中所有节点的权值之和。可以通过DFS遍历树来实现。

### 树上差分
树上差分是差分数组在树结构上的应用。对于树上差分，一般分为点权和边权两种情况。点权差分可以通过树的DFS序列来实现，而边权差分则需要将边权转化为点权。
树上差分的差分数组的产生通常通过 **逐步更新权值** 的方式实现。

#### 点权差分
如果要对结点$u$到结点$v$路径上的所有结点增加$x$，可以通过以下步骤实现：
1. 找到$u$和$v$的最近公共祖先$lca(u,v)$。
2. 对**差分数组**进行如下操作：
  $$
  \begin{cases}
    diff[u] \leftarrow diff[u] + x \\
    diff[v] \leftarrow diff[v] + x \\
    diff[lca(u,v)] \leftarrow diff[lca(u,v)] - x \\
    \text{if } lca(u,v) \neq \text{root}: \\
    \quad diff[parent[lca(u,v)]] \leftarrow diff[parent[lca(u,v)]] - x
  \end{cases}
  $$
3. 最后通过一次DFS计算出每个节点的最终值。

#### 边权差分
边权差分可以将边权转化为点权来处理。通常，我们可以将每条边的权值加到其远离根的节点上，并令根节点的权值为0，然后使用点权差分的方法进行处理。
需要注意的是，边权差分在处理边权更新时，仍然需要找到路径的最近公共祖先，但由于公共祖先代表的边不在路径上，因此更新操作会有所不同。
假设要对路径$u$到$v$上的所有边增加$x$，可以通过以下步骤实现：
1. 找到$u$和$v$的最近公共祖先$lca(u,v)$。
2. 对**差分数组**进行如下操作：
  $$
  \begin{cases}
    diff[u] \leftarrow diff[u] + x \\
    diff[v] \leftarrow diff[v] + x \\
    diff[lca(u,v)] \leftarrow diff[lca(u,v)] - 2x \\
  \end{cases}
  $$
3. 最后通过一次DFS计算出每个节点的最终值。

模板C++

```cpp
const int N = 1e5 + 10;
const int LOG = 20; // For LCA
vector<int> g[N];  // Adjacency list for the tree
int w[N];          // Node weights
int diff[N];      // Difference array
int parent[N];     // Parent node
int sum[N];        // Final values after applying differences
int depth[N];      // Depth of each node
int fa[N][LOG]; // Ancestor table for LCA
int n;             // Number of nodes

// Preprocess for LCA
void dfs_lca(int u, int p) {
  parent[u] = p;
  depth[u] = (p == -1) ? 0 : depth[p] + 1;
  fa[u][0] = p;
  for (int i = 1; i < LOG; ++i) {
    if (fa[u][i - 1] != -1)
      fa[u][i] = fa[fa[u][i - 1]][i - 1];
    else
      fa[u][i] = -1;
  }
  for (int v : g[u]) {
    if (v != p) {
      dfs_lca(v, u);
    }
  }
}
```
```cpp
// Find LCA of u and v
int lca(int u, int v) {
  if (depth[u] < depth[v]) swap(u, v);
  for (int i = LOG - 1; i >= 0; --i) {
    if (fa[u][i] != -1 && depth[fa[u][i]] >= depth[v]) {
      u = fa[u][i];
    }
  }
  if (u == v) return u;
  for (int i = LOG - 1; i >= 0; --i) {
    if (fa[u][i] != fa[v][i]) {
      u = fa[u][i];
      v = fa[v][i];
    }
  }
  return parent[u];
}
```
```cpp
// Range update: add x to all nodes on the path from u to v
void range_update(int u, int v, int x) {
  int ancestor = lca(u, v);
  diff[u] += x;
  diff[v] += x;
  diff[ancestor] -= x;
  if (parent[ancestor] != -1) {
    diff[parent[ancestor]] -= x;
  }
}
```
```cpp
// DFS to apply the differences and compute final values
void apply_differences(int u, int p) {
  sum[u] = w[u] + diff[u];
  for (int v : g[u]) {
    if (v != p) {
      apply_differences(v, u);
      sum[u] += sum[v]; // If you want to accumulate values from children
    }
  }
}
```

### 参考

- [前缀和与差分 - OI Wiki](https://oi-wiki.org/basic/prefix-sum/)
- [灵茶山艾府：前缀和与差分](https://leetcode.cn/discuss/post/mOr1u6/)

## Bitwise Operation 位运算

原文：[分享｜从集合论到位运算，常见位运算技巧分类总结！by灵茶山艾府 https://leetcode.cn/discuss/post/3571304/cong-ji-he-lun-dao-wei-yun-suan-chang-ji-enve/](https://leetcode.cn/discuss/post/3571304/cong-ji-he-lun-dao-wei-yun-suan-chang-ji-enve/)

集合可以用二进制表示，二进制从低到高第 $i$ 位为 $1$ 表示 $i$ 在集合中，为 $0$ 表示 $i$ 不在集合中。例如集合 $\{0,2,3\}$ 可以用二进制数 $1101_{(2)}$  表示；反过来，二进制数 $1101_{(2)}$ 就对应着集合 $\{0,2,3\}$。

正式地说，包含非负整数的集合 $S$ 可以用如下方式「压缩」成一个数字：
$$
f(S) = \sum_{i \in S} 2^i
$$
例如集合 $\{0, 2, 3\}$ 可以压缩成 $2^0 + 2^2 + 2^3 = 13$，也就是二进制数 $1101_{(2)}$。

### 集合与集合

| 术语       | 集合运算                           | 位运算                           |
| ---------- | ---------------------------------- | -------------------------------- |
| 交集       | $A \cap B$                         | $a \& b$                         |
| 并集       | $A \cup B$                         | $a \mid b$                       |
| 对称差     | $A \triangle B$                    | $a \oplus b$                     |
| 差         | $A \setminus B$                    | $a \& \sim b$                    |
| 差（子集） | $A \setminus B$（$B \subseteq A$） | $a \& \sim b \quad\text{or}\quad a - b$                          |
| 包含于     | $A \subseteq B$                    | $a \& b == a$ 或 $a \mid b == b$ |

### 集合与元素

通常会用到移位运算。

| 术语                 | 集合运算               | 位运算                     | 集合示例                          | 位运算示例                          |
|----------------------|------------------------|----------------------------|-----------------------------------|-------------------------------------|
| 空集                 | $\emptyset$          | $0$                      |                                   |                                     |
| 单元素集合           | $\{i\}$              | $1 << i$                 | $\{2\}$                         | $1 << 2 = 100$                    |
| 全集                 | $U$                  | $(1 << n) - 1$           | $\{0,1,2\}$                     | $(1 << 3) - 1 = 111$              |
| 补集                 | $\complement_U A$    | $((1 << n) - 1) \& \sim a$ | $U = \{0,1,2\}, \complement_U \{1\} = \{0,2\}$ |                                     |
| 属于                 | $i \in S$            | $(s >> i) \& 1 == 1$     | $2 \in \{1,2\}$                 | $(110 >> 2) \& 1 == 1$           |
| 不属于               | $i \notin S$         | $(s >> i) \& 1 == 0$     | $1 \notin \{0,2\}$              | $(101 >> 1) \& 1 == 0$           |
| 添加元素             | $S \cup \{i\}$       | $s \mid (1 << i)$        | $\{0,3\} \cup \{2\} = \{0,2,3\}$ | $1001 \mid (1 << 2) = 1101$       |
| 删除元素             | $S \setminus \{i\}$  | $s \& \sim (1 << i)$     | $\{0,2,3\} \setminus \{2\} = \{0,3\}$ | $1101 \& \sim (1 << 2) = 1001$    |
| 删除元素（一定在集合中） | $S \setminus \{i\}$  | $s \oplus (1 << i)$      | $\{0,2,3\} \setminus \{2\} = \{0,3\}$ | $1101 \oplus (1 << 2) = 1001$    |
|删除最小元素|          |                        | $s \& (s - 1)$           |  |

常用的库函数如下：
| 术语         | Python               | Java                          | C++                  | Go                  |
|--------------|----------------------|-------------------------------|----------------------|---------------------|
| 集合大小     | `s.bit_count()`      | `Integer.bitCount(s)`         | `__builtin_popcount(s)` | `bits.OnesCount(s)` |
| 二进制长度   | `s.bit_length()`     | `32 - Integer.numberOfLeadingZeros(s)` | `__lg(s) + 1`       | `bits.Len(s)`       |
| 集合最大元素 | `s.bit_length() - 1` | `31 - Integer.numberOfLeadingZeros(s)` | `__lg(s)`           | `bits.Len(s) - 1`   |
| 集合最小元素 | `(s & -s).bit_length() - 1` | `Integer.numberOfTrailingZeros(s)` | `__builtin_ctz(s)`  | `bits.TrailingZeros(s)` |

- `__builtin_popcount(s)`：返回 `s` 的二进制表示中 `1` 的个数，即集合中元素的数量。
- `__lg(s)`：返回 $\lfloor \log_2 s \rfloor$；对非零 `s`，这正是最高位 `1` 的下标。
- `__builtin_ctz(s)`：返回 `s` 的二进制末尾连续 `0` 的个数；对非零 `s`，这正是最低位 `1` 的下标。

`__lg(0)` 和 `__builtin_ctz(0)` 都没有定义，调用前必须保证 `s != 0`。

对于 C++ 的 `long long`，需使用相应的 `__builtin_popcountll` 等函数，即函数名后缀添加 `ll`（两个小写字母 L）。`__lg` 支持 `long long`。

### 遍历集合

```cpp
for (int i = 0; i < n; i++) {
    if ((s >> i) & 1) { // i 在 s 中
        // 处理 i 的逻辑
    }
}
```

### 枚举非空子集

```cpp
for (int sub = s; sub; sub = (sub - 1) & s) {
    // 处理 sub 的逻辑
}
```

为什么是`sub = (sub - 1) & s`？

相当于“压缩版”二进制减法。只对`s`中的非零数字进行减法。如`101001->101000->100001`

### 枚举所有子集，包括空集

```cpp
int sub = s;
do {
    // 处理 sub 的逻辑
    sub = (sub - 1) & s;
} while (sub != s); // 当sub==0后，减1得到-1，即为11111...，此时有sub&s==s
```

```python
sub = s
while True:
    # 处理 sub 的逻辑
    if sub == 0:
        break
    sub = (sub - 1) & s
```

### 枚举超集

如果 $T$ 是 $S$ 的子集，那么称 $S$ 是 $T$ 的**超集**。

```cpp
// 假设 T 的最大大小是n
for (int s = t; s < (1 << n); s = (s + 1) | t) {
    // 处理 s 的逻辑
}
```

### 常见例题

以下四题从[灵茶山艾府的位运算题单](https://leetcode.cn/discuss/post/3580371/fen-xiang-gun-ti-dan-wei-yun-suan-ji-chu-nth4/)中筛选。

#### 191. 位 1 的个数

题目来源：[191. 位 1 的个数](https://leetcode.cn/problems/number-of-1-bits/)

题目描述：统计一个无符号整数的二进制表示中有多少个 `1`。

**示例 1：**

- 输入：`n = 11`，二进制为 `1011`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：`n - 1` 会把 `n` 最低位的 `1` 变成 `0`，其后的 `0` 变成 `1`；再与原数按位与，恰好只删除最低位的一个 `1`。循环次数等于 `1` 的个数。

复杂度：时间 $O(\operatorname{popcount}(n))$，空间 $O(1)$。

```cpp
class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }
};
```

</details>

#### 136. 只出现一次的数字

题目来源：[136. 只出现一次的数字](https://leetcode.cn/problems/single-number/)

题目描述：数组中除一个数只出现一次外，其余数字都恰好出现两次，找出这个数。

**示例 1：**

- 输入：`nums = [4,1,2,1,2]`

- 输出：`4`

<details class="note-solution">
<summary>查看解析</summary>

思路：异或满足 `x ^ x = 0`、`x ^ 0 = x`，且满足交换律、结合律。把所有元素异或，成对数字抵消，剩下的就是答案。

复杂度：时间 $O(n)$，空间 $O(1)$。

```cpp
class Solution {
public:
    int singleNumber(vector<int>& nums) {
        int answer = 0;
        for (int number : nums) {
            answer ^= number;
        }
        return answer;
    }
};
```

</details>

#### 260. 只出现一次的数字 III

题目来源：[260. 只出现一次的数字 III](https://leetcode.cn/problems/single-number-iii/)

题目描述：数组中恰有两个数字各出现一次，其余数字各出现两次，找出这两个只出现一次的数字。

**示例 1：**

- 输入：`nums = [1,2,1,3,2,5]`

- 输出：`[3,5]`，顺序不限

<details class="note-solution">
<summary>查看解析</summary>

思路：先异或所有数，成对数字消失，得到 `xorSum = a ^ b`。`xorSum` 的任意一个 `1` 位都表示 `a` 与 `b` 在该位不同；取 `lowbit = xorSum & -xorSum` 后，按这一位是否为 `1` 分成两组。相同数字必在同一组，`a`、`b` 则分属两组，分别异或即可。

复杂度：时间 $O(n)$，空间 $O(1)$。

```cpp
class Solution {
public:
    vector<int> singleNumber(vector<int>& nums) {
        int xorSum = 0;
        for (int number : nums) {
            xorSum ^= number;
        }

        const unsigned lowbit = static_cast<unsigned>(xorSum) & -static_cast<unsigned>(xorSum);
        int first = 0;
        int second = 0;
        for (int number : nums) {
            if ((static_cast<unsigned>(number) & lowbit) != 0) {
                first ^= number;
            } else {
                second ^= number;
            }
        }
        return {first, second};
    }
};
```

</details>

#### 1863. 找出所有子集的异或总和再求和

题目来源：[1863. 找出所有子集的异或总和再求和](https://leetcode.cn/problems/sum-of-all-subset-xor-totals/)

题目描述：对数组的每个子集计算元素异或和，再把所有子集的异或和相加。

**示例 1：**

- 输入：`nums = [1,3]`

- 输出：`6`

- 解释：子集为 `[]`、`[1]`、`[3]`、`[1,3]`，异或和分别为 `0`、`1`、`3`、`2`。

<details class="note-solution">
<summary>查看解析</summary>

思路：每个位置只有“选”与“不选”两种决策。深度优先搜索记录当前异或值；走到数组末尾时，当前值就是一个子集的异或和。它与前面的子集掩码枚举等价，但递归更直接地对应选择过程。

复杂度：时间 $O(n2^n)$，递归栈空间 $O(n)$。

```cpp
class Solution {
public:
    int subsetXORSum(vector<int>& nums) {
        return dfs(nums, 0, 0);
    }

private:
    int dfs(const vector<int>& nums, int index, int xorSum) {
        if (index == nums.size()) {
            return xorSum;
        }
        return dfs(nums, index + 1, xorSum)
            + dfs(nums, index + 1, xorSum ^ nums[index]);
    }
};
```

</details>

## Greedy 贪心算法

贪心算法在每一步都做当前看来最优的选择，并希望这些局部选择能够组成全局最优解。它通常不能靠状态枚举来兜底，所以关键不在于“想到一个看起来合理的规则”，而在于确认这个规则不会错过最优解。

常见信号包括：答案与原顺序无关时先排序；需要尽量选更多对象时优先留下更大的后续空间；区间问题常按端点排序；扫描数组时维护当前可达范围。

> 贪心不适合所有最优化问题。若一个局部选择会不可逆地限制后续选择，且无法证明它总能出现在某个最优解中，就应考虑动态规划、搜索或其他方法。

### 常用思考方法

1. 明确每一步可做的选择，以及选择后保留的资源或空间。
2. 尝试排序：从最小/最大，或从最左/最右开始处理。
3. 猜测一个局部规则后，用反例检查；再用交换论证证明：把任意最优解中的选择替换为贪心选择，不会让答案变差。
4. 写清楚循环不变量。例如“已选择的区间数量最多，且最后结束时间最早”。

### 例题

#### 最长非降子序列

给定序列 `a`，求满足后一个元素不小于前一个元素的最长子序列长度。

##### 方法一：动态规划

令 `dp[i]` 表示以 `a[i]` 结尾的最长非降子序列长度，枚举前一个位置 `j`，当 `a[j] <= a[i]` 时转移：

$$
dp[i] = \max(dp[i], dp[j] + 1)
$$

时间复杂度为 $O(n^2)$。完整推导与模板见[动态规划中的最长非降子序列](./dynamic-programming.md#the-basics-of-dynamic-programming-n-%E5%8A%A8%E6%80%81%E8%A7%84%E5%88%92%E5%9F%BA%E7%A1%80)。

##### 方法二：贪心 + 二分

维护数组 `tails`：`tails[len - 1]` 表示长度为 `len` 的非降子序列中，结尾元素的最小可能值。扫描每个数 `x` 时：

- 若 `x >= tails.back()`，把 `x` 接到末尾；
- 否则，用 `x` 替换第一个大于 `x` 的位置。

对非降子序列必须使用 `upper_bound`，因为相等的数可以继续接在后面；若求严格递增子序列，则使用 `lower_bound`。

```cpp
int longestNonDecreasingSubsequence(const vector<int>& a) {
    vector<int> tails;

    for (int x : a) {
        auto it = upper_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) {
            tails.push_back(x);
        } else {
            *it = x;
        }
    }
    return tails.size();
}
```

`tails` 本身不一定是一条实际的最优子序列；它只保存每种长度的最佳结尾，以便为后续元素留下最大的延伸空间。时间复杂度为 $O(n\log n)$。

#### 455. 分发饼干

题目来源：[455. 分发饼干](https://leetcode.cn/problems/assign-cookies/)

假设有一些孩子和一些饼干。每个孩子 `i` 都有一个胃口值 `g[i]`：只有当分配给他的饼干尺寸 `s[j] >= g[i]` 时，这块饼干才能让他满足。

每个孩子最多只能得到一块饼干，每块饼干也最多只能分配给一个孩子。给定数组 `g` 和 `s`，返回能让多少个孩子得到满足的最大值。原题中两个数组长度均至少为 `1`，至多为 `3 * 10^4`。

输入格式：

第一行输入 `n`，接着输入 `n` 个整数表示胃口值；第二行输入 `m`，接着输入 `m` 个整数表示饼干尺寸。

输出格式：

输出最多能满足的孩子数量。

示例：

- 输入：

  ```text
  3
  1 2 3
  2
  1 1
  ```

- 输出：

  ```text
  1
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：

把胃口和饼干都从小到大排序。优先尝试满足胃口最小的未满足孩子：

- 当前饼干不够大，就不可能满足这个孩子，只能丢弃饼干；
- 当前饼干够大，就用它满足该孩子。

如果一块饼干能满足胃口最小的孩子，把它留给胃口更大的孩子不会增加满足人数；因此优先满足最小胃口是安全的。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> g(n);
    for (int& x : g) cin >> x;

    int m;
    cin >> m;
    vector<int> s(m);
    for (int& x : s) cin >> x;

    sort(g.begin(), g.end());
    sort(s.begin(), s.end());

    int child = 0;
    for (int cookie = 0; cookie < m && child < n; cookie++) {
        if (s[cookie] >= g[child]) {
            child++;
        }
    }

    cout << child << '\n';
    return 0;
}
```

时间复杂度为 $O(n\log n + m\log m)$，排序后扫描为 $O(n+m)$。

</details>

#### 435. 无重叠区间

题目来源：[435. 无重叠区间](https://leetcode.cn/problems/non-overlapping-intervals/)

给定一个区间集合 `intervals`，其中每个区间为 `intervals[i] = [start_i, end_i]`。请移除最少数量的区间，使剩余区间两两不重叠，并返回需要移除的最少区间数。

区间边界相接不算重叠：例如 `[1, 2]` 与 `[2, 3]` 可以同时保留。原题保证 `start_i < end_i`，区间数量最多为 `10^5`。

输入格式：

第一行输入区间数量 `n`，接下来 `n` 行每行输入两个整数 `start end`。

输出格式：

输出最少删除的区间数量。

示例：

- 输入：

  ```text
  4
  1 2
  2 3
  3 4
  1 3
  ```

- 输出：

  ```text
  1
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：

最少删除等价于尽量保留更多不重叠区间。按右端点从小到大排序后，依次选择第一个与已选区间不重叠的区间。

选择结束最早的区间会给后面的区间留下最大的空间。对于任意一个最优方案，若其第一个选中的区间结束得更晚，可以把它替换为当前结束最早的区间；替换后不会与后续区间新增冲突。因此这个选择可以出现在某个最优解中。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (auto& interval : intervals) {
        cin >> interval[0] >> interval[1];
    }

    sort(intervals.begin(), intervals.end(), [](const auto& a, const auto& b) {
        return a[1] < b[1];
    });

    int kept = 0;
    int lastEnd = INT_MIN;
    for (const auto& interval : intervals) {
        if (interval[0] >= lastEnd) {
            kept++;
            lastEnd = interval[1];
        }
    }

    cout << n - kept << '\n';
    return 0;
}
```

时间复杂度为 $O(n\log n)$，空间复杂度为排序所需空间。

</details>

#### 56. 合并区间

题目来源：[56. 合并区间](https://leetcode.cn/problems/merge-intervals/)

以二维数组 `intervals` 表示若干区间，其中 `intervals[i] = [start_i, end_i]`。请合并所有彼此重叠的区间，并返回一个不重叠的区间数组；返回结果必须恰好覆盖原输入中的全部区间。

例如，`[1, 3]` 与 `[2, 6]` 有重叠，合并为 `[1, 6]`；端点相接的 `[1, 4]` 与 `[4, 5]` 也应合并为 `[1, 5]`。原题的区间数量最多为 `10^4`。

输入格式：

第一行输入区间数量 `n`，接下来 `n` 行每行输入两个整数 `start end`。

输出格式：

按起点升序输出合并后的区间。

示例：

- 输入：

  ```text
  4
  1 3
  2 6
  8 10
  15 18
  ```

- 输出：

  ```text
  1 6
  8 10
  15 18
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：

按左端点排序。扫描时维护已经合并出的最后一个区间：

- 下一个区间起点不超过最后区间的终点，二者重叠，扩展终点；
- 否则它一定不能和更早的区间重叠，可以直接开始一个新区间。

这类题更准确地说是“排序后的区间扫描”，但和区间贪心一样，核心是每一步只维护对未来有用的边界信息。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> intervals(n, vector<int>(2));
    for (auto& interval : intervals) {
        cin >> interval[0] >> interval[1];
    }

    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;

    for (const auto& interval : intervals) {
        if (merged.empty() || merged.back()[1] < interval[0]) {
            merged.push_back(interval);
        } else {
            merged.back()[1] = max(merged.back()[1], interval[1]);
        }
    }

    for (const auto& interval : merged) {
        cout << interval[0] << ' ' << interval[1] << '\n';
    }
    return 0;
}
```

时间复杂度为 $O(n\log n)$，排序后的扫描为 $O(n)$。

</details>

#### 45. 跳跃游戏 II

题目来源：[45. 跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/)

给定一个长度为 `n` 的非负整数数组 `nums`，初始位于下标 `0`。数组中的元素 `nums[i]` 表示从下标 `i` 最多可以向前跳跃的距离；也就是说，可以跳到任意满足 `i < j <= i + nums[i]` 的下标 `j`。

请返回到达最后一个下标 `n - 1` 所需的最少跳跃次数。题目保证一定可以到达最后一个下标，且数组长度至多为 `10^4`。

输入格式：

第一行输入 `n`，第二行输入 `n` 个非负整数。

输出格式：

输出到达最后一个下标的最少跳跃次数。

示例：

- 输入：

  ```text
  5
  2 3 1 1 4
  ```

- 输出：

  ```text
  2
  ```

<details class="note-solution">
<summary>查看解析</summary>

思路：

把一次跳跃能到达的位置看成一个区间。扫描当前区间内所有位置，计算下一次跳跃的最远边界 `farthest`；当扫描到当前区间右边界 `currentEnd` 时，说明必须再跳一次，并把边界扩展到 `farthest`。

在同一次跳跃可达的所有位置中，只关心下一次最远能到哪里。选择能把下一层边界扩得最远的位置，不会增加跳跃次数。

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int& x : nums) cin >> x;

    int jumps = 0;
    int currentEnd = 0;
    int farthest = 0;

    for (int i = 0; i < n - 1; i++) {
        farthest = max(farthest, i + nums[i]);

        if (i == currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }

    cout << jumps << '\n';
    return 0;
}
```

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

</details>

### 小结与延伸

这四题分别对应四种常见入口：排序后匹配、按右端点选择、按左端点扫描、维护可达区间。遇到贪心题时，先问“当前选择会给未来留下什么”，再尝试用交换论证或循环不变量验证它。

更多分类练习可参考 [灵茶山艾府的贪心题单](https://leetcode.cn/discuss/post/3091107/fen-xiang-gun-ti-dan-tan-xin-ji-ben-tan-k58yb/)；其中的反悔贪心、字典序贪心与构造题适合在掌握本文基础后继续练习。

## Monotonic Stack 单调栈

单调栈保存一组下标，并让这些下标对应的值始终单调递增或单调递减。它不用于排序，而是在线确定某个元素左侧或右侧第一个更大/更小元素。

灵茶山艾府将这一专题分为基础、矩形面积、贡献法和最小字典序；本页先掌握最常见的基础与矩形面积模型，再用子数组最小值之和理解贡献法。

### 单调栈解决什么问题

当遍历到 `nums[i]` 时，栈顶若不再满足单调性，栈顶元素就等到了自己的答案：当前 `i` 正是它右侧第一个更大或更小的位置。

例如维护值单调递减的栈，遇到更大的 `nums[i]` 时，所有比它小的栈顶元素出栈；对每个出栈下标 `j`，`i` 就是右侧第一个严格更大的下标。

栈中应保存**下标**而不是值：题目通常需要距离、宽度或左右边界，而这些都由下标计算。每个下标最多入栈一次、出栈一次，因此总时间复杂度为 $O(n)$，额外空间为 $O(n)$。

### 模板

注意符号的可否取等：根据题目要求来。

#### 从左到右：在出栈时结算右边界

下面的模板求每个位置右侧第一个严格更大的元素下标。栈内 `nums` 值从栈底到栈顶单调不增；当前值更大时，栈顶的右边界就已确定。

```cpp
vector<int> nextGreaterIndex(const vector<int>& nums) {
    int n = nums.size();
    vector<int> right(n, -1);
    stack<int> st;

    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            right[st.top()] = i;  // i 是栈顶右侧第一个严格更大的位置
            st.pop();
        }
        st.push(i);
    }
    return right;
}
```

#### 从右到左：栈顶直接给出答案

从右向左扫描时，先弹掉不可能成为答案的位置；弹栈后栈顶就是当前元素右侧最近的目标。

```cpp
vector<int> nextGreaterIndex(const vector<int>& nums) {
    int n = nums.size();
    vector<int> right(n, -1);
    stack<int> st;

    for (int i = n - 1; i >= 0; i--) {
        while (!st.empty() && nums[st.top()] <= nums[i]) {
            st.pop();  // 相等也不能作为“严格更大”的答案
        }
        if (!st.empty()) right[i] = st.top();
        st.push(i);
    }
    return right;
}
```

### 例题

#### 739. 每日温度

题目来源：[739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)

题目描述：给定整数数组 `temperatures`，其中 `temperatures[i]` 表示第 `i` 天的温度。请返回等长数组 `answer`：`answer[i]` 是从第 `i` 天起还需要等待多少天，才会出现温度**严格更高**的一天；若之后不存在更高温度，则 `answer[i] = 0`。

约束：$1 \le temperatures.length \le 10^5$，$30 \le temperatures[i] \le 100$。

**示例 1：**

- 输入：`temperatures = [73,74,75,71,69,72,76,73]`

- 输出：`[1,1,4,2,1,1,0,0]`

- 解释：第 `0` 天温度为 `73`，第 `1` 天的 `74` 更高，所以答案为 `1`；第 `2` 天的 `75` 要等到第 `6` 天的 `76`，所以答案为 `4`；最后两天之后没有更高温度，答案为 `0`。

**示例 2：**

- 输入：`temperatures = [30,40,50,60]`

- 输出：`[1,1,1,0]`

<details class="note-solution">
<summary>查看解析</summary>

思路：从左到右维护温度单调不增的下标栈。新温度更高时，它正好是所有较低温度的“下一次更高温度”。

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n);
        stack<int> st;

        for (int i = 0; i < n; i++) {
            while (!st.empty() && temperatures[st.top()] < temperatures[i]) {
                int j = st.top();
                st.pop();
                ans[j] = i - j;  // j 等到 i 这一天
            }
            st.push(i);
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

#### 42. 接雨水

题目来源：[42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)

题目描述：给定 `n` 个非负整数 `height`，每个元素代表宽度为 `1` 的柱子高度。下雨后，柱子之间可以积水；请计算所有柱子能够接住的雨水总量。

约束：$1 \le height.length \le 2 \times 10^4$，$0 \le height[i] \le 10^5$。

**示例 1：**

- 输入：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`

- 输出：`6`

- 解释：其中凹槽会被左右两侧更高的柱子围住，所有位置累积可接 `6` 单位雨水。

**示例 2：**

- 输入：`height = [4,2,0,3,2,5]`

- 输出：`9`

<details class="note-solution">
<summary>查看解析</summary>

思路：维护高度单调递减的下标栈。当 `height[i]` 高于栈顶时，栈顶 `bottom` 是一个凹槽底部；弹出它以后，新的栈顶 `left` 是左墙，`i` 是右墙。

凹槽这一层的宽度为 $i-left-1$，可盛水高度为 $\min(height[left], height[i])-height[bottom]$。若弹出后栈空，说明缺少左墙，不能接水。

```cpp
class Solution {
public:
    int trap(vector<int>& height) {
        int ans = 0;
        stack<int> st;

        for (int i = 0; i < height.size(); i++) {
            while (!st.empty() && height[st.top()] < height[i]) {
                int bottom = st.top();
                st.pop();
                if (st.empty()) break;  // 没有左墙

                int left = st.top();
                int width = i - left - 1;
                int waterHeight = min(height[left], height[i]) - height[bottom];
                ans += width * waterHeight;
            }
            st.push(i);
        }
        return ans;
    }
};
```

这里计算的是“底部 `bottom` 上方新露出的那一层水”，同一位置不会被重复计算。时间复杂度 $O(n)$，空间复杂度 $O(n)$。这题也有空间 $O(1)$ 的双指针解法；单调栈解法更适合练习“左右边界确定后立即结算”。

</details>

#### 84. 柱状图中最大的矩形

题目来源：[84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

题目描述：给定非负整数数组 `heights`。下标 `i` 处有一根宽度为 `1`、高度为 `heights[i]` 的柱子，所有柱子首尾相接形成柱状图。请返回柱状图中由若干**连续**柱子构成的最大矩形面积。

约束：$1 \le heights.length \le 10^5$，$0 \le heights[i] \le 10^4$。

**示例 1：**

- 输入：`heights = [2,1,5,6,2,3]`

- 输出：`10`

- 解释：选择高度为 `5` 和 `6` 的两根连续柱子，矩形最小高度为 `5`、宽度为 `2`，面积为 `5 × 2 = 10`。

**示例 2：**

- 输入：`heights = [2,4]`

- 输出：`4`

<details class="note-solution">
<summary>查看解析</summary>

思路：把每根柱子当作矩形的最低高度。对于下标 `mid`，只要左右柱子都不低于 `heights[mid]`，矩形就能向两侧延伸；因此需要找到左右两侧第一个更低的柱子。

在数组两端加入高度 `0` 的哨兵。维护高度单调不减的栈，遇到更低柱子时弹出 `mid`：当前 `i` 是右侧第一个更低位置，弹栈后的新栈顶 `left` 是左侧第一个更低位置，所以宽度为 $i-left-1$。

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};  // 左哨兵，避免处理空栈
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);   // 右哨兵，结算所有未出栈柱子

        int ans = 0;
        stack<int> st;
        st.push(0);

        for (int i = 1; i < h.size(); i++) {
            while (h[st.top()] > h[i]) {
                int mid = st.top();
                st.pop();
                int left = st.top();
                ans = max(ans, h[mid] * (i - left - 1)); // 原数组中[left+1, i -1]可以构成高度为h[mid]的矩形
            }
            st.push(i);
        }
        return ans;
    }
};
```

例如 `mid` 高度为 `5`，左右第一个更低位置分别为下标 `1` 和 `4` 时，覆盖区间是 $(1, 4) = [2, 3]$，宽度不是 $4 - 1$，而是 $4-1-1=2$。这正是公式中减一的原因。

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

#### 85. 最大矩形

题目来源：[85. 最大矩形](https://leetcode.cn/problems/maximal-rectangle/)

题目描述：给定仅包含字符 `'0'` 和 `'1'` 的二维矩阵 `matrix`。请找出只由 `'1'` 组成、边与矩阵网格对齐的最大矩形，并返回该矩形的面积。

约束：$1 \le matrix.length, matrix[i].length \le 200$；`matrix[i][j]` 为 `'0'` 或 `'1'`。

**示例 1：**

- 输入：

  ```text
  matrix = [
    ["1","0","1","0","0"],
    ["1","0","1","1","1"],
    ["1","1","1","1","1"],
    ["1","0","0","1","0"]
  ]
  ```

- 输出：`6`

- 解释：第二、三行的第三至第五列组成一个 $2 \times 3$ 的全 `'1'` 矩形，面积为 `6`。

**示例 2：**

- 输入：`matrix = [["0"]]`

- 输出：`0`

<details class="note-solution">
<summary>查看解析</summary>

思路：逐行扫描，把每一列连续 `'1'` 的高度累积到 `heights[j]`。这样每处理一行，就得到一张以该行为底的柱状图；调用 84 题的函数求它的最大矩形，再取所有行的最大值。

```cpp
class Solution {
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);

        int best = 0;
        stack<int> st;
        st.push(0);
        for (int i = 1; i < h.size(); i++) {
            while (h[st.top()] > h[i]) {
                int mid = st.top();
                st.pop();
                best = max(best, h[mid] * (i - st.top() - 1));
            }
            st.push(i);
        }
        return best;
    }

public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int n = matrix[0].size();
        vector<int> heights(n);
        int ans = 0;

        for (const auto& row : matrix) {
            for (int j = 0; j < n; j++) {
                heights[j] = row[j] == '1' ? heights[j] + 1 : 0;
            }
            ans = max(ans, largestRectangleArea(heights));
        }
        return ans;
    }
};
```

每一行更新高度为 $O(n)$，并执行一次 84 题的 $O(n)$ 算法；总时间复杂度为 $O(mn)$，空间复杂度为 $O(n)$。

</details>

#### 907. 子数组的最小值之和

题目来源：[907. 子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/)

题目描述：给定整数数组 `arr`，对每个非空连续子数组，取其中的最小值；请返回这些最小值之和。结果可能很大，返回其对 $10^9+7$ 取模后的值。

约束：$1 \le arr.length \le 3 \times 10^4$，$1 \le arr[i] \le 3 \times 10^4$。

**示例 1：**

- 输入：`arr = [3,1,2,4]`

- 输出：`17`

- 解释：长度为 `1` 的子数组贡献为 `3 + 1 + 2 + 4`；长度为 `2` 的子数组贡献为 `1 + 1 + 2`；长度为 `3` 和 `4` 的子数组各贡献 `1`，总和为 `17`。

**示例 2：**

- 输入：`arr = [11,81,94,43,3]`

- 输出：`444`

<details class="note-solution">
<summary>查看解析</summary>

思路：不枚举所有子数组，而是计算每个 `arr[i]` 能作为多少个子数组的最小值。

向左找最近的比 `arr[i]` 小的位置 `left`，向右找最近的小于等于 `arr[i]` 的位置 `right`。那么左端点有 `i-left` 种选法，右端点有 `right-i` 种选法。

所以 `arr[i]` 的贡献为：

`arr[i] × (i-left) × (right-i)`

这些子数组中，每个子数组的最小值都是 arr[i]，最后把所有位置的贡献相加即可。左右边界可以用单调栈求出。

需要注意重复元素。为了避免同一个子数组被重复计算，可以规定一边找“严格小于”，另一边找“小于等于”。这里采用：左边找严格小于（对应单调栈是严格递增栈），右边找小于等于。这样每个子数组只会被计算一次。

```cpp
class Solution {
public:
    int sumSubarrayMins(vector<int>& arr) {
        const int MOD = 1'000'000'007;
        long long ans = 0;
        stack<int> st;
        st.push(-1);  // 左哨兵

        for (int i = 0; i <= arr.size(); i++) {
            while (st.top() != -1 && (i == arr.size() || arr[st.top()] >= arr[i])) {
                int mid = st.top();
                st.pop();
                int left = st.top();
                ans += 1LL * arr[mid] * (mid - left) * (i - mid);
                ans %= MOD;
            }
            if (i < arr.size()) st.push(i);
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

### 练习顺序

按灵神题单的分类，先练“最近更大/更小”，再进入矩形面积与贡献法：

1. [739. 每日温度](https://leetcode.cn/problems/daily-temperatures/)：出栈时结算右侧第一个更大。
2. [496. 下一个更大元素 I](https://leetcode.cn/problems/next-greater-element-i/)：把结果存进哈希表。
3. [42. 接雨水](https://leetcode.cn/problems/trapping-rain-water/)：弹出凹槽底部，按左右墙结算。
4. [84. 柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)：第一个更小边界与哨兵。
5. [85. 最大矩形](https://leetcode.cn/problems/maximal-rectangle/)：将二维问题逐行化为 84。
6. [907. 子数组的最小值之和](https://leetcode.cn/problems/sum-of-subarray-minimums/)：用边界计算贡献，并处理重复值归属。

### 参考

- [灵茶山艾府：单调栈题单（基础、矩形面积、贡献法、最小字典序）](https://leetcode.cn/discuss/post/3579480/)
