---
title: Hot 100：二叉树
date: 2026-09-07
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

## 94. 二叉树的中序遍历

给定二叉树根节点 `root`，返回它的中序遍历结果。中序遍历的访问顺序是“左子树 → 当前节点 → 右子树”。

[题目链接](https://leetcode.cn/problems/binary-tree-inorder-traversal/)

### 示例

#### 示例 1

- 输入：`root = [1,null,2,3]`
- 输出：`[1,3,2]`

树的结构为：

```text
1
 \
  2
 /
3
```

#### 示例 2

- 输入：`root = []`
- 输出：`[]`

#### 示例 3

- 输入：`root = [1]`
- 输出：`[1]`

### 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：递归遍历

递归函数负责遍历以 `root` 为根的子树。空树无需处理；非空树先递归左子树，再记录根节点，最后递归右子树。

```cpp
class Solution {
    void inorder(TreeNode* root, vector<int>& ans) {
        if (!root) {
            return;
        }
        inorder(root->left, ans);
        ans.push_back(root->val);
        inorder(root->right, ans);
    }

public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        inorder(root, ans);
        return ans;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$，其中 $h$ 为树高，来自递归调用栈

### 方法二：颜色遍历法

栈中保存 `pair<TreeNode*, bool>`：

- `false` 表示节点尚未展开；
- `true` 表示左右子树的相对顺序已经安排好，现在可以记录该节点。

栈是后进先出。中序要求“左、根、右”，所以展开节点时按相反顺序压入“右、根、左”。

```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        stack<pair<TreeNode*, bool>> st;
        st.push({root, false});
        while (!st.empty()) {
            auto [node, visited] = st.top();
            st.pop();
            if (!node) {
                continue;
            }
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
};
```

每个非空节点先以未处理状态入栈，展开后再以已处理状态入栈一次，因此节点值只会记录一次，顺序正好是左、根、右。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$；最坏情况下栈中保存 $O(n)$ 个元素

### 易错点

- 中序遍历不是按节点值排序；只有二叉搜索树的中序序列具有单调性。
- 颜色遍历法的压栈顺序必须与目标访问顺序相反。
- 空节点只用于表示结构，不应加入答案。
- 递归辅助函数应通过引用写入同一个答案数组。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-inorder-traversal/solutions/)

## 104. 二叉树的最大深度

给定二叉树根节点 `root`，返回树的最大深度。最大深度是从根节点到最远叶子节点的最长路径所包含的节点数。

[题目链接](https://leetcode.cn/problems/maximum-depth-of-binary-tree/)

### 示例

#### 示例 1

- 输入：`root = [3,9,20,null,null,15,7]`
- 输出：`3`

#### 示例 2

- 输入：`root = [1,null,2]`
- 输出：`2`

### 数据范围

- 二叉树节点数为 $[0,10^4]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：自底向上递归

空树深度为 `0`。非空树的最远叶子必在左子树或右子树中，因此：

$$
depth(root)=\max(depth(root\!\rightarrow\!left),depth(root\!\rightarrow\!right))+1
$$

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) {
            return 0;
        }
        return max(maxDepth(root->left), maxDepth(root->right)) + 1;
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 方法二：层序遍历

队列保存当前尚未访问的节点。每轮先记录队列大小，只处理这一层的全部节点；处理完一层后深度加一。

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if (!root) {
            return 0;
        }
        queue<TreeNode*> q;
        q.push(root);
        int depth = 0;
        while (!q.empty()) {
            int size = q.size();
            while (size--) {
                TreeNode* node = q.front();
                q.pop();
                if (node->left) {
                    q.push(node->left);
                }
                if (node->right) {
                    q.push(node->right);
                }
            }
            depth++;
        }
        return depth;
    }
};
```

每轮开始时队列恰好包含当前层的全部节点。处理它们时加入的子节点属于下一层，不会被本轮计数包含，所以循环次数就是树的层数。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$，其中 $w$ 是树的最大宽度

### 易错点

- 深度按节点数计算，只有根节点的树深度为 `1`。
- 空树深度为 `0`。
- 层序遍历必须在处理本层前保存队列大小，不能直接处理到队列为空。
- 递归空间取决于树高；链状树最坏为 $O(n)$。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/maximum-depth-of-binary-tree/solutions/)

## 226. 翻转二叉树

给定二叉树根节点 `root`，交换每个节点的左右子树，返回翻转后的根节点。

[题目链接](https://leetcode.cn/problems/invert-binary-tree/)

### 示例

#### 示例 1

- 输入：`root = [4,2,7,1,3,6,9]`
- 输出：`[4,7,2,9,6,3,1]`

#### 示例 2

- 输入：`root = [2,1,3]`
- 输出：`[2,3,1]`

#### 示例 3

- 输入：`root = []`
- 输出：`[]`

### 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：递归

一棵树完成翻转，当且仅当根节点的左右孩子交换，并且原来的左右子树也分别完成翻转。

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) {
            return nullptr;
        }
        swap(root->left, root->right);
        invertTree(root->left);
        invertTree(root->right);
        return root;
    }
};
```

交换发生在递归之前，因此后续递归访问的是交换后的左右指针；但两棵子树都会被访问，先交换还是先递归都能得到相同结果。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 方法二：层序遍历

队列保存尚未处理的节点。每取出一个节点就交换其左右孩子，再把非空孩子加入队列。

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) {
            return nullptr;
        }
        queue<TreeNode*> q;
        q.push(root);
        while (!q.empty()) {
            TreeNode* node = q.front();
            q.pop();
            swap(node->left, node->right);
            if (node->left) {
                q.push(node->left);
            }
            if (node->right) {
                q.push(node->right);
            }
        }
        return root;
    }
};
```

