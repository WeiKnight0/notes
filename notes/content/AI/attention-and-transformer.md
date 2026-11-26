---
title: Attention 与 Transformer
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## Attention：Q/K/V、掩码与多头注意力

### 从查询到加权读取

Attention 根据一个查询（Query）从若干键值对（Key–Value）中读取信息。Query 与 Key 决定“关注哪里”，Value 决定“取回什么”。对一个批次：

- $Q\in\mathbb R^{N\times T_q\times d_k}$：$T_q$ 个查询；
- $K\in\mathbb R^{N\times T_k\times d_k}$：$T_k$ 个键；
- $V\in\mathbb R^{N\times T_k\times d_v}$：与每个键对应的值。

Query 和 Key 的最后一维必须相同，才能计算相似度；Key 与 Value 的序列长度必须相同，才能用对 Key 的权重加权 Value。输出形状为 $(N,T_q,d_v)$。

### 缩放点积注意力

缩放点积注意力（Scaled Dot-Product Attention）为：

$$
S=\frac{QK^\mathsf T}{\sqrt{d_k}},\qquad
A=\operatorname{softmax}(S),\qquad
O=AV.
$$

$S_{ij}$ 是第 $i$ 个 Query 与第 $j$ 个 Key 的分数。Softmax 沿 Key 维计算，因此 $\sum_j A_{ij}=1$；输出 $O_i$ 是所有 Value 的加权和。

若 $Q$、$K$ 各分量独立、均值为 0、方差为 1，则点积方差约为 $d_k$。除以 $\sqrt{d_k}$ 可把分数尺度稳定在约为 1 的量级，减少 Softmax 过早饱和。

#### 手算示例

两个 Query 分别只匹配两个 Key：

```python
import math
import torch

Q = torch.tensor([[[1., 0.], [0., 1.]]])
K = torch.tensor([[[1., 0.], [0., 1.]]])
V = torch.tensor([[[10., 0.], [0., 20.]]])
scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
weights = scores.softmax(dim=-1)
output = weights @ V
print(scores)
print(weights)
print(output)
```

第一个 Query 对第一个 Key 的权重较大，因此输出更靠近 `[10,0]`；第二个 Query 同理更靠近 `[0,20]`。权重通常不是 0 或 1，而是连续分配。

### Attention Mask

Mask 在 Softmax 前把禁止位置的分数设为 $-\infty$：

$$
A_{ij}=\frac{\exp(S_{ij})}{\sum_{k\in\mathcal V_i}\exp(S_{ik})},\qquad j\in\mathcal V_i,
$$

其中 $\mathcal V_i$ 是第 $i$ 个 Query 可以读取的 Key 集合。被屏蔽位置的权重为 0。

#### Padding Mask

Padding Mask 禁止读取补齐 Token。假设 Key 有效性为 `[True, True, False]`，需要扩展为可广播到分数矩阵的 `(N,1,T_k)`：

```python
import math
import torch

Q = torch.tensor([[[1., 0.], [0., 1.]]])
K = torch.tensor([[[1., 0.], [0., 1.], [9., 9.]]])
V = torch.tensor([[[10., 0.], [0., 20.], [999., 999.]]])
valid_keys = torch.tensor([[True, True, False]])
scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))
scores = scores.masked_fill(~valid_keys[:, None, :], float('-inf'))
weights = scores.softmax(dim=-1)
output = weights @ V
print(weights)
print(output)
```

最后一个 Value 数值很大，但其权重仍为 0。Padding Mask 屏蔽的是 Key；若补齐的 Query 也不应参与损失，还要在输出或损失处另行屏蔽。

#### Causal Mask

自回归 Decoder 的第 $i$ 个位置只能读取不晚于自己的位置，因而保留下三角区域：

$$
M_{ij}=\begin{cases}
0,&j\le i,\\
-\infty,&j>i.
\end{cases}
$$

