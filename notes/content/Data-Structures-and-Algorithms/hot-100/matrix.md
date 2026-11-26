---
title: Hot 100：矩阵
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 73. 矩阵置零

给定 $m\times n$ 整数矩阵。若某个元素为 `0`，将它所在行和列的所有元素都置为 `0`。要求直接修改原矩阵。

[题目链接](https://leetcode.cn/problems/set-matrix-zeroes/)

### 示例

#### 示例 1

- 输入：`matrix = [[1,1,1],[1,0,1],[1,1,1]]`
- 输出：`[[1,0,1],[0,0,0],[1,0,1]]`

#### 示例 2

- 输入：`matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]`
- 输出：`[[0,0,0,0],[0,4,5,0],[0,3,1,0]]`

### 数据范围

- $m=matrix.length$，$n=matrix[0].length$
- $1 \leq m,n \leq 200$
- $-2^{31} \leq matrix[i][j] \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

### 为什么不能遇到零就立即修改

若扫描到 `0` 时立刻把整行整列置零，新产生的零会在后续扫描中被误认为原始零，最终可能把无关行列也清零。必须先记录原始零涉及的行列，再统一修改。

### 方法一：记录行和列

使用两个布尔数组分别记录哪些行、哪些列需要置零。

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        vector<bool> zeroRow(m), zeroColumn(n);
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (matrix[i][j] == 0) {
                    zeroRow[i] = true;
                    zeroColumn[j] = true;
                }
            }
        }
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (zeroRow[i] || zeroColumn[j]) {
                    matrix[i][j] = 0;
                }
            }
        }
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(m+n)$

### 方法二：用首行和首列保存标记

`matrix[i][0]` 可记录第 `i` 行是否应置零，`matrix[0][j]` 可记录第 `j` 列是否应置零。`matrix[0][0]` 同时属于首行和首列，无法保存两个独立状态，因此额外使用 `firstRowZero` 和 `firstColumnZero`。

处理顺序：

1. 单独检查首行、首列是否原本含零；
2. 扫描其余元素，把置零信息写入对应的行首和列首；
3. 根据标记修改首行、首列以外的元素；
4. 最后根据两个布尔值处理首行和首列。

```cpp
class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int m = matrix.size(), n = matrix[0].size();
        bool firstRowZero = false, firstColumnZero = false;

        for (int j = 0; j < n; j++) {
            firstRowZero |= matrix[0][j] == 0;
        }
        for (int i = 0; i < m; i++) {
            firstColumnZero |= matrix[i][0] == 0;
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][j] == 0) {
                    matrix[i][0] = 0;
                    matrix[0][j] = 0;
                }
            }
        }
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                if (matrix[i][0] == 0 || matrix[0][j] == 0) {
                    matrix[i][j] = 0;
                }
            }
        }
        if (firstRowZero) {
            fill(matrix[0].begin(), matrix[0].end(), 0);
        }
        if (firstColumnZero) {
            for (auto& row : matrix) {
                row[0] = 0;
            }
        }
    }
};
```

标记阶段不会修改内部元素，写回阶段读取的行首、列首标记也会保留到内部区域处理结束，因此每个元素是否归零都与原矩阵中的零准确对应。

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(1)$

### 易错点

- 首行和首列必须单独记录，不能只依赖 `matrix[0][0]`。
- 必须先完成全部标记，再修改内部矩阵。
- 首行、首列应最后处理，否则会破坏仍需读取的标记。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/set-matrix-zeroes/solutions/)

## 54. 螺旋矩阵

给定 $m\times n$ 矩阵，按照从左上角开始、顺时针向内盘旋的顺序返回全部元素。

