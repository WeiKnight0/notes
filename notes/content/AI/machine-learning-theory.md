---
title: 机器学习理论
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 学习目标：数据、模型与训练

### 数据与任务

假设要根据房屋面积预测价格。一条已成交记录包含输入“面积”和目标“价格”；许多这样的记录构成训练数据。模型需要从这些记录中学习关系，再对未见过的房屋作出预测。

在监督学习中，将数据集写成 $\mathcal D=\{(\mathbf x_i,y_i)\}_{i=1}^{n}$。

| 符号 | 含义 | 房价例子 |
| --- | --- | --- |
| $n$ | 样本数 | 已成交房屋数量 |
| $\mathbf x_i\in\mathbb R^d$ | 第 $i$ 个样本的特征向量 | 面积、房龄等 $d$ 个特征 |
| $y_i$ | 目标值或标签 | 成交价格 |
| $\hat y_i$ | 模型预测值 | 预测价格 |

**回归（Regression）**预测连续数值，例如价格、温度；**分类（Classification）**预测离散类别，例如是否为垃圾邮件。分类模型常先输出类别概率，再根据概率作出决策。

输入并不总是人工整理的表格。图片可以表示为像素张量，文本可以表示为 Token 编号序列。但 Token 编号只是索引，编号大小本身不表示词语语义的大小。

### 模型、参数与超参数

模型记作 $\hat y=f_{\boldsymbol\theta}(\mathbf x)$，其中 $\boldsymbol\theta$ 是需要从数据中学习的参数。

只有面积一个特征时，可以先使用 $\hat y=wx+b$：$w$ 决定面积变化对预测价格的影响，$b$ 是截距。选择这条直线形式是建模；根据训练数据确定 $w,b$ 是训练。

**参数（Parameter）**由训练过程更新，例如权重和偏置。**超参数（Hyperparameter）**控制模型或训练过程，例如学习率、正则化强度、网络层数。超参数通常借助验证集选择，不能反复查看测试结果来选择。

| 项目 | 在线性回归中的例子 |
| --- | --- |
| 输入 | 面积 $x$ |
| 模型 | $wx+b$ |
| 参数 | $w,b$ |
| 损失 | 预测值与真实值的平方误差 |
| 优化方法 | 梯度下降 |
| 超参数 | 学习率、迭代次数 |

### 学习目标

单个样本的预测好坏由损失函数 $\ell(\hat y,y)$ 衡量。对训练集取平均，得到训练目标的一种基本形式：

$$
J(\boldsymbol\theta)=\frac1n\sum_{i=1}^{n}\ell\bigl(f_{\boldsymbol\theta}(\mathbf x_i),y_i\bigr),
\qquad
\boldsymbol\theta^*\in\operatorname*{arg\,min}_{\boldsymbol\theta}J(\boldsymbol\theta).
$$

$\operatorname*{arg\,min}$ 表示使目标取得最小值的参数，而不是最小损失值本身。这里写成集合形式，是因为最优参数不一定唯一。

模型形式、损失函数和优化方法是三个不同的选择。同一个线性模型可以使用平方损失，也可以使用绝对值损失；同一个目标可以用梯度下降，也可能存在直接求解方法。