每个节点恰好出队一次并交换一次左右孩子，所以整棵树被完整镜像。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

### 易错点

- 翻转的是节点连接关系，不是交换左右孩子的值。
- 每个节点都必须交换，不能只交换根节点。
- 方法会原地修改输入树。
- 空树应返回 `nullptr`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/invert-binary-tree/solutions/)

## 101. 对称二叉树

给定二叉树根节点 `root`，判断这棵树是否关于根节点所在的竖直轴镜像对称。

[题目链接](https://leetcode.cn/problems/symmetric-tree/)

### 示例

#### 示例 1

- 输入：`root = [1,2,2,3,4,4,3]`
- 输出：`true`

#### 示例 2

- 输入：`root = [1,2,2,null,3,null,3]`
- 输出：`false`
- 解释：左子树的 `3` 是右孩子，右子树的 `3` 也是右孩子，位置并不镜像。

### 数据范围

- 二叉树节点数为 $[1,1000]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 镜像条件

两棵树 `left` 和 `right` 互为镜像需要同时满足：

1. 两个根节点的值相等；
2. `left` 的左子树与 `right` 的右子树互为镜像；
3. `left` 的右子树与 `right` 的左子树互为镜像。

节点值相同但结构不同，仍然不是镜像。

### 方法一：递归比较

```cpp
class Solution {
    bool mirror(TreeNode* left, TreeNode* right) {
        if (!left || !right) {
            return left == right;
        }
        return left->val == right->val &&
               mirror(left->left, right->right) &&
               mirror(left->right, right->left);
    }

public:
    bool isSymmetric(TreeNode* root) {
        return mirror(root->left, root->right);
    }
};
```

空位置也属于树的结构：两个位置都空时对称，只有一个为空时不对称。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 方法二：队列成对比较

队列中的元素始终是一对本应互为镜像的节点。比较后，按外侧一对、内侧一对的方式加入孩子。

```cpp
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        queue<pair<TreeNode*, TreeNode*>> q;
        q.push({root->left, root->right});
        while (!q.empty()) {
            auto [left, right] = q.front();
            q.pop();
            if (!left || !right) {
                if (left != right) {
                    return false;
                }
                continue;
            }
            if (left->val != right->val) {
                return false;
            }
            q.push({left->left, right->right});
            q.push({left->right, right->left});
        }
        return true;
    }
};
```

每次只把镜像位置配成一对。所有配对的值与空缺状态都一致时，整棵树对称。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

### 易错点

- 对称比较的是左子树的左侧与右子树的右侧，而不是同方向孩子。
- 必须比较空节点的位置，不能只比较层序遍历中的非空值。
- 本题保证根节点存在，但递归的子树节点可以为空。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/symmetric-tree/solutions/)

## 543. 二叉树的直径

二叉树的直径是任意两个节点之间最长路径的长度，长度按经过的边数计算。路径不一定经过根节点。给定根节点 `root`，返回树的直径。

[题目链接](https://leetcode.cn/problems/diameter-of-binary-tree/)

### 示例

#### 示例 1

- 输入：`root = [1,2,3,4,5]`
- 输出：`3`
- 解释：最长路径可以是 `4 → 2 → 1 → 3` 或 `5 → 2 → 1 → 3`，都经过三条边。

#### 示例 2

- 输入：`root = [1,2]`
- 输出：`1`

### 数据范围

- 二叉树节点数为 $[1,10^4]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 子树高度与直径

令 `height(root)` 返回从当前节点向下到最远叶子的路径所包含的节点数，空树高度为 `0`。

若左、右子树高度分别为 `left`、`right`，经过当前节点并连接左右子树的路径包含的边数正好为：

$$
left+right
$$

而当前节点向上能提供给父节点的高度只能选择较深的一侧：

$$
height(root)=\max(left,right)+1
$$

```cpp
class Solution {
    int diameter = 0;

    int height(TreeNode* root) {
        if (!root) {
            return 0;
        }
        int left = height(root->left);
        int right = height(root->right);
        diameter = max(diameter, left + right);
        return max(left, right) + 1;
    }

public:
    int diameterOfBinaryTree(TreeNode* root) {
        diameter = 0;
        height(root);
        return diameter;
    }
};
```

### 正确性

任意一条路径都有唯一的最高节点。以该节点为最高点的最长路径，由其左子树中最长的向下路径与右子树中最长的向下路径组成。DFS 在每个节点都计算一次 `left + right`，因此一定检查了全局最长路径的最高节点。取所有候选的最大值就是直径。

### 复杂度

- 时间复杂度：$O(n)$，每个节点访问一次
- 空间复杂度：$O(h)$，来自递归调用栈

### 易错点

- 直径按边数计算，不是节点数；左右子树高度之和已经是边数。
- 最长路径不一定经过整棵树的根节点，必须在每个节点更新答案。
- 返回给父节点的路径不能同时选择左右两侧，否则路径会分叉。
- 若同一个 `Solution` 对象可能重复调用，应在入口把成员答案重置为 `0`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/diameter-of-binary-tree/solutions/)

