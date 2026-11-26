---
title: Math 数学
date: 2026-07-10
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## Number Theory 数论



### Primes and Sieves 质数与筛法

大于 $1$ 且只有 $1$ 和自身两个正因数的整数称为质数。大于 $1$ 的非质数称为合数，$1$ 既不是质数也不是合数。

#### 判断一个数是否为质数

若合数 $n=ab$，则 $a,b$ 中至少一个不超过 $\sqrt n$。因此只需检查 $[2,\sqrt n]$ 内是否存在 $n$ 的因数。

不要在循环条件中写 `i * i <= n`：当 `n` 接近整数上限时乘法可能溢出。使用 `i <= n / i` 更安全。

```cpp
// 判断n是否为质数
bool isPrime(long long n) {
    if (n < 2) return false;
    for (long long i = 2; i <= n / i; i++) {
        if (n % i == 0) return false;
    }
    return true;
}
```

时间复杂度 $O(\sqrt n)$，空间复杂度 $O(1)$。

#### 埃拉托斯特尼筛法

需要查询 $[1,n]$ 内的全部质数时，不应对每个数分别试除。埃氏筛从小到大枚举质数 $p$，把它的倍数标记为合数。

小于 $p^2$ 的倍数已经被更小的质因数标记，所以从 $p^2$ 开始即可。

```cpp
// 求不超过n的全部质数
vector<int> eratosthenes(int n) {
    vector<bool> isPrime(n + 1, true);
    isPrime[0] = false;
    if (n >= 1) isPrime[1] = false;

    for (int p = 2; p <= n / p; p++) {
        if (!isPrime[p]) continue;
        for (int multiple = p * p; multiple <= n; multiple += p) {
            isPrime[multiple] = false;
        }
    }

    vector<int> primes;
    for (int value = 2; value <= n; value++) {
        if (isPrime[value]) primes.push_back(value);
    }
    return primes;
}
```

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

#### 线性筛

线性筛让每个合数只被它的最小质因数筛掉一次。枚举到 $i$ 时，用已经得到的质数 $p$ 标记 $i\cdot p$；当 $p$ 整除 $i$ 后停止，因为继续枚举时，$i\cdot p'$ 的最小质因数仍然是 $p$，之后会重复标记。

