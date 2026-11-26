---
title: Hot 100：回溯
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 46. 全排列

给定不含重复数字的数组 `nums`，返回所有可能的全排列。答案顺序不限。

[题目链接](https://leetcode.cn/problems/permutations/)

### 示例

#### 示例 1

- 输入：`nums = [1,2,3]`
- 输出：`[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

#### 示例 2

- 输入：`nums = [0,1]`
- 输出：`[[0,1],[1,0]]`

#### 示例 3

- 输入：`nums = [1]`
- 输出：`[[1]]`

### 数据范围

- $1 \leq nums.length \leq 6$
- $-10 \leq nums[i] \leq 10$
- `nums` 中所有整数互不相同

<details class="note-solution">
<summary>查看解析</summary>

### 回溯三要素

- **路径**：`path` 保存已经填好的排列前缀；
- **选择列表**：所有尚未使用的 `nums[i]`；
- **结束条件**：路径长度等于 `nums.length`，得到一个完整排列。

排列关心顺序。`[1,2]` 和 `[2,1]` 是不同结果，因此每一层都要从整个数组中选择一个尚未使用的数，而不是只从当前下标之后选择。

### 算法过程

以 `[1,2,3]` 为例：

1. 第一位选择 `1`，剩余可选 `2、3`；
2. 第二位选择 `2`，第三位只能选择 `3`，得到 `[1,2,3]`；
3. 撤销 `2`，第二位改选 `3`，得到 `[1,3,2]`；
4. 撤销到第一层，再依次以 `2`、`3` 开头继续搜索。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;
    vector<bool> used;

    void dfs(const vector<int>& nums) {
        if (path.size() == nums.size()) {
            answer.push_back(path);
            return;
        }
        for (int i = 0; i < nums.size(); i++) {
            if (used[i]) {
                continue;
            }
            used[i] = true;
            path.push_back(nums[i]);
            dfs(nums);
            path.pop_back();
            used[i] = false;
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        answer.clear();
        path.clear();
        used.assign(nums.size(), false);
        dfs(nums);
        return answer;
    }
};
```

### 正确性

`used` 保证一条路径中每个数组元素只出现一次。路径长度达到 $n$ 时，它包含全部 $n$ 个不同元素，因此是一个合法排列。反过来，每个排列都对应决策树中唯一的一条选择顺序，循环会枚举每层所有未使用元素，所以不会漏掉任何排列。

### 复杂度

- 时间复杂度：$O(n\cdot n!)$，共有 $n!$ 个排列，复制每个排列需要 $O(n)$
- 空间复杂度：$O(n)$，不计算返回结果

### 易错点

- 排列的每层选择范围是整个数组，需要 `used` 防止重复使用。
- 递归返回后必须同时弹出路径末尾并恢复 `used[i]`。
- 保存答案时需要复制当前路径，不能只保存同一个可变对象的引用。
- 若成员变量可能被重复调用，应在入口清空答案和路径。

</details>

### 参考

- [项目现有回溯笔记](../backtracking.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/permutations/solutions/)

## 78. 子集

给定元素互不相同的整数数组 `nums`，返回它的所有子集，包括空集和数组本身。答案不能包含重复子集，顺序不限。

[题目链接](https://leetcode.cn/problems/subsets/)

### 示例

#### 示例 1

- 输入：`nums = [1,2,3]`
- 一种输出：`[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]`

#### 示例 2

- 输入：`nums = [0]`
- 输出：`[[],[0]]`

### 数据范围

- $1 \leq nums.length \leq 10$
- $-10 \leq nums[i] \leq 10$
- `nums` 中所有元素互不相同

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：选或不选

对每个元素都有两个选择：不放入子集，或放入子集。

- **路径**：已经决定选择的元素；
- **选择列表**：当前元素“选”或“不选”；
- **结束条件**：所有元素都已决定，记录路径。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& nums, int index) {
        if (index == nums.size()) {
            answer.push_back(path);
            return;
        }
        dfs(nums, index + 1);
        path.push_back(nums[index]);
        dfs(nums, index + 1);
        path.pop_back();
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        answer.clear();
        path.clear();
        dfs(nums, 0);
        return answer;
    }
};
```

每个元素的两种选择相互独立，共产生 $2^n$ 条完整路径，与所有子集一一对应。

### 方法二：枚举下一个加入的元素

进入递归时立即记录当前路径，因为任意长度的路径都是一个合法子集。参数 `start` 限制下一元素只能从后面的下标选择，避免 `[1,2]` 和 `[2,1]` 被当作两个子集。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& nums, int start) {
        answer.push_back(path);
        for (int i = start; i < nums.size(); i++) {
            path.push_back(nums[i]);
            dfs(nums, i + 1);
            path.pop_back();
        }
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        answer.clear();
        path.clear();
        dfs(nums, 0);
        return answer;
    }
};
```

