---
title: Tree Algorithms 树算法
date: 2026-09-01
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## Binary Tree Traversal 二叉树遍历与构造

本文中二叉树节点使用如下结构：

```cpp
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int val_=0, TreeNode* left_=nullptr, TreeNode* right_=nullptr)
        :val(val_), left(left_), right(right){}
};
```

### 遍历模板

#### 递归遍历

前序在递归左右子树前处理当前节点；中序在两者之间处理；后序在两者之后处理。

```cpp
void preorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    ans.push_back(root->val);
    preorder(root->left, ans);
    preorder(root->right, ans);
}

void inorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    inorder(root->left, ans);
    ans.push_back(root->val);
    inorder(root->right, ans);
}

void postorder(TreeNode* root, vector<int>& ans) {
    if (!root) return;
    postorder(root->left, ans);
    postorder(root->right, ans);
    ans.push_back(root->val);
}
```

#### 颜色遍历法

栈中保存 `pair<TreeNode*, bool>`。`false` 表示节点尚未展开，`true` 表示可以处理该节点。由于栈后进先出，节点必须按遍历顺序的逆序入栈。

前序遍历的顺序是根、左、右，因此依次将右、左、根压栈。

```cpp
vector<int> preorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node->right, false});
        st.push({node->left, false});
        st.push({node, true});
    }
    return ans;
}
```

中序遍历的顺序是左、根、右，因此依次将右、根、左压栈。

```cpp
vector<int> inorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node->right, false});
        st.push({node, true});
        st.push({node->left, false});
    }
    return ans;
}
```

后序遍历的顺序是左、右、根，因此依次将根、右、左压栈。

```cpp
vector<int> postorder(TreeNode* root) {
    vector<int> ans;
    stack<pair<TreeNode*, bool>> st;
    st.push({root, false});
    while (!st.empty()) {
        auto [node, visited] = st.top();
        st.pop();
        if (!node) continue;
        if (visited) {
            ans.push_back(node->val);
            continue;
        }
        st.push({node, true});
        st.push({node->right, false});
        st.push({node->left, false});
    }
    return ans;
}
```

#### 层序遍历

队列中始终保存下一层之前的全部节点。每轮先记录队列大小，就能限定本层范围。

```cpp
vector<vector<int>> levelOrder(TreeNode* root) {
    if (!root) return {};
    vector<vector<int>> ans;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int size = q.size();
        ans.emplace_back();
        while (size--) {
            TreeNode* node = q.front();
            q.pop();
            ans.back().push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
    }
    return ans;
}
```

### 例题

#### 104. 二叉树的最大深度

题目来源：[104. 二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

题目描述：给定二叉树根节点 `root`，返回树的最大深度；根到最远叶子节点路径上的节点数就是深度。

**示例 1：**

- 输入：`root = [3,9,20,null,null,15,7]`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：空树深度为 `0`；非空树深度是左右子树深度的较大值加一。这是典型的自底向上 DFS：子问题先返回信息，父节点再组合。

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) return 0;
        return max(maxDepth(root->left), maxDepth(root->right)) + 1;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

#### 105. 从前序与中序遍历序列构造二叉树

