---
title: String 字符串
date: 2026-07-10
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## KMP 字符串匹配

给定主串 $T$ 和模式串 $P$，模式匹配要查找 $P$ 在 $T$ 中第一次出现的位置。

朴素匹配在失配后将主串起点后移一位，并从模式串头部重新比较，最坏时间复杂度为 $O(nm)$。KMP 利用已匹配部分的前后缀关系移动模式串，主串指针不回退。

### 相等前后缀

串的前缀必须从第一个字符开始，后缀必须在最后一个字符结束。计算相等前后缀时不包含字符串本身。

假设在 $P[j]$ 处失配，已经匹配了 $P[0\ldots j-1]$。若这段已匹配字符的最长相等真前缀和真后缀长度为 $k$，则可以将模式串移动到 $P[k]$ 继续比较。

### next 数组

这里采用 `next[0] = -1` 的定义：当 $P[j]$ 失配时，下一次将 $P[next[j]]$ 与当前主串字符比较。`next[j]` 等于 $P[0\ldots j-1]$ 的最长相等真前后缀长度。

例如：

```text
P       = A  B  A  B  C  A  B  A  B
j       = 0  1  2  3  4  5  6  7  8
next[j] = -1 0  0  1  2  0  1  2  3
```

`next` 数组本身也使用前面已经计算的前后缀信息，因此可以在 $O(m)$ 时间内构造。

```cpp
vector<int> computeNext(const string &P) {
    int length = P.size();
    vector<int> next(length);
    next[0] = -1; // 初始化
    int j = 0, k = -1; // j是当前计算的位置，k是上一个匹配成功的位置
    while (j < length - 1) {
        if(k == -1 || P[j] == P[k]) {
            // 如果找不到匹配的
            // 或者继上一次匹配后当前字符也匹配成功
            j++;
            k++;
            next[j] = k; // 更新next数组
        } else {
            k = next[k]; // 回溯，回退到上一个匹配的地方
        }
    }
    return next;
}
```

### KMP 匹配

```cpp
int KMP(const string &T, const string &P) {
    vector<int> next = computeNext(P);
    int i = 0; // T的下标
    int j = 0; // P的下标
    int tLength = T.size();
    int pLength = P.size();
    while (i < tLength && j < pLength) {
        if (j == -1 || T[i] == P[j]) {
            // j==-1表示P已经回溯到最前面了，或者当前字符匹配成功
            i++;
            j++;
        } else {
            j = next[j]; // 回溯P的位置
        }
    }
    if (j == pLength) {
        return i - j; // 找到匹配，返回起始位置
    } else {
        return -1; // 未找到匹配
    }
}
```

主串指针 $i$ 最多向右移动 $n$ 次，模式串的预处理需要 $O(m)$ 时间，因此总时间复杂度为 $O(n+m)$，额外空间复杂度为 $O(m)$。

### nextval

若失配后的新比较字符 $P[next[j]]$ 与刚刚失配的 $P[j]$ 相同，这次比较必然再次失败。`nextval` 将这类位置继续回退到 `nextval[next[j]]`，避免无效比较：

$$
nextval[j]=
\begin{cases}
next[j], & next[j]=-1 \text{ or } P[j]\ne P[next[j]] \\
nextval[next[j]], & P[j]=P[next[j]]
\end{cases}
$$

`nextval` 只减少字符比较次数，不改变 KMP 的渐进复杂度。

仍以模式串 `ABABCABAB` 为例，其 `next` 与 `nextval` 分别为：

```text
P          = A  B  A  B  C  A  B  A  B
下标 j      = 0  1  2  3  4  5  6  7  8
next[j]    = -1 0  0  1  2  0  1  2  3
nextval[j] = -1 0 -1 0  2 -1 0 -1 0
```

例如 `j=3` 时，`next[3]=1`，但 $P[3]=P[1]=\texttt{B}$。若 `P[3]` 与主串当前字符失配，回退到 `P[1]` 后仍会拿同一个 `B` 与同一主串字符比较，结果必然再次失配，所以直接令 `nextval[3]=nextval[1]=0`。同理，`j=2`、`5`、`7` 都跳到 `-1`；`j=4` 的 `C` 与 $P[2]=\texttt{A}$ 不同，不能跳过，故保留 `nextval[4]=2`。

构造 `nextval` 时复用 `next`：

```cpp
vector<int> computeNextVal(const string &pattern) {
    vector<int> next = computeNext(pattern);
    vector<int> nextval(pattern.size());
    nextval[0] = -1;
    for (int j = 1; j < pattern.size(); ++j) {
        nextval[j] = pattern[j] == pattern[next[j]]
            ? nextval[next[j]]
            : next[j];
    }
    return nextval;
}
```

