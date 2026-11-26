---
title: 语言模型预训练与微调
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## BERT 与 GPT：双向编码和因果生成

### 相同基础，不同可见范围

BERT 和 GPT 都建立在 [Transformer](./attention-and-transformer.md#transformer-%E5%B1%82%E7%BB%93%E6%9E%84-encoder-%E4%B8%8E-decoder) 上。主要区别不是“一个理解、一个生成”，而是 Attention 可见范围和预训练目标。

| 模型 | 主体 | Attention | 典型预训练目标 | 每个位置可见内容 |
| --- | --- | --- | --- | --- |
| BERT | Encoder-Only | 双向 | Masked Language Modeling | 全部非 PAD 位置 |
| GPT | Decoder-Only | 因果 | Next-Token Prediction | 当前及左侧位置 |

BERT 的同一层中，位置可以同时读取左右上下文；GPT 的位置 $t$ 不能读取 $t$ 之后的 Token。两者都要屏蔽 PAD，但只有 GPT 还需要 Causal Mask。

```python
import torch

length = 5
bert_visible = torch.ones(length, length, dtype=torch.bool)
gpt_visible = torch.tril(torch.ones(length, length, dtype=torch.bool))
print(bert_visible)
print(gpt_visible)
```

### BERT 输入

BERT 输入表示由 Token、位置和句段 Embedding 相加：

$$
H_i=E_{\mathrm{token}}[x_i]+E_{\mathrm{position}}[i]+E_{\mathrm{segment}}[s_i].
$$

句对可组织为 `[CLS] A [SEP] B [SEP]`，句段 ID 区分 A、B。单句通常全部使用同一句段 ID。最终 `[CLS]` 表示可送入分类头，Token 级任务则使用各位置输出。

`[CLS]` 只是约定的可学习 Token；它是否包含适合某个任务的信息取决于预训练和微调，不能把它当作天然句向量。

### Masked Language Modeling

Masked Language Modeling（MLM）选取一部分位置作为预测目标，模型利用左右上下文恢复原 Token。原始 BERT 对选中的位置采用：80% 换成 `[MASK]`，10% 换成随机 Token，10% 保持不变；损失只计算这些选中位置。

```python
import torch

input_ids = torch.tensor([[101, 2054, 2003, 2026, 2171, 102]])
selected = torch.tensor([[False, True, False, True, False, False]])
labels = input_ids.clone()
labels[~selected] = -100
masked_input = input_ids.clone()
masked_input[0, 1] = 103
masked_input[0, 3] = 103
print(masked_input)
print(labels)
```

这里为了固定示例，把两个选中位置都替换为 `[MASK]`。真正的 80/10/10 是随机过程；标签始终保存替换前 Token。不能对所有未选中位置也计算损失，否则任务变成大部分位置复制输入。

原始 BERT 还使用 Next Sentence Prediction（NSP）判断句段 B 是否接在 A 后。后续 Encoder 预训练方法可能删除或替换 NSP，因此“BERT 类模型”不保证都具有这个目标。

### GPT 的因果语言建模

GPT 使用[自回归语言建模](./tokenization-and-language-modeling.md#%E8%AF%AD%E8%A8%80%E5%BB%BA%E6%A8%A1-%E4%B8%8B%E4%B8%80%E4%B8%AA-token-%E4%B8%8E%E5%9B%B0%E6%83%91%E5%BA%A6)：输入整个前缀并在每个位置预测下一 Token。训练时所有位置并行计算，Causal Mask 保证不看未来；生成时新 Token 未知，只能逐步追加。

```python
import torch
import torch.nn.functional as F

tokens = torch.tensor([[1, 4, 7, 9, 2]])
input_ids = tokens[:, :-1]
labels = tokens[:, 1:]
logits = torch.zeros(1, 4, 10)
logits.scatter_(2, labels.unsqueeze(-1), 3.0)
loss = F.cross_entropy(logits.transpose(1, 2), labels)
print(input_ids)
print(labels)
print(loss.item())
```

GPT 训练目标可以覆盖普通文本、代码或格式化对话；区别在数据序列如何构造，不在交叉熵公式本身。

### 下游使用方式

BERT 常在预训练 Encoder 上添加小型任务头：

- 文本分类：读取 `[CLS]` 或池化表示；
- Token 分类：对每个 Token 输出标签；
- 抽取式问答：分别预测答案起点和终点；
- 句对任务：共同输入两个句段并分类。

GPT 把任务写成上下文到续写：Prompt、示例和待回答内容构成前缀，答案作为后续 Token。微调时仍可只对答案部分计算损失。

双向 BERT 不适合直接逐 Token 生成任意长度文本，因为它没有按前缀训练下一 Token 分布；因果 GPT 可以生成，但每个位置缺少右侧上下文。选择架构应按所需信息流，而不是笼统比较谁更先进。

### 参数共享与输出头

语言模型输出层把隐藏状态映射到词表 Logit，权重形状为 $(|V|,d)$。它可与输入 Token Embedding 共享：

```python
import torch

embedding = torch.nn.Embedding(100, 16)
lm_head = torch.nn.Linear(16, 100, bias=False)
lm_head.weight = embedding.weight
hidden = torch.randn(2, 5, 16)
logits = lm_head(hidden)
print(logits.shape)
print(lm_head.weight.data_ptr() == embedding.weight.data_ptr())
```

共享后两处引用同一个参数，不是初始化成相同数值后各自更新。输出仍为每位置 100 个词表 Logit。

### 参考资料

- [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805)
- [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf)

## 预训练、SFT 与 LoRA

### 三个不同问题

预训练、监督微调和参数高效微调描述不同维度：

- 预训练：在大规模语料上学习通用语言分布或表示；
- SFT：用输入—理想输出样本训练模型遵循任务或指令；
- LoRA：限制参数更新形式，降低微调时可训练参数量。

SFT 可以全参数训练，也可以用 LoRA；LoRA 也可以用于继续预训练。不能把 SFT 和 LoRA 当作互斥训练阶段。

### 预训练与继续预训练

Decoder-Only 模型通常在文档 Token 流上做 Next-Token Prediction。Encoder-Only 模型可使用 MLM。训练目标见[语言建模](./tokenization-and-language-modeling.md#%E8%AF%AD%E8%A8%80%E5%BB%BA%E6%A8%A1-%E4%B8%8B%E4%B8%80%E4%B8%AA-token-%E4%B8%8E%E5%9B%B0%E6%83%91%E5%BA%A6)和[BERT/GPT](#bert-%E4%B8%8E-gpt-%E5%8F%8C%E5%90%91%E7%BC%96%E7%A0%81%E5%92%8C%E5%9B%A0%E6%9E%9C%E7%94%9F%E6%88%90)。

继续预训练（Continued Pretraining）从已有权重出发，在特定领域的未标注文本上继续相同或相近目标。它用于适应术语和文本分布，不直接教会模型遵循问答格式。

语料处理要记录来源、许可、语言、去重、质量过滤和训练/评估重合。文档打包提高 Token 利用率，但文档边界应使用 EOS 或相应 Attention 规则。

### SFT 数据格式

一条指令样本通常包含系统约束、用户输入和目标回答。Chat Template 把角色与内容转成模型实际训练的 Token 序列。训练和推理必须使用同一模板及特殊 Token 约定。

对话序列可表示为：

$$
[\text{system},\text{user}_1,\text{assistant}_1,
\text{user}_2,\text{assistant}_2].
$$

常见做法只在 Assistant 回答 Token 上计算损失，把系统和用户 Token 标签设为忽略值。模型仍能在 Attention 中读取这些输入，只是不要求预测它们。

```python
import torch
import torch.nn.functional as F

input_ids = torch.tensor([[10, 11, 12, 20, 21, 2]])
assistant_mask = torch.tensor([[False, False, False, True, True, True]])
labels = input_ids.roll(-1, dims=1)
predict_assistant = assistant_mask.roll(-1, dims=1)
labels[~predict_assistant] = -100
labels[:, -1] = -100
logits = torch.randn(1, 6, 32)
loss = F.cross_entropy(logits.transpose(1, 2), labels, ignore_index=-100)
print(labels)
print(loss.item())
```

位置 $t$ 预测位置 $t+1$，所以“下一个 Token 是否属于 Assistant”才决定该位置是否计入损失。直接用未错位的角色 Mask 会漏掉回答首 Token，并可能训练用户末尾位置的错误目标。

若希望模型学习生成角色起始标记，应把该标记计入 Assistant 目标；规则必须与模板一致。

### 数据质量与 Packing

SFT 样本数量不能代替质量。至少检查：回答是否遵循输入、是否含冲突系统规则、是否截断关键结尾、是否重复、是否泄漏测试答案，以及拒答比例是否符合使用场景。

把多条短样本 Packing 到一个上下文可减少 Padding。若只插入 EOS 而仍允许跨样本 Attention，后一个样本可以读取前一个无关样本；若任务要求严格独立，应使用块对角 Attention Mask。无论是否隔离，损失 Mask 都必须与每条回答边界对齐。

### 全参数微调

全参数微调更新模型全部权重，表达自由度高，同时需要保存全部参数梯度和优化器状态。数据较小或学习率过高时，模型可能破坏已有能力。应保留基础模型评估、目标任务评估和训练曲线，而不是只看训练损失。

冻结参数减少梯度和优化器状态，不代表基础权重无需驻留内存；前向激活也仍占显存。

### LoRA

对线性层基础权重 $W_0\in\mathbb R^{d_{\mathrm{out}}\times d_{\mathrm{in}}}$，LoRA 冻结 $W_0$，学习低秩更新：

$$
W=W_0+\frac\alpha r BA,
$$

其中 $A\in\mathbb R^{r\times d_{\mathrm{in}}}$，$B\in\mathbb R^{d_{\mathrm{out}}\times r}$，秩 $r\ll\min(d_{\mathrm{in}},d_{\mathrm{out}})$。前向为：

$$
y=W_0x+\frac\alpha r B(Ax).
$$

可训练参数从 $d_{\mathrm{out}}d_{\mathrm{in}}$ 降为 $r(d_{\mathrm{in}}+d_{\mathrm{out}})$。这只计算 LoRA 参数，不含 Bias、LayerNorm、Embedding 或其他被配置为可训练的模块。

```python
import torch
from torch import nn

class LoRALinear(nn.Module):
    def __init__(self, input_dim, output_dim, rank, alpha):
        super().__init__()
        self.base = nn.Linear(input_dim, output_dim, bias=False)
        self.base.weight.requires_grad_(False)
        self.A = nn.Parameter(torch.randn(rank, input_dim) * 0.02)
        self.B = nn.Parameter(torch.zeros(output_dim, rank))
        self.scale = alpha / rank

    def forward(self, X):
        return self.base(X) + self.scale * (X @ self.A.T) @ self.B.T

torch.manual_seed(42)
layer = LoRALinear(16, 12, rank=4, alpha=8)
X = torch.randn(3, 16)
output = layer(X)
trainable = sum(parameter.numel() for parameter in layer.parameters() if parameter.requires_grad)
print(output.shape)
print(trainable)
```

输出形状为 `(3,12)`，可训练参数为 $4(16+12)=112$。$B$ 初始化为零，使初始 LoRA 更新为零，模型开始时与基础线性层一致；$A$ 不能也同时为零，否则第一步两者梯度都会为零。

#### 梯度与合并

```python
import torch

target = torch.randn(3, 12)
loss = (layer(X) - target).square().mean()
loss.backward()
print(layer.base.weight.grad)
print(layer.A.grad.norm(), layer.B.grad.norm())

merged_weight = layer.base.weight + layer.scale * layer.B @ layer.A
merged_output = X @ merged_weight.T
print(torch.allclose(layer(X), merged_output, atol=1e-6))
```

基础权重没有梯度。由于 $B$ 初始为零，第一步 $A$ 梯度为零而 $B$ 梯度非零；更新 $B$ 后，后续步骤 $A$ 才获得梯度。合并后的权重与未加 Dropout 的 LoRA 推理结果一致，可消除额外矩阵乘法。

### LoRA 配置

需要明确：

- 目标模块：常选 Attention 的 Q/V 投影，也可扩展到 K、输出投影和 FFN；
- 秩 $r$：越大更新空间越大，可训练参数也越多；
- $\alpha$：通过 $\alpha/r$ 控制更新尺度；
- LoRA Dropout：只在训练分支使用，含 Dropout 时不能用单次输出验证合并等价；
- 可训练 Bias 与 LayerNorm：是否开启会改变参数量和保存内容。

Adapter Checkpoint 通常只含增量参数和配置，必须与正确的基础模型版本、Tokenizer 和 Chat Template 一起加载。仅有 `A`、`B` 矩阵无法独立生成文本。

### 评估与保存

训练完成至少保存：基础模型标识与版本、Tokenizer、模板、LoRA 配置、数据版本、随机种子和评估结果。合并权重便于独立部署，未合并 Adapter 便于切换任务；两者应做同输入数值一致性检查。

SFT 损失下降只说明更能复现目标回答 Token。还要检查指令遵循、事实性、格式、拒答边界、基础能力退化和安全测试。

### 参考资料

- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685)
- [Finetuned Language Models Are Zero-Shot Learners](https://arxiv.org/abs/2109.01652)
- [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155)
