---
title: Hot 100：栈
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 20. 有效的括号

给定一个只含 `()`、`[]`、`{}` 六种括号字符的字符串 `s`，判断它是否有效。有效字符串要求每个右括号都与同类型的左括号配对，并且括号按正确的嵌套顺序闭合。

[题目链接](https://leetcode.cn/problems/valid-parentheses/)

### 示例

#### 示例 1

- 输入：`s = "()"`
- 输出：`true`

#### 示例 2

- 输入：`s = "()[]{}"`
- 输出：`true`

#### 示例 3

- 输入：`s = "(]"`
- 输出：`false`

#### 示例 4

- 输入：`s = "([])"`
- 输出：`true`

#### 示例 5

- 输入：`s = "([)]"`
- 输出：`false`

### 数据范围

- $1 \leq s.length \leq 10^4$
- `s` 仅由 `()[]{}` 组成

<details class="note-solution">
<summary>查看解析</summary>

### 保存尚未匹配的右括号

括号必须按照“后打开的先关闭”的顺序配对，正好符合栈的后进先出性质。

遇到左括号时，不必保存左括号本身，可以把它期待的右括号压栈。遇到右括号时，它必须等于栈顶：

- 栈为空，说明没有对应的左括号；
- 当前字符不等于栈顶，说明括号类型或嵌套顺序错误；
- 相等时弹出栈顶，表示这一对已经闭合。

扫描结束后，栈还必须为空，否则仍有左括号没有闭合。

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> expected;
        for (char c : s) {
            if (c == '(') {
                expected.push(')');
            } else if (c == '[') {
                expected.push(']');
            } else if (c == '{') {
                expected.push('}');
            } else {
                if (expected.empty() || expected.top() != c) {
                    return false;
                }
                expected.pop();
            }
        }
        return expected.empty();
    }
};
```

栈从底到顶保存所有尚未闭合的左括号所期待的右括号。每次读取右括号时，只允许它闭合最近打开的左括号，因此通过检查的每一对括号类型和顺序都正确。最后栈为空，说明没有未闭合括号，所以字符串有效。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

### 易错点

- 读取栈顶前必须先判断栈是否为空，字符串可能以右括号开头。
- 不能只统计三类括号数量；`"([)]"` 的数量相等，但嵌套顺序错误。
- 扫描结束后仍需检查栈是否为空，`"(("` 在扫描过程中不会发生匹配失败。

</details>

### 参考

- [项目现有栈、队列与双端队列笔记](../stack-queue-array.md#stack-queue-deque-%E6%A0%88-%E9%98%9F%E5%88%97-%E5%8F%8C%E7%AB%AF%E9%98%9F%E5%88%97)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/valid-parentheses/solutions/)

## 155. 最小栈

设计一个栈，支持 `push`、`pop`、`top`，并能通过 `getMin` 在常数时间内得到当前栈中的最小元素。所有操作都必须为 $O(1)$。

[题目链接](https://leetcode.cn/problems/min-stack/)

### 示例

- 输入：

  ```text
  ["MinStack","push","push","push","getMin","pop","top","getMin"]
  [[],[-2],[0],[-3],[],[],[],[]]
  ```

- 输出：

  ```text
  [null,null,null,null,-3,null,0,-2]
  ```

- 解释：依次压入 `-2、0、-3` 后最小值为 `-3`；弹出 `-3` 后，栈顶为 `0`，最小值恢复为 `-2`

### 数据范围

- $-2^{31} \leq val \leq 2^{31}-1$
- `pop`、`top` 和 `getMin` 只会在非空栈上调用
- 所有方法最多调用 $3\times 10^4$ 次

<details class="note-solution">
<summary>查看解析</summary>

### 为每一层保存最小值

只用一个变量保存最小值时，最小元素被弹出后无法知道此前的次小值。解决方法是让每个栈元素同时保存：

- 当前压入的值；
- 从栈底到当前层的最小值。

压入 `value` 时，新最小值是 `min(value, stack.top().second)`。弹栈后，新的栈顶自然带有上一层的最小值。

```cpp
class MinStack {
    stack<pair<int, int>> values;

public:
    MinStack() = default;

