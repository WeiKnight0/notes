---
title: 文本表示与语言建模
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## Tokenization：文本、子词与 Token ID

### Tokenizer 做了什么

语言模型接收整数 Token ID，而不是直接接收字符串。Tokenizer 通常执行：

$$
\text{文本}\rightarrow\text{规范化与预切分}\rightarrow
\text{子词序列}\rightarrow\text{Token ID}.
$$

解码执行相反映射，但不一定恢复原字符串。若编码前做了不可逆的大小写折叠、Unicode 规范化或空白清理，这些差异无法仅凭 ID 找回。

Tokenizer 是模型接口的一部分。词表、合并规则、规范化和特殊 Token ID 任一不匹配，输入含义都会改变，不能只保证词表大小相同。

### 字符、词和子词

按词切分的序列较短，但固定词表无法覆盖所有新词、拼写变化和组合词。按字符或字节切分几乎没有未知符号，但序列更长，一个语义单位被拆得更碎。

子词方法位于二者之间：常见词可以保留为一个 Token，罕见词拆成多个可复用片段。例如 `lowest` 可能拆为 `low` 与 `est`。实际结果只由具体 Tokenizer 决定，不能凭肉眼猜测。

中文没有天然空格分词边界。现代 Tokenizer 可以直接在原始 Unicode 文本或 UTF-8 字节上学习子词，不要求先调用传统中文分词器。

### BPE

Byte Pair Encoding（BPE）从较小符号集合出发，反复把训练语料中频率最高的相邻符号对合并为新符号，直到达到目标合并次数。

设词频为 `low: 5, lower: 2, newest: 6, widest: 3`。初始先把词拆成字符及词尾标记；统计全部相邻对后，选择最高频的一对合并，再重新统计。合并顺序必须保存，编码新文本时按已学习规则执行，不能重新按新文本频率训练。

```python
from collections import Counter

words = {
    tuple('low') + ('</w>',): 5,
    tuple('lower') + ('</w>',): 2,
    tuple('newest') + ('</w>',): 6,
    tuple('widest') + ('</w>',): 3,
}

pair_counts = Counter()
for symbols, frequency in words.items():
    pair_counts.update({pair: frequency for pair in zip(symbols, symbols[1:])})
best_pair, best_count = pair_counts.most_common(1)[0]
print(best_pair, best_count)
```

该语料第一次最高频相邻对是 `('e','s')`，出现加权次数 9。真实训练还需定义并列频率处理、预切分和跨词边界规则，这些都会影响最终词表。

### WordPiece 与 Unigram

WordPiece 也逐步构造子词词表，但候选合并的评分不等同于原始 BPE 的最高相邻频率。BERT 使用 WordPiece，并用 `##` 等约定标记词内续接片段。

Unigram Language Model 从较大的候选子词集合开始，根据概率模型逐步删除影响较小的子词；一个字符串可能有多种切分，使用动态规划选择高概率路径。SentencePiece 可以直接从原始句子训练 BPE 或 Unigram 模型，并把空格作为普通符号处理。

这些名称描述不同训练方法，不保证两个实现具有相同规范化或预切分行为。

### 字节级表示

UTF-8 把字符编码成一个或多个字节。字节级 Tokenizer 以 256 个字节为基础符号，因此任意合法字节序列都可表示，不依赖 `[UNK]` 覆盖新字符。

```python
text = 'AI与猫'
encoded = list(text.encode('utf-8'))
decoded = bytes(encoded).decode('utf-8')
print(encoded)
print(decoded)
```

`A`、`I` 各占一个 UTF-8 字节，中文字符各占三个。字节可覆盖全部文本，不表示每个字节都会成为最终一个 Token；Byte-Level BPE 仍会合并常见字节序列。

### 特殊 Token

常见特殊 Token 包括：

- BOS：序列开始或首次生成输入；
- EOS：序列结束，生成时可作为停止条件；
- PAD：批处理中补齐长度；
- UNK：词表无法表示的内容；字节级方案通常不需要依赖它覆盖字符；
- MASK：掩码语言模型的替换符号；
- SEP/CLS：某些 Encoder 模型用于分隔序列或汇聚分类表示。

