---
title: 神经网络基础与训练机制
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 多层感知机：线性层、激活与前向传播

### 为什么加入隐藏层

线性分类器只能在当前特征空间中形成线性边界。例如 XOR：输入 `(0,0)` 和 `(1,1)` 属于类别 0，`(0,1)` 和 `(1,0)` 属于类别 1，无法用一条直线分开。

多层感知机（Multilayer Perceptron，MLP）通过线性层和非线性激活逐层变换表示，再由输出层完成任务。输入与输出之间的层称为隐藏层，其表示通常由训练得到，没有逐元素人工标签。

### 线性层与矩阵形状

本组笔记将样本按行排列。输入 $X\in\mathbb R^{n\times d}$，隐藏宽度为 $h$，输出维度为 $C$。一个隐藏层的网络为：

$$
A=XW_1+\mathbf b_1,\qquad
H=\phi(A),\qquad
Z=HW_2+\mathbf b_2.
$$

| 数量 | 形状 | 含义 |
| --- | --- | --- |
| $W_1$ | $(d,h)$ | 输入到隐藏层权重 |
| $\mathbf b_1$ | $(h,)$ | 隐藏偏置，对样本轴广播 |
| $A,H$ | $(n,h)$ | 激活前、激活后的隐藏表示 |
| $W_2$ | $(h,C)$ | 隐藏到输出权重 |
| $\mathbf b_2$ | $(C,)$ | 输出偏置 |
| $Z$ | $(n,C)$ | 每个样本的输出 |

参数总数为 $dh+h+hC+C$，与批量大小 $n$ 无关。前向的两次矩阵乘法大约需要 $O(ndh+nhC)$ 时间。

PyTorch 的 `nn.Linear(d, h)` 内部将权重保存为 `(h,d)`，执行 $XW^\mathsf T+\mathbf b$。这是存储约定不同；把手写矩阵复制进模块时要转置。

### 激活函数

如果两层之间没有非线性：$(XW_1+\mathbf b_1)W_2+\mathbf b_2=X(W_1W_2)+(\mathbf b_1W_2+\mathbf b_2)$，仍然只是一层仿射变换。因此仅叠加线性层不能获得一般的非线性边界。

#### ReLU

ReLU 定义为 $\phi(a)=\max(0,a)$。正输入保持原值，负输入输出零。除零点外，导数为：

$$
\phi'(a)=\begin{cases}1,&a>0,\\0,&a<0.\end{cases}
$$

零点不可导，实现通常选择一个约定值，PyTorch 取 0。若某单元对所有训练输入长期处于负区间，它的梯度可能持续为零，形成“死亡 ReLU”。

#### Sigmoid、Tanh 与 GELU

Sigmoid 为 $\sigma(a)=1/(1+e^{-a})$，输出在 $(0,1)$，适合表达二分类概率。导数 $\sigma(a)(1-\sigma(a))$ 在输入绝对值很大时很小，多层连乘可能削弱梯度。

Tanh 输出在 $(-1,1)$，导数为 $1-\tanh^2(a)$，同样存在饱和区。GELU 常写为 $a\Phi(a)$，其中 $\Phi$ 为标准正态分布的累积分布函数；它平滑地调整输入，在 Transformer 中常见。

激活选择依赖结构。不能因为某函数更平滑就断言一定优于 ReLU，也不要把所有层都强制映射到概率范围。

### 输出层与任务

- 连续回归通常直接输出数值，再计算 MSE 等损失。
- 二分类输出一个 Logit，交给 `BCEWithLogitsLoss`。
- 互斥多分类输出 $C$ 个 Logit，交给 `CrossEntropyLoss`。

