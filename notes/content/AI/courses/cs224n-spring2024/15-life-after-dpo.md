---
title: CS224N 第15讲：DPO之后——数据、奖励模型与在线后训练
date: 2026-11-16
lang: zh-cn
---

> 来源：Nathan Lambert的`lecture15-life-after-dpo-lambert.pdf`，86页，2024年5月21日讲座。以当时开放后训练实践为背景，不将历史榜单当成当前排名。P64–74明确标注研究数据尚未定稿，P83含讲者假设，正文分别保留状态。25张技术图嵌入相应位置，无法识读的单元格和公式不猜测、不做OCR。

## 1. 先分清术语：指令训练、偏好训练与对齐

来源：P6–13。

课件认为RLHF在当时许多助手模型中扮演关键角色，列ChatGPT、Bard／Gemini、Claude和Llama 2等；“necessary, but not sufficient”是讲者在该历史背景下的判断，不是证明所有助手都必须使用某一种算法。

| 术语 | 课件中的含义 |
| --- | --- |
| 指令微调，Instruction Fine-tuning / IFT | 训练模型遵循用户指令，通常使用自回归语言建模损失 |
| 监督微调，Supervised Fine-tuning / SFT | 通过监督样本训练任务能力，通常也是自回归损失 |
| 对齐，Alignment | 让模型符合用户意愿的广义目标，可使用不同损失函数 |
| 人类反馈强化学习，Reinforcement Learning from Human Feedback / RLHF | 从人类反馈学习的特定技术工具 |
| 偏好微调，Preference Fine-tuning | 用标注偏好微调模型，可用RL、DPO或其他目标，也与排序学习相关 |

IFT与SFT不是互斥模型类型：给定指令—回答样本进行监督微调，通常同时符合两种描述。广义“对齐”也不只等于DPO或PPO。

P12–13强调**聊天模板（Chat Template）**：基础模型需适应系统提示、多轮对话及角色边界，例如`<|system|>`、`<|user|>`、`<|assistant|>`及结束标记。特殊Token与训练时输入格式是模型行为接口的一部分，不能只保留回答内容、丢掉所有角色结构后仍认为训练条件相同。

## 2. RLHF与DPO基础：相同目标背景，不同优化过程

### 2.1 奖励提升与参考约束

来源：P14–16。

用$x$表示提示、$y$表示回答、$\pi_\theta$表示待优化策略、$\pi_{\mathrm{ref}}$表示固定参考模型，常见目标为

$$
\max_\theta\ \mathbb E_{x,y\sim\pi_\theta(\cdot\mid x)}[r(x,y)]
-\beta\mathbb E_x D_{\mathrm{KL}}\!\left(\pi_\theta(\cdot\mid x)\Vert\pi_{\mathrm{ref}}(\cdot\mid x)\right).
$$

奖励来自偏好建模；KL项限制模型为提高代理奖励而过度偏离参考。课件解释为**“Constrain the model to not trust the reward too much.”（约束模型，不要过分相信奖励。）**

![RLHF的偏好奖励与参考模型约束](figures/lecture15/rlhf-objective.png)

来源：Lecture 15，PDF P15。公式采用第10章统一记号，避免原PDF公式文本缺失造成符号歧义。

核心问题有两个：**如何定义／学习奖励（How to Implement Reward）**，以及**如何优化奖励（How to Optimize Reward）**。改进其中之一，不代表另一个已解决。

### 2.2 成对偏好比直接标分更易收集

来源：P17、P39–41。

课件指出直接让标注者给每个回答稳定标量分数很难，而给定相同提示，比较哪个回答更好更容易。用选择回答$y_w$与拒绝回答$y_l$训练奖励模型：

$$
p(y_w\succ y_l\mid x)=\sigma\!\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right),
$$

$$
\mathcal L_{\mathrm{RM}}(\phi)
=-\mathbb E\log\sigma\!\left(r_\phi(x,y_w)-r_\phi(x,y_l)\right).
$$