下标在路径中严格递增，所以每个元素最多选择一次，每个子集也只有一种生成顺序。

### 复杂度

- 时间复杂度：$O(n\cdot2^n)$，复制所有子集需要这些时间
- 空间复杂度：$O(n)$，不计算返回结果

### 易错点

- 空集也是答案，不能从路径非空时才记录。
- 子集不关心元素选择顺序，枚举法下一层应从 `i + 1` 开始。
- 本题元素互不相同，不需要排序去重。
- 选或不选写法只在处理完全部元素时记录；枚举写法进入每层就记录，两种结束方式不要混用。

</details>

### 参考

- [项目现有回溯笔记](../backtracking.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/subsets/solutions/)

## 17. 电话号码的字母组合

给定仅包含数字 `2` 到 `9` 的字符串 `digits`，按照电话按键上的数字与字母映射，返回所有可能的字母组合。答案顺序不限。

```text
2: abc    3: def
4: ghi    5: jkl    6: mno
7: pqrs   8: tuv    9: wxyz
```

[题目链接](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/)

### 示例

#### 示例 1

- 输入：`digits = "23"`
- 输出：`["ad","ae","af","bd","be","bf","cd","ce","cf"]`

#### 示例 2

- 输入：`digits = ""`
- 输出：`[]`

#### 示例 3

- 输入：`digits = "2"`
- 输出：`["a","b","c"]`

### 数据范围

- $0 \leq digits.length \leq 4$
- `digits[i]` 为 `'2'` 到 `'9'` 中的一个数字

<details class="note-solution">
<summary>查看解析</summary>

### 回溯三要素

- **路径**：已经为前若干个数字选择的字母；
- **选择列表**：当前位置数字所对应的全部字母；
- **结束条件**：已经处理完 `digits` 中所有位置。

第 `index` 层只能选择 `digits[index]` 对应的字母。与全排列不同，选择过的字母无需标记，因为每层代表不同的数字位置。

```cpp
class Solution {
    const array<string, 10> letters = {
        "", "", "abc", "def", "ghi",
        "jkl", "mno", "pqrs", "tuv", "wxyz"
    };
    vector<string> answer;
    string path;

    void dfs(const string& digits, int index) {
        if (index == digits.size()) {
            answer.push_back(path);
            return;
        }
        for (char letter : letters[digits[index] - '0']) {
            path.push_back(letter);
            dfs(digits, index + 1);
            path.pop_back();
        }
    }

public:
    vector<string> letterCombinations(string digits) {
        answer.clear();
        path.clear();
        if (digits.empty()) {
            return answer;
        }
        dfs(digits, 0);
        return answer;
    }
};
```

以 `"23"` 为例，第一层依次选择 `a、b、c`，每个选择进入第二层后再依次选择 `d、e、f`，形成 $3\times3=9$ 个组合。

### 正确性

每层恰好处理一个数字并从它对应的字母集合中选择一个字符。到达结束条件时，路径长度等于数字数量，且每个位置都符合按键映射，所以路径是合法组合。所有位置的所有字母都被循环枚举，因此不会漏解；每条不同的选择序列对应唯一字符串，因此不会重复。

### 复杂度

设输入中有 $a$ 个数字对应 `3` 个字母，$b$ 个数字对应 `4` 个字母：

- 组合数量为 $3^a4^b$；
- 时间复杂度：$O((a+b)3^a4^b)$，包含复制每个字符串的开销；
- 空间复杂度：$O(a+b)$，不计算返回结果。

### 易错点

- 空字符串的答案是 `[]`，不是包含空字符串的 `[""]`。
- 数字字符转下标应使用 `digits[index] - '0'`。
- `7` 和 `9` 各对应四个字母，不能假设每个数字都只有三个选择。
- 每次递归返回后要删除刚加入的字符。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/solutions/)

