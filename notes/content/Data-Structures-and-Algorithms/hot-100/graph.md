---
title: Hot 100：图论
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 200. 岛屿数量

给定由字符 `'1'`（陆地）和 `'0'`（水）组成的二维网格。相邻陆地仅通过上、下、左、右连接，网格边界外都是水。返回网格中的岛屿数量。

[题目链接](https://leetcode.cn/problems/number-of-islands/)

### 示例

#### 示例 1

- 输入：

  ```text
  1 1 1 1 0
  1 1 0 1 0
  1 1 0 0 0
  0 0 0 0 0
  ```

- 输出：`1`

#### 示例 2

- 输入：

  ```text
  1 1 0 0 0
  1 1 0 0 0
  0 0 1 0 0
  0 0 0 1 1
  ```

- 输出：`3`

### 数据范围

- $m=grid.length$，$n=grid[i].length$
- $1 \leq m,n \leq 300$
- `grid[i][j]` 为 `'0'` 或 `'1'`

<details class="note-solution">
<summary>查看解析</summary>

### 连通块

把每个陆地格看作图中的节点，上下左右相邻的陆地之间连边，一座岛屿就是一个连通块。

从任意尚未访问的陆地出发，一次 DFS 或 BFS 会访问整座岛屿。外层扫描每发现一块新陆地，答案加一，再把它所在的整个连通块标记为已访问。

以下写法直接把访问过的 `'1'` 改成 `'0'`，用输入网格保存访问状态。

### 方法一：DFS

```cpp
class Solution {
    int rows, columns;

    void dfs(vector<vector<char>>& grid, int row, int column) {
        if (row < 0 || row >= rows || column < 0 || column >= columns ||
            grid[row][column] != '1') {
            return;
        }
        grid[row][column] = '0';
        dfs(grid, row - 1, column);
        dfs(grid, row + 1, column);
        dfs(grid, row, column - 1);
        dfs(grid, row, column + 1);
    }

public:
    int numIslands(vector<vector<char>>& grid) {
        rows = grid.size();
        columns = grid[0].size();
        int answer = 0;
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] == '1') {
                    answer++;
                    dfs(grid, row, column);
                }
            }
        }
        return answer;
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$，最坏情况下递归栈包含整个网格

### 方法二：BFS

发现新岛屿后，用队列逐层访问所有相连陆地。节点入队时立即标记，避免同一格被多个邻居重复加入队列。

```cpp
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int rows = grid.size(), columns = grid[0].size();
        int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int answer = 0;

        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] != '1') {
                    continue;
                }
                answer++;
                queue<pair<int, int>> q;
                q.push({row, column});
                grid[row][column] = '0';
                while (!q.empty()) {
                    auto [x, y] = q.front();
                    q.pop();
                    for (auto& direction : directions) {
                        int nextX = x + direction[0];
                        int nextY = y + direction[1];
                        if (nextX < 0 || nextX >= rows || nextY < 0 || nextY >= columns ||
                            grid[nextX][nextY] != '1') {
                            continue;
                        }
                        grid[nextX][nextY] = '0';
                        q.push({nextX, nextY});
                    }
                }
            }
        }
        return answer;
    }
};
```

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$

### 正确性

一次搜索只会沿上下左右进入陆地，所以访问的格子都属于同一岛屿；反过来，该岛屿中的任意陆地都与起点连通，最终一定被搜索访问。外层扫描只在遇到未访问陆地时计数，因此每座岛屿恰好计数一次。

### 易错点

- 对角线相邻不算连通。
- BFS 应在入队时标记，而不是出队时标记。
- 本实现会修改输入网格；若调用者需要保留输入，应另建访问数组。
- 网格保存的是字符 `'0'`、`'1'`，不是整数 `0`、`1`。

</details>

### 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/number-of-islands/solutions/)

## 994. 腐烂的橘子

给定网格 `grid`：`0` 表示空格，`1` 表示新鲜橘子，`2` 表示腐烂橘子。每分钟，腐烂橘子会使上下左右相邻的新鲜橘子腐烂。返回所有新鲜橘子腐烂所需的最少分钟数；若无法全部腐烂，返回 `-1`。

[题目链接](https://leetcode.cn/problems/rotting-oranges/)

### 示例

#### 示例 1

- 输入：`grid = [[2,1,1],[1,1,0],[0,1,1]]`
- 输出：`4`

#### 示例 2

- 输入：`grid = [[2,1,1],[0,1,1],[1,0,1]]`
- 输出：`-1`
- 解释：左下角的新鲜橘子与其他橘子不连通，永远不会腐烂。

#### 示例 3

- 输入：`grid = [[0,2]]`
- 输出：`0`
- 解释：开始时没有新鲜橘子。

### 数据范围

- $m=grid.length$，$n=grid[i].length$
- $1 \leq m,n \leq 10$
- `grid[i][j]` 为 `0`、`1` 或 `2`

<details class="note-solution">
<summary>查看解析</summary>

### 多源 BFS

所有初始腐烂橘子会同时扩散，不能逐个从每个腐烂橘子独立搜索。把所有初始腐烂位置一起加入队列，它们构成 BFS 的第 `0` 层；之后每扩展一层就过去一分钟。

同时统计新鲜橘子数量 `fresh`。只有实际使至少一个新鲜橘子腐烂的一层才增加分钟数。

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int rows = grid.size(), columns = grid[0].size();
        queue<pair<int, int>> q;
        int fresh = 0;
        for (int row = 0; row < rows; row++) {
            for (int column = 0; column < columns; column++) {
                if (grid[row][column] == 2) {
                    q.push({row, column});
                } else if (grid[row][column] == 1) {
                    fresh++;
                }
            }
        }

        int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int minutes = 0;
        while (!q.empty() && fresh > 0) {
            int size = q.size();
            while (size--) {
                auto [x, y] = q.front();
                q.pop();
                for (auto& direction : directions) {
                    int nextX = x + direction[0];
                    int nextY = y + direction[1];
                    if (nextX < 0 || nextX >= rows || nextY < 0 || nextY >= columns ||
                        grid[nextX][nextY] != 1) {
                        continue;
                    }
                    grid[nextX][nextY] = 2;
                    fresh--;
                    q.push({nextX, nextY});
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
    }
};
```