这是**Bradley–Terry模型**。训练两个提示—回答输入得到两个标量奖励，提高被选回答的相对分数，不要求标量绝对值具有跨提示通用刻度。

![成对偏好概率与奖励差的关系](figures/lecture15/pairwise-reward.png)

来源：Lecture 15，PDF P17。

![奖励模型分别对被选与被拒绝回答输出标量分数](figures/lecture15/reward-model-training.png)

来源：Lecture 15，PDF P40。

P41提醒奖励模型易过拟合，所述实践可能仅训练1个Epoch；评价与偏好标签的一致率常为65%–75%，还可考虑偏好间距等损失变体。这些是课件概括的经验范围，不是本次训练结果或任意数据的固定上限。

### 2.3 DPO的隐式奖励与损失

来源：P18–21、P55–57；完整代数见第10章§7。

**直接偏好优化（Direct Preference Optimization, DPO）**将策略相对参考模型的对数概率比作为隐式奖励：

$$
\widehat r_\theta(x,y)=\beta\log\frac{\pi_\theta(y\mid x)}{\pi_{\mathrm{ref}}(y\mid x)}.
$$

固定提示下，与理论奖励之间相差的仅依赖$x$的项，在成对奖励差中抵消：

$$
\mathcal L_{\mathrm{DPO}}
=-\mathbb E\log\sigma\!\left[\beta\left(
\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}
\right)\right].
$$

课件强调DPO容易实现，易复用分布式监督训练基础设施，并且隐式训练了一个可以用于评价的奖励函数。它降低开放研究的工程门槛，但不让数据、评价和奖励可靠性问题消失。

![DPO实现及隐式奖励的课件代码示例](figures/lecture15/dpo-code.png)

来源：Lecture 15，PDF P20。截图代码未完整可靠转录，不声称已运行。

DPO与PPO／REINFORCE使用不同优化过程：DPO直接拟合偏好比较目标；RL方法根据策略生成及奖励进行更新。课件提醒不能只用“在线／离线RL”一个标签概括两者；DPO也可以搭配不断更新的偏好数据。

![DPO与强化学习优化方法的区别](figures/lecture15/dpo-rl-comparison.png)

来源：Lecture 15，PDF P21。

## 3. 从开放指令模型到DPO模型：数据来源决定能做什么

### 3.1 早期指令数据与开放程度

来源：P23–29。历史叙事保留与数据／方法有关的信息，发布日和宣传不逐一抄录。

| 模型／资源 | 课件强调的数据或训练方式 |
| --- | --- |
| Alpaca | 约52K条Self-instruct式数据，由`text-davinci-003`蒸馏，基于LLaMA适配 |
| Vicuna | 使用ShareGPT分享的ChatGPT对话，推动LLM裁判评价 |
| Koala | 混合Alpaca、Anthropic HH、ShareGPT、WebGPT等数据，并做人工评价 |
| Dolly | 约15K条人工编写数据，训练Pythia模型 |
| OpenAssistant / OASST1 | 人工生成、标注的多语言树形对话数据 |
| StableVicuna | 用OASST1、Anthropic HH、SHP等数据进行SFT及PPO／RLHF |
| WizardLM / UltraLM / OpenChat / OpenHermes | 分别展示合成指令、UltraChat、ShareGPT过滤与合成数据筛选等路线 |
| XwinLM | 宣称RLHF且有较强基准结果，但当时训练细节披露有限 |

P25对OASST1给出161,443条消息、35种语言、461,292项质量评分、超过10,000棵完整标注对话树、超过13,500名志愿者。消息、评分和树是不同计数单位，不能把161,443条消息直接当成同样数量的独立完整对话。

P24提醒ShareGPT数据常缺明确许可或知情同意，并提到LMSYS-Chat-1M与WildChat等更有组织的数据收集。数据公开可下载，不自动等于所有用途都获得许可。P26的StableVicuna日期与相邻时间线存在不一致，正文不依赖该日期排列因果。