不同模型可能复用同一个 ID 承担多个角色，也可能没有其中某些 Token。代码应读取 Tokenizer 配置，不能硬编码“0 一定是 PAD”。

### Padding、Truncation 与 Attention Mask

批处理把短序列补齐到统一长度。`attention_mask=1` 通常表示真实 Token，0 表示 PAD，但具体模型接口仍需核对。Attention Mask 阻止读取 PAD；损失标签还需单独使用忽略值屏蔽。

```python
import torch

sequences = [torch.tensor([11, 12, 13, 2]), torch.tensor([21, 22, 2])]
pad_id = 0
input_ids = torch.full((2, 4), pad_id)
for row, sequence in enumerate(sequences):
    input_ids[row, :len(sequence)] = sequence
attention_mask = input_ids != pad_id
print(input_ids)
print(attention_mask)
```

截断会永久丢弃超长部分。应先明确保留左侧还是右侧，以及 EOS 是否仍被保留。对因果语言模型，训练常右侧 Padding；批量生成的 Padding 方向还受位置 ID、KV Cache 和框架实现影响。

### Offset 与长度

Token 分类、抽取式问答和高亮需要把 Token 映射回原文本字符区间，因此 Fast Tokenizer 常返回 Offset Mapping。特殊 Token 通常没有普通文本区间，子词边界也不等于用户看到的字边界。

“模型上下文长度为 4096”指 Token 数，不是汉字数、英文单词数或 UTF-8 字节数。同一文本在不同 Tokenizer 下长度不同，成本和是否截断也会不同。

### 参考资料