    void push(int value) {
        int currentMin = values.empty() ? value : min(value, values.top().second);
        values.push({value, currentMin});
    }

    void pop() {
        values.pop();
    }

    int top() {
        return values.top().first;
    }

    int getMin() {
        return values.top().second;
    }
};
```

每一层保存的第二个值等于该层及其下方所有元素的最小值。`push` 保持这个性质，`pop` 只是删除最上层，不会改变下面已有的记录。因此 `getMin` 直接读取栈顶记录，始终得到当前栈的最小元素。

- `push`、`pop`、`top`、`getMin` 的时间复杂度：$O(1)$
- 空间复杂度：$O(n)$

### 易错点

- 新值等于当前最小值时也要把相同最小值记录到新层，否则弹出重复最小值时会丢失状态。
- 不能在 `getMin` 中临时遍历栈，这会使操作退化为 $O(n)$。
- 题目保证查询和弹出时栈非空，类内部无需再返回一个伪造的默认值。

</details>

### 参考

- [项目现有栈、队列与双端队列笔记](../stack-queue-array.md#stack-queue-deque-%E6%A0%88-%E9%98%9F%E5%88%97-%E5%8F%8C%E7%AB%AF%E9%98%9F%E5%88%97)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/min-stack/solutions/)

## 394. 字符串解码

给定一个编码字符串 `s`，编码规则为 `k[encoded_string]`，表示方括号内的字符串重复 `k` 次。编码可以嵌套，返回完整的解码结果。

[题目链接](https://leetcode.cn/problems/decode-string/)

### 示例

#### 示例 1

- 输入：`s = "3[a]2[bc]"`
- 输出：`"aaabcbc"`

#### 示例 2

- 输入：`s = "3[a2[c]]"`
- 输出：`"accaccacc"`

#### 示例 3

- 输入：`s = "2[abc]3[cd]ef"`
- 输出：`"abcabccdcdcdef"`

### 数据范围

- $1 \leq s.length \leq 30$
- `s` 由小写英文字母、数字和方括号组成
- 输入保证格式合法且没有多余空格
- 重复次数是 $[1,300]$ 内的正整数，可能包含多位数字
- 解码后字符串长度不超过 $10^5$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：显式栈

遍历字符串时，`current` 保存当前层已经解码的内容，`repeat` 保存正在读取的重复次数。

遇到 `[` 时，外层内容和重复次数暂时不能完成计算，把二者一起压栈，然后从空字符串开始解析括号内层。遇到 `]` 时，当前层已经结束：弹出外层状态，将当前层重复指定次数后接到外层末尾。

以 `3[a2[c]]` 为例：

1. 读取 `3[`，保存外层 `("",3)`；
2. 读取 `a2[`，保存当前层 `("a",2)`；
3. 读取 `c]`，得到 `"a" + "cc" = "acc"`；
4. 再读取 `]`，得到 `"acc"` 重复三次。

```cpp
class Solution {
public:
    string decodeString(string s) {
        stack<pair<string, int>> states;
        string current;
        int repeat = 0;

        for (char c : s) {
            if (isdigit(c)) {
                repeat = repeat * 10 + c - '0';
            } else if (c == '[') {
                states.push({current, repeat});
                current.clear();
                repeat = 0;
            } else if (c == ']') {
                auto [prefix, count] = states.top();
                states.pop();
                string decoded;
                while (count--) {
                    decoded += current;
                }
                current = prefix + decoded;
            } else {
                current += c;
            }
        }
        return current;
    }
};
```

- 时间复杂度：$O(T)$，$T$ 为各层展开和拼接产生的字符总数；若最终长度为 $L$、嵌套深度为 $d$，最坏可达 $O(Ld)$
- 空间复杂度：$O(L+d)$，$d$ 为最大嵌套深度

### 方法二：递归解析

方括号天然形成递归结构。函数从当前位置开始解析，遇到 `]` 时返回当前层结果；调用者负责读取这一层之前的重复次数，并把返回结果重复拼接。

下标 `index` 按引用传递，所有递归层共同推进同一次扫描，不会重复解析原字符串。

```cpp
class Solution {
    string parse(const string& s, int& index) {
        string result;
        int n = s.size();
        while (index < n && s[index] != ']') {
            if (isalpha(s[index])) {
                result += s[index++];
                continue;
            }

            int repeat = 0;
            while (isdigit(s[index])) {
                repeat = repeat * 10 + s[index++] - '0';
            }
            index++;
            string inner = parse(s, index);
            index++;
            while (repeat--) {
                result += inner;
            }
        }
        return result;
    }

public:
    string decodeString(string s) {
        int index = 0;
        return parse(s, index);
    }
};
```

- 时间复杂度：$O(T)$，含义与显式栈方法相同
- 空间复杂度：$O(L+d)$，包括结果和递归栈

### 正确性

无论显式栈还是递归，每遇到一对最内层括号，都会先得到其中完整的解码字符串，再按照括号前的次数重复，并接回它所属的外层。最内层处理正确后，逐层向外合并，最终得到整个编码串的解码结果。

### 易错点

- 重复次数可能有多位，必须用 `repeat = repeat * 10 + digit` 连续读取。
- 进入新的一层后要清空当前字符串和重复次数。
- 字母可以出现在括号外，例如第三个示例末尾的 `ef`。
- 递归版本中，调用前越过 `[`，返回后越过对应的 `]`，两个位置不能混淆。

</details>

### 参考

- [项目现有栈、队列与双端队列笔记](../stack-queue-array.md#stack-queue-deque-%E6%A0%88-%E9%98%9F%E5%88%97-%E5%8F%8C%E7%AB%AF%E9%98%9F%E5%88%97)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/decode-string/solutions/)

## 739. 每日温度

给定整数数组 `temperatures`，其中 `temperatures[i]` 表示第 `i` 天的温度。返回数组 `answer`，`answer[i]` 表示第 `i` 天之后要等待多少天才会出现更高温度；若以后不会升温，则该位置为 `0`。

[题目链接](https://leetcode.cn/problems/daily-temperatures/)

### 示例

#### 示例 1

- 输入：`temperatures = [73,74,75,71,69,72,76,73]`
- 输出：`[1,1,4,2,1,1,0,0]`

#### 示例 2

- 输入：`temperatures = [30,40,50,60]`
- 输出：`[1,1,1,0]`

#### 示例 3

- 输入：`temperatures = [30,60,90]`
- 输出：`[1,1,0]`

### 数据范围

- $1 \leq temperatures.length \leq 10^5$
- $30 \leq temperatures[i] \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 单调栈

栈中保存仍未找到更高温度的日期下标，并让对应温度从栈底到栈顶单调不增。

扫描到第 `i` 天时，如果当前温度高于栈顶日期 `j` 的温度，那么：

- `i` 是 `j` 右侧第一个温度更高的日期；
- 等待天数是 `i - j`；
- `j` 的答案已经确定，可以弹栈。

继续比较新的栈顶，当前温度可能同时解决多个较早日期。最后把 `i` 压栈，等待以后出现更高温度。

```cpp
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> answer(n);
        stack<int> pending;

        for (int i = 0; i < n; i++) {
            while (!pending.empty() &&
                   temperatures[pending.top()] < temperatures[i]) {
                int day = pending.top();
                pending.pop();
                answer[day] = i - day;
            }
            pending.push(i);
        }
        return answer;
    }
};
```

下标 `day` 在入栈后、出栈前遇到的温度都不高于 `temperatures[day]`。使它出栈的 `i` 是扫描到的第一个更高温度，所以 `i - day` 正是最短等待天数。最终仍在栈中的日期右侧没有更高温度，其初值 `0` 就是正确答案。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

### 易错点

- 栈中必须保存下标，只有下标才能计算等待天数。
- 题目要求严格升温，相同温度不能弹栈，比较符号应为 `<`。
- 未找到更高温度的位置应保留为 `0`，无需在扫描后再次处理栈。

</details>

### 参考

- [项目现有单调栈笔记](../techniques.md#monotonic-stack-%E5%8D%95%E8%B0%83%E6%A0%88)
- [灵茶山艾府：单调栈题单](https://leetcode.cn/discuss/post/3579480/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/daily-temperatures/solutions/)

## 84. 柱状图中最大的矩形

给定非负整数数组 `heights`，其中 `heights[i]` 表示一根宽度为 `1` 的柱子高度，所有柱子相邻。返回柱状图中由连续柱子构成的最大矩形面积。

[题目链接](https://leetcode.cn/problems/largest-rectangle-in-histogram/)

### 示例

#### 示例 1

- 输入：`heights = [2,1,5,6,2,3]`
- 输出：`10`
- 解释：高度为 `5` 和 `6` 的两根连续柱子可以组成高为 `5`、宽为 `2` 的矩形，面积为 `10`

#### 示例 2

- 输入：`heights = [2,4]`
- 输出：`4`

### 数据范围

- $1 \leq heights.length \leq 10^5$
- $0 \leq heights[i] \leq 10^4$

<details class="note-solution">
<summary>查看解析</summary>

### 从枚举高度到寻找边界

把每根柱子 `i` 当作矩形中的最低柱子。以 `heights[i]` 为高度时，矩形可以向两侧延伸，直到遇到第一根严格更矮的柱子。

若左侧第一个更矮的位置是 `left`，右侧第一个更矮的位置是 `right`，那么可覆盖的柱子区间是 `[left+1,right-1]`：

$$
width=right-left-1
$$

$$
area=heights[i]\times(right-left-1)
$$

逐根向两侧寻找边界会达到 $O(n^2)$。单调栈可以在一次扫描中确定这些边界。

### 单调递增栈

维护柱高单调不减的下标栈。遇到更矮的当前柱 `i` 时，栈顶 `mid` 无法继续向右延伸：

- `i` 是 `mid` 右侧第一个严格更矮的位置；
- 弹出 `mid` 后的新栈顶是其左侧更矮的位置；
- 此时可以立即计算以 `heights[mid]` 为高度的最大矩形。

在数组两端各加入高度为 `0` 的哨兵。左哨兵保证弹栈后仍有左边界，右哨兵负责结算扫描结束时仍留在栈中的柱子。

```cpp
class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        vector<int> h{0};
        h.insert(h.end(), heights.begin(), heights.end());
        h.push_back(0);

        int answer = 0;
        stack<int> increasing;
        increasing.push(0);

        int n = h.size();
        for (int i = 1; i < n; i++) {
            while (h[increasing.top()] > h[i]) {
                int mid = increasing.top();
                increasing.pop();
                int left = increasing.top();
                answer = max(answer, h[mid] * (i - left - 1));
            }
            increasing.push(i);
        }
        return answer;
    }
};
```

以 `[2,1,5,6,2,3]` 为例，扫描到高度 `2` 时，高度 `6` 与 `5` 依次出栈。高度 `5` 出栈后，左侧更矮柱高度为 `1`，右侧更矮柱是当前的 `2`，因此它覆盖原数组中的 `5、6` 两根柱子，面积为 $5\times2=10$。

每根柱子出栈时，左右第一个更矮的位置都已确定，所以计算的是以它为最低高度时能够取得的最大宽度。所有柱子都会在更矮柱或右哨兵到来时结算，最大值因此覆盖所有可能的最优矩形。

- 时间复杂度：$O(n)$，每个下标最多入栈、出栈各一次
- 空间复杂度：$O(n)$

### 相同高度如何处理

代码只在当前高度严格更小时弹栈，因此相同高度可以同时留在栈中。它们随后会从右向左依次结算，最左侧的同高柱能得到包含整段同高柱的最大宽度，不会遗漏答案。

也可以在相等时弹栈，但必须确保左哨兵不会被弹出，并统一重新计算边界。两种规则都能正确实现，不能把判断符号单独替换而不调整其余逻辑。

### 易错点

- 栈中保存下标而不是高度，宽度由下标差计算。
- 左右边界本身都比 `heights[mid]` 更矮，不能包含在矩形中，所以宽度需要减一。
- 右侧哨兵不可省略，否则递增数组中的柱子不会出栈结算。
- 面积上界为 $10^9$，在 32 位有符号整数范围内。

</details>

### 参考

- [项目现有单调栈笔记](../techniques.md#monotonic-stack-%E5%8D%95%E8%B0%83%E6%A0%88)
- [灵茶山艾府：单调栈题单](https://leetcode.cn/discuss/post/3579480/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/largest-rectangle-in-histogram/solutions/)