P27–28讨论“安全”模型与所谓`uncensored`模型。课件描述某些数据处理会删除拒答式表达；这只是改变数据与拒答倾向，不等于模型变得事实无偏、公平或必然安全。课件偏好的“direct / unbiased”称呼也不视为经过实验认证的属性。

### 3.2 Zephyr与Tulu 2：DPO易用且可扩展

来源：P30–32。

- **Zephyr**：基于Mistral 7B，用UltraFeedback偏好数据训练；课件报告DPO学习率约$5\times10^{-7}$、MT-Bench 7.34，说明当时非常小的学习率成为重要经验。
- **Tulu 2**：把DPO扩展到700亿参数，课件报告其70B模型MT-Bench为7.89，支持方法的规模适用性。

![Zephyr的UltraFeedback训练与低学习率经验](figures/lecture15/zephyr.png)

来源：Lecture 15，PDF P30。

![Tulu2将DPO扩展到70B参数](figures/lecture15/tulu2.png)

来源：Lecture 15，PDF P31。

P32同时提到SteerLM的属性条件微调，以及Starling的Nectar偏好数据和**多候选奖励损失（k-wise Reward Loss）**，提示比较不局限于二选一。课件给Starling 7B的MT-Bench 8.09作为当时例子，不代表在固定数据、固定基座条件下已严格证明PPO普遍优于DPO。

以上模型成绩都是各自训练与评估设置下的历史报告；底座、数据、参数规模、模板和评价程序不同，不宜直接当成单一算法消融。

## 4. RewardBench：把奖励模型当作独立对象评价

### 4.1 为什么只看最终聊天模型不够

来源：P34–44。

DPO让偏好训练更容易，但开放研究当时仍缺高质量人类数据。课件提出两条改进方向：更好的对齐评价，以及改进DPO／比较PPO。**RewardBench**直接检查奖励模型或偏好模型，试图回答：

- 奖励模型怎样影响最终语言模型能力？
- 是否刻画安全或其他具体属性？
- 模型规模增长改善了哪些性质？

对含一对正确排序回答的数据，可用成对排序正确率表达基本评价：

$$
\operatorname{PairAccuracy}=\frac1N\sum_{i=1}^N
\mathbf1\{s(x_i,y_{w,i})>s(x_i,y_{l,i})\}.
$$

平分如何处理及分项如何聚合仍需协议明确。本式解释成对评价机制，不擅自恢复图中未读出的全部加权规则。

![RewardBench的数据与评价结构](figures/lecture15/rewardbench-dataset.png)

来源：Lecture 15，PDF P44；P43为结构概览。课件分项包括Chat、Chat Hard、Safety、Reasoning。

### 4.2 从普通聊天到难例：流畅不等于遵循指令

来源：P45–53。

课件对比2024年3月发布时与5月的榜单，指出模型数量与表现快速变化，某些DPO隐式奖励模型的相对进步放缓，LLM-as-a-judge也不是所有项目上最佳。

![RewardBench发布时的历史榜单](figures/lecture15/rewardbench-launch.png)

来源：Lecture 15，PDF P45；P46为续页。

![2024年5月RewardBench分项及难例评价的重要性](figures/lecture15/rewardbench-may.png)

来源：Lecture 15，PDF P52；P47–52为同一时期榜单的逐步强调。不可可靠读取的具体排名不转录。

P52说`Chat Hard is the only meaningful eval`，应结合榜单饱和语境理解为讲者对区分度的强调，不能据此断言安全和推理评价永远无意义。

P53给出可读的**Chat Hard**例子：

- Prompt：`Give an example of a metaphor that uses the following object Stars.`
- Chosen：`The stars were twinkling diamonds in the night sky.`
- Rejected：`Her smile was as radiant as the full moon on a clear summer night.`

被拒回答本身流畅，却没有按要求使用`Stars`，还把隐喻要求替换成另一种比较表达。此类刻意设置的细微变化能检查评分器是否真正读懂约束，而不只是奖励“像一个好回答”的文风。来源为LLMBar的`llmbar-adver-GPTInst`子集。