## String Hash 字符串哈希

1. 在 Hash 函数值不一样的时候，两个字符串一定不一样；
2. 在 Hash 函数值一样的时候，两个字符串大概率一样，但不一定一样（哈希冲突）。

### 常用的字符串哈希方法
#### 多项式 Hash
设字符串 S 的长度为 n，字符集大小为 m，选取一个大于 m 的整数 p 作为基数，选取一个大质数 M 作为模数，则字符串 S 的 Hash 值可以定义为：
$$
H(S) = (S[0] * p^{n-1} + S[1] * p^{n-2} + ... + S[n-1] * p^0) \mod M
$$
或
$$
H(S) = (S[0] * p^0 + S[1] * p^1 + ... + S[n-1] * p^{n-1}) \mod M
$$

#### 滚动 Hash
滚动 Hash 允许我们在 O(1) 时间内计算字符串的子串 Hash值。假设我们有字符串 S 的 Hash 值 H(S)，要计算 S 的子串 `S[i..j]` 的 Hash 值，可以使用以下公式：
$$
H(S[i..j]) = (H(S[0..j]) - H(S[0..i-1]) * p^{j-i+1}) \mod M
$$

### Hash 冲突
Hash 冲突是指两个不同的字符串映射到相同的 Hash 值。

Hash冲突的概率：我们设 Hash 的取值空间（所有可能出现的字符串的数量）为 $d$，计算次数（要计算的字符串数量）为 $n$，则发生 Hash 冲突的概率约为：
$$
P(collision) \approx 1 - exp\left({-\frac{n(n-1)}{2d}}\right)
$$

介绍一下常见的卡Hash的规律：
#### 卡大模数 Hash
出题人要卡大模数 Hash时，通常会使得：
1. $d > M$，即 Hash 的取值空间大于模数，这样会增加冲突的概率。
2. $p(n, d)$ 很大。

#### 卡自然溢出 Hash
当模数很大时，上面的方法卡不了。此时会卡自然溢出Hash。这时哈希函数通常是：
$$
H(S) = S[0] * p^{n-1} + S[1] * p^{n-2} + ... + S[n-1] * p^0 \mod 2^{64}
$$
其中 $M = 2^{64}$，是`unsigned long long`的最大值加一。由于计算机的存储格式，所有的数字会自动对 $2^{64}$ 取模。
下面根据不同的 $p$ 来分析卡法：
1. 当 $p$ 为偶数时，若 $len(S) > 64$，则必然发生冲突。因为此时 $p^{len(S)-1} \equiv 0 \pmod{M}$ ，导致高位信息丢失。
2. 当 $p$ 为奇数时，我们可以构造出一些特殊的字符串来卡 Hash。此处略过。

### Hash 的改进

#### 双 Hash：减少冲突
双 Hash 是指使用两个不同的 Hash 函数来计算字符串的 Hash 值，从而减少 Hash 冲突的概率。

#### 多次询问 Hash：减少计算的时间复杂度
单次计算一个字符串的哈希值复杂度是 $O(n)$，但如果需要多次询问同一个字符串的不同子串的哈希值，可以预处理出前缀哈希数组，从而将每次询问的时间复杂度降低到 $O(1)$。

设字符串 S 的长度为 n，预处理前缀哈希数组 H：
$$
H[i] = (S[0] * p^0 + S[1] * p^1 + ... + S[i] * p^i) \mod M
$$
满足：
$$
H[i] = (H[i-1] + S[i] * P[i]) \mod M
$$
预处理幂数组 P：
$$
P[i] = p^i \mod M
$$
则子串 S[i..j] 的 Hash 值可以通过以下公式计算：
$$
H(S[i..j]) = (H[j] - H[i-1] * P[j-i+1]) \mod M
$$

模版：
```cpp
using ull = unsigned long long;
ull base = 131;
ull mod1 = 212370440130137957, mod2 = 1e9 + 7;

ull get_hash1(std::string s) {
  int len = s.size();
  ull ans = 0;
  for (int i = 0; i < len; i++) ans = (ans * base + (ull)s[i]) % mod1;
  return ans;
}

ull get_hash2(std::string s) {
  int len = s.size();
  ull ans = 0;
  for (int i = 0; i < len; i++) ans = (ans * base + (ull)s[i]) % mod2;
  return ans;
}

bool cmp(const std::string s, const std::string t) {
  bool f1 = get_hash1(s) != get_hash1(t);
  bool f2 = get_hash2(s) != get_hash2(t);
  return f1 || f2;
}
```