训练损失低不等于新样本上表现好。真正关心的是模型对未见数据的**泛化（Generalization）**能力，详见[损失与风险](#%E6%8D%9F%E5%A4%B1%E5%87%BD%E6%95%B0-%E7%BB%8F%E9%AA%8C%E9%A3%8E%E9%99%A9%E4%B8%8E%E6%9C%9F%E6%9C%9B%E9%A3%8E%E9%99%A9)。

### 一次训练更新

梯度 $\nabla_{\boldsymbol\theta}J$ 表示目标对各参数的局部变化率。梯度下降沿负梯度更新：

$$
\boldsymbol\theta\leftarrow\boldsymbol\theta-\eta\nabla_{\boldsymbol\theta}J,
$$

其中 $\eta>0$ 是学习率。它控制每次更新走多远，并不保证任意大小都能使损失下降。

对一批数据，训练依次执行：

1. 将输入送入模型，计算预测值。
2. 比较预测与标签，计算损失。
3. 求损失对参数的梯度。
4. 使用梯度更新参数。
5. 使用更新后的参数处理下一批数据。

一次参数更新叫一个 **Step**；完整使用一遍训练集叫一个 **Epoch**；一次更新使用的样本集合叫一个 **Batch**。例如 1000 个样本、批量大小 128、保留最后不足一批的数据，一个 Epoch 包含 8 次更新。

#### 示例：手算一次更新

设模型为 $\hat y=wx$，一个样本为 $x=2,y=6$，损失取 $\ell=\frac12(wx-y)^2$。

- 输入：初始参数 $w=1$，学习率 $\eta=0.1$。
- 初始预测：$\hat y=2$，损失为 $\frac12(2-6)^2=8$。
- 梯度：$\frac{\partial\ell}{\partial w}=(wx-y)x=-8$。
- 更新：$w=1-0.1\times(-8)=1.8$。
- 新预测：$\hat y=3.6$，新损失为 $2.88$。

```python
x, y = 2.0, 6.0
w, learning_rate = 1.0, 0.1
prediction = w * x
loss_before = 0.5 * (prediction - y) ** 2
gradient = (prediction - y) * x
w -= learning_rate * gradient
loss_after = 0.5 * (w * x - y) ** 2
print(w, loss_before, loss_after)
```

输出约为 `1.8 8.0 2.88`。这里使用一个样本演示更新，不足以评估模型能否泛化。

### 训练与推理

**训练（Training）**利用数据与目标更新参数；**推理（Inference）**使用已经确定的参数计算输出，通常不需要标签，也不更新参数。

验证阶段同样进行前向计算，还会使用标签计算评估结果，但不通过这些标签反向传播更新参数。验证结果可以影响学习率、早停和模型选择，因此验证集也参与了开发决策，不能替代最终测试集。

后续阅读：[线性回归](./linear-models.md#%E7%BA%BF%E6%80%A7%E5%9B%9E%E5%BD%92-%E6%9C%80%E5%B0%8F%E4%BA%8C%E4%B9%98%E4%B8%8E%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D)、[数据划分](#%E6%95%B0%E6%8D%AE%E5%88%92%E5%88%86-%E4%BA%A4%E5%8F%89%E9%AA%8C%E8%AF%81%E4%B8%8E%E6%95%B0%E6%8D%AE%E6%B3%84%E6%BC%8F)。

### 参考资料

- [Dive into Deep Learning：Linear Regression](https://d2l.ai/chapter_linear-regression/linear-regression.html)
- [PyTorch：Quickstart](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)

## 损失函数、经验风险与期望风险

### 损失函数

损失函数 $\ell(\hat y,y)$ 衡量一次预测与目标的差异。损失通常越小越好，但不同损失强调的错误不同。

#### 回归损失

令误差 $e=\hat y-y$。平方损失为 $e^2$，绝对值损失为 $|e|$。对 $n$ 个样本取平均，分别得到均方误差 MSE 和平均绝对误差 MAE：

$$
\operatorname{MSE}=\frac1n\sum_{i=1}^{n}(\hat y_i-y_i)^2,
\qquad
\operatorname{MAE}=\frac1n\sum_{i=1}^{n}|\hat y_i-y_i|.
$$

误差从 1 变为 10 时，平方损失从 1 变为 100，而绝对值损失从 1 变为 10。因此 MSE 对大误差更敏感，异常值也更容易影响拟合结果。

平方损失有时写成 $\frac12e^2$，便于求导时消去系数 2。这个常数不改变不带其他项的最小化问题的最优解，但会改变梯度大小；如果还有正则项，改变损失缩放也会改变两项的相对权重。

#### 分类损失

二分类标签 $y\in\{0,1\}$，模型预测正类概率 $p\in(0,1)$。二元交叉熵为：

$$
\ell(p,y)=-y\log p-(1-y)\log(1-p).
$$

当 $y=1$ 时，损失为 $-\log p$；当 $y=0$ 时，损失为 $-\log(1-p)$。使用自然对数。

例如真实类别为 1，预测概率为 0.9 时，损失约为 0.105；预测为 0.1 时，损失约为 2.303。错误且非常自信的预测会受到更大的惩罚。

对互斥的 $C$ 类分类，模型输出概率 $p_0,\ldots,p_{C-1}$，真实类别编号为 $y$，交叉熵为 $-\log p_y$。不能只看预测类别是否正确：真实类别概率为 0.51 和 0.99 时，二分类决策可能相同，但损失明显不同。

概率如何由模型输出得到，见[逻辑回归与 Softmax](./linear-models.md#%E9%80%BB%E8%BE%91%E5%9B%9E%E5%BD%92%E4%B8%8E-softmax-%E5%9B%9E%E5%BD%92)。

### 经验风险

对已经收集到的数据取平均损失，称为经验风险（Empirical Risk）：

$$
\hat R_{\mathcal D}(\boldsymbol\theta)=\frac1n\sum_{i=1}^{n}\ell\bigl(f_{\boldsymbol\theta}(\mathbf x_i),y_i\bigr).
$$

它可以直接计算。不同数据集对应不同经验风险，因此必须区分训练损失、验证损失和测试损失。

#### 示例：相同总绝对误差，不同平方误差

真实值为 $[2,4]$。模型 A 预测 $[3,5]$，模型 B 预测 $[2,6]$。

| 模型 | 两个样本的误差 | MAE | MSE |
| --- | --- | --- | --- |
| A | $1,1$ | $1$ | $1$ |
| B | $0,2$ | $1$ | $2$ |

MAE 对这两个模型给出相同结果，MSE 更偏好错误分布均匀的 A。

```python
import numpy as np

y = np.array([2.0, 4.0])
predictions = np.array([[3.0, 5.0], [2.0, 6.0]])
errors = predictions - y
print(np.abs(errors).mean(axis=1))
print((errors ** 2).mean(axis=1))
```

输出分别为 `[1. 1.]` 和 `[1. 2.]`。第 0 维区分模型，第 1 维区分样本，所以沿 `axis=1` 对样本求平均。

### 期望风险

实际部署时，模型面对的是数据分布中的新样本。对这个分布求平均，得到期望风险（Expected Risk）：

$$
R(\boldsymbol\theta)=\mathbb E_{(\mathbf x,y)\sim P}
\left[\ell\bigl(f_{\boldsymbol\theta}(\mathbf x),y\bigr)\right].
$$

$P$ 表示希望模型服务的数据分布，$\mathbb E$ 表示按发生概率加权平均。通常不知道完整的 $P$，只能用独立且有代表性的数据估计。

设新样本只有两类情况：90% 的情况下某模型损失为 0，10% 的情况下损失为 10，则期望风险为 $0.9\times0+0.1\times10=1$。某个很小的训练集可能恰好没有出现后一种情况，其经验风险为 0，也不能说明期望风险为 0。

独立同分布（i.i.d.）是常用分析假设：样本之间独立，且来自相同分布。真实数据中的同一用户重复记录、时间变化和医院差异等，都可能使简单随机划分无法模拟部署情形。

### 泛化差距与正则化目标

期望风险与训练经验风险的差 $R(\boldsymbol\theta)-\hat R_{\mathrm{train}}(\boldsymbol\theta)$ 称为一种泛化差距定义。实际常观察验证损失与训练损失的差作为线索，但它不是期望风险的精确值。

为限制拟合方式，训练目标可以加入正则项：

$$
J(\boldsymbol\theta)=\hat R_{\mathrm{train}}(\boldsymbol\theta)+\lambda\Omega(\boldsymbol\theta),
\qquad \lambda\geq0.
$$

例如 $\Omega(\mathbf w)=\frac12\|\mathbf w\|_2^2$ 惩罚大的权重。第一项要求拟合数据，第二项约束参数。$J$ 是训练用的完整目标，不要把含正则项的训练目标直接与不含正则项的验证损失比较。

### 损失与评估指标

训练损失需要便于优化，评估指标需要反映任务目标，两者不一定相同。分类常用交叉熵训练、Accuracy 或 F1 评估；检索训练可以使用对比损失，但最终关注相关结果能否排在前面。

分类正确率在许多参数区域保持不变，无法像平滑损失一样提供有用梯度。交叉熵则能区分“正确类别概率还不够高”和“已经非常确信”的预测。

应同时记录损失与任务指标。详见[模型评估](#%E6%A8%A1%E5%9E%8B%E8%AF%84%E4%BC%B0-%E5%9B%9E%E5%BD%92-%E5%88%86%E7%B1%BB%E4%B8%8E%E6%A3%80%E7%B4%A2)。

### 参考资料

- [Dive into Deep Learning：Generalization](https://d2l.ai/chapter_linear-regression/generalization.html)
- [scikit-learn：Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html)

## 参数估计：最大似然与最大后验

### 概率与似然

设硬币正面概率为 $\theta$。已知 $\theta=0.5$，问某个抛掷序列出现的概率，是把参数固定、观察数据的不确定性。已经观察到序列，比较不同 $\theta$ 对它的解释能力，则是把数据固定、将表达式看成参数的函数，称为**似然（Likelihood）**。

记数据为 $\mathcal D$，似然为 $L(\theta;\mathcal D)=p(\mathcal D\mid\theta)$。它不是参数的概率分布，不要求对 $\theta$ 积分或求和为 1。连续观测使用概率密度构造似然，密度值可以大于 1。

### 最大似然估计

最大似然估计（Maximum Likelihood Estimation，MLE）选择使已观察数据的似然最大的参数：

$$
\hat\theta_{\mathrm{MLE}}\in\operatorname*{arg\,max}_{\theta}p(\mathcal D\mid\theta).
$$

对于独立同分布样本，$p(\mathcal D\mid\theta)=\prod_{i=1}^np(x_i\mid\theta)$。连乘容易下溢，且不便求导，因此通常最大化对数似然：

$$
\log L(\theta)=\sum_{i=1}^{n}\log p(x_i\mid\theta).
$$

对数严格单调递增，所以不改变最优参数。取负号后，就得到训练中常最小化的负对数似然（NLL）。监督学习可对给定输入的条件概率 $p(y_i\mid\mathbf x_i,\boldsymbol\theta)$ 作相同处理。

#### 示例：估计硬币的正面概率

独立抛掷 $n$ 次，正面 $k$ 次。给定具体序列的似然为 $L(\theta)=\theta^k(1-\theta)^{n-k}$。如果只记录正面次数，会多出与参数无关的组合数，不影响这里的最优解。

当 $0<k<n$ 时，对数似然的导数为：

$$
\frac{\mathrm d\log L}{\mathrm d\theta}
=\frac k\theta-\frac{n-k}{1-\theta}=0
\quad\Longrightarrow\quad
\hat\theta_{\mathrm{MLE}}=\frac kn.
$$

二阶导数为 $-k/\theta^2-(n-k)/(1-\theta)^2<0$，因此内部驻点为最大值。若没有正面，最大值在边界 0；全为正面则在边界 1。

- 输入：10 次抛掷，8 次正面。
- 输出：$\hat\theta_{\mathrm{MLE}}=0.8$。
- 解释：它最符合这 10 次观测，但没有表达“小样本估计仍然不确定”。

### 最大后验估计

最大后验估计（Maximum A Posteriori，MAP）还考虑参数的先验分布 $p(\theta)$。Bayes 公式给出：

$$
p(\theta\mid\mathcal D)
=\frac{p(\mathcal D\mid\theta)p(\theta)}{p(\mathcal D)}.
$$

分母与待优化参数无关，因此：

$$
\hat\theta_{\mathrm{MAP}}\in\operatorname*{arg\,min}_{\theta}
\left[-\log p(\mathcal D\mid\theta)-\log p(\theta)\right].
$$

第一项要求解释数据，第二项体现先验偏好。MLE 只使用似然；MAP 使用似然与先验；完整 Bayesian 推断保留后验分布，而不是只取一个最高点。

#### 示例：同一枚硬币加入先验

选择 Beta 先验 $p(\theta)\propto\theta^{\alpha-1}(1-\theta)^{\beta-1}$，其中 $\alpha,\beta>0$。乘以似然后，后验为 $\operatorname{Beta}(k+\alpha,n-k+\beta)$。

当后验两个形状参数都大于 1 时，后验众数位于内部：

$$
\hat\theta_{\mathrm{MAP}}=\frac{k+\alpha-1}{n+\alpha+\beta-2}.
$$

取 $\alpha=\beta=2$，先验偏向中间概率。对 8 次正面、2 次反面，MAP 为 $9/12=0.75$。相比 MLE 的 0.8，结果向 0.5 收缩。

后验均值为 $(k+\alpha)/(n+\alpha+\beta)=10/14\approx0.7143$，**不是 MAP**。内部众数公式也不能直接用于后验形状参数不大于 1 的边界情况。

```python
import numpy as np

n, k = 10, 8
alpha, beta = 2.0, 2.0
mle = k / n
map_estimate = (k + alpha - 1) / (n + alpha + beta - 2)
posterior_mean = (k + alpha) / (n + alpha + beta)
theta = np.linspace(0.001, 0.999, 999)
log_likelihood = k * np.log(theta) + (n - k) * np.log1p(-theta)
log_posterior = log_likelihood + (alpha - 1) * np.log(theta) + (beta - 1) * np.log1p(-theta)
print(mle, map_estimate, posterior_mean)
print(theta[log_likelihood.argmax()], theta[log_posterior.argmax()])
```

输出约为 `0.8 0.75 0.714286`，网格搜索的两个最大位置为 `0.8 0.75`。网格只用于核验这个一维例子。

### 平方误差从哪里来

假设回归目标满足 $y_i=f_{\boldsymbol\theta}(\mathbf x_i)+\varepsilon_i$，噪声独立、服从均值 0 且方差相同的 Gaussian 分布 $\mathcal N(0,\sigma^2)$，并固定 $\sigma^2>0$。则：

$$
-\log p(\mathbf y\mid X,\boldsymbol\theta)
=\frac n2\log(2\pi\sigma^2)
+\frac1{2\sigma^2}\sum_{i=1}^{n}\left(y_i-f_{\boldsymbol\theta}(\mathbf x_i)\right)^2.
$$

第一项不依赖模型参数，第二项与平方误差和成正比。因此，在这些假设下，MLE 等价于最小二乘。若噪声采用 Laplace 分布，会得到绝对误差形式；损失选择对应不同的建模假设。

分类的 Bernoulli/Categorical 条件模型对应交叉熵，推导见[逻辑回归与 Softmax](./linear-models.md#%E9%80%BB%E8%BE%91%E5%9B%9E%E5%BD%92%E4%B8%8E-softmax-%E5%9B%9E%E5%BD%92)。

### Gaussian 先验与 L2 正则化

假设权重先验为 $\mathbf w\sim\mathcal N(\mathbf0,\tau^2I)$，偏置不作惩罚。忽略与权重无关的常数，负对数先验为 $\|\mathbf w\|_2^2/(2\tau^2)$。

结合上面的 Gaussian 噪声模型，再把整个 MAP 目标乘以 $\sigma^2/n$，得到：

$$
J(\mathbf w,b)=\frac1{2n}\sum_i(\hat y_i-y_i)^2
+\frac\lambda2\|\mathbf w\|_2^2,
\qquad \lambda=\frac{\sigma^2}{n\tau^2}.
$$

先验方差越小，参数越集中在零附近，惩罚越强。这个 $\lambda$ 关系依赖此处的损失缩放约定，不能脱离“求和还是平均”直接套用。L1 则可以由独立 Laplace 权重先验得到。

MAP 给出一个点估计，不自动提供预测不确定性；换参数化方式后，连续密度的众数也可能改变。实际模型中正则化系数通常通过验证集选择，未必显式指定一个真实先验方差。

后续：[正则化](#%E6%AD%A3%E5%88%99%E5%8C%96-l1-l2-dropout-%E4%B8%8E%E6%95%B0%E6%8D%AE%E5%A2%9E%E5%BC%BA)。

### 参考资料

- [Dive into Deep Learning：Maximum Likelihood](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/maximum-likelihood.html)
- [Dive into Deep Learning：Weight Decay](https://d2l.ai/chapter_linear-regression/weight-decay.html)

## 泛化、欠拟合与偏差—方差

### 欠拟合与过拟合

**欠拟合（Underfitting）**指模型没有充分学到任务中的有效规律，训练集上表现就不好。可能是模型表达能力不足、特征不合适、正则化过强，也可能是训练尚未收敛。不能一看到训练损失高就直接增加网络规模。

**过拟合（Overfitting）**指模型过度适应训练数据中的偶然细节，训练表现明显优于未见数据。例如用高次多项式穿过所有带噪声的观测点，却在点与点之间剧烈振荡。

判断时比较同一损失定义、同一评估模式下的训练与验证结果。训练时启用 Dropout、数据增强或将正则项计入损失，可能使记录的训练损失高于验证损失，这本身不表示发生异常。

### 偏差与方差指什么

设固定位置 $x$ 的真实目标为 $y=f(x)+\varepsilon$，其中 $\mathbb E[\varepsilon\mid x]=0$，$\operatorname{Var}(\varepsilon\mid x)=\sigma^2(x)$。

从同一数据分布重复抽取训练集 $\mathcal D$，每次重新训练，得到 $\hat f_{\mathcal D}(x)$。令平均预测 $\bar f(x)=\mathbb E_{\mathcal D}[\hat f_{\mathcal D}(x)]$。

- **偏差（Bias）**：$\bar f(x)-f(x)$，表示平均预测系统性偏离真实关系多少。
- **方差（Variance）**：$\mathbb E_{\mathcal D}[(\hat f_{\mathcal D}(x)-\bar f(x))^2]$，表示更换训练集后，同一位置的预测波动多少。
- **不可约噪声**：$\sigma^2(x)$，表示给定当前输入仍然存在的目标随机性。

这里的偏差不是线性层的偏置参数 $b$，方差也不是一批输入特征的方差。一次训练不能直接测出上述期望，需要重复训练或作额外估计。

### 平方损失的偏差—方差分解

假设测试目标噪声与训练过程独立。固定 $x$，把预测误差拆开：

$$
\hat f_{\mathcal D}(x)-y
=\underbrace{\hat f_{\mathcal D}(x)-\bar f(x)}_{A}
+\underbrace{\bar f(x)-f(x)}_{B}-\varepsilon.
$$

平方展开为 $A^2+B^2+\varepsilon^2+2AB-2A\varepsilon-2B\varepsilon$。由于 $\mathbb E[A]=0$、$\mathbb E[\varepsilon]=0$，以及噪声独立，三个交叉项的期望均为零，得到：

$$
\mathbb E_{\mathcal D,\varepsilon}\left[(\hat f_{\mathcal D}(x)-y)^2\right]
=\underbrace{(\bar f(x)-f(x))^2}_{\text{偏差平方}}
+\underbrace{\mathbb E_{\mathcal D}[(\hat f_{\mathcal D}(x)-\bar f(x))^2]}_{\text{方差}}
+\underbrace{\sigma^2(x)}_{\text{噪声}}.
$$

再对 $x$ 的分布平均，可得到整体预测误差的相应分解。这是平方损失下的结果，不能直接当成 Accuracy、F1 或交叉熵的同一分解公式。

#### 示例：同一位置的三次预测

假设 $f(x)=2$，三个等概率训练结果分别预测 1、2、3，测试噪声以相同概率取 $-1$ 和 $1$，且独立于训练结果。

- 平均预测为 2，偏差平方为 0。
- 预测方差为 $(1+0+1)/3=2/3$。
- 噪声方差为 1。
- 期望平方误差为 $0+2/3+1=5/3$。

```python
import numpy as np

predictions = np.array([1.0, 2.0, 3.0])
truth = 2.0
noise = np.array([-1.0, 1.0])
bias_squared = (predictions.mean() - truth) ** 2
variance = predictions.var()
noise_variance = noise.var()
expected_error = ((predictions[:, None] - (truth + noise)) ** 2).mean()
print(bias_squared, variance, noise_variance)
print(expected_error, bias_squared + variance + noise_variance)
```

最后一行两者均约为 `1.666667`。这里枚举全部 6 种等概率组合；`var()` 使用总体平均平方偏差，与此例的离散分布定义一致。

### 模型复杂度与数据量

简单模型可能无法表达真实关系，偏差较大；复杂模型可以拟合更多关系，也可能更敏感于训练样本，方差较大。这是理解很多传统模型的常见模式，但不是“参数增加必然使方差单调增加”的定律。

正则化通常通过增加一定偏差来降低波动。更多有代表性的训练数据有助于减少估计波动，但无法修复错误标签、缺失关键特征或错误评估流程。

训练误差下降而验证误差持续上升，是过拟合线索。训练和验证误差都高，先确认代码能否拟合一个很小的数据子集，再检查模型、输入和优化设置；训练失败也可能表现得像欠拟合。

### 学习曲线

学习曲线有两种常见横轴，含义不同：

| 横轴 | 观察什么 | 常见用途 |
| --- | --- | --- |
| 训练样本数 | 用不同规模训练集重新训练后的误差 | 判断增加数据是否可能有帮助 |
| Step / Epoch | 同一次训练过程中的误差变化 | 判断收敛、振荡、过拟合与早停 |

按训练集大小作曲线时，模型和训练预算应具有可比性，验证集固定。按 Epoch 作曲线时，记录样本加权的平均损失，避免最后一批较小的数据获得过高权重。

### 泛化与分布变化

即使在独立测试集上表现好，部署分布改变后也可能失效。例如训练照片清晰，部署摄像头模糊；训练文本来自新闻，部署文本来自口语聊天。

需要区分“在当前分布上过拟合”和“训练与部署分布不同”。单纯提高正则化不能保证解决分布变化，应重新检查数据覆盖、标签规则和目标场景。

前置：[损失与风险](#%E6%8D%9F%E5%A4%B1%E5%87%BD%E6%95%B0-%E7%BB%8F%E9%AA%8C%E9%A3%8E%E9%99%A9%E4%B8%8E%E6%9C%9F%E6%9C%9B%E9%A3%8E%E9%99%A9)、[数据划分](#%E6%95%B0%E6%8D%AE%E5%88%92%E5%88%86-%E4%BA%A4%E5%8F%89%E9%AA%8C%E8%AF%81%E4%B8%8E%E6%95%B0%E6%8D%AE%E6%B3%84%E6%BC%8F)。后续：[正则化](#%E6%AD%A3%E5%88%99%E5%8C%96-l1-l2-dropout-%E4%B8%8E%E6%95%B0%E6%8D%AE%E5%A2%9E%E5%BC%BA)、[学习率与训练曲线](#%E5%AD%A6%E4%B9%A0%E7%8E%87-%E6%89%B9%E9%87%8F%E5%A4%A7%E5%B0%8F%E4%B8%8E%E8%AE%AD%E7%BB%83%E6%9B%B2%E7%BA%BF)。

### 参考资料

- [scikit-learn：Bias-variance decomposition](https://scikit-learn.org/stable/auto_examples/ensemble/plot_bias_variance.html)
- [Dive into Deep Learning：Generalization](https://d2l.ai/chapter_linear-regression/generalization.html)

## 正则化：L1、L2、Dropout 与数据增强

### 正则化目标

正则化通过约束参数、改变训练数据或限制训练过程，减少模型对训练样本偶然细节的依赖。显式参数惩罚常写成 $J(\mathbf w)=L(\mathbf w)+\lambda\Omega(\mathbf w)$，其中 $L$ 为数据损失，$\lambda\geq0$ 控制惩罚强度。

它不是免费的性能提升：太强会妨碍模型学习有效关系，导致欠拟合。强度通过验证数据选择，不使用测试集反复调节。

### L2 正则化

取 $\Omega(\mathbf w)=\frac12\|\mathbf w\|_2^2$，目标和梯度为：

$$
J=L+\frac\lambda2\sum_jw_j^2,
\qquad
\nabla J=\nabla L+\lambda\mathbf w.
$$

L2 对大权重惩罚更强，一般使权重整体收缩，但不通常产生精确的零。具有相同预测作用的高度相关特征，也可能分摊权重。

#### 示例：一个参数的收缩

设数据损失为 $L(w)=\frac12(w-3)^2$。没有正则时最优参数为 3；加入 L2 后，令导数 $w-3+\lambda w=0$，得到 $w^*=3/(1+\lambda)$。

当 $\lambda=1$ 时，最优值为 1.5。正则化允许拟合误差增大，以换取较小的参数。

### L1 正则化

L1 使用 $\Omega(\mathbf w)=\|\mathbf w\|_1=\sum_j|w_j|$。对非零权重，惩罚项的导数为 $\lambda\operatorname{sign}(w_j)$；零处不可导，可以使用次梯度或近端方法。

与 L2 不同，L1 能使某些权重精确为零，得到稀疏解。仍以 $\frac12(w-3)^2$ 为数据损失，L1 最优解为 $w^*=\max(3-\lambda,0)$，因此 $\lambda\geq3$ 时解为零。

近端梯度先对数据损失更新 $u=w-\eta\nabla L(w)$，再执行软阈值：

$$
w\leftarrow\operatorname{sign}(u)\max(|u|-\eta\lambda,0).
$$

下面比较一组参数的 L1 近端结果与 L2 闭式解。取 $L(\mathbf w)=\frac12\|\mathbf w-\mathbf a\|_2^2$，L1 更新的学习率取 1，所以先得到 $\mathbf u=\mathbf a$。

```python
import numpy as np

a = np.array([-3.0, -0.5, 0.5, 3.0])
strength = 1.0
l1_solution = np.sign(a) * np.maximum(np.abs(a) - strength, 0)
l2_solution = a / (1 + strength)
print(l1_solution)
print(l2_solution)
```

输出分别为 `[-2, 0, 0, 2]` 和 `[-1.5, -0.25, 0.25, 1.5]`。直接使用普通梯度下降处理 L1，并不保证数值上自动出现精确零。

特征尺度会影响参数惩罚的意义：同一特征换单位后，所需权重大小改变。因此表格模型常先标准化，统计量只由训练集拟合。

### L2 与权重衰减

对没有动量的普通 SGD，将 L2 梯度加入更新：

$$
\mathbf w_{t+1}=\mathbf w_t-\eta(\mathbf g_t+\lambda\mathbf w_t)
=(1-\eta\lambda)\mathbf w_t-\eta\mathbf g_t.
$$

这等价于在更新中按 $1-\eta\lambda$ 缩小权重，因此常称权重衰减。但对 Adam，加入的 L2 梯度也会进入动量和自适应缩放，不能再当作同一个均匀收缩操作。

AdamW 把衰减与自适应梯度更新分开。它们的具体更新见[优化器](#%E4%BC%98%E5%8C%96%E5%99%A8-sgd-momentum-adam-%E4%B8%8E-adamw)。不要同时手工加 L2，又启用优化器的同类惩罚而没有计算总强度。

偏置和归一化参数常被排除在权重衰减之外，这是模型训练配方中的选择，不是所有模型必须遵循的数学规则。

### Dropout

Dropout 在训练时随机屏蔽部分激活，减少后续单元对某个固定激活组合的依赖。它屏蔽的是这次前向计算的激活值，不是永久删除参数。

采用 Inverted Dropout，丢弃概率为 $p\in[0,1)$，保留掩码 $m_j\sim\operatorname{Bernoulli}(1-p)$：

$$
\tilde h_j=\frac{m_jh_j}{1-p},
\qquad
\mathbb E[\tilde h_j\mid h_j]=\frac{(1-p)h_j}{1-p}=h_j.
$$

保留值乘以 $1/(1-p)$，使激活的条件期望不变。推理时直接使用 $h_j$，不再随机丢弃，也不额外乘以保留概率。期望保持只针对这里的激活，不能推出后续任意非线性网络的输出期望也完全相同。

#### 示例：掩码与缩放

- 输入：$\mathbf h=[2,4,6,8]$，$p=0.5$。
- 一次可能的掩码：$[1,0,1,0]$。
- 训练输出：$[4,0,12,0]$。
- 推理输出：$[2,4,6,8]$。

```python
import numpy as np

h = np.array([2.0, 4.0, 6.0, 8.0])
p = 0.5
mask = np.array([1, 0, 1, 0])
print(mask * h / (1 - p))
rng = np.random.default_rng(42)
masks = rng.random((100000, len(h))) >= p
print((masks * h / (1 - p)).mean(axis=0))
```

第一行是指定掩码的精确结果；第二行用大量独立掩码估计期望，应接近原始激活。

```python
import torch

torch.manual_seed(42)
dropout = torch.nn.Dropout(p=0.5)
h = torch.tensor([2.0, 4.0, 6.0, 8.0])
dropout.train()
print(dropout(h))
dropout.eval()
print(dropout(h))
```

训练输出每个元素要么为零，要么为原值的两倍；具体掩码依赖随机数实现。验证和推理必须切换 `eval()`。线性模型不一定需要 Dropout，各种网络使用的位置和强度也不同。

### 数据增强

数据增强（Data Augmentation）通过对训练样本作合理变换，表达任务应具有的某种不变性或等变性。

图像分类中，适度裁剪、颜色扰动或水平翻转可能保持类别。但数字 6 旋转后可能改变含义，医学影像左右翻转可能破坏位置语义，不能默认所有变换都保持标签。

目标检测裁剪图像后需要同步更新边界框；分割变换图像后需要同步变换掩码；文本删除一个“不”可能直接改变情感或事实含义。

训练时对已划分好的训练集做增强。验证和测试采用固定、可复现的预处理。不能把同一原图的不同增强版本分别放进训练和测试。

### 早停

早停（Early Stopping）根据验证表现选择训练终点：训练损失可以继续下降，但验证表现长期不改善时停止，并恢复验证最优时的参数。

它通过限制训练过程起到正则化作用。需要规定监测指标、最小改善幅度和容忍次数；停止时刻通常晚于最佳时刻，所以不能直接把最后一轮参数当最佳参数。示例见[学习率与训练曲线](#%E5%AD%A6%E4%B9%A0%E7%8E%87-%E6%89%B9%E9%87%8F%E5%A4%A7%E5%B0%8F%E4%B8%8E%E8%AE%AD%E7%BB%83%E6%9B%B2%E7%BA%BF)。

### 参考资料

- [Dive into Deep Learning：Weight Decay](https://d2l.ai/chapter_linear-regression/weight-decay.html)
- [Dive into Deep Learning：Dropout](https://d2l.ai/chapter_multilayer-perceptrons/dropout.html)
- [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101)

## 优化器：SGD、Momentum、Adam 与 AdamW

### 批量梯度与随机梯度

设训练目标为 $L(\boldsymbol\theta)=\frac1n\sum_i\ell_i(\boldsymbol\theta)$。完整批量梯度每次使用全部 $n$ 个样本；随机梯度下降严格说每次使用一个样本；实际训练常使用一个小批次 $B_t$：

$$
\mathbf g_t=\frac1{|B_t|}\sum_{i\in B_t}\nabla\ell_i(\boldsymbol\theta_{t-1}),
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}-\eta_t\mathbf g_t.
$$

小批次梯度降低一次更新的计算量，也带来采样噪声。在固定参数处均匀抽取样本时，它是完整梯度的无偏估计。每轮随机打乱、无放回分批与每次独立抽样并非完全相同的随机过程。

下面的平方、平方根与除法均按参数元素计算；$t$ 从 1 开始，$\eta_t$ 是当前学习率。优化器保存的状态与模型参数是不同的量。

### SGD

SGD 直接沿当前梯度的反方向走一步。设 $L(w)=\frac12w^2$，初始 $w_0=2$，学习率 0.1，则梯度为 2，更新后 $w_1=1.8$。

优点是状态少、更新直观；缺点是不同参数方向尺度相差很大时，可能在陡峭方向来回振荡，同时沿平缓方向前进很慢。

```python
import numpy as np

w = np.array([2.0, -1.0])
learning_rate = 0.1
gradient = w.copy()
w -= learning_rate * gradient
print(w)
```

输出 `[1.8, -0.9]`，对应目标 $L(\mathbf w)=\frac12\|\mathbf w\|_2^2$ 的一步更新。

### Momentum

动量法累积近期梯度方向。这里使用以下约定，初始 $\mathbf v_0=\mathbf0$：

$$
\mathbf v_t=\beta\mathbf v_{t-1}+\mathbf g_t,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}-\eta_t\mathbf v_t.
$$

若梯度长期同向，动量累积；若某个方向交替振荡，历史项可以部分抵消这种变化。$\beta\in[0,1)$ 决定历史保留程度。

有些资料写成 $\mathbf v_t=\beta\mathbf v_{t-1}+(1-\beta)\mathbf g_t$，那是另一种缩放约定；比较时必须同时考虑学习率。这里对应无 dampening、无 Nesterov 的常用 SGD 动量形式。

#### 示例：连续两步

仍用 $L(w)=\frac12w^2$，$w_0=2$，$\eta=0.1$，$\beta=0.9$。

- 第一步：$g_1=2$，$v_1=2$，$w_1=1.8$。
- 第二步：$g_2=1.8$，$v_2=0.9\times2+1.8=3.6$，$w_2=1.44$。

```python
import numpy as np

w = np.array([2.0])
velocity = np.zeros_like(w)
for _ in range(2):
    gradient = w.copy()
    velocity = 0.9 * velocity + gradient
    w -= 0.1 * velocity
print(w)
```

动量不保证每次都更接近最优点，学习率太大仍然可能越过最小值并发散。

### AdaGrad

AdaGrad 为每个参数累计历史平方梯度，$\mathbf s_0=\mathbf0$：

$$
\mathbf s_t=\mathbf s_{t-1}+\mathbf g_t^2,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta\frac{\mathbf g_t}{\sqrt{\mathbf s_t}+\epsilon}.
$$

经常出现大梯度的坐标，分母增大，后续步长减小；不常更新的坐标衰减较少，因此适合某些稀疏特征场景。但平方和持续增长，长时间训练后步长可能过小。

### RMSProp

RMSProp 用指数移动平均替代无限累积：

$$
\mathbf s_t=\rho\mathbf s_{t-1}+(1-\rho)\mathbf g_t^2,
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta\frac{\mathbf g_t}{\sqrt{\mathbf s_t}+\epsilon}.
$$

历史影响逐渐衰减，使分母反映近期梯度尺度。这里是无动量、非 centered 的形式，$\mathbf s_0=\mathbf0$。$\epsilon>0$ 防止零分母，也会影响非常小梯度时的数值行为。

下面对 $L(w)=\frac12w^2$ 各执行一步，注意两者的初始分母不同。

```python
import numpy as np

learning_rate, epsilon = 0.1, 1e-8
w_adagrad = np.array([2.0])
w_rmsprop = np.array([2.0])
g_adagrad = w_adagrad.copy()
g_rmsprop = w_rmsprop.copy()
sum_squared = g_adagrad ** 2
mean_squared = 0.1 * g_rmsprop ** 2
w_adagrad -= learning_rate * g_adagrad / (np.sqrt(sum_squared) + epsilon)
w_rmsprop -= learning_rate * g_rmsprop / (np.sqrt(mean_squared) + epsilon)
print(w_adagrad, w_rmsprop)
```

输出约为 `[1.9] [1.683772]`，RMSProp 使用 $\rho=0.9$。同样的名义学习率不意味着各优化器具有相同步长。

### Adam

Adam 同时估计梯度的一阶矩和二阶原点矩。$\mathbf m_0=\mathbf v_0=\mathbf0$：

$$
\mathbf m_t=\beta_1\mathbf m_{t-1}+(1-\beta_1)\mathbf g_t,
\qquad
\mathbf v_t=\beta_2\mathbf v_{t-1}+(1-\beta_2)\mathbf g_t^2.
$$

这里 $\mathbf v_t$ 估计的是平方梯度的平均，不是减去均值后的方差。由于从零初始化，早期估计偏小，需要偏差修正：

$$
\hat{\mathbf m}_t=\frac{\mathbf m_t}{1-\beta_1^t},
\qquad
\hat{\mathbf v}_t=\frac{\mathbf v_t}{1-\beta_2^t},
\qquad
\boldsymbol\theta_t=\boldsymbol\theta_{t-1}
-\eta_t\frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t}+\epsilon}.
$$

为什么除以 $1-\beta^t$？假设梯度均值固定为 $\boldsymbol\mu$，则 $\mathbb E[\mathbf m_t]=(1-\beta_1)\sum_{k=0}^{t-1}\beta_1^k\boldsymbol\mu=(1-\beta_1^t)\boldsymbol\mu$。修正消除了这种零初始化偏差，并不消除采样噪声或训练中的分布变化。

#### 示例：Adam 第一步

设 $g_1=2$，$\beta_1=0.9$，$\beta_2=0.999$。则 $m_1=0.2$，$v_1=0.004$，修正后 $\hat m_1=2$、$\hat v_1=4$。忽略很小的 $\epsilon$，更新量为 $\eta\times2/2=\eta$。

```python
import numpy as np

w = np.array([2.0])
m = np.zeros_like(w)
v = np.zeros_like(w)
beta1, beta2 = 0.9, 0.999
learning_rate, epsilon = 0.1, 1e-8
for t in range(1, 3):
    gradient = w.copy()
    m = beta1 * m + (1 - beta1) * gradient
    v = beta2 * v + (1 - beta2) * gradient ** 2
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    w -= learning_rate * m_hat / (np.sqrt(v_hat) + epsilon)
print(w)
```

两步后约为 `[1.800166]`。它只是更新过程的算例，不能用这个单一目标判断哪种优化器在真实任务上最好。

### AdamW

把 L2 梯度 $\lambda\boldsymbol\theta$ 加入 Adam，会使它参与 $\mathbf m_t,\mathbf v_t$ 的估计。AdamW 改为只用数据梯度更新矩，再单独衰减权重：

$$
\boldsymbol\theta_t=(1-\eta_t\lambda)\boldsymbol\theta_{t-1}
-\eta_t\frac{\hat{\mathbf m}_t}{\sqrt{\hat{\mathbf v}_t}+\epsilon}.
$$

例如初始 $w=2$、数据梯度为 2、$\eta=0.1$、$\lambda=0.01$，第一步约为 $2\times0.999-0.1=1.898$。

```python
import torch

w = torch.tensor([2.0], dtype=torch.float64, requires_grad=True)
optimizer = torch.optim.AdamW([w], lr=0.1, weight_decay=0.01)
optimizer.zero_grad()
loss = 0.5 * (w ** 2).sum()
loss.backward()
optimizer.step()
print(w.detach())
```

输出约为 `tensor([1.8980], dtype=torch.float64)`。调整学习率同时也会改变每步的衰减量，因此衰减效果还与更新次数有关。

### 状态与选择

| 方法 | 除参数和当前梯度外的主要状态 | 每次更新的关注点 |
| --- | --- | --- |
| SGD | 无 | 当前梯度 |
| Momentum | 一组动量 | 历史方向 |
| AdaGrad | 一组平方和 | 累积坐标尺度 |
| RMSProp | 一组平方移动平均 | 近期坐标尺度 |
| Adam / AdamW | 两组移动平均及步数 | 方向与尺度 |

每种方法对 $d$ 个参数的更新通常为 $O(d)$，但实际训练还要保存激活、梯度等，表中的状态不是总显存。

比较优化器时，应分别调整学习率并使用相同数据与评估流程；不能把某个优化器的学习率原样套给所有方法。恢复训练时，除模型权重外还需恢复优化器状态和步数，否则后续更新不会延续原过程。

### 参考资料

- [Dive into Deep Learning：Adam](https://d2l.ai/chapter_optimization/adam.html)
- [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101)
- [PyTorch：AdamW](https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html)

## 学习率、批量大小与训练曲线

### 学习率与收敛

学习率 $\eta$ 控制每次沿优化器给出的方向移动多少。过小会使收敛缓慢，过大可能振荡或发散；“每步损失都下降”也不是小批次随机训练必须满足的条件。

对一维目标 $L(w)=\frac12aw^2$，其中 $a>0$，梯度下降为：

$$
w_{t+1}=w_t-\eta aw_t=(1-\eta a)w_t.
$$

要求迭代趋向零，需要 $|1-\eta a|<1$，即 $0<\eta<2/a$。当 $0<\eta a<1$ 时参数同号收缩；当 $1<\eta a<2$ 时符号交替但幅度缩小；$\eta a=2$ 时等幅振荡；大于 2 则通常发散。

这个结论针对固定曲率的一维二次函数。真实神经网络的曲率随参数改变，不能用同一个数直接推出通用学习率。

#### 示例：同一目标的三种步长

```python
import numpy as np

learning_rates = np.array([0.1, 1.5, 2.1])
w = np.ones(3)
for _ in range(5):
    w -= learning_rates * w
print(w)
```

这里 $a=1,w_0=1$。输出约为 `[0.59049, -0.03125, -1.61051]`：第一种缓慢收缩，第二种振荡收缩，第三种振荡发散。

### 批量大小与更新次数

批量大小决定一次梯度估计使用多少样本。增大批量通常降低采样噪声，并可能提高硬件利用率，但也增加单次显存需求；超过硬件有效范围后，吞吐不一定继续提高。

有 $n$ 个样本，批量大小为 $B$，保留最后不足一批时，一个 Epoch 的更新数为 $\lceil n/B\rceil$。例如 1000 个样本，$B=100$ 时每轮 10 步，$B=250$ 时每轮 4 步。

因此固定 Epoch 数比较两个批量大小，实际更新次数不同。梯度累积也需要区分小批次前向次数和真正执行 `optimizer.step()` 的次数，学习率调度通常跟随后者。

增大批量时按比例增大学习率是一种特定条件下的经验配方，不是恒成立的等价变换。应观察验证结果、梯度尺度和训练稳定性。

### 学习率调度

#### 分段与指数衰减

分段衰减在指定时刻乘以 $\gamma\in(0,1)$，例如第 30、60 轮各缩小一次。指数衰减每隔固定单位持续缩小，写成 $\eta_t=\eta_0\gamma^t$。

必须说明 $t$ 的单位是 Epoch 还是参数更新次数。同样的衰减因子按 Step 执行和按 Epoch 执行差别很大。

#### 余弦衰减

设衰减进度 $u\in[0,1]$，从最大学习率 $\eta_{\max}$ 平滑降低到 $\eta_{\min}$：

$$
\eta(u)=\eta_{\min}+\frac12(\eta_{\max}-\eta_{\min})(1+\cos(\pi u)).
$$

开始时为最大值，中间为两端平均，结束时为最小值。这里没有重启；带重启的余弦调度需要额外定义周期。

#### Warmup

Warmup 在训练初期逐渐增大学习率，用于缓和初始参数和优化器状态尚未稳定时的更新。它不保证解决所有不稳定，也并非所有模型必需。

下面先线性 Warmup，再余弦衰减。总共 $T$ 次更新，其中 $W$ 次 Warmup，设 $1\leq W<T$，更新序号 $t$ 从 0 到 $T-1$。前 $W$ 次的学习率为 $\eta_{\max}(t+1)/W$；之后令 $u=(t-W+1)/(T-W)$。

```python
import numpy as np

total_steps, warmup_steps = 10, 2
peak_lr, min_lr = 0.1, 0.01
steps = np.arange(total_steps)
warmup = peak_lr * (steps + 1) / warmup_steps
progress = np.clip((steps - warmup_steps + 1) / (total_steps - warmup_steps), 0, 1)
cosine = min_lr + 0.5 * (peak_lr - min_lr) * (1 + np.cos(np.pi * progress))
schedule = np.where(steps < warmup_steps, warmup, cosine)
print(np.round(schedule, 6))
```

前两次为 `0.05, 0.1`，第三次约为 `0.096575`，最后一次为 `0.01`。实际循环中，在第 $t$ 次参数更新前将优化器学习率设为 `schedule[t]`，使公式和使用时机一致。

#### 根据验证表现降低

`ReduceLROnPlateau` 在监测指标若干次未改善后降低学习率。它接收实际验证指标，与按固定 Step 计算的调度器不同。降低学习率和早停可以配合，但应给降低后的模型一定改善机会。

使用框架调度器时核对调用单位和顺序。通常先执行优化器更新，再推进调度器；按验证指标调度则在计算出该轮验证结果后调用。

### 训练曲线如何比较

每个 Epoch 记录训练损失、验证损失、主要任务指标与学习率。样本级损失取平均时，各批次按样本数加权，不能把每批平均值直接再平均，除非各批大小相同。

例如两批分别有 4 和 1 个样本，平均损失分别为 1 和 5，则整轮平均为 $(4\times1+1\times5)/5=1.8$，不是 3。

| 观察 | 先检查什么 |
| --- | --- |
| 训练与验证都长期较差 | 数据/标签、损失与维度、优化是否生效、模型能力 |
| 训练下降，验证先降后升 | 过拟合、正则化强度与早停时机 |
| 两者剧烈振荡或出现非有限值 | 学习率、数值稳定性、异常样本与梯度 |
| 验证损失低于训练损失 | Dropout、增强、正则项、训练/评估模式差异 |
| 损失降低但业务指标变差 | 阈值、类别比例、概率校准与指标定义 |

这些是排查方向，不是仅凭曲线就能确定的原因。尤其不要把分布差异误判为单纯过拟合。

### 早停与最佳模型

规定验证损失下降超过 `min_delta` 才算改善，连续 `patience` 次验证没有改善则停止。每次改善保存当前模型，结束后恢复最佳模型。

下面用预先给出的验证损失演示选择过程，不进行真实训练。`min_delta=0.01`，`patience=2`；为清晰起见，使用差异远离浮点边界的数值。

```python
validation_losses = [0.9, 0.7, 0.705, 0.71, 0.6]
best_loss = float('inf')
best_epoch = -1
bad_epochs = 0
patience, min_delta = 2, 0.01

for epoch, val_loss in enumerate(validation_losses):
    if val_loss < best_loss - min_delta:
        best_loss = val_loss
        best_epoch = epoch
        bad_epochs = 0
    else:
        bad_epochs += 1
    if bad_epochs >= patience:
        break

print(best_epoch + 1, epoch + 1, best_loss)
```

输出 `2 4 0.7`：最佳轮为第 2 轮，第 4 轮停止。后面的 0.6 不会被看到，说明早停可能错过后续改善，因此容忍次数应考虑调度周期和验证噪声。

真正训练时，可在改善分支中用 `copy.deepcopy(model.state_dict())` 保存内存快照，结束后 `model.load_state_dict(best_state)`。直接把 `model.state_dict()` 长期放在变量中可能仍引用参数存储，后续训练会改变它，不能当成独立快照。

只做推理恢复时通常只需要模型参数；要准确继续训练，还需保存优化器、调度器、训练步数和必要的随机状态。最终性能在方案确定后用独立测试集评估。

### 参考资料

- [Dive into Deep Learning：Learning Rate Scheduling](https://d2l.ai/chapter_optimization/lr-scheduler.html)
- [PyTorch：ReduceLROnPlateau](https://docs.pytorch.org/docs/stable/generated/torch.optim.lr_scheduler.ReduceLROnPlateau.html)
- [PyTorch：Saving and Loading Models](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)

## 数据划分、交叉验证与数据泄漏

### 训练集、验证集与测试集

数据划分要模拟模型部署后遇到新数据的情况。若训练与测试实际上包含同一个对象的近重复记录，测试分数可能很好，却无法说明模型能够处理新对象。

| 数据集 | 用途 | 是否影响开发决策 |
| --- | --- | --- |
| 训练集 | 拟合参数与预处理统计量 | 是 |
| 验证集 | 选择模型、超参数、阈值与早停位置 | 是 |
| 测试集 | 模型方案确定后评估最终表现 | 不用于继续选择方案 |

例如比较学习率 0.01 和 0.1：分别在训练集训练，在验证集比较，选定后再用测试集评估。若看到测试集结果后继续选择学习率，测试集就参与了调参，需要另一个未参与选择的数据集评估最终结果。

70%/15%/15% 等比例只是常见起点。小数据更需要考虑交叉验证，稀有类别需要足够测试样本，时间预测则先考虑先后顺序，而不是套用固定比例。

### 如何划分

#### 随机划分与分层划分

样本近似独立同分布时，可以随机打乱后划分。类别不均衡时，分层划分尽量保持各子集中类别比例相近，减少某个小类完全落不到验证集的情况。

随机种子用于复现一次划分，不保证这次划分具有代表性。分层也不能解决同一对象跨集合造成的泄漏。

#### 按对象分组

同一个患者的多张医学影像、同一用户的多条记录、同一视频抽出的多帧，往往高度相关。若目标是服务未见过的患者、用户或视频，应按对象分组，再把整组分配到一个集合。

例如有患者 A 的 10 张图像，不能随机放 8 张进训练、2 张进测试，再把结果解释为对新患者的泛化能力。

#### 按时间划分

预测未来时，训练数据应早于验证与测试数据。例如用 1—6 月训练、7 月验证、8 月测试。随机打乱会让模型借助未来信息预测过去。

若样本使用重叠的滑动时间窗口，还要根据预测跨度在集合边界留出间隔，避免一条样本的目标区间与另一集合重叠。

### 数据泄漏

数据泄漏（Data Leakage）指训练或模型选择使用了实际预测时无法获得的信息。

#### 预处理泄漏

标准化需要估计每列的均值 $\mu_j$ 与标准差 $s_j$，再计算 $x'_{ij}=(x_{ij}-\mu_j)/s_j$。这些统计量只从训练集计算，然后原样用于验证和测试。

填补缺失值、PCA、特征筛选、词表构建等只要涉及从当前数据拟合规则，也需要遵守相同边界。

#### 目标与重复样本泄漏

- 预测客户是否违约，却把事后催收记录作为特征：特征在预测时尚不存在。
- 原图放在训练集、裁剪版本放在测试集：测试数据与训练数据近重复。
- 同一道问答题的不同措辞分散在训练和测试中：测到的可能是记忆能力。

应在生成数据增强版本之前划分原始对象。对近重复数据先确定分组，再保证同组不跨集合。

### 示例：划分后标准化

下面有 20 个独立样本，随机划为 12 个训练、4 个验证、4 个测试。均值和标准差只使用训练部分。

```python
import numpy as np

X = np.column_stack((np.arange(20.0), np.arange(20.0) ** 2))
y = 2 * X[:, 0] + 1
rng = np.random.default_rng(42)
order = rng.permutation(len(y))
train_idx, val_idx, test_idx = np.split(order, [12, 16])

X_train, y_train = X[train_idx], y[train_idx]
X_val, y_val = X[val_idx], y[val_idx]
X_test, y_test = X[test_idx], y[test_idx]
mean = X_train.mean(axis=0)
scale = X_train.std(axis=0)
# 常量列中心化后为零，使用 1 作除数保留这个结果。
scale = np.where(scale == 0, 1.0, scale)
X_train = (X_train - mean) / scale
X_val = (X_val - mean) / scale
X_test = (X_test - mean) / scale

print(len(y_train), len(y_val), len(y_test))
print(X_train.mean(axis=0))
```

输出样本数为 `12 4 4`，训练特征的均值接近 `[0. 0.]`。验证和测试均值不必为零，因为它们使用的是训练集统计量。

这里的拟合与转换由代码明确分开。使用 scikit-learn 时，可以把预处理和模型放进 `Pipeline`，让每一折都重新拟合对应训练部分的预处理。

### 交叉验证

K 折交叉验证把开发数据分成 $K$ 份。每次使用一份验证，其余 $K-1$ 份训练，共训练 $K$ 次，最后汇总验证结果。

例如 5 折划分为 A、B、C、D、E：第一次用 A 验证，第二次用 B 验证，直到 E。每个样本恰好在一折中作为验证样本。

每折都必须从头拟合模型和预处理。不能先在全部开发数据上标准化、做 PCA，再进行交叉验证。

通常先留出最终测试集，再在剩余开发数据上做交叉验证选择超参数。确定方案后，可以在全部开发数据上重新训练，最后评估测试集。若使用早停，仍需安排验证数据或提前确定训练轮数。

按对象分组的数据使用分组交叉验证；时间序列使用按时间向前扩展的验证方式。随机 K 折不适合所有数据。

### 记录与复现

一次可复查的评估至少记录：数据版本、样本或分组划分、随机种子、预处理规则、超参数选择方式和最终指标。对小数据集，多次划分的波动可能比两个模型的平均分差更大，需要一并观察。

后续阅读：[模型评估](#%E6%A8%A1%E5%9E%8B%E8%AF%84%E4%BC%B0-%E5%9B%9E%E5%BD%92-%E5%88%86%E7%B1%BB%E4%B8%8E%E6%A3%80%E7%B4%A2)。

### 参考资料

- [scikit-learn：Cross-validation](https://scikit-learn.org/stable/modules/cross_validation.html)
- [scikit-learn：Common pitfalls and recommended practices](https://scikit-learn.org/stable/common_pitfalls.html)

## 模型评估：回归、分类与检索

### 回归指标

对 $n$ 个样本，真实值为 $y_i$，预测值为 $\hat y_i$。

| 指标 | 定义 | 含义 |
| --- | --- | --- |
| MAE | $\frac1n\sum_i\lvert\hat y_i-y_i\rvert$ | 平均绝对误差，与目标同单位 |
| MSE | $\frac1n\sum_i(\hat y_i-y_i)^2$ | 放大较大的误差，单位为目标单位的平方 |
| RMSE | $\sqrt{\operatorname{MSE}}$ | 回到目标原单位，仍强调大误差 |

决定系数 $R^2$ 把模型与“始终预测评估集真实值均值”的误差基准比较：

$$
R^2=1-\frac{\sum_i(y_i-\hat y_i)^2}{\sum_i(y_i-\bar y)^2},
\qquad \bar y=\frac1n\sum_i y_i.
$$

完美预测时 $R^2=1$；与这个均值基准误差相同则为 0；更差时可以为负。这里使用评估集均值定义指标，不是建议部署时使用未知的评估标签作预测。

若所有 $y_i$ 都相同，分母为零，上式没有普通的有限定义，需要说明所用工具的处理约定。

#### 示例：回归误差

- 输入：真实值 `[1, 2, 3]`，预测值 `[1, 2, 4]`。
- MAE：$1/3$。
- MSE：$1/3$，RMSE：$\sqrt{1/3}\approx0.5774$。
- $R^2$：真实均值为 2，总离差平方和为 2，所以 $R^2=1-1/2=0.5$。

### 二分类混淆矩阵

先明确哪个类别叫正类。例如垃圾邮件检测中，以“垃圾邮件”为正类。

| 真实类别 / 预测类别 | 预测为正 | 预测为负 |
| --- | --- | --- |
| 真实为正 | TP：正确检出 | FN：漏检 |
| 真实为负 | FP：误报 | TN：正确排除 |

由此得到：

$$
\operatorname{Accuracy}=\frac{TP+TN}{TP+TN+FP+FN},
\qquad
\operatorname{Precision}=\frac{TP}{TP+FP},
\qquad
\operatorname{Recall}=\frac{TP}{TP+FN}.
$$

Precision 回答“判为正的样本中，有多少是真的”；Recall 回答“所有真正的正样本中，找到了多少”。两者的分母不同。

F1 是 Precision 与 Recall 的调和平均，在分母有效时可化为：

$$
F_1=\frac{2PR}{P+R}=\frac{2TP}{2TP+FP+FN}.
$$

#### 示例：垃圾邮件检测

100 封邮件里有 20 封垃圾邮件。模型标出 15 封，其中 12 封确实是垃圾邮件。

- TP 为 12，FP 为 3，FN 为 8，TN 为 77。
- Accuracy 为 $89/100=0.89$。
- Precision 为 $12/15=0.8$。
- Recall 为 $12/20=0.6$。
- F1 为 $24/35\approx0.6857$。

```python
tp, fp, fn, tn = 12, 3, 8, 77
accuracy = (tp + tn) / (tp + fp + fn + tn)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * tp / (2 * tp + fp + fn)
print(accuracy, precision, recall, f1)
```

这组数据各分母非零。真实评估中若没有预测正类，Precision 的分母为零；若没有真实正类，Recall 的分母为零。应明确采用“未定义”还是工具指定的数值约定，同时报告对应类别的样本数。

### 类别不平衡与阈值

若 1000 个样本中只有 10 个正类，全部预测为负也有 99% Accuracy，但 Recall 为 0。只报告正确率会掩盖模型完全没有检出正类的问题。

分类模型先输出概率，再使用阈值。降低正类阈值会使预测正类集合扩大，因此 Recall 不会下降，但 Precision 不保证单调变化。阈值应按误报、漏报代价在验证集选择。

ROC 曲线以假正率 $FP/(FP+TN)$ 为横轴、真正率 Recall 为纵轴，考察不同阈值。ROC-AUC 衡量排序区分能力，不等于正确率，也不保证概率校准。

PR 曲线展示不同阈值下的 Precision 与 Recall。正类稀少且关注检出质量时，通常还应观察 PR 曲线及 Average Precision；Average Precision 与某些工具用梯形积分计算的 PR-AUC 不是完全相同的定义。

### 多分类汇总

可以把每一类分别视为正类，其余类别视为负类，计算各类 Precision、Recall、F1。

- **Macro**：先计算每一类指标，再直接平均，各类别权重相同。
- **Weighted**：按每类真实样本数加权平均，常见类别权重更大。
- **Micro**：先汇总各类 TP、FP、FN，再计算指标。

Macro-F1 是各类 F1 的平均，不是先算 Macro-Precision 和 Macro-Recall 再求 F1。在单标签、覆盖所有类别的普通多分类中，Micro-Precision、Micro-Recall、Micro-F1 都等于 Accuracy；多标签任务不满足这个结论。

### 检索指标

检索返回一个排序列表。设某个查询的相关结果集合为 $G$，前 $K$ 个结果集合为 $T_K$，且 $G$ 非空。

$$
\operatorname{Precision@K}=\frac{|T_K\cap G|}{K},
\qquad
\operatorname{Recall@K}=\frac{|T_K\cap G|}{|G|}.
$$

前者衡量前 $K$ 个结果有多少相关，后者衡量所有相关结果找回多少。这里假设候选数量至少为 $K$，并且结果不重复。

若每个查询恰好只有一个正确匹配，Recall@K 就等于“是否在前 K 个中命中”；对全部查询求平均，得到命中比例。部分图文检索基准即使存在多个匹配，也把“前 K 中至少命中一个”的比例称为 R@K，阅读论文时必须核对定义。

MRR 关注第一个相关结果的位置。若第 $q$ 个查询的首个相关结果排名为 $r_q$，则：

$$
\operatorname{MRR}=\frac1Q\sum_{q=1}^{Q}\frac1{r_q}.
$$

在规定的检索范围内没有相关结果时，该查询贡献记为 0，并注明是否使用截断范围。

#### 示例：同样命中，排序不同

查询有两个相关结果 A、B，返回顺序为 `[C, A, D, B]`，取 $K=3$。

- Precision@3 为 $1/3$。
- Recall@3 为 $1/2$。
- 第一个相关结果在第 2 位，倒数排名为 $1/2$。

若把 A 放到第一位，Precision@3 与 Recall@3 不变，但倒数排名提高到 1。

### 如何报告结果

首先说明[数据划分](#%E6%95%B0%E6%8D%AE%E5%88%92%E5%88%86-%E4%BA%A4%E5%8F%89%E9%AA%8C%E8%AF%81%E4%B8%8E%E6%95%B0%E6%8D%AE%E6%B3%84%E6%BC%8F)和测试对象，再报告与任务对应的指标、样本数和汇总方式。比较两个模型时使用相同划分与评估流程。

对受随机初始化影响的训练，记录多次运行的均值和波动；不能只挑最好的一次。损失下降而任务指标下降时，检查阈值、类别不平衡、校准和分布变化，不要只看一个数字。

### 参考资料

- [scikit-learn：Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html)
