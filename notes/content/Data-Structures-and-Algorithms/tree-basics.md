---
title: 树与二叉树
date: 2026-08-27
lang: zh-cn
page: content
parent: Data-Structures-and-Algorithms/
---

树是 $n$ 个节点组成的有限集合。$n=0$ 时称为空树；非空树有且只有一个根节点，其余节点可以分成若干个互不相交的子树。

## 基本概念

- **度**：节点的子树数；树的度是所有节点度的最大值。
- **分支节点**：度大于 $0$ 的节点；**叶节点**：度为 $0$ 的节点。
- **层次**：根节点为第 $1$ 层，子节点层次比父节点大 $1$。
- **高度**：树中节点的最大层数。
- **路径**：两个节点之间经过的节点序列；路径长度是其中边的数量。
- **森林**：若干棵互不相交的树的集合。

含 $n$ 个节点的非空树恰有 $n-1$ 条边，所有节点的度数之和也为 $n-1$。

## 二叉树

二叉树的每个节点至多有两棵有序子树，分别称为左子树和右子树。二叉树不等于度为 $2$ 的树：二叉树允许空树，并且左右子树有顺序。

### 性质

- 第 $i$ 层至多有 $2^{i-1}$ 个节点。
- 高度为 $h$ 的二叉树至多有 $2^h-1$ 个节点。
- 设度为 $0$、$1$、$2$ 的节点数分别为 $n_0$、$n_1$、$n_2$，则 $n_0=n_2+1$。

### 特殊二叉树

- **满二叉树**：高度为 $h$ 且含 $2^h-1$ 个节点，每层节点数都达到最大值。
- **完全二叉树**：除最后一层外均为满层，最后一层节点从左到右连续排列。
- **二叉排序树**：左子树所有关键字小于根，右子树所有关键字大于根。
- **平衡二叉树**：任意节点的左右子树高度差绝对值不超过 $1$。

含 $n$ 个节点的完全二叉树高度为 $\lfloor\log_2 n\rfloor+1$。按层序从 $1$ 开始编号，节点 $i$ 的父节点为 $\lfloor i/2\rfloor$，左孩子为 $2i$，右孩子为 $2i+1$。

## 存储结构

### 顺序存储

按层序将节点保存到数组，能直接计算父子节点下标，适合完全二叉树。一般二叉树可能产生大量空位置。

### 链式存储

二叉链表节点保存数据、左孩子指针和右孩子指针。含 $n$ 个节点的二叉链表共有 $2n$ 个指针域，其中 $n-1$ 个指向孩子，共有 $n+1$ 个空指针域。

## 二叉树的遍历

| 方式 | 访问顺序 |
| --- | --- |
| 先序 | 根、左子树、右子树 |
| 中序 | 左子树、根、右子树 |
| 后序 | 左子树、右子树、根 |
| 层序 | 从上到下、从左到右 |

先序、中序和后序都可以递归实现，也可以使用栈消除递归；层序遍历使用队列。中序序列与先序或后序序列结合可以唯一确定一棵二叉树；只有先序和后序通常不能唯一确定。

## 线索二叉树

线索二叉树利用二叉链表中的空指针保存某种遍历序列中的前驱和后继。

- `ltag=0`：左指针指向左孩子；`ltag=1`：左指针指向前驱。
- `rtag=0`：右指针指向右孩子；`rtag=1`：右指针指向后继。

线索化后可以在不使用栈和递归的情况下遍历二叉树。中序线索树最常见，因为它既能查找前驱，也能查找后继。

## 树、森林与二叉树

一般树可以使用双亲表示法、孩子表示法或孩子兄弟表示法存储。孩子兄弟表示法中，左指针指向第一个孩子，右指针指向下一个兄弟，因此可以将任意树或森林转换为二叉树。

- 树的先根遍历对应转换后二叉树的先序遍历。
- 树的后根遍历对应转换后二叉树的中序遍历。
- 森林的先序和中序遍历分别对应转换后二叉树的先序和中序遍历。

## 哈夫曼树

节点的带权路径长度是节点权值与从根到该节点边数的乘积。树的带权路径长度（WPL）是所有叶节点带权路径长度之和。

哈夫曼树是给定叶节点权值后 WPL 最小的二叉树。构造时反复选取权值最小的两棵树作为新节点的左右子树，将两个权值之和作为新树的根权值，直到只剩一棵树。

