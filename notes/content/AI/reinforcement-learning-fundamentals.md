---
title: 强化学习基础
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## Agent–Environment 交互、轨迹与回报

### 强化学习解决什么问题

强化学习研究智能体如何通过与环境反复交互，选择动作以最大化长期累计奖励。训练数据不是预先固定的独立样本：智能体选择的动作会改变之后到达的状态，也会改变后续收集到的数据。

监督学习通常给出输入和目标标签；强化学习只从环境得到奖励，奖励可能延迟出现。智能体需要处理当前收益与长期结果、探索未知动作与利用已知好动作之间的关系。

### Agent 与 Environment

在时间步 $t$：

1. 环境处于状态 $S_t$，智能体收到观测 $O_t$；
2. 智能体按策略选择动作 $A_t$；
3. 环境执行动作，产生奖励 $R_{t+1}$；
4. 环境转移到 $S_{t+1}$，智能体收到 $O_{t+1}$。

索引写成 $R_{t+1}$ 是因为奖励由在 $S_t$ 执行 $A_t$ 后的转移产生。部分资料把同一奖励记为 $r_t$，阅读公式时必须先确认约定。

环境包括智能体无法直接控制的一切。机器人电机命令是动作，传感器读数是观测；游戏中按键是动作，屏幕或内部变量是观测。

### State 与 Observation

State 是足以描述环境当前情况、用于决定未来演化的信息。Observation 是智能体实际收到的信息：

$$
O_t\sim O(\cdot\mid S_t).
$$

完全可观测时可以令 $O_t=S_t$。部分可观测时，同一个观测可能对应多个真实状态，例如单张图像无法给出物体速度。此时策略可能需要观测历史、循环状态或信念状态，不能直接把观测当作完整环境状态。

### Action 与 Reward

Action 是智能体在当前时间步可选择的控制量。动作空间可以是离散的，如上下左右；也可以是连续的，如转向角和力矩。

Reward 是环境在一次转移后给出的标量反馈。它定义“希望优化什么”，不是对动作逐步提供正确答案。奖励设计错误时，智能体可能最大化代理指标却违背真实目标。

奖励的数值尺度会影响优化稳定性，但把全部奖励乘正常数通常不改变有限 MDP 的最优策略。加入依赖状态或动作的额外奖励则可能改变最优策略，不能只称为数值归一化。

### Policy

Policy 描述智能体在给定信息下如何选择动作。随机策略为：

$$
\pi(a\mid s)=\Pr(A_t=a\mid S_t=s),
$$

且对每个状态有 $\sum_a\pi(a\mid s)=1$。确定性策略写作 $A_t=\mu(S_t)$。

策略可以是表格、线性函数或神经网络。策略的输入若实际是观测，应写作 $\pi(a\mid o)$；不能因为算法代码把变量命名为 `state`，就认为环境完全可观测。

### Trajectory 与 Episode

一条轨迹（Trajectory）记录交互序列：

$$
\tau=(S_0,A_0,R_1,S_1,A_1,R_2,\ldots).
$$

Episode 是从初始状态到一次任务结束的有限轨迹，例如一局游戏。任务结束的状态称为 Terminal State。Episode 长度可以随机，不一定等于固定 Horizon。

有限时域问题规定最大决策步数 $H$。无限时域表示理论上持续交互，不是程序真的运行无限久。Continuing Task 可通过折扣、平均奖励或其他目标定义长期性能。

### Return 与 Discount

奖励是单步反馈，回报（Return）是从时间 $t$ 开始的累计未来奖励：

$$
G_t=R_{t+1}+\gamma R_{t+2}+\gamma^2R_{t+3}+\cdots,
$$

其中 $0\le\gamma\le1$ 是折扣因子。它满足递推关系：

$$
G_t=R_{t+1}+\gamma G_{t+1}.
$$

$\gamma$ 越小越强调近期奖励，越接近 1 越重视长期结果。折扣也能让有界奖励的无限和收敛；它不是“未来奖励一定不重要”的固定事实，而是任务目标的一部分。