### 为什么是最少时间

BFS 按距离递增访问网格。所有腐烂橘子同时作为起点后，一个新鲜橘子第一次被访问的层数，就是它到任意初始腐烂橘子的最短四联通距离，也就是它最早腐烂的时间。所有橘子腐烂的时间是这些最短时间的最大值。

### 复杂度

- 时间复杂度：$O(mn)$
- 空间复杂度：$O(mn)$

### 易错点

- 初始腐烂橘子必须同时入队，这是多源 BFS。
- 没有新鲜橘子时答案为 `0`，不能因为队列非空而多算一分钟。
- 新鲜橘子入队时立即改为 `2`，避免被重复腐烂和重复计数。
- BFS 结束后仍有 `fresh > 0`，说明存在无法到达的橘子，应返回 `-1`。

</details>

### 参考

- [灵茶山艾府：网格图题单](https://leetcode.cn/discuss/post/YiXPXW/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/rotting-oranges/solutions/)

## 207. 课程表

共有 `numCourses` 门课程，编号为 `0` 到 `numCourses - 1`。先修关系 `prerequisites[i] = [course, prerequisite]` 表示学习 `course` 前必须先学习 `prerequisite`。判断能否完成全部课程。

[题目链接](https://leetcode.cn/problems/course-schedule/)

### 示例

#### 示例 1

- 输入：`numCourses = 2, prerequisites = [[1,0]]`
- 输出：`true`
- 解释：先学习课程 `0`，再学习课程 `1`。

#### 示例 2

- 输入：`numCourses = 2, prerequisites = [[1,0],[0,1]]`
- 输出：`false`
- 解释：课程 `0` 和 `1` 互相依赖，形成环。

### 数据范围

- $1 \leq numCourses \leq 2000$
- $0 \leq prerequisites.length \leq 5000$
- `prerequisites[i].length == 2`
- 每组先修关系中的两个课程编号不同
- 输入中没有重复的先修关系

<details class="note-solution">
<summary>查看解析</summary>

### 图论建模

对先修关系 `[course, prerequisite]` 建立有向边：

$$
prerequisite\rightarrow course
$$

能完成全部课程，当且仅当依赖图中没有有向环。若存在环，环中每门课程都在等待另一门课程完成；若无环，则至少能找到一种拓扑顺序完成课程。

### 方法一：Kahn 入度 BFS

`indegree[i]` 表示课程 `i` 还有多少门先修课未完成：

1. 把所有入度为 `0` 的课程加入队列；
2. 每完成一门课程，就删除它的所有出边，即让后续课程入度减一；
3. 后续课程入度变为 `0` 时加入队列；
4. 最后比较已完成课程数与总课程数。

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> graph(numCourses);
        vector<int> indegree(numCourses);
        for (const auto& edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
            indegree[edge[0]]++;
        }

        queue<int> q;
        for (int course = 0; course < numCourses; course++) {
            if (indegree[course] == 0) {
                q.push(course);
            }
        }

        int completed = 0;
        while (!q.empty()) {
            int course = q.front();
            q.pop();
            completed++;
            for (int next : graph[course]) {
                if (--indegree[next] == 0) {
                    q.push(next);
                }
            }
        }
        return completed == numCourses;
    }
};
```

若存在环，环内节点的入度永远无法降为 `0`，最终完成数小于课程总数；若无环，拓扑排序会依次取出所有节点。

- 时间复杂度：$O(V+E)$
- 空间复杂度：$O(V+E)$

### 方法二：DFS 三色标记判环

每门课程有三种状态：

- `0`：尚未访问；
- `1`：正在当前递归路径中访问；
- `2`：该课程出发的所有路径已经确认无环。

DFS 遇到状态为 `1` 的节点，说明当前路径回到了自己的祖先，存在有向环。

```cpp
class Solution {
    vector<vector<int>> graph;
    vector<int> color;