## 102. 二叉树的层序遍历

给定二叉树根节点 `root`，按照从上到下、每层从左到右的顺序返回节点值。答案中每一项对应一层。

[题目链接](https://leetcode.cn/problems/binary-tree-level-order-traversal/)

### 示例

#### 示例 1

- 输入：`root = [3,9,20,null,null,15,7]`
- 输出：`[[3],[9,20],[15,7]]`

#### 示例 2

- 输入：`root = [1]`
- 输出：`[[1]]`

#### 示例 3

- 输入：`root = []`
- 输出：`[]`

### 数据范围

- 二叉树节点数为 $[0,2000]$
- $-1000 \leq Node.val \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：按层控制队列长度

队列中保存尚未访问的节点。每轮开始时，队列恰好包含当前层全部节点，先记录此时的 `size`，本轮只弹出这些节点；新加入的孩子留到下一轮。

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        if (!root) {
            return {};
        }
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
                if (node->left) {
                    q.push(node->left);
                }
                if (node->right) {
                    q.push(node->right);
                }
            }
        }
        return ans;
    }
};
```

本轮处理的节点全部来自同一层，并按左孩子、右孩子的顺序加入下一层，因此每层输出顺序正确。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$，其中 $w$ 是树的最大宽度

### 方法二：队列同时保存层号

队列保存 `{节点, 深度}`。第一次访问某一深度时创建答案行，随后把节点值加入对应行。

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        queue<pair<TreeNode*, int>> q;
        q.push({root, 0});
        while (!q.empty()) {
            auto [node, depth] = q.front();
            q.pop();
            if (!node) {
                continue;
            }
            if (depth == ans.size()) {
                ans.emplace_back();
            }
            ans[depth].push_back(node->val);
            q.push({node->left, depth + 1});
            q.push({node->right, depth + 1});
        }
        return ans;
    }
};
```

广度优先遍历保证较浅层先出队，同层节点按从左到右的入队顺序出队，所以 `depth` 不会跳过尚未创建的答案行。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$；队列也会暂存空孩子，数量仍为 $O(w)$

### 易错点

- 第一种写法必须在处理本层之前保存队列长度，否则会把下一层也放入当前结果。
- 每一层需要新建一个数组，不能把全部值放在同一行。
- 空树返回空数组，而不是包含一个空数组的 `[[]]`。
- 左孩子应先于右孩子入队，才能保证每层从左到右。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-level-order-traversal/solutions/)

## 108. 将有序数组转换为二叉搜索树

给定严格递增整数数组 `nums`，构造一棵高度平衡的二叉搜索树。高度平衡是指每个节点左右子树的高度差不超过 `1`。答案不唯一，返回任意合法根节点。

[题目链接](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/)

### 示例

#### 示例 1

- 输入：`nums = [-10,-3,0,5,9]`
- 一种输出：`[0,-3,9,-10,null,5]`
- 解释：以 `0` 为根，左右两侧数组分别构成左右子树，结果是高度平衡 BST。

#### 示例 2

- 输入：`nums = [1,3]`
- 一种输出：`[1,null,3]`
- 解释：`[3,1]` 也是合法答案。

### 数据范围

- $1 \leq nums.length \leq 10^4$
- $-10^4 \leq nums[i] \leq 10^4$
- `nums` 严格递增

<details class="note-solution">
<summary>查看解析</summary>

### 取中点作为根

二叉搜索树要求左子树所有值小于根，右子树所有值大于根。有序数组的中点天然把数组分成这两部分。

每次选择中点还能让左右区间长度最多相差 `1`。对子区间递归执行相同操作，得到的每棵子树都高度平衡。

```cpp
class Solution {
    TreeNode* build(const vector<int>& nums, int left, int right) {
        if (left > right) {
            return nullptr;
        }
        int middle = left + (right - left) / 2;
        TreeNode* root = new TreeNode(nums[middle]);
        root->left = build(nums, left, middle - 1);
        root->right = build(nums, middle + 1, right);
        return root;
    }

public:
    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return build(nums, 0, nums.size() - 1);
    }
};
```

### 正确性

对任意递归区间 `[left, right]`，中点左侧元素均小于根值，中点右侧元素均大于根值；递归构造后满足 BST 性质。左右区间长度最多相差 `1`，且它们自身也递归保持平衡，所以当前节点左右子树高度差不超过 `1`。

### 复杂度

- 时间复杂度：$O(n)$，每个数组元素创建一个节点
- 空间复杂度：$O(\log n)$，平衡递归树的调用栈深度

### 易错点

- 递归区间为空的条件是 `left > right`。
- 左右子树区间不能再次包含中点。
- 题目答案不唯一；偶数长度区间选左中点或右中点都可以。
- 构造过程中不需要在每层复制子数组，传递下标即可。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/solutions/)

