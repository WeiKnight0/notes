---
title: Hot 100：哈希
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 1. Two Sum 两数之和

题目来源：[1. 两数之和](https://leetcode.cn/problems/two-sum/)

题解参考：[灵茶山艾府：枚举右，维护左](https://leetcode.cn/discuss/post/mOr1u6/)

### 题目

给定整数数组 `nums` 和整数 `target`，寻找两个不同下标 `i`、`j`，使 `nums[i] + nums[j] = target`，返回这两个下标。题目保证恰好存在一组答案，返回下标的顺序不限。

不能把同一个元素使用两次。即使 `target = 2 * nums[i]`，也必须在数组中找到另一个满足条件的元素。

数据范围：

- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`

**示例 1：**

- 输入：`nums = [2,7,11,15]`，`target = 9`
- 输出：`[0,1]`
- 解释：`nums[0] + nums[1] = 2 + 7 = 9`。

**示例 2：**

- 输入：`nums = [3,2,4]`，`target = 6`
- 输出：`[1,2]`

**示例 3：**

- 输入：`nums = [3,3]`，`target = 6`
- 输出：`[0,1]`

<details class="note-solution">
<summary>查看解析</summary>

### 解法一：枚举两个下标

#### 思路

直接枚举所有满足 `i < j` 的下标对，并判断两数之和是否等于 `target`。限制 `j` 从 `i + 1` 开始，既不会重复检查同一对下标，也不会把一个元素使用两次。

#### 算法步骤

1. 枚举第一个下标 `i`。
2. 枚举 `i` 右侧的第二个下标 `j`。
3. 若 `nums[i] + nums[j] == target`，立即返回 `{i, j}`。

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) return {i, j};
            }
        }
        return {};
    }
};
```

#### 正确性

两层循环会检查每一组满足 `i < j` 的下标，因此题目中的唯一有效下标对一定会被检查到。函数只在两数之和等于 `target` 时返回，所以返回结果必然有效。

#### 复杂度

时间复杂度为 $O(n^2)$，空间复杂度为 $O(1)$。

### 解法二：枚举右端点，维护左侧元素

#### 思路

等式 `nums[i] + nums[j] = target` 可以改写为 `nums[i] = target - nums[j]`。

从左到右枚举 `j`，把它看作答案中靠右的下标。处理 `nums[j]` 时，只需要查询左侧是否出现过 `target - nums[j]`。哈希表 `index` 保存已经遍历过的数及其下标，使查询的平均时间复杂度降为 $O(1)$。

必须先查询、后插入当前元素。这样哈希表中只包含下标小于 `j` 的元素，自然保证两个下标不同。示例 3 中处理第二个 `3` 时，第一个 `3` 已经在表中，因此重复值不会造成问题。

#### 算法步骤

1. 建立从元素值到下标的哈希表 `index`。
2. 从左到右枚举下标 `j`，计算需要的另一个数 `target - nums[j]`。
3. 若该数已经在哈希表中，返回其下标和 `j`。
4. 否则把 `nums[j]` 及其下标加入哈希表，继续枚举。

以 `nums = [3,2,4]`、`target = 6` 为例：

| `j` | `nums[j]` | 需要查找 | 查询前的哈希表 | 结果 |
| --- | --- | --- | --- | --- |
| `0` | `3` | `3` | 空 | 未找到，记录 `3 -> 0` |
| `1` | `2` | `4` | `3 -> 0` | 未找到，记录 `2 -> 1` |
| `2` | `4` | `2` | `3 -> 0, 2 -> 1` | 找到，返回 `[1,2]` |

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> index;
        for (int j = 0; j < nums.size(); j++) {
            auto it = index.find(target - nums[j]);
            if (it != index.end()) return {it->second, j};
            index[nums[j]] = j;
        }
        return {};
    }
};
```

#### 正确性

处理下标 `j` 前，哈希表恰好记录此前遍历过的元素。若表中存在 `target - nums[j]`，对应下标 `i` 满足 `i < j` 且两数之和为 `target`，返回的答案有效。若不存在，则任何以 `j` 为右端点的答案都不存在。唯一答案的右端点最终一定会被枚举到，因此算法一定能找到答案。

#### 复杂度

时间复杂度平均为 $O(n)$，空间复杂度为 $O(n)$。

### 易错点

- 先插入当前元素再查询，可能在 `target = 2 * nums[j]` 时错误地重复使用同一下标。
- 返回的是下标，不是元素值。
- 数组可能包含负数，不能使用只适合非负整数的计数数组代替哈希表。
- `return {}` 只用于保持函数完整；题目已经保证答案存在。

</details>

## 49. Group Anagrams 字母异位词分组

题目来源：[49. 字母异位词分组](https://leetcode.cn/problems/group-anagrams/)

题解参考：[力扣官方题解](https://leetcode.cn/problems/group-anagrams/solutions/520131/zi-mu-yi-wei-ci-fen-zu-by-leetcode-solution/)。未找到可公开访问的灵神独立题解，本题按约定使用官方题解补充。

### 题目

给定字符串数组 `strs`，把互为字母异位词的字符串放进同一组，并返回所有分组。分组之间以及同组字符串之间的顺序都不作要求。

字母异位词使用完全相同的字符，并且每种字符的出现次数也相同，只是排列顺序可能不同。例如 `"eat"`、`"tea"` 和 `"ate"` 互为字母异位词，`"tan"` 不属于这一组。

数据范围：

- `1 <= strs.length <= 10^4`
- `0 <= strs[i].length <= 100`
- 字符串只包含小写英文字母

**示例 1：**

- 输入：`strs = ["eat","tea","tan","ate","nat","bat"]`
- 输出：`[["bat"],["nat","tan"],["ate","eat","tea"]]`
- 解释：`eat、tea、ate` 的字符组成相同，`tan、nat` 的字符组成相同，`bat` 单独成组。输出中各组的顺序可以不同。

**示例 2：**

- 输入：`strs = [""]`
- 输出：`[[""]]`

**示例 3：**

- 输入：`strs = ["a"]`
- 输出：`[["a"]]`

<details class="note-solution">
<summary>查看解析</summary>

### 解法一：排序后的字符串作为键

#### 思路

两个字符串互为字母异位词，当且仅当把它们的字符排序后得到相同字符串。因此可以把排序结果作为哈希表的键，把原字符串加入对应的数组。

例如：

| 原字符串 | 排序后的键 |
| --- | --- |
| `eat` | `aet` |
| `tea` | `aet` |
| `tan` | `ant` |
| `ate` | `aet` |

前三个键为 `aet` 的字符串会自然进入同一组，不需要逐组比较。

#### 算法步骤

1. 遍历每个字符串 `s`。
2. 复制 `s` 得到 `key`，对 `key` 的字符排序。
3. 执行 `groups[key].push_back(s)`。
4. 遍历哈希表，把每个键对应的字符串数组放入答案。

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            groups[key].push_back(s);
        }

        vector<vector<string>> ans;
        ans.reserve(groups.size());
        for (auto& [key, group] : groups) {
            ans.push_back(move(group));
        }
        return ans;
    }
};
```