将左分支和右分支分别编为 `0` 和 `1`，从根到叶节点的路径形成哈夫曼编码。只有叶节点表示字符，因此任一编码都不是另一编码的前缀。

## 其他树形结构

## Heap 堆

堆是一棵满足堆序性质的完全二叉树，通常用数组实现。

常见堆：
- 大根堆：每个节点都大于等于它的子节点，堆顶是最大值。
- 小根堆：每个节点都小于等于它的子节点，堆顶是最小值。

堆常用于实现优先队列（Priority Queue）。优先队列关注“每次取出优先级最高的元素”，堆是实现它的一种常见数据结构。

### 数组下标关系

下面使用 0-indexed 数组：

| 节点 | 下标 |
| --- | --- |
| 父节点 | `(i - 1) / 2` |
| 左子节点 | `2 * i + 1` |
| 右子节点 | `2 * i + 2` |

完全二叉树保证数组中没有空洞，因此可以直接用下标表示父子关系。

### 基本操作复杂度

| 操作 | 复杂度 |
| --- | --- |
| 查看堆顶 | $O(1)$ |
| 插入元素 | $O(\log n)$ |
| 删除堆顶 | $O(\log n)$ |
| 建堆 | $O(n)$ |

### 小根堆手写实现

下面用 `vector<int>` 实现一个小根堆。小根堆的堆顶是当前最小值。

#### 插入元素

插入元素时，先把新元素放到数组末尾。此时只有这个新元素可能破坏堆的性质，所以让它不断和父节点比较：如果它比父节点小，就和父节点交换，直到到达根节点，或者父节点已经不大于它。

```cpp
void push(vector<int>& heap, int x) {
    heap.push_back(x);
    int i = heap.size() - 1;

    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] <= heap[i]) {
            break;
        }
        swap(heap[parent], heap[i]);
        i = parent;
    }
}
```

#### 删除堆顶

删除堆顶时，先用最后一个元素覆盖堆顶，再删除最后一个元素。此时只有根节点可能破坏堆的性质，所以从根节点开始向下调整：每次找到左右子节点中更小的那个，如果它比当前节点小，就交换。

```cpp
void pop(vector<int>& heap) {
    if (heap.empty()) {
        return;
    }

    heap[0] = heap.back();
    heap.pop_back();

    int i = 0;
    int n = heap.size();
    while (true) {
        int left = i * 2 + 1;
        int right = i * 2 + 2;
        int smallest = i;

        if (left < n && heap[left] < heap[smallest]) {
            smallest = left;
        }
        if (right < n && heap[right] < heap[smallest]) {
            smallest = right;
        }
        if (smallest == i) {
            break;
        }
        swap(heap[i], heap[smallest]);
        i = smallest;
    }
}
```

#### 查看堆顶

```cpp
int top(const vector<int>& heap) {
    return heap[0];
}
```

#### 完整实现

```cpp
class MinHeap {
private:
    vector<int> heap;

public:
    void push(int x) {
        heap.push_back(x);
        int i = heap.size() - 1;

        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap[parent] <= heap[i]) {
                break;
            }
            swap(heap[parent], heap[i]);
            i = parent;
        }
    }

    void pop() {
        if (heap.empty()) {
            return;
        }

        heap[0] = heap.back();
        heap.pop_back();

        int i = 0;
        int n = heap.size();
        while (true) {
            int left = i * 2 + 1;
            int right = i * 2 + 2;
            int smallest = i;

            if (left < n && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < n && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == i) {
                break;
            }
            swap(heap[i], heap[smallest]);
            i = smallest;
        }
    }

    int top() const {
        return heap[0];
    }

    bool empty() const {
        return heap.empty();
    }

    int size() const {
        return heap.size();
    }
};
```

### 建堆

如果从空堆开始逐个插入，复杂度是 $O(n \log n)$。更好的方法是从最后一个非叶子节点开始向前下沉，整体复杂度是 $O(n)$。

```cpp
void heapify(vector<int>& heap) {
    auto down = [&](int i) {
        int n = heap.size();
        while (true) {
            int left = i * 2 + 1;
            int right = i * 2 + 2;
            int smallest = i;

            if (left < n && heap[left] < heap[smallest]) {
                smallest = left;
            }
            if (right < n && heap[right] < heap[smallest]) {
                smallest = right;
            }
            if (smallest == i) {
                break;
            }
            swap(heap[i], heap[smallest]);
            i = smallest;
        }
    };

    for (int i = heap.size() / 2 - 1; i >= 0; i--) {
        down(i);
    }
}
```