```python
import torch

length = 4
causal = torch.tril(torch.ones(length, length, dtype=torch.bool))
scores = torch.zeros(length, length).masked_fill(~causal, float('-inf'))
weights = scores.softmax(dim=-1)
print(causal)
print(weights)
```

第 0 行只能读取位置 0；第 3 行可以读取位置 0 至 3。训练时即使整段目标同时输入，未来 Token 也不会泄漏。

不同 PyTorch 接口对布尔 Mask 的含义并不统一。例如 `scaled_dot_product_attention` 的布尔 `attn_mask=True` 表示允许参与，而 `MultiheadAttention` 的二值 `attn_mask=True` 表示禁止参与。调用前必须核对所用接口，不能仅凭变量名判断。

### Self-Attention 与 Cross-Attention

Self-Attention 的 $Q$、$K$、$V$ 来自同一序列。它让每个位置读取同一序列的其他位置：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V.
$$

Cross-Attention 的 Query 与 Key/Value 来源不同。在 Encoder–Decoder Transformer 中：

$$
Q=H^{\mathrm{dec}}W_Q,\qquad
K=H^{\mathrm{enc}}W_K,\qquad
V=H^{\mathrm{enc}}W_V.
$$

输出长度跟随 Query，因此 Decoder 的每个目标位置可以读取全部源位置。

```python
import torch
import torch.nn.functional as F

torch.manual_seed(42)
decoder = torch.randn(2, 4, 8)
encoder = torch.randn(2, 6, 8)
cross_output = F.scaled_dot_product_attention(decoder, encoder, encoder)
print(cross_output.shape)
```

输出为 `(2,4,8)`，目标长度为 4，源长度为 6。

### 多头注意力

单头只在一个投影空间中计算相似度。多头注意力将表示投影为 $h$ 组，每头宽度通常为 $d_h=d_{\text{model}}/h$：

$$
\operatorname{head}_i=\operatorname{Attention}(QW_i^Q,KW_i^K,VW_i^V),
$$

$$
\operatorname{MHA}(Q,K,V)
=\operatorname{Concat}(\operatorname{head}_1,\ldots,\operatorname{head}_h)W^O.
$$

“多头”不是把同一份单头结果复制多次：每头有不同投影参数，可以学习不同的匹配关系。$d_{\text{model}}$ 必须能被头数整除，才能均匀拆分。

#### 手写多头形状变换

```python
import torch
import torch.nn.functional as F

torch.manual_seed(42)
batch, length, model_dim, heads = 2, 5, 12, 3
head_dim = model_dim // heads
X = torch.randn(batch, length, model_dim)
Wq = torch.randn(model_dim, model_dim)
Wk = torch.randn(model_dim, model_dim)
Wv = torch.randn(model_dim, model_dim)

Q = (X @ Wq).view(batch, length, heads, head_dim).transpose(1, 2)
K = (X @ Wk).view(batch, length, heads, head_dim).transpose(1, 2)
V = (X @ Wv).view(batch, length, heads, head_dim).transpose(1, 2)
heads_output = F.scaled_dot_product_attention(Q, K, V)
output = heads_output.transpose(1, 2).contiguous().view(batch, length, model_dim)
print(Q.shape, heads_output.shape, output.shape)
```

内部形状为 `(N,h,T,d_h)`。合并时先把序列维移回头维之前，再 `contiguous().view(...)`；否则转置后的内存布局可能不支持直接 `view`。

#### PyTorch 接口

```python
import torch

torch.manual_seed(42)
attention = torch.nn.MultiheadAttention(12, 3, batch_first=True, dropout=0.0)
X = torch.randn(2, 5, 12)
output, weights = attention(X, X, X, need_weights=True, average_attn_weights=False)
print(output.shape)
print(weights.shape)
print(weights.sum(dim=-1))
```

输出为 `(2,5,12)`，权重为 `(2,3,5,5)`，分别对应批次、头、Query 和 Key。最后一维权重和为 1。