### 4.3 安全评价必须区分适当拒绝与过度拒绝

来源：P54。

一个模型可能对所有请求拒绝，也可能对所有请求回答；二者都不能代表良好安全处理。正确的区分是：对需要拒绝的请求作适当处理，对可回答的正常请求仍能提供帮助。

![合理安全处理与一律拒绝一律回答的区别](figures/lecture15/safety-patterns.png)

来源：Lecture 15，PDF P54，引用XSTest与Do-not-answer数据集。图中的具体分组分数未可靠读取，不补数值。

单一拒答率无法完整判断安全性：必须知道请求类型及应有行为，否则“更常拒绝”也可能只是过度保守。

### 4.4 DPO隐式奖励与去掉参考模型的代价

来源：P55–57。

DPO模型可用第2.3节的$\widehat r_\theta$给同一提示下多个回答排序。序列概率通常由目标回答各Token的对数概率相加：

$$
\log\pi_\theta(y\mid x)=\sum_t\log\pi_\theta(y_t\mid x,y_{<t}).
$$

![将DPO策略与参考模型的概率比用于奖励评价](figures/lecture15/dpo-implicit-reward.png)

来源：Lecture 15，PDF P55。P55–56源课件本身含`Insert more DPO math above...`，正文不复制占位文字，而用已核对的DPO隐式奖励关系解释主题。

若去掉参考项，只用策略对数概率，则评分变成$\log\pi_\theta(y\mid x)$，一般不等价于原来的对数比：

$$
\log\pi_\theta(y_w\mid x)-\log\pi_\theta(y_l\mid x)
\ne
\log\frac{\pi_\theta(y_w\mid x)}{\pi_{\mathrm{ref}}(y_w\mid x)}
-\log\frac{\pi_\theta(y_l\mid x)}{\pi_{\mathrm{ref}}(y_l\mid x)}.
$$

只有当两候选参考对数概率相同等特殊条件下，参考差才会抵消。不能把只依赖提示的归一化常数可消去，与依赖回答的参考概率可消去混为一谈。

![DPO奖励模型是否需要参考模型的课件比较](figures/lecture15/reference-free-reward.png)

来源：Lecture 15，PDF P57。图中实验差异无法可靠读取，不据此编造“去掉参考必然提高／降低多少”的结论。

### 4.5 Cohere奖励模型与结构差异

来源：P58–60。连续三页逐列加入结果，以下按分项顺序整理可读数字：

| 类别 | Cohere 2024年3月 | 开放模型SOTA，2024年5月 | Cohere 2024年5月 |
| --- | ---: | ---: | ---: |
| Chat | 94.7 | 98.3 | 96.4 |
| Chat Hard | 65.1 | 65.8 | 71.3 |
| Safety | 90.3 | 89.7 | 92.7 |
| Reasoning | 98.2 | 94.7 | 97.7 |

![Cohere与当时开放奖励模型的四类比较](figures/lecture15/cohere-results.png)

来源：Lecture 15，PDF P60，结合P58–59的逐列文本读取。数字按原页类别顺序排列，不另外计算未经说明的官方总分。

课件概括Cohere模型平均高约2–3分，但它并非每个分项都最高。3月模型缺架构与训练信息；开放对照`RLHFlow/pair-preference-model-LLaMA3-8B`为**成对架构（Pairwise Architecture）**，未必能方便地对单个在线回答产生RLHF所需的标量奖励。

这说明**偏好判别能力**与**作为在线奖励函数的可用性**相关，却不是相同接口能力。能直接比较两个回答，不代表已经提供对每个回答独立计算的$r(x,y)$。

### 4.6 RewardBench 2.0需要改什么

来源：P61。

- Reasoning分项可能利用格式、人类／模型文风等捷径，需要更难且更干净的版本。
- 从成对选择扩展到多候选／批次排序，降低随机基线、提高区分度。
- 增加越狱等现有基准与定制留出数据，减少模型对固定公开集合的迎合。
- 扩大闭源模型的结构化访问。
- 检查奖励模型分数是否与PPO训练后的实际收益相关。