隐藏层激活与输出概率变换作用不同。训练多分类时不必先 Softmax 再送进 `CrossEntropyLoss`，详见[分类损失接口](./linear-models.md#%E9%80%BB%E8%BE%91%E5%9B%9E%E5%BD%92%E4%B8%8E-softmax-%E5%9B%9E%E5%BD%92)。

### 示例：手工构造 XOR

设两个隐藏单元为 $h_1=\operatorname{ReLU}(x_1+x_2)$，$h_2=\operatorname{ReLU}(x_1+x_2-1)$，输出 $z=h_1-2h_2$。

| 输入 | $h_1$ | $h_2$ | $z$ |
| --- | --- | --- | --- |
| $(0,0)$ | 0 | 0 | 0 |
| $(0,1)$ | 1 | 0 | 1 |
| $(1,0)$ | 1 | 0 | 1 |
| $(1,1)$ | 2 | 1 | 0 |

```python
import numpy as np

X = np.array([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
W1 = np.array([[1., 1.], [1., 1.]])
b1 = np.array([0., -1.])
W2 = np.array([[1.], [-2.]])
b2 = np.array([0.])
A = X @ W1 + b1
H = np.maximum(A, 0)
Z = H @ W2 + b2
print(Z.ravel())
```

输出 `[0, 1, 1, 0]`。这组权重是人为构造，用来证明网络可以表示 XOR，不是训练过程。这里的 $z$ 是直接构造的数值输出，不把它误当成经过 Sigmoid 的概率。

### 用训练学习 XOR

下面用更宽的 Tanh 隐藏层训练二分类器，避免手工指定上述权重。输入和标签都采用浮点数，输出与标签形状均为 `(4,1)`。

```python
import torch
from torch import nn

torch.manual_seed(42)
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]])
y = torch.tensor([[0.], [1.], [1.], [0.]])
model = nn.Sequential(nn.Linear(2, 8), nn.Tanh(), nn.Linear(8, 1))
optimizer = torch.optim.Adam(model.parameters(), lr=0.05)
criterion = nn.BCEWithLogitsLoss()
for _ in range(1000):
    optimizer.zero_grad()
    logits = model(X)
    loss = criterion(logits, y)
    loss.backward()
    optimizer.step()
model.eval()
with torch.no_grad():
    logits = model(X)
    print((logits >= 0).int().flatten())
    print(criterion(logits, y).item())
```

预测应为 `[0, 1, 1, 0]`。这是只有四种输入的计算演示，不能据此评价大型网络的泛化能力。

网络训练时，损失如何影响前面各层参数，见[计算图与反向传播](#%E8%AE%A1%E7%AE%97%E5%9B%BE-%E9%93%BE%E5%BC%8F%E6%B3%95%E5%88%99%E4%B8%8E%E5%8F%8D%E5%90%91%E4%BC%A0%E6%92%AD)。

### 参考资料

- [Dive into Deep Learning：Multilayer Perceptrons](https://d2l.ai/chapter_multilayer-perceptrons/mlp.html)

## 计算图、链式法则与反向传播

### 前向与反向

前向传播按照依赖顺序计算中间值和损失。反向传播从标量损失开始，沿计算图反向使用链式法则，得到损失对各参数的导数。

反向传播负责求梯度，[优化器](./machine-learning-theory.md#%E4%BC%98%E5%8C%96%E5%99%A8-sgd-momentum-adam-%E4%B8%8E-adamw)负责使用梯度更新参数。`loss.backward()` 不会自动执行梯度下降，`optimizer.step()` 才会更新参数。

反向传播是反向模式自动微分在网络计算图上的应用，不是通过不断扰动每个参数来近似导数，也不是符号化展开一个庞大的总公式。

### 链式法则与分支累加

若 $u=g(w)$、$L=f(u)$，则 $\partial L/\partial w=(\partial L/\partial u)(\partial u/\partial w)$。

若参数通过多个分支影响损失，各分支的导数贡献要相加。例如 $L=wx+w^2$，则 $\partial L/\partial w=x+2w$。不能只沿其中一条路径传播。

```python
import torch

w = torch.tensor(2.0, requires_grad=True)
x = torch.tensor(3.0)
loss = w * x + w ** 2
loss.backward()
print(loss.item(), w.grad.item())
```

输出 `10.0 7.0`。两个分支分别贡献 3 和 4，自动微分把它们相加。

### 一个隐藏单元的手算

考虑 $a=wx+b$、$h=\operatorname{ReLU}(a)$、$z=vh+c$，损失 $L=\frac12(z-y)^2$。

取 $x=2,y=1,w=1,b=1,v=2,c=0$。前向依次得到 $a=3,h=3,z=6,L=12.5$。

从损失向前倒推：

1. $\partial L/\partial z=z-y=5$。
2. $\partial L/\partial v=5h=15$，$\partial L/\partial c=5$。
3. $\partial L/\partial h=5v=10$。
4. 因为 $a>0$，ReLU 导数为 1，所以 $\partial L/\partial a=10$。
5. $\partial L/\partial w=10x=20$，$\partial L/\partial b=10$。

每步都使用前向阶段的参数和中间值。全部梯度计算完成之后再更新参数，否则前后不再对应同一次前向。

### 批量两层网络的梯度

沿用 [MLP](#%E5%A4%9A%E5%B1%82%E6%84%9F%E7%9F%A5%E6%9C%BA-%E7%BA%BF%E6%80%A7%E5%B1%82-%E6%BF%80%E6%B4%BB%E4%B8%8E%E5%89%8D%E5%90%91%E4%BC%A0%E6%92%AD) 的行样本约定，单输出回归网络为：

$$
A=XW_1+\mathbf b_1,\qquad H=\operatorname{ReLU}(A),\qquad Z=HW_2+\mathbf b_2,
\qquad L=\frac1{2n}\sum_i(Z_i-y_i)^2.
$$

$X$ 为 $(n,d)$，$W_1$ 为 $(d,h)$，$H$ 为 $(n,h)$，$W_2$ 为 $(h,1)$，$Z,Y$ 为 $(n,1)$。记 $G_Z=\partial L/\partial Z$，按相反顺序计算：

$$
G_Z=(Z-Y)/n,
\qquad
G_{W_2}=H^\mathsf T G_Z,
\qquad
G_{\mathbf b_2}=\sum_i(G_Z)_{i,:}.
$$

$$
G_H=G_ZW_2^\mathsf T,
\qquad
G_A=G_H\odot\mathbf1[A>0],
\qquad
G_{W_1}=X^\mathsf T G_A,
\qquad
G_{\mathbf b_1}=\sum_i(G_A)_{i,:}.
$$

$\odot$ 表示逐元素乘法。偏置在所有样本上复用，因此它的梯度沿样本轴求和。平均损失的 $1/n$ 已进入 $G_Z$，后面不能再次除以 $n$。

若是多输出并对所有元素求平均，起始梯度还需除以输出维数；若是分类，则换成对应的 Logit 梯度，其余链式传播结构不变。

### NumPy 手写与 PyTorch 对照

下面用固定的两样本网络计算所有参数梯度。输入在 ReLU 折点之外，便于数值核验。

```python
import numpy as np

X = np.array([[1., 2.], [-1., 1.]])
y = np.array([[1.], [0.]])
W1 = np.array([[0.5, -0.3], [0.2, 0.4]])
b1 = np.array([0.1, 0.2])
W2 = np.array([[0.7], [-0.5]])
b2 = np.array([0.1])
A = X @ W1 + b1
H = np.maximum(A, 0)
Z = H @ W2 + b2
loss = 0.5 * ((Z - y) ** 2).mean()
gZ = (Z - y) / len(X)
gW2 = H.T @ gZ
gb2 = gZ.sum(axis=0)
gA = (gZ @ W2.T) * (A > 0)
gW1 = X.T @ gA
gb1 = gA.sum(axis=0)
print(Z, loss)
print(gW1, gb1, gW2, gb2)
```

预测为 `[[0.45], [-0.35]]`，损失为 `0.10625`。第一层梯度为 `[[-0.1925, 0.05], [-0.385, 0.3625]]`，偏置梯度为 `[-0.1925, 0.225]`；第二层梯度为 `[[-0.275], [-0.35]]`，偏置梯度为 `[-0.45]`。

下面接续同一组 NumPy 数据，用 PyTorch 自动求导。两边都使用 `float64` 和完全相同的半 MSE。

```python
import torch

tX = torch.tensor(X, dtype=torch.float64)
ty = torch.tensor(y, dtype=torch.float64)
tW1 = torch.tensor(W1, dtype=torch.float64, requires_grad=True)
tb1 = torch.tensor(b1, dtype=torch.float64, requires_grad=True)
tW2 = torch.tensor(W2, dtype=torch.float64, requires_grad=True)
tb2 = torch.tensor(b2, dtype=torch.float64, requires_grad=True)
tZ = torch.relu(tX @ tW1 + tb1) @ tW2 + tb2
tloss = 0.5 * ((tZ - ty) ** 2).mean()
tloss.backward()
print(np.allclose(gW1, tW1.grad.numpy()))
print(np.allclose(gb1, tb1.grad.numpy()))
print(np.allclose(gW2, tW2.grad.numpy()))
print(np.allclose(gb2, tb2.grad.numpy()))
```

四行均为 `True`。这种对照有助于定位转置错误、广播错误，以及平均损失重复缩放。

### 数值梯度检查

有限差分使用 $\partial L/\partial w\approx[L(w+\epsilon)-L(w-\epsilon)]/(2\epsilon)$ 近似导数。它每个参数都要额外前向计算，适合小规模调试，不适合替代训练中的反向传播。

下面接续 NumPy 网络，只检查 $W_{1,0,0}$。扰动量取 $10^{-6}$，并恢复原值。

```python
epsilon = 1e-6
original = W1[0, 0]
W1[0, 0] = original + epsilon
plus = 0.5 * ((np.maximum(X @ W1 + b1, 0) @ W2 + b2 - y) ** 2).mean()
W1[0, 0] = original - epsilon
minus = 0.5 * ((np.maximum(X @ W1 + b1, 0) @ W2 + b2 - y) ** 2).mean()
W1[0, 0] = original
numeric = (plus - minus) / (2 * epsilon)
print(numeric, gW1[0, 0])
```

两者均约为 `-0.1925`。过小的扰动容易受舍入误差影响，过大则近似不准；ReLU 的不可导点附近还可能跨越不同分段，不能用对称差分强行验证框架选择的零点导数。

### 自动微分中的状态

每次前向会建立新的动态计算图。默认反向完成后会释放用于反向的中间缓存；通常下一次更新重新前向，不应为普通训练随意设置 `retain_graph=True`。

参数 `.grad` 默认累积，所以独立更新前清零。非叶子中间张量的梯度通常不会保存到 `.grad`，调试需要时调用 `retain_grad()`；这与保留整张计算图不是同一操作。

`detach()` 切断张量与此前计算图的梯度关系，`item()` 提取普通标量，均不能用于随后还需要沿原路径求导的损失计算。对反向所需的中间值进行原地修改也可能破坏梯度计算。

反向需要保存某些前向中间值，因此训练内存通常高于只做推理。检查点重计算可以用额外计算换内存，后续训练系统章节再展开。

### 参考资料

- [Dive into Deep Learning：Forward Propagation, Backward Propagation, and Computational Graphs](https://d2l.ai/chapter_multilayer-perceptrons/backprop.html)
- [PyTorch：Automatic Differentiation](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)

## 初始化与梯度传播：Xavier、He 与梯度裁剪

### 为什么不能把所有权重设为零

同一隐藏层的单元如果具有相同输入权重、偏置和对称的输出连接，就会得到相同激活和相同梯度，更新后仍然相同。增加这些单元相当于重复同一个特征，没有发挥隐藏宽度的作用。

随机初始化用于打破这种对称性。偏置常可以设为零，因为不同的随机权重已经使单元不同；逻辑回归等没有多个对称隐藏单元的模型，也可以从零权重开始。不能把“隐藏层全部零初始化有问题”推广成“任何参数都不能为零”。

### 梯度消失与爆炸

多层网络反向传播需要连乘各层的局部导数或 Jacobian。许多因子反复缩小某个方向，就可能出现梯度消失；反复放大则可能出现梯度爆炸。

例如标量链 $h_l=ah_{l-1}$，共 $L$ 层，则 $\partial h_L/\partial h_0=a^L$。取 $L=20$，$a=0.5$ 时约为 $9.54\times10^{-7}$，$a=2$ 时为 $1048576$。

```python
import numpy as np

factors = np.array([0.5, 1.0, 2.0])
print(factors ** 20)
```

真实网络中不同方向的缩放不同，不能只看每层一个权重的大小。Sigmoid 饱和、ReLU 失活、网络深度和权重尺度都会影响梯度，合适的初始化只是其中一环。

### fan-in 与 fan-out

对一个全连接层，输入宽度 $d_{\mathrm{in}}$ 是 fan-in，输出宽度 $d_{\mathrm{out}}$ 是 fan-out。它们不是批量大小。

假设权重独立、均值为零、方差为 $s^2$，输入各分量与权重独立且二阶矩相同。对 $a_j=\sum_iw_{ij}x_i$，交叉项期望消失，得到：

$$
\mathbb E[a_j^2]=d_{\mathrm{in}}s^2\mathbb E[x_i^2].
$$

若希望前向二阶矩不逐层放大或缩小，线性层需要大致满足 $d_{\mathrm{in}}s^2=1$。反向传播作类似分析会涉及 fan-out。

这些独立性和分布假设主要用于初始化时的近似分析，训练后通常不再严格成立。

### Xavier 初始化

Xavier 在前向与反向尺度之间折中，常用 gain 为 1 的形式为：

$$
\operatorname{Var}(w)=\frac{2}{d_{\mathrm{in}}+d_{\mathrm{out}}}.
$$

Gaussian 版本使用均值 0、上述方差；均匀分布 $U(-a,a)$ 的方差是 $a^2/3$，因此：

$$
a=\sqrt{\frac{6}{d_{\mathrm{in}}+d_{\mathrm{out}}}}.
$$

它适合作为近似线性或某些对称激活网络的尺度起点。实际库允许通过 gain 调整激活相关缩放，不能把同一 gain 无条件用于所有激活。

### He 初始化

ReLU 将负半轴置零。若激活前分布关于零对称，则：

$$
\mathbb E[\operatorname{ReLU}(a)^2]=\frac12\mathbb E[a^2].
$$

为了抵消这一步的二阶矩缩小，He 的 fan-in 形式使用：

$$
\operatorname{Var}(w)=\frac{2}{d_{\mathrm{in}}},
\qquad
\operatorname{Std}(w)=\sqrt{\frac{2}{d_{\mathrm{in}}}}.
$$

这里保持的是近似二阶矩，并非严格保持 ReLU 输出的方差：ReLU 输出均值通常不为零，方差还要减去均值平方。

对负半轴斜率为 $a$ 的 Leaky ReLU，对应方差尺度为 $2/[(1+a^2)d_{\mathrm{in}}]$。也可以选择 fan-out 形式侧重反向尺度。

#### 示例：256 输入、128 输出

Xavier 的标准差为 $\sqrt{2/384}\approx0.07217$，He 的标准差为 $\sqrt{2/256}\approx0.08839$。

```python
import numpy as np

rng = np.random.default_rng(42)
fan_in, fan_out = 256, 128
xavier_std = np.sqrt(2 / (fan_in + fan_out))
he_std = np.sqrt(2 / fan_in)
W_xavier = rng.normal(0, xavier_std, (fan_in, fan_out))
W_he = rng.normal(0, he_std, (fan_in, fan_out))
print(xavier_std, he_std)
print(W_xavier.std(), W_he.std())
```

采样标准差应接近理论值，不要求精确相等。

```python
import torch

torch.manual_seed(42)
layer = torch.nn.Linear(256, 128)
torch.nn.init.kaiming_normal_(layer.weight, mode='fan_in', nonlinearity='relu')
torch.nn.init.zeros_(layer.bias)
print(layer.weight.shape)
print(layer.weight.std(unbiased=False).item())
```

权重形状为 `(128,256)`，标准差接近 `0.08839`。PyTorch 按输出在前、输入在后的权重约定计算 fan；若自己保存的是用于 `X @ W` 的 `(输入,输出)` 矩阵，应核对是否需要向初始化函数传入转置。

### 梯度裁剪

梯度裁剪用于限制一次更新所使用的梯度大小，不负责修复错误损失或保证梯度不会消失。

全局范数裁剪把所有参数梯度看作一个向量 $\mathbf g$，阈值为 $c>0$：若 $\|\mathbf g\|_2>c$，替换为 $c\mathbf g/\|\mathbf g\|_2$，否则不变。它保留整组梯度方向；逐元素截断则可能改变方向，两者不同。

```python
import torch

parameter = torch.tensor([0.0, 0.0], requires_grad=True)
parameter.grad = torch.tensor([3.0, 4.0])
before_norm = torch.nn.utils.clip_grad_norm_([parameter], max_norm=1.0)
print(before_norm.item(), parameter.grad)
```

返回裁剪前范数 `5.0`，梯度约为 `[0.6,0.8]`。调用位置是 `backward()` 之后、优化器更新之前。混合精度下应先解除梯度缩放，再按真实尺度裁剪；非有限梯度也不能靠有限阈值变回正确梯度。

后续：[归一化](#%E5%BD%92%E4%B8%80%E5%8C%96-batchnorm-layernorm-%E4%B8%8E-rmsnorm)、[残差连接](#%E6%AE%8B%E5%B7%AE%E8%BF%9E%E6%8E%A5-%E6%81%92%E7%AD%89%E8%B7%AF%E5%BE%84-%E6%8A%95%E5%BD%B1%E4%B8%8E%E5%BD%92%E4%B8%80%E5%8C%96%E4%BD%8D%E7%BD%AE)。

### 参考资料

- [Glorot、Bengio：Understanding the difficulty of training deep feedforward neural networks](https://proceedings.mlr.press/v9/glorot10a.html)
- [He 等：Delving Deep into Rectifiers](https://arxiv.org/abs/1502.01852)

## 归一化：BatchNorm、LayerNorm 与 RMSNorm

### 归一化哪些数

神经网络中的归一化层对选定的一组激活计算统计量，再做缩放。一般形式为：

$$
\hat x_i=\frac{x_i-\mu}{\sqrt{v+\epsilon}},
\qquad y_i=\gamma_i\hat x_i+\beta_i.
$$

$\epsilon>0$ 用于数值稳定，$\gamma,\beta$ 是可学习的缩放与平移。不同方法的关键区别是：哪些元素一起计算 $\mu,v$，参数在哪些位置共享，训练与推理用什么统计量。

它与输入数据预处理中的标准化不是同一操作。归一化发生在模型内部，不能代替正确的数据划分与预处理。

### BatchNorm

对表格激活 $X\in\mathbb R^{N\times C}$，BatchNorm 对每个通道独立，沿样本轴计算：

$$
\mu_c=\frac1N\sum_iX_{ic},
\qquad v_c=\frac1N\sum_i(X_{ic}-\mu_c)^2.
$$

通道各有一个 $\gamma_c,\beta_c$。图像的 `BatchNorm2d` 输入为 $(N,C,H,W)$，每个通道沿 $N,H,W$ 三个轴聚合，不把不同通道混在一起。

#### 示例：同一通道的两个样本

取 $X=[[1,2],[3,6]]$，每行是一个样本。两个通道均值分别为 2、4，方差分别为 1、4。忽略很小的 $\epsilon$ 且 $\gamma=1,\beta=0$，归一化结果为 `[[-1,-1],[1,1]]`。

```python
import torch

X = torch.tensor([[1., 2.], [3., 6.]], dtype=torch.float64)
mean = X.mean(dim=0)
variance = X.var(dim=0, unbiased=False)
manual_bn = (X - mean) / torch.sqrt(variance + 1e-5)
bn = torch.nn.BatchNorm1d(2, affine=False, momentum=0.1).double()
bn.train()
actual_bn = bn(X)
print(torch.allclose(manual_bn, actual_bn))
print(actual_bn)
```

输出 `True`，其余数值接近上面的手算。

### BatchNorm 的训练与推理

默认启用运行统计量时，训练前向使用当前批次统计量，同时维护 running mean/variance；`eval()` 使用累积的运行统计量，不再根据当前批次重新估计。

PyTorch 的更新形式为 $r_{\mathrm{new}}=(1-m)r_{\mathrm{old}}+m r_{\mathrm{batch}}$，这个 momentum 的含义与优化器动量不同。

一个细节是：训练前向使用除以元素数的方差，而更新运行方差使用无偏方差估计。对刚才的两样本，前向方差为 `[1,4]`，无偏估计为 `[2,8]`；默认运行方差初始为 1，因此更新一次后为 `[1.1,1.7]`。

下面接续上段：

```python
print(bn.running_mean)
print(bn.running_var)
bn.eval()
with torch.no_grad():
    inference = bn(X)
print(inference)
```

运行均值为 `[0.2,0.4]`。只经过一批后，运行统计量尚不能代表总体，因此推理输出不等于刚才训练输出。

小批量会使统计估计不稳定。对每个通道只有一个参与统计的元素时，训练版 BatchNorm 还会受接口限制。若关闭 `track_running_stats`，评估时也使用当前输入统计量，行为与默认情形不同。

### LayerNorm

LayerNorm 对每个样本内部的指定特征轴归一化，不使用其他样本。对序列张量 $(N,L,D)$，`LayerNorm(D)` 对每个样本、每个位置的 $D$ 个特征求均值和方差，统计量形状为 $(N,L,1)$。

对于同一个 $X=[[1,2],[3,6]]$，每行分别归一化，结果接近 `[[-1,1],[-1,1]]`。这与 BatchNorm 的列归一化不同。

```python
import torch

X = torch.tensor([[1., 2.], [3., 6.]], dtype=torch.float64)
manual_ln = (X - X.mean(dim=-1, keepdim=True)) / torch.sqrt(X.var(dim=-1, unbiased=False, keepdim=True) + 1e-5)
ln = torch.nn.LayerNorm(2, elementwise_affine=False).double()
actual_ln = ln(X)
print(torch.allclose(manual_ln, actual_ln))
print(actual_ln)
ln.eval()
print(torch.allclose(actual_ln, ln(X)))
```

两个比较都为 `True`。LayerNorm 不维护批次运行统计量，训练与评估都使用当前输入的同一套计算；整个模型仍可能因为 Dropout 等其他层而具有不同模式。

`LayerNorm((L,D))` 会同时归一化最后两个轴，与 `LayerNorm(D)` 不同，不能只因为输入总维数匹配就随意填写 `normalized_shape`。

### RMSNorm

RMSNorm 不减均值，只按均方根缩放。对一个位置的特征向量 $\mathbf x\in\mathbb R^D$：

$$
\operatorname{RMSNorm}(\mathbf x)_j
=\gamma_j\frac{x_j}{\sqrt{\frac1D\sum_kx_k^2+\epsilon}}.
$$

通常不含平移项。它不保证输出均值为零；与 LayerNorm 不能视为相同运算的更快实现。

```python
import torch

x = torch.tensor([[3., 4.]], dtype=torch.float64)
gamma = torch.ones(2, dtype=torch.float64)
rms_output = x * torch.rsqrt((x ** 2).mean(dim=-1, keepdim=True) + 1e-5) * gamma
print(rms_output)
```

输出约为 `[[0.848528,1.131370]]`，均值不为零，二阶矩接近 1。

### 对照与边界

| 方法 | 常见统计范围 | 推理统计量 | 依赖同批其他样本 |
| --- | --- | --- | --- |
| BatchNorm | 每通道跨样本，卷积时还跨空间 | 默认使用运行统计量 | 训练时是 |
| LayerNorm | 单样本/位置的指定特征轴 | 当前输入 | 否 |
| RMSNorm | 单样本/位置的指定特征轴，仅均方根 | 当前输入 | 否 |

归一化常能改善优化条件，但不能保证任意学习率稳定。BatchNorm 原论文使用“内部协变量偏移”解释动机，不应把这种解释当成唯一、已经充分证明的全部作用机制。

冻结主干时，要分别考虑参数和运行统计量，见[迁移学习](./learning-paradigms.md#%E8%BF%81%E7%A7%BB%E5%AD%A6%E4%B9%A0-%E9%A2%84%E8%AE%AD%E7%BB%83-%E5%86%BB%E7%BB%93%E4%B8%8E%E5%BE%AE%E8%B0%83)。归一化在残差分支前后的位置见[残差连接](#%E6%AE%8B%E5%B7%AE%E8%BF%9E%E6%8E%A5-%E6%81%92%E7%AD%89%E8%B7%AF%E5%BE%84-%E6%8A%95%E5%BD%B1%E4%B8%8E%E5%BD%92%E4%B8%80%E5%8C%96%E4%BD%8D%E7%BD%AE)。

### 参考资料

- [Batch Normalization](https://arxiv.org/abs/1502.03167)
- [Layer Normalization](https://arxiv.org/abs/1607.06450)
- [PyTorch：BatchNorm1d](https://docs.pytorch.org/docs/stable/generated/torch.nn.BatchNorm1d.html)
- [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467)

## 残差连接：恒等路径、投影与归一化位置

### 残差分支与捷径

普通模块直接计算 $\mathbf y=F(\mathbf x)$；残差模块计算：

$$
\mathbf y=\mathbf x+F(\mathbf x).
$$

输入通过一条恒等捷径直接参与输出，分支 $F$ 学习需要增加的修正。例如希望整个模块保持输入时，只需让分支输出接近零，而不必让若干非线性层共同拟合恒等函数。

这里的残差指模块学习的修正，不是监督损失中的预测误差 $\hat y-y$。分支也不一定比输入数值小。

### 梯度为什么能经过捷径

若 $J_F$ 表示分支对输入的 Jacobian，则残差相加节点的 Jacobian 为 $I+J_F$。使用列向量梯度：

$$
\nabla_{\mathbf x}L=(I+J_F)^\mathsf T\nabla_{\mathbf y}L
=\nabla_{\mathbf y}L+J_F^\mathsf T\nabla_{\mathbf y}L.
$$

一项从恒等路径直接传播，另一项经过分支。两项需要相加，与[计算图的分支累加](#%E8%AE%A1%E7%AE%97%E5%9B%BE-%E9%93%BE%E5%BC%8F%E6%B3%95%E5%88%99%E4%B8%8E%E5%8F%8D%E5%90%91%E4%BC%A0%E6%92%AD)相同。

残差不是“不经过求导”，也不保证梯度永远不消失：两项可能抵消，其他层的归一化、激活和缩放也会影响梯度。

#### 示例：两个方向的梯度

设 $F(\mathbf x)=\mathbf x\odot[0.1,0.2]$，输入 $[2,3]$，输出为 `[2.2,3.6]`。取损失为输出分量之和，输入梯度应为 `[1.1,1.2]`。

```python
import torch

x = torch.tensor([2., 3.], requires_grad=True)
y = x + x * torch.tensor([0.1, 0.2])
y.sum().backward()
print(y.detach())
print(x.grad)
```

若分支完全关闭，输出为输入、输入梯度直接通过；若改成 $F(\mathbf x)=-\mathbf x$，输出与梯度都为零，说明恒等项也可能被抵消。

### 形状必须匹配

逐元素相加要求两条路径有相同的目标形状。若输入通道、特征宽度或空间尺寸改变，捷径可以用投影 $P$ 对齐：$\mathbf y=P(\mathbf x)+F(\mathbf x)$。

全连接投影可用线性层，卷积网络常用具有适当步幅的 $1\times1$ 卷积。此时捷径不再是严格恒等，其梯度也要经过投影。

```python
import torch
from torch import nn

torch.manual_seed(42)
x = torch.randn(4, 3)
projection = nn.Linear(3, 5, bias=False)
branch = nn.Sequential(nn.Linear(3, 5), nn.ReLU(), nn.Linear(5, 5))
y = projection(x) + branch(x)
print(y.shape)
```

输出 `(4,5)`。不要靠意外广播让 `(4,1)` 与 `(4,5)` 相加来“修复”维度，那会改变模块含义。

### Pre-Norm 与 Post-Norm

在 Transformer 风格的残差子层中，两种常见顺序为：

- Pre-Norm：$\mathbf y=\mathbf x+F(\operatorname{Norm}(\mathbf x))$。
- Post-Norm：$\mathbf y=\operatorname{Norm}(\mathbf x+F(\mathbf x))$。

Pre-Norm 的相加输出保留一条直接恒等路径；Post-Norm 的输出还经过归一化，反向时必须经过其 Jacobian。它们的训练行为和所需配方不同，不能只调整代码位置却声称模型完全等价。

```python
import torch
from torch import nn

torch.manual_seed(42)
x = torch.randn(2, 4)
norm = nn.LayerNorm(4)
branch = nn.Sequential(nn.Linear(4, 8), nn.GELU(), nn.Linear(8, 4))
pre_norm = x + branch(norm(x))
post_norm = norm(x + branch(x))
print(pre_norm.shape, post_norm.shape)
print(torch.allclose(pre_norm, post_norm))
```

两者形状均为 `(2,4)`，值一般不同。这里只比较顺序，完整注意力模块还包含掩码、多头与其他结构。

### 相加后的激活

某些 ResNet 模块在相加后再使用 ReLU：$\mathbf y=\operatorname{ReLU}(\mathbf x+F(\mathbf x))$。此时输出不是未经处理的恒等相加，负区间的梯度还会受 ReLU 阻断。

阅读结构图时应区分“相加节点前的恒等路径”和“整个模块对输入的导数”。ResNet 的基本块与瓶颈块将在 CNN 章节展开。

### 参考资料

- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745)

## Embedding：查表、梯度与表示空间

### 离散编号与向量

词、商品、用户等离散对象可以用整数编号表示，但编号大小通常没有距离含义。编号 20 不代表比编号 10“大两倍”，相邻编号也不表示语义接近。

Embedding 使用可学习矩阵 $E\in\mathbb R^{V\times d}$，其中 $V$ 为对象数量，$d$ 为表示维度。编号 $i$ 的向量为第 $i$ 行 $\mathbf e_i=E_{i,:}$。

输入编号为 $(N,L)$ 时，查表输出为 $(N,L,d)$；参数量为 $Vd$。长序列增加输出和激活内存，但不会增加这张表的参数量。

### 与 One-hot 乘法的关系

令 $\mathbf o_i$ 为长度 $V$ 的 One-hot 行向量，第 $i$ 个位置为 1，其余为 0。则 $\mathbf o_iE=E_{i,:}$。

数学上查表等价于 One-hot 乘矩阵，实现时直接取行，避免创建庞大的稀疏 One-hot 张量。Embedding 本身仍可能是很大的稠密参数表。

```python
import torch
import torch.nn.functional as F

E = torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]])
ids = torch.tensor([[1, 3, 1]])
lookup = E[ids]
one_hot_result = F.one_hot(ids, num_classes=4).float() @ E
print(lookup)
print(torch.equal(lookup, one_hot_result))
```

输出依次是 `[1,2]`、`[5,6]`、`[1,2]`，比较为 `True`。同一编号重复出现时会取到同一行参数。

### 查表如何训练

梯度针对被取出的浮点向量和矩阵权重，不针对整数编号求导。若编号 $i$ 在多个位置出现，这些位置传回的梯度累加到 $E$ 的同一行。

设损失为所有输出元素之和，编号 `[1,3,1]` 中第 1 行出现两次，第 3 行一次，因此这两行的梯度分别为 `[2,2]` 与 `[1,1]`。

```python
import torch

embedding = torch.nn.Embedding(4, 2)
ids = torch.tensor([1, 3, 1])
output = embedding(ids)
output.sum().backward()
print(embedding.weight.grad)
```

输出梯度矩阵为 `[[0,0],[2,2],[0,0],[1,1]]`。这个损失只演示累加规则，不能学习有意义的语义；实际梯度来自分类、语言建模或对比学习等目标。

未访问行在这次查表反向中没有数据梯度，但若存在权重衰减、优化器历史状态或其他共享用途，不能据此保证这些行在整个更新步骤中一定不变。

### Padding 与掩码

批量序列常用 PAD 补齐长度。`padding_idx` 可使对应行不接收该 Embedding 查表反向产生的梯度，新建模块默认把这行初始化为零。

它不会自动屏蔽注意力、自动忽略损失，或者自动使平均池化排除 PAD。预训练表中该行也可能被设为其他值。

```python
import torch

embedding = torch.nn.Embedding(4, 2, padding_idx=0)
with torch.no_grad():
    embedding.weight.copy_(torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]]))
ids = torch.tensor([[1, 3, 0]])
vectors = embedding(ids)
valid = ids != 0
pooled = (vectors * valid.unsqueeze(-1)).sum(dim=1) / valid.sum(dim=1, keepdim=True)
pooled.sum().backward()
print(pooled)
print(embedding.weight.grad[0])
```

输出平均向量为 `[[3,4]]`，PAD 行梯度为 `[0,0]`。若直接对三个位置取平均会得到 `[2, 8/3]`，错误地把补齐长度计入分母。本例保证每条序列至少有一个有效 Token；全 PAD 输入应在数据边界明确处理。

### 词表与表示空间

词表负责把输入转换为编号，Embedding 负责把编号转换为向量。未知词、子词切分、特殊标记属于词表和 Tokenization 设计，Embedding 不会自动推断一个超出范围的编号是什么意思。

随机初始化的向量没有天然语义。训练任务决定哪些对象需要相近、哪些差异需要保留。余弦接近常用于检索，但不等于任何场景下都含义相同。

静态查表给同一编号固定的初始表示；经过 Transformer 等上下文模型后，同一个词在不同句子里可以得到不同表示。因此“词向量”需要说明指查表结果还是上下文层输出。

### 位置表示与权重共享

单纯查表不包含序列位置：交换两个编号只会交换对应向量。序列模型需要通过递归结构、位置编码或其他机制表达顺序。

语言模型输出词表分数时，有时共享输入 Embedding 权重：若隐藏表示 $H$ 的末维为 $d$，可计算 $Z=HE^\mathsf T$，得到词表维 $V$ 的 Logit。此时 $E$ 同时参与输入查表和输出投影，梯度来自两条路径。

```python
import torch

E = torch.tensor([[0., 0.], [1., 2.], [3., 4.], [5., 6.]])
hidden = torch.tensor([[1., -1.]])
logits = hidden @ E.T
print(logits)
```

输出 `[[0,-1,-1,-1]]`，形状为 `(1,4)`。共享要求维度和模型设计匹配，并不适用于所有任务。

后续：[对比学习](./learning-paradigms.md#%E5%AF%B9%E6%AF%94%E5%AD%A6%E4%B9%A0-%E6%AD%A3%E8%B4%9F%E6%A0%B7%E6%9C%AC-%E6%B8%A9%E5%BA%A6%E4%B8%8E-infonce)。

### 参考资料

- [PyTorch：Embedding](https://docs.pytorch.org/docs/stable/generated/torch.nn.Embedding.html)
- [Using the Output Embedding to Improve Language Models](https://arxiv.org/abs/1608.05859)