## 39. 组合总和

给定无重复正整数数组 `candidates` 和正整数 `target`，找出所有元素和为 `target` 的不同组合。每个候选数字可以重复选择任意次，答案顺序不限。

两个组合只要至少一个数字的选择次数不同，就视为不同组合；同一组数字的不同排列不算不同答案。

[题目链接](https://leetcode.cn/problems/combination-sum/)

### 示例

#### 示例 1

- 输入：`candidates = [2,3,6,7], target = 7`
- 输出：`[[2,2,3],[7]]`

#### 示例 2

- 输入：`candidates = [2,3,5], target = 8`
- 输出：`[[2,2,2,2],[2,3,3],[3,5]]`

#### 示例 3

- 输入：`candidates = [2], target = 1`
- 输出：`[]`

### 数据范围

- $1 \leq candidates.length \leq 30$
- $2 \leq candidates[i] \leq 40$
- `candidates` 中所有元素互不相同
- $1 \leq target \leq 40$
- 合法组合总数少于 `150`

<details class="note-solution">
<summary>查看解析</summary>

### 选或不选

递归状态 `(index, rest)` 表示只考虑下标 `index` 及之后的候选数，凑出剩余和 `rest`：

- **路径**：已经选择的数字；
- **选择列表**：不选择 `candidates[index]`，或再选择一次；
- **结束条件**：`rest == 0` 时得到答案；候选数用完或 `rest < 0` 时当前路径无解。

不选当前数时进入 `index + 1`；选择当前数后仍停在 `index`，因为它可以重复选择。

```cpp
class Solution {
    vector<vector<int>> answer;
    vector<int> path;

    void dfs(const vector<int>& candidates, int index, int rest) {
        if (rest == 0) {
            answer.push_back(path);
            return;
        }
        if (index == candidates.size() || rest < 0) {
            return;
        }

        dfs(candidates, index + 1, rest);
        path.push_back(candidates[index]);
        dfs(candidates, index, rest - candidates[index]);
        path.pop_back();
    }

public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        answer.clear();
        path.clear();
        dfs(candidates, 0, target);
        return answer;
    }
};
```

### 为什么不会出现重复排列

一旦递归选择“不使用当前数字”并进入 `index + 1`，后面不能再回到更小下标。因此，每个组合只会按照候选数下标非递减的顺序生成一次。例如 `[2,2,3]` 能生成，但不会再生成 `[2,3,2]` 或 `[3,2,2]`。

### 正确性

对每个候选数，递归会枚举选择它 `0、1、2...` 次的所有可能，直到剩余和为负或转向下一个候选数。因此任意合法组合对应一条唯一的选择次数路径，必然被枚举。只有剩余和恰好为零时才记录，所有输出组合之和均为目标值。

### 复杂度

搜索树大小与候选数和目标值有关。设最小候选数为 $m$：

- 递归深度最多为 $target/m+candidates.length$；
- 最坏时间复杂度可写为 $O(2^{target/m+c})$，实际会被剩余和小于零大量剪枝；
- 空间复杂度为递归深度，不计算返回结果。

### 易错点

- 选择当前数字后仍从 `index` 继续，才能重复使用。
- 不选择当前数字后进入 `index + 1`，避免同一组合产生不同排列。
- 所有候选数都是正数，因此 `rest < 0` 才能安全剪枝。
- 记录答案后应立即返回，不能继续加入正数。

</details>

### 参考

- [项目现有回溯笔记](../backtracking.md)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/combination-sum/solutions/)

## 22. 括号生成

给定括号对数 `n`，生成所有由 `n` 对括号组成且格式有效的字符串。答案顺序不限。