[题目链接](https://leetcode.cn/problems/spiral-matrix/)

### 示例

#### 示例 1

- 输入：`matrix = [[1,2,3],[4,5,6],[7,8,9]]`
- 输出：`[1,2,3,6,9,8,7,4,5]`

#### 示例 2

- 输入：`matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]`
- 输出：`[1,2,3,4,8,12,11,10,9,5,6,7]`

### 数据范围

- $m=matrix.length$，$n=matrix[0].length$
- $1 \leq m,n \leq 10$
- $-100 \leq matrix[i][j] \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 四条边界

使用 `top`、`bottom`、`left`、`right` 表示尚未访问区域的四条边。每一轮依次遍历：

1. 上边：从左到右，然后 `top++`；
2. 右边：从上到下，然后 `right--`；
3. 下边：确认仍有未访问行后，从右到左，然后 `bottom--`；
4. 左边：确认仍有未访问列后，从下到上，然后 `left++`。

```cpp
class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int top = 0, bottom = matrix.size() - 1;
        int left = 0, right = matrix[0].size() - 1;
        vector<int> ans;

        while (top <= bottom && left <= right) {
            for (int j = left; j <= right; j++) {
                ans.push_back(matrix[top][j]);
            }
            top++;

            for (int i = top; i <= bottom; i++) {
                ans.push_back(matrix[i][right]);
            }
            right--;

            if (top <= bottom) {
                for (int j = right; j >= left; j--) {
                    ans.push_back(matrix[bottom][j]);
                }
                bottom--;
            }
            if (left <= right) {
                for (int i = bottom; i >= top; i--) {
                    ans.push_back(matrix[i][left]);
                }
                left++;
            }
        }
        return ans;
    }
};
```

### 正确性

每轮访问当前未处理矩形的外圈，随后四条边界各向内收缩一格。四段遍历互不重叠；当矩阵只剩一行或一列时，两个额外判断阻止下边或左边再次访问相同元素。边界交错时，所有元素恰好访问一次。

### 复杂度

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(1)$，返回数组不计入额外空间

### 易错点

- 遍历完上边和右边后，剩余区域可能已经为空，访问下边和左边前必须重新判断边界。
- 矩阵不一定是正方形，要分别维护行边界与列边界。
- 向左、向上遍历时循环变量是递减的，终止条件仍包含边界元素。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/spiral-matrix/solutions/)

## 48. 旋转图像

给定 $n\times n$ 矩阵，将图像顺时针旋转 $90^\circ$。必须直接修改输入矩阵，不能使用另一个矩阵替换输入。

[题目链接](https://leetcode.cn/problems/rotate-image/)

### 示例

#### 示例 1

- 输入：`matrix = [[1,2,3],[4,5,6],[7,8,9]]`
- 输出：`[[7,4,1],[8,5,2],[9,6,3]]`

#### 示例 2

- 输入：`matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]`
- 输出：`[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]`

### 数据范围

- $n=matrix.length=matrix[i].length$
- $1 \leq n \leq 20$
- $-1000 \leq matrix[i][j] \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

### 下标变换

顺时针旋转后，原位置 $(i,j)$ 移动到：

$$
(i,j)\rightarrow(j,n-1-i)
$$

例如 $3\times3$ 矩阵中的 `(0, 1)` 会移动到 `(1, 2)`。

### 方法一：辅助矩阵

按照下标变换把元素写入辅助矩阵。该方法用于直接理解映射，但不满足原地修改的进阶要求。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        vector<vector<int>> rotated(n, vector<int>(n));
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                rotated[j][n - 1 - i] = matrix[i][j];
            }
        }
        matrix = move(rotated);
    }
};
```

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(n^2)$

### 方法二：转置后水平翻转

顺时针旋转可以拆成两步：

1. 沿主对角线转置，令 $(i,j)\rightarrow(j,i)$；
2. 水平翻转每一行，令 $(j,i)\rightarrow(j,n-1-i)$。

两步组合后正好得到顺时针旋转的下标变换。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        for (auto& row : matrix) {
            reverse(row.begin(), row.end());
        }
    }
};
```

转置只交换主对角线一侧的元素。若从 `j = 0` 开始，会把同一对元素交换两次，矩阵恢复原状。

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

### 方法三：四个位置循环交换

旋转会把四个位置组成一组：

$$
(i,j)\rightarrow(j,n-1-i)\rightarrow(n-1-i,n-1-j)
\rightarrow(n-1-j,i)\rightarrow(i,j)
$$

逐层处理矩阵，每组只交换一次。

