---
title: 价值估计与表格型控制
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 动态规划：策略评估、策略迭代与价值迭代

### 使用条件

强化学习中的动态规划（Dynamic Programming，DP）假设有限 MDP 的转移概率和期望奖励已知。它使用完整模型计算期望，不需要从环境采样轨迹。

DP 适合解释 Bellman 方程和最优控制，但大状态空间下遍历全部状态、动作和下一状态代价很高；未知模型时也不能直接使用。

下面统一使用两个非终止状态和一个隐式终止状态：

- 状态 0：动作 0 终止且奖励 0；动作 1 到状态 1，奖励 0；
- 状态 1：动作 0 到状态 0，奖励 0；动作 1 终止且奖励 1。

`P[s,a,s2]` 只保存转移到非终止状态的概率，因此终止转移对应行和为 0。

```python
import numpy as np

P = np.zeros((2, 2, 2))
R = np.zeros((2, 2))
P[0, 1, 1] = 1.0
P[1, 0, 0] = 1.0
R[1, 1] = 1.0
gamma = 0.9
policy = np.full((2, 2), 0.5)
```

### 迭代策略评估

固定策略 $\pi$，反复应用 Bellman Expectation Backup：

$$
V_{k+1}(s)=\sum_a\pi(a\mid s)
\sum_{s',r}p(s',r\mid s,a)[r+\gamma V_k(s')].
$$

同步更新使用完整旧 $V_k$ 计算新数组；原地更新会立即使用本轮新值，仍可能收敛但迭代轨迹不同。停止条件常用最大变化量 $\max_s|V_{k+1}(s)-V_k(s)|<\theta$。

```python
value = np.zeros(2)
while True:
    action_values = R + gamma * np.einsum('sat,t->sa', P, value)
    updated = (policy * action_values).sum(axis=1)
    if np.max(np.abs(updated - value)) < 1e-10:
        value = updated
        break
    value = updated
print(value)
```

均匀策略的价值约为 `[0.2821, 0.6270]`。状态 1 更有价值，因为一半概率立即选择奖励为 1 的终止动作。

### 策略改进

已知 $V^\pi$ 后，对每个状态计算一步前瞻：

$$
q_\pi(s,a)=\sum_{s',r}p(s',r\mid s,a)
[r+\gamma V^\pi(s')].
$$

选择最大动作得到 Greedy 策略。如果新策略与旧策略相同，则策略已经稳定；有限 MDP 下可得到最优策略。

```python
action_values = R + gamma * np.einsum('sat,t->sa', P, value)
greedy_actions = action_values.argmax(axis=1)
improved_policy = np.eye(2)[greedy_actions]
print(action_values)
print(greedy_actions)
```

两个状态都选择动作 1：状态 0 先前往状态 1，状态 1 再获得奖励并终止。

并列最大动作可以任选，也可以在最大动作之间均匀随机。用浮点数判断策略是否稳定时，应比较选中的动作集合或容差，不依赖两个计算路径完全逐位相等。

### 策略迭代

策略迭代交替执行：

1. Policy Evaluation：求当前策略价值；
2. Policy Improvement：对该价值变为 Greedy；
3. 策略稳定则停止，否则继续。

评估不一定每次都精确收敛；Modified Policy Iteration 只执行有限次评估 Backup，再做改进，连接了策略迭代与价值迭代。

```python
policy = np.full((2, 2), 0.5)
for _ in range(10):
    value = np.zeros(2)
    for _ in range(1000):
        action_values = R + gamma * np.einsum('sat,t->sa', P, value)
        updated = (policy * action_values).sum(axis=1)
        if np.max(np.abs(updated - value)) < 1e-10:
            break
        value = updated
    greedy_actions = action_values.argmax(axis=1)
    new_policy = np.eye(2)[greedy_actions]
    if np.array_equal(new_policy, policy):
        break
    policy = new_policy
print(value)
print(policy)
```

最优策略在两状态都选动作 1，最优价值为 `[0.9,1.0]`。

### 价值迭代

价值迭代直接应用 Bellman Optimality Backup：

$$
V_{k+1}(s)=\max_a\sum_{s',r}p(s',r\mid s,a)
[r+\gamma V_k(s')].
$$

收敛后再对 $V^*$ 取 Greedy 动作得到最优策略。

```python
value = np.zeros(2)
while True:
    action_values = R + gamma * np.einsum('sat,t->sa', P, value)
    updated = action_values.max(axis=1)
    if np.max(np.abs(updated - value)) < 1e-10:
        value = updated
        break
    value = updated
optimal_actions = (R + gamma * np.einsum('sat,t->sa', P, value)).argmax(axis=1)
print(value)
print(optimal_actions)
```

结果同样为价值 `[0.9,1.0]`、动作 `[1,1]`。价值迭代中的中间价值通常不是某个当前策略的精确价值，不应把每轮 `argmax` 的性能当作已完成策略评估。

### Backup 与计算量

一个状态的完整 Backup 要枚举动作和可能下一状态。稠密有限 MDP 每轮约为 $O(|\mathcal S|^2|\mathcal A|)$；转移稀疏时应只遍历非零后继。

终止转移不 Bootstrap。仅因时间限制截断的状态若底层任务未终止，则不应机械设下一价值为 0。

### 参考资料

- [Reinforcement Learning: An Introduction, Chapter 4](http://incompleteideas.net/book/the-book-2nd.html)
- [MDP、价值函数与 Bellman 方程](./reinforcement-learning-fundamentals.md#mdp-%E4%BB%B7%E5%80%BC%E5%87%BD%E6%95%B0%E4%B8%8E-bellman-%E6%96%B9%E7%A8%8B)

## 无模型预测：Monte Carlo 与 TD(0)

### 固定策略预测

本页只解决 Prediction：给定策略 $\pi$，用实际交互估计 $V^\pi(s)$。环境转移模型未知，因此不能像动态规划那样枚举所有后继。

Monte Carlo（MC）和 Temporal-Difference（TD）都从经验学习：MC 等 Episode 结束得到完整回报；TD 使用下一状态当前估计进行 Bootstrap。

以下使用 Random Walk：非终止状态为 1 至 5，每步等概率向左或向右；到达 0 终止奖励 0，到达 6 终止奖励 1。固定随机策略下真实价值为 $V(s)=s/6$。

```python
import numpy as np

rng = np.random.default_rng(42)

def generate_episode():
    state = 3
    episode = []
    while 0 < state < 6:
        next_state = state + rng.choice((-1, 1))
        reward = float(next_state == 6)
        episode.append((state, reward, next_state))
        state = next_state
    return episode

episode = generate_episode()
print(episode)
```

### Monte Carlo Prediction

MC 对访问过的状态使用实际回报：

$$
V(S_t)\leftarrow V(S_t)+\alpha[G_t-V(S_t)].
$$

$G_t$ 在 Episode 结束后才能完整计算，因此 MC 不 Bootstrap，也不需要环境模型。

First-Visit MC 每个 Episode 只更新状态第一次出现的位置；Every-Visit MC 更新每次出现。一个 Episode 中状态可能反复出现，两者的有限样本结果不同，但在适当条件下都可收敛到同一价值。

```python
mc_value = np.zeros(7)
returns_sum = np.zeros(7)
returns_count = np.zeros(7, dtype=int)
for _ in range(5000):
    episode = generate_episode()
    visited = set()
    final_return = episode[-1][1]
    for state, _, _ in episode:
        if state in visited:
            continue
        visited.add(state)
        returns_sum[state] += final_return
        returns_count[state] += 1
        mc_value[state] = returns_sum[state] / returns_count[state]
print(mc_value[1:6])
```

这里 $\gamma=1$，且只有终止转移可能得到奖励 1，所以每个状态的回报就是最终是否从右端终止。估计应接近 `[1/6,2/6,3/6,4/6,5/6]`。

### TD(0) Prediction

TD(0) 每次转移后立即使用一步目标：

$$
Y_t=R_{t+1}+\gamma V(S_{t+1}),
$$

$$
V(S_t)\leftarrow V(S_t)+\alpha[Y_t-V(S_t)].
$$

$\delta_t=Y_t-V(S_t)$ 称为 TD Error。若下一状态真正终止，Bootstrap 项为 0。

```python
td_value = np.zeros(7)
alpha = 0.05
for _ in range(5000):
    for state, reward, next_state in generate_episode():
        continuation = 0.0 if next_state in (0, 6) else td_value[next_state]
        td_error = reward + continuation - td_value[state]
        td_value[state] += alpha * td_error
print(td_value[1:6])
```

TD 不等待整局结束，奖励为 0 的中间转移也能借助下一状态价值传播信息。固定步长使最终估计仍在随机波动；不能要求一次运行精确等于解析值。

### MC 与 TD 的区别

| | Monte Carlo | TD(0) |
| --- | --- | --- |
| 目标 | 完整实际回报 $G_t$ | $R_{t+1}+\gamma V(S_{t+1})$ |
| 是否 Bootstrap | 否 | 是 |
| 何时更新 | 通常 Episode 结束后 | 每次转移后 |
| 是否适合 Continuing Task | 需切分或改造 | 可以在线更新 |
| 目标特点 | 通常高方差 | 通常较低方差但含估计偏差 |

“MC 无偏、TD 有偏”需要结合采样方式、初始化、有限数据和函数逼近具体说明，不能据此断言 MC 总是更准确。TD 的 Bootstrap 可以更快传播信息，也会传播当前估计误差。

### Batch 与 Online

Online TD 每得到一条转移就更新，后续目标会使用新参数。Batch 方法收集固定数据集并反复更新到收敛。即使公式相同，数据复用和更新时机也会改变结果。

MC 必须知道从访问点到 Episode 末尾的奖励；TD(0) 只需要单步转移，适合持续任务和长 Episode。

### Truncation

真正 Termination 后下一状态价值为 0。时间上限造成 Truncation 时，若观测仍对应底层非终止状态，TD 目标通常保留 $\gamma V(S_{t+1})$。MC 若把截断当完整 Episode 末尾，会丢掉尚未发生的回报，需要 Bootstrap 或专门处理。

### 评估

比较预测算法时固定策略和环境交互预算，使用多个随机种子。若已知小型环境真值，可报告状态加权均方误差：

$$
\operatorname{VE}=\sum_s\mu(s)[V(s)-V^\pi(s)]^2,
$$

其中 $\mu(s)$ 是明确选择的状态权重。只对常访问状态和对所有状态均匀平均是不同指标。

下一阶段将在预测基础上进入 SARSA、Expected SARSA 和 Q-learning 控制。

### 参考资料

- [Reinforcement Learning: An Introduction, Chapters 5–6](http://incompleteideas.net/book/the-book-2nd.html)
- [强化学习问题分类与探索](./reinforcement-learning-fundamentals.md#%E5%BC%BA%E5%8C%96%E5%AD%A6%E4%B9%A0%E9%97%AE%E9%A2%98%E5%88%86%E7%B1%BB%E4%B8%8E%E6%8E%A2%E7%B4%A2)

## 表格型控制：SARSA、Expected SARSA 与 Q-learning

### 从预测到控制

MC 与 TD(0) 解决的是固定策略下的价值预测。控制问题还要根据价值改进策略，最终寻找最优策略。状态和动作均为有限集合时，可以用表格保存每个状态—动作对的估计 $Q(s,a)$。

三种一步 TD 控制算法都使用

$$
Q(S_t,A_t)\leftarrow Q(S_t,A_t)+\alpha[Y_t-Q(S_t,A_t)],
$$

区别只在目标 $Y_t$ 如何处理下一状态。若 $S_{t+1}$ 真正终止，三个目标都只有 $R_{t+1}$，不再使用下一状态的 $Q$ 值。

训练时通常采用 $\epsilon$-greedy 行为策略：以概率 $1-\epsilon$ 选择当前最优动作，以概率 $\epsilon$ 在全部动作中均匀随机选择。并列最优动作应随机打破平局，否则动作编号会引入无意义的偏好。

```python
import numpy as np

rng = np.random.default_rng(42)

def epsilon_greedy(q_row, epsilon):
    if rng.random() < epsilon:
        return int(rng.integers(len(q_row)))
    best = np.flatnonzero(q_row == q_row.max())
    return int(rng.choice(best))

q_row = np.array([1.0, 2.0, 2.0, 0.0])
actions = [epsilon_greedy(q_row, 0.1) for _ in range(20)]
print(actions)
```

### SARSA

SARSA 的名字来自一次更新使用的五元组 $(S_t,A_t,R_{t+1},S_{t+1},A_{t+1})$。下一动作 $A_{t+1}$ 由当前行为策略实际选出：

$$
Y_t^{\text{SARSA}}=R_{t+1}+\gamma Q(S_{t+1},A_{t+1}).
$$

它评估并改进正在采样数据的 $\epsilon$-greedy 策略，因此是 On-Policy。只要训练期间仍有探索，价值中就会考虑未来探索动作可能造成的后果。

一次非终止转移的更新如下：

```python
q = np.array([[0.2, 0.8], [1.0, 0.4]])
state, action = 0, 1
reward, next_state, next_action = -0.1, 1, 0
alpha, gamma = 0.5, 0.9

target = reward + gamma * q[next_state, next_action]
q[state, action] += alpha * (target - q[state, action])
print(target, q[state, action])
```

### Expected SARSA

Expected SARSA 不采样单个 $A_{t+1}$，而是对目标策略的所有下一动作取期望：

$$
Y_t^{\text{Expected SARSA}}
=R_{t+1}+\gamma\sum_a\pi(a\mid S_{t+1})Q(S_{t+1},a).
$$

设动作数为 $k$，$\epsilon$-greedy 策略有 $g$ 个并列最优动作，则每个动作先得到 $\epsilon/k$；每个最优动作再得到 $(1-\epsilon)/g$。不能把全部贪心概率只给第一个最大值。

```python
def epsilon_greedy_probabilities(q_row, epsilon):
    probabilities = np.full(len(q_row), epsilon / len(q_row))
    best = np.flatnonzero(q_row == q_row.max())
    probabilities[best] += (1.0 - epsilon) / len(best)
    return probabilities

next_q = np.array([1.0, 3.0, 3.0, 2.0])
probabilities = epsilon_greedy_probabilities(next_q, 0.2)
expected_value = probabilities @ next_q
print(probabilities, expected_value)
```

对下一动作求期望消除了这一步动作采样造成的方差，但每次更新要读取全部动作。目标策略和行为策略相同时，它是 On-Policy；若期望按另一目标策略计算，也可构造 Off-Policy 版本。

### Q-learning

Q-learning 直接用下一状态的最大动作价值作为目标：

$$
Y_t^{\text{Q-learning}}
=R_{t+1}+\gamma\max_a Q(S_{t+1},a).
$$

行为策略仍可用 $\epsilon$-greedy 探索，但更新目标假定下一步选择贪心动作，因此它是 Off-Policy。表格型 Q-learning 在有限 MDP 中需要持续访问所有状态—动作对，并使用满足收敛条件的步长；“公式中有最大值”并不保证有限训练后已经得到最优策略。

```python
q = np.array([[0.2, 0.8], [1.0, 0.4]])
state, action = 0, 1
reward, next_state = -0.1, 1
alpha, gamma = 0.5, 0.9

target = reward + gamma * q[next_state].max()
q[state, action] += alpha * (target - q[state, action])
print(target, q[state, action])
```

### 悬崖行走中的差别

考虑 $4\times12$ 网格：起点在左下角，终点在右下角，中间十格是悬崖。普通移动奖励为 $-1$；掉下悬崖奖励为 $-100$ 并回到起点。动作越界时留在原地。

```python
ROWS, COLS = 4, 12
START = (3, 0)
GOAL = (3, 11)
ACTIONS = ((-1, 0), (0, 1), (1, 0), (0, -1))

def state_id(position):
    return position[0] * COLS + position[1]

def step(position, action):
    dr, dc = ACTIONS[action]
    row = min(max(position[0] + dr, 0), ROWS - 1)
    col = min(max(position[1] + dc, 0), COLS - 1)
    next_position = (row, col)
    if row == 3 and 1 <= col <= 10:
        return START, -100.0, False
    return next_position, -1.0, next_position == GOAL
```

下面只改变 TD 目标，其余训练条件相同。每局设置步数上限是为了使错误实现也能快速暴露；达到上限属于截断，不应在真实任务中自动当作终止状态。

```python
def train_control(method, episodes=500, alpha=0.5, gamma=1.0, epsilon=0.1):
    q = np.zeros((ROWS * COLS, len(ACTIONS)))
    returns = []
    for _ in range(episodes):
        position = START
        action = epsilon_greedy(q[state_id(position)], epsilon)
        total_reward = 0.0
        for _ in range(1000):
            next_position, reward, terminated = step(position, action)
            total_reward += reward
            current = state_id(position)
            if terminated:
                target = reward
                q[current, action] += alpha * (target - q[current, action])
                break

            following = state_id(next_position)
            next_action = epsilon_greedy(q[following], epsilon)
            if method == "sarsa":
                continuation = q[following, next_action]
            elif method == "expected-sarsa":
                continuation = epsilon_greedy_probabilities(
                    q[following], epsilon
                ) @ q[following]
            elif method == "q-learning":
                continuation = q[following].max()
            else:
                raise ValueError(f"unknown method: {method}")
            target = reward + gamma * continuation
            q[current, action] += alpha * (target - q[current, action])
            position, action = next_position, next_action
        returns.append(total_reward)
    return q, np.asarray(returns)

results = {
    method: train_control(method)
    for method in ("sarsa", "expected-sarsa", "q-learning")
}
for method, (_, returns) in results.items():
    print(method, returns[-100:].mean())
```

持续使用 $\epsilon$-greedy 时，SARSA 会把靠近悬崖后仍可能随机踏入悬崖的风险纳入目标，往往学到更安全的路线。Q-learning 学的是贪心目标策略，往往靠近悬崖走最短路线；训练回报却仍由带探索的行为策略产生，因此可能更差。关闭探索进行评估时，两者的比较可能改变。

### 如何选择

| 算法 | 下一状态目标 | 典型关系 | 特点 |
| --- | --- | --- | --- |
| SARSA | 实际采样的 $Q(S',A')$ | On-Policy | 目标也包含探索后果 |
| Expected SARSA | $\sum_a\pi(a\mid S')Q(S',a)$ | 通常 On-Policy | 下一动作采样方差较小 |
| Q-learning | $\max_aQ(S',a)$ | Off-Policy | 直接逼近贪心策略价值 |

三者都只适用于状态—动作表能够存储并被充分访问的场景。状态巨大或连续时，不能简单建立无限大的表，需要使用函数逼近；DQN 就是用神经网络近似离散动作的 $Q$ 函数。

### 参考资料

- [Reinforcement Learning: An Introduction, Chapter 6](http://incompleteideas.net/book/the-book-2nd.html)
- [无模型预测：Monte Carlo 与 TD(0)](#%E6%97%A0%E6%A8%A1%E5%9E%8B%E9%A2%84%E6%B5%8B-monte-carlo-%E4%B8%8E-td-0)
- [DQN：经验回放与目标网络](./dqn.md#%E4%BB%8E-q-%E8%A1%A8%E5%88%B0-q-%E7%BD%91%E7%BB%9C)
