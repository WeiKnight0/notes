---
title: 图文融合与视觉语言模型
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 图文融合：双编码器、Cross-Attention 与视觉 Token

### 融合发生在哪里

图文模型先分别得到视觉表示 $V\in\mathbb R^{N\times L_v\times d_v}$ 和文本表示 $T\in\mathbb R^{N\times L_t\times d_t}$。架构差异主要在两种模态何时、以什么粒度交互。

| 结构 | 交互位置 | 优点 | 主要限制 |
| --- | --- | --- | --- |
| 双编码器 | 最终全局向量 | 候选可缓存，检索高效 | 缺少细粒度 Token 交互 |
| Cross-Encoder | 多层 Cross-Attention | 图文 Token 深度交互 | 每个候选对都需重新计算 |
| 视觉前缀 | 视觉特征投影为 LLM Token | 直接复用语言模型生成 | 视觉序列占用上下文 |
| 查询瓶颈 | 固定数量 Query 读取视觉特征 | 压缩可变长视觉序列 | Query 数量限制信息带宽 |

[CLIP](./clip.md#%E5%8F%8C%E7%BC%96%E7%A0%81%E5%99%A8%E7%BB%93%E6%9E%84) 是双编码器；BLIP 同时使用对比、匹配与生成路径；BLIP-2 使用 Q-Former；LLaVA 把投影后的视觉特征作为语言模型输入 Token。

### 双编码器

双编码器把图像和文本各自压缩成一个向量，再计算余弦相似度。图文只在相似度矩阵处交互，因此一百万张候选图像可以提前编码并建立向量索引。

它适合召回，但仅凭一个全局向量难以精确比较“左边的杯子是什么颜色”等局部关系。常见系统先用双编码器召回少量候选，再用融合模型重排。

### Cross-Attention

文本读取图像时，文本状态作为 Query，视觉 Token 作为 Key 和 Value：

$$
Q=TW_Q,\qquad K=VW_K,\qquad V'=VW_V.
$$

输出长度跟随文本，每个文本 Token 可得到不同的视觉加权结果。

```python
import torch

torch.manual_seed(42)
text = torch.randn(2, 5, 16)
vision = torch.randn(2, 12, 16)
attention = torch.nn.MultiheadAttention(16, 4, batch_first=True, dropout=0.0)
fused, weights = attention(text, vision, vision, average_attn_weights=False)
print(fused.shape)
print(weights.shape)
```

融合输出为 `(2,5,16)`，权重为 `(2,4,5,12)`。若图像包含补齐 Patch，还需传视觉 Key Padding Mask。

Cross-Attention 可以是单向文本读图，也可以交替让视觉读文本。双向并不自动更好，它增加计算量并改变各模态表示。

### 视觉 Token 前缀

视觉编码器输出经 Projector 映射到 LLM 宽度：

$$
Z_v=g(V),\qquad Z_v\in\mathbb R^{N\times L_v\times d_{\mathrm{llm}}}.
$$

然后与文本 Embedding 拼接为 `[视觉 Token, 文本 Token]`，共同送入因果语言模型。文本位置可以读取此前视觉 Token；视觉前缀内部的可见性由具体 Attention Mask 决定。

```python
import torch

torch.manual_seed(42)
vision = torch.randn(2, 16, 24)
text = torch.randn(2, 7, 32)
projector = torch.nn.Linear(24, 32)
inputs = torch.cat((projector(vision), text), dim=1)
labels = torch.full((2, 23), -100)
labels[:, 16:] = torch.arange(7)
print(inputs.shape)
print(labels.shape, (labels != -100).sum(dim=1))
```

输入含 16 个视觉和 7 个文本 Token。示例只在 7 个文本位置计算损失；真实 Next-Token 标签还需向左错开，不能直接把位置编号当标签。

### 查询瓶颈

查询瓶颈使用 $M$ 个可学习 Query $Q_0$ 通过 Cross-Attention 读取 $L_v$ 个视觉 Token：

$$
Q'=\operatorname{Attention}(Q_0,V,V),\qquad
Q'\in\mathbb R^{N\times M\times d}.
$$

无论视觉编码器输出多少 Patch，送给语言模型的视觉表示数量固定为 $M$。

```python
import torch

torch.manual_seed(42)
vision = torch.randn(3, 64, 32)
queries = torch.randn(1, 8, 32).expand(len(vision), -1, -1)
attention = torch.nn.MultiheadAttention(32, 4, batch_first=True, dropout=0.0)
compressed, _ = attention(queries, vision, vision, need_weights=False)
print(compressed.shape)
```

64 个视觉 Token 被读取为 8 个查询输出。它是学习到的条件压缩，不等同于每 8 个 Patch 做一次平均池化。

### 选择结构

- 大规模图文检索优先双编码器召回。
- 需要细粒度配对判断时使用 Cross-Encoder 或 Cross-Attention 重排。
- 复用已有 LLM 进行生成时使用视觉前缀或查询瓶颈。
- 多图、高分辨率和视频必须计算视觉 Token 数与 LLM 上下文预算。

“冻结视觉编码器和 LLM”只说明参数不更新，前向计算与激活仍然存在。训练资源还取决于 Token 数、是否保存梯度通过冻结模块，以及 Projector/Q-Former 的结构。

### 参考资料

- [CLIP](https://arxiv.org/abs/2103.00020)
- [BLIP-2](https://arxiv.org/abs/2301.12597)
- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485)

## BLIP 与 BLIP-2：统一图文预训练和 Q-Former

### BLIP 的三个目标

BLIP 以视觉编码器和具有不同 Attention 配置的文本 Transformer 支持理解与生成，联合使用三类目标。

#### Image–Text Contrastive Learning

ITC 将图像、文本全局表示对齐，形式与 [CLIP 对比损失](./clip.md#%E5%AF%B9%E7%A7%B0%E5%AF%B9%E6%AF%94%E6%8D%9F%E5%A4%B1)相近。它适合学习可独立编码、可用于检索的表示。

#### Image–Text Matching

ITM 输入完整图文对，通过跨模态交互判断是否匹配。负样本不是只看余弦距离，而是让融合表示学习细粒度对应。训练可从相似但不匹配的候选中采 Hard Negative。

```python
import torch
import torch.nn.functional as F

matching_logits = torch.tensor([[0.2, 2.1], [1.8, 0.1], [0.4, 1.5]])
labels = torch.tensor([1, 0, 1])
loss = F.cross_entropy(matching_logits, labels)
print(loss.item())
print(matching_logits.argmax(dim=1))
```

类别 1 表示匹配，三条样本均分类正确。ITM 是二分类，ITC 是批内多候选对比，两者不能互换。

#### Image-Conditioned Language Modeling

LM 让文本 Decoder 在图像条件下自回归预测描述：

$$
L_{\mathrm{LM}}=-\sum_t\log p(y_t\mid y_{<t},I).
$$

它训练图像到文本的生成能力。Causal Mask 只作用于目标文本的未来位置，视觉条件本身应可被每个目标位置读取。

### CapFilt

BLIP 的 Captioning and Filtering（CapFilt）先训练 Captioner 和 Filter。Captioner 为网页图像生成合成描述，Filter 判断原始或合成图文是否匹配，再用筛选后的数据训练模型。

这不是无条件相信模型生成数据。Captioner 增加描述多样性，Filter 删除部分噪声；两者也可能引入自己的偏差和错误，最终仍需下游验证。

### BLIP-2 为什么加入 Q-Former

BLIP-2 冻结预训练图像编码器和大语言模型，用 Querying Transformer（Q-Former）连接二者。固定数量的可学习 Query 通过 Cross-Attention 从冻结视觉特征中提取与文本相关的信息。

Q-Former 包含图像 Transformer 与文本 Transformer，它们共享 Self-Attention 参数；图像分支中的 Query 通过间隔插入的 Cross-Attention 读取冻结图像编码器输出。不同预训练任务使用不同 Self-Attention Mask 控制 Query 和文本的信息流。

```python
import torch

torch.manual_seed(42)
image_features = torch.randn(2, 49, 64)
query_tokens = torch.randn(1, 8, 32).expand(2, -1, -1)
keys = torch.nn.Linear(64, 32)(image_features)
values = torch.nn.Linear(64, 32)(image_features)
attention = torch.nn.MultiheadAttention(32, 4, batch_first=True, dropout=0.0)
query_output, weights = attention(query_tokens, keys, values)
print(query_output.shape, weights.shape)
```

49 个图像特征被 8 个 Query 读取，输出 `(2,8,32)`。这是结构示意；真实 Q-Former 还会在多层中交替执行 Query Self-Attention 和视觉 Cross-Attention。

### BLIP-2 两阶段预训练

第一阶段连接冻结图像编码器，训练 Q-Former 学习图文表示，包含：

- Image–Text Contrastive：对齐 Query 表示与文本表示；
- Image–Text Matching：通过双向交互判断图文匹配；
- Image-Grounded Text Generation：让文本在视觉 Query 条件下生成。

第二阶段连接冻结 LLM，把 Q-Former 输出经全连接层投影到 LLM Embedding 宽度，作为视觉软提示，训练图像到文本生成。

```python
import torch

query_output = torch.randn(2, 8, 32)
projector = torch.nn.Linear(32, 128)
visual_prompt = projector(query_output)
text_embeddings = torch.randn(2, 12, 128)
llm_inputs = torch.cat((visual_prompt, text_embeddings), dim=1)
print(llm_inputs.shape)
```

LLM 接收 8 个视觉提示和 12 个文本 Token，共 20 个输入位置。冻结 LLM 不等于不需要通过其输出计算语言建模损失。

### BLIP 与 BLIP-2 的区别

| | BLIP | BLIP-2 |
| --- | --- | --- |
| 重点 | 统一理解与生成、清洗网页配对 | 连接冻结视觉编码器与冻结 LLM |
| 桥接 | 多模态 Encoder/Decoder 配置 | 固定 Query 的 Q-Former 加投影 |
| 训练 | ITC、ITM、LM 与 CapFilt | 表示学习阶段、生成学习阶段 |
| LLM | 不是核心冻结组件 | 作为冻结语言生成端 |

BLIP-2 不是简单地在 BLIP 后添加更大的语言模型；其核心变化是用两阶段训练的 Q-Former 缩小模态与参数规模之间的接口问题。

### 参考资料

- [BLIP](https://arxiv.org/abs/2201.12086)
- [BLIP-2](https://arxiv.org/abs/2301.12597)

## LLaVA：视觉 Projector 与多模态指令微调

### 数据流

LLaVA 连接预训练 CLIP 视觉编码器与因果语言模型。图像经过视觉编码器得到 Patch 特征 $Z_v$，再由 Projector $g$ 映射到 LLM 的 Embedding 宽度：

$$
H_v=g(Z_v).
$$

$H_v$ 作为一段视觉 Token 插入对话序列，文本 Token 使用 LLM 原有 Embedding。LLM 在视觉与文本前缀条件下自回归生成回答。

```python
import torch
from torch import nn

torch.manual_seed(42)
vision_features = torch.randn(2, 16, 24)
text_embeddings = torch.randn(2, 7, 32)
projector = nn.Sequential(nn.Linear(24, 64), nn.GELU(), nn.Linear(64, 32))
visual_tokens = projector(vision_features)
llm_inputs = torch.cat((visual_tokens, text_embeddings), dim=1)
print(visual_tokens.shape)
print(llm_inputs.shape)
```

Projector 改变特征维度，不改变 16 个视觉位置。视觉 Token 数由图像编码器分辨率、Patch 和特征选择决定，不是由 LLM 词表决定。

### 图像占位符

对话文本可包含一个图像占位符。Tokenize 后，在占位符位置用视觉 Token 序列替换，而不是把同一个图像 ID 重复若干次。

```python
import torch

before_image = torch.randn(2, 3, 32)
visual_tokens = torch.randn(2, 16, 32)
after_image = torch.randn(2, 5, 32)
inputs = torch.cat((before_image, visual_tokens, after_image), dim=1)
labels = torch.full((2, 24), -100)
labels[:, 19:] = torch.tensor([4, 7, 8, 9, 2])
print(inputs.shape)
print((labels != -100).sum(dim=1))
```

视觉位置和用户提示位置通常不计算语言建模损失，Assistant 回答位置才作为监督目标。实际实现还要按 Next-Token Prediction 向左错开标签，规则与普通 [SFT](./CS224N/10-prompting-instruction-preferences.md#2-指令微调)相同。

### 两阶段训练

原始 LLaVA 先做特征对齐预训练，再做视觉指令微调。

#### 特征对齐

冻结视觉编码器和 LLM，只训练 Projector。使用图像—描述数据，让投影后的视觉特征成为 LLM 可利用的条件。该阶段建立接口，不等于已经学会多轮指令遵循。

#### 视觉指令微调

使用图像、指令和回答组成的对话数据训练。原始方案继续冻结视觉编码器，更新 Projector 与 LLM。其他实现可能冻结 LLM、使用 LoRA 或解冻视觉编码器；必须看具体配置，不能只凭“LLaVA”名称判断可训练参数。

训练数据覆盖对话、详细描述和复杂推理等格式。语言模型生成的合成指令仍以图像信息和已有标注为依据；若合成答案添加图中不存在的细节，模型会把错误当监督信号。

### 视觉 Token 与 Attention

当视觉 Token 位于用户问题之前，回答 Token 在因果 Attention 下可以读取全部视觉与问题前缀。视觉 Token 之间的 Mask、图像起止标记和位置 ID 由具体实现规定。

多图输入需要保持每个占位符与视觉 Token 段一一对应。只把多张图的特征全部拼在开头，却不保留边界，会让“第一张图”和“第二张图”的指代难以对应。

高分辨率方法可能切分图像或保留更多 Patch，从而增加视觉 Token。更高分辨率可改善 OCR 与小目标，也会增加 Attention 计算、显存和上下文占用。

### Projector 能做什么

线性 Projector 对每个视觉 Token 独立映射：$h_i=Wz_i+b$。MLP Projector 增加非线性，但仍不主动减少 Token 数。若要固定长度压缩，应使用池化、Resampler 或 [查询瓶颈](#%E6%9F%A5%E8%AF%A2%E7%93%B6%E9%A2%88)。

Projector 负责对齐接口维度与表示分布，不能补回视觉编码器已经丢失的文字、空间或细粒度信息。

### 数据检查

- 图像能否读取，方向和颜色是否正确；
- 占位符数量是否与图像数量一致；
- 回答是否确实可由图像与问题得到；
- Assistant Mask 是否覆盖完整回答而不覆盖用户文本；
- 截断后是否仍保留图像、问题和答案关键部分；
- 同图或近重复图是否跨训练与测试划分。

多模态 SFT 训练损失下降不能证明模型使用了图像。可加入“同一问题替换图像”的对照：若输出几乎不变，模型可能主要依赖语言先验。

### 参考资料

- [Visual Instruction Tuning](https://arxiv.org/abs/2304.08485)
- [LLaVA 官方实现](https://github.com/haotian-liu/LLaVA)