#### 正确性

同一组字母异位词包含的字符及其次数相同，排序后必然得到相同的键，所以它们会进入同一个哈希表项。不是字母异位词的两个字符串至少有一种字符或出现次数不同，排序结果也不同，因此不会被错误地分到同一组。

#### 复杂度

设所有字符串的字符总数为 $S$，最长字符串长度为 $L$。对每个字符串排序，时间复杂度为 $O(S\log L)$；哈希表、键和返回结果共占用 $O(S)$ 空间。

### 解法二：字符计数作为键

#### 思路

题目限定字符串只包含 26 个小写字母。可以统计每个字母的出现次数，用长度为 26 的计数向量表示字符串，而不必对字符排序。

`"eat"` 和 `"tea"` 的计数都满足 `a、e、t` 各出现一次，其余字母出现零次，因此得到相同的键。

C++ 的 `unordered_map` 不能直接使用 `array<int, 26>` 作为键。这里把 26 个计数依次编码为字符串，并在每个数字前加入 `#` 分隔符。分隔符不能省略，否则计数 `[1, 11]` 与 `[11, 1]` 都可能拼成 `"111"`，产生错误分组。

#### 算法步骤

1. 对当前字符串统计 26 个字母的出现次数。
2. 按字母顺序把计数编码成唯一字符串键。
3. 使用该键把原字符串加入对应分组。
4. 最后收集哈希表中的所有分组。

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (const string& s : strs) {
            array<int, 26> count{};
            for (char c : s) count[c - 'a']++;

            string key;
            for (int frequency : count) {
                key += '#';
                key += to_string(frequency);
            }
            groups[key].push_back(s);
        }

        vector<vector<string>> ans;
        ans.reserve(groups.size());
        for (auto& [key, group] : groups) {
            ans.push_back(move(group));
        }
        return ans;
    }
};
```

#### 正确性

计数键完整记录了每个小写字母的出现次数。两个字符串的键相同，当且仅当 26 个字母的出现次数逐项相同，这正是互为字母异位词的充要条件。因此算法得到的每一组恰好是一组字母异位词。

#### 复杂度

设所有字符串的字符总数为 $S$，字符串数量为 $n$。统计字符需要 $O(S)$ 时间，为每个字符串编码 26 个计数需要 $O(26n)$ 时间，因此总时间复杂度为 $O(S+26n)$，通常写作 $O(S)$。空间复杂度为 $O(S+26n)$，通常写作 $O(S)$。

### 方法选择与易错点

- 排序键写法最短，也适用于字符集不固定的情况；计数键利用了只有 26 个小写字母的限制，理论时间复杂度更优。
- 空字符串的排序键为空串，计数键为 26 个零，两种方法都能正常分组。
- 返回顺序不固定，不能用分组顺序判断答案错误。
- 计数编码必须保留每个位置的边界，不能直接连接十进制数字。
- 哈希表中保存的应当是原字符串，而不是排序后的键。

</details>

## 128. Longest Consecutive Sequence 最长连续序列

题目来源：[128. 最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/)

题解参考：[灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)、[力扣官方题解](https://leetcode.cn/problems/longest-consecutive-sequence/solutions/)

### 题目

给定一个未排序整数数组 `nums`，求其中最长连续整数序列的长度。序列要求数值依次相差 `1`，但这些数在原数组中的位置不必连续，出现顺序也不重要。

数组中的重复元素只能表示同一个数值，不能让连续序列变长。题目要求设计 $O(n)$ 时间复杂度的算法。

数据范围：

- `0 <= nums.length <= 10^5`
- `-10^9 <= nums[i] <= 10^9`

**示例 1：**

- 输入：`nums = [100,4,200,1,3,2]`
- 输出：`4`
- 解释：数组包含连续序列 `[1,2,3,4]`，长度为 `4`。

**示例 2：**

- 输入：`nums = [0,3,7,2,5,8,4,6,0,1]`
- 输出：`9`
- 解释：最长连续序列是 `[0,1,2,3,4,5,6,7,8]`；重复的 `0` 不增加长度。

**示例 3：**

- 输入：`nums = [1,0,1,2]`
- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

### 解法一：排序后扫描

#### 思路

排序后，相同元素和数值连续的元素都会相邻。扫描数组时维护当前连续序列长度：

- 当前数等于前一个数，说明遇到重复元素，直接跳过。
- 当前数等于前一个数加一，当前连续序列长度加一。
- 两数之差大于一，原连续序列结束，从当前数重新计数。

#### 算法步骤

1. 空数组直接返回 `0`。
2. 将数组升序排序，初始化当前长度和最大长度为 `1`。
3. 从第二个元素开始扫描，根据相邻元素是重复、连续还是断开更新长度。
4. 返回扫描过程中出现的最大长度。

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        if (nums.empty()) return 0;
        sort(nums.begin(), nums.end());

        int current = 1;
        int ans = 1;
        for (int i = 1; i < nums.size(); i++) {
            if (nums[i] == nums[i - 1]) continue;
            if (nums[i] == nums[i - 1] + 1) {
                current++;
            } else {
                current = 1;
            }
            ans = max(ans, current);
        }
        return ans;
    }
};
```