```cpp
// 求不超过n的全部质数及每个数的最小质因数
pair<vector<int>, vector<int>> linearSieve(int n) {
    vector<int> primes;
    vector<int> leastPrimeFactor(n + 1);
    for (int value = 2; value <= n; value++) {
        if (leastPrimeFactor[value] == 0) {
            leastPrimeFactor[value] = value;
            primes.push_back(value);
        }
        for (int prime : primes) {
            if (prime > leastPrimeFactor[value] || 1LL * value * prime > n) break;
            leastPrimeFactor[value * prime] = prime;
        }
    }
    return {primes, leastPrimeFactor};
}
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。只需要质数表时埃氏筛更直观；还要反复分解整数时，保留最小质因数的线性筛更方便。

#### 例题

##### 204. 计数质数

题目来源：[204. 计数质数](https://leetcode.cn/problems/count-primes/)

题目描述：给定非负整数 `n`，返回严格小于 `n` 的质数数量。注意，`n` 本身即使是质数也不能计入答案。

约束：$0\le n\le5\times10^6$。

**示例 1：**

- 输入：`n = 10`

- 输出：`4`

- 解释：小于 `10` 的质数是 `2、3、5、7`。

**示例 2：**

- 输入：`n = 1`

- 输出：`0`

<details class="note-solution">
<summary>查看解析</summary>

思路：使用埃氏筛处理区间 $[0,n-1]$。代码中的数组长度是 `n`，因此所有下标天然严格小于 `n`。筛到质数 `p` 时，从 `p * p` 开始标记其倍数；更小的倍数已经被比 `p` 小的质因数处理过。

```cpp
class Solution {
public:
    int countPrimes(int n) {
        vector<bool> isPrime(n, true);
        if (n > 0) isPrime[0] = false;
        if (n > 1) isPrime[1] = false;
        for (int p = 2; p <= (n - 1) / p; p++) {
            if (!isPrime[p]) continue;
            for (int multiple = p * p; multiple < n; multiple += p) {
                isPrime[multiple] = false;
            }
        }
        return count(isPrime.begin(), isPrime.end(), true);
    }
};
```

时间复杂度 $O(n\log\log n)$，空间复杂度 $O(n)$。

</details>

### Divisors and Factorization 因数与质因数分解

若整数 $d$ 能整除正整数 $n$，即存在整数 $k$ 使 $n=dk$，则 $d$ 是 $n$ 的因数。每个大于 $1$ 的整数都能唯一地写成质数幂的乘积：

$$
n=p_1^{e_1}p_2^{e_2}\cdots p_k^{e_k}
$$

质因数的排列顺序不影响分解结果，这就是算术基本定理。

#### 枚举因数

因数成对出现：若 $d\mid n$，则 $n/d$ 也是因数。因此只需枚举到 $\sqrt n$。

```cpp
// 按升序求n的全部正因数
vector<long long> divisors(long long n) {
    vector<long long> small, large;
    for (long long divisor = 1; divisor <= n / divisor; divisor++) {
        if (n % divisor != 0) continue;
        small.push_back(divisor);
        if (divisor != n / divisor) large.push_back(n / divisor);
    }
    reverse(large.begin(), large.end());
    small.insert(small.end(), large.begin(), large.end());
    return small;
}
```

时间复杂度 $O(\sqrt n)$，除结果外空间复杂度 $O(1)$。

#### 质因数分解

从最小可能的质因数开始试除。找到因数 $p$ 后持续除以 $p$，即可得到指数 $e$。循环结束后若 `n > 1`，剩余部分本身就是一个大于原枚举上界的质数。

```cpp
// 求n的质因数及其指数
vector<pair<long long, int>> factorize(long long n) {
    vector<pair<long long, int>> factors;
    for (long long prime = 2; prime <= n / prime; prime++) {
        if (n % prime != 0) continue;
        int exponent = 0;
        while (n % prime == 0) {
            n /= prime;
            exponent++;
        }
        factors.push_back({prime, exponent});
    }
    if (n > 1) factors.push_back({n, 1});
    return factors;
}
```

时间复杂度最坏为 $O(\sqrt n)$。

#### 因数个数与因数和

由质因数分解可知，一个因数可以独立选择每个质因数的指数 $0\sim e_i$，因此正因数个数为：

$$
\tau(n)=\prod_{i=1}^{k}(e_i+1)
$$

全部正因数之和为：

$$
\sigma(n)=\prod_{i=1}^{k}\left(1+p_i+p_i^2+\cdots+p_i^{e_i}\right)
$$

例如 $72=2^3\cdot3^2$，所以它有 $(3+1)(2+1)=12$ 个正因数。

#### 批量预处理最小质因数

多次分解不超过固定上界 `limit` 的整数时，可先用线性筛得到 `leastPrimeFactor`。每次取出当前数的最小质因数并除掉，单次分解只与质因数数量有关。

```cpp
// 使用最小质因数表分解value
vector<pair<int, int>> factorize(int value, const vector<int>& leastPrimeFactor) {
    vector<pair<int, int>> factors;
    while (value > 1) {
        int prime = leastPrimeFactor[value];
        int exponent = 0;
        while (value % prime == 0) {
            value /= prime;
            exponent++;
        }
        factors.push_back({prime, exponent});
    }
    return factors;
}
```

#### 例题

##### 2521. 数组乘积中的不同质因数数目

题目来源：[2521. 数组乘积中的不同质因数数目](https://leetcode.cn/problems/distinct-prime-factors-of-product-of-array/)

题目描述：给定正整数数组 `nums`，将所有元素相乘后，返回乘积中不同质因数的数量。

约束：$1\le nums.length\le10^4$，$2\le nums[i]\le1000$。

**示例 1：**

- 输入：`nums = [2,4,3,7,10,6]`

- 输出：`4`

- 解释：乘积中出现的质因数为 `2、3、5、7`。

**示例 2：**

- 输入：`nums = [2,4,8,16]`

- 输出：`1`

- 解释：所有元素都只有质因数 `2`。

<details class="note-solution">
<summary>查看解析</summary>

思路：不能直接计算所有元素的乘积，因为乘积可能溢出。分别分解每个元素，并把出现过的质因数放入集合；乘积的质因数集合就是各元素质因数集合的并集。试除某个质因数后要一次除尽，避免重复处理同一个质因数。

```cpp
class Solution {
public:
    int distinctPrimeFactors(vector<int>& nums) {
        unordered_set<int> factors;
        for (int value : nums) {
            for (int prime = 2; prime <= value / prime; prime++) {
                if (value % prime != 0) continue;
                factors.insert(prime);
                while (value % prime == 0) value /= prime;
            }
            if (value > 1) factors.insert(value);
        }
        return factors.size();
    }
};
```

设数组长度为 $n$、元素最大值为 $M$，时间复杂度最坏为 $O(n\sqrt M)$，空间复杂度为 $O(k)$，其中 $k$ 是不同质因数数量。

</details>

### GCD and LCM 最大公约数与最小公倍数

整数 $a,b$ 的最大公约数记作 $\gcd(a,b)$，是能同时整除两数的最大正整数；最小公倍数记作 $\operatorname{lcm}(a,b)$，是能同时被两数整除的最小正整数。

#### 欧几里得算法

设 $a=qb+r$，则 $a$、$b$ 的公因数与 $b$、$r$ 的公因数完全相同，因此：

$$
\gcd(a,b)=\gcd(b,a\bmod b)
$$

不断取余，直到余数为 $0$。

```cpp
// 求最大公约数
long long gcd(long long a, long long b) {
    while (b != 0) {
        long long remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}
```

时间复杂度 $O(\log\min(a,b))$，空间复杂度 $O(1)$。C++17 可直接使用 `<numeric>` 中的 `std::gcd` 和 `std::lcm`。

#### 最小公倍数

当 $a,b>0$ 时：

$$
\gcd(a,b)\cdot\operatorname{lcm}(a,b)=a\cdot b
$$

实现时先除后乘，降低中间乘积溢出的风险：

```cpp
// 求最小公倍数
long long lcm(long long a, long long b) {
    return a / std::gcd(a, b) * b;
}
```

#### 多个数的 GCD 与 LCM

最大公约数和最小公倍数都满足结合律，可以从左到右归并：

$$
\gcd(a,b,c)=\gcd(\gcd(a,b),c)
$$

若数组全部元素除以整体 GCD，得到的数组比例不变且所有元素没有大于 $1$ 的公共因数。这常用于把整数比例化为最简形式。

```cpp
long long arrayGcd(const vector<long long>& values) {
    return accumulate(values.begin(), values.end(), 0LL, [](long long result, long long value) {
        return std::gcd(result, value);
    });
}
```

#### 裴蜀定理

对不全为 $0$ 的整数 $a,b$，所有形如 $ax+by$ 的整数中，最小正数是 $\gcd(a,b)$。方程

$$
ax+by=c
$$

存在整数解，当且仅当 $\gcd(a,b)\mid c$。

这一定理常用于判断“每次增加或减少固定步长，能否到达目标”的问题。若只需判断可达性，不必求出具体的 $x,y$。

#### 扩展欧几里得算法

扩展欧几里得算法在求 $gcd(a,b)$ 的同时，求出一组整数 $x,y$，使得：

$$
ax+by=\gcd(a,b)
$$

递归到 `b == 0` 时有 $a\times1+0\times0=a$。由下一层的

$$
bx'+(a\bmod b)y'=\gcd(a,b)
$$

代入 $a\bmod b=a-\lfloor a/b\rfloor b$，得到当前层系数 $x=y'$、$y=x'-\lfloor a/b\rfloor y'$。

```cpp
long long extendedGcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long nextX, nextY;
    long long gcd = extendedGcd(b, a % b, nextX, nextY);
    x = nextY;
    y = nextX - a / b * nextY;
    return gcd;
}
```

方程 $ax+by=c$ 有整数解当且仅当 $c$ 能被 $g=\gcd(a,b)$ 整除。若 `extendedGcd` 求得 $ax_0+by_0=g$，则一组特解为 $x=x_0(c/g)$、$y=y_0(c/g)$。

#### 例题

##### 365. 水壶问题

题目来源：[365. 水壶问题](https://leetcode.cn/problems/water-and-jug-problem/)

题目描述：有容量分别为 `x` 和 `y` 升的两个水壶，水源无限。每次可以装满任意一壶、倒空任意一壶，或把一壶倒入另一壶直到前者为空或后者装满。判断能否让一个或两个水壶中的水量之和恰好为 `target` 升。

约束：$0\le x,y,target\le10^6$。

**示例 1：**

- 输入：`x = 3, y = 5, target = 4`

- 输出：`true`

- 解释：先装满 `5` 升壶并向 `3` 升壶倒水，`5` 升壶剩余 `2` 升。倒空 `3` 升壶，将这 `2` 升倒入其中，再装满 `5` 升壶并向 `3` 升壶倒水，最后 `5` 升壶中剩余 `4` 升。

**示例 2：**

- 输入：`x = 2, y = 6, target = 5`

- 输出：`false`

- 解释：$\gcd(2,6)=2$，所有可量出的整数水量都是 `2` 的倍数，无法得到 `5` 升。

<details class="note-solution">
<summary>查看解析</summary>

思路：装满或倒空水壶后，能够得到的水量变化都可写为 $ax+by$，其中 $a,b$ 为整数。由裴蜀定理，能够量出的水量必须是 $\gcd(x,y)$ 的倍数；反过来，只要目标是该最大公约数的倍数，就能通过反复倒水得到。还必须先检查 `target <= x + y`，因为两个水壶无法同时容纳更多的水。

```cpp
class Solution {
public:
    bool canMeasureWater(int x, int y, int target) {
        if (target > x + y) return false;
        if (target == 0) return true;
        return target % std::gcd(x, y) == 0;
    }
};
```

时间复杂度 $O(\log\min(x,y))$，空间复杂度 $O(1)$。

</details>

### Modular Arithmetic 模运算

若 $a$ 与 $b$ 除以正整数 $m$ 的余数相同，则称两者模 $m$ 同余：

$$
a\equiv b\pmod m
$$

同余关系可以进行加、减、乘，但除法必须转化为乘模逆元。

#### 基本运算

$$
\begin{aligned}
(a+b)\bmod m&=((a\bmod m)+(b\bmod m))\bmod m \\
(a-b)\bmod m&=((a\bmod m)-(b\bmod m)+m)\bmod m \\
(ab)\bmod m&=((a\bmod m)(b\bmod m))\bmod m
\end{aligned}
$$

C++ 对负数取模的结果可能为负。需要标准的 $[0,m)$ 余数时使用：

```cpp
// 把余数规范到[0, mod)
long long normalize(long long value, long long mod) {
    return (value % mod + mod) % mod;
}
```

连续相乘时及时取模。即使最终答案取模，中间的两个 `long long` 乘积仍可能溢出；题目模数通常不超过 $10^9+7$，此时两个已取模的数相乘可放入 `long long`。

#### 快速幂

把指数写成二进制。每轮令底数平方；若指数当前最低位为 $1$，就把底数乘入答案。

$$
a^{13}=a^{(1101)_2}=a^8a^4a
$$

```cpp
// 计算base^exponent mod mod
long long modPow(long long base, long long exponent, long long mod) {
    long long result = 1 % mod;
    base = normalize(base, mod);
    while (exponent > 0) {
        if (exponent & 1) result = result * base % mod;
        base = base * base % mod;
        exponent >>= 1;
    }
    return result;
}
```

时间复杂度 $O(\log exponent)$，空间复杂度 $O(1)$。

#### 模逆元

若存在整数 $x$ 满足

$$
ax\equiv1\pmod m
$$

则 $x$ 是 $a$ 模 $m$ 的逆元，记作 $a^{-1}$。逆元存在当且仅当 $\gcd(a,m)=1$。

当 $m$ 是质数且 $a\not\equiv0\pmod m$ 时，费马小定理给出：

$$
a^{m-1}\equiv1\pmod m
$$

因此：

$$
a^{-1}\equiv a^{m-2}\pmod m
$$

```cpp
// mod为质数时求value的模逆元
long long inversePrimeMod(long long value, long long mod) {
    return modPow(value, mod - 2, mod);
}
```

模意义下的除法 `a / b` 应写成 `a * inverse(b) % mod`，不能先做整数除法。

模数不是质数时，仍然先检查 $\gcd(a,m)=1$，再用[扩展欧几里得算法](#%E6%89%A9%E5%B1%95%E6%AC%A7%E5%87%A0%E9%87%8C%E5%BE%97%E7%AE%97%E6%B3%95)求出 $ax+my=1$。系数 $x$ 就是逆元，将它规范到 $[0,m)$ 即可。若最大公约数不为 `1`，逆元不存在，不能做模除法。

```cpp
// 返回value在模mod下的逆元，调用前需保证gcd(value, mod) == 1
long long inverse(long long value, long long mod) {
    long long x, y;
    extendedGcd(value, mod, x, y);
    return normalize(x, mod);
}
```

#### 例题

##### 1922. 统计好数字的数目

题目来源：[1922. 统计好数字的数目](https://leetcode.cn/problems/count-good-numbers/)

题目描述：长度为 `n` 的数字字符串可以包含前导零。偶数下标位置只能放偶数数字，奇数下标位置只能放一位质数。求满足条件的字符串数量，答案对 $10^9+7$ 取模。

约束：$1\le n\le10^{15}$。

**示例 1：**

- 输入：`n = 1`

- 输出：`5`

- 解释：唯一的位置下标为 `0`，可填 `0、2、4、6、8`。

**示例 2：**

- 输入：`n = 4`

- 输出：`400`

- 解释：两个偶数下标各有 `5` 种选择，两个奇数下标各有 `4` 种选择，共有 $5^2\times4^2=400$ 种。

<details class="note-solution">
<summary>查看解析</summary>

思路：偶数下标共有 $\lceil n/2\rceil$ 个，每个位置有 `0、2、4、6、8` 五种选择；奇数下标共有 $\lfloor n/2\rfloor$ 个，每个位置有 `2、3、5、7` 四种选择。各位置独立，根据乘法原理，答案为：

$$
5^{\lceil n/2\rceil}4^{\lfloor n/2\rfloor}
$$

```cpp
class Solution {
    static constexpr long long MOD = 1'000'000'007;

    long long power(long long base, long long exponent) {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % MOD;
            base = base * base % MOD;
            exponent >>= 1;
        }
        return result;
    }