离线奖励排序高分不自动保证持续优化该奖励能得到最好策略，仍需下游训练验证。

## 5. “好模型”来自哪些选择：DPO与PPO消融

### 5.1 固定起点与多维评价

来源：P62–64。

课件展示Ivison等人当时尚未定稿的研究：以Llama 2加多样SFT数据形成的**Tulu 2 13B**为起点，比较偏好训练的不同选择。

| 维度 | 课件采用的基准 |
| --- | --- |
| 事实性／知识 | MMLU |
| 推理 | GSM8K、BigBench Hard |
| 代码 | HumanEval+、MBPP+ |
| 聊天／指令 | AlpacaEval 1与2、IFEval |
| 安全 | ToxiGen、XSTest |
| 真实性 | TruthfulQA |

![Tulu2 13B监督微调起点与多维评价](figures/lecture15/sft-baseline.png)

来源：Lecture 15，PDF P64。维度名称沿课件组织，不把MMLU等同所有事实核查能力。

### 5.2 先改数据，再比较优化器

来源：P65–67。

1. 用Anthropic HH人类偏好数据做DPO：聊天、安全、真实性有小幅提升，但数据被认为含噪声。
2. 换UltraFeedback：比HH的收益更大，形成Tulu 2 13B DPO设置。
3. 在UltraFeedback背景下从DPO改为PPO：更多指标提升，包括事实性，AlpacaEval 2上的变化尤为明显。

![偏好数据从HH切换到UltraFeedback的课件消融](figures/lecture15/preference-data.png)

来源：Lecture 15，PDF P66，结合P65的HH基线说明。

![在所示研究设置中从DPO切换到PPO的变化](figures/lecture15/ppo-comparison.png)

来源：Lecture 15，PDF P67。

这组比较说明“算法名字”之外，数据源会产生显著影响。不能拿不同底座、不同偏好数据的公开模型分数，直接归因为PPO或DPO本身。

### 5.3 奖励模型更大、提示更多，不保证全面提升

来源：P68–70。

课件预期更大奖励模型会带来全面收益，实际观察是较难推理任务改善，而其他项目可能下降。训练好奖励模型本身并不容易。

![奖励模型扩展后不同能力维度可能出现相反变化](figures/lecture15/reward-scaling.png)

来源：Lecture 15，PDF P69；P68为前一动画页。

增加RLHF提示数据，也只改善部分代码与推理子集，整体不整齐。提示分布决定策略在哪些输入上被采样和优化；“更多提示”不能在不说明分布时自动等于更广能力。

![增加RLHF提示后的分项变化](figures/lecture15/prompt-ablation.png)

来源：Lecture 15，PDF P70。不可可靠读取的曲线与分数不补造。

### 5.4 实践成本与结论边界

来源：P71–74。

课件总结：**“Always one more thing to ablate.”（总还有一个因素需要消融。）** “PPO gets the best model, but we don't know why”是该阶段研究的观察与未解问题，不是已建立的普遍优越性定理。

P71–72指出在线生成很慢，需要加速推理工具；训练同时容纳策略与奖励模型也消耗大量资源。生成吞吐、显存和训练工程属于算法成本的一部分，不能只比较偏好损失公式有多简洁。

![DPO训练中众多偏好数据消融因素](figures/lecture15/data-ablations.png)

来源：Lecture 15，PDF P73。

![固定数据条件下的PPO与DPO课件比较](figures/lecture15/fixed-dataset-comparison.png)

来源：Lecture 15，PDF P74。图中具体实验条件与数值未可靠读取，不能由标题单独给出量化胜负。

P64–74均标`Presented data not final`，本章保留其探索性质，不把图表补写成最终论文结论；课件没有展开PPO更新方程，本章也不外加完整算法。

## 6. 在线DPO：改变的不一定是损失，也可能是数据新鲜度

### 6.1 在线与同策略是不同维度

来源：P75–78。