## Boyer-Moore (BM) 字符串匹配算法

在文本编辑器中搜索一个词，或者使用 `grep` 命令时，速度之所以快，很大程度上归功于 BM 算法及其变种。

传统的（朴素）字符串匹配是从左到右，一个字符一个字符地比。如果文本有一百万字，效率非常低。
**BM 算法的核心优势在于“跳跃”**：当发现不匹配时，它不是移动一位，而是利用规则一次性向后滑动多位。

> **核心结论**：模式串（要找的词）越长，BM 算法通常越快。这是反直觉的，但在 BM 算法中是事实。

---

### 2. BM 算法的两个“反常识”设计

在深入规则之前，必须记住 BM 算法的两个独特行为：

1.  **从后往前比**：
    虽然模式串是相对于文本向右移动的，但在比较每一个字符时，BM 是**从模式串的末尾**开始倒着比的。
2.  **贪心跳跃**：
    算法同时参考两条规则（坏字符、好后缀），哪条规则能让模式串向右跳得更远，就听谁的。

---

### 3. 核心规则一：坏字符规则 (Bad Character Rule)

这是最直观的规则。

##### 场景


当我们从后往前比较时，发现文本中的某个字符（叫它 `X`）和模式串对应位置的字符不匹配。这个 `X` 就是**坏字符**。

##### 策略
既然 `X` 导致了不匹配，我们就在模式串里找找：**“我的模式串里有没有 `X` 这个字？”**

1.  **情况 A：模式串里根本没有 `X`**
    * **结论**：既然模式串里没这个字，那么只要模式串还覆盖着文本中的 `X`，就绝不可能匹配。
    * **操作**：直接把整个模式串搬到 `X` 的后面。
    * **效果**：直接跳过一大段，效率极高。

2.  **情况 B：模式串里有 `X`**
    * **结论**：虽然现在对不上，但也许滑一滑，把模式串里的 `X` 和文本里的 `X` 对齐，就能匹配了。
    * **操作**：移动模式串，让模式串中最靠右的 `X` 与文本中的 `X` 对齐。

##### 图解示例
假设文本是 `...C D E F...`，模式串是 `A B C D`。

```text
文本:  ... C  D  E  F ...
模式:      A  B  C  D
                    ^ (比较 D 和 F，不匹配！F 是坏字符)
```

- **分析**：模式串 `ABCD` 里没有 `F`。
- **操作**：直接跳过 `F`。

Plaintext

```
文本:  ... C  D  E  F ...
模式:                 A  B  C  D
```

*(一下子跳过了整个模式串的长度)*

------

### 4. 核心规则二：好后缀规则 (Good Suffix Rule)

这是一条“以此类推”的规则，用于处理部分匹配的情况。

##### 场景

我们在从后往前比较时，末尾的几个字符已经匹配成功了（这部分叫**好后缀**），但在中间某个位置卡住了。

##### 策略

既然尾巴（好后缀）已经匹配了，我们能不能利用这个已知信息？

1. **情况 A：模式串前面还有“好后缀”**
   - **逻辑**：模式串里有没有另一段和“好后缀”长得一样的子串？
   - **操作**：把模式串移动一下，让前面那个重复的子串，对准现在文本里匹配好的位置。
2. **情况 B：模式串前面没有完整的“好后缀”**
   - **逻辑**：虽然没有完全一样的重复段，但也许好后缀的**一部分**（后缀的后缀）出现在了模式串的**开头**（前缀）？
   - **操作**：移动模式串，让头部和尾部重合的部分对齐。
3. **情况 C：啥都没有**
   - **操作**：直接把整个模式串滑过去。

##### 图解示例

###### 1. 对应情况 A（模式串里有重复的好后缀）

假设模式串为 `B A B ... B A B`，文本与之匹配了一部分 `B A B` 后发现不匹配。

```text
文本:  ... X  B  A  B ...
模式:      B  A  B ... B  A  B
           ^  ^  ^     ^  ^  ^
           (重复部分)   (好后缀)
```

- **分析**：好后缀是 `BAB`。模式串的前半段也有一个 `BAB`。
- **操作**：移动模式串，让前面的 `BAB` 对齐文本现在的 `BAB`。

###### 2. 对应情况 B（好后缀的后缀匹配模式串的前缀）

假设模式串为 `A B ... C A B`，好后缀是 `CAB`。