- [Neural Machine Translation of Rare Words with Subword Units](https://arxiv.org/abs/1508.07909)
- [SentencePiece](https://arxiv.org/abs/1808.06226)
- [BERT](https://arxiv.org/abs/1810.04805)

## 语言建模：下一个 Token 与困惑度

### 自回归语言模型

给定 Token 序列 $x_1,\ldots,x_T$，自回归语言模型用概率链式法则分解联合概率：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

模型在每个位置输出词表上的 Logit。Causal Mask 保证位置 $t$ 的隐藏状态只读取 $x_{\le t}$，该位置 Logit 用于预测 $x_{t+1}$。

设输入为 `[BOS, 我, 爱, 猫]`，标签为 `[我, 爱, 猫, EOS]`。这是同一序列错开一位，不是在当前位置复述已经看到的 Token。

```python
import torch

tokens = torch.tensor([[1, 5, 8, 9, 2]])
input_ids = tokens[:, :-1]
labels = tokens[:, 1:]
print(input_ids)
print(labels)
```

### 负对数似然与交叉熵

对有效预测位置集合 $\mathcal V$，Token 平均负对数似然为：

$$
L=-\frac1{|\mathcal V|}\sum_{t\in\mathcal V}
\log p(x_t\mid x_{<t}).
$$

训练使用原始 Logit 交给交叉熵函数；不先手动 Softmax。数值稳定实现内部使用 Log-Sum-Exp。

```python
import math
import torch
import torch.nn.functional as F

logits = torch.tensor([[[2., 0., 0.], [0., 2., 0.], [0., 0., 2.]]])
labels = torch.tensor([[0, 1, 2]])
loss = F.cross_entropy(logits.transpose(1, 2), labels)
perplexity = loss.exp()
expected = math.log(math.exp(2) + 2) - 2
print(loss.item(), expected)
print(perplexity.item())
```

三个位置正确类别结构相同，平均损失约为 `0.239545`，困惑度约为 `1.270671`。

### 困惑度

困惑度（Perplexity，PPL）是平均负对数似然的指数：

$$
\operatorname{PPL}=\exp(L).
$$

若所有位置都在 $K$ 个 Token 上均匀分布，则 $L=\log K$，PPL 为 $K$。PPL 越低表示模型给真实序列分配的平均概率越高，但它不直接衡量事实性、推理能力或生成偏好。

PPL 依赖 Tokenizer。把一个词拆成不同数量 Token 会改变平均单位，因此使用不同词表或规范化的模型，其 Token 级 PPL 通常不能直接比较。若使用自然对数，指数为 $e^L$；使用以 2 为底的平均负对数时则为 $2^L$。

### Padding 与损失屏蔽

PAD 不是真实文本，不应进入损失平均。常用做法把 PAD 标签改为 `ignore_index`，输入 ID 仍保留 PAD 供模型执行批处理。

```python
import torch
import torch.nn.functional as F

logits = torch.tensor([
    [[3., 0., 0.], [0., 3., 0.], [0., 0., 3.]],
    [[3., 0., 0.], [0., 3., 0.], [9., 0., 0.]],
])
labels = torch.tensor([[0, 1, 2], [0, 1, -100]])
loss = F.cross_entropy(logits.transpose(1, 2), labels, ignore_index=-100)
print(loss.item(), loss.exp().item())
```

第二条序列最后一个 Logit 即使很极端，也不影响结果。Attention 的 Padding Mask 与损失忽略仍是两处独立操作。

### 从连续文本制作训练样本

长 Token 流可切成长度为 $L+1$ 的窗口，前 $L$ 个作输入，后 $L$ 个作标签。窗口之间可以不重叠、部分重叠，或使用文档打包。

```python
import torch

stream = torch.arange(13)
context, stride = 4, 3
windows = [stream[start:start + context + 1] for start in range(0, len(stream) - context, stride)]
inputs = torch.stack([window[:-1] for window in windows])
labels = torch.stack([window[1:] for window in windows])
print(inputs)
print(labels)
```

重叠窗口会让部分 Token 多次计入训练。评估 PPL 时也要避免重复计数；若用滑窗提供更长左上下文，应只累计每个窗口中新引入位置的损失。

不同文档拼接时应插入 EOS 或设置边界 Mask。否则模型会学习前一文档末尾直接预测下一篇无关文档开头的人工关系。

### 一个最小因果 Transformer LM

```python
import torch
from torch import nn

class CausalLanguageModel(nn.Module):
    def __init__(self, vocabulary, model_dim, heads, layers, max_length):
        super().__init__()
        self.token_embedding = nn.Embedding(vocabulary, model_dim)
        self.position = nn.Parameter(torch.zeros(1, max_length, model_dim))
        layer = nn.TransformerEncoderLayer(
            model_dim, heads, model_dim * 4, dropout=0.0, batch_first=True, norm_first=True
        )
        self.transformer = nn.TransformerEncoder(layer, layers)
        self.norm = nn.LayerNorm(model_dim)
        self.output = nn.Linear(model_dim, vocabulary, bias=False)

    def forward(self, input_ids):
        length = input_ids.size(1)
        X = self.token_embedding(input_ids) + self.position[:, :length]
        causal = torch.triu(torch.ones(length, length, dtype=torch.bool), diagonal=1)
        return self.output(self.norm(self.transformer(X, mask=causal)))

torch.manual_seed(42)
model = CausalLanguageModel(20, 16, heads=4, layers=2, max_length=32)
input_ids = torch.tensor([[1, 4, 7, 2], [1, 3, 2, 0]])
logits = model(input_ids)
print(logits.shape)
```

输出 `(2,4,20)`，每个位置对应下一 Token 的词表分数。训练时还需错开标签并屏蔽 PAD；示例没有把两者藏进模型内部。

### 评估规则

- 在固定 Tokenizer、数据顺序和上下文长度下比较 PPL。
- 只累计真实且首次评估的 Token，不计 PAD 和人工补齐。
- 明确 BOS、EOS 是否计入损失。
- 验证集必须与预训练语料去重；低 PPL 不能排除记忆或泄漏。
- 同时报告任务指标和生成检查，不能用 PPL 代替全部能力评估。

下一篇：[BERT 与 GPT](./language-model-pretraining.md#bert-%E4%B8%8E-gpt-%E5%8F%8C%E5%90%91%E7%BC%96%E7%A0%81%E5%92%8C%E5%9B%A0%E6%9E%9C%E7%94%9F%E6%88%90)。

### 参考资料

- [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