## 98. 验证二叉搜索树

给定二叉树根节点 `root`，判断它是否为有效二叉搜索树（BST）。对每个节点：左子树所有节点值必须严格小于当前值，右子树所有节点值必须严格大于当前值，左右子树也必须分别是 BST。

[题目链接](https://leetcode.cn/problems/validate-binary-search-tree/)

### 示例

#### 示例 1

- 输入：`root = [2,1,3]`
- 输出：`true`

#### 示例 2

- 输入：`root = [5,1,4,null,null,3,6]`
- 输出：`false`
- 解释：节点 `3` 位于根节点 `5` 的右子树中，却小于 `5`。

### 数据范围

- 二叉树节点数为 $[1,10^4]$
- $-2^{31} \leq Node.val \leq 2^{31}-1$

<details class="note-solution">
<summary>查看解析</summary>

### 为什么只比较直接孩子不够

在示例 2 中，节点 `4` 小于根节点 `5`，仅看直接孩子似乎满足要求；但 `4` 的左孩子 `3` 也属于根的右子树，必须大于 `5`。每个节点受到整条祖先路径共同给出的取值范围约束。

### 方法一：递归传递合法区间

根节点初始位于开区间 $(-\infty,+\infty)$：

- 进入左子树时，把上界收紧为当前节点值；
- 进入右子树时，把下界收紧为当前节点值。

使用 `long long` 表示边界，避免节点值恰好为 `INT_MIN` 或 `INT_MAX` 时无法再构造严格开区间。

```cpp
class Solution {
    bool valid(TreeNode* root, long long lower, long long upper) {
        if (!root) {
            return true;
        }
        if (root->val <= lower || root->val >= upper) {
            return false;
        }
        return valid(root->left, lower, root->val) &&
               valid(root->right, root->val, upper);
    }

public:
    bool isValidBST(TreeNode* root) {
        return valid(root, LLONG_MIN, LLONG_MAX);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 方法二：检查中序遍历严格递增

BST 的中序遍历结果必须严格递增。遍历过程中只需保存上一个访问值；若当前值不大于它，立即返回 `false`。

```cpp
class Solution {
    bool inorder(TreeNode* root, long long& previous) {
        if (!root) {
            return true;
        }
        if (!inorder(root->left, previous)) {
            return false;
        }
        if (root->val <= previous) {
            return false;
        }
        previous = root->val;
        return inorder(root->right, previous);
    }

public:
    bool isValidBST(TreeNode* root) {
        long long previous = LLONG_MIN;
        return inorder(root, previous);
    }
};
```

“严格递增”同时排除了重复值。题目中的 BST 不允许等于根值的节点放在任一侧。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 正确性

区间法在每个节点检查所有祖先约束，并分别为左右子树增加当前节点约束，因此所有节点满足 BST 定义。

中序法利用 BST 的左、根、右关系得到严格递增序列；反过来，若整棵树的中序序列严格递增，则任意节点左子树值均在它之前且更小，右子树值均在它之后且更大，树满足 BST 性质。

### 易错点

- 左右子树中的所有节点都受根值约束，不只是直接孩子。
- 比较必须严格，重复值会使 BST 无效。
- 初始边界不能直接使用 `INT_MIN` 和 `INT_MAX`，因为节点值允许等于它们。
- 中序遍历的 `previous` 必须在整次递归中共享，不能按值复制。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/validate-binary-search-tree/solutions/)

## 230. 二叉搜索树中第 K 小的元素

给定二叉搜索树根节点 `root` 和整数 `k`，返回树中第 `k` 小的节点值。`k` 从 `1` 开始计数。

[题目链接](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/)

### 示例

#### 示例 1

- 输入：`root = [3,1,4,null,2], k = 1`
- 输出：`1`

#### 示例 2

- 输入：`root = [5,3,6,2,4,null,null,1], k = 3`
- 输出：`3`

### 数据范围

- 二叉树节点数为 $n$
- $1 \leq k \leq n \leq 10^4$
- $0 \leq Node.val \leq 10^4$
- 所有节点值互不相同，输入是有效 BST

<details class="note-solution">
<summary>查看解析</summary>

### 中序遍历与第 K 小

BST 的中序遍历按照严格递增顺序访问节点。第 `k` 个被访问的节点就是第 `k` 小，无需遍历并保存完整序列。

### 方法一：迭代中序遍历

栈保存尚未访问的祖先。先沿左孩子不断入栈；无法继续向左时弹出栈顶，这就是当前最小的未访问节点。每弹出一个节点令 `k--`，减到 `0` 时返回。

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
            if (--k == 0) {
                return root->val;
            }
            root = root->right;
        }
    }
};
```

遍历在找到答案时立即停止。若树较平衡且 `k` 较小，不需要访问全部节点。

- 时间复杂度：$O(h+k)$
- 空间复杂度：$O(h)$

### 方法二：递归中序遍历

递归访问左子树后处理当前节点。用引用参数 `answer` 保存结果，返回值表示是否已经找到，找到后立即终止其余递归。

```cpp
class Solution {
    bool inorder(TreeNode* root, int& k, int& answer) {
        if (!root) {
            return false;
        }
        if (inorder(root->left, k, answer)) {
            return true;
        }
        if (--k == 0) {
            answer = root->val;
            return true;
        }
        return inorder(root->right, k, answer);
    }

public:
    int kthSmallest(TreeNode* root, int k) {
        int answer = 0;
        inorder(root, k, answer);
        return answer;
    }
};
```

- 时间复杂度：$O(h+k)$
- 空间复杂度：$O(h)$

### 正确性

两种方法都严格按中序访问节点。有效 BST 的中序序列严格递增，因此计数减到零时已经访问了恰好 `k - 1` 个更小节点，当前值就是第 `k` 小。

### 易错点

- `k` 从 `1` 开始，访问节点时先减一再判断是否为零。
- 迭代中序是“不断向左 → 弹栈访问 → 转向右子树”。
- 不能使用层序遍历顺序判断大小。
- 若树经常插入和删除并频繁查询，可在节点中维护子树大小；本题只查询一次，无需改变节点结构。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/solutions/)