最后一个非叶子节点是 `n / 2 - 1`。

### 优先队列和堆的关系

堆是一种具体的数据结构，优先队列是一种抽象数据类型。优先队列要求能够快速取出优先级最高的元素，而堆正好可以在 $O(1)$ 时间查看堆顶，并在 $O(\log n)$ 时间插入或删除堆顶。

C++ 的 `priority_queue` 默认是大根堆；Python 的 `heapq` 和 Java 的 `PriorityQueue` 默认是小根堆。具体库函数见语言库速查。

### 常见坑

- C++ `priority_queue` 默认是大根堆。
- Python `heapq` 默认是小根堆。
- Java `PriorityQueue` 默认是小根堆。
- 删除堆顶时，先用最后一个元素覆盖堆顶，再删除最后一个元素，最后下沉。
- `pop` 通常不返回值的语言或库里，要先取 `top` / `peek`。
- 堆只能快速拿到最值，不能快速查找任意元素。

### 常见题型

- Top K 问题
- 合并 K 个有序链表
- 数据流中的中位数
- 任务调度
- Dijkstra 最短路
- 带优先级的 BFS

### 语言库速查

- [C++ STL](./reference/cpp-stl.md)
- [Python Library](./reference/python-library.md)
- [Java Library](./reference/java-library.md)

## DSU 并查集

并查集是一种用于管理元素所属集合的数据结构，实现为一个森林，其中每棵树表示一个集合，树中的节点表示对应集合中的元素。主要操作有：
- `find`: 查找元素所属的集合（树的根节点），用于判断两个元素是否属于同一集合
- `union`: 合并两个集合，将一个集合的根节点连接到另一个集合的根节点

### 基本实现
虽然是用树来表示集合，但并不需要显式地存储树的结构，只需要使用一个数组 `parent` 来记录每个节点的父节点即可。初始时，每个节点的父节点指向自己，表示每个节点都是一个独立的集合。

```cpp
class DSU {
public:
    int parent[N];
    int rank[N]; // 可选，用于按秩合并优化

    DSU() {
        for (int i = 0; i < N; ++i) {
            parent[i] = i; // 每个节点的父节点指向自己
        }
    }

    int find(int x); // 查找操作
    void union(int x, int y); // 合并操作
};
```

### 查找
查找操作通过递归或迭代的方式找到节点的根节点。为了优化查找效率，通常会使用路径压缩（Path Compression）技术，将查找过程中访问的节点直接连接到根节点，从而减少树的高度。

```cpp
// 不用路径压缩的查找
int DSU::find(int x) {
    if (parent[x] != x) {
        return find(parent[x]);
    }
    return x;
}

// 使用路径压缩的查找
int DSU::find(int x) {
    if (parent[x] != x) {
        parent[x] = find(parent[x]); // 路径压缩
    }
    return parent[x];
}
```
路径压缩通过递归地将每个节点的父节点更新为根节点，从而大大减少了树的高度，提高了后续查找操作的效率。

### 合并
合并操作将两个集合连接在一起。通常会使用按秩合并（Union by Rank）技术，根据树的高度（秩）来决定将哪棵树连接到另一棵树上，从而保持树的平衡，避免树过高。

```cpp

// 不按秩合并
void DSU::union(int x, int y) {
    int rootX = find(x);
    int rootY = find(y);
    if (rootX != rootY) {
        parent[rootY] = rootX; // 将 rootY 连接到 rootX，可能导致树不平衡
    }
}

// 按秩合并
void DSU::union(int x, int y) {
    int rootX = find(x);
    int rootY = find(y);
    if (rootX != rootY) {
        // 按秩合并
        if (rank[rootX] < rank[rootY]) {
            parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
            parent[rootY] = rootX;
        } else {
            parent[rootY] = rootX;
            rank[rootX]++;
        }
    }
}
```

### 性能分析
使用路径压缩和按秩合并后，查找和合并操作的时间复杂度接近于常数，具体为反阿克曼函数的渐进复杂度，几乎可以视为 O(1)。这使得并查集在处理大量动态连通性问题时非常高效。