```python
import torch

rewards = torch.tensor([1.0, 2.0, 3.0])
gamma = 0.5
returns = torch.empty_like(rewards)
future_return = 0.0
for step in range(len(rewards) - 1, -1, -1):
    future_return = rewards[step] + gamma * future_return
    returns[step] = future_return
print(returns)
```

结果为 `[2.75, 3.5, 3.0]`。在最后一步之后没有更多奖励，所以最后回报就是 3。

### 一个完整交互循环

下面的环境从位置 0 出发，动作 1 向右移动，到达位置 3 获得奖励 1 并终止。

```python
position = 0
trajectory = []
terminated = False
while not terminated:
    observation = position
    action = 1
    next_position = position + action
    reward = 1.0 if next_position == 3 else 0.0
    terminated = next_position == 3
    trajectory.append((observation, action, reward, next_position))
    position = next_position
print(trajectory)
```

轨迹包含三次转移，奖励序列为 `[0,0,1]`。策略在这里固定向右，因此没有发生学习；强化学习算法要利用这些转移改进后续策略。

### Termination 与 Truncation

Termination 表示任务在 MDP 意义下进入终止状态，如到达目标或失败。Truncation 表示任务因 MDP 外部限制提前停止，常见是时间上限。

两者都要求重置环境，但对 Bootstrap 的处理不同：真正终止后不存在后续任务价值，目标不加 $\gamma V(S_{t+1})$；仅因时间限制截断时，底层状态可能仍有后续价值，通常应 Bootstrap。把二者合成一个 `done` 会造成错误目标。

Gymnasium 的 `step` 返回 `(observation, reward, terminated, truncated, info)`，正是为了区分这两种结束原因。

### 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [Gymnasium Env API](https://gymnasium.farama.org/api/env/)

## MDP、价值函数与 Bellman 方程

### 马尔可夫性

若给定当前状态后，下一状态和奖励的分布不再依赖更早历史，则状态满足马尔可夫性：

$$
\Pr(S_{t+1},R_{t+1}\mid S_t,A_t,S_{t-1},A_{t-1},\ldots)
=\Pr(S_{t+1},R_{t+1}\mid S_t,A_t).
$$

马尔可夫性是对状态表示的要求，不是说现实没有历史影响。合格的状态已经把预测未来所需的历史信息编码进去。若遗漏速度、剩余资源等信息，同一表面观测下的未来分布仍依赖历史，就不是马尔可夫状态。

### MDP

马尔可夫决策过程（Markov Decision Process，MDP）通常写为 $(\mathcal S,\mathcal A,p,\gamma)$。其联合转移与奖励模型为：