    bool acyclic(int course) {
        if (color[course] == 1) {
            return false;
        }
        if (color[course] == 2) {
            return true;
        }
        color[course] = 1;
        for (int next : graph[course]) {
            if (!acyclic(next)) {
                return false;
            }
        }
        color[course] = 2;
        return true;
    }

public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        graph.assign(numCourses, {});
        color.assign(numCourses, 0);
        for (const auto& edge : prerequisites) {
            graph[edge[1]].push_back(edge[0]);
        }
        for (int course = 0; course < numCourses; course++) {
            if (!acyclic(course)) {
                return false;
            }
        }
        return true;
    }
};
```

状态 `2` 表示该节点的后续路径已经检查完毕，再次到达它时可以直接返回，避免重复搜索。

- 时间复杂度：$O(V+E)$
- 空间复杂度：$O(V+E)$，包含邻接表、状态数组和递归栈

### 易错点

- `[course, prerequisite]` 应建边 `prerequisite → course`。
- 拓扑排序不是判断课程编号能否升序排列，而是判断能否处理全部节点。
- DFS 只有遇到当前递归路径中的灰色节点才表示环；遇到已完成的黑色节点不表示环。
- 图可能不连通，DFS 需要从每个尚未完成检查的课程出发。

</details>

### 参考

- [灵茶山艾府：图论算法题单](https://leetcode.cn/discuss/post/01LUak/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/course-schedule/solutions/)

## 208. 实现 Trie（前缀树）

实现前缀树 `Trie`：

- `insert(word)`：插入字符串；
- `search(word)`：字符串此前完整插入过时返回 `true`；
- `startsWith(prefix)`：此前插入的字符串中存在给定前缀时返回 `true`。

[题目链接](https://leetcode.cn/problems/implement-trie-prefix-tree/)

### 示例

- 输入：`["Trie","insert","search","search","startsWith","insert","search"]`
- 参数：`[[],["apple"],["apple"],["app"],["app"],["app"],["app"]]`
- 输出：`[null,null,true,false,true,null,true]`

执行过程：

1. 插入 `"apple"`；
2. `search("apple")` 为 `true`；
3. `search("app")` 为 `false`，因为此时 `app` 只是前缀，没有作为完整单词插入；
4. `startsWith("app")` 为 `true`；
5. 插入 `"app"` 后，`search("app")` 为 `true`。

### 数据范围

- $1 \leq word.length,prefix.length \leq 2000$
- `word` 和 `prefix` 只包含小写英文字母
- `insert`、`search`、`startsWith` 的调用总数不超过 $3\times10^4$

<details class="note-solution">
<summary>查看解析</summary>

### Trie 的节点含义

Trie 的边表示字符，从根节点沿边走到某个节点，路径上的字符构成一个前缀。每个节点包含：

- `son[26]`：下一字符对应的子树入口；
- `end`：是否有单词恰好在当前节点结束。

`end` 不等于“这是叶子节点”。例如同时插入 `app` 和 `apple` 后，表示 `app` 的节点既有后继，又需要标记为单词结尾。

### 实现

`findPrefix` 只负责沿字符路径查找并返回终点。`search` 在此基础上额外检查 `end`，而 `startsWith` 只要求路径存在。

```cpp
class Trie {
    struct TrieNode {
        TrieNode* son[26]{};
        bool end = false;
    };