[题目链接](https://leetcode.cn/problems/generate-parentheses/)

### 示例

#### 示例 1

- 输入：`n = 3`
- 输出：`["((()))","(()())","(())()","()(())","()()()"]`

#### 示例 2

- 输入：`n = 1`
- 输出：`["()"]`

### 数据范围

- $1 \leq n \leq 8$

<details class="note-solution">
<summary>查看解析</summary>

### 合法前缀

从左到右构造字符串。设已经放入 `open` 个左括号和 `close` 个右括号：

- 左括号总数不足 `n` 时，可以继续放 `(`；
- 只有 `close < open` 时才能放 `)`，否则当前前缀会出现无法匹配的右括号；
- 当字符串长度达到 `2n` 时，左右括号都恰好使用 `n` 个，得到合法答案。

### 回溯三要素

- **路径**：当前括号字符串 `path`；
- **选择列表**：满足条件时选择 `(` 或 `)`；
- **结束条件**：路径长度达到 `2n`。

```cpp
class Solution {
    vector<string> answer;
    string path;

    void dfs(int n, int open, int close) {
        if (path.size() == n * 2) {
            answer.push_back(path);
            return;
        }
        if (open < n) {
            path.push_back('(');
            dfs(n, open + 1, close);
            path.pop_back();
        }
        if (close < open) {
            path.push_back(')');
            dfs(n, open, close + 1);
            path.pop_back();
        }
    }

public:
    vector<string> generateParenthesis(int n) {
        answer.clear();
        path.clear();
        dfs(n, 0, 0);
        return answer;
    }
};
```

### 为什么不需要生成后再检查

任意有效括号串的每个前缀都满足右括号数量不超过左括号数量。条件 `close < open` 在添加右括号前保证这一性质，因此搜索过程不会进入无效前缀，也不需要生成全部 $2^{2n}$ 个括号串后再筛选。

### 正确性

算法只在左括号有剩余时加入左括号，只在存在未匹配左括号时加入右括号，所以所有完成路径都有效。反过来，任意有效括号串从左到右的每一步都满足这两个选择条件，算法会沿其字符顺序走到对应叶子，因此不会漏掉合法字符串。

### 复杂度

合法结果数量是第 $n$ 个卡特兰数 $C_n$：

$$
C_n=\frac{1}{n+1}\binom{2n}{n}
$$

- 时间复杂度：$O(nC_n)$，复制每个长度为 `2n` 的答案需要 $O(n)$
- 空间复杂度：$O(n)$，不计算返回结果

### 易错点

- 能否放右括号取决于 `close < open`，不是只检查 `close < n`。
- 到达结束条件时路径长度是 `2n`。
- 每次递归返回后要删除刚加入的括号。
- 不需要额外验证完成字符串，剪枝已经保证合法。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/generate-parentheses/solutions/)

## 79. 单词搜索

给定字符网格 `board` 和字符串 `word`。判断能否从某个格子开始，通过上下左右相邻格子依次拼出 `word`。同一个格子在一条路径中不能重复使用。