## 199. 二叉树的右视图

给定二叉树根节点 `root`，想象从树的右侧观察，按照从上到下的顺序返回每一层能够看到的节点值。

[题目链接](https://leetcode.cn/problems/binary-tree-right-side-view/)

### 示例

#### 示例 1

- 输入：`root = [1,2,3,null,5,null,4]`
- 输出：`[1,3,4]`

#### 示例 2

- 输入：`root = [1,2,3,4,null,null,null,5]`
- 输出：`[1,3,4,5]`
- 解释：第 3 层虽然节点 `4` 位于左子树，但该层右侧没有其他节点，因此仍能看到 `4`。

#### 示例 3

- 输入：`root = [1,null,3]`
- 输出：`[1,3]`

#### 示例 4

- 输入：`root = []`
- 输出：`[]`

### 数据范围

- 二叉树节点数为 $[0,100]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：层序遍历并覆盖本层答案

队列保存 `{节点, 层号}`，按左孩子、右孩子的顺序加入队列。同层节点从左到右出队，每次都覆盖该层答案，最后留下的就是最右节点。

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
            if (!node) {
                continue;
            }
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

该写法与项目现有树遍历模板一致。右视图不是简单地沿 `right` 指针向下走；某层没有右子树节点时，左子树中的节点也可能成为该层最右节点。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(w)$

### 方法二：优先访问右子树的 DFS

按照“根 → 右 → 左”的顺序深度优先遍历。第一次到达某个深度时，当前节点就是该层最右侧节点，将它加入答案；同层后续节点不再覆盖。

```cpp
class Solution {
    void dfs(TreeNode* root, int depth, vector<int>& ans) {
        if (!root) {
            return;
        }
        if (depth == ans.size()) {
            ans.push_back(root->val);
        }
        dfs(root->right, depth + 1, ans);
        dfs(root->left, depth + 1, ans);
    }

public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> ans;
        dfs(root, 0, ans);
        return ans;
    }
};
```

右子树并不一定包含该层节点，但优先访问右侧保证在所有存在的同层节点中，最靠右者最先被访问。若右侧缺失，遍历自然会进入左子树补上该层答案。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 易错点

- 右视图取每层最右节点，不是只取所有右孩子。
- BFS 覆盖法必须按左后右的顺序入队；若先右后左，最终会留下最左节点。
- DFS 必须先访问右子树，并且只在第一次到达该深度时记录。
- 空树返回空数组。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-right-side-view/solutions/)

## 114. 二叉树展开为链表

给定二叉树根节点 `root`，原地把它展开成单链表。展开后每个节点的 `left` 都为 `nullptr`，`right` 指向下一个节点，节点顺序与原树的前序遍历一致。

[题目链接](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/)

### 示例

#### 示例 1

- 输入：`root = [1,2,5,3,4,null,6]`
- 输出：`[1,null,2,null,3,null,4,null,5,null,6]`

原树的前序序列是 `[1,2,3,4,5,6]`，展开后这些节点依次由 `right` 连接。

#### 示例 2

- 输入：`root = []`
- 输出：`[]`

#### 示例 3

- 输入：`root = [0]`
- 输出：`[0]`

### 数据范围

- 二叉树节点数为 $[0,2000]$
- $-100 \leq Node.val \leq 100$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：保存前序遍历结果

先把节点指针按前序遍历放入数组，再依次改写相邻节点的左右指针。数组保存的是原节点地址，没有创建新节点。

```cpp
class Solution {
    void preorder(TreeNode* root, vector<TreeNode*>& nodes) {
        if (!root) {
            return;
        }
        nodes.push_back(root);
        preorder(root->left, nodes);
        preorder(root->right, nodes);
    }

public:
    void flatten(TreeNode* root) {
        vector<TreeNode*> nodes;
        preorder(root, nodes);
        for (int i = 1; i < nodes.size(); i++) {
            nodes[i - 1]->left = nullptr;
            nodes[i - 1]->right = nodes[i];
        }
        if (!nodes.empty()) {
            nodes.back()->left = nullptr;
            nodes.back()->right = nullptr;
        }
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

### 方法二：逆前序递归

正常前序顺序为“根、左、右”。若按照“右、左、根”的逆序处理，就可以维护已经展开部分的头节点 `next`，把当前节点直接接到它前面：

1. 先展开右子树；
2. 再展开左子树；
3. 令当前节点的 `right = next`、`left = nullptr`；
4. 当前节点成为新的 `next`。

```cpp
class Solution {
    TreeNode* next = nullptr;