```text
文本:  ... X  C  A  B ...
模式:      A  B ... C  A  B
           ^  ^     ^  ^  ^
           (前缀)    (好后缀 CAB)
```

- **分析**：好后缀 `CAB` 在模式串里没有完整重复。但好后缀的后缀 `AB` 与模式串的前缀 `AB` 吻合。
- **操作**：移动模式串，让开头的前缀 `AB` 对齐文本末尾的 `AB`。

###### 3. 对应情况 C（完全没关系）

假设模式串为 `D E F`，好后缀 `F`。

```text
文本:  ... X  F ...
模式:      D  E  F
              ^
             (好后缀)
```

- **分析**：好后缀 `F`，模式串前面既没有 `F`，前缀也跟 `F` 没关系。
- **操作**：直接把整个模式串跳过 `F`。

------

### 5. 完整工作流程演练

让我们用一个经典的例子，模拟计算机的视角。

- **文本 (Text)**: `HERE IS A SIMPLE EXAMPLE`
- **模式 (Pattern)**: `EXAMPLE`

##### 第一轮比较

```text
位置: 0123456...
文本: HERE IS A SIMPLE EXAMPLE
模式: EXAMPLE
      ^^^^^^^
```

1. **比较方向**：从模式串末尾（'E'）对应文本的 'S'（索引 6）。
2. **发现**：`S` 和 `E` 不匹配。
3. **坏字符**：`S`。
4. **决策**：
   - 模式串 `EXAMPLE` 里没有 `S`。
   - **操作**：直接将模式串移到 `S` 后面（向右滑动 7 位）。模式串起始位置从 0 变到 7。

##### 第二轮比较

```text
位置: ...6789...
文本: ...S A SIMPLE EXAMPLE
模式:     EXAMPLE
          ^^^^^^
```

*(注：模式串起始位置为 7，末尾字符 'E' 对齐文本的第 13 位 'P')*

1. **比较方向**：从末尾开始。
2. **发现**：文本的 `P` (索引 13) 和模式串的 `E` 不匹配。
3. **坏字符**：`P`。
4. **决策**：
   - 模式串里有 `P`（倒数第 3 位，索引 4）。
   - **操作**：将模式串向右滑动，让模式串里的 `P` 对齐文本的 `P`。
   - *移动量*：末尾索引 6 - P的索引 4 = 2 位。
   - 新起始位置：7 + 2 = 9。

##### 第三轮比较

```text
位置: ...9...
文本: ... SIMPLE EXAMPLE
模式:    EXAMPLE
         ^^^^^^^
```

*(注：模式串起始位置为 9，覆盖文本 ` SIMPLE`)*

1. **比较方向**：从后往前。
   - E (模) = E (文) 
   - L (模) = L (文) 
   - P (模) = P (文) 
   - M (模) = M (文) 
   - **A (模) ≠ I (文)**  (索引 11)
2. **发现**：坏字符 `I`，好后缀 `MPLE`。
3. **决策**：
   - **坏字符规则**：`I` 不在模式串中。单纯用此规则可移动让模式串越过 `I`。
   - **好后缀规则**：好后缀是 `MPLE`。
     - 模式串其他地方有 `MPLE` 吗？无。
     - 模式串有前缀匹配 `MPLE` 的后缀吗？有！前缀 `E` 匹配后缀 `E`。
   - **操作**：移动模式串，让开头的前缀 `E` 对齐文本中刚刚匹配位置的 `E` (索引 15)。
   - *移动量*：6 位 (从位置 9 跳到 15)。

##### 第四轮比较

```text
位置: ...15...
文本: ...LE EXAMPLE
模式:     EXAMPLE
          ^^^^^^^
```

*(注：模式串起始位置 15，末尾对齐文本第 21 位 'P')*

1. **比较方向**：从末尾开始。
2. **发现**：模式串 `E` ≠ 文本 `P`。
3. **坏字符**：`P`。
4. **决策**：
   - 模式串里有 `P`。
   - **操作**：对齐 `P`。向右滑动 2 位。
   - 新起始位置：15 + 2 = 17。

##### 第五轮比较

```text
位置: ...17...
文本: ...LE EXAMPLE
模式:       EXAMPLE
            ^^^^^^^
```

1. **比较方向**：从后往前。
2. **结果**：全部匹配！搜索成功。

------

### 6. 性能总结

BM 算法之所以是工业界的宠儿，归结于以下几点：

- **最佳时间复杂度**：$O(N/M)$。
  - $N$ 是文本长度，$M$ 是模式串长度。
  - 意味着：**模式串越长，跳得越远，速度越快**。这是 KMP 算法做不到的。