#### 正确性

排序后，一段连续整数必然按数值顺序相邻出现，重复值也只会出现在对应数值旁边。扫描时忽略重复值、累计相差一的相邻值，并在出现缺口时重新计数，因此每个不同的连续序列都会被完整计算一次，最大值就是答案。

#### 复杂度

排序需要 $O(n\log n)$ 时间，扫描需要 $O(n)$ 时间，总时间复杂度为 $O(n\log n)$。忽略排序实现使用的栈空间，额外空间复杂度为 $O(1)$。

### 解法二：只从连续序列起点向后枚举

#### 思路

把所有数放进哈希集合，可以在平均 $O(1)$ 时间内判断某个整数是否存在。

如果集合中存在 `x - 1`，那么 `x` 一定不是一段连续序列的起点，从 `x` 向后枚举会重复计算。只有当 `x - 1` 不存在时，才从 `x` 开始不断检查 `x + 1、x + 2...`。

以 `{100,4,200,1,3,2}` 为例：

- `2、3、4` 都有前驱，不开始枚举。
- `1` 没有前驱，从 `1` 向后找到 `2、3、4`，得到长度 `4`。
- `100` 和 `200` 没有前驱，各自得到长度 `1`。

虽然存在内层 `while`，但每个数只会在所属序列从起点向后扩展时被访问一次，不会形成 $O(n^2)$ 的重复扫描。

