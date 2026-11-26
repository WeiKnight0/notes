---
title: Hot 100：滑动窗口
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 3. 无重复字符的最长子串

给定字符串 `s`，求其中不含重复字符的最长连续子串的长度。

[题目链接](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

### 示例

#### 示例 1

- 输入：`s = "abcabcbb"`
- 输出：`3`
- 解释：最长无重复子串可以是 `"abc"`，长度为 `3`。

#### 示例 2

- 输入：`s = "bbbbb"`
- 输出：`1`
- 解释：最长无重复子串是 `"b"`。

#### 示例 3

- 输入：`s = "pwwkew"`
- 输出：`3`
- 解释：最长无重复子串可以是 `"wke"`。`"pwke"` 是子序列而不是连续子串，不能作为答案。

### 数据范围

- $0 \leq s.length \leq 5\times 10^4$
- `s` 由英文字母、数字、符号和空格组成

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：集合维护窗口

窗口 `[left, right]` 始终不含重复字符。加入 `s[right]` 前，如果它已经在窗口中，就不断移除左端字符并右移 `left`，直到可以安全加入。

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_set<char> window;
        int left = 0, ans = 0;

        for (int right = 0; right < s.size(); right++) {
            while (window.count(s[right])) {
                window.erase(s[left++]);
            }
            window.insert(s[right]);
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};
```

每个字符最多进入和离开集合各一次。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(|\Sigma|)$，其中 $\Sigma$ 是字符集

### 方法二：记录字符最后出现位置

发生重复时，无须逐个移除左端字符。记录每个字符上一次出现的下标 `last[c]`，直接令窗口左端跳到重复位置之后。

`left` 只能向右移动。若字符上一次出现在当前窗口左侧，不能把 `left` 向左拉回，因此更新式为：

$$
left=\max(left,last[s[right]]+1)
$$

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        array<int, 128> last;
        last.fill(-1);
        int left = 0, ans = 0;

        for (int right = 0; right < s.size(); right++) {
            left = max(left, last[s[right]] + 1);
            last[s[right]] = right;
            ans = max(ans, right - left + 1);
        }
        return ans;
    }
};
```

例如 `s = "abba"`。处理最后一个 `a` 时，它上次出现在下标 `0`，但此时 `left = 2`，所以左端仍为 `2`，不能回退到 `1`。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(|\Sigma|)$

### 正确性

每次加入右端字符后，算法都会排除该字符在当前窗口内的上一次出现位置，因此窗口中没有重复字符。左端只越过为消除重复所必需的位置，所以以当前 `right` 结尾的无重复子串不可能比当前窗口更长。枚举所有右端点并取最大值即可得到答案。

### 易错点

- 题目求子串而不是子序列，字符必须连续。
- 使用最后位置时必须取 `max(left, last[c] + 1)`，否则窗口左端可能倒退。
- 字符串可能为空，答案初值应为 `0`。
- 若使用数组记录位置，要保证数组覆盖题目允许的字符集，不能只按 26 个小写字母处理。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题目](https://leetcode.cn/problems/longest-substring-without-repeating-characters/)

## 438. 找到字符串中所有字母异位词

给定字符串 `s` 和 `p`，找到 `s` 中所有是 `p` 的字母异位词的连续子串，返回这些子串的起始下标。答案顺序不限。

字母异位词使用相同字母及相同出现次数，只是排列顺序可能不同。

[题目链接](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

### 示例

#### 示例 1

- 输入：`s = "cbaebabacd", p = "abc"`
- 输出：`[0,6]`
- 解释：从下标 `0` 开始的 `"cba"` 和从下标 `6` 开始的 `"bac"` 都是 `"abc"` 的字母异位词。

#### 示例 2

- 输入：`s = "abab", p = "ab"`
- 输出：`[0,1,2]`
- 解释：长度为 `2` 的三个子串 `"ab"`、`"ba"`、`"ab"` 都满足条件。

### 数据范围

- $1 \leq s.length,p.length \leq 3\times 10^4$
- `s` 和 `p` 仅包含小写英文字母

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：固定长度窗口

异位词的长度一定等于 `p.length()`。维护一个同样长度的窗口，并分别统计窗口与 `p` 的 26 个字母频次。每次右移时加入新字符、移除旧字符；两个频次数组相同就记录窗口左端。

```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        if (p.size() > s.size()) {
            return {};
        }

        array<int, 26> need{}, window{};
        for (char c : p) {
            need[c - 'a']++;
        }
        for (int i = 0; i < p.size(); i++) {
            window[s[i] - 'a']++;
        }

        vector<int> ans;
        if (window == need) {
            ans.push_back(0);
        }
        for (int right = p.size(); right < s.size(); right++) {
            window[s[right] - 'a']++;
            window[s[right - p.size()] - 'a']--;
            if (window == need) {
                ans.push_back(right - p.size() + 1);
            }
        }
        return ans;
    }
};
```

数组比较需要检查 26 个位置，因此总时间仍为 $O(26n)=O(n)$。

- 时间复杂度：$O(n+|\Sigma|n)=O(n)$
- 空间复杂度：$O(|\Sigma|)=O(1)$

### 方法二：维护剩余可用次数

令 `count[c]` 表示当前窗口还能使用多少个字符 `c`。初始值是 `p` 中各字符的次数。右端字符进入窗口时将对应计数减一：

- 若计数仍不小于 `0`，该字符没有超量；
- 若计数小于 `0`，当前字符过多，需要移动左端并归还字符，直到计数恢复为 `0`。

此时窗口中每种字符都不超过 `p` 的需要量。若窗口长度又恰好等于 `p.length()`，它必然含有与 `p` 完全相同的字符。

```cpp
class Solution {
public:
    vector<int> findAnagrams(string s, string p) {
        array<int, 26> count{};
        for (char c : p) {
            count[c - 'a']++;
        }

        vector<int> ans;
        int left = 0;
        for (int right = 0; right < s.size(); right++) {
            int c = s[right] - 'a';
            count[c]--;
            while (count[c] < 0) {
                count[s[left] - 'a']++;
                left++;
            }
            if (right - left + 1 == p.size()) {
                ans.push_back(left);
            }
        }
        return ans;
    }
};
```

左右指针都只向右移动，每个字符最多进入和离开窗口各一次。

- 时间复杂度：$O(n+m)$，其中 $n=s.length()$、$m=p.length()$
- 空间复杂度：$O(|\Sigma|)=O(1)$

### 正确性

第一种方法直接比较两个长度相同子串的字符频次，频次相同与互为异位词等价。

第二种方法通过收缩窗口保证任何字符都不超出 `p` 的需求。当窗口长度等于 `p` 的长度时，窗口字符总数与 `p` 相同；既然没有字符超量，也就不可能有字符缺少，因此该窗口恰好是异位词。

### 易错点

- 比较的是字符出现次数，不能只比较字符集合。
- 窗口长度必须等于 `p.length()`，更短的窗口即使没有字符超量也不是答案。
- 固定窗口右移时，要先加入 `s[right]`，再移除下标 `right - p.size()` 的旧字符。
- `p` 比 `s` 长时没有答案，第一种写法必须在访问首个窗口前处理。

</details>

### 参考

- [灵茶山艾府：滑动窗口与双指针题单](https://leetcode.cn/discuss/post/3578981/)
- [LeetCode 官方题解：找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/solutions/1123976/zhao-dao-zi-fu-chuan-zhong-suo-you-zi-mu-xzin/)
