---
title: Hot 100：贪心
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 121. 买卖股票的最佳时机

给定数组 `prices`，其中 `prices[i]` 是第 `i` 天的股票价格。只能选择某一天买入，并在之后的某一天卖出，求一次交易可以获得的最大利润；若无法获利，返回 `0`。

[题目链接](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/)

### 示例

#### 示例 1

- 输入：`prices = [7,1,5,3,6,4]`
- 输出：`5`
- 解释：价格为 `1` 时买入，之后在价格为 `6` 时卖出，利润为 `6-1=5`

#### 示例 2

- 输入：`prices = [7,6,4,3,1]`
- 输出：`0`
- 解释：价格持续下降，不进行交易的利润最高

### 数据范围

- $1 \leq prices.length \leq 10^5$
- $0 \leq prices[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 维护此前最低价格

若决定在第 `i` 天卖出，为了使利润最大，应当选择第 `i` 天之前的最低价格买入。因此从左到右扫描，只需维护：

- `minPrice`：截至当前日期见过的最低价格；
- `answer`：此前所有合法买卖日期组合中的最大利润。

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = prices[0];
        int answer = 0;

        for (int price : prices) {
            answer = max(answer, price - minPrice);
            minPrice = min(minPrice, price);
        }
        return answer;
    }
};
```

处理当天价格时，`minPrice` 是当天及此前的最低价格，所以 `price - minPrice` 是以当天为卖出日的最大利润。`answer` 取所有卖出日对应利润的最大值，因此覆盖全部合法交易。利润初值为 `0`，也覆盖不交易的情况。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 与动态规划的关系

也可以令 `dp[i]` 表示前 `i+1` 天能取得的最大利润：

$$
dp[i]=\max(dp[i-1],\ prices[i]-\min_{0\leq j<i}prices[j])
$$

状态只依赖前一天最大利润和前缀最低价格，压缩后就是上面的一次扫描，无需保存整个 `dp` 数组。

### 易错点

- 卖出必须发生在买入之后，不能直接用全局最大值减全局最小值。
- 本题只能完成一次交易，不能把所有相邻上涨的利润累加。
- 持续下跌时答案是 `0`，不能返回负利润。

</details>

### 参考

- [项目现有贪心笔记](../techniques.md#greedy-%E8%B4%AA%E5%BF%83%E7%AE%97%E6%B3%95)
- [灵茶山艾府：动态规划题单中的股票问题](https://leetcode.cn/discuss/post/tXLS3i/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/solutions/)

## 55. 跳跃游戏

给定非负整数数组 `nums`，初始位于下标 `0`。`nums[i]` 表示从下标 `i` 最多能够向右跳跃的距离，判断是否能够到达最后一个下标。

[题目链接](https://leetcode.cn/problems/jump-game/)

### 示例

#### 示例 1

- 输入：`nums = [2,3,1,1,4]`
- 输出：`true`
- 解释：可以先从下标 `0` 跳到 `1`，再从下标 `1` 跳到最后一个位置

#### 示例 2

- 输入：`nums = [3,2,1,0,4]`
- 输出：`false`
- 解释：无论如何选择都会到达下标 `3`，该位置无法继续前进

### 数据范围

- $1 \leq nums.length \leq 10^4$
- $0 \leq nums[i] \leq 10^5$

<details class="note-solution">
<summary>查看解析</summary>

### 维护最远可达位置

`farthest` 表示从目前已经确认可达的所有位置出发，最远能够到达的下标。

扫描到 `i` 时：

- 若 `i > farthest`，当前下标不可达，后面的下标更不可能被处理，立即返回 `false`；
- 否则可以从 `i` 起跳，用 `i + nums[i]` 扩展最远可达范围。

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int farthest = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (i > farthest) {
                return false;
            }
            farthest = max(farthest, i + nums[i]);
        }
        return true;
    }
};
```

每轮开始时，区间 `[0,farthest]` 中的所有位置都属于当前可达范围。若 `i` 在这个区间内，从它起跳得到的新终点会被合并进可达范围；若 `i` 已在范围之外，先前所有可达位置都无法跨过这个缺口。算法因此准确判断最后一个位置是否可达。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 易错点

- `nums[i]` 是最大跳跃距离，可以选择跳 `0` 到 `nums[i]` 之间的任意距离。
- 只有可达的下标才能用于更新 `farthest`，必须先判断 `i > farthest`。
- 数组只有一个元素时已经位于终点，应返回 `true`。
- 不需要真的选择并记录一条跳跃路径；本题只询问是否可达。

</details>

### 参考