#### 算法步骤

1. 用 `unordered_set` 对数组去重，并支持常数时间的存在性查询。
2. 枚举集合中的每个数 `x`。
3. 若 `x - 1` 存在，跳过 `x`。
4. 否则从 `x` 开始向后寻找连续整数，统计本段长度并更新答案。

```cpp
class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> values(nums.begin(), nums.end());
        int ans = 0;

        for (int x : values) {
            if (values.count(x - 1)) continue;

            int current = x;
            int length = 1;
            while (values.count(current + 1)) {
                current++;
                length++;
            }
            ans = max(ans, length);
        }
        return ans;
    }
};
```

#### 正确性

任意连续序列都有唯一的最小元素 `start`，集合中不存在 `start - 1`，所以算法一定会从它开始枚举。序列中其他元素都有前驱，不会再次启动枚举。从 `start` 不断加一，恰好访问该序列中的所有元素并在第一个缺失整数处停止，因此得到该序列的准确长度。所有序列都被计算一次，最大长度即为答案。

#### 复杂度

建立哈希集合平均需要 $O(n)$ 时间。每个不同元素至多作为起点判断一次，并在某一段扩展中访问一次，因此总时间复杂度平均为 $O(n)$。哈希集合占用 $O(n)$ 空间。

### 方法选择与易错点

- 题目明确要求 $O(n)$，最终应使用哈希集合解法；排序解法用于理解问题和对照优化过程。
- 不能对每个 `x` 都向后枚举，否则连续数组会退化为 $O(n^2)$。
- 必须使用集合去重，否则重复值会干扰长度统计。
- 空数组答案为 `0`，不能把初始答案固定为 `1` 后直接返回。
- 本题数值范围为 $[-10^9,10^9]$，执行 `x - 1` 和 `current + 1` 不会溢出 `int`。

</details>