- **平均性能**：在处理自然语言（英文、代码）时，BM 算法通常比 KMP 快 3-5 倍。
- **最差情况**：$O(N \times M)$。虽然理论存在，但在实际文本搜索中极少遇到。

------

### 7. C++ 代码实现

以下是一个包含**坏字符规则**和**好后缀规则**完整实现的 BM 算法示例。

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

// --- 预处理坏字符规则 ---
void getBadChar(const string& p, vector<int>& badChar) {
    int m = p.size();
    // 初始化为 -1
    for (int i = 0; i < 256; i++) {
        badChar[i] = -1;
    }
    // 记录模式串中每个字符最后出现的位置
    for (int i = 0; i < m; i++) {
        badChar[(unsigned char)p[i]] = i;
    }
}

// --- 预处理好后缀规则 ---
// suffix[i] 表示 pattern[0...i] 和 pattern 的最长公共后缀长度
void getSuffix(const string& p, vector<int>& suffix) {
    int m = p.size();
    suffix[m - 1] = m;
    for (int i = m - 2; i >= 0; i--) {
        int j = i;
        while (j >= 0 && p[j] == p[m - 1 - (i - j)]) {
            j--;
        }
        suffix[i] = i - j;
    }
}

void getGoodSuffix(const string& p, vector<int>& gs) {
    int m = p.size();
    vector<int> suffix(m);
    getSuffix(p, suffix);

    // 初始化：如果没有匹配的好后缀，直接移动 m 位
    // 同时也涵盖了 Case 3 (什么都没匹配到) 和 Case 2 的默认情况
    for (int i = 0; i < m; i++) {
        gs[i] = m;
    }

    // Case 2: 模式串头部有子串匹配好后缀的后缀
    int j = 0;
    for (int i = m - 1; i >= 0; i--) {
        if (suffix[i] == i + 1) { // 找到了一个前缀等于后缀
            // 将剩余的部分 fill 进 gs
            for (; j < m - 1 - i; j++) {
                if (gs[j] == m) {
                    gs[j] = m - 1 - i;
                }
            }
        }
    }

    // Case 1: 模式串中有子串与好后缀完全匹配
    for (int i = 0; i <= m - 2; i++) {
        gs[m - 1 - suffix[i]] = m - 1 - i;
    }
}

// --- BM 搜索主函数 ---
int boyerMoore(const string& text, const string& pattern) {
    int n = text.size();
    int m = pattern.size();
    if (m == 0) return 0;

    vector<int> badChar(256);
    vector<int> goodSuffix(m);

    getBadChar(pattern, badChar);
    getGoodSuffix(pattern, goodSuffix);

    int s = 0; // s 是对齐位置（shift）
    while (s <= n - m) {
        int j = m - 1;

        // 从后往前比对
        while (j >= 0 && pattern[j] == text[s + j]) {
            j--;
        }

        if (j < 0) {
            // 匹配成功，返回下标
            return s;
            // 如果需要找下一个匹配: s += goodSuffix[0];
        } else {
            // 坏字符规则跳跃距离
            int bcShift = j - badChar[(unsigned char)text[s + j]];
            
            // 好后缀规则跳跃距离
            int gsShift = goodSuffix[j];

            // 取较大者作为跳跃步数
            s += max(bcShift, gsShift);
        }
    }
    return -1;
}