- [项目现有贪心笔记](../techniques.md#greedy-%E8%B4%AA%E5%BF%83%E7%AE%97%E6%B3%95)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/jump-game/solutions/)

## 45. 跳跃游戏 II

给定非负整数数组 `nums`，初始位于下标 `0`。`nums[i]` 表示从下标 `i` 最多能够向右跳跃的距离。返回到达最后一个下标所需的最少跳跃次数，题目保证终点一定可达。

[题目链接](https://leetcode.cn/problems/jump-game-ii/)

### 示例

#### 示例 1

- 输入：`nums = [2,3,1,1,4]`
- 输出：`2`
- 解释：从下标 `0` 跳到 `1`，再从下标 `1` 跳到最后一个位置

#### 示例 2

- 输入：`nums = [2,3,0,1,4]`
- 输出：`2`

### 数据范围

- $1 \leq nums.length \leq 10^4$
- $0 \leq nums[i] \leq 1000$
- 题目保证最后一个下标可达

<details class="note-solution">
<summary>查看解析</summary>

### 按跳跃次数扩展区间

把所有使用相同跳跃次数可以到达的位置看作一层：

- `currentEnd` 是使用 `jumps` 次跳跃能够覆盖的右边界；
- `farthest` 是扫描当前层所有位置时，下一次跳跃能够到达的最远位置。

当扫描到 `currentEnd`，当前层的所有起跳位置都已经考察完。此时必须增加一次跳跃，并把新一层边界更新为 `farthest`。这相当于只保存边界的广度优先搜索。

```cpp
class Solution {
public:
    int jump(vector<int>& nums) {
        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;
        int n = nums.size();

        for (int i = 0; i < n - 1; i++) {
            farthest = max(farthest, i + nums[i]);
            if (i == currentEnd) {
                jumps++;
                currentEnd = farthest;
            }
        }
        return jumps;
    }
};
```

在增加第 `jumps+1` 次跳跃之前，算法检查了第 `jumps` 层的所有可达位置，因此 `farthest` 是再跳一次能够覆盖的最大范围。任何方案用相同次数都不可能越过它。逐层扩展，第一次覆盖终点所用的跳跃次数必然最少。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$

### 为什么只扫描到倒数第二个位置

到达最后一个下标后不需要再次起跳。若循环扫描最后一个位置，并且它恰好等于 `currentEnd`，会把答案多加一次。因此循环条件是 `i < n - 1`。

数组长度为 `1` 时循环不会执行，正确返回 `0`。

### 易错点

- `farthest` 是扫描过的整个当前层能到达的最远位置，不是只由 `currentEnd` 位置计算。
- 只有扫描到当前层边界时才增加跳跃次数，不能每处理一个下标就增加。
- 本题保证终点可达；若没有这项保证，还需要在扩展层次时检测边界是否停滞。

</details>

### 参考

- [项目现有贪心笔记](../techniques.md#greedy-%E8%B4%AA%E5%BF%83%E7%AE%97%E6%B3%95)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/jump-game-ii/solutions/)

## 763. 划分字母区间

给定一个只含小写英文字母的字符串 `s`，将它划分为尽可能多的连续片段，使同一个字母最多出现在一个片段中。所有片段按顺序连接后仍为原字符串，返回每个片段的长度。

[题目链接](https://leetcode.cn/problems/partition-labels/)

### 示例

#### 示例 1

- 输入：`s = "ababcbacadefegdehijhklij"`
- 输出：`[9,7,8]`
- 解释：可以划分为 `"ababcbaca"`、`"defegde"`、`"hijhklij"`，每个字母只属于其中一个片段

#### 示例 2

- 输入：`s = "eccbbbbdec"`
- 输出：`[10]`

### 数据范围

- $1 \leq s.length \leq 500$
- `s` 仅由小写英文字母组成

<details class="note-solution">
<summary>查看解析</summary>

### 由最后出现位置确定边界

先记录每个字母最后一次出现的下标。扫描一个片段时，只要片段中出现了字母 `c`，片段右端点就至少要覆盖 `last[c]`，否则该字母会跨越两个片段。

令 `end` 为当前片段内所有已扫描字母的最远末次出现位置：

$$
end=\max(end,last[s[i]])
$$

当 `i == end` 时，当前片段中的所有字母都不会在右侧再次出现，可以立即在这里切分。选择这个最早合法边界，才能留下最多的后续片段。

```cpp
class Solution {
public:
    vector<int> partitionLabels(string s) {
        array<int, 26> last{};
        for (int i = 0; i < s.size(); i++) {
            last[s[i] - 'a'] = i;
        }

        vector<int> answer;
        int start = 0, end = 0;
        for (int i = 0; i < s.size(); i++) {
            end = max(end, last[s[i] - 'a']);
            if (i == end) {
                answer.push_back(end - start + 1);
                start = i + 1;
            }
        }
        return answer;
    }
};
```

扫描到 `end` 前不能切分，因为已出现的某个字母还会在片段右侧出现。扫描到 `end` 时，片段内每个字母的最后位置都不超过 `end`，所以这里是当前片段最早的合法结束位置。每次都采用最早合法切点，得到的片段数量最多。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(1)$，字母表大小固定为 26

### 示例过程

字符串 `"ababcbaca..."` 从下标 `0` 开始：

1. 字母 `a` 最后出现在下标 `8`，当前边界扩展到 `8`；
2. 扫描边界以内的 `b`、`c`，它们最后出现的位置也都不超过 `8`；
3. 到达下标 `8` 时可以切分，第一个片段长度为 `9`。

若某个新字母的最后位置超过当前 `end`，必须继续扩大当前片段，不能提前切开。

### 易错点

- 需要先完成一遍末次位置统计，再开始划分。
- 当前片段边界取遇到过的所有字母末次位置的最大值，不能只看片段首字母。
- 题目要求尽可能多的片段，因此每次到达最早合法边界就应立即切分。
- 片段长度包含左右端点，计算式为 `end - start + 1`。

</details>

### 参考

- [项目现有贪心笔记](../techniques.md#greedy-%E8%B4%AA%E5%BF%83%E7%AE%97%E6%B3%95)
- [灵茶山艾府：贪心题单](https://leetcode.cn/discuss/post/3091107/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/partition-labels/solutions/)