    void build(TreeNode* root) {
        if (!root) {
            return;
        }
        build(root->right);
        build(root->left);
        root->right = next;
        root->left = nullptr;
        next = root;
    }

public:
    void flatten(TreeNode* root) {
        next = nullptr;
        build(root);
    }
};
```

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$，来自递归调用栈

### 方法三：寻找左子树的前序末尾

若当前节点有左子树，前序遍历会先完整访问左子树，再访问原右子树。左子树中前序最后访问的节点，就是沿右指针能到达的最右节点 `predecessor`。

把原右子树接到 `predecessor->right`，再把整棵左子树移到当前节点的右侧，最后继续处理新的 `root->right`。

```cpp
class Solution {
public:
    void flatten(TreeNode* root) {
        while (root) {
            if (root->left) {
                TreeNode* predecessor = root->left;
                while (predecessor->right) {
                    predecessor = predecessor->right;
                }
                predecessor->right = root->right;
                root->right = root->left;
                root->left = nullptr;
            }
            root = root->right;
        }
    }
};
```

每次移动后，当前节点及其右侧开头已经符合前序顺序。继续沿右指针处理，最终所有左指针为空且右链顺序等于原树前序遍历。

- 时间复杂度：$O(n)$。寻找前驱经过的右链不会被其他节点重复作为左子树右链扫描
- 空间复杂度：$O(1)$

### 易错点

- 展开顺序是前序遍历，不是中序遍历。
- 改写 `root->right` 前必须保留或重新连接原右子树。
- 逆前序递归必须先右后左，否则会覆盖尚未处理的右子树。
- 展开后所有 `left` 都必须为 `nullptr`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/solutions/)

## 105. 从前序与中序遍历序列构造二叉树

给定同一棵二叉树的前序遍历 `preorder` 和中序遍历 `inorder`，构造并返回这棵树。树中没有重复值。

[题目链接](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/)

### 示例

#### 示例 1

- 输入：`preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]`
- 输出：`[3,9,20,null,null,15,7]`

#### 示例 2

- 输入：`preorder = [-1], inorder = [-1]`
- 输出：`[-1]`

### 数据范围

- $1 \leq preorder.length=inorder.length \leq 3000$
- $-3000 \leq preorder[i],inorder[i] \leq 3000$
- 两个数组包含相同且互不重复的值
- `inorder` 与 `preorder` 一定来自同一棵二叉树

<details class="note-solution">
<summary>查看解析</summary>

### 两种遍历提供的信息

- 前序遍历顺序是“根、左、右”，所以当前尚未使用的第一个前序元素就是子树根；
- 中序遍历顺序是“左、根、右”，根在中序数组中的位置把左右子树区间分开。

例如：

```text
preorder = [3, 9, 20, 15, 7]
inorder  = [9, 3, 15, 20, 7]
                 ↑
              根节点 3
```

中序中 `3` 左侧的 `[9]` 属于左子树，右侧的 `[15,20,7]` 属于右子树。

### 递归构造

哈希表 `position` 保存每个值在中序数组中的下标，避免每次递归线性寻找根。`preorderIndex` 始终指向下一棵待构造子树的根。

必须先构造左子树再构造右子树，因为前序数组中根之后紧跟的是左子树节点。

```cpp
class Solution {
    unordered_map<int, int> position;
    int preorderIndex = 0;