题目来源：[105. 从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

题目描述：给定没有重复值的前序数组 `preorder` 和中序数组 `inorder`，构造并返回原二叉树。

**示例 1：**

- 输入：`preorder = [3,9,20,15,7]`，`inorder = [9,3,15,20,7]`

- 输出：`[3,9,20,null,null,15,7]`

<details class="note-solution">
<summary>查看解析</summary>

思路：前序的第一个元素必是当前子树根；它在中序数组的位置将左右子树分开。哈希表记录中序下标，递归时用区间确定子树范围。

```cpp
class Solution {
    unordered_map<int, int> pos;
    int preIndex = 0;

    TreeNode* build(const vector<int>& preorder, int left, int right) {
        if (left > right) return nullptr;
        int value = preorder[preIndex++];
        TreeNode* root = new TreeNode(value);
        int mid = pos[value];
        root->left = build(preorder, left, mid - 1);
        root->right = build(preorder, mid + 1, right);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for (int i = 0; i < inorder.size(); i++) pos[inorder[i]] = i;
        return build(preorder, 0, inorder.size() - 1);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

#### 199. 二叉树的右视图

题目来源：[199. 二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/)

题目描述：给定二叉树的根节点 `root`，想象自己站在二叉树右侧，按照从上到下的顺序返回能够看到的节点值。

**示例 1：**

- 输入：`root = [1,2,3,null,5,null,4]`

- 输出：`[1,3,4]`

<details class="note-solution">
<summary>查看解析</summary>

思路：队列同时保存节点和层号。按照左子节点、右子节点的顺序入队，每访问到同一层的新节点就覆盖这一层原有的答案，因此遍历结束后保留的是每层最右侧的节点。

```cpp
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        queue<pair<TreeNode*, int>> q;
        q.push({root, 0});
        vector<int> ans;
        while (!q.empty()) {
            auto [node, depth] = q.front();
            q.pop();
            if (!node) continue;
            if (depth == ans.size()) {
                ans.push_back(node->val);
            } else {
                ans[depth] = node->val;
            }
            q.push({node->left, depth + 1});
            q.push({node->right, depth + 1});
        }
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

### 扩展练习

- [144. 二叉树的前序遍历](https://leetcode.cn/problems/binary-tree-preorder-traversal/)
- [145. 二叉树的后序遍历](https://leetcode.cn/problems/binary-tree-postorder-traversal/)
- [226. 翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/)

## Binary Tree DFS 二叉树 DFS

#### 自顶向下

递归参数保存从根到当前节点的状态，例如路径和、最大值或当前层数。进入子树前更新状态，到叶子节点时结算答案。

#### 自底向上

递归函数返回当前子树需要交给父节点的信息，例如高度、路径贡献或是否包含目标节点。左右子树返回后，再在当前节点合并。

### 例题

#### 543. 二叉树的直径

题目来源：[543. 二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/)

题目描述：二叉树中任意两个节点之间的路径长度是经过边的数量。返回树的最长路径长度；这条路径不一定经过根节点。

**示例 1：**

- 输入：`root = [1,2,3,4,5]`

- 输出：`3`

- 解释：最长路径可以是 `4 → 2 → 1 → 3`。

<details class="note-solution">
<summary>查看解析</summary>

思路：对任意节点，穿过它的最长路径长度是左子树高度加右子树高度。DFS 返回“从当前节点向下的最大高度”，同时用全局答案记录每个节点处的路径长度。

```cpp
class Solution {
    int ans = 0;

    int height(TreeNode* root) {
        if (!root) return 0;
        int left = height(root->left);
        int right = height(root->right);
        ans = max(ans, left + right);
        return max(left, right) + 1;
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

#### 437. 路径总和 III

题目来源：[437. 路径总和 III](https://leetcode.cn/problems/path-sum-iii/)

题目描述：给定二叉树根节点 `root` 和整数 `targetSum`，统计路径和恰好为 `targetSum` 的路径数。路径必须从父节点到子节点连续向下，但不必从根开始或在叶子结束。

**示例 1：**

- 输入：`root = [10,5,-3,3,2,null,11,3,-2,null,1]`，`targetSum = 8`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：当前根到节点的前缀和为 `sum`。若以前出现过前缀和 `sum - targetSum`，二者之间的向下路径和就是目标值。DFS 入栈时加入当前前缀和，离开节点时撤销，保证哈希表只描述当前根到节点路径。

```cpp
class Solution {
    unordered_map<long long, int> count{{0, 1}};
    int target;

    int dfs(TreeNode* root, long long sum) {
        if (!root) return 0;
        sum += root->val;
        int ans = count[sum - target];
        count[sum]++;
        ans += dfs(root->left, sum) + dfs(root->right, sum);
        count[sum]--;
        return ans;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        target = targetSum;
        return dfs(root, 0);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

#### 124. 二叉树中的最大路径和

题目来源：[124. 二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

题目描述：路径至少包含一个节点，节点不能重复，路径不要求经过根节点。返回所有路径中的最大节点值之和。

**示例 1：**

- 输入：`root = [-10,9,20,null,null,15,7]`

- 输出：`42`

- 解释：路径 `15 → 20 → 7` 的和为 `42`。

<details class="note-solution">
<summary>查看解析</summary>

思路：对子节点的负贡献直接舍弃。当前节点可作为一条完整路径的最高点，值为 `root->val + left + right`；返回给父节点时只能选择一侧，因为路径不能分叉后再向上。

```cpp
class Solution {
    int ans = INT_MIN;

    int gain(TreeNode* root) {
        if (!root) return 0;
        int left = max(gain(root->left), 0);
        int right = max(gain(root->right), 0);
        ans = max(ans, root->val + left + right);
        return root->val + max(left, right);
    }

public:
    int maxPathSum(TreeNode* root) {
        gain(root);
        return ans;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

### 扩展练习

- [101. 对称二叉树](https://leetcode.cn/problems/symmetric-tree/)
- [113. 路径总和 II](https://leetcode.cn/problems/path-sum-ii/)
- [114. 二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)
- [337. 打家劫舍 III](https://leetcode.cn/problems/house-robber-iii/)，详见[树形 DP](./dynamic-programming.md#tree-dp-%E6%A0%91%E5%BD%A2dp)

## Binary Search Tree 二叉搜索树

二叉搜索树（BST）满足：任一节点左子树全部值小于该节点，右子树全部值大于该节点。中序遍历 BST 会得到严格递增序列。

### 核心模板

#### 区间验证

每个节点不仅要与父节点比较，还必须落在所有祖先给定的开区间内。

```cpp
bool valid(TreeNode* root, long long low, long long high) {
    if (!root) return true;
    if (root->val <= low || root->val >= high) return false;
    return valid(root->left, low, root->val) &&
           valid(root->right, root->val, high);
}
```

#### 有序数组构造平衡 BST

取中点为根，左右区间递归构造。每层区间近似对半，树高为 $O(\log n)$。

### 例题

#### 98. 验证二叉搜索树

题目来源：[98. 验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/)

题目描述：给定二叉树根节点 `root`，判断它是否为有效 BST。

**示例 1：**

- 输入：`root = [2,1,3]`

- 输出：`true`

**示例 2：**

- 输入：`root = [5,1,4,null,null,3,6]`

- 输出：`false`

- 解释：节点 `3` 位于根 `5` 的右子树中，却小于 `5`。

<details class="note-solution">
<summary>查看解析</summary>

思路：只比较当前节点和直接孩子会漏掉示例 2。DFS 传入当前节点允许的开区间，根的初始区间为无穷小到无穷大。

```cpp
class Solution {
    bool check(TreeNode* root, long long low, long long high) {
        if (!root) return true;
        if (root->val <= low || root->val >= high) return false;
        return check(root->left, low, root->val) &&
               check(root->right, root->val, high);
    }

public:
    bool isValidBST(TreeNode* root) {
        return check(root, LLONG_MIN, LLONG_MAX);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

#### 230. 二叉搜索树中第 K 小的元素

题目来源：[230. 二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

题目描述：给定 BST 根节点 `root` 和整数 `k`，返回其中第 `k` 小的节点值。

**示例 1：**

- 输入：`root = [3,1,4,null,2]`，`k = 1`

- 输出：`1`

<details class="note-solution">
<summary>查看解析</summary>

思路：BST 的中序序列递增。使用迭代中序遍历，每弹出一个节点就让 `k` 减一，减到零时即为答案。

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        while (true) {
            while (root) {
                st.push(root);
                root = root->left;
            }
            root = st.top();
            st.pop();
            if (--k == 0) return root->val;
            root = root->right;
        }
    }
};
```

时间复杂度 $O(h+k)$，空间复杂度 $O(h)$。

</details>

#### 108. 将有序数组转换为二叉搜索树

题目来源：[108. 将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

题目描述：给定升序整数数组 `nums`，构造一棵高度平衡的 BST 并返回根节点。

**示例 1：**

- 输入：`nums = [-10,-3,0,5,9]`

- 输出：`[0,-3,9,-10,null,5]`

- 解释：答案不唯一，只要是高度平衡 BST 即可。

<details class="note-solution">
<summary>查看解析</summary>

思路：有序数组中点左侧都小于中点、右侧都大于中点；将中点作为根后，左右区间递归构建。每次取中点自然避免单侧过深。

```cpp
class Solution {
    TreeNode* build(const vector<int>& nums, int left, int right) {
        if (left > right) return nullptr;
        int mid = left + (right - left) / 2;
        TreeNode* root = new TreeNode(nums[mid]);
        root->left = build(nums, left, mid - 1);
        root->right = build(nums, mid + 1, right);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(\log n)$。

</details>

### 扩展练习

- [235. 二叉搜索树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/)
- [450. 删除二叉搜索树中的节点](https://leetcode.cn/problems/delete-node-in-a-bst/)
- [538. 把二叉搜索树转换为累加树](https://leetcode.cn/problems/convert-bst-to-greater-tree/)

## Lowest Common Ancestor 最近公共祖先

在一棵已经定根的树中，`u`、`v` 的最近公共祖先（LCA）是同时为两者祖先且深度最大的节点。它必然位于 `u` 到 `v` 的唯一路径上。

本页默认输入为 `n` 个编号为 `1..n` 的节点、`n - 1` 条无权边，并以 `root` 为根；之后有多次查询 `(u, v)`，每次输出 `LCA(u, v)`。

### 朴素 DFS

先从根 DFS，记录每个节点的父节点 `parent[u]` 和深度 `depth[u]`。查询时先把较深节点不断跳到同一深度，再让两个节点同时向父节点跳；第一次相等的位置就是 LCA。

```cpp
constexpr int MAXN = 200000 + 5;
vector<int> graph[MAXN];
int parent[MAXN], depth[MAXN];

void dfs(int u, int p) {
    parent[u] = p;
    depth[u] = depth[p] + 1;
    for (int v : graph[u]) {
        if (v == p) continue;
        dfs(v, u);
    }
}

int lca(int u, int v) {
    while (depth[u] > depth[v]) u = parent[u];
    while (depth[v] > depth[u]) v = parent[v];
    while (u != v) {
        u = parent[u];
        v = parent[v];
    }
    return u;
}
```

建边后调用 `dfs(root, 0)`。

预处理时间 $O(n)$、空间 $O(n)$；单次查询最坏 $O(n)$，实际等于两点到 LCA 的路径长度。树高较小或查询很少时，这个写法最直接。

### 倍增

倍增把“向父节点跳一步”变为“向上跳 $2^k$ 步”。定义 `up[k][u]` 为 `u` 的第 $2^k$ 个祖先，则：

$$
up[k][u] = up[k - 1][up[k - 1][u]]
$$

先用 DFS 填 `up[0]`、`depth`，再递推其余层。查询分为两步：

1. 按深度差的二进制位，把较深节点提升到同层。
2. 从大的 $k$ 向下试跳；若两节点跳 $2^k$ 步后仍不相同，就同时跳。结束后它们的父节点就是 LCA。

```cpp
constexpr int MAXN = 200000 + 5;
constexpr int LOG = 20;
vector<int> graph[MAXN];
int up[MAXN][LOG], depth[MAXN];

void dfs(int u, int p) {
    up[u][0] = p;
    depth[u] = depth[p] + 1;
    for (int k = 1; k < LOG; k++) {
        up[u][k] = up[up[u][k - 1]][k - 1];
    }
    for (int v : graph[u]) {
        if (v == p) continue;
        dfs(v, u);
    }
}

int lca(int u, int v) {
    if (depth[u] < depth[v]) swap(u, v);
    int diff = depth[u] - depth[v];
    for (int k = 0; k < LOG; k++) {
        if ((diff >> k) & 1) u = up[k][u];
    }
    if (u == v) return u;
    for (int k = LOG - 1; k >= 0; k--) {
        if (up[k][u] == up[k][v]) continue;
        u = up[k][u];
        v = up[k][v];
    }
    return up[0][u];
}

```

建边后调用 `dfs(root, 0)`。

预处理时间和空间都是 $O(n\log n)$，每次查询 $O(\log n)$，适合大量查询。

### 应用

若 `depth[x]` 是根到 `x` 的边数，树上两点距离为：

$$
dist(u, v) = depth[u] + depth[v] - 2 \times depth[LCA(u, v)]
$$

练习：[P3379 【模板】最近公共祖先（LCA）](https://www.luogu.com.cn/problem/P3379)。

## General Tree 一般树

这里的一般树指由边给出的无权树，而不是二叉树节点对象。用邻接表保存无根树后，任选节点作为根，通过父节点参数避免走回父边。

### 建树与遍历

```cpp
vector<vector<int>> graph(n + 1);
for (auto [u, v] : edges) {
    graph[u].push_back(v);
    graph[v].push_back(u);
}

void dfs(int u, int parent) {
    for (int v : graph[u]) {
        if (v == parent) continue;
        dfs(v, u);
    }
}
```

`parent` 既表示定根后的父节点，也防止无向边让 DFS 在父子之间无限往返。

### 例题与模板

#### N 叉树的最大深度

题目来源：[559. N 叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-n-ary-tree/)

题目描述：N 叉树节点有 `children` 数组。给定根节点 `root`，返回从根到最远叶节点的节点数。

**示例 1：**

- 输入：`root = [1,null,3,2,4,null,5,6]`

- 输出：`3`

<details class="note-solution">
<summary>查看解析</summary>

思路：二叉树求高度的递归公式可直接推广：当前节点深度为所有子树最大深度加一。

```cpp
class Solution {
public:
    int maxDepth(Node* root) {
        if (!root) return 0;
        int depth = 0;
        for (Node* child : root->children) {
            depth = max(depth, maxDepth(child));
        }
        return depth + 1;
    }
};
```

时间复杂度 $O(n)$，空间复杂度 $O(h)$。

</details>

#### 树的直径

题目描述：给定一棵含 `n` 个节点、`n-1` 条无权边的连通树，求任意两节点之间的最大边数距离。

**示例：**

- 输入：`n = 6`，`edges = [[1,2],[2,3],[2,4],[4,5],[4,6]]`

- 输出：`3`

- 解释：路径 `3 → 2 → 4 → 5` 的长度为 `3`。

<details class="note-solution">
<summary>查看解析</summary>

思路：任选节点 `s`，BFS 找到离它最远的节点 `a`；再从 `a` BFS，最远距离就是树的直径。树中两点之间路径唯一，因此无需 Dijkstra。

```cpp
pair<int, int> farthest(const vector<vector<int>>& graph, int start) {
    vector<int> dist(graph.size(), -1);
    queue<int> q;
    q.push(start);
    dist[start] = 0;
    int last = start;

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        last = u;
        for (int v : graph[u]) {
            if (dist[v] != -1) continue;
            dist[v] = dist[u] + 1;
            q.push(v);
        }
    }
    return {last, dist[last]};
}

int treeDiameter(const vector<vector<int>>& graph) {
    int a = farthest(graph, 1).first;
    return farthest(graph, a).second;
}
```

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

</details>

### 交叉阅读

- 仅包含父子关系的树形动态规划，详见[树形 DP](./dynamic-programming.md#tree-dp-%E6%A0%91%E5%BD%A2dp)。
- 边可以组成环、需要处理访问状态的题，详见[图论算法](./graph.md)。