$$
p(s',r\mid s,a)
=\Pr(S_{t+1}=s',R_{t+1}=r\mid S_t=s,A_t=a).
$$

由它可得到状态转移概率 $p(s'\mid s,a)$ 和期望即时奖励：

$$
r(s,a)=\mathbb E[R_{t+1}\mid S_t=s,A_t=a].
$$

环境可以是随机的：相同状态和动作不必总得到相同结果。策略也可以随机，因此轨迹概率同时由初始状态分布、策略和环境转移决定。

### POMDP

部分可观测马尔可夫决策过程（POMDP）在隐藏状态 $S_t$ 外增加观测 $O_t$ 及观测模型。智能体只看到 $O_t$，单个观测通常不满足马尔可夫性。

一种理论处理是维护信念状态 $b_t(s)=\Pr(S_t=s\mid O_{0:t},A_{0:t-1})$。实践中也可用帧堆叠、RNN 或 Transformer 汇总历史，但这些方法不保证得到精确信念状态。

### 状态价值函数

策略 $\pi$ 下，状态价值是从状态 $s$ 开始并继续遵循 $\pi$ 的期望回报：

$$
V^\pi(s)=\mathbb E_\pi[G_t\mid S_t=s].
$$

它不是一次轨迹的实际回报，而是对策略和环境随机性的期望。同一状态的单次 $G_t$ 可以高于或低于 $V^\pi(s)$。

### 动作价值函数

动作价值固定第一步执行 $a$，之后遵循 $\pi$：

$$
Q^\pi(s,a)=\mathbb E_\pi[G_t\mid S_t=s,A_t=a].
$$

二者关系为：

$$
V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a).
$$

Advantage 比较某动作与策略在该状态的平均水平：

$$
A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s).
$$

因此 $\sum_a\pi(a\mid s)A^\pi(s,a)=0$。正 Advantage 表示该动作优于当前策略平均动作，不代表即时奖励一定为正。

### Bellman Expectation Equation

利用 $G_t=R_{t+1}+\gamma G_{t+1}$，状态价值满足：

$$
V^\pi(s)=\sum_a\pi(a\mid s)
\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma V^\pi(s')\right].
$$

动作价值满足：

$$
Q^\pi(s,a)=\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma\sum_{a'}\pi(a'\mid s')Q^\pi(s',a')\right].
$$

Bellman 方程不是一种单独算法，而是价值函数必须满足的递推关系。动态规划、TD 和 Q-learning 会用不同方式逼近或利用它。

#### 两状态示例

策略确定后，状态 A 总是转移到 B 并得到 1，状态 B 总是留在 B 并得到 2，$\gamma=0.5$：

$$
V(B)=2+0.5V(B)=4,
$$

$$
V(A)=1+0.5V(B)=3.
$$

```python
import numpy as np

transition = np.array([[0.0, 1.0], [0.0, 1.0]])
reward = np.array([1.0, 2.0])
gamma = 0.5
value = np.linalg.solve(np.eye(2) - gamma * transition, reward)
bellman_target = reward + gamma * transition @ value
print(value)
print(bellman_target)
```

线性方程解与 Bellman 右侧都为 `[3,4]`。

### 最优价值与 Bellman Optimality Equation

最优状态价值是在所有策略中可获得的最大期望回报：

$$
V^*(s)=\max_\pi V^\pi(s).
$$

最优动作价值满足：

$$
Q^*(s,a)=\sum_{s',r}p(s',r\mid s,a)
\left[r+\gamma\max_{a'}Q^*(s',a')\right].
$$

并有：

$$
V^*(s)=\max_a Q^*(s,a).
$$

若已知精确 $Q^*$，在每个状态选择任一最大动作即可得到最优确定性策略。学习过程尚未得到 $Q^*$ 时，总选当前最大估计会缺少探索。

### Terminal State 的价值

终止状态后的回报定义为 0，因此导致终止的转移目标为 $r$，不再加下一状态价值。奖励可以在进入终止状态的转移上给出；“终止状态价值为 0”不表示成功终止没有奖励。

时间限制 Truncation 不等于终止状态，详见[交互与回报](#termination-%E4%B8%8E-truncation)。

### 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [OpenAI Spinning Up: Introduction to RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)

## 强化学习问题分类与探索

### Prediction 与 Control

Prediction 固定策略 $\pi$，估计 $V^\pi$ 或 $Q^\pi$。问题是“这套策略有多好”。

Control 寻找能最大化回报的策略。控制通常交替进行价值估计与策略改进，但策略梯度也可以直接优化参数化策略。

策略评估属于 Prediction；策略迭代、Q-learning、DQN 和策略梯度属于 Control。评估算法收敛不表示已找到最优策略，因为它可能只准确评估一个很差的策略。

### Model-Based 与 Model-Free

Model 指环境的转移和奖励规律，例如 $p(s',r\mid s,a)$。

Model-Based 方法已知或学习 Model，并用它规划未来。动态规划使用已知模型；模型预测控制与世界模型则从数据学习近似模型。

Model-Free 方法不显式学习完整环境模型，直接学习价值或策略。Q-learning 和策略梯度属于 Model-Free。Model-Free 不表示没有神经网络，也不表示不预测任何量；区别在于是否显式建立可用于规划的环境转移模型。

学习模型可能提高数据利用率，也会受到模型误差累积影响。真实环境交互昂贵时，模型带来的模拟数据价值更大。

### On-Policy 与 Off-Policy

行为策略 $b$ 负责收集数据，目标策略 $\pi$ 是要评估或改进的策略。

- On-Policy：用当前目标策略自身产生的数据学习它；
- Off-Policy：使用与目标策略不同的行为策略数据学习目标策略。

若 $b(a\mid s)=0$ 而 $\pi(a\mid s)>0$，数据永远不会出现目标策略需要的该动作，通常无法仅靠这批数据完成无偏校正。重要性采样比率为：

$$
\rho_t=\frac{\pi(A_t\mid S_t)}{b(A_t\mid S_t)}.
$$

```python
import torch

behavior = torch.tensor([0.8, 0.2])
target = torch.tensor([0.1, 0.9])
sampled_action = 1
reward = torch.tensor(2.0)
ratio = target[sampled_action] / behavior[sampled_action]
weighted_reward = ratio * reward
print(ratio.item(), weighted_reward.item())
```

行为策略以 0.2 概率选择动作 1，目标策略概率为 0.9，比率是 4.5。大比率会放大估计方差；Off-Policy 并不等于可以无代价使用任意旧数据。

SARSA 使用实际由行为策略选择的下一动作更新，通常是 On-Policy；Q-learning 的目标使用下一状态最大 $Q$ 动作，与探索行为可不同，因此是 Off-Policy。

### 探索与利用

利用（Exploitation）选择当前估计最好的动作；探索（Exploration）尝试信息不足的动作，以便发现更优选择。只利用可能永久错过真实最优动作，只随机探索又无法充分获得已知收益。

常见探索方式包括 $\epsilon$-greedy、UCB、Softmax/Boltzmann、参数噪声和熵奖励。它们使用的信息与适用假设不同，不能只用一个“随机程度”概括。

训练时的探索策略与部署策略可以不同。例如训练使用 $\epsilon$-greedy，评估使用 Greedy。报告结果时必须关闭或固定探索随机性，否则无法区分策略质量和采样波动。

### Episodic 与 Continuing

Episodic Task 有自然终点，如一局游戏；Continuing Task 持续运行，如服务器资源调度。Episodic 回报可在终止处截断，Continuing Task 常使用折扣回报或平均奖励。

人为时间上限只产生 Truncation，不一定改变底层任务为 Episodic。训练目标是否 Bootstrap 应依据终止含义，而不是数组是否到达最大长度。

### 离散与连续空间

表格方法要求有限或可枚举的状态—动作表示。连续状态通常用函数逼近；连续动作无法直接枚举所有动作取 `max`，因此常使用参数化 Actor、优化器或动作采样。

DQN 适合有限离散动作，不因神经网络输入能接收连续状态就自动支持连续动作。DDPG、TD3 和 SAC 会在后续连续控制中处理这一问题。

### Bootstrap 与完整回报

Monte Carlo 等待 Episode 结束，用实际完整回报作为目标，不从当前价值估计 Bootstrap。TD 方法用 $R_{t+1}+\gamma V(S_{t+1})$ 更新，较早学习但目标含当前估计误差。

这是 Bias–Variance 的来源之一：完整回报通常方差较大、Bootstrap 目标偏差可能较大。$n$-step 与 $\lambda$ 方法在两端之间组合，后续单独讲解。

### Reward、Objective 与 Metric

Reward 是训练交互中的标量，Objective 是算法实际优化的量，Metric 是外部评估指标。三者可以不同。

例如机器人训练 Reward 包含前进、能耗与摔倒惩罚，优化器最小化策略损失，最终 Metric 报告成功率和能耗。只报告训练 Reward 无法判断策略是否满足真实要求。

### 实验协议

强化学习结果对环境随机性、初始化和数据顺序敏感。至少固定环境版本、终止/截断规则、观测与动作处理、训练交互步数、评估策略，并使用多个随机种子报告均值与离散程度。

训练 Episode 数不是公平预算：不同策略的 Episode 长度可能不同。通常同时记录环境交互步数、梯度更新数和实际运行时间。

下一阶段从基础算法的多臂老虎机开始。

### 参考资料

- [Reinforcement Learning: An Introduction, 2nd Edition](http://incompleteideas.net/book/the-book-2nd.html)
- [OpenAI Spinning Up: Key Concepts in RL](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html)
