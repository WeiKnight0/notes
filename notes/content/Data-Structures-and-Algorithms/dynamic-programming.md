---
title: Dynamic Programming 动态规划
date: 2026-07-10
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## The Basics of Dynamic Programming \n 动态规划基础

动态规划（Dynamic Programming, DP）是一种用于解决复杂问题的算法设计方法，通常用于优化问题。要使用动态规划，问题必须满足以下三个基本条件：
- 最优子结构
    - 要解决一个大问题，我们可以先解决其更小的子问题
    - 大问题的最优解可以通过子问题的最优解来构建
- 无后效性
    - 已经求解的子问题，不会再受到后续决策的影响
- 子问题重叠
    - 问题可以分解为多个子问题
    - 这些子问题在求解过程中会被多次计算

例如，斐波那契数列的计算满足上述条件：
- 最优子结构：$F(n) = F(n-1) + F(n-2)$
- 无后效性：$F(n)$ 的计算只依赖于 $F(n-1)$ 和 $F(n-2)$，不会受到后续计算 $F(i),\,i>n$ 的影响
- 子问题重叠：$F(n-1)$ 和 $F(n-2)$ 会被多次计算

### 动态规划的两种实现方式
动态规划通常有两种实现方式：自顶向下的记忆化搜索法和自底向上的递推法。
#### 自顶向下的记忆化搜索法（Memoization）
- 通过**递归**的方式自顶向下地解决问题
- 使用一个数据结构（通常是数组或哈希表）来存储已经计算的子问题的结果
- 在递归过程中，先检查子问题是否已经计算过，如果计算过则直接返回结果，否则进行计算并存储结果
- 适用于问题规模较大且递归深度较浅的情况
例如，计算斐波那契数列的记忆化搜索法实现如下：
```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAXN (100)
int memo[MAXN]; // 用于存储已经计算的斐波那契数

int fibonacci(int n) {
    if (n <= 1) return n; // 基本情况
    if (memo[n] != -1) return memo[n]; // 如果已经计算过，直接返回结果
    memo[n] = fibonacci(n - 1) + fibonacci(n - 2); // 计算并存储结果
    return memo[n];
}

int main() {
    int n = 10; // 计算第10个斐波那契数
    memset(memo, -1, sizeof(memo)); // 初始化memo数组
    cout << "Fibonacci(" << n << ") = " << fibonacci(n) << endl;
    return 0;
}
```

#### 自底向上的递推法（Tabulation）
- 通过**迭代**的方式自底向上地解决问题
- 通常使用一个数组来存储子问题的结果，从最小的子问题开始，逐步构建到原问题
- 适用于问题规模较大且递归深度较深的情况
例如，计算斐波那契数列的递推法实现如下：
```cpp
#include <bits/stdc++.h>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n; // 基本情况
    vector<int> dp(n + 1); // 用于存储斐波那契数
    dp[0] = 0;
    dp[1] = 1;
    for (int i = 2; i <= n; ++i) {
        dp[i] = dp[i - 1] + dp[i - 2]; // 计算并存储结果
    }
    return dp[n];
}
int main() {
    int n = 10; // 计算第10个斐波那契数
    cout << "Fibonacci(" << n << ") = " << fibonacci(n) << endl;
    return 0;
}
```

### 动态规划的四个步骤
无论使用哪种实现方式，动态规划均需要遵循以下四个步骤：
1. **定义状态**：确定问题的动态规划表示，通常使用dp数组的元素来表示子问题的解（这一步往往很难！）
2. **状态转移方程**：找出状态之间的关系，通过递推方程来表示，包含解析式和相应的变量取值范围（这一步往往很难！）
3. **边界条件**：确定初始状态的值，通常是最小子问题的解
4. **答案的表示**：确定最终答案的位置，如dp数组的最后一个元素或特定的位置的值
注意：动态规划题的原始数据下标一般从1开始，更方便边界条件。

例如，计算斐波那契数列第`n`个数的四个步骤如下：
1. **定义状态**：令 `dp[i]` 表示第 `i` 个斐波那契数
2. **状态转移方程**：`dp[i] = dp[i-1] + dp[i-2]`，其中 `i >= 2`
3. **边界条件**：`dp[0] = 0`，`dp[1] = 1`
4. **答案的表示**：最终答案为 `dp[n]`

### 经典例题（但很重要！）
#### 最长公共子序列

**题目：**

给定两个仅由小写字母组成的非空字符串 `A` 和 `B`，长度分别为 $n$、$m$，且 $1 \le n,m \le 5000$。从每个字符串中删除任意个字符（也可以不删除），但不能改变剩余字符的相对顺序。

求两个字符串的最长公共子序列（Longest Common Subsequence, LCS）长度。子序列不要求连续：例如 `ace` 是 `abcde` 的子序列，`bde` 不是 `abcde` 的子序列。

**输入：**

两行，每行一个字符串：第一行是 `A`，第二行是 `B`。

**输出：**

一个整数，表示 `A` 与 `B` 的最长公共子序列长度。

**示例：**

- 输入：

  ```text
  abcde
  ace
  ```

- 输出：`3`

解释：`ace` 同时是两个字符串的子序列，且长度为 `3`。