    TrieNode* root;

    TrieNode* findPrefix(const string& text) {
        TrieNode* node = root;
        for (char c : text) {
            int index = c - 'a';
            if (!node->son[index]) {
                return nullptr;
            }
            node = node->son[index];
        }
        return node;
    }

public:
    Trie() : root(new TrieNode) {}

    void insert(string word) {
        TrieNode* node = root;
        for (char c : word) {
            int index = c - 'a';
            if (!node->son[index]) {
                node->son[index] = new TrieNode;
            }
            node = node->son[index];
        }
        node->end = true;
    }

    bool search(string word) {
        TrieNode* node = findPrefix(word);
        return node && node->end;
    }

    bool startsWith(string prefix) {
        return findPrefix(prefix);
    }
};
```

### 正确性

插入时，第 `i` 次循环结束后，`node` 表示单词前 `i + 1` 个字符构成的前缀；缺少的边会被创建，因此最终路径完整存在，并在终点设置 `end`。

查找前缀时，任意一条边不存在都说明没有已插入单词具有该前缀；全部边存在则说明前缀存在。完整单词查询还要求终点 `end = true`，所以不会把仅为其他单词前缀的字符串误判为已插入单词。

### 复杂度

设本次操作的字符串长度为 $L$：

- `insert`：时间复杂度 $O(L)$；
- `search`：时间复杂度 $O(L)$；
- `startsWith`：时间复杂度 $O(L)$；
- 总空间复杂度：$O(S|\Sigma|)$，其中 $S$ 是已创建节点数，$|\Sigma|=26$。

### 易错点

- `search("app")` 与 `startsWith("app")` 含义不同，前者必须检查 `end`。
- 多个单词会共享前缀节点，插入时只在子节点不存在时创建。
- `end` 标记属于单词终点，不能简单用“没有孩子”代替。
- 题目限定小写英文字母，因此才能直接使用 `c - 'a'` 作为下标。

</details>

### 参考

- [项目现有 Trie 笔记](../string.md#trie-%E5%AD%97%E5%85%B8%E6%A0%91)
- [灵茶山艾府：常用数据结构题单](https://leetcode.cn/discuss/post/mOr1u6/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/implement-trie-prefix-tree/solutions/)