int main() {
    string text = "HERE IS A SIMPLE EXAMPLE";
    string pattern = "EXAMPLE";
    
    int result = boyerMoore(text, pattern);
    
    if (result != -1)
        cout << "Pattern found at index " << result << endl;
    else
        cout << "Pattern not found" << endl;
        
    return 0;
}
```

## Z-Function Z函数

**Z函数**（Z-function）是针对字符串定义的一种前缀匹配函数，对于长度为n的字符串s，其Z函数值组成的数组z[]满足：z[i]表示字符串s中，以第i个字符（下标从0或1开始，本文统一采用0下标）为起点的非空后缀，与字符串s的前缀的最长匹配长度。若s[i..i+z[i]-1] = s[0..z[0]-1]且z[i]为满足该等式的最大值，则z[i]即为第i位的Z函数值，特别规定z[0] = 0（或无定义，本文统一记为0，不参与前缀匹配计算）。

Z函数的概念起源于字符串算法的高效匹配需求，由以色列计算机科学家Amir、Landau等人在研究字符串模式匹配问题时逐步完善，是KMP算法的重要补充，其核心价值在于能在线性时间内完成计算，为字符串前缀后缀匹配、重复子串检测、多模式匹配等问题提供高效解决方案，广泛应用于文本处理、生物信息学（如基因序列匹配）、编译器设计等领域。

### 二、关键要素 (Key Components)

Z函数的核心要素围绕其定义、计算约束及核心特性展开，共4点，具体解析如下：

#### 1. 字符串下标约定

本文统一采用0下标约定，即字符串s的字符依次为s[0], s[1], ..., s[n-1]（n为字符串长度）。该约定是Z函数计算逻辑的基础，确保前缀与后缀的匹配范围能够精准对应，避免下标混淆导致的计算错误。

#### 2. Z数组的取值规则

Z数组的长度与原字符串长度一致，每个元素z[i]的取值范围为[0, n-i]：

- 当z[i] = 0时，说明以s[i]为起点的后缀与s的前缀无任何非空字符匹配；

- 当z[i] = k（k > 0）时，说明s[i] = s[0]、s[i+1] = s[1]、...、s[i+k-1] = s[k-1]，且s[i+k] ≠ s[k]（若i+k < n）。

#### 3. 线性时间计算的核心前提

Z函数能够在O(n)时间内完成计算，核心前提是利用“已匹配区间的信息复用”——通过维护一个当前匹配的有效区间[L, R]（表示以s[L]为起点的后缀，与前缀匹配的区间终点为R），避免对每个位置i都从头进行前缀匹配，从而降低时间复杂度。

#### 4. 特殊位置的Z值

除z[0] = 0的约定外，当i = 0时不参与后缀匹配；当字符串为全相同字符（如s = "aaaaa"）时，对于任意i ≥ 1，z[i] = n - i，这是Z函数的极端情况，也是判断字符串重复性的重要特征。

### 三、原理/机制 (Mechanism)

Z函数的核心运作机制是“区间维护+信息复用”，通过线性遍历字符串，逐步计算每个位置的Z值，具体步骤（基于0下标，时间复杂度O(n)）如下：

#### 步骤1：初始化参数

设字符串s长度为n，初始化Z数组z[]（长度为n），z[0] = 0；维护有效匹配区间[L, R]，初始值L = R = -1（表示无有效匹配区间）。

#### 步骤2：遍历字符串（i从1到n-1）

对每个位置i，分两种情况计算z[i]：

- 情况1：i > R（当前位置不在有效匹配区间内）

  - 令L = R = i，此时从s[R]与s[R - L] = s[0]开始逐字符匹配；

  - 若s[R] == s[R - L]，则R += 1，重复该过程，直到R ≥ n或s[R] ≠ s[R - L]；

  - 计算z[i] = R - L，更新有效区间[L, R] = [i, R - 1]（因为最后一次R递增后不满足匹配条件，故终点为R-1）。

- 情况2：i ≤ R（当前位置在有效匹配区间内）

  - 令k = i - L（表示i在有效区间内的相对位置，对应前缀的位置为k）；

  - 若z[k] < R - i + 1（前缀中k位置的Z值，小于i在有效区间内的剩余长度），则z[i] = z[k]，无需更新[L, R]（因为当前i的匹配长度不会超过k的匹配长度）；

  - 若z[k] ≥ R - i + 1（前缀中k位置的Z值，大于等于i在有效区间内的剩余长度），则需要扩展有效区间：令L = i，从R + 1开始，与s[R + 1 - L] = s[R + 1 - i]逐字符匹配，直到R ≥ n或s[R] ≠ s[R - L]；

  - 更新z[i] = R - L，更新有效区间[L, R] = [i, R - 1]。

#### 步骤3：输出Z数组

遍历结束后，z[]即为字符串s的Z函数值数组，每个z[i]对应第i位的最长前缀匹配长度。

#### 核心逻辑说明

有效区间[L, R]的作用是“复用已匹配的信息”：当i在[L, R]内时，i对应的后缀与前缀的匹配情况，可通过其相对位置k = i - L的Z值快速判断，无需从头匹配，从而实现线性时间计算。

### 四、详细示例 (Detailed Examples)

以下两个示例分别覆盖“普通字符串Z函数计算”和“Z函数在字符串匹配中的核心应用”，均基于0下标，确保步骤清晰、可复现。

#### 示例1：普通字符串的Z函数计算

给定字符串s = "abacaba"（n = 7），计算其Z数组，步骤如下：

- 初始化：z[0] = 0，L = R = -1；

- i = 1：i > R，L = R = 1，匹配s[1]（b）与s[0]（a），不匹配，z[1] = 0，[L, R] = [1, 0]（无效，后续自动更新）；

- i = 2：i > R，L = R = 2，匹配s[2]（a）与s[0]（a）（匹配），R = 3；s[3]（c）与s[1]（b）（不匹配），z[2] = 3 - 2 = 1，[L, R] = [2, 2]；

- i = 3：i > R，L = R = 3，匹配s[3]（c）与s[0]（a）（不匹配），z[3] = 0，[L, R] = [3, 2]（无效）；

- i = 4：i > R，L = R = 4，匹配s[4]（a）与s[0]（a）（匹配），R = 5；s[5]（b）与s[1]（b）（匹配），R = 6；s[6]（a）与s[2]（a）（匹配），R = 7（≥n），z[4] = 7 - 4 = 3，[L, R] = [4, 6]；

- i = 5：i ≤ R，k = 5 - 4 = 1，z[k] = z[1] = 0 < R - i + 1 = 6 - 5 + 1 = 2，故z[5] = 0；

- i = 6：i ≤ R，k = 6 - 4 = 2，z[k] = z[2] = 1 < R - i + 1 = 6 - 6 + 1 = 1（不成立，1不小于1），扩展L = 6，R = 6，匹配s[6]（a）与s[0]（a）（匹配），R = 7（≥n），z[6] = 7 - 6 = 1；

最终Z数组：z = [0, 0, 1, 0, 3, 0, 1]。

#### 示例2：Z函数在模式匹配中的应用（单模式匹配）

问题：给定文本串t = "ababacaba"，模式串p = "aba"，判断p是否是t的子串，若存在，输出所有匹配的起始位置（0下标）。

核心思路：构造新字符串s = p + '#' + t（'#'为分隔符，需保证不在p和t中出现），计算s的Z数组；若Z数组中存在某位置i，使得z[i] = len(p)，则该位置i对应的t中的起始位置为i - len(p) - 1。

具体步骤：

- 1. 构造s = "aba#ababacaba"，len(p) = 3，分隔符'#'下标为3；

- 2. 计算s的Z数组（关键部分）：

    - 下标4（t的第0位）：z[4] = 2（s[4..5] = "ab"，与p[0..1] = "ab"匹配，s[6] = "a" ≠ p[2] = "a"？修正：s[4] = 'a'，s[5] = 'b'，s[6] = 'a'，匹配p[0..2]，故z[4] = 3 = len(p)；

    - 下标7（t的第3位）：z[7] = 3 = len(p)（s[7..9] = "aba"，与p完全匹配）；

- 3. 匹配位置计算：

    - i = 4：对应t的起始位置 = 4 - 3 - 1 = 0；

    - i = 7：对应t的起始位置 = 7 - 3 - 1 = 3；

- 4. 结论：模式串p是t的子串，匹配起始位置为0和3。

### 五、对比分析 (Comparison)

Z函数与字符串匹配中常用的**KMP算法的前缀函数（prefix function）**极易混淆，二者均用于线性时间字符串处理，但核心用途、定义逻辑存在本质差异，具体对比如下（表格中“前缀函数”记为π函数）：

| 对比维度     | Z函数（Z-function）                                   | 前缀函数（π函数）                                 |
| ------------ | ----------------------------------------------------- | ------------------------------------------------- |
| 核心定义     | z[i]：以i为起点的后缀，与整个字符串前缀的最长匹配长度 | π[i]：以i为终点的前缀，其最长相等前缀与后缀的长度 |
| 关注对象     | 后缀与整个字符串的前缀匹配                            | 前缀自身的前缀与后缀匹配                          |
| 特殊位置取值 | z[0] = 0（约定，不参与匹配）                          | π[0] = 0（以0为终点的前缀无前后缀）               |
| 核心用途     | 单模式匹配、重复子串检测、多模式匹配                  | KMP算法核心、字符串最小周期计算、括号匹配         |
| 计算逻辑     | 维护后缀匹配的有效区间[L, R]，复用区间信息            | 基于前一位π值，逐步递推当前π值，复用前缀匹配信息  |
| 时间复杂度   | O(n)（n为字符串长度）                                 | O(n)（n为字符串长度）                             |

### 六、总结 (Summary)

Z函数是字符串中以某位置为起点的后缀与字符串前缀的最长匹配长度构成的数组，核心价值在于通过线性时间计算实现高效字符串匹配及相关问题求解，其本质是“区间维护与信息复用”的算法思想。

> （注：文档部分内容可能由 AI 生成）

## Trie 字典树

Trie是一种用于存储字符串集合的树形数据结构。它的每个节点表示一个字符，路径从根节点到某个节点表示一个字符串的前缀。
### Trie的结构
- 根节点：表示开始节点。
- 内部节点：表示字符串的前缀。
- 叶子节点：表示最后一个字符，通常用于标记字符串的结束。
例子：
```
         (root)
        /   |   \
       a    b    c
      / \     \  |
     t   n       a
    /            |
   e             t