<details class="note-solution">
<summary>查看解析</summary>

**分析**：
1. **定义状态**：
   令 `dp[i][j]` 表示序列 `A` 的前 `i` 个元素和序列 `B` 的前 `j` 个元素的最长公共子序列的长度。
2. **状态转移方程**：
   - 如果 `A[i-1] == B[j-1]`，则 `dp[i][j] = dp[i-1][j-1] + 1`
   - 否则，`dp[i][j] = max(dp[i-1][j], dp[i][j-1])`
3. **边界条件**：
   - `dp[0][j] = 0`，表示当 `A` 为空时，最长公共子序列长度为 `0`
   - `dp[i][0] = 0`，表示当 `B` 为空时，最长公共子序列长度为 `0`
4. **答案的表示**：
   最终答案为 `dp[n][m]`，即序列 `A` 的前 `n` 个元素和序列 `B` 的前 `m` 个元素的最长公共子序列的长度。

**解答**：
```cpp
#include <bits/stdc++.h>
using namespace std;
const int MAXN = 5005;
int dp[MAXN][MAXN]; // dp数组
string A, B; // 输入的两个序列

int main() {
    cin >> A >> B; // 读取输入序列
    int n = A.size(), m = B.size();
    // 初始化dp数组
    for (int i = 0; i <= n; ++i) dp[i][0] = 0;
    for (int j = 0; j <= m; ++j) dp[0][j] = 0;
    // 填充dp数组
    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            if (A[i - 1] == B[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1; // 字符相同，长度加1
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]); // 字符不同，取最大值
            }
        }
    }
    cout << dp[n][m] << '\n';
    return 0;
}
```

</details>

#### 最长非降子序列

**题目：**

给定一个长度为 $n$ 的整数序列 $a$，其中 $1 \le n \le 5000$。从原序列中选出若干个元素，保持它们原有的先后顺序，得到一个子序列。要求该子序列相邻元素满足：

$$
b_1 \le b_2 \le \cdots \le b_k
$$

求最大的 $k$，即最长非降子序列的长度。注意：子序列不要求下标连续，相等元素可以同时选入。

**输入：**

第一行一个整数 `n`；第二行 `n` 个整数 `a_1, a_2, ..., a_n`。

**输出：**

一个整数，表示最长非降子序列的长度。

**示例：**

- 输入：

  ```text
  8
  5 3 4 8 6 7 7 9
  ```

- 输出：`6`

解释：`3, 4, 6, 7, 7, 9` 是一个长度为 `6` 的非降子序列。

该题有两种常用解法：动态规划的时间复杂度为 $O(n^2)$；贪心加二分的时间复杂度为 $O(n\log n)$。

<details class="note-solution">
<summary>查看解析</summary>

##### 方法一：动态规划
**分析**：
1. **定义状态**：
   令 `dp[i]` 表示以 `a[i]` 结尾的最长非降子序列的长度。
2. **状态转移方程**：
   对于每个 `i`，遍历 `j` 从 `0` 到 `i-1`：如果 `a[j] <= a[i]`，则 `dp[i] = max(dp[i], dp[j] + 1)`。
3. **边界条件**：
   `dp[i] = 1`，表示每个元素自身可以作为一个长度为 `1` 的非降子序列
4. **答案的表示**：
   最终答案为 `max(dp[i])`，其中 `0 <= i < n`。

**解答**：
```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 5005;
int dp[MAXN]; // dp数组
int a[MAXN]; // 输入的序列

int main() {
    int n;
    cin >> n; // 读取序列长度
    for (int i = 0; i < n; ++i) {
        cin >> a[i]; // 读取序列元素
        dp[i] = 1; // 初始化dp数组，每个元素自身可以作为长度为1的非降子序列
    }
    // 填充dp数组
    for (int i = 1; i < n; ++i) {
        for (int j = 0; j < i; ++j) {
            if (a[j] <= a[i]) { // 如果a[j]不大于a[i]
                dp[i] = max(dp[i], dp[j] + 1); // 更新dp[i]
            }
        }
    }
    int ans = *max_element(dp, dp + n); // 找到最长非降子序列的长度
    cout << ans << endl; // 输出结果
    return 0;
}
```

##### 方法二：贪心 + 二分