public:
    int countGoodNumbers(long long n) {
        return power(5, (n + 1) / 2) * power(4, n / 2) % MOD;
    }
};
```

时间复杂度 $O(\log n)$，空间复杂度 $O(1)$。

</details>

## Combinatorics 组合数学



### Counting Principles 计数原理与排列组合

组合计数关注“不重不漏地计算方案数”。开始计算前，应先判断多个选择是互斥关系还是连续步骤。

#### 加法原理与乘法原理

若完成一件事可以走若干条互不重叠的路径，第 $i$ 条路径有 $n_i$ 种方案，则总方案数为：

$$
n_1+n_2+\cdots+n_k
$$

若完成一件事必须依次完成 $k$ 个步骤，无论前面如何选择，第 $i$ 步都有 $n_i$ 种选择，则总方案数为：

$$
n_1n_2\cdots n_k
$$

“分类”通常使用加法，“分步”通常使用乘法。若不同类别可能产生同一个结果，就不能直接相加，应使用容斥原理。

例如从城市 `A` 到城市 `B`，可以乘火车（`3` 个班次）或飞机（`2` 个班次），两类方案互斥，共有 $3+2=5$ 种选择。若先选择 `4` 件上衣之一，再选择 `3` 条裤子之一，则必须完成两个步骤，共有 $4\times3=12$ 种搭配。

#### 排列

从 $n$ 个不同元素中选出 $k$ 个并考虑顺序，排列数为：

$$
A_n^k=n(n-1)\cdots(n-k+1)=\frac{n!}{(n-k)!}
$$

全部 $n$ 个元素的排列数为 $n!$。

例如从 `A、B、C、D` 中选择两人分别担任班长和副班长，职位有顺序，共有 $A_4^2=4\times3=12$ 种方案。

若 $n$ 个元素中有若干类相同元素，各类数量分别是 $c_1,c_2,\ldots,c_m$，则不同排列数为：

$$
\frac{n!}{c_1!c_2!\cdots c_m!}
$$

例如 `AAB` 的三个位置原本有 $3!$ 种排列，但两个 `A` 互换不会产生新结果，所以不同字符串数量为 $3!/2!=3$。

#### 组合

从 $n$ 个不同元素中选出 $k$ 个，不考虑顺序，组合数为：

$$
\binom nk=C_n^k=\frac{n!}{k!(n-k)!}
$$

先排列再除去所选 $k$ 个元素内部的 $k!$ 种顺序，就得到组合数。

例如从 `10` 名学生中选择 `3` 人参赛，只关心选中了谁，不关心三人的排列顺序，因此方案数为 $\binom{10}{3}=120$。

常用性质：

$$
\binom nk=\binom n{n-k}
$$

$$
\binom nk=\binom{n-1}{k-1}+\binom{n-1}{k}
$$

第二个式子按“是否选择某个指定元素”分类，是杨辉三角递推式。

#### 插板法

方程

$$
x_1+x_2+\cdots+x_k=n
$$

的正整数解数量为：

$$
\binom{n-1}{k-1}
$$

可以把 $n$ 个相同物品排成一列，在相邻的 $n-1$ 个空隙中选 $k-1$ 个放隔板。隔板不能放在两端或重叠，因此每一组都至少分到一个物品。

若要求非负整数解，令 $y_i=x_i+1$，转化为 $y_1+\cdots+y_k=n+k$，方案数为：

$$
\binom{n+k-1}{k-1}
$$

例如把 `5` 个相同小球放入 `3` 个不同盒子，允许空盒，相当于求 $x_1+x_2+x_3=5$ 的非负整数解，共有 $\binom{7}{2}=21$ 种。若盒子相同，或每个盒子还有容量上限，就不能直接使用这个公式。

#### 例题

##### 62. 不同路径

题目来源：[62. 不同路径](https://leetcode.cn/problems/unique-paths/)

题目描述：机器人位于 `m × n` 网格的左上角，每次只能向右或向下移动一格，求到达右下角的不同路径数。

约束：$1\le m,n\le100$，题目保证答案不超过 $2\times10^9$。

**示例 1：**

- 输入：`m = 3, n = 7`

- 输出：`28`

**示例 2：**

- 输入：`m = 3, n = 2`

- 输出：`3`

- 解释：三条路径依次为“右下下”“下右下”“下下右”。

<details class="note-solution">
<summary>查看解析</summary>

思路：从起点到终点一定移动 `m - 1` 次向下和 `n - 1` 次向右，移动总数固定为 `m + n - 2`。只需从全部步骤中选择哪 `m - 1` 步向下，答案为：

$$
\binom{m+n-2}{m-1}
$$

逐项计算组合数，先乘后除。题目保证答案在整数范围内，但中间值仍使用 `long long`。

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
        int total = m + n - 2;
        int choose = min(m - 1, n - 1);
        long long answer = 1;
        for (int i = 1; i <= choose; i++) {
            answer = answer * (total - choose + i) / i;
        }
        return answer;
    }
};
```

时间复杂度 $O(\min(m,n))$，空间复杂度 $O(1)$。

</details>

### Computing Binomial Coefficients 组合数的计算

组合数 $\binom nk$ 的计算方式取决于数据范围、查询次数以及是否取模。

| 场景 | 方法 | 单次或预处理复杂度 |
| --- | --- | --- |
| 只查询一次，答案能放入整数类型 | 逐项相乘相除 | $O(\min(k,n-k))$ |
| $n$ 不大，需要得到许多个 $\binom nk$ | 杨辉三角 | 预处理 $O(n^2)$ |
| 模数为质数、$n<p$，查询很多 | 阶乘与逆阶乘 | 预处理 $O(n+\log p)$，查询 $O(1)$ |

#### 单次计算且结果不取模

利用对称性令 $k=\min(k,n-k)$，逐项计算：

$$
\binom nk=\prod_{i=1}^{k}\frac{n-k+i}{i}
$$

```cpp
// 计算能够放入long long的组合数
long long combination(int n, int k) {
    if (k < 0 || k > n) return 0;
    k = min(k, n - k);
    long long result = 1;
    for (int i = 1; i <= k; i++) {
        result = result * (n - k + i) / i;
    }
    return result;
}
```

每一步的整体结果都是整数，但乘法仍可能在最终答案之前溢出。数据范围更大时需要高精度整数或约分后计算。

#### 杨辉三角递推

由

$$
\binom nk=\binom{n-1}{k-1}+\binom{n-1}{k}
$$

计算到第 $n$ 行需要 $O(n^2)$ 时间和空间。转移只有加法，因此取模时不要求模数为质数。

```cpp
// 使用杨辉三角计算0到n的组合数，结果对mod取模
vector<vector<long long>> pascalTriangle(int n, long long mod) {
    vector<vector<long long>> combination(n + 1, vector<long long>(n + 1));
    for (int row = 0; row <= n; row++) {
        combination[row][0] = combination[row][row] = 1;
        for (int column = 1; column < row; column++) {
            combination[row][column] =
                (combination[row - 1][column - 1] + combination[row - 1][column]) % mod;
        }
    }
    return combination;
}
```

#### 质数模下多次查询

当模数 $p$ 为质数且 $n<p$ 时，预处理阶乘和逆阶乘：

$$
\binom nk\equiv n!\,(k!)^{-1}\,((n-k)!)^{-1}\pmod p
$$

```cpp
class Combinations {
    long long mod;
    vector<long long> factorial, inverseFactorial;

    long long power(long long base, long long exponent) const {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % mod;
            base = base * base % mod;
            exponent >>= 1;
        }
        return result;
    }

public:
    // 预处理阶乘及逆阶乘
    Combinations(int limit, long long primeMod)
        : mod(primeMod), factorial(limit + 1, 1), inverseFactorial(limit + 1, 1) {
        for (int i = 1; i <= limit; i++) factorial[i] = factorial[i - 1] * i % mod;
        inverseFactorial[limit] = power(factorial[limit], mod - 2);
        for (int i = limit; i > 0; i--) {
            inverseFactorial[i - 1] = inverseFactorial[i] * i % mod;
        }
    }

    // 计算C(n, k)
    long long choose(int n, int k) const {
        if (k < 0 || k > n) return 0;
        return factorial[n] * inverseFactorial[k] % mod * inverseFactorial[n - k] % mod;
    }
};
```

预处理时间 $O(n+\log p)$、空间 $O(n)$，每次查询 $O(1)$。

#### 例题

##### 2400. 恰好移动 k 步到达某一位置的方法数目