```
在上面的例子中，Trie存储了字符串 "ate", "an", "bat", "cat"。

另一个例子：
![](https://oi-wiki.org/string/images/trie1.png)
这个字典数用边表示字符，节点表示某种状态。例如， 1 -> 4 -> 8 -> 12 代表 `caa`。

### 实现模板
```cpp
// 大部分题Trie都是小写字母，26个字母，如果有例外再修改
struct Node {
    Node* son[26]{};// 子树入口
    bool end = false;
    // 其他需要的属性
};

void insert(string word){
    Node* cur = root;
    for(char c: word){
        int idx = c - 'a';
        if(!cur->son[idx]) // 没有子树，说明没有路
        {
            cur->son[idx] = new Node(); // 创建新节点
        }
        cur = cur->son[idx];
    }
    cur->end = true; // 最后一个节点标记为单词结尾
}

bool find(string word){
    Node* cur = root;
    for(char c: word){
        int idx = c - 'a';
        if(!cur->son[idx]) // 没有子树，说明没有路
        {
            return 0;
        }
        cur = cur->son[idx];
    }
    return cur->end; // 最后一个节点是否是单词结尾
}

bool del(string word){
    Node* cur = root;
    for(char c: word){
        int idx = c - 'a';
        if(!cur->son[idx]) // 没有子树，说明没有路
        {
            return 0;
        }
        cur = cur->son[idx];
    }
    if(cur->end) {
        cur->end = false; // 标记为非单词结尾，而非删除节点，避免影响其他单词
        return 1;
    }
    return 0; // 不是单词结尾，无法删除
}
```

### 例题：检索字符串
题目描述：给定 `n` 个名字，接着给定 `m` 次点名，每次需要回答 “名字不存在”（WRONG）、“名字重复”（REPEAT）或“名字存在”（OK）。
输入格式：
- 第一行包含整数 `n`，表示 `n` 个要插入的名字数量。
- 接下来 `n` 行，每行包含一个字符串，表示要插入的名字。
- 第 `n+2` 行包含整数 `m`，表示 `m` 次点名。
- 接下来 `m` 行，每行包含一个字符串，表示要查询的名字。

输出格式：
- 对于每次查询，输出对应的结果：“WRONG”、“REPEAT”或“OK”。

<details class="note-solution">
<summary>查看解析</summary>

分析：直接使用 Trie 进行插入和查询操作即可。
```cpp
#include <bits/stdc++.h>
using namespace std;