    TreeNode* build(const vector<int>& preorder, int left, int right) {
        if (left > right) {
            return nullptr;
        }
        int value = preorder[preorderIndex++];
        TreeNode* root = new TreeNode(value);
        int middle = position[value];
        root->left = build(preorder, left, middle - 1);
        root->right = build(preorder, middle + 1, right);
        return root;
    }

public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        position.clear();
        preorderIndex = 0;
        for (int i = 0; i < inorder.size(); i++) {
            position[inorder[i]] = i;
        }
        return build(preorder, 0, inorder.size() - 1);
    }
};
```

### 正确性

每次递归取当前前序首元素作为根，它在中序区间中唯一地分出左右子树节点集合。前序接下来的元素依次属于左子树和右子树，因此按左后右递归能构造出正确连接。区间为空时返回空节点，所有元素最终恰好使用一次。

### 复杂度

- 时间复杂度：$O(n)$，建立下标表和创建节点各遍历一次
- 空间复杂度：$O(n)$，哈希表与最坏情况下的递归栈

### 易错点

- 先序只能确定根，中序负责划分左右子树，两者缺一不可。
- 题目保证节点值唯一，因此可以用值作为中序下标表的键。
- 必须先递归构造左子树，再构造右子树。
- 若成员变量可能被重复调用，需要在入口清空下标表并重置前序游标。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/solutions/)

## 437. 路径总和 III

给定二叉树根节点 `root` 和整数 `targetSum`，统计节点值之和等于 `targetSum` 的路径数量。路径必须沿父节点到子节点连续向下，但可以从任意节点开始，也可以在任意节点结束。

[题目链接](https://leetcode.cn/problems/path-sum-iii/)

### 示例

#### 示例 1

- 输入：`root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8`
- 输出：`3`
- 解释：满足条件的路径是 `5 → 3`、`5 → 2 → 1` 和 `-3 → 11`。

#### 示例 2

- 输入：`root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22`
- 输出：`3`

### 数据范围

- 二叉树节点数为 $[0,1000]$
- $-10^9 \leq Node.val \leq 10^9$
- $-1000 \leq targetSum \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：枚举路径起点

`countFrom(root, sum)` 统计必须从当前节点开始、和为 `sum` 的向下路径。再对每个节点调用一次该函数，使所有可能起点都被枚举。

```cpp
class Solution {
    int countFrom(TreeNode* root, long long sum) {
        if (!root) {
            return 0;
        }
        int answer = root->val == sum;
        answer += countFrom(root->left, sum - root->val);
        answer += countFrom(root->right, sum - root->val);
        return answer;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        if (!root) {
            return 0;
        }
        return countFrom(root, targetSum) +
               pathSum(root->left, targetSum) +
               pathSum(root->right, targetSum);
    }
};
```

- 时间复杂度：最坏 $O(n^2)$，链状树中每个起点都会继续扫描后续节点
- 空间复杂度：$O(h)$

### 方法二：树上前缀和

在当前根到节点的路径上，设当前前缀和为 `sum`。若祖先位置的前缀和为 `sum - targetSum`，则该祖先之后到当前节点的路径和为目标值。

哈希表 `count[x]` 只记录当前递归路径上前缀和 `x` 的出现次数：

1. 进入节点时计算新前缀和，累加 `count[sum - targetSum]`；
2. 把当前前缀和加入哈希表；
3. 递归左右子树；
4. 离开节点时撤销当前前缀和，避免影响兄弟子树。

```cpp
class Solution {
    unordered_map<long long, int> count;
    long long target;

    int dfs(TreeNode* root, long long sum) {
        if (!root) {
            return 0;
        }
        sum += root->val;
        int answer = count[sum - target];
        count[sum]++;
        answer += dfs(root->left, sum);
        answer += dfs(root->right, sum);
        count[sum]--;
        return answer;
    }

public:
    int pathSum(TreeNode* root, int targetSum) {
        count.clear();
        count[0] = 1;
        target = targetSum;
        return dfs(root, 0);
    }
};
```

`count[0] = 1` 表示根节点之前存在一个前缀和为零的位置，使从根开始且和为目标值的路径也能被统计。

- 时间复杂度：平均 $O(n)$
- 空间复杂度：$O(h)$；哈希表只保留当前根到节点路径上的计数

### 正确性

任意合法路径都可以唯一表示为“当前节点前缀和减去某个祖先之前的前缀和”。DFS 到达路径终点时，哈希表包含该祖先前缀且只包含当前祖先链，所以该路径恰好被统计一次。回溯撤销保证不同分支之间不会组合出并不存在的路径。

### 易错点

- 路径必须连续向下，但不要求从根开始或到叶子结束。
- 节点值可能为负数，不能用路径和超过目标就停止的剪枝。
- 前缀和可能超过 32 位整数，应使用 `long long`。
- 离开节点时必须执行 `count[sum]--`。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/path-sum-iii/solutions/)

## 236. 二叉树的最近公共祖先

给定二叉树根节点 `root` 和树中的两个不同节点 `p`、`q`，返回它们的最近公共祖先。一个节点也可以是它自己的祖先。

[题目链接](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/)

### 示例

以下示例使用二叉树 `root = [3,5,1,6,2,0,8,null,null,7,4]`。

#### 示例 1

- 输入：`p = 5, q = 1`
- 输出：`3`
- 解释：节点 `5` 和 `1` 分别位于根节点 `3` 的左右子树。

#### 示例 2

- 输入：`p = 5, q = 4`
- 输出：`5`
- 解释：节点可以是自己的祖先，`5` 是 `4` 的祖先。

#### 示例 3

- 输入：`root = [1,2], p = 1, q = 2`
- 输出：`1`

### 数据范围

- 二叉树节点数为 $[2,10^5]$
- $-10^9 \leq Node.val \leq 10^9$
- 所有节点值互不相同
- `p`、`q` 是树中不同节点

<details class="note-solution">
<summary>查看解析</summary>

### 方法一：自底向上 DFS

递归函数返回当前子树中找到的目标节点或最近公共祖先：

- 当前节点为空时返回 `nullptr`；
- 当前节点就是 `p` 或 `q` 时返回当前节点；
- 左右子树都返回非空时，两个目标分处两侧，当前节点就是最近公共祖先；
- 只有一侧非空时，把该侧结果向上传递。

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if (!root || root == p || root == q) {
            return root;
        }
        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);
        if (left && right) {
            return root;
        }
        return left ? left : right;
    }
};
```

若当前节点本身是目标节点，直接返回它仍然正确：另一个目标若在其子树中，当前节点就是最近公共祖先；题目保证两个目标都存在。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(h)$

### 方法二：记录父节点

