---
title: 学习范式
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 学习范式：监督、无监督、自监督与强化学习

### 监督信号从哪里来

学习范式主要区分训练信号的来源，而不是模型结构。同一个 Transformer 可以用人工标注做分类，也可以预测文本中的下一个 Token，还可以参与强化学习。

| 范式 | 训练中提供什么 | 典型任务 |
| --- | --- | --- |
| 监督学习 | 输入与任务标签 | 房价回归、带类别标注的图像分类 |
| 无监督学习 | 未附任务标签的数据 | 聚类、密度估计、降维 |
| 自监督学习 | 从数据自身构造输入与目标 | 下一个 Token 预测、掩码重建、视图对比 |
| 强化学习 | 交互产生的状态、动作与奖励 | 游戏决策、机器人控制 |

这些术语并非在所有资料中都划成互斥类别。例如自监督学习经常被归入广义无监督学习；一个实际系统也可以先自监督预训练，再监督微调。

### 监督学习

每个训练样本包含输入 $\mathbf x_i$ 与目标 $y_i$，使用目标判断预测误差。例如垃圾邮件分类，输入是邮件内容，标签是“垃圾”或“正常”。损失和训练流程见[学习目标](./machine-learning-theory.md#%E5%AD%A6%E4%B9%A0%E7%9B%AE%E6%A0%87-%E6%95%B0%E6%8D%AE-%E6%A8%A1%E5%9E%8B%E4%B8%8E%E8%AE%AD%E7%BB%83)。

“监督”不要求每个标签都由人逐条填写。传感器测量值、业务结果或可靠规则也能产生任务标签。关键是它与当前任务目标之间的关系。

标签错误、选择偏差和训练时不可获得的特征都可能破坏学习。增加模型规模不能自动修复错误标签。

### 无监督学习

没有当前任务的显式目标标签时，可以直接研究数据的结构。

- 聚类把相似样本分组，但簇编号没有天然语义，不能直接把“第 0 簇”解释为某个真实类别。
- 降维用较少的变量表示数据，但保留方差最多的方向未必最适合下游分类。
- 密度估计学习样本分布，用于分析、生成或某些异常检测任务；高密度也不必然等于语义正常。

模型仍然需要目标函数，例如簇内距离或重建误差。“没有标签”不等于“没有优化目标”，也不等于“结果不需要评估”。

### 自监督学习

自监督学习从原始样本构造预测目标，使模型在缺少人工任务标注时学习表示。目标虽然来自数据自身，但训练仍需严格控制模型可以看到哪些信息。

#### 自回归预测

给定序列 $x_1,\ldots,x_T$，用前缀预测下一个元素：

$$
L=-\sum_{t=1}^{T}\log p_\theta(x_t\mid x_{<t}).
$$

首个位置可以使用序列开始标记作为上下文。训练时可以一次处理整个序列，但位置 $t$ 的预测不能查看位置 $t$ 及其后的目标信息；注意力模型通过因果掩码实现这种限制。

#### 示例：输入与标签错开一位

设 `[1, 5, 8, 3, 2]` 分别表示开始标记、三个词和结束标记。

- 输入：`[1, 5, 8, 3]`。
- 目标：`[5, 8, 3, 2]`。
- 解释：看到开始标记预测 5，看到前两个输入预测 8，以此类推。每个位置使用的上下文逐步增长。

```python
import numpy as np

tokens = np.array([1, 5, 8, 3, 2])
inputs = tokens[:-1]
targets = tokens[1:]
print(inputs)
print(targets)
```

错位标签只是数据准备；若模型没有因果限制，仍可能直接看到答案。训练使用真实前缀，生成时则使用此前实际生成的 Token，这两种输入分布也可能不同。

#### 掩码预测

遮住部分输入，仅根据可见部分重建被遮住的内容。例如把“今天的天气很好”变成“今天的 `[MASK]` 很好”，目标是被遮住的“天气”。

掩码位置集合为 $M$，一种基本目标为 $L=-\sum_{t\in M}\log p_\theta(x_t\mid\tilde{\mathbf x})$，其中 $\tilde{\mathbf x}$ 为扰动后的输入。模型可以利用左右文，因此与只能使用前缀的自回归条件不同。

下面使用固定掩码演示标签筛选，不是完整复现 BERT 的采样与替换比例。

```python
import numpy as np

tokens = np.array([1, 5, 8, 3, 2])
mask = np.array([False, False, True, False, False])
corrupted = tokens.copy()
corrupted[mask] = 0
labels = np.where(mask, tokens, -100)
print(corrupted)
print(labels)
```

输出 `[1, 5, 0, 3, 2]` 与 `[-100, -100, 8, -100, -100]`。这里 0 是示例的掩码编号，`-100` 与 PyTorch 交叉熵默认的忽略标签约定相匹配。它不代表词表中的真实类别。

#### 对比学习

对同一张图片生成两个合理增强视图，将它们视为正样本对；其他图片的视图作为候选负样本。训练要求相关表示比不相关表示更接近，具体过程见[对比学习](#%E5%AF%B9%E6%AF%94%E5%AD%A6%E4%B9%A0-%E6%AD%A3%E8%B4%9F%E6%A0%B7%E6%9C%AC-%E6%B8%A9%E5%BA%A6%E4%B8%8E-infonce)。

正负关系不一定来自自监督：用人工类别构造同类正样本，是监督式对比学习；CLIP 使用配对图片与自然语言文本，配对关系本身提供监督信息。

### 半监督与弱监督

半监督学习同时使用少量有标签数据和较多无标签数据。常见方法是用模型为无标签数据生成伪标签，或要求不同扰动下预测一致。错误伪标签可能被持续强化，因此不能把它当成新增的可靠人工标签。

弱监督描述标签粗糙、不准确或不完整。例如只有整张图的类别，却希望定位目标；或者使用规则产生带噪声的标签。它与“标注数量少”的半监督不是同一概念，可以同时存在。

### 强化学习

智能体根据当前状态选择动作，环境返回奖励与下一状态。目标是获得较大的累计回报，而不只是模仿某个已给定的正确动作。

例如走迷宫时，转弯没有逐步正确标签，可能只有到达终点才获得奖励。一次早期选择的影响要在多步之后体现，这涉及延迟奖励和信用分配。

强化学习还需要处理探索：只重复当前看起来最好的动作，可能永远发现不了更好的路径。动作会改变之后遇到的数据，因此训练数据不再像普通监督数据那样天然固定。

这里只区分训练信号；状态、回报、价值函数与具体算法在后续强化学习模块展开。

### 如何识别一个训练方案

先看训练输入和目标如何构造，再看损失，最后看模型。用文本自身预测后续文本属于自监督；拿人工答案训练问答属于监督；按环境奖励优化动作属于强化学习。使用相同网络结构不改变这些区别。

后续：[生成与判别](#%E7%94%9F%E6%88%90%E5%BB%BA%E6%A8%A1%E4%B8%8E%E5%88%A4%E5%88%AB%E5%BB%BA%E6%A8%A1)、[迁移学习](#%E8%BF%81%E7%A7%BB%E5%AD%A6%E4%B9%A0-%E9%A2%84%E8%AE%AD%E7%BB%83-%E5%86%BB%E7%BB%93%E4%B8%8E%E5%BE%AE%E8%B0%83)。

### 参考资料

- [BERT：Pre-training of Deep Bidirectional Transformers](https://arxiv.org/abs/1810.04805)
- [SimCLR：A Simple Framework for Contrastive Learning](https://arxiv.org/abs/2002.05709)
- [CLIP：Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020)

## 生成建模与判别建模

### 建模对象

判别建模关注给定输入后如何作出判断，例如学习 $p(y\mid\mathbf x)$，或者直接学习决策函数。逻辑回归估计类别概率，SVM 则可以直接学习分类边界而不显式给出概率。

生成建模关注数据的生成分布，例如 $p(\mathbf x)$、联合分布 $p(\mathbf x,y)$，或在条件 $c$ 下生成复杂输出的分布 $p(\mathbf x\mid c)$。模型可以显式计算密度，也可以通过采样过程定义分布。

“监督/自监督”区分训练信号来源，“生成/判别”区分建模目标，它们是不同维度。例如语言模型可以通过自监督训练学习生成分布；带类别标注的朴素 Bayes 也是生成式分类模型。

### 生成式分类

假设要根据邮件特征 $\mathbf x$ 判断是否为垃圾邮件 $y$。生成式分类先估计类别先验 $p(y)$ 和各类别下的特征分布 $p(\mathbf x\mid y)$，然后通过 Bayes 公式分类：

$$
p(y\mid\mathbf x)=\frac{p(\mathbf x\mid y)p(y)}{\sum_c p(\mathbf x\mid c)p(c)}.
$$

比较类别时，分母对所有类别相同，可以只比较分子。朴素 Bayes 进一步假设给定类别后各特征条件独立，从而把类条件分布拆成乘积。

#### 示例：一个词能说明什么

令 $x=1$ 表示邮件中出现“中奖”。假设：

- 垃圾邮件先验 $p(y=1)=0.2$，普通邮件先验为 0.8。
- $p(x=1\mid y=1)=0.6$，$p(x=1\mid y=0)=0.05$。

看到“中奖”后的垃圾邮件概率为：

$$
p(y=1\mid x=1)=\frac{0.6\times0.2}{0.6\times0.2+0.05\times0.8}=0.75.
$$

不能把 $p(x=1\mid y=1)=0.6$ 直接当成 $p(y=1\mid x=1)$，两者条件方向不同。

```python
import numpy as np

prior = np.array([0.8, 0.2])
likelihood = np.array([0.05, 0.6])
joint = prior * likelihood
posterior = joint / joint.sum()
print(posterior)
```

输出 `[0.25, 0.75]`。这是已知概率下的分类计算，学习这些概率还需要训练数据。

### 判别式分类

逻辑回归直接用输入计算 $p(y=1\mid\mathbf x)=\sigma(\mathbf x^\mathsf T\mathbf w+b)$，不需要显式解释邮件特征本身如何产生。

因此生成式分类需要同时拟合类别与输入分布，判别式分类直接针对类别决策。但哪种更好取决于数据量、模型假设和任务，不能简单得出生成式必然差或必然更强。

“判别式”也不意味着不能输出概率；“生成式”也不意味着不能分类。具体例子见[逻辑回归](./linear-models.md#%E9%80%BB%E8%BE%91%E5%9B%9E%E5%BD%92%E4%B8%8E-softmax-%E5%9B%9E%E5%BD%92)。

### 自回归生成

对序列，概率链式法则给出：

$$
p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

生成时先抽取第一个元素，再将已生成前缀作为条件抽取下一个元素，直到结束标记或达到长度上限。每一步输出类别概率，但整体任务是生成一个序列。

下面用手工给定的转移概率演示按条件采样。只有前一个词参与条件，是一阶 Markov 简化，不是完整语言模型。

```python
import numpy as np

rng = np.random.default_rng(42)
words = np.array(['我', '学习', '休息', '<EOS>'])
transition = np.array([
    [0.0, 0.8, 0.2, 0.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
    [0.0, 0.0, 0.0, 1.0],
])
current = 0
sequence = [words[current]]
for _ in range(3):
    current = rng.choice(len(words), p=transition[current])
    if current == 3:
        break
    sequence.append(words[current])
print(' '.join(sequence))
```

可能输出“我 学习”或“我 休息”，其概率分别为 0.8 和 0.2。始终选最大概率的贪心解码与按概率采样不同，后者能够得到不同结果。

### 条件生成与其他生成机制

翻译、根据文字生成图像、看图回答问题，都可以视为在条件输入下生成输出。输入是条件，输出本身可能是长序列或高维图像。

模型并非只有自回归一种生成方式。VAE 通过潜变量和解码器建模；GAN 学习从噪声到数据的采样映射；扩散模型通过逐步去噪生成数据。这些模型的训练目标和采样过程不同，不能都写成普通分类交叉熵。

在经典分类语境中，“生成式/判别式”常指联合分布与条件决策的区别；在现代生成任务中，“条件生成模型”也建模条件分布。判断时应结合它生成的对象与任务，而不是只看公式中有没有条件竖线。

### 参考资料

- [Ng、Jordan：On Discriminative vs. Generative Classifiers](https://papers.nips.cc/paper/2001/hash/7b7a53e239400a13bd6be6c91c4f6c4e-Abstract.html)
- [Dive into Deep Learning：Language Models](https://d2l.ai/chapter_recurrent-neural-networks/language-model.html)

## 对比学习：正负样本、温度与 InfoNCE

### 正样本与负样本

对比学习训练表示，使相关样本之间的相似度高于不相关候选。

以图像为例，同一原图经过两次增强得到两个视图，可以构成正样本对。其他原图的视图作为负样本候选。这里的“正”表示希望建立关联，不是分类任务中的类别编号 1。

通常先用编码器 $f_\theta$ 得到表示 $\mathbf h=f_\theta(\mathbf x)$，有时再经过投影头 $g_\phi$ 得到用于计算对比损失的 $\mathbf z$。下游任务使用哪一层表示取决于方法，不能把投影头的输出一概当成最终特征。

正样本关系可以来自同一对象的不同视图、相邻时间片、同类标签或图文配对。增强方式决定哪些变化被视为不影响语义，需要与任务匹配。

### 相似度与温度

对非零表示做 L2 归一化 $\bar{\mathbf z}=\mathbf z/\|\mathbf z\|_2$，则两个归一化向量的内积就是余弦相似度。

设锚点为 $\mathbf q$，候选为 $\mathbf k_j$，定义相似度 $s_j=\bar{\mathbf q}^\mathsf T\bar{\mathbf k}_j$。将 $s_j/\tau$ 作为分类分数，$\tau>0$ 称为温度。

温度较小，候选之间相同的相似度差会变成更大的分数差，Softmax 更集中；温度较大，分布更平缓。降低温度不保证学习更好，它也可能放大难负样本和错误配对的影响。

### InfoNCE 形式

假设一个锚点有一个正候选，其编号为 $j^+$，其余为负候选。一种常用损失为：

$$
\ell=-\log\frac{\exp(s_{j^+}/\tau)}{\sum_j\exp(s_j/\tau)}.
$$

分母包含正候选和全部负候选。它相当于在候选集合中进行分类，要求识别真正的正样本。负候选不只是让向量“远一点”，它们还决定了识别任务有多难。

令 $p_j=\operatorname{softmax}(\mathbf s/\tau)_j$，对相似度的导数为：

$$
\frac{\partial\ell}{\partial s_j}=\frac{p_j-\mathbf1[j=j^+]}{\tau}.
$$

正候选梯度不大于零，负候选梯度不小于零；沿负梯度更新会提高正候选相似度、降低负候选相似度。完整参数梯度还要继续经过内积、归一化与编码器，不能停在这个公式。

#### 示例：从三个候选中找匹配

- 输入：余弦相似度为 `[1, 0, -1]`，正候选为第 0 个，$\tau=0.5$。
- 分类分数：`[2, 0, -2]`。
- 概率：约为 `[0.8668, 0.1173, 0.0159]`。
- 损失：约为 `0.142932`。

```python
import numpy as np

similarities = np.array([1.0, 0.0, -1.0])
temperature = 0.5
logits = similarities / temperature
shifted = logits - logits.max()
log_p = shifted - np.log(np.exp(shifted).sum())
probabilities = np.exp(log_p)
loss = -log_p[0]
gradient = (probabilities - np.array([1.0, 0.0, 0.0])) / temperature
print(probabilities, loss)
print(gradient)
```

梯度约为 `[-0.2664, 0.2346, 0.0318]`，更像正样本的那个负候选受到更大惩罚。若交换标签，把相似度最低的候选指定为正，损失会变为约 `4.142932`。

### 批内负样本

一批有 $N$ 对匹配数据，第一侧表示矩阵为 $Q\in\mathbb R^{N\times d}$，第二侧为 $K\in\mathbb R^{N\times d}$。每行归一化后计算 $S=QK^\mathsf T/\tau$，形状为 $(N,N)$。

假设第 $i$ 行只与第二侧第 $i$ 行匹配，那么对角线是正样本，非对角线是负候选。每行的目标类别就是行号。

```python
import torch
import torch.nn.functional as F

q = torch.tensor([[1.0, 0.0], [0.0, 1.0]], requires_grad=True)
k = torch.tensor([[1.0, 0.0], [0.0, 1.0]], requires_grad=True)
logits = F.normalize(q, dim=1) @ F.normalize(k, dim=1).T / 0.5
targets = torch.arange(len(q))
row_loss = F.cross_entropy(logits, targets)
column_loss = F.cross_entropy(logits.T, targets)
loss = (row_loss + column_loss) / 2
loss.backward()
print(logits.detach())
print(loss.item())
print(q.grad)
```

分数矩阵为 `[[2, 0], [0, 2]]`，平均双向损失约为 `0.126928`。转置后逐行分类表示反过来从第二侧检索第一侧；这演示了配对式双向目标，完整 CLIP 的结构与训练安排留在多模态模块。

这里向量均非零。`F.normalize` 还通过一个很小的分母下限处理数值情况，但零向量不能据此解释为具有定义良好的余弦方向。

### SimCLR 的两视图结构

对 $N$ 张原图各生成两个视图，共有 $2N$ 个表示。对每个锚点，同一原图的另一视图为正样本，其余原图的 $2N-2$ 个视图为负样本；锚点自身从分母排除。因此每个锚点实际比较 $2N-1$ 个候选。

若表示排列为 `[视图A的N个, 视图B的N个]`，第 $i$ 个锚点的正样本编号为 $(i+N)\bmod 2N$。

```python
import torch
import torch.nn.functional as F

z = torch.tensor([[1.0, 0.0], [0.0, 1.0], [0.9, 0.1], [0.1, 0.9]], requires_grad=True)
normalized = F.normalize(z, dim=1)
scores = normalized @ normalized.T / 0.5
self_mask = torch.eye(len(z), dtype=torch.bool)
scores = scores.masked_fill(self_mask, float('-inf'))
targets = (torch.arange(len(z)) + len(z) // 2) % len(z)
loss = F.cross_entropy(scores, targets)
loss.backward()
print(targets)
print(loss.item())
```

目标编号为 `[2, 3, 0, 1]`，自身分数被屏蔽。不能直接把对角线当正样本，否则模型只需识别“自己与自己相同”。

### 负样本、坍塌与评估

如果所有表示都相同，各候选难以区分；对 $K$ 个等分数候选，单正样本损失为 $\log K$。对比目标要求建立差异，但不能因此声称任何优化过程都不会停在坍塌状态。

同一批中的其他样本可能实际语义相同，此时把它当负样本会形成假负样本。多正样本任务需要重新定义标签与损失，不能继续假设只有对角线正确。

更大的候选集合提供更多比较，也消耗更多内存。计算全部两两相似度需要约 $O(N^2d)$ 时间、$O(N^2)$ 分数存储；它还可能引入更多假负样本。

训练对比损失下降不自动等于下游质量提高，应检查冻结特征的分类效果或实际检索指标。InfoNCE 与互信息下界的联系还依赖采样和分布假设，不能把任意批内对比损失值直接报告为真实互信息。

### 参考资料

- [Contrastive Predictive Coding](https://arxiv.org/abs/1807.03748)
- [SimCLR](https://arxiv.org/abs/2002.05709)
- [CLIP](https://arxiv.org/abs/2103.00020)

## 迁移学习：预训练、冻结与微调

### 预训练与下游任务

迁移学习利用一个任务或数据域中学到的参数、表示，帮助另一个任务。例如先在大量图像上学习通用视觉特征，再用少量花卉图片训练品种分类器。

预训练（Pretraining）是获得初始模型的阶段；下游任务是随后实际需要解决的任务。预训练可以使用监督、自监督等方式，微调也不限定必须使用人工类别标签。

将模型写成 $\hat{\mathbf y}=g_\phi(f_\theta(\mathbf x))$。$f_\theta$ 是特征提取器或主干，$g_\phi$ 是任务头。迁移时可以保留主干，替换不匹配的输出头。

### 三种常见训练方式

| 方式 | 更新哪些参数 | 适用考虑 |
| --- | --- | --- |
| 冻结特征、训练任务头 | 只更新 $\phi$ | 数据少、资源有限，先检验特征是否有用 |
| 部分微调 | 更新任务头及主干的一部分 | 兼顾适应性与训练成本 |
| 全量微调 | 更新全部 $\theta,\phi$ | 希望主干也适应目标数据，但更易过拟合或遗忘 |

Linear Probe 特指冻结表示后训练线性预测头；若训练的是复杂非线性头，就不应简单称为线性探测。微调通常给预训练主干更小的学习率，但具体大小仍需验证。

从零训练提供一个重要基线：若迁移后反而更差，可能存在负迁移，即来源模型的知识或归纳偏好不适合目标任务。

### 冻结参数与评估模式

设置 `requires_grad=False` 使参数不参与梯度求解，但不会自动把 Dropout 或 BatchNorm 切到评估模式。

若要求主干完全固定，还应根据模型结构控制 `eval()`：BatchNorm 的运行均值和方差属于状态，即使不更新可训练参数，也可能在训练模式中改变。冻结参数与冻结运行状态是两个操作。

下面使用已明确设定权重的小型主干演示接口。它不是从外部下载的预训练模型，不用于证明迁移效果。

```python
import torch
from torch import nn

torch.manual_seed(42)
backbone = nn.Linear(2, 2)
with torch.no_grad():
    backbone.weight.copy_(torch.eye(2))
    backbone.bias.zero_()
backbone.requires_grad_(False)
backbone.eval()
head = nn.Linear(2, 2)
optimizer = torch.optim.SGD(head.parameters(), lr=0.1)
X = torch.tensor([[-1.0, 0.0], [1.0, 0.0]])
y = torch.tensor([0, 1])
before = backbone.weight.detach().clone()

with torch.no_grad():
    features = backbone(X)
head.train()
for _ in range(100):
    optimizer.zero_grad()
    loss = nn.functional.cross_entropy(head(features), y)
    loss.backward()
    optimizer.step()
print(torch.equal(before, backbone.weight))
print(head(features).argmax(dim=1))
```

输出 `True` 和类别 `[0, 1]`。主干固定且本例没有随机增强，可以提前缓存特征；若每轮输入视图变化或准备更新主干，则不能复用这份缓存。

### 解冻后继续微调

解冻后需要让优化器包含新加入训练的参数，并重新计算主干输出。仅设置 `requires_grad=True` 不会把参数自动加入一个只管理任务头的优化器。

下面接续上一段，显式新建优化器，主干学习率低于任务头。这里新建意味着优化器历史状态也重新开始。

```python
backbone.requires_grad_(True)
backbone.train()
head.train()
optimizer = torch.optim.SGD([
    {'params': backbone.parameters(), 'lr': 0.01},
    {'params': head.parameters(), 'lr': 0.1},
])
optimizer.zero_grad()
logits = head(backbone(X))
loss = nn.functional.cross_entropy(logits, y)
loss.backward()
optimizer.step()
print(backbone.weight.grad is not None)
```

输出 `True`。此时主干前向不能放在 `no_grad()` 中，否则它的参数梯度会被切断。若冻结模块之前存在需要训练的输入模块，同样要考虑梯度是否必须穿过这个冻结模块；冻结权重不总意味着整个前向都能关闭梯度。

### 数据与任务匹配

迁移时核对输入尺寸、归一化、通道顺序、词表和特殊 Token。已有权重学习的是特定输入约定，错误预处理会破坏表示。

替换分类头时核对类别数与编号映射。类别名称相似也不意味着来源模型的第 0 类就是目标任务的第 0 类。

模型在新任务上更新后，可能损失原任务能力，称为灾难性遗忘。保留原能力有要求时，需要同时评估原任务和新任务，而不是只看微调集上的提升。

参数高效微调只训练少量新增或选定参数，例如 Adapter、LoRA。它减少需要更新和保存的参数，但不意味着主干前向和激活内存全部消失；具体结构留在语言模型微调章节。

### 评估迁移效果

使用相同目标数据划分，比较从零训练、冻结特征和微调。分别调整合理的训练配置，记录训练参数量、资源与验证表现。若用测试集决定冻结哪些层，测试集已经参与模型选择。

本节训练状态操作依赖[自动微分基础](./numpy-and-pytorch.md#%E6%95%B0%E7%BB%84%E4%B8%8E%E5%BC%A0%E9%87%8F%E5%BD%A2%E7%8A%B6)，模型头的计算见[MLP](./neural-network-fundamentals.md#%E5%A4%9A%E5%B1%82%E6%84%9F%E7%9F%A5%E6%9C%BA-%E7%BA%BF%E6%80%A7%E5%B1%82-%E6%BF%80%E6%B4%BB%E4%B8%8E%E5%89%8D%E5%90%91%E4%BC%A0%E6%92%AD)。

### 参考资料

- [PyTorch：Transfer Learning for Computer Vision](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