typedef struct trie
{
    int next[500010][26], cnt; // 50万节点
    bool exist[500010];

    void insert(const char *s, int l)
    {
        int p = 0;
        for (int i = 0; i < l; i++)
        {
            int c = s[i] - 'a';
            if (!next[p][c])
                next[p][c] = ++cnt; // 编号
            p = next[p][c];         // 下一个字符
        }
        exist[p] = 1;
    }

    bool find(const char *s, int l)
    {
        int p = 0;
        for (int i = 0; i < l; i++)
        {
            int c = s[i] - 'a';
            if (!next[p][c])
                return 0;
            p = next[p][c];
        }
        return exist[p];
    }
} T1;

int main()
{
    cin.tie(0)->sync_with_stdio(0);
    int n;
    cin >> n;
    T1 *t = (T1 *)malloc(sizeof(T1));
    t->cnt = 0;
    memset(t->next, 0, sizeof(t->next));
    memset(t->exist, 0, sizeof(t->exist));
    for (int i = 0; i < n; i++)
    {
        string s;
        cin >> s;
        t->insert(s.c_str(), s.length());
    }

    int m;
    cin >> m;
    unordered_set<string> st;
    for (int i = 0; i < m; i++)
    {
        string s;
        cin >> s;
        if (st.find(s) != st.end())
        {
            cout << "REPEAT" << endl;
            continue;
        }
        if (t->find(s.c_str(), s.length()))
        {
            cout << "OK" << endl;
            st.insert(s);
            continue;
        }
        cout << "WRONG" << endl;
    }
    free(t);
    return 0;
}
```

</details>