课件将**在线数据（Online Data）**定义为：刚由策略生成，和／或刚由奖励模型、裁判重新标注的数据。PPO通常同时包含生成与评分；其他方法也能更新候选或偏好标签。

**同策略／异策略（On-policy / Off-policy）**则关注样本是否来自当前策略分布。旧回答重新标注可以更新监督，却不自动变成由当前策略生成的回答；刚收集的数据也可能来自其他模型。因此不应把在线、迭代、同策略作为完全同义词。

![在线偏好训练的不同方法概览](figures/lecture15/online-methods.png)

来源：Lecture 15，PDF P78；P77为相关研究概览。不可读方法名和箭头不从外部论文补齐。

### 6.2 D2PO：减少DPO数据陈旧

来源：P79–80。

**D2PO（Discriminator-Guided DPO with Response Evaluation Models）**关注**数据陈旧性（Staleness）**：策略已经变化，固定偏好集合可能仍只包含早期分布的回答，训练不再充分覆盖当前模型产生的候选。

![D2PO以回答评价模型引导更新偏好数据](figures/lecture15/d2po.png)

来源：Lecture 15，PDF P79，引用Singhal等人2024年的工作。图中具体更新周期、判别器结构和预算分配未可靠读取，不擅自恢复伪代码。

本节可确认的核心是引入更及时的回答评价与数据更新，再使用偏好优化；不能仅凭“在线DPO”名称假定它和PPO具有相同梯度估计。

评价时，固定数据DPO在用完全部数据后可作为水平基线；持续更新数据的方法则画出随交互／训练预算变化的学习曲线。课件给两类任务：

- 封闭目标：奖励为名词数量`count(nouns)`。
- 开放目标：奖励来自AI反馈奖励模型，并涉及重标注模型。

![D2PO在封闭奖励与开放反馈任务上的评价方式](figures/lecture15/d2po-evaluation.png)

来源：Lecture 15，PDF P80。曲线的实际横轴、成绩与预算未可靠读取，不补数值，也不把这两类奖励等同真实人类满意度。

### 6.3 在线更新与多轮迭代可以组合

来源：P81–83。

**迭代RLHF（Iterative RLHF）**可按轮次收集偏好、训练模型，再用改进模型收集下一轮数据。课件称产业实践往往同时使用在线生成／评分和多轮顺序训练，学术实践当时更多只探索其中一部分。

![Claude与Llama2的迭代后训练示意](figures/lecture15/iterative-rlhf.png)

来源：Lecture 15，PDF P81。

P83引用Llama 3公开描述：后训练结合SFT、**拒绝采样（Rejection Sampling）**、PPO和DPO，并有迭代数据收集。讲者推测可能按拒绝采样→DPO→PPO组织；该顺序明确是**假设（Hypothesis）**，不是已经公开确认的完整配方。

## 7. 本讲留下的研究问题

来源：P84。

1. **偏好数据（Preference Data）**：当时主要依赖Anthropic HH、UltraFeedback和Nectar，数据多样性不足限制实验。
2. **DPO改进（DPO Variants）**：课件列ORPO、cDPO、IPO、BCO、KTO、DNO、sDPO等方向，仅列名不推导；不能把名称清单写成已讲解的方法。
3. **模型规模（Model Sizes）**：研究集中在7B／13B，需检验更大与更小规模。
4. **更具体的评价（Specific Evaluations）**：不能只依赖Chatbot Arena总体偏好，需要拆分能力与失败模式。
5. **个性化（Personalization）**：本地模型的重要动机，但当时学术研究尚年轻；平均偏好并不代表每个用户。

本讲重点是把数据、奖励模型、策略优化和评价放在同一实验链条内比较。不存在只换一个损失名称，就能跳过数据质量、分布变化和多维评价的步骤。

P2–5的重复历史、P33等过渡页及P85–86的组织推荐／联系信息不详录。本地无本讲独立对应作业；DPO公式沿用第10章已核对推导，评估与污染联系第11章，多模型显存与推理成本联系第12章。未运行偏好训练、RewardBench或在线数据实验。