先遍历树并记录每个节点的父节点，直到 `p` 和 `q` 都已找到。随后把 `p` 到根的祖先加入集合，再从 `q` 向根移动，第一个出现在集合中的节点就是最近公共祖先。

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        unordered_map<TreeNode*, TreeNode*> parent{{root, nullptr}};
        stack<TreeNode*> st;
        st.push(root);
        while (!parent.count(p) || !parent.count(q)) {
            TreeNode* node = st.top();
            st.pop();
            if (node->left) {
                parent[node->left] = node;
                st.push(node->left);
            }
            if (node->right) {
                parent[node->right] = node;
                st.push(node->right);
            }
        }

        unordered_set<TreeNode*> ancestors;
        for (; p; p = parent[p]) {
            ancestors.insert(p);
        }
        for (; !ancestors.count(q); q = parent[q]) {}
        return q;
    }
};
```

从 `q` 向上遇到的第一个 `p` 的祖先，是距离 `q` 最近且同时包含两者的祖先，因此就是 LCA。

- 时间复杂度：$O(n)$
- 空间复杂度：$O(n)$

本题只有一次查询，直接 DFS 最简洁。若同一棵树上有大量 LCA 查询，再考虑倍增或 Tarjan 离线算法。

### 易错点

- 最近公共祖先允许等于 `p` 或 `q`。
- 比较的是节点指针，不应只比较节点值。
- DFS 中左右都找到目标时才能确定当前节点；只有一侧找到时需要继续向上传递。
- 父节点方法必须把根节点的父节点设为 `nullptr`，祖先回溯才能终止。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [OI Wiki：最近公共祖先](https://oi-wiki.org/graph/lca/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/solutions/)

## 124. 二叉树中的最大路径和

二叉树中的路径由若干节点组成，相邻节点之间有边，且同一节点不能重复出现。路径至少包含一个节点，不要求经过根节点。给定根节点 `root`，返回所有路径中的最大节点值之和。

[题目链接](https://leetcode.cn/problems/binary-tree-maximum-path-sum/)

### 示例

#### 示例 1

- 输入：`root = [1,2,3]`
- 输出：`6`
- 解释：最大路径为 `2 → 1 → 3`。

#### 示例 2

- 输入：`root = [-10,9,20,null,null,15,7]`
- 输出：`42`
- 解释：最大路径为 `15 → 20 → 7`。

### 数据范围

- 二叉树节点数为 $[1,3\times10^4]$
- $-1000 \leq Node.val \leq 1000$

<details class="note-solution">
<summary>查看解析</summary>

### 完整路径与向上贡献

对一个节点，需要区分两个量：

1. **以当前节点为最高点的完整路径**：可以同时连接左右子树，用于更新最终答案；
2. **返回给父节点的向下路径贡献**：只能选择左、右一侧，否则接到父节点后路径会在当前节点分叉。

若某侧贡献为负数，加入它只会减小路径和，应当舍弃并按 `0` 处理。

设左右子树返回的非负贡献为 `left`、`right`：

$$
candidate=root\!\rightarrow\!val+left+right
$$

$$
gain(root)=root\!\rightarrow\!val+\max(left,right)
$$

```cpp
class Solution {
    int answer = INT_MIN;

    int gain(TreeNode* root) {
        if (!root) {
            return 0;
        }
        int left = max(gain(root->left), 0);
        int right = max(gain(root->right), 0);
        answer = max(answer, root->val + left + right);
        return root->val + max(left, right);
    }

public:
    int maxPathSum(TreeNode* root) {
        answer = INT_MIN;
        gain(root);
        return answer;
    }
};
```

### 过程示例

对于 `[-10,9,20,null,null,15,7]`：

1. 叶子 `15` 和 `7` 分别向上返回 `15`、`7`；
2. 节点 `20` 处的完整路径为 $15+20+7=42$，更新答案；
3. 节点 `20` 向父节点只能返回一侧，贡献为 $20+\max(15,7)=35$；
4. 根节点 `-10` 连接 `9` 与 `35` 得到 `34`，小于已有答案 `42`。

### 正确性

任意合法路径都有唯一的最高节点。在这个最高节点处，路径至多由“左侧向下路径 + 当前节点 + 右侧向下路径”组成。`gain` 分别给出两侧能提供的最大非负贡献，所以算法在该节点计算了以它为最高点的最优路径。遍历所有节点并取最大值，必然包含全局最优路径。

返回父节点时只选一侧，保证向上的结果始终是一条不分叉路径。

### 复杂度

- 时间复杂度：$O(n)$，每个节点访问一次
- 空间复杂度：$O(h)$，来自递归调用栈

### 易错点

- 路径至少包含一个节点，答案必须初始化为 `INT_MIN`，不能初始化为 `0`。
- 负贡献应舍弃，但当前节点本身不能被舍弃。
- 更新全局答案时可以同时使用左右子树；返回父节点时只能选择一侧。
- 最大路径不一定经过整棵树的根节点。

</details>

### 参考

- [灵茶山艾府：链表、二叉树与回溯题单](https://leetcode.cn/discuss/post/K0n2gO/)
- [LeetCode 官方题目与题解](https://leetcode.cn/problems/binary-tree-maximum-path-sum/solutions/)