详见[贪心算法中的最长非降子序列](./techniques.md#%E6%96%B9%E6%B3%95%E4%BA%8C-%E8%B4%AA%E5%BF%83-%E4%BA%8C%E5%88%86)。

</details>

## Linear DP 线性DP

待补。

## Knapsack DP 背包DP

问题描述：
Given weights and values of `n` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. In other words, given two integer arrays `v[0..n-1]` and `w[0..n-1]` which represent values and weights associated with `n` items respectively. Also given an integer `W` which represents knapsack capacity, find out the maximum value subset of `v[]` such that sum of the weights of this subset is smaller than or equal to `W`. You cannot break an item, either pick the complete item or don’t pick it.

Input:
- An integer `n` representing the number of items.
- An integer `W` representing the maximum capacity of the knapsack.
- An integer array `v[0..n-1]` representing the values of the items.
- An integer array `w[0..n-1]` representing the weights of the items.

Output:
- An integer representing the maximum value that can be accommodated in the knapsack.

<br>

问题分析：
由于每个物体只有两种可能的状态（取与不取），对应二进制中的0和1，因此称为0-1背包问题。
为什么可以用动态规划来解决这个问题？因为它满足动态规划的三个基本条件：
- 最优子结构：对于前`i`个物品和容量为`j`的背包，最优解可以通过前`i-1`个物品和容量为`j`或`j-w[i]`的背包的最优解来构建。
- 无后效性：一旦选择了某个物品（放入或不放入背包），这个决策不会影响后续物品的选择。
- 子问题重叠：在计算过程中，许多子问题会被多次计算。

<br>

**问题解答**：
##### 1. 定义状态
定义状态`dp[i][j]`表示前`i`个物品（$1 \leq i \leq n$）中能够装入容量为`j`的背包的最大价值。

##### 2. 状态转移方程
对于每个物品`i`，有两种选择：
- 不放入背包：此时最大价值为`dp[i-1][j]`
- 放入背包：前提是当前物品的重量`w[i]`不超过当前背包容量`j`，此时最大价值为`dp[i-1][j-w[i]] + v[i]`

因此，状态转移方程为：
$$
dp[i][j] = \max(dp[i-1][j], dp[i-1][j-w[i]] + v[i])
$$
其中`w[i]`和`v[i]`分别表示第`i`个物品的重量和价值。

##### 3. 边界条件
- `dp[0][j] = 0`，表示没有物品时，背包的最大价值为0。
- `dp[i][0] = 0`，表示背包容量为0时，最大价值为0。

##### 4. 答案的表示
最终答案为`dp[n][W]`，表示前`n`个物品中能够装入容量为`W`的背包的最大价值。

**代码实现**：
```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAXN (100)
#define MAXW (1000)
int dp[MAXN][MAXW]; // dp数组
int w[MAXN]; // 物品重量
int v[MAXN]; // 物品价值
int n, W; // 物品数量和背包容量

int main() {
    // 输入物品数量和背包容量
    cin >> n >> W;
    // 输入物品的重量和价值
    for (int i = 1; i <= n; i++) {
        cin >> w[i] >> v[i];
    }

    // 初始化dp数组
    memset(dp, 0, sizeof(dp));

    // 动态规划填表
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= W; j++) {
            if (j < w[i]) {
                dp[i][j] = dp[i-1][j]; // 不能放入背包
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i]); // 放入或不放入背包
            }
        }
    }

    // 输出结果
    cout << dp[n][W] << endl;
    return 0;
}
```

### 完全背包问题
**问题描述**：
Given weights and values of `n` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack. In other words, given two integer arrays `v[0..n-1]` and `w[0..n-1]` which represent values and weights associated with `n` items respectively. Also given an integer `W` which represents knapsack capacity, find out the maximum value subset of `v[]` such that sum of the weights of this subset is smaller than or equal to `W`. You can take an item multiple times.

Input:
- An integer `n` representing the number of items.
- An integer `W` representing the maximum capacity of the knapsack.
- An integer array `v[0..n-1]` representing the values of the items.
- An integer array `w[0..n-1]` representing the weights of the items.

Output:
- An integer representing the maximum value that can be accommodated in the knapsack.

<br>

**问题分析**：
完全背包问题与0-1背包问题类似，但每个物品可以选择多次放入背包。因此，状态转移方程需要进行调整。
##### 状态转移方程
对于每个物品`i`，有两种选择：
- 不放入背包：此时最大价值为`dp[i-1][j]`
- 放入背包：前提是当前物品的重量`w[i]`不超过当前背包容量`j`，此时最大价值为`dp[i][j-w[i]] + v[i]`（注意这里是`dp[i][j-w[i]]`，表示可以多次选择第`i`个物品）

因此，状态转移方程为：
$$
dp[i][j] = \max(dp[i-1][j], dp[i][j-w[i]] + v[i])
$$
其余步骤与0-1背包问题相同。

**代码实现**：
```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAXN (100)
#define MAXW (1000)
int dp[MAXN][MAXW]; // dp数组
int w[MAXN]; // 物品重量
int v[MAXN]; // 物品价值
int n, W; // 物品数量和背包容量

int main() {
    // 输入物品数量和背包容量
    cin >> n >> W;
    // 输入物品的重量和价值
    for (int i = 1; i <= n; i++) {
        cin >> w[i] >> v[i];
    }

    // 初始化dp数组
    memset(dp, 0, sizeof(dp));

    // 动态规划填表
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j <= W; j++) {
            if (j < w[i]) {
                dp[i][j] = dp[i-1][j]; // 不能放入背包
            } else {
                dp[i][j] = max(dp[i-1][j], dp[i][j-w[i]] + v[i]); // 放入或不放入背包
            }
        }
    }

    // 输出结果
    cout << dp[n][W] << endl;
    return 0;
}
```

### 多重背包问题
多重背包也是 0-1 背包的一个变式。与 0-1 背包的区别在于每种物品有$k_i$个而非1个。

**状态转移方程**：
    对于每个物品`i`，可以选择放入背包$k$个：前提是当前物品的重量`w[i]`不超过当前背包容量`j`且`k < k[i]`，状态转移方程为：
$$
dp[i][j] = \max_{k=0}^{k_i}(dp[i-1][j-k*w[i]] + k*v[i])
$$
其余步骤与0-1背包问题相同。

## Interval DP 区间DP

区间DP是一类特殊的动态规划问题，通常用于解决涉及区间划分或区间合并的问题。区间DP的核心思想是将问题划分为若干个子区间，通过解决这些子区间的问题来构建整个区间的问题的解。

### 例题：环形石子合并
**题目描述：**
将 $n$ 堆石子绕圆形操场排放，现要将石子有序地合并成一堆。规定每次只能选相邻的两堆合并成新的一堆，并将新的一堆的石子数记做该次合并的得分。

请编写一个程序，读入堆数 $n$ 及每堆的石子数，并进行如下计算：

1. 选择一种合并石子的方案，使得做 $n-1$ 次合并得分总和最大。
2. 选择一种合并石子的方案，使得做 $n-1$ 次合并得分总和最小。

**输入：**
输入第一行一个整数 $n$，表示有 $n$ 堆石子。

第二行 $n$ 个整数，表示每堆石子的数量。

**输出：**
输出共两行：

第一行为合并得分总和最小值，

第二行为合并得分总和最大值。

<details class="note-solution">
<summary>查看解析</summary>

#### 状态设计
区间DP的通常套路就是对一个数组进行区间划分，枚举区间内的每个位置作为划分点，然后通过子区间的结果来构建当前区间的结果。
以最大化为例：
1. **定义状态**：
    定义状态 `dp[i][j]` 表示将区间 `[i, j]` 内的石子合并成一堆所能得到的最大得分总和，其中 `0 <= i <= j < n`。
2. **状态转移方程**：
    对于每个区间 `[i, j]`，我们枚举所有可能的划分点 `k`，将其分为左右两个非空子区间 `[i, k]` 和 `[k+1, j]`，然后通过这两个子区间的结果来更新当前区间的结果。具体地，状态转移方程为：
    $$dp[i][j] = \max_{k \in [i, j-1]} (dp[i][k] + dp[k+1][j] + \text{sum}(i, j))$$
    其中，`sum(i, j)` 表示区间 `[i, j]` 内所有石子数量的总和。
3. **边界条件**：
    对于长度为1的区间，即 `dp[i][i]`，其值为0，因为不需要合并。
4. **答案的表示**：
    最终的结果就是 `dp[0][n-1]`，表示将整个区间合并成一堆所能得到的最大得分总和。
注意，为了方便计算`sum(i, j)`，我们使用前缀和优化。

#### 核心实现
```cpp
#include <bits/stdc++.h>

using namespace std;

#define MAXN 100

int N = 0;
int a[2 * MAXN];
int s[2 * MAXN + 1];
int dp1[2 * MAXN][2 * MAXN]; // dp[i][j] = \max_{k \in [i, j-1]} (dp[i][k] + dp[k+1][j] + \text{sum}(i, j))
int dp2[2 * MAXN][2 * MAXN];

int main() {
    cin >> N;
    for (int i = 0; i < N; i++) {
        cin >> a[i];
        a[N + i] = a[i];
    }
    // 前缀和
    s[0] = 0;
    for (int i = 0; i < 2 * N; i++) {
        s[i + 1] = a[i] + s[i];
    }
    for (int i = 0; i < 2 * N; i++) {
        for (int j = 0; j < 2 * N; j++) {
            if (i == j) {
                dp1[i][j] = 0;
                dp2[i][j] = 0;
            } else {
                dp1[i][j] = 0;
                dp2[i][j] = INT_MAX;
            }
        }
    }

    for (int l = 2; l <= N; l++) {
        for (int i = 0; i + l <= 2 * N; i++) {
            int j = i + l - 1;
            for (int k = i; k < j; k++) {
                int cost = s[j + 1] - s[i];
                dp1[i][j] = max(dp1[i][j], dp1[i][k] + dp1[k + 1][j] + cost);
                dp2[i][j] = min(dp2[i][j], dp2[i][k] + dp2[k + 1][j] + cost);
            }
        }
    }
    int min_ans = INT_MAX;
    int max_ans = 0;
    for (int i = 0; i < N; i++) {
        min_ans = min(min_ans, dp2[i][N + i - 1]);
        max_ans = max(max_ans, dp1[i][N + i - 1]);
    }
    cout << min_ans << endl << max_ans;
    return 0;
}
```

#### 易错点
1. 能这样直接套用状态转移方程吗？
```cpp
for(int i=0;i<N;i++){
    for(int j=i;j<N;j++){
        for(int k=i;k<j;k++){
            dp1[i][j]=max(dp1[i][j], dp1[i][k]+dp1[k+1][j]+s[j+1]-s[i]);
            dp2[i][j]=min(dp2[i][j], dp2[i][k]+dp2[k+1][j]+s[j+1]-s[i]);
        }
    }
}
```
不能！因为$k+1>i$，所以`dp[k+1][j]`可能还没有被计算出来就被使用了。
正确做法：
```cpp
for(int l=2;l<=N;l++){ // 枚举区间长度
    for(int i=0;i+l<=N;i++){ // 枚举区间起点
        int j=i+l-1; // 计算区间终点
        for(int k=i;k<j;k++){ // 枚举划分点
            dp1[i][j]=max(dp1[i][j], dp1[i][k]+dp1[k+1][j]+s[j+1]-s[i]);
            dp2[i][j]=min(dp2[i][j], dp2[i][k]+dp2[k+1][j]+s[j+1]-s[i]);
        }
    }
}
```
2. 由于是环形的，所以我们将**数组复制一遍**，变成线性问题，然后枚举起点。
3. 注意前缀和的计算。

</details>

## Tree DP 树形DP

树形DP是一种特殊的动态规划技术，适用于树形结构的问题。由于树固有的递归性质，树形 DP 一般都是递归进行的。

#### 基本形式
树形DP主要通过**dfs**遍历树的节点，并在每个节点上计算状态。通常，我们会为每个节点定义一个或多个“状态”，然后通过子节点的状态来计算父节点的状态。

例如：`dp[u][0]` 和 `dp[u][1]` 分别表示以节点 `u` 为根的子树中，当节点 `u` 不被选中和被选中时的最优解。

### 选择节点类树形DP
选择节点类树形DP问题通常涉及在树的节点上做出选择，以最大化或最小化某个值，同时满足特定的约束条件。
例如：
$$
\begin{cases}
dp[u][1] &= \max(dp[v][0], dp[v][1])\\

dp[u][0] &= dp[v][0]
\end{cases}
$$

#### 例题：没有上司的舞会
某大学有 $n$ 个职员，编号为 $1$ 到 $n$。他们之间有从属关系，也就是说他们的关系就像一棵以校长为根的树，父结点就是子结点的直接上司。

现在有个周年庆宴会，宴会每邀请来一个职员都会增加一定的快乐指数 $r_i$ ，但是呢，如果某个职员的直接上司来参加舞会了，那么这个职员就无论如何也不肯来参加舞会了。

所以，请你编程计算，邀请哪些职员可以使快乐指数最大，求最大的快乐指数。

---

输入格式
输入的第一行是一个整数 $n$。

第 $2$ 到第 $(n+1)$ 行，每行一个整数，第 $(i+1)$ 行的整数表示 $i$ 号职员的快乐指数 $r_i$ 。

第 $(n+2)$ 到第 $2n$ 行，每行输入一对整数 $l,k$，代表 $k$ 是 $l$ 的直接上司。

---
输出格式
输出一行一个整数代表最大的快乐指数。

<details class="note-solution">
<summary>查看解析</summary>

#### 状态设计
##### 定义状态
对于本题，我们会定义两个状态：
- `dp[u][0]`：表示以节点 `u` 为根的子树中，当节点 `u` 不被选中时的最大快乐指数。
- `dp[u][1]`：表示以节点 `u` 为根的子树中，当节点 `u` 被选中时的最大快乐指数。
##### 状态转移方程
- 当节点 `u` 被选中时，其子节点不能被选中，因此：
  $$dp[u][1] = r_u + \sum_{v \in children(u)} dp[v][0]$$
- 当节点 `u` 不被选中时，其子节点可以选择被选中或不被选中，因此：
  $$dp[u][0] = \sum_{v \in children(u)} \max(dp[v][0], dp[v][1])$$
##### 边界条件
对于叶子节点 `u`：
- 如果 `u` 被选中：
  $$dp[u][1] = r_u$$
- 如果 `u` 不被选中：
  $$dp[u][0] = 0$$
##### 最终结果
最终，我们需要计算根节点的最大快乐指数，即：
$$\max(dp[root][0], dp[root][1])$$

**代码：**
```cpp
#include <bits/stdc++.h>

using namespace std;
#define MAXN (6005)

int n;
int happy[MAXN];
vector<int> child[MAXN];
bool root[MAXN];
int f[MAXN][2];

int dp(int r, int x)
{
    if (f[r][x] != INT_MAX)
    {
        return f[r][x];
    }
    if (child[r].size() == 0)
    {
        f[r][x] = x == 0 ? 0 : happy[r];
        return f[r][x];
    }
    int ans;
    if (x == 0)
    {
        ans = 0;
        for (int c : child[r])
        {
            ans += max(dp(c, 0), dp(c, 1));
        }
    }
    else
    {
        ans = happy[r];
        for (int c : child[r])
        {
            ans += dp(c, 0);
        }
    }
    f[r][x] = ans;
    return ans;
}

int main()
{
    ios::sync_with_stdio(0);
    cin.tie(0);
    cin >> n;
    for (int i = 1; i <= n; i++)
    {
        cin >> happy[i];
    }
    for (int i = 0; i < n - 1; i++)
    {
        int l, k;
        cin >> l >> k;
        child[k].push_back(l);
        root[l] = 1;
    }

    int r = 1;
    for (int i = 1; i <= n; i++)
    {
        if (!root[i])
        {
            r = i;
            break;
        }
    }

    // dp[i,0/1]->i为根的树的最优解
    // dp[i,0]=for child: sum(max (dp(child, 0), dp(child,1)))
    // dp[i,1]=sum(dp(child,0))+happy(i)
    fill(&f[1][0], &f[1][0] + n * 2, INT_MAX);
    cout << max(dp(r, 0), dp(r, 1));
    return 0;
}
```

</details>

### 树上背包
树上背包是背包问题与树形DP的结合。其状态转移方程通常涉及在树的节点上进行选择，同时考虑背包容量的限制。
例如：
$$
dp[u][j] = \max(dp[u][j], dp[u][j - w] + val)
$$

#### 例题：选课
在大学里每个学生，为了达到一定的学分，必须从很多课程里选择一些课程来学习，在课程里有些课程必须在某些课程之前学习，如高等数学总是在其它课程之前学习。现在有 $N$ 门功课，每门课有若干学分，分别记作 $s_1, s_2, \ldots, s_N$，每门课有一门或没有直接先修课（若课程 $a$ 是课程 $b$ 的先修课即只有学完了课程 $a$，才能学习课程 $b$）。一个学生要从这些课程里选择 $M$ 门课程学习，问他能获得的最大学分是多少？

---
输入格式
第一行包含两个用空格分隔的整数 $N$ 和 $M$，$1 \le N \le 300,\qquad 1 \le M \le 300$。

接下来的 $N$ 行，第 $i+1$ 行包含两个整数 $k_i$ 和 $s_i$：
- $k_i$ 表示第 $i$ 门课的直接先修课编号；
- $s_i$ 表示第 $i$ 门课的学分。

若 $k_i=0$ 则表示第 $i$ 门课没有直接先修课。变量的取值范围为
$$
0 \le k_i \le N,\qquad 1 \le s_i \le 20,\qquad i=1,2,\dots,N.
$$

---
输出格式
输出一个整数，表示学生能获得的最大学分。

<details class="note-solution">
<summary>查看解析</summary>

#### 状态设计
由于课程之间存在先修关系，我们可以将这些课程表示为一棵树，其中每个节点代表一门课程，边表示先修关系。假设一个0号节点为没有先修课的课程的虚拟根节点，可以以此节点为根进行dfs。
##### 定义状态
定义 `dp[u][j]` 表示以节点 `u` 为根的子树中，**最多**选择 `j` 门课程所能获得的最大学分（必须选`u`自己）。
##### 状态转移方程
对于每个节点 `u`，我们可以选择不选或选它的子节点。状态转移方程如下：
$$
\text{for each child v of u}:\, dp[u][j] = \max(dp[u][j], dp[v][k] + dp[u][j - k])
$$
其中 `v` 是 `u` 的子节点，`k` 是选择的子节点数量。
且：
$$
j \in [1, M + 1]
$$
$$
k \in [0, \min(j - 1, \text{size}(v))]
$$
##### 边界条件
对于某个节点 `u`：
- `dp[u][0] = 0`，表示不选课程 `u`
- `dp[u][1] = s_u`，表示选课程 `u`，但是只能选自己而不选任何子结点
##### 答案的表示
最终答案为 `dp[0][M + 1]`，即以虚拟根节点为根的子树中，最多选择 `M + 1` 门课程所能获得的最大学分。因为虚拟节点是必选的，所以需要`M + 1`。

#### 核心实现
```cpp
#include <bits/stdc++.h>
using namespace std;

int N, M;
int s[305];
vector<int> f[305];
int dp[305][305];
int sz[305];

void dfs(int u)
{
    sz[u] = 1;
    for (int j = 0; j <= M; j++)
        dp[u][j] = INT_MIN;
    dp[u][0] = 0;
    dp[u][1] = s[u];
    for (int ch : f[u])
    {
        dfs(ch); // 遍历子树，填充dp数组（此时递归填充的是dp[i][*]， i为ch的子孙）
        sz[u] += sz[ch];
        for (int j = M + 1; j >= 1; j--)
        {
            for (int k = 0; k <= min(j - 1, sz[ch]); k++)
            {
                dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[ch][k]);
            }
        }
    }
}
int main()
{
    cin.tie(0)->sync_with_stdio(0);
    cin >> N >> M;
    for (int i = 1; i <= N; i++)
    {
        int k;
        cin >> k;
        f[k].push_back(i);
        cin >> s[i];
    }

    // 定义dp[u, i, j]表示以u为根的前i棵子树中选了j门课的最优解
    // 则：dp[u,i,j]=max(dp[u,i-1,j-k]+dp[v,num_of_children(v),k])
    // 优化：定义dp[u, j]表示以u为根的中最多选j门课的最优解
    // dp[u,j]=max(dp[u,j], dp[u,j-k]+dp[v,k]) foreach child v, for j = M downto 1, for k = 0 to size(v)
    dfs(0);
    cout << dp[0][M + 1] << endl;
    return 0;
}
```
#### 关键问题：
1. 为什么要从后往前枚举 `j`？
   因为每次更新 `dp[u][j]` 都累加了之前的状态 `dp[u][j - k]`，如果从前往后枚举，会导致使用到已经更新过的状态，影响结果的正确性。

   可以这样考虑：假设我们能选择任意多的课程，那么最好能把所有的课程都选上，但是由于背包容量的限制，我们只能选择有限的课程。因此，我们考虑先选`M`门课程，再考虑少选课程的情况。假如无法选择这么多课程，`dp` 数组中的值不会累加当前结果，从而保持正确性。

   但如果从前往后枚举 `j`，在计算 `dp[u][j]` 时，就会重复加上之前已经更新过的状态，导致结果错误。
   例如：如果u->v，并且我们从前往后枚举j：
   - 计算 `dp[u][2]`，`dp[u][2] = max(dp[u][2], dp[u][1] + dp[v][1])`
   - 计算 `dp[u][3]`，`dp[u][3] = max(dp[u][3], dp[u][2] + dp[v][1])`，此时`dp[u][2]`已经被更新过，包含了`dp[v][1]`，导致重复累计了`dp[v][1]`的值。
2. 为什么 `k` 的范围是 `0` 到 `min(j - 1, size(v))`？
   因为在选择子节点 `v` 的课程时，最多只能选择 `j - 1` 门课程（因为还要留一门给当前节点 `u`），同时也不能超过子节点 `v` 本身的课程数量 `size(v)`。
3. 怎么计算 `size(v)`？
   在 `dfs` 函数中，我们通过递归计算每个节点的子树大小，并存储在 `sz` 数组中。每次遍历子节点时，累加子节点的大小即可得到当前节点的大小。

</details>

## State DP 状压DP

状压 DP 通过将**状态集合转化为整数记录**在 DP 状态中来实现状态转移的目的。大部分题目中会利用二元状态，用$n$位二进制数表示$n$个独立二元状态的情况。

状压DP通常涉及位运算。

### 例题：棋盘放国王

在 $N \times N$ 的棋盘里面放 $K$ 个国王（$1 \leq N \leq 9, 1 \leq K \leq N \times N$），使他们互不攻击，共有多少种摆放方案。

国王能攻击到它上下左右，以及左上左下右上右下八个方向上附近的各一个格子，共 8 个格子。

<details class="note-solution">
<summary>查看解析</summary>

#### 定义状态
设 `dp[i][j][s]` 表示在前 `i` 行放置了 `j` 个国王，并且第 `i` 行的状态为 `s` 的方案数。
满足 `j <= count(s)`。

对于状态 `s`，用二进制的第 `k` 位表示第 `k` 列是否放置国王，1 表示放置，0 表示不放置。

例如，`s = 101` 表示在该行的第 1 列和第 3 列放置了国王。

#### 状态转移方程
对于每一行 `i`，我们需要遍历所有可能的状态 `s`，并检查该状态是否合法（即没有相邻的国王）。如果合法，我们需要遍历前一行的所有状态 `p`，并检查 `s` 和 `p` 是否冲突（即没有国王互相攻击）。如果不冲突，我们可以将 `dp[i-1][j - count(s)][p]` 的值加到 `dp[i][j][s]` 中。 其中，`count(s)` 表示状态 `s` 中 1 的个数。

则状态转移方程为：

$$
dp[i][j][s] += dp[i-1][j - count(s)][p]
$$

#### 初始条件
`dp[0][0][0] = 1`，表示在第 0 行放置 0 个国王且状态为 0 的方案数为 1。

#### 答案的表示
答案为所有 `dp[N][K][s]` 的和，其中 `s` 为所有合法状态。即
$$
ans = \sum_{s \in \{\text{合法状态}\}} dp[N][K][s]
$$

**代码：**
```cpp
#include <bits/stdc++.h>
using namespace std;

#define MAX_N (9 + 5)
#define MAX_K (81 + 5)
#define MAX_S (1 << 9)
#define int long long

int N, K;
int dp[MAX_N][MAX_K][MAX_S];
vector<int> state;

signed main()
{
    // cin.tie(0)->sync_with_stdio(false);

    cin >> N >> K;
    cout.flush();

    // 获取所有的行内合法性
    for (int i = 0; i < (1 << N); i++)
    {
        if (i & (i << 1))
            continue;
        state.push_back(i);
    }

    int S = state.size();

    dp[0][0][0] = 1;
    for (int i = 1; i <= N; i++)
    {
        for (int j = 0; j <= K; j++)
        {
            for (int s = 0; s < S; s++)
            {
                int st = state[s];
                int cnt = __builtin_popcount(st); //  count(s)
                if (j < cnt)
                    continue;
                for (int p = 0; p < S; p++)
                {
                    int pt = state[p];
                    if ((st & pt) || (st & (pt << 1)) || (st & (pt >> 1)))
                        continue;
                    dp[i][j][st] += dp[i - 1][j - cnt][pt];
                }
            }
        }
    }

    int ans = 0;
    for (int s = 0; s < S; s++)
    {
        ans += dp[N][K][state[s]];
    }
    cout << ans << endl;
    return 0;
}
```

</details>

## Digit DP 数位DP

#### 适用条件

1. 题目要求计算某个范围内数字的某种性质，例如数码出现次数或数位和。
2. 该性质可以通过逐位分析数字来计算。

### 例题：数码计数
给定两个正整数$𝑎$和$𝑏$，求在$[a,b]$中的所有整数中，每个数码（digit）各出现了多少次。
例如，$a=10$，$b=12$，则在区间$[10,11,12]$中，数码$0$出现了$1$次，数码$1$出现了$4$次，数码$2$出现了$1$次。

输入：两个正整数$𝑎$和$𝑏$，$(1 \leq a \leq b \leq 10^{12})$。
输出：$10$个整数，分别表示数码$0$到$9$在区间$[a,b]$中出现的次数。

<details class="note-solution">
<summary>查看解析</summary>

#### 解法
这题很难。关键在于求出`[0, b]`中每个数码出现的次数，然后再减去`[0, a-1]`中每个数码出现的次数即可。

首先需要求`dp`数组，用于表示每位数码出现的次数。

##### 定义状态
显然，00...0到99...9，每个数出现的次数都是相同的。例如，00到99中，每个数码出现19次（对于0：10~90、01~09、00，共19次；对于9：09~89、90~98、99，共19次）

不考虑前导零，设 `dp[n]` 表示 `n` 位数中，每个数码出现的次数。
##### 状态转移方程
考虑 `n` 位数，分为最高位`i`和其他位，分别考虑两部分中一种数码出现的次数。则：
1. 对于前 `n-1` 位，出现次数显然为 `dp[n-1]`。但由于最高位可以是0~9，故需要乘以10，即为 `10 * dp[n-1]`。
2. 对于最高位，它出现了 `10^(i-1)` 次。（例如：1000~1999，出现的次数即为000~999的数字个数，即为`10^(i-1)`）

因此，状态转移方程为：
$$
dp[n] = 10 \cdot dp[n-1] + 10^{n-1}
$$

##### 初始条件
`dp[0] = 0`，表示0位数中，每个数码出现0次。

##### 别忘了前导0
显然，前导0就是诸如：000(0：这个算正常0)、0001、0002、...、0999等数字中的0。需要单独考虑。
对于`n`位数，前导0的个数为：
$$
    10^{n-1} + 10^{n-2} + ... + 10^{1} = \frac{10^{n}-10}{9}
$$

##### 答案的表示
这是题目的难点之一。假设数字为ABCD，规定A不为0。采用从最高位逐步向最低位计算的方式。

首先需要用一个数组存储每一位的出现次数。假设现在在考虑数字`d`。

1. 首先考虑0000~(A-1)999中，**除了最高位**的`d`出现的个数。显然，答案为 `A * dp[3]`，即（0000~(A-1)999），`for x in [0,9]: count[x] += A* dp[3]`。
2. 再考虑首先考虑0000~(A-1)999中，**最高位中**`d`出现的个数。显然，`0,1,...,A-1`中，每个数码都出现了`10^(4-1)`次，因此，`for x in [0, A-1]: count[x] += 10^(4-1)`。
3. 还需要考虑A000~ABCD，此时，最高位A还出现了`BCD + 1`次，需要加上。`count[A] += BCD + 1`。
4. 减去当前的前导0。`count[0] -= 10^(4-1)`。
5. 此时的问题转化为求BCD中的某个数位的个数，进入了子问题。每一次考虑下一位都会对数位的出现次数统计值进行更新。

**代码：**
```cpp
#include <bits/stdc++.h>
using namespace std;
#define int long long

int a, b;
int dp[15];
int pow10[13];
int countA[10];
int countB[10];

void count(int a, int *cnt)
{
    if (a == 0)
    {
        cnt[0]++;
        return;
    }
    int x = a;
    vector<int> b;
    while (x)
    {
        b.push_back(x % 10);
        x /= 10;
    }
    int bits = b.size();
    for (int i = bits; i >= 1; i--)
    {
        int cur = b[i - 1];
        for (int f = 0; f <= 9; f++)
        {
            cnt[f] += cur * dp[i - 1];
        }
        for (int j = 0; j < cur; j++)
        {
            cnt[j] += pow10[i - 1];
        }
        int y = 0;
        for (int k = i - 1; k >= 1; k--)
        {
            y = y * 10 + b[k - 1];
        }
        cnt[cur] += y + 1;
        cnt[0] -= pow10[i - 1];
        a = y;
    }
    cnt[0]++;
}

signed main()
{
    cin >> a >> b;
    pow10[0] = 1;
    dp[0] = 0;
    for (int i = 1; i <= 12; i++)
    {
        pow10[i] = 10 * pow10[i - 1];
        dp[i] = 10 * dp[i - 1] + pow10[i - 1];
    }
    count(a - 1, countA);
    count(b, countB);
    for (int i = 0; i <= 8; i++)
    {
        cout << countB[i] - countA[i] << ' ';
    }
    cout << countB[9] - countA[9] << endl;
    return 0;
}
```

</details>

### 例题：Windy 数
不含前导零且相邻两个数字之差至少为 2 的正整数被称为 windy 数。
输入a, b，计算区间 $[a, b]$ 内 windy 数的个数。

解析待补充。

## Dynamic DP 动态DP

动态树 DP 用于树上存在点权或边权修改的动态规划问题。

### 例题：动态树上 DP
[洛谷 P4179 【模板】动态树上DP](https://www.luogu.com.cn/problem/P4179)
给定一棵$n$个点的树，点带点权。有$m$次操作，每次操作给定$x,y$表示修改点$x$的权值为$y$。你需要在每次操作之后求出这棵树的最大权独立集的权值大小。

解析待补充。
