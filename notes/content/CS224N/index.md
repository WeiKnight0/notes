---
title: CS224N Spring 2024：自然语言处理与深度学习
date: 2026-11-16
lang: zh-cn
page: index
---

以 Stanford CS224N Spring 2024 的 18 讲课件为主线，结合对应作业整理。章节内部按知识逻辑组织，标注 PDF 物理页码；关键术语保留中英双语，公式使用 LaTeX。课程材料中的历史实验结果按原课件记录，不视为当前模型排名或最新结论。

## 章节与进度

18章正文均已整理，按课程顺序阅读即可。可读取技术内容与相关作业已覆盖；无法识读的图片或演示按要求跳过并注明，不做OCR。共保留278张知识图及技术截图，图下注明来源页码。

| 讲次 | 主题 | PPT 页数 | 整理状态 |
| --- | --- | ---: | --- |
| 01 | [词向量入门（Introduction and Word Vectors）](01-word-vectors.md) | 40 | 可读正文与作业已整理；无法识读图像按用户要求跳过 |
| 02 | [词向量、词义与神经分类器（Word Vectors, Word Senses, and Neural Classifiers）](02-word-vectors-classifiers.md) | 47 | 全讲可读正文、作业衔接及9张知识图已整理 |
| 03 | [神经网络梯度与反向传播（Neural Network Gradients and Backpropagation）](03-neural-network-gradients.md) | 85 | 全讲可读正文、A2训练机制及10张知识图已整理 |
| 04 | [依存句法分析（Dependency Parsing）](04-dependency-parsing.md) | 45 | 全讲可读正文、A2解析机制及9张知识图已整理 |
| 05 | [语言模型与 RNN（Language Models and Recurrent Neural Networks）](05-language-models-rnn.md) | 72 | 全讲可读正文、梯度问题及11张知识图已整理 |
| 06 | [LSTM 与神经机器翻译（LSTM RNNs and Neural Machine Translation）](06-lstm-neural-machine-translation.md) | 56 | 全讲可读正文、A3基础结构及9张知识图已整理 |
| 07 | [Attention、翻译评估与研究实践（Attention and Final Projects; Practical Tips）](07-attention-evaluation-practice.md) | 73 | 全讲可读技术正文、A3分析及9张知识图已整理 |
| 08 | [Transformer与自注意力（Transformers）](08-transformers.md) | 61 | 全讲可读正文、A4注意力/位置推导及13张知识图已整理 |
| 09 | [预训练、BERT、T5与GPT（Pretraining）](09-pretraining.md) | 64 | 全讲可读正文、A4/minBERT技术衔接及13张知识图已整理 |
| 10 | [提示、指令微调与RLHF/DPO（Prompting, Instruction Finetuning, and DPO/RLHF）](10-prompting-instruction-preferences.md) | 94 | 全讲可读正文、偏好优化推导及15张知识图已整理 |
| 11 | [基准与评估（Benchmarking and Evaluation）](11-benchmarking-evaluation.md) | 65 | 全讲可读正文、评价协议与局限及14张知识图已整理 |
| 12 | [高效神经网络训练（Efficient Neural Network Training）](12-efficient-training.md) | 65 | 全讲可读正文、混合精度/分片/LoRA及20张知识图已整理 |
| 13 | [语音脑机接口（Speech Brain–Computer Interfaces）](13-speech-brain-computer-interfaces.md) | 75 | 可读正文、CTC/两遍解码/WER及26张技术图已整理；不可读演示按要求跳过 |
| 14 | [推理与智能体（Reasoning and Agents）](14-reasoning-agents.md) | 75 | 可读正文、推理/反事实/ReAct/BAGEL及25张技术图已整理 |
| 15 | [DPO之后：数据、奖励模型与在线后训练（Life after DPO）](15-life-after-dpo.md) | 86 | 可读正文、RewardBench/PPO对照/在线数据及25张技术图已整理 |
| 16 | [文本CNN与树递归网络（ConvNets for NLP and Tree Recursive Neural Networks）](16-cnn-tree-recursive-networks.md) | 60 | 可读正文、卷积数值核算/TreeRNN/RNTN及22张知识图已整理 |
| 17 | [以人为中心的NLP（Human-Centered NLP）](17-human-centered-nlp.md) | 67 | 可读正文、方言/信任/反馈更新机制及21张技术图已整理 |
| 18 | [NLP、语言学与哲学（NLP, Linguistics, and Philosophy）](18-nlp-linguistics-philosophy.md) | 65 | 可读正文、泛化/组合语义/意义与风险及19张知识图已整理 |

共 1,195 页。[逐页覆盖与材料问题记录](progress.md)区分“已提取”“已写入”“已核对”与“完成”，避免把文本提取当作阅读完成。

## 作业对应关系

- **A1：Exploring Word Vectors**：第 1–2 讲；共现矩阵、SVD、GloVe、相似度、类比与偏差。
- **A2：Word2Vec and Dependency Parsing**：第 1–5 讲；Naive Softmax 梯度、Adam、Dropout、转移式依存分析器。
- **A3：Neural Machine Translation**：第 5–7 讲；双向 LSTM、Attention、Mask、BLEU、Beam Search 和翻译错误分析。
- **A4：Self-Attention, Transformers, and Pretraining**：第 8–9 讲；多头注意力、置换与位置、Span Corruption、RoPE、知识访问。
- **默认项目 minBERT**：BERT 实现、情感分类、复述检测、语义相似度，以及训练和适配方法。

## 材料来源与使用范围

本地源目录：`D:/cs224n-spring2024/`。课程官网存档：[Stanford CS224N Spring 2024](https://web.stanford.edu/class/archive/cs/cs224n/cs224n.1246/)。

正文以本地课件为准，课程笔记用于核对公式和解释，作业补充标出来源和题号。图片来自相应课件，图下注明物理页码；原课件、图表和引用论文的版权归原作者所有。原始 PDF、作业代码和数据集不整体复制到本站。