[题目链接](https://leetcode.cn/problems/word-search/)

### 示例

给定网格：

```text
A B C E
S F C S
A D E E
```

#### 示例 1

- 输入：`word = "ABCCED"`
- 输出：`true`

#### 示例 2

- 输入：`word = "SEE"`
- 输出：`true`

#### 示例 3

- 输入：`word = "ABCB"`
- 输出：`false`
- 解释：最后一个 `B` 不能重复使用已经走过的格子。

### 数据范围

- $1 \leq board.length,board[i].length \leq 6$
- $1 \leq word.length \leq 15$
- `board` 和 `word` 只包含大小写英文字母

<details class="note-solution">
<summary>查看解析</summary>

### 从每个可能起点搜索

外层枚举网格中每个与 `word[0]` 相同的格子。DFS 状态 `(row, column, index)` 表示当前格子要匹配 `word[index]`：

1. 坐标越界或字符不同，当前路径失败；
2. `index` 已是最后一个字符，匹配成功；
3. 暂时把当前格改为 `'#'`，表示本条路径已使用；
4. 搜索四个相邻格子；
5. 返回前恢复原字符，供其他路径使用。

```cpp
class Solution {
    int rows, columns;

    bool dfs(vector<vector<char>>& board, const string& word,
             int row, int column, int index) {
        if (row < 0 || row >= rows || column < 0 || column >= columns ||
            board[row][column] != word[index]) {
            return false;
        }
        if (index + 1 == word.size()) {
            return true;
        }

        char letter = board[row][column];
        board[row][column] = '#';
        bool found = dfs(board, word, row - 1, column, index + 1) ||
                     dfs(board, word, row + 1, column, index + 1) ||
                     dfs(board, word, row, column - 1, index + 1) ||
                     dfs(board, word, row, column + 1, index + 1);
        board[row][column] = letter;
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        rows = board.size();
        columns = board[0].size();
        if (word.size() > rows * columns) {
            return false;
        }
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (dfs(board, word, row, column, 0)) {
                    return true;
                }
            }
        }
        return false;
    }
};
```

标记仅在当前递归路径中有效。即使某个方向已经找到答案，逻辑或短路后仍会执行后面的恢复语句，因此成功返回也不会永久修改输入网格。

### 正确性

DFS 的每一步只进入上下左右相邻且字符匹配的格子，临时标记保证路径中不会重复使用格子。匹配最后一个字符时，当前路径正好按顺序拼出整个单词。外层枚举全部起点，内层枚举每一步的全部合法方向，因此任意存在的路径都会被找到。

### 复杂度

设网格共有 $mn$ 个格子，单词长度为 $L$。第一步之后不能立刻走回上一个格子，每层最多继续三个方向：

- 时间复杂度：$O(mn\cdot3^L)$；
- 空间复杂度：$O(L)$，来自递归调用栈。

### 易错点

- 同一格子不能在一条路径中重复使用，但不同起点的搜索可以使用它。
- 无论搜索成功或失败，都应在返回前恢复当前字符。
- 字符匹配区分大小写。
- 单词长度大于格子总数时一定无解，可以直接返回。

</details>

### 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/word-search/solutions/)

## 131. 分割回文串

给定字符串 `s`，把它分割成若干非空子串，使每个子串都是回文串。返回所有可能的分割方案。

[题目链接](https://leetcode.cn/problems/palindrome-partitioning/)

### 示例

#### 示例 1

- 输入：`s = "aab"`
- 输出：`[["a","a","b"],["aa","b"]]`

#### 示例 2

- 输入：`s = "a"`
- 输出：`[["a"]]`

### 数据范围

- $1 \leq s.length \leq 16$
- `s` 只包含小写英文字母

<details class="note-solution">
<summary>查看解析</summary>

### 回溯状态

`start` 表示下一段从哪个下标开始。枚举结束下标 `end`，若 `s[start..end]` 是回文串，就把它加入路径，并从 `end + 1` 继续分割。

- **路径**：已经确定的回文子串；
- **选择列表**：所有以 `start` 开头的回文前缀；
- **结束条件**：`start == s.length()`，说明整个字符串已经分割完毕。

### 预处理回文区间

若 `s[left] == s[right]`，并且内部区间 `s[left + 1..right - 1]` 是回文串，则 `s[left..right]` 也是回文串：

$$
palindrome[left][right]=
(s[left]=s[right])\land palindrome[left+1][right-1]
$$

长度不超过 `2` 的区间没有需要检查的内部字符，只需比较两端。按 `left` 从右到左计算，能保证内部区间已经得到结果。

```cpp
class Solution {
    vector<vector<string>> answer;
    vector<string> path;
    vector<vector<bool>> palindrome;

    void dfs(const string& s, int start) {
        if (start == s.size()) {
            answer.push_back(path);
            return;
        }
        for (int end = start; end < s.size(); end++) {
            if (!palindrome[start][end]) {
                continue;
            }
            path.push_back(s.substr(start, end - start + 1));
            dfs(s, end + 1);
            path.pop_back();
        }
    }

public:
    vector<vector<string>> partition(string s) {
        int n = s.size();
        palindrome.assign(n, vector<bool>(n));
        for (int left = n - 1; left >= 0; left--) {
            for (int right = left; right < n; right++) {
                palindrome[left][right] = s[left] == s[right] &&
                    (right - left <= 2 || palindrome[left + 1][right - 1]);
            }
        }

        answer.clear();
        path.clear();
        dfs(s, 0);
        return answer;
    }
};
```

### 过程示例

对 `"aab"`：

1. 第一段选 `"a"`，剩余 `"ab"` 只能分成 `"a"、"b"`；
2. 回溯后第一段改选 `"aa"`，它本身是回文，剩余为 `"b"`；
3. `"aab"` 不是回文，不能作为单独一段。

因此得到两种分割方案。

### 正确性

预处理表准确记录每个区间是否回文。DFS 每次只选择从当前位置开始的回文子串，所以所有完成路径都合法。任意合法分割都有确定的第一段终点，循环会枚举该终点，之后递归以同样方式枚举剩余各段，因此不会漏解。每组终点序列唯一，也不会重复生成同一分割。

### 复杂度

- 回文预处理：时间和空间复杂度均为 $O(n^2)$；
- 回溯最坏会产生 $2^{n-1}$ 种分割，包含复制结果时总时间复杂度为 $O(n2^n)$；
- 不计算返回结果时，额外空间复杂度为 $O(n^2)$。

### 易错点

- 分割必须覆盖整个字符串，只有 `start == n` 时才能记录答案。
- 下一段从 `end + 1` 开始，不能重用当前字符。
- 回文预处理应按左端点从右向左计算。
- `substr` 的第二个参数是长度，应写成 `end - start + 1`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/palindrome-partitioning/solutions/)

## 51. N 皇后

在 $n\times n$ 棋盘上放置 `n` 个皇后，使任意两个皇后都不在同一行、同一列或同一条斜线上。返回所有不同的棋盘方案，其中 `Q` 表示皇后，`.` 表示空格。

[题目链接](https://leetcode.cn/problems/n-queens/)

### 示例

#### 示例 1

- 输入：`n = 4`
- 输出：

  ```text
  .Q..    ..Q.
  ...Q    Q...
  Q...    ...Q
  ..Q.    .Q..
  ```

  两个棋盘分别是一种答案。

#### 示例 2

- 输入：`n = 1`
- 输出：`[["Q"]]`

### 数据范围

- $1 \leq n \leq 9$

<details class="note-solution">
<summary>查看解析</summary>

### 按行放置

每行必须且只能放一个皇后。递归到 `row` 时枚举这一行的所有列，只需判断列和两类对角线是否已经被占用。

棋盘坐标从 `0` 开始：

- 同一列的 `column` 相等；
- 同一条主对角线上的 `row - column` 相等，为避免负下标使用 `row - column + n - 1`；
- 同一条副对角线上的 `row + column` 相等。

两类对角线编号范围都是 `[0, 2n - 2]`。

### 回溯三要素

- **路径**：棋盘中前 `row` 行已经放置的皇后；
- **选择列表**：当前行中未被列和对角线占用的位置；
- **结束条件**：`row == n`，所有行都已放置皇后。

```cpp
class Solution {
    vector<vector<string>> answer;
    vector<string> board;
    vector<bool> columns;
    vector<bool> mainDiagonals;
    vector<bool> antiDiagonals;

    void dfs(int row, int n) {
        if (row == n) {
            answer.push_back(board);
            return;
        }
        for (int column = 0; column < n; column++) {
            int mainDiagonal = row - column + n - 1;
            int antiDiagonal = row + column;
            if (columns[column] || mainDiagonals[mainDiagonal] ||
                antiDiagonals[antiDiagonal]) {
                continue;
            }

            board[row][column] = 'Q';
            columns[column] = true;
            mainDiagonals[mainDiagonal] = true;
            antiDiagonals[antiDiagonal] = true;
            dfs(row + 1, n);
            board[row][column] = '.';
            columns[column] = false;
            mainDiagonals[mainDiagonal] = false;
            antiDiagonals[antiDiagonal] = false;
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        answer.clear();
        board.assign(n, string(n, '.'));
        columns.assign(n, false);
        mainDiagonals.assign(n * 2 - 1, false);
        antiDiagonals.assign(n * 2 - 1, false);
        dfs(0, n);
        return answer;
    }
};
```

### 正确性

算法每层只处理一行，所以不同皇后不会同行；列和两类对角线占用数组保证新皇后不攻击此前皇后。到达第 `n` 行时，棋盘上恰有 `n` 个互不攻击的皇后。反过来，任意合法棋盘在每行都有唯一皇后位置，这些位置始终通过冲突检查，因此对应的搜索路径一定会被枚举。

### 复杂度

- 时间复杂度：上界为 $O(n\cdot n!)$，需要枚举列排列并复制每个棋盘；
- 空间复杂度：$O(n^2)$，棋盘占主要空间，不计算返回结果。

### 易错点

- 同一行无需额外标记，因为递归每层只放置一个皇后。
- 主对角线编号 `row - column` 可能为负，需要加 `n - 1`。
- 两类对角线不能混用同一组标记。
- 回溯时必须同时恢复棋盘、列和两类对角线状态。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/n-queens/solutions/)