### 复杂度与边界

长度为 $T$、表示宽度为 $d$ 时，标准 Self-Attention 的分数矩阵含 $T^2$ 个元素，核心计算量为 $O(T^2d)$，分数与权重的额外内存为 $O(T^2)$。长序列的主要压力来自长度的平方，而不是 Q/K/V 名称本身。

若某一行所有 Key 都被屏蔽，手写 `softmax([-inf,...,-inf])` 没有有效概率分布，可能产生 `NaN`。数据和 Mask 应保证每个参与计算的 Query 至少存在一个有效 Key；补齐 Query 则在后续屏蔽。

Attention 权重描述模型本次前向的加权读取，并不自动构成人类可依赖的因果解释。

### 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch：scaled_dot_product_attention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html)
- [PyTorch：MultiheadAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html)

## Transformer：层结构、Encoder 与 Decoder

### Transformer 处理序列的方式

Transformer 用 [Attention](#attention-q-k-v-%E6%8E%A9%E7%A0%81%E4%B8%8E%E5%A4%9A%E5%A4%B4%E6%B3%A8%E6%84%8F%E5%8A%9B) 建立任意位置之间的信息通路，不依赖 RNN 的逐步状态传递。输入 Token 先变为宽度为 $d_{\text{model}}$ 的表示，再经过若干结构相同的层。

Self-Attention 本身不识别 Token 的先后顺序，因此输入还必须含有[位置信息](#%E4%BD%8D%E7%BD%AE%E7%BC%96%E7%A0%81-%E7%BB%9D%E5%AF%B9%E4%BD%8D%E7%BD%AE-%E6%AD%A3%E5%BC%A6%E7%BC%96%E7%A0%81%E4%B8%8E-rope)。

### 前馈网络

Attention 负责位置之间的信息交换；前馈网络（Feed-Forward Network，FFN）对每个位置独立使用同一组参数：

$$
\operatorname{FFN}(X)
=\phi(XW_1+\mathbf b_1)W_2+\mathbf b_2.
$$

通常先从 $d_{\text{model}}$ 扩张到 $d_{\text{ff}}$，经过 ReLU、GELU 等非线性，再投影回 $d_{\text{model}}$。它不会直接混合不同 Token，位置交互由 Attention 完成。

```python
import torch

torch.manual_seed(42)
ffn = torch.nn.Sequential(
    torch.nn.Linear(8, 32),
    torch.nn.GELU(),
    torch.nn.Linear(32, 8),
)
X = torch.randn(2, 5, 8)
output = ffn(X)
print(output.shape)
```

序列长度保持为 5，每个位置都执行相同的 `8 → 32 → 8` 变换。

### 残差、归一化与 Dropout

Attention 和 FFN 都包在残差路径中。原始 Transformer 使用 Post-Norm：

$$
Y=\operatorname{LayerNorm}(X+\operatorname{Attention}(X)),
$$

$$
Z=\operatorname{LayerNorm}(Y+\operatorname{FFN}(Y)).
$$

现代深层模型常使用 Pre-Norm：

$$
Y=X+\operatorname{Attention}(\operatorname{LayerNorm}(X)),
$$

$$
Z=Y+\operatorname{FFN}(\operatorname{LayerNorm}(Y)).
$$

两者不能只凭“都有 LayerNorm”视为相同。Post-Norm 的归一化位于残差相加之后；Pre-Norm 保留更直接的恒等梯度路径，通常更容易训练深层网络。Dropout 一般作用于子层输出后、残差相加前，并在推理时关闭。

### Transformer Encoder Layer

Encoder Layer 包含双向 Self-Attention 和 FFN。这里的“双向”表示任意有效位置都能读取其前后 Token，不表示使用双向 RNN。

下面是最小 Pre-Norm Encoder Layer。`key_padding_mask=True` 表示 `MultiheadAttention` 不读取该 Key 位置。

```python
import torch
from torch import nn

class EncoderLayer(nn.Module):
    def __init__(self, model_dim, heads, ff_dim, dropout=0.0):
        super().__init__()
        self.norm1 = nn.LayerNorm(model_dim)
        self.attention = nn.MultiheadAttention(
            model_dim, heads, dropout=dropout, batch_first=True
        )
        self.norm2 = nn.LayerNorm(model_dim)
        self.ffn = nn.Sequential(
            nn.Linear(model_dim, ff_dim),
            nn.GELU(),
            nn.Linear(ff_dim, model_dim),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, X, padding_mask=None):
        normalized = self.norm1(X)
        attended, _ = self.attention(
            normalized,
            normalized,
            normalized,
            key_padding_mask=padding_mask,
            need_weights=False,
        )
        X = X + self.dropout(attended)
        return X + self.dropout(self.ffn(self.norm2(X)))

torch.manual_seed(42)
layer = EncoderLayer(model_dim=16, heads=4, ff_dim=64)
X = torch.randn(2, 6, 16)
padding_mask = torch.tensor([
    [False, False, False, False, False, False],
    [False, False, False, True, True, True],
])
output = layer(X, padding_mask)
print(output.shape)
```

输出仍为 `(2,6,16)`。Mask 阻止其他位置读取补齐 Key，但补齐 Query 仍会产生输出；这些位置需要在池化或损失阶段排除。

### Transformer Decoder Layer

经典 Encoder–Decoder Transformer 的 Decoder Layer 依次包含：

1. 带 Causal Mask 的目标序列 Self-Attention；
2. 以目标状态为 Query、Encoder 输出为 Key/Value 的 Cross-Attention；
3. 逐位置 FFN。

训练时目标序列整体并行输入，但 Causal Mask 保证位置 $t$ 只能读取 $\le t$ 的目标位置。Cross-Attention 不使用目标因果 Mask，因为每个目标位置都可以读取完整源序列；它只需要屏蔽源序列 PAD。

```python
import torch

torch.manual_seed(42)
decoder_layer = torch.nn.TransformerDecoderLayer(
    d_model=16,
    nhead=4,
    dim_feedforward=64,
    dropout=0.0,
    batch_first=True,
    norm_first=True,
)
target = torch.randn(2, 4, 16)
memory = torch.randn(2, 6, 16)
causal_mask = torch.triu(torch.ones(4, 4, dtype=torch.bool), diagonal=1)
output = decoder_layer(target, memory, tgt_mask=causal_mask)
print(output.shape)
```

在该接口中，`tgt_mask=True` 表示禁止 Attention，因此使用严格上三角矩阵屏蔽未来位置。输出长度跟随目标序列，为 `(2,4,16)`。

### 三类常见架构

#### Encoder-Only

只堆叠 Encoder Layer，每个 Token 可以读取两侧上下文。常用于序列分类、Token 分类和表征学习。BERT 属于这一类；分类时可以读取特殊分类 Token，或对有效 Token 池化。

#### Decoder-Only

只堆叠带 Causal Mask 的 Self-Attention Layer，每个位置预测下一 Token：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

GPT 类语言模型属于这一类。训练可以并行计算各位置 Logit，生成仍需按 Token 自回归进行；KV Cache 可以避免每一步重复计算旧 Token 的 Key 和 Value。

#### Encoder–Decoder

Encoder 双向读取源序列；Decoder 通过因果 Self-Attention 读取已生成目标，并通过 Cross-Attention 读取源表示。它适合输入、输出均为序列且长度不同的条件生成任务，例如翻译与摘要。

三类架构的区别首先在信息可见范围，而不是名称。给 Encoder Self-Attention 加因果 Mask 后，其行为已不再是通常所说的双向 Encoder。

### 训练与生成

语言模型训练仍使用 [Seq2Seq](./recurrent-networks-and-seq2seq.md#encoder-decoder-%E4%B8%8E-seq2seq-%E8%AE%AD%E7%BB%83-%E6%8E%A9%E7%A0%81%E4%B8%8E%E7%94%9F%E6%88%90) 中的目标右移：输入 `[BOS,y_1,...,y_{T-1}]`，监督目标为 `[y_1,...,y_T]`。Causal Mask 防止每个位置读取右侧真实 Token，Padding Mask 排除补齐位置，两者解决不同问题。

推理时每一步产生下一个 Token，再追加到输入。普通实现会重新计算整个前缀；Decoder-Only 模型中，第 $t$ 步的旧 Key/Value 不会因新 Token 改变，可以缓存并只计算新位置。KV Cache 降低重复计算，但缓存随层数、序列长度、批量和 KV 头数增长。

### 计算量

设序列长度为 $T$，宽度为 $d$，FFN 宽度为 $d_{\text{ff}}$。一层主要计算量为：

$$
O(T^2d)+O(Td^2)+O(Tdd_{\text{ff}}).
$$

$T^2d$ 来自 Attention 的分数与加权，线性投影和 FFN 对宽度呈二次或乘积增长。短序列大宽度与长序列小宽度的瓶颈可能不同，不能只看到 Attention 的平方项。

### 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [PyTorch：TransformerEncoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerEncoderLayer.html)
- [PyTorch：TransformerDecoderLayer](https://docs.pytorch.org/docs/stable/generated/torch.nn.TransformerDecoderLayer.html)

## 位置编码：绝对位置、正弦编码与 RoPE

### 为什么必须加入位置

不含位置特征的 Self-Attention 对输入排列等变：若用同一个排列同时重排输入，输出也只会按相同方式重排。模型能比较内容，却不能仅凭 Attention 区分“猫追狗”和“狗追猫”的顺序。

位置编码的目标是让表示或 Attention 分数依赖 Token 所在位置。常见方法包括可学习绝对位置、固定正弦位置、相对位置偏置和旋转位置编码（RoPE）。它们的注入位置和外推行为不同。

### 可学习绝对位置 Embedding

为每个位置分配可训练向量 $P_i$，与 Token Embedding 相加：

$$
H_i=E[x_i]+P_i.
$$

```python
import torch

torch.manual_seed(42)
tokens = torch.randn(2, 5, 8)
position_embedding = torch.nn.Embedding(16, 8)
positions = torch.arange(tokens.size(1))
output = tokens + position_embedding(positions)[None, :, :]
print(output.shape)
```

参数表最大长度为 16，直接使用时不能索引更长位置。扩展上下文需要重新训练、插值或采用专门的位置扩展方法，不能假设表会自动增长。

### 固定正弦位置编码

原始 Transformer 对位置 $p$ 和通道对 $2i,2i+1$ 使用：

$$
PE_{p,2i}=\sin\left(\frac{p}{10000^{2i/d}}\right),
$$

$$
PE_{p,2i+1}=\cos\left(\frac{p}{10000^{2i/d}}\right).
$$

不同通道具有不同频率，相邻的偶数、奇数通道构成一组正弦和余弦。编码无需训练，并可按公式生成训练长度以外的位置；这不等于模型在任意长度上一定可靠。

```python
import math
import torch

length, model_dim = 6, 8
position = torch.arange(length, dtype=torch.float32)[:, None]
frequency = torch.exp(
    torch.arange(0, model_dim, 2, dtype=torch.float32)
    * (-math.log(10000.0) / model_dim)
)
encoding = torch.zeros(length, model_dim)
encoding[:, 0::2] = torch.sin(position * frequency)
encoding[:, 1::2] = torch.cos(position * frequency)
print(encoding.shape)
print(encoding[0])
```

位置 0 的偶数通道为 0，奇数通道为 1。正弦位置编码通常加在输入表示上，因此后续线性投影同时混合内容与位置。

### 相对位置

绝对位置回答“Token 在第几个位置”，而 Attention 中经常更关心“Query 与 Key 相隔多远”。相对位置方法让分数显式依赖 $i-j$，例如加入可学习偏置：

$$
S_{ij}=\frac{Q_iK_j^\mathsf T}{\sqrt{d_k}}+b_{i-j}.
$$

偏置可按距离截断或分桶，使远距离共享参数。它直接改变 Attention Logit，而不是与 Token Embedding 相加。

### RoPE

旋转位置编码（Rotary Position Embedding，RoPE）把 Query 和 Key 的相邻通道两两组成二维向量，并按位置旋转。对某一通道对，位置 $m$ 的旋转为：

$$
R_{m,\theta}=
\begin{bmatrix}
\cos(m\theta)&-\sin(m\theta)\\
\sin(m\theta)&\cos(m\theta)
\end{bmatrix}.
$$

将 $q_m$、$k_n$ 分别旋转后：

$$
(R_{m,\theta}q_m)^\mathsf T(R_{n,\theta}k_n)
=q_m^\mathsf T R_{n-m,\theta}k_n.
$$

点积中的位置依赖只与相对距离 $n-m$ 有关。RoPE 通常应用于每层 Attention 的 Query 和 Key，不旋转 Value，也不是简单加到输入 Embedding 上。

不同通道对使用不同角频率。常见形式为 $\theta_i=10000^{-2i/d}$，要求被旋转的维度为偶数。

#### 手写 RoPE

```python
import torch

def apply_rope(X, positions, base=10000.0):
    pair_count = X.size(-1) // 2
    frequency = base ** (
        -torch.arange(pair_count, dtype=X.dtype, device=X.device) / pair_count
    )
    angle = positions.to(X.dtype)[..., None] * frequency
    cos, sin = angle.cos(), angle.sin()
    even, odd = X[..., 0::2], X[..., 1::2]
    rotated = torch.stack((even * cos - odd * sin, even * sin + odd * cos), dim=-1)
    return rotated.flatten(-2)

X = torch.tensor([
    [[1., 0., 1., 0.], [1., 0., 1., 0.], [1., 0., 1., 0.]]
])
positions = torch.arange(3)[None, :]
rotated = apply_rope(X, positions)
print(rotated)
print(rotated.norm(dim=-1))
```

旋转改变方向但不改变每个二维通道对的长度，因此整体范数保持不变。

#### 验证相对位置性质

把 Query 和 Key 同时平移相同位置，二者距离不变，旋转后的点积也不变：

```python
import torch

query = torch.tensor([[[1., 2., 3., 4.]]])
key = torch.tensor([[[2., -1., 1., 0.5]]])
score_2_5 = (apply_rope(query, torch.tensor([[2]])) * apply_rope(key, torch.tensor([[5]]))).sum()
score_7_10 = (apply_rope(query, torch.tensor([[7]])) * apply_rope(key, torch.tensor([[10]]))).sum()
print(score_2_5.item(), score_7_10.item())
print(torch.allclose(score_2_5, score_7_10, atol=1e-5))
```

两组位置差都为 3，因此结果相同。此性质说明 Attention 分数如何获得相对位置信息，不代表模型能无损外推到无限长度；训练分布、频率尺度和数值精度仍会限制长上下文表现。

### 方法对比

| 方法 | 注入位置 | 是否训练 | 主要位置信息 |
| --- | --- | --- | --- |
| 可学习绝对位置 | 与 Token 表示相加 | 是 | 绝对位置 |
| 固定正弦位置 | 与 Token 表示相加 | 否 | 绝对位置，可线性组合出相对关系 |
| 相对位置偏置 | 加入 Attention Logit | 通常是 | Query–Key 距离 |
| RoPE | 旋转 Query、Key | 否 | 点积中的相对距离 |

选用方法必须与模型实现和已有权重一致。改变位置编码不仅是换一张表，还会改变 Attention 分数的形成方式。

### 参考资料

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864)