题目来源：[2400. 恰好移动 k 步到达某一位置的方法数目](https://leetcode.cn/problems/number-of-ways-to-reach-a-position-after-exactly-k-steps/)

题目描述：在无限数轴上从正整数位置 `startPos` 出发，每一步可以向左或向右移动一个位置。求恰好移动 `k` 步后到达 `endPos` 的不同移动序列数量，答案对 $10^9+7$ 取模。只要移动顺序不同，就视为不同方案；移动过程中可以到达负数位置。

约束：$1\le startPos,endPos,k\le1000$。

**示例 1：**

- 输入：`startPos = 1, endPos = 2, k = 3`

- 输出：`3`

- 解释：三种移动序列分别为 `右、右、左`，`右、左、右` 和 `左、右、右`。

**示例 2：**

- 输入：`startPos = 2, endPos = 5, k = 10`

- 输出：`0`

- 解释：走 `10` 步后位置变化量的奇偶性为偶数，不可能产生距离为 `3` 的位移。

<details class="note-solution">
<summary>查看解析</summary>

思路：设向右走 $r$ 步，向左走 $k-r$ 步。最终位置满足：

$$
startPos+r-(k-r)=endPos
$$

解得：

$$
r=\frac{k+endPos-startPos}{2}
$$

若分子为奇数或 $r\notin[0,k]$，说明无法恰好到达，答案为 `0`。否则只需从 `k` 步中选择哪 `r` 步向右，答案为 $\binom kr$。

```cpp
class Solution {
    static constexpr long long MOD = 1'000'000'007;

    long long power(long long base, long long exponent) {
        long long result = 1;
        while (exponent > 0) {
            if (exponent & 1) result = result * base % MOD;
            base = base * base % MOD;
            exponent >>= 1;
        }
        return result;
    }

public:
    int numberOfWays(int startPos, int endPos, int k) {
        int numerator = k + endPos - startPos;
        if (numerator < 0 || numerator % 2 != 0) return 0;
        int rightSteps = numerator / 2;
        if (rightSteps > k) return 0;

        vector<long long> factorial(k + 1, 1);
        for (int i = 1; i <= k; i++) factorial[i] = factorial[i - 1] * i % MOD;
        return factorial[k] * power(factorial[rightSteps], MOD - 2) % MOD
            * power(factorial[k - rightSteps], MOD - 2) % MOD;
    }
};
```

时间复杂度 $O(k+\log MOD)$，空间复杂度 $O(k)$。

</details>

### Inclusion–Exclusion Principle 容斥原理

多个集合存在交集时，直接相加会重复计数。两个集合满足：

$$
|A\cup B|=|A|+|B|-|A\cap B|
$$

三个集合满足：

$$
|A\cup B\cup C|
=|A|+|B|+|C|
-|A\cap B|-|A\cap C|-|B\cap C|
+|A\cap B\cap C|
$$

一般地，先加所有单个集合，减去两两交集，加回三者交集，依次交替符号。

例如在 `1～10` 中，能被 `2` 整除的数有 `5` 个，能被 `3` 整除的数有 `3` 个，其中 `6` 同时属于两者。能被 `2` 或 `3` 整除的数共有 $5+3-1=7$ 个，而不是 `8` 个。

#### 子集形式

对 $n$ 个集合 $A_1,A_2,\ldots,A_n$：

$$
\left|\bigcup_{i=1}^{n}A_i\right|
=\sum_{\varnothing\ne S\subseteq\{1,2,\ldots,n\}}
(-1)^{|S|+1}\left|\bigcap_{i\in S}A_i\right|
$$

当集合数量较少时，可用位掩码枚举非空子集。奇数个集合的交集相加，偶数个集合的交集相减。

```cpp
long long inclusionExclusion(const vector<long long>& divisors, long long upper) {
    long long answer = 0;
    for (uint64_t mask = 1; mask < (1ULL << divisors.size()); mask++) {
        long long multiple = 1;
        for (size_t i = 0; i < divisors.size(); i++) {
            if (((mask >> i) & 1) == 0) continue;
            long long factor = divisors[i] / std::gcd(multiple, divisors[i]);
            if (multiple > upper / factor) {
                multiple = upper + 1;
                break;
            }
            multiple *= factor;
        }
        if (multiple > upper) continue;
        if (__builtin_popcountll(mask) & 1) answer += upper / multiple;
        else answer -= upper / multiple;
    }
    return answer;
}
```

枚举 $n$ 个集合的所有非空子集需要 $O(n2^n)$ 时间，只适合集合数量较少的情况。代码在计算最小公倍数前先判断结果是否超过 `upper`，避免无意义的大数和乘法溢出。

#### 统计可整除的数

在 $[1,x]$ 中，能被正整数 $d$ 整除的数有 $\lfloor x/d\rfloor$ 个。若要同时被 $a,b$ 整除，就必须被 $\operatorname{lcm}(a,b)$ 整除。

因此能被 `a、b、c` 中至少一个整除的整数数量为：

$$
\begin{aligned}
count(x)={}&\left\lfloor\frac{x}{a}\right\rfloor
+\left\lfloor\frac{x}{b}\right\rfloor
+\left\lfloor\frac{x}{c}\right\rfloor \\
&-\left\lfloor\frac{x}{\operatorname{lcm}(a,b)}\right\rfloor
-\left\lfloor\frac{x}{\operatorname{lcm}(a,c)}\right\rfloor
-\left\lfloor\frac{x}{\operatorname{lcm}(b,c)}\right\rfloor \\
&+\left\lfloor\frac{x}{\operatorname{lcm}(a,b,c)}\right\rfloor
\end{aligned}
$$

#### 例题

##### 1201. 丑数 III

题目来源：[1201. 丑数 III](https://leetcode.cn/problems/ugly-number-iii/)

题目描述：正整数如果能被 `a、b、c` 中至少一个整除，就称为丑数。给定 `n、a、b、c`，求从小到大排列后的第 `n` 个丑数。

约束：$1\le n,a,b,c\le10^9$，答案不超过 $2\times10^9$。

**示例 1：**

- 输入：`n = 3, a = 2, b = 3, c = 5`

- 输出：`4`

- 解释：前三个丑数是 `2、3、4`。

**示例 2：**

- 输入：`n = 4, a = 2, b = 3, c = 4`

- 输出：`6`

- 解释：前四个丑数是 `2、3、4、6`。

<details class="note-solution">
<summary>查看解析</summary>

思路：利用上面的容斥公式计算 `count(x)`，表示 `[1,x]` 中有多少个丑数。`count(x)` 随 `x` 单调不减，因此二分最小的 `x`，使 `count(x) >= n`。能同时被两个数整除的数按最小公倍数统计，三个集合的交集则使用 `lcm(a,b,c)`。

```cpp
class Solution {
public:
    int nthUglyNumber(int n, int a, int b, int c) {
        long long ab = std::lcm(a, b);
        long long ac = std::lcm(a, c);
        long long bc = std::lcm(b, c);
        long long abc = std::lcm(ab, static_cast<long long>(c));

        auto count = [&](long long upper) {
            return upper / a + upper / b + upper / c
                - upper / ab - upper / ac - upper / bc + upper / abc;
        };

        long long left = 1, right = 2'000'000'000;
        while (left < right) {
            long long middle = left + (right - left) / 2;
            if (count(middle) >= n) right = middle;
            else left = middle + 1;
        }
        return left;
    }
};
```

时间复杂度 $O(\log 2\times10^9)$，空间复杂度 $O(1)$。

</details>

#### 常见错误

- 集合并不互斥却直接相加。
- 交集使用乘积而不是最小公倍数。
- 计算最小公倍数时先乘后除导致溢出。
- 枚举子集时把符号写反：交集集合数为奇数时应加，偶数时应减。

## Probability and Expectation 概率与期望

随机试验的全部可能结果组成样本空间 $\Omega$，其中一部分结果组成事件。若有限样本空间中的基本结果等可能，则事件 $A$ 的概率为：

$$
P(A)=\frac{|A|}{|\Omega|}
$$

#### 基本公式

对任意事件 $A,B$：

$$
P(\overline A)=1-P(A)
$$

$$
P(A\cup B)=P(A)+P(B)-P(A\cap B)
$$

在 $P(B)>0$ 时，已知 $B$ 发生后 $A$ 发生的条件概率为：

$$
P(A\mid B)=\frac{P(A\cap B)}{P(B)}
$$

乘法公式为：

$$
P(A\cap B)=P(B)P(A\mid B)
$$

若 $P(A\cap B)=P(A)P(B)$，则 $A,B$ 相互独立。独立与互斥不同：两个概率非零的互斥事件不可能独立。

#### 全概率公式与贝叶斯公式

若事件 $B_1,B_2,\ldots,B_n$ 两两互斥且覆盖样本空间，则：

$$
P(A)=\sum_{i=1}^{n}P(B_i)P(A\mid B_i)
$$

观察到结果 $A$ 后，原因 $B_i$ 的后验概率为：

$$
P(B_i\mid A)=
\frac{P(B_i)P(A\mid B_i)}
{\sum_{j=1}^{n}P(B_j)P(A\mid B_j)}
$$

#### 独立重复试验

单次成功概率为 $p$，独立试验 $n$ 次，恰好成功 $k$ 次的概率服从二项分布：

$$
P(X=k)=\binom nkp^k(1-p)^{n-k}
$$

“至少一次成功”通常用补集计算：

$$
P(X\ge1)=1-P(X=0)=1-(1-p)^n
$$

#### 概率动态规划

概率 DP 适用于“经过固定步数后，到达某状态的概率”。状态的值不是方案数，而是所有能到达该状态的路径概率之和。

设 `dp[u]` 表示当前时刻处于状态 `u` 的概率，从 `u` 转移到 `v` 的概率为 $p(u,v)$，则：

$$
next[v]=\sum_u dp[u]p(u,v)
$$

建模时按以下顺序：

1. 确定状态表示“已完成多少步”还是“还剩多少步”。
2. 初始状态的概率为 `1`，其他状态为 `0`。
3. 把当前概率按各选择的概率分配到下一层。多条路径到达同一状态时使用加法合并。
4. 根据题意读取单个终止状态，或求所有合法终止状态的概率和。

如果每一层只依赖上一层，用 `current` 和 `next` 两个数组滚动即可。转移到非法状态的概率是否丢弃，要由题意决定；例如骑士离开棋盘后停止，这部分概率不能再转移回棋盘。

### 数学期望

离散随机变量 $X$ 取值为 $x_i$，对应概率为 $p_i$，其数学期望为：

$$
E[X]=\sum_i x_ip_i
$$

期望是大量重复试验中结果的平均值，不要求它本身是一次试验可能出现的结果。例如公平六面骰子的点数期望是 $3.5$。

#### 期望的线性性质

无论随机变量是否独立，都有：

$$
E[X+Y]=E[X]+E[Y]
$$

更一般地：

$$
E\left[\sum_{i=1}^{n}X_i\right]=\sum_{i=1}^{n}E[X_i]
$$

计数问题中，可以令指示变量 $I_i$ 表示第 $i$ 个事件是否发生：发生时为 `1`，否则为 `0`。由于 $E[I_i]=P(I_i=1)$，总发生次数的期望就是各事件发生概率之和。

例如长度为 $n$ 的随机排列中，对每对 $i<j$ 定义指示变量 $I_{i,j}$，当这两个元素构成逆序对时取 `1`。两个元素的相对次序等概率，所以 $E[I_{i,j}]=1/2$。一共有 $\binom n2$ 对元素，逆序对数的期望为 $n(n-1)/4$。这些指示变量并不独立，但不影响期望的线性。

#### 条件期望

根据第一次选择分类，可以建立期望递推：

$$
E[X]=\sum_i P(B_i)E[X\mid B_i]
$$

若 `dp[s]` 表示从状态 `s` 到终止状态还需要的期望步数，每走一步都会增加 `1`：

$$
dp[s]=1+\sum_t P(s\to t)dp[t]
$$

当转移可能留在原状态时，等式右边会包含 `dp[s]`，必须移项求解，不能直接按普通 DAG 动态规划计算。

#### 几何分布

每次独立试验成功概率为 $p$，直到第一次成功所需试验次数 $X$ 满足：

$$
P(X=k)=(1-p)^{k-1}p
$$

其期望为：

$$
E[X]=\frac1p
$$

若令 $E$ 表示还需试验的次数，根据第一次试验分类：

$$
E=1+(1-p)E
$$

移项得 $E=1/p$。式子中的 `1` 是已经进行的这一次试验，不能遗漏。

### 例题

#### 688. 骑士在棋盘上的概率

题目来源：[688. 骑士在棋盘上的概率](https://leetcode.cn/problems/knight-probability-in-chessboard/)

题目描述：在 `n × n` 的国际象棋棋盘上，行列下标均从 `0` 开始。骑士从 `(row,column)` 出发，尝试移动 `k` 次。每次都从八种走法中等概率选择一种，即使该走法会离开棋盘；一旦离开就停止移动。求完成移动后仍在棋盘上的概率。

约束：$1\le n\le25$，$0\le k\le100$，起点一定在棋盘内。

**示例 1：**

- 输入：`n = 3, k = 2, row = 0, column = 0`

- 输出：`0.0625`

- 解释：第一步只有 `(1,2)` 和 `(2,1)` 两个落点仍在棋盘内；从这两个位置出发，第二步也各有两种合法落点，所以概率为 $4/8^2=0.0625$。

**示例 2：**

- 输入：`n = 1, k = 0, row = 0, column = 0`

- 输出：`1.0`

<details class="note-solution">
<summary>查看解析</summary>

思路：令 `current[r][c]` 表示完成当前步数后位于 `(r,c)` 的概率。初始位置概率为 `1`。每次从一个格子向八个方向各分配当前概率的 $1/8$，只把仍落在棋盘内的转移加入下一层，越界部分自然丢失。完成 `k` 轮后，棋盘上所有状态的概率之和就是答案。

```cpp
class Solution {
public:
    double knightProbability(int n, int k, int row, int column) {
        constexpr int directions[8][2] = {
            {1, 2}, {1, -2}, {-1, 2}, {-1, -2},
            {2, 1}, {2, -1}, {-2, 1}, {-2, -1}
        };
        vector<vector<double>> current(n, vector<double>(n));
        current[row][column] = 1.0;

        while (k-- > 0) {
            vector<vector<double>> next(n, vector<double>(n));
            for (int r = 0; r < n; r++) {
                for (int c = 0; c < n; c++) {
                    for (auto [dr, dc] : directions) {
                        int nr = r + dr, nc = c + dc;
                        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                        next[nr][nc] += current[r][c] / 8.0;
                    }
                }
            }
            current.swap(next);
        }

        return accumulate(current.begin(), current.end(), 0.0,
            [](double total, const vector<double>& line) {
                return total + accumulate(line.begin(), line.end(), 0.0);
            });
    }
};
```

时间复杂度 $O(kn^2)$，空间复杂度 $O(n^2)$。

</details>

#### 收集全部卡片的期望次数

题目描述：共有 `n` 种卡片。每次独立且等概率地获得其中一种，已经获得过的卡片仍可能重复出现。求收集全部 `n` 种卡片所需抽取次数的期望。

约束：$1\le n\le10^7$。

**示例 1：**

- 输入：`n = 1`

- 输出：`1.0`

**示例 2：**

- 输入：`n = 2`

- 输出：`3.0`

- 解释：第一张卡片一定是新种类，期望抽取 `1` 次；只剩一种未收集时，每次抽中它的概率为 $1/2$，期望再抽 `2` 次。

<details class="note-solution">
<summary>查看解析</summary>

思路：已收集 `i` 种时，下一次抽到新种类的概率为 $(n-i)/n$。这一阶段需要的抽取次数服从几何分布，期望为 $n/(n-i)$。根据期望的线性，各阶段期望相加：

$$
E=n\left(1+\frac12+\frac13+\cdots+\frac1n\right)
$$

```cpp
double expectedDraws(int n) {
    double answer = 0;
    for (int missing = n; missing >= 1; missing--) {
        answer += static_cast<double>(n) / missing;
    }
    return answer;
}
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

</details>

## Game Theory 博弈论

本页讨论最常见的公平组合游戏：两名玩家轮流行动，双方可见全部局面并拥有相同操作规则，游戏不会无限进行，无法行动者失败。

### 必胜态与必败态

从当前局面出发，若先手在双方都采取最优策略时能够获胜，该局面是必胜态；否则是必败态。

- 无法继续操作的终止局面是必败态。
- 能够一步到达某个必败态的局面是必胜态。
- 所有下一步都只能到达必胜态的局面是必败态。

状态规模较小时，可按这三条规则使用记忆化搜索或动态规划。数学博弈的关键则是找出必败态的规律并证明转移关系。

### 巴什博弈

有一堆 $n$ 个物品，两人轮流取，每次可以取 $1\sim m$ 个，取走最后一个物品者获胜。

当 $n$ 是 $m+1$ 的倍数时，无论先手取多少，后手都能让两人本轮合计取走 $m+1$ 个，最终由后手取走最后一个。因此：

$$
n\bmod(m+1)=0
$$

是必败态，其余局面是必胜态。必胜态中，先手先取 $n\bmod(m+1)$ 个，之后始终与对手合计取 $m+1$ 个。

### Nim 游戏

有若干堆石子，两人轮流选择一堆并取走至少一颗石子，取走最后一颗者获胜。设各堆石子数量为 $a_1,a_2,\ldots,a_n$，局面为必败态当且仅当：

$$
a_1\oplus a_2\oplus\cdots\oplus a_n=0
$$

这里的 $\oplus$ 是按位异或。

证明分为两部分：

1. 异或和为 `0` 时，修改任意一堆都会让某个最高变化位只出现一次，新的异或和必不为 `0`。
2. 异或和为 `x != 0` 时，取 `x` 的最高位 `1`。一定存在一堆 `a[i]` 在该位也是 `1`，令 `a[i]` 变为 `a[i] ^ x`，新值严格变小且整体异或和变为 `0`。

因此必胜策略是每次把异或和恢复为 `0`。

### 状态 DP

当每个局面的可选操作可以枚举，但必败态没有简单的数学规律时，使用记忆化搜索或 DP。令 `win[state]` 表示轮到当前玩家行动时是否必胜：

$$
win(s)=\bigvee_{t\in next(s)}\neg win(t)
$$

也就是只要存在一个后继必败态，当前状态就必胜；没有后继状态，或所有后继都必胜，当前状态就必败。

例如一堆石子每次只能取 `moves` 中规定的数量：

```cpp
vector<bool> winningStates(int n, const vector<int>& moves) {
    vector<bool> win(n + 1);
    for (int stones = 1; stones <= n; stones++) {
        win[stones] = any_of(moves.begin(), moves.end(), [&](int take) {
            return take <= stones && !win[stones - take];
        });
    }
    return win;
}
```

这个模型要求状态转移不会成环。若题目以得分高低而不是“无法行动者失败”决定胜负，则应把状态值改为当前玩家能获得的最大分差，不能套用布尔胜负转移。

### 例题

#### 292. Nim 游戏

题目来源：[292. Nim 游戏](https://leetcode.cn/problems/nim-game/)

题目描述：桌上有一堆 `n` 块石头，两名玩家轮流拿走 `1～3` 块，拿走最后一块石头者获胜。你是先手，双方都采取最优策略，判断你能否获胜。

约束：$1\le n\le2^{31}-1$。

**示例 1：**

- 输入：`n = 4`

- 输出：`false`

- 解释：无论先手拿走 `1、2、3` 块，后手都能拿走剩余石头并获胜。

**示例 2：**

- 输入：`n = 2`

- 输出：`true`

<details class="note-solution">
<summary>查看解析</summary>

思路：这是每次可取 `1～3` 块的巴什博弈。`4` 是第一个非零必败态；每当石头数是 `4` 的倍数，先手无论取多少，后手都能与其合计取走 `4` 块。其他数量则可以先取 `n % 4` 块，把对手留在必败态。因此只需判断 `n` 是否为 `4` 的倍数。

```cpp
class Solution {
public:
    bool canWinNim(int n) {
        return n % 4 != 0;
    }
};
```

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

</details>

## Computational Geometry 计算几何



### Points, Vectors and Lines 点、向量与直线

二维点 $P=(x,y)$ 表示位置；两个点之差 $\overrightarrow{AB}=B-A$ 表示从 $A$ 指向 $B$ 的向量。代码中可以用同一个 `Point` 结构体存储它们：单独的 `Point` 表示坐标，两点相减的结果表示方向和长度。

```cpp
struct Point {
    long long x, y;
};

// 计算从from指向to的向量
Point vectorFrom(Point from, Point to) {
    return {to.x - from.x, to.y - from.y};
}
```

#### 点积

向量 $\mathbf{a}=(x_1,y_1)$、$\mathbf{b}=(x_2,y_2)$ 的点积为：

$$
\mathbf{a}\cdot\mathbf{b}=x_1x_2+y_1y_2=|\mathbf{a}||\mathbf{b}|\cos\theta
$$

- $\mathbf{a}\cdot\mathbf{b}>0$：夹角为锐角。
- $\mathbf{a}\cdot\mathbf{b}=0$：两向量垂直。
- $\mathbf{a}\cdot\mathbf{b}<0$：夹角为钝角。

```cpp
// 计算点积
long long dot(Point a, Point b) {
    return a.x * b.x + a.y * b.y;
}
```

#### 叉积

二维向量叉积取有向面积值：

$$
\mathbf{a}\times\mathbf{b}=x_1y_2-y_1x_2
$$

- $\mathbf{a}\times\mathbf{b}>0$：$\mathbf{b}$ 在 $\mathbf{a}$ 的逆时针方向。
- $\mathbf{a}\times\mathbf{b}=0$：两向量共线。
- $\mathbf{a}\times\mathbf{b}<0$：$\mathbf{b}$ 在 $\mathbf{a}$ 的顺时针方向。

三点 $A,B,C$ 的方向由 $(B-A)\times(C-A)$ 判断。其绝对值等于三角形 $ABC$ 面积的两倍。

```cpp
// 计算叉积
long long cross(Point a, Point b) {
    return a.x * b.y - a.y * b.x;
}

// 判断从AB转向C的方向
long long orientation(Point a, Point b, Point c) {
    return cross(vectorFrom(a, b), vectorFrom(a, c));
}
```

#### 距离

两点欧几里得距离为：

$$
d(A,B)=\sqrt{(x_A-x_B)^2+(y_A-y_B)^2}
$$

只比较距离大小时应比较距离平方，避免开方和浮点误差。

曼哈顿距离与切比雪夫距离分别为：

$$
d_1(A,B)=|x_A-x_B|+|y_A-y_B|
$$

$$
d_\infty(A,B)=\max(|x_A-x_B|,|y_A-y_B|)
$$

欧几里得距离是直线距离；曼哈顿距离对应只能水平或竖直移动；切比雪夫距离对应每次横纵坐标都可同时移动一格。

```cpp
long long squaredDistance(Point a, Point b) {
    long long dx = a.x - b.x;
    long long dy = a.y - b.y;
    return dx * dx + dy * dy;
}

long long manhattanDistance(Point a, Point b) {
    return abs(a.x - b.x) + abs(a.y - b.y);
}

long long chebyshevDistance(Point a, Point b) {
    return max(abs(a.x - b.x), abs(a.y - b.y));
}
```

#### 判断点在线段上

点 $P$ 在线段 $AB$ 上，当且仅当：

1. $A,B,P$ 共线。
2. $P$ 的两个坐标都位于端点对应坐标的闭区间内。

```cpp
// 判断p是否在线段ab上
bool onSegment(Point a, Point b, Point p) {
    if (orientation(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}
```

#### 判断两线段相交

两条闭线段一般相交时，另一条线段的两个端点分别位于本线段所在直线两侧。还要单独包含端点接触和共线重叠。

```cpp
// 判断线段ab与cd是否相交
bool segmentsIntersect(Point a, Point b, Point c, Point d) {
    long long abc = orientation(a, b, c);
    long long abd = orientation(a, b, d);
    long long cda = orientation(c, d, a);
    long long cdb = orientation(c, d, b);

    if (abc == 0 && onSegment(a, b, c)) return true;
    if (abd == 0 && onSegment(a, b, d)) return true;
    if (cda == 0 && onSegment(c, d, a)) return true;
    if (cdb == 0 && onSegment(c, d, b)) return true;
    return (abc > 0) != (abd > 0) && (cda > 0) != (cdb > 0);
}
```

#### 例题

##### 1232. 缀点成线

题目来源：[1232. 缀点成线](https://leetcode.cn/problems/check-if-it-is-a-straight-line/)

题目描述：给定整数数组 `coordinates`，其中 `coordinates[i] = [xi, yi]` 表示一个平面点。所有点互不相同，判断它们是否位于同一条直线上。

约束：$2\le coordinates.length\le1000$，$-10^4\le x_i,y_i\le10^4$。

**示例 1：**

- 输入：`coordinates = [[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]]`

- 输出：`true`

**示例 2：**

- 输入：`coordinates = [[1,1],[2,2],[3,4],[4,5],[5,6],[7,7]]`

- 输出：`false`

<details class="note-solution">
<summary>查看解析</summary>

思路：以前两个点确定基准方向。从第三个点开始，每个点与第一个点形成的向量都应与基准向量共线，也就是叉积为 `0`。使用叉积而不是比较斜率，既不会对竖直线除以零，也不会引入浮点误差。

```cpp
class Solution {
public:
    bool checkStraightLine(vector<vector<int>>& coordinates) {
        long long dx = coordinates[1][0] - coordinates[0][0];
        long long dy = coordinates[1][1] - coordinates[0][1];
        return all_of(coordinates.begin() + 2, coordinates.end(), [&](const vector<int>& point) {
            long long currentX = point[0] - coordinates[0][0];
            long long currentY = point[1] - coordinates[0][1];
            return dx * currentY == dy * currentX;
        });
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

</details>

### Circles and Polygons 圆、矩形与多边形

圆心为 $O=(x_0,y_0)$、半径为 $r$ 的圆由以下方程表示：

$$
(x-x_0)^2+(y-y_0)^2=r^2
$$

设点 $P=(x,y)$ 到圆心的距离平方为 $d^2=(x-x_0)^2+(y-y_0)^2$。不必计算平方根，只需比较 $d^2$ 与 $r^2$：

$$
P\text{ 的位置}=
\begin{cases}
\text{圆内}, & d^2<r^2 \\
\text{圆上}, & d^2=r^2 \\
\text{圆外}, & d^2>r^2
\end{cases}
$$

使用距离平方既避免了开方，也避免了浮点误差。

```cpp
long long dx = x - x0;
long long dy = y - y0;
long long distanceSquared = dx * dx + dy * dy;

if (distanceSquared < 1LL * radius * radius) {
    // 点在圆内
} else if (distanceSquared == 1LL * radius * radius) {
    // 点在圆上
} else {
    // 点在圆外
}
```

#### 轴对齐矩形的重叠面积

**轴对齐矩形**是四条边分别平行于 $x$ 轴或 $y$ 轴的矩形，也就是没有发生旋转的矩形。它可以由左下角 $(x_1,y_1)$ 和右上角 $(x_2,y_2)$ 唯一确定，其中 $x_1<x_2$、$y_1<y_2$。矩形表示为 $R=[x_1,x_2]\times[y_1,y_2]$。

点 $(x,y)$ 位于矩形内部或边界上，当且仅当 $x_1\le x\le x_2$ 且 $y_1\le y\le y_2$。

设两个轴对齐矩形分别为 $R_1=[x_1,x_2]\times[y_1,y_2]$ 和 $R_2=[x_3,x_4]\times[y_3,y_4]$。它们在横轴上的重叠长度为：

$$
\max\left(0,\min(x_2,x_4)-\max(x_1,x_3)\right)
$$

纵轴上的重叠长度为：

$$
\max\left(0,\min(y_2,y_4)-\max(y_1,y_3)\right)
$$

两者相乘就是重叠面积。若其中一个重叠长度为 `0`，两个矩形至多在边或顶点处接触，重叠面积为 `0`。

```cpp
long long overlapWidth = max(0LL, min(x2, x4) - max(x1, x3));
long long overlapHeight = max(0LL, min(y2, y4) - max(y1, y3));
long long overlapArea = overlapWidth * overlapHeight;
```

#### 圆与矩形相交

给定圆心 $O=(x_0,y_0)$、半径 $r$，以及轴对齐矩形 $R=[x_1,x_2]\times[y_1,y_2]$，需要判断圆盘与矩形是否至少有一个公共点。圆与矩形相切也算相交。

问题可以转化为：求矩形中距离圆心最近的点 $Q=(x',y')$，再判断 $Q$ 是否位于圆内或圆上。

对于横坐标：

- 若圆心在矩形左侧，最近的横坐标是左边界 $x_1$。
- 若圆心的横坐标落在矩形范围内，最近的横坐标就是 $x_0$。
- 若圆心在矩形右侧，最近的横坐标是右边界 $x_2$。

因此：

$$
x'=\begin{cases}
x_1, & x_0<x_1 \\
x_0, & x_1\le x_0\le x_2 \\
x_2, & x_0>x_2
\end{cases}
$$

这也可以写成 $x'=\min(\max(x_0,x_1),x_2)$。纵坐标同理：

$$
y'=\begin{cases}
y_1, & y_0<y_1 \\
y_0, & y_1\le y_0\le y_2 \\
y_2, & y_0>y_2
\end{cases}
$$

这样得到的 $Q$ 可能位于矩形内部、某条边上或某个顶点上，覆盖了圆心在矩形内部、圆靠近矩形边和圆靠近矩形顶点的全部情况。

圆与矩形相交当且仅当：

$$
(x'-x_0)^2+(y'-y_0)^2\le r^2
$$

使用严格小于号会漏掉相切的情况，因此这里必须使用 $\le$。

```cpp
long long closestX = min(max(x0, x1), x2);
long long closestY = min(max(y0, y1), y2);
long long dx = closestX - x0;
long long dy = closestY - y0;
bool intersects = dx * dx + dy * dy <= 1LL * radius * radius;
```

#### 简单多边形面积

一个多边形如果它的任意两条不相邻边都不相交，并且相邻边只在它们的公共端点处相交，那么它就是**简单多边形**。
设它的顶点 $P_0,P_1,\ldots,P_{n-1}$ 按边界顺序排列，不能是任意顺序；令 $P_i=(x_i,y_i)$，并约定 $P_n=P_0$。

我们有鞋带公式：

$$
2S_{\mathrm{signed}}
=\sum_{i=0}^{n-1}(x_i y_{i+1}-y_i x_{i+1})
$$

即有符号面积的2倍等于相邻点坐标的叉积求和。

在通常的平面直角坐标系中：

- 顶点按逆时针排列时，有向面积为正。
- 顶点按顺时针排列时，有向面积为负。
- 实际面积取绝对值：$S=|S_{\mathrm{signed}}|$。

例如矩形顶点按逆时针排列为 $(0,0),(4,0),(4,3),(0,3)$，则：

$$
2S=(0\times0-0\times4)+(4\times3-0\times4)
+(4\times3-3\times0)+(0\times0-3\times0)=24
$$

所以 $S=24/2=12$。

```cpp
struct Point {
    long long x, y;
};

// 计算多边形面积的两倍
long long doubledArea(const vector<Point>& polygon) {
    long long area = 0;
    for (size_t i = 0; i < polygon.size(); i++) {
        const Point& current = polygon[i];
        const Point& next = polygon[(i + 1) % polygon.size()];
        area += current.x * next.y - current.y * next.x;
    }
    return std::abs(area);
}
```

计算步骤是：依次枚举每条边，累加 `x[i] * y[i + 1] - y[i] * x[i + 1]`，最后取绝对值。代码直接返回两倍面积，可以避免面积为半整数时使用浮点数；需要实际面积时再除以 `2.0`。

鞋带公式要求顶点沿多边形边界排列。对于自相交多边形，它得到的是带符号区域互相抵消后的代数面积，不是图形覆盖面积。

#### 例题

##### 1401. 圆和矩形是否有重叠

题目来源：[1401. 圆和矩形是否有重叠](https://leetcode.cn/problems/circle-and-rectangle-overlapping/)

题目描述：给定圆的半径 `radius`、圆心 `(xCenter,yCenter)`，以及轴对齐矩形的左下角 `(x1,y1)` 和右上角 `(x2,y2)`，判断圆盘与矩形是否至少有一个公共点。边界相切也返回 `true`。

约束：$1\le radius\le2000$，坐标绝对值不超过 $10^4$，且 $x_1<x_2$、$y_1<y_2$。

**示例 1：**

- 输入：`radius = 1, xCenter = 0, yCenter = 0, x1 = 1, y1 = -1, x2 = 3, y2 = 1`

- 输出：`true`

- 解释：圆与矩形左边界在点 `(1,0)` 相切。

**示例 2：**

- 输入：`radius = 1, xCenter = 0, yCenter = 0, x1 = 2, y1 = 2, x2 = 3, y2 = 3`

- 输出：`false`

<details class="note-solution">
<summary>查看解析</summary>

思路：分别把圆心横纵坐标限制在矩形对应区间内，得到矩形中距离圆心最近的点。若最近点到圆心的距离平方不超过半径平方，圆盘与矩形相交；否则矩形中的所有点都在圆外。

```cpp
class Solution {
public:
    bool checkOverlap(int radius, int xCenter, int yCenter,
                      int x1, int y1, int x2, int y2) {
        long long closestX = clamp(xCenter, x1, x2);
        long long closestY = clamp(yCenter, y1, y2);
        long long dx = closestX - xCenter;
        long long dy = closestY - yCenter;
        return dx * dx + dy * dy <= 1LL * radius * radius;
    }
};
```

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

</details>

##### 223. 矩形面积

题目来源：[223. 矩形面积](https://leetcode.cn/problems/rectangle-area/)

题目描述：给定二维平面上的两个轴对齐矩形。第一个矩形由左下角 `(ax1,ay1)` 和右上角 `(ax2,ay2)` 确定，第二个矩形由 `(bx1,by1)` 和 `(bx2,by2)` 确定。计算两个矩形覆盖区域的总面积，重叠部分只能计算一次。

约束：所有坐标均在 $[-10^4,10^4]$ 内，每个矩形的左下角坐标不大于对应的右上角坐标。

**示例 1：**

- 输入：`ax1 = -3, ay1 = 0, ax2 = 3, ay2 = 4, bx1 = 0, by1 = -1, bx2 = 9, by2 = 2`

- 输出：`45`

**示例 2：**

- 输入：`ax1 = -2, ay1 = -2, ax2 = 2, ay2 = 2, bx1 = -2, by1 = -2, bx2 = 2, by2 = 2`

- 输出：`16`

- 解释：两个矩形完全重合，覆盖总面积仍为 `16`。

<details class="note-solution">
<summary>查看解析</summary>

思路：先分别计算两个矩形面积，再求横轴和纵轴上的重叠长度。总面积等于两个矩形面积之和减去重叠面积。横向或纵向没有公共区间时，对应重叠长度取 `0`，相乘后重叠面积自然为 `0`。

```cpp
class Solution {
public:
    int computeArea(int ax1, int ay1, int ax2, int ay2,
                    int bx1, int by1, int bx2, int by2) {
        long long first = 1LL * (ax2 - ax1) * (ay2 - ay1);
        long long second = 1LL * (bx2 - bx1) * (by2 - by1);
        long long width = max(0, min(ax2, bx2) - max(ax1, bx1));
        long long height = max(0, min(ay2, by2) - max(ay1, by1));
        return first + second - width * height;
    }
};
```

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

</details>

### Convex Hull 凸包

给定平面点集，包含所有点的最小凸多边形称为凸包。可以把它理解为一根橡皮筋包住全部点后形成的边界。

#### 转向判断

依次经过 $A,B,C$ 时，用叉积判断转向：

$$
cross(B-A,C-A)
$$

- 大于 `0`：逆时针转向。
- 等于 `0`：三点共线。
- 小于 `0`：顺时针转向。

构造凸包时，若新点导致错误方向，中间点不可能留在当前凸包边界上，应从栈顶删除。

#### Andrew 算法

1. 按横坐标升序、纵坐标升序排列所有点，并去重。
2. 从左到右扫描下凸包。设栈顶两点为 $A,B$，新点为 $C$；若 $A\to B\to C$ 不是需要的逆时针转向，则 $B$ 不能继续作为下边界拐点，将它弹出。
3. 从右到左使用同样的规则扫描上凸包。
4. 两次扫描都会经过最左点和最右点，合并时删掉重复端点。

是否保留边界上的共线点由转向条件决定：

- `cross <= 0` 时弹出：只保留每条直线边的两个端点。
- `cross < 0` 时弹出：保留凸包边界上的所有共线点。

不断弹栈直到转向恢复正确，然后才把新点入栈。因此栈中始终是已扫描点集的当前边界，而不是所有扫描过的点。

```cpp
struct Point {
    long long x, y;
};

long long cross(Point a, Point b, Point c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

// 计算只保留边端点的逆时针凸包
vector<Point> convexHull(vector<Point> points) {
    sort(points.begin(), points.end(), [](Point a, Point b) {
        return tie(a.x, a.y) < tie(b.x, b.y);
    });
    points.erase(unique(points.begin(), points.end(), [](Point a, Point b) {
        return a.x == b.x && a.y == b.y;
    }), points.end());
    if (points.size() <= 1) return points;

    vector<Point> hull;
    for (const Point& point : points) {
        while (hull.size() >= 2 && cross(hull[hull.size() - 2], hull.back(), point) <= 0) {
            hull.pop_back();
        }
        hull.push_back(point);
    }

    size_t lowerSize = hull.size();
    for (int i = static_cast<int>(points.size()) - 2; i >= 0; i--) {
        while (hull.size() > lowerSize
               && cross(hull[hull.size() - 2], hull.back(), points[i]) <= 0) {
            hull.pop_back();
        }
        hull.push_back(points[i]);
    }
    hull.pop_back();
    return hull;
}
```

排序占 $O(n\log n)$，两次扫描中每个点最多入栈、出栈一次，因此总时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

#### 边界共线点

有些题要求返回凸包边界上的所有点。此时把两处弹栈条件从 `cross <= 0` 改为 `cross < 0`，并在最终结果中去重。

若所有点共线，保留共线点的版本会在上下凸包中重复经过它们，必须去重；只保留端点的版本则只返回两个端点。

#### 例题

##### 587. 安装栅栏

题目来源：[587. 安装栅栏](https://leetcode.cn/problems/erect-the-fence/)

题目描述：给定若干棵树的平面坐标 `trees[i] = [xi, yi]`，用绳子围住全部树。返回位于围栏边界上的所有树，答案顺序不限。边界线段中间的共线点也必须返回。

约束：$1\le trees.length\le3000$，$0\le x_i,y_i\le100$，所有坐标互不相同。

**示例 1：**

- 输入：`trees = [[1,1],[2,2],[2,0],[2,4],[3,3],[4,2]]`

- 输出：`[[1,1],[2,0],[4,2],[3,3],[2,4]]`，顺序不限

- 解释：`[2,2]` 位于围栏内部，其余五个点位于边界上。

**示例 2：**

- 输入：`trees = [[1,2],[2,2],[4,2]]`

- 输出：`[[4,2],[2,2],[1,2]]`，顺序不限

- 解释：三棵树共线，全部位于围栏边界上。

<details class="note-solution">
<summary>查看解析</summary>

思路：按横坐标、纵坐标排序后分别构造下凸包和上凸包。题目要求保留边界共线点，因此仅在出现严格顺时针转向，即叉积小于 `0` 时弹栈。上下凸包会重复包含端点；所有点共线时还会产生更多重复点，合并后统一排序去重。

```cpp
class Solution {
    long long cross(const vector<int>& a, const vector<int>& b, const vector<int>& c) {
        return 1LL * (b[0] - a[0]) * (c[1] - a[1])
            - 1LL * (b[1] - a[1]) * (c[0] - a[0]);
    }

public:
    vector<vector<int>> outerTrees(vector<vector<int>>& trees) {
        sort(trees.begin(), trees.end());
        if (trees.size() <= 2) return trees;

        vector<vector<int>> hull;
        for (const auto& point : trees) {
            while (hull.size() >= 2
                   && cross(hull[hull.size() - 2], hull.back(), point) < 0) {
                hull.pop_back();
            }
            hull.push_back(point);
        }

        size_t lowerSize = hull.size();
        for (int i = static_cast<int>(trees.size()) - 2; i >= 0; i--) {
            while (hull.size() > lowerSize
                   && cross(hull[hull.size() - 2], hull.back(), trees[i]) < 0) {
                hull.pop_back();
            }
            hull.push_back(trees[i]);
        }

        sort(hull.begin(), hull.end());
        hull.erase(unique(hull.begin(), hull.end()), hull.end());
        return hull;
    }
};
```

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

</details>

## Randomized Algorithms 随机算法

随机算法使用随机选择影响执行路径或输出。正确实现首先需要保证分布正确；不要使用 `rand() % n` 生成均匀整数，因为随机数范围不一定能被 `n` 整除，会产生取模偏差。

C++ 可使用 `<random>` 中的随机数引擎和分布：

```cpp
// 在闭区间[left, right]内生成均匀随机整数
int uniformInt(int left, int right, mt19937& generator) {
    return uniform_int_distribution<int>(left, right)(generator);
}
```

### Fisher–Yates 洗牌

从数组末尾向前处理位置 `i`，在闭区间 `[0,i]` 中均匀随机选择 `j`，交换 `a[i]` 与 `a[j]`。

任意给定排列出现的概率为：

$$
\frac1n\cdot\frac1{n-1}\cdots\frac11=\frac1{n!}
$$

```cpp
// 原地生成均匀随机排列
void shuffleValues(vector<int>& values, mt19937& generator) {
    for (int i = static_cast<int>(values.size()) - 1; i > 0; i--) {
        uniform_int_distribution<int> distribution(0, i);
        swap(values[i], values[distribution(generator)]);
    }
}
```

时间复杂度 $O(n)$，额外空间复杂度 $O(1)$。

### 蓄水池抽样

数据以流的形式到达、总长度未知且只能扫描一次时，可以从前 $i$ 个元素中等概率保留一个样本：处理第 $i$ 个元素时，以 $1/i$ 的概率替换当前样本。

处理完 $n$ 个元素后，第 $k$ 个元素被保留的概率为：

$$
\frac1k\cdot\frac{k}{k+1}\cdot\frac{k+1}{k+2}\cdots\frac{n-1}{n}=\frac1n
$$

保留 $k$ 个样本时，先把前 $k$ 个元素放入蓄水池；处理第 $i$ 个元素时，在 `[0,i]` 中随机取下标，若下标小于 $k$，就替换对应样本。

```cpp
vector<int> reservoirSample(const vector<int>& stream, int k, mt19937& generator) {
    vector<int> sample(stream.begin(), stream.begin() + k);
    for (int i = k; i < stream.size(); i++) {
        int index = uniform_int_distribution<int>(0, i)(generator);
        if (index < k) sample[index] = stream[i];
    }
    return sample;
}
```

时间复杂度 $O(n)$，保存 $k$ 个样本需要 $O(k)$ 空间。调用前必须保证 $0<k\le n$。

### 按权重随机选择

正权重数组为 $w_0,w_1,\ldots,w_{n-1}$。构造前缀和：

$$
s_i=\sum_{j=0}^{i}w_j
$$

在 `[1,s_{n-1}]` 中均匀生成整数 `target`，返回第一个满足 $s_i\ge target$ 的下标。下标 $i$ 对应长度为 $w_i$ 的整数区间，因此被选中的概率为：

$$
\frac{w_i}{\sum_j w_j}
$$

### 例题

#### 384. 打乱数组

题目来源：[384. 打乱数组](https://leetcode.cn/problems/shuffle-an-array/)

题目描述：给定一个没有重复元素的整数数组，实现以下操作：构造函数保存初始数组，`reset()` 恢复并返回初始状态，`shuffle()` 返回一个随机排列。所有 $n!$ 种排列必须等概率出现。

约束：$1\le nums.length\le50$，$-10^6\le nums[i]\le10^6$，所有元素互不相同；`reset` 和 `shuffle` 最多调用 $10^4$ 次。

**示例 1：**

- 输入：初始数组 `nums = [1,2,3]`

- 输出：调用 `shuffle()` 可能得到 `[3,1,2]`，调用 `reset()` 得到 `[1,2,3]`

- 解释：`shuffle()` 的具体结果不固定，但 `[1,2,3]` 的每一种排列出现概率都应为 $1/6$。

<details class="note-solution">
<summary>查看解析</summary>

思路：每次 `shuffle()` 都复制初始数组，再执行 Fisher–Yates 洗牌。从末尾向前处理位置 `i`，在 `[0,i]` 中均匀选择交换位置，保证每种排列等概率。`original` 始终不修改，所以 `reset()` 可以直接返回初始数组。

```cpp
class Solution {
    vector<int> original;
    mt19937 generator{random_device{}()};

public:
    Solution(vector<int>& nums) : original(nums) {}

    vector<int> reset() {
        return original;
    }

    vector<int> shuffle() {
        vector<int> result = original;
        for (int i = static_cast<int>(result.size()) - 1; i > 0; i--) {
            uniform_int_distribution<int> distribution(0, i);
            swap(result[i], result[distribution(generator)]);
        }
        return result;
    }
};
```

每次洗牌时间复杂度 $O(n)$，返回数组需要 $O(n)$ 空间；`reset()` 返回副本的时间和空间也都是 $O(n)$。

</details>

#### 528. 按权重随机选择

题目来源：[528. 按权重随机选择](https://leetcode.cn/problems/random-pick-with-weight/)

题目描述：给定从 `0` 开始的正整数权重数组 `w`，实现 `pickIndex()`。每次调用返回 `[0,w.length-1]` 中的一个下标，返回下标 `i` 的概率必须为 $w_i/\sum_jw_j$。

约束：$1\le w.length\le10^4$，$1\le w[i]\le10^5$，`pickIndex` 最多调用 $10^4$ 次。

**示例 1：**

- 输入：`w = [1]`

- 输出：每次调用 `pickIndex()` 都返回 `0`

**示例 2：**

- 输入：`w = [1,3]`

- 输出：多次调用可能得到 `1,1,1,1,0`

- 解释：单次输出不是固定答案；下标 `0` 应以 $1/4$ 的概率出现，下标 `1` 应以 $3/4$ 的概率出现。

<details class="note-solution">
<summary>查看解析</summary>

思路：前缀和把每个权重映射为一段连续整数区间。`w = [1,3]` 对应区间 `[1]` 和 `[2,4]`。在 `[1,4]` 中均匀取整数，再用 `lower_bound` 找到第一个不小于随机数的前缀和，下标被覆盖的整数数量恰好等于它的权重。

```cpp
class Solution {
    vector<long long> prefix;
    mt19937 generator{random_device{}()};

public:
    Solution(vector<int>& weights) {
        partial_sum(weights.begin(), weights.end(), back_inserter(prefix));
    }

    int pickIndex() {
        uniform_int_distribution<long long> distribution(1, prefix.back());
        return lower_bound(prefix.begin(), prefix.end(), distribution(generator)) - prefix.begin();
    }
};
```

预处理时间复杂度和空间复杂度都是 $O(n)$，每次选择的时间复杂度为 $O(\log n)$，额外空间复杂度为 $O(1)$。

</details>

### 如何检查随机结果

随机输出不能靠单次结果验证。应分别检查：

- 结构约束：洗牌后元素不增不减，抽样结果一定来自输入。
- 边界输入：单元素、权重差异很大、数据流长度恰好等于蓄水池容量。
- 分布检查：固定大量试验次数，确认各结果频率落在合理误差范围内。

调试时使用固定种子，便于重现同一组结果；提交时再根据题目接口决定是否使用 `random_device`。