```cpp
class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        for (int i = 0; i < n / 2; i++) {
            for (int j = i; j < n - i - 1; j++) {
                int top = matrix[i][j];
                matrix[i][j] = matrix[n - 1 - j][i];
                matrix[n - 1 - j][i] = matrix[n - 1 - i][n - 1 - j];
                matrix[n - 1 - i][n - 1 - j] = matrix[j][n - 1 - i];
                matrix[j][n - 1 - i] = top;
            }
        }
    }
};
```

外层 `i` 表示当前层，内层只遍历该层上边且不包含右上角的重复起点。奇数阶矩阵的中心元素无需移动。

- 时间复杂度：$O(n^2)$
- 空间复杂度：$O(1)$

### 易错点

- 顺时针旋转是“主对角线转置后水平翻转”；先上下翻转再转置也可以，但不能混用为逆时针顺序。
- 原题要求直接修改矩阵，辅助矩阵方法不满足最终空间要求。
- 四元交换时应先保存一个位置，否则第一个赋值会覆盖仍需使用的值。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/rotate-image/solutions/)

## 240. 搜索二维矩阵 II

给定 $m\times n$ 整数矩阵 `matrix` 和整数 `target`。矩阵每行从左到右非递减，每列从上到下非递减，判断目标值是否存在。

[题目链接](https://leetcode.cn/problems/search-a-2d-matrix-ii/)

### 示例

给定矩阵：

```text
1   4   7  11  15
2   5   8  12  19
3   6   9  16  22
10 13  14  17  24
18 21  23  26  30
```

#### 示例 1

- 输入：`target = 5`
- 输出：`true`

#### 示例 2

- 输入：`target = 20`
- 输出：`false`

### 数据范围

- $m=matrix.length$，$n=matrix[i].length$
- $1 \leq m,n \leq 300$
- $-10^9 \leq matrix[i][j],target \leq 10^9$
- 每行从左到右非递减，每列从上到下非递减

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：逐行二分

每一行都是有序数组，可以对每行分别二分查找。若目标小于本行首元素或大于本行末元素，可直接跳过该行。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        for (const auto& row : matrix) {
            if (target < row.front() || target > row.back()) {
                continue;
            }
            if (binary_search(row.begin(), row.end(), target)) {
                return true;
            }
        }
        return false;
    }
};
```

- 时间复杂度：$O(m\log n)$
- 空间复杂度：$O(1)$

该方法只利用了每行有序，没有利用每列也有序的条件。

### 方法二：从右上角开始排除

右上角元素具有两个方向相反的单调性：向左数值不增，向下数值不减。设当前位置为 `(row, column)`：

- 若当前值大于 `target`，当前列从该位置向下都不小于当前值，因此整列不可能包含目标，令 `column--`；
- 若当前值小于 `target`，当前行从该位置向左都不大于当前值，因此整行不可能包含目标，令 `row++`；
- 相等时返回 `true`。

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int row = 0;
        int column = matrix[0].size() - 1;
        while (row < matrix.size() && column >= 0) {
            if (matrix[row][column] == target) {
                return true;
            }
            if (matrix[row][column] > target) {
                column--;
            } else {
                row++;
            }
        }
        return false;
    }
};
```

每次比较都会排除一整行或一整列。搜索区域始终是尚未排除的左下矩形；目标若存在，就不会在上述排除中被移除。退出时行或列已经全部排除，因此目标不存在。

- 时间复杂度：$O(m+n)$
- 空间复杂度：$O(1)$

也可以从左下角开始，较大时上移、较小时右移。不能从左上角开始，因为向右和向下都会增大，比较一次后无法确定排除哪个方向。

### 易错点

- 本题与“搜索二维矩阵”不同：下一行首元素不保证大于上一行末元素，不能把矩阵直接视为一个整体有序数组。
- 阶梯搜索应选择右上角或左下角，保证两个移动方向的数值变化相反。
- `column` 需要使用有符号整数，否则减到 `-1` 时会发生无符号下溢。

</details>

### 参考

- [LeetCode 官方题目与题解](https://leetcode.cn/problems/search-a-2d-matrix-ii/solutions/)
