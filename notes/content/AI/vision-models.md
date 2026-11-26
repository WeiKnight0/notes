---
title: 卷积网络与视觉模型
date: 2026-09-10T00:00:00
lang: zh-cn
page: content
parent: AI/
---

## 卷积神经网络：卷积、步幅、填充与池化

### 为什么图像使用卷积

将一张 $H\times W$ 图像展平后送入全连接层，会丢失二维邻接关系，而且参数量随图像尺寸迅速增长。卷积层使用两个约束：

- **局部连接**：一个输出位置只读取附近的一小块输入。
- **参数共享**：同一个卷积核在所有空间位置重复使用。

因此同一种局部模式可以在不同位置被检测。参数共享带来平移等变性：忽略边界和步幅影响，输入平移后，特征图也相应平移。等变不是不变；分类网络通常还需池化、下采样或全局聚合，才会降低输出对位置变化的敏感度。

### 二维互相关

深度学习框架通常把“卷积”实现成互相关（Cross-correlation）：卷积核不翻转。对单通道输入 $X$ 和核 $K$，步幅 1、无填充时：

$$
Y_{i,j}=\sum_{u=0}^{k_h-1}\sum_{v=0}^{k_w-1}X_{i+u,j+v}K_{u,v}+b.
$$

严格数学卷积会翻转核，但核本身是可学习参数，使用互相关不降低可表示性。本组笔记沿用框架习惯，后文“卷积”均指该运算。

#### 示例：手算一个边缘核

输入和卷积核为：

$$
X=\begin{bmatrix}1&2&3\\4&5&6\\7&8&9\end{bmatrix},
\qquad
K=\begin{bmatrix}1&0\\0&-1\end{bmatrix}.
$$

左上角输出为 $1\times1+2\times0+4\times0+5\times(-1)=-4$。四个滑动窗口都得到 $-4$，所以输出为 $2\times2$ 矩阵。

```python
import torch
import torch.nn.functional as F

X = torch.tensor([[[[1., 2., 3.], [4., 5., 6.], [7., 8., 9.]]]])
K = torch.tensor([[[[1., 0.], [0., -1.]]]])
Y = F.conv2d(X, K)
print(Y)
```

PyTorch 图像张量采用 `(N,C,H,W)`，卷积核采用 `(C_out,C_in,k_h,k_w)`。输出是 `[[[[-4,-4],[-4,-4]]]]`。

### 输出尺寸

输入高度 $H$、核高度 $K_h$、两侧总共补 $2P_h$ 行、步幅 $S_h$、膨胀 $D_h$ 时，有效核高度为 $D_h(K_h-1)+1$。输出高度为：

$$
H_{\mathrm{out}}=
\left\lfloor\frac{H+2P_h-D_h(K_h-1)-1}{S_h}\right\rfloor+1.
$$

宽度同理。若窗口无法完整放入剩余区域，末尾位置会被丢弃。

#### 填充

Padding 在边界外补值，常见的是补零。核为奇数、步幅为 1、膨胀为 1 时，取 $P_h=(K_h-1)/2$、$P_w=(K_w-1)/2$ 可保持空间尺寸。

“Same”需要结合步幅理解：步幅大于 1 时，即使称为 Same，输出通常也约为输入尺寸除以步幅，不是原尺寸。

边界输出会读取补充值，因此与内部位置的统计条件不同。零填充也不是唯一选择，反射和复制填充适合某些任务。

#### 步幅

Stride 控制窗口每次移动距离。步幅 2 通常让空间尺寸约减半，同时跳过一部分窗口。下采样减少计算和存储，也可能丢失细节。

```python
import torch

x = torch.randn(2, 3, 32, 40)
conv = torch.nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1)
y = conv(x)
print(y.shape)
```

高度为 $\lfloor(32+2-2-1)/2\rfloor+1=16$，宽度为 20，输出形状是 `(2,16,16,20)`。

### 多输入通道与多输出通道

彩色图像有多个输入通道。每个输出通道拥有一组覆盖全部输入通道的卷积核：

$$
Y_{n,o,i,j}=b_o+
\sum_{c=0}^{C_{\mathrm{in}}-1}
\sum_{u=0}^{K_h-1}\sum_{v=0}^{K_w-1}
X_{n,c,i+u,j+v}W_{o,c,u,v}.
$$

输入通道的结果先求和，得到一个输出通道；使用 $C_{\mathrm{out}}$ 组核就得到 $C_{\mathrm{out}}$ 张特征图。普通卷积参数量为：

$$
C_{\mathrm{out}}C_{\mathrm{in}}K_hK_w+C_{\mathrm{out}},
$$

最后一项是启用偏置时的参数。它与输入的 $H,W$ 无关。

#### 示例：两个输入通道求和

令两个输入通道分别为全 1 和全 2，两个 $2\times2$ 核分别为全 1 和全 3。每个窗口输出为 $4\times1+4\times2\times3=28$。

```python
import torch
import torch.nn.functional as F

x = torch.stack((torch.ones(3, 3), torch.full((3, 3), 2.0))).unsqueeze(0)
weight = torch.stack((torch.ones(2, 2), torch.full((2, 2), 3.0))).unsqueeze(0)
y = F.conv2d(x, weight)
print(y)
```

输出为形状 `(1,1,2,2)` 的全 28 张量。两个输入通道没有各自产生独立输出，因为这里只有一个输出通道。

### $1\times1$ 卷积

$1\times1$ 卷积不聚合相邻空间位置，但会在每个位置混合输入通道。对固定像素位置，它相当于对通道向量使用同一个线性层。

它常用于改变通道数、构造瓶颈结构或对齐残差捷径。参数量为 $C_{\mathrm{in}}C_{\mathrm{out}}+C_{\mathrm{out}}$，并非“没有计算”。

```python
import torch

x = torch.randn(4, 64, 16, 16)
pointwise = torch.nn.Conv2d(64, 16, kernel_size=1)
print(pointwise(x).shape)
```

输出形状为 `(4,16,16,16)`：空间尺寸不变，通道从 64 降到 16。

### 分组卷积与深度可分离卷积

`groups=g` 将输入和输出通道分成 $g$ 组，各组独立卷积。要求输入、输出通道数都能被 $g$ 整除。权重形状为 $(C_{\mathrm{out}},C_{\mathrm{in}}/g,K_h,K_w)$。

当 `groups=C_in` 且每个输入通道对应一个输出通道时，称为 Depthwise 卷积，只在各通道内部聚合空间。随后用 $1\times1$ Pointwise 卷积混合通道，构成深度可分离卷积。

普通 $K\times K$ 卷积的乘法规模与 $K^2C_{\mathrm{in}}C_{\mathrm{out}}$ 成正比；Depthwise 加 Pointwise 约为 $K^2C_{\mathrm{in}}+C_{\mathrm{in}}C_{\mathrm{out}}$。减少计算的同时也改变了层的结构约束。

### 池化

最大池化在每个窗口取最大值，平均池化取平均值。它们通常没有可学习权重，并对每个通道独立处理。

$$
Y_{c,i,j}=\max_{(u,v)\in\mathcal W}X_{c,i+u,j+v}
$$

最大池化保留局部最强响应；平均池化保留局部平均。池化并不保证对任意平移完全不变，尤其当目标跨过窗口边界时。

```python
import torch
import torch.nn.functional as F

x = torch.tensor([[[[1., 3., 2., 0.], [4., 6., 5., 1.], [0., 2., 7., 8.], [1., 3., 9., 4.]]]])
print(F.max_pool2d(x, kernel_size=2, stride=2))
print(F.avg_pool2d(x, kernel_size=2, stride=2))
```

最大池化输出 `[[6,5],[3,9]]`，平均池化输出 `[[3.5,2],[1.5,7]]`。

全局平均池化把每个通道的全部空间位置取平均，将 `(N,C,H,W)` 变为 `(N,C)`。它使分类头不必依赖固定的展平空间大小，但输入还需满足此前各层的尺寸约束。

### 感受野

某层一个特征所依赖的原始输入区域称为理论感受野。按一个空间维计算，设第 $l$ 层核大小为 $k_l$、步幅为 $s_l$、膨胀为 $d_l$；$j_l$ 表示相邻特征在原图上的间隔，$r_l$ 表示感受野大小：

$$
j_l=j_{l-1}s_l,
\qquad
r_l=r_{l-1}+(k_l-1)d_lj_{l-1},
$$

初始 $j_0=r_0=1$。两个步幅 1 的 $3\times3$ 卷积得到 $5\times5$ 感受野，而一个 $5\times5$ 卷积也是 $5\times5$；前者中间多一次非线性，若通道数相同，参数量为 $18C^2$，后者为 $25C^2$，均忽略偏置。

#### 示例：卷积、池化、卷积

第一层为 $3\times3$、步幅 1；第二层为 $2\times2$ 池化、步幅 2；第三层为 $3\times3$、步幅 1：

- 第一层：$j_1=1,r_1=3$。
- 池化层：$j_2=2,r_2=4$。
- 第三层：$j_3=2,r_3=8$。

第三层一个位置理论上覆盖原图的 $8\times8$ 区域。实际有效影响往往集中在理论感受野的一部分，不能只用理论大小判断模型已充分利用全部区域。

### 一个小型分类网络

```python
import torch
from torch import nn

class SmallCNN(nn.Module):
    def __init__(self, classes):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(32, classes)

    def forward(self, x):
        x = self.features(x)
        return self.classifier(x.flatten(1))

model = SmallCNN(classes=10)
print(model(torch.randn(4, 3, 32, 32)).shape)
```

输出 `(4,10)`，是 4 个样本的原始分类 Logit。训练时交给 `CrossEntropyLoss`，不在 `forward` 内先做 Softmax。

下一篇：[ResNet](#resnet-%E6%AE%8B%E5%B7%AE%E5%9D%97-%E9%98%B6%E6%AE%B5%E7%BB%93%E6%9E%84%E4%B8%8E%E4%B8%8B%E9%87%87%E6%A0%B7)。

### 参考资料

- [Dive into Deep Learning：Convolutions for Images](https://d2l.ai/chapter_convolutional-neural-networks/conv-layer.html)
- [Dive into Deep Learning：Padding and Stride](https://d2l.ai/chapter_convolutional-neural-networks/padding-and-strides.html)
- [Dive into Deep Learning：Channels](https://d2l.ai/chapter_convolutional-neural-networks/channels.html)
- [Dive into Deep Learning：Pooling](https://d2l.ai/chapter_convolutional-neural-networks/pooling.html)

## ResNet：残差块、阶段结构与下采样

### 从残差连接到卷积网络

[残差连接](./neural-network-fundamentals.md#%E6%AE%8B%E5%B7%AE%E8%BF%9E%E6%8E%A5-%E6%81%92%E7%AD%89%E8%B7%AF%E5%BE%84-%E6%8A%95%E5%BD%B1%E4%B8%8E%E5%BD%92%E4%B8%80%E5%8C%96%E4%BD%8D%E7%BD%AE)计算 $\mathbf y=\mathbf x+F(\mathbf x)$，使信息和梯度可以沿捷径传播。ResNet 将这种结构用于深层卷积网络。

更深的网络理论上可以把新增层设成恒等映射，从而不比浅网络差，但普通深层网络在训练中可能出现退化：训练误差反而更高。残差块把目标改写为学习相对输入的修正，使恒等情况更容易表达。这与训练集表现很好、验证集变差的过拟合不是同一个现象。

### BasicBlock

ResNet-18 和 ResNet-34 使用 BasicBlock。主分支包含两个 $3\times3$ 卷积：

$$
F(X)=\operatorname{BN}_2\left(\operatorname{Conv}_{3\times3,2}\left(
\operatorname{ReLU}(\operatorname{BN}_1(\operatorname{Conv}_{3\times3,1}(X)))
\right)\right).
$$

原始 ResNet v1 在相加后再使用 ReLU：$Y=\operatorname{ReLU}(S(X)+F(X))$。当形状相同时，$S(X)=X$；否则用投影对齐。

```python
import torch
from torch import nn

class BasicBlock(nn.Module):
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        residual = torch.relu(self.bn1(self.conv1(x)))
        residual = self.bn2(self.conv2(residual))
        return torch.relu(self.shortcut(x) + residual)

same = BasicBlock(64, 64)
down = BasicBlock(64, 128, stride=2)
print(same(torch.randn(2, 64, 32, 32)).shape)
print(down(torch.randn(2, 64, 32, 32)).shape)
```

输出分别是 `(2,64,32,32)` 和 `(2,128,16,16)`。第一种捷径为恒等映射；第二种用步幅 2 的 $1\times1$ 卷积同时减小空间尺寸、增加通道。

投影条件是结构的一部分，应在构造时决定。前向中不能临时创建卷积层，否则参数不会作为稳定的模型参数被正确训练和保存。

### Bottleneck

ResNet-50、101、152 使用 Bottleneck。主分支依次为：

1. $1\times1$ 卷积把通道降到内部宽度 $C$。
2. $3\times3$ 卷积处理空间邻域。
3. $1\times1$ 卷积将通道扩展到 $4C$。

“瓶颈”指中间通道比输出通道窄，不是让输入信息只能通过一个标量。扩展倍数在经典 ResNet Bottleneck 中为 4。

```python
import torch
from torch import nn

class Bottleneck(nn.Module):
    expansion = 4

    def __init__(self, in_channels, channels, stride=1):
        super().__init__()
        out_channels = channels * self.expansion
        self.conv1 = nn.Conv2d(in_channels, channels, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, stride, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.conv3 = nn.Conv2d(channels, out_channels, 1, bias=False)
        self.bn3 = nn.BatchNorm2d(out_channels)
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        residual = torch.relu(self.bn1(self.conv1(x)))
        residual = torch.relu(self.bn2(self.conv2(residual)))
        residual = self.bn3(self.conv3(residual))
        return torch.relu(self.shortcut(x) + residual)

block = Bottleneck(64, 64)
print(block(torch.randn(2, 64, 32, 32)).shape)
```

输出 `(2,256,32,32)`。因为输入 64 通道与输出 256 通道不一致，捷径必须投影。

若输入、内部宽度和输出都直接使用 256 通道，三个卷积的无偏置参数约为 $256^2+9\times256^2+256^2$；瓶颈的相应参数约为 $256\times64+9\times64^2+64\times256$，明显更少。具体网络还包含归一化参数和投影层。

### Stage 如何组成

经典 ResNet 先用 Stem 提取低分辨率特征，再经过四个 Stage。一个 Stage 保持输出通道数一致；除第一个 Stage 外，首块通常使用步幅 2 下采样并增加通道，后续块使用步幅 1。

| 模型 | 块类型 | 四个 Stage 的块数 | 卷积层计数 |
| --- | --- | --- | --- |
| ResNet-18 | BasicBlock | `[2,2,2,2]` | $1+2(2+2+2+2)+1=18$ |
| ResNet-34 | BasicBlock | `[3,4,6,3]` | $1+2(3+4+6+3)+1=34$ |
| ResNet-50 | Bottleneck | `[3,4,6,3]` | $1+3(3+4+6+3)+1=50$ |
| ResNet-101 | Bottleneck | `[3,4,23,3]` | $1+3(3+4+23+3)+1=101$ |

计数包含 Stem 卷积和最终全连接层，不把投影捷径计入命名层数。因此不能仅统计代码里所有 `Conv2d` 实例来复现名字中的数字。

### 构建 ResNet-18

下面使用 ImageNet 风格 Stem：$7\times7$、步幅 2 的卷积后接 $3\times3$ 最大池化。输入 $224\times224$ 时，空间尺寸依次约为 112、56、56、28、14、7。

```python
import torch
from torch import nn

class ResNet(nn.Module):
    def __init__(self, block, blocks_per_stage, classes):
        super().__init__()
        self.in_channels = 64
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 7, 2, 3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(3, 2, 1),
        )
        self.stage1 = self.make_stage(block, 64, blocks_per_stage[0], 1)
        self.stage2 = self.make_stage(block, 128, blocks_per_stage[1], 2)
        self.stage3 = self.make_stage(block, 256, blocks_per_stage[2], 2)
        self.stage4 = self.make_stage(block, 512, blocks_per_stage[3], 2)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.classifier = nn.Linear(512 * block.expansion, classes)

    def make_stage(self, block, channels, blocks, stride):
        layers = [block(self.in_channels, channels, stride)]
        self.in_channels = channels * block.expansion
        layers.extend(block(self.in_channels, channels) for _ in range(1, blocks))
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.stem(x)
        x = self.stage1(x)
        x = self.stage2(x)
        x = self.stage3(x)
        x = self.stage4(x)
        return self.classifier(self.pool(x).flatten(1))

model = ResNet(BasicBlock, [2, 2, 2, 2], classes=1000)
model.eval()
with torch.no_grad():
    logits = model(torch.randn(1, 3, 224, 224))
print(logits.shape)
```

输出 `(1,1000)`。`make_stage` 先建立可能下采样的首块，再更新当前通道数；生成器只用于建立其余同形块，不进行数据过滤或聚合。

对较小图像，常把 Stem 改成 $3\times3$、步幅 1，并去掉最大池化，避免过早丢失空间信息。网络结构应与输入分辨率和任务匹配。

### 参数初始化与最后一个归一化层

卷积常使用适合 ReLU 的 He 初始化，BatchNorm 的缩放初始为 1、偏置为 0。还有一种常用做法是把每个残差分支最后一个 BatchNorm 的缩放 $\gamma$ 初始化为 0，使分支初始输出接近零；这需要显式修改默认初始化。

这种初始化只改变训练起点，不会把分支永久关闭。采用其他残差结构或归一化顺序时，应重新检查对应位置。

### 训练与使用时的检查

- 输入归一化必须与预训练权重一致；迁移学习时替换最终分类头。
- BatchNorm 在训练和评估使用不同统计量，推理前调用 `eval()`。
- 下采样块同时核对主分支和捷径的空间尺寸与通道。
- 分类输出是 Logit，训练时直接交给交叉熵。
- 模型更深不保证目标数据上更好，仍需按[数据划分与评估](./machine-learning-theory.md#%E6%95%B0%E6%8D%AE%E5%88%92%E5%88%86-%E4%BA%A4%E5%8F%89%E9%AA%8C%E8%AF%81%E4%B8%8E%E6%95%B0%E6%8D%AE%E6%B3%84%E6%BC%8F)比较。

### 参考资料

- [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385)
- [Dive into Deep Learning：Residual Networks](https://d2l.ai/chapter_convolutional-modern/resnet.html)

## Vision Transformer：图像分块与编码

### 图像变成 Token 序列

Vision Transformer（ViT）把图像切成互不重叠的 Patch，将每个 Patch 映射为一个 Token，再交给 [Transformer Encoder](./attention-and-transformer.md#transformer-%E5%B1%82%E7%BB%93%E6%9E%84-encoder-%E4%B8%8E-decoder)。

输入图像形状为 $(N,C,H,W)$，正方形 Patch 边长为 $P$，且 $H,W$ 能被 $P$ 整除，则 Patch 数量为：

$$
L=\frac HP\frac WP.
$$

每个 Patch 展平后有 $CP^2$ 个值，通过线性层投影到 $d_{\text{model}}$。对每个不重叠 Patch 使用核大小和步幅都为 $P$ 的卷积，与“切块、展平、再使用同一个线性层”等价。

```python
import torch

torch.manual_seed(42)
images = torch.randn(2, 3, 32, 48)
patch_size, model_dim = 8, 64
projection = torch.nn.Conv2d(
    3, model_dim, kernel_size=patch_size, stride=patch_size
)
feature_map = projection(images)
tokens = feature_map.flatten(2).transpose(1, 2)
print(feature_map.shape)
print(tokens.shape)
```

特征图为 `(2,64,4,6)`，按行优先展平空间位置后得到 24 个 Token，形状为 `(2,24,64)`。

如果高或宽不能整除 Patch 大小，普通卷积会舍弃末尾不足一个核的区域。预处理必须明确缩放、裁剪或补齐规则，不能让边缘像素无意消失。

### 分类 Token 与位置 Embedding

原始 ViT 在 Patch Token 前添加一个可学习的分类 Token，记作 `[CLS]`，并给整段序列加可学习位置 Embedding：

$$
Z_0=[x_{\mathrm{cls}};x_p^1;\ldots;x_p^L]+E_{\mathrm{pos}}.
$$

经过所有 Encoder Layer 后，分类头读取最终 `[CLS]` 表示。它不是某个图像 Patch，而是一个通过 Self-Attention 汇聚全图信息的可学习位置。其他视觉 Transformer 也可以使用有效 Patch 的平均池化，不能把 `[CLS]` 当作 Transformer 的必需结构。

```python
import torch

torch.manual_seed(42)
patch_tokens = torch.randn(2, 24, 64)
cls_token = torch.nn.Parameter(torch.zeros(1, 1, 64))
position = torch.nn.Parameter(torch.randn(1, 25, 64) * 0.02)
sequence = torch.cat((cls_token.expand(len(patch_tokens), -1, -1), patch_tokens), dim=1)
sequence = sequence + position
print(sequence.shape)
```

序列长度从 24 变为 25，位置表也必须有 25 个位置。

### 最小 ViT

下面只保留 ViT 的核心路径：Patch Projection、`[CLS]`、位置 Embedding、Pre-Norm Transformer Encoder 和分类头。

```python
import torch
from torch import nn

class VisionTransformer(nn.Module):
    def __init__(self, image_size, patch_size, classes, model_dim, heads, layers):
        super().__init__()
        patch_count = (image_size // patch_size) ** 2
        self.patch_projection = nn.Conv2d(
            3, model_dim, kernel_size=patch_size, stride=patch_size
        )
        self.cls_token = nn.Parameter(torch.zeros(1, 1, model_dim))
        self.position = nn.Parameter(torch.randn(1, patch_count + 1, model_dim) * 0.02)
        encoder_layer = nn.TransformerEncoderLayer(
            model_dim,
            heads,
            dim_feedforward=model_dim * 4,
            dropout=0.0,
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, layers)
        self.norm = nn.LayerNorm(model_dim)
        self.classifier = nn.Linear(model_dim, classes)

    def forward(self, images):
        tokens = self.patch_projection(images).flatten(2).transpose(1, 2)
        cls = self.cls_token.expand(len(images), -1, -1)
        tokens = torch.cat((cls, tokens), dim=1) + self.position
        return self.classifier(self.norm(self.encoder(tokens)[:, 0]))

torch.manual_seed(42)
model = VisionTransformer(32, 8, classes=10, model_dim=64, heads=4, layers=2)
logits = model(torch.randn(2, 3, 32, 32))
print(logits.shape)
```

输出 `(2,10)` 是分类 Logit。示例固定输入为 $32\times32$；若传入其他尺寸，Patch 数量与位置表长度不再匹配，应立即报错或显式插值位置参数。

### 输入分辨率与位置插值

从 $H/P\times W/P$ 的 Patch 网格微调到新分辨率时，可把 `[CLS]` 位置向量保留，把 Patch 位置向量恢复成二维网格后插值。不能直接对包含 `[CLS]` 的一维序列整体插值，因为 `[CLS]` 不属于空间网格。

```python
import torch
import torch.nn.functional as F

position = torch.randn(1, 17, 8)
cls_position = position[:, :1]
patch_position = position[:, 1:].reshape(1, 4, 4, 8).permute(0, 3, 1, 2)
patch_position = F.interpolate(
    patch_position, size=(6, 6), mode='bicubic', align_corners=False
)
patch_position = patch_position.permute(0, 2, 3, 1).reshape(1, 36, 8)
resized_position = torch.cat((cls_position, patch_position), dim=1)
print(resized_position.shape)
```

从 $4\times4$ Patch 网格变为 $6\times6$，最终位置表含一个 `[CLS]` 和 36 个 Patch，形状为 `(1,37,8)`。

### Patch 大小的影响

Patch 越小，局部细节越完整，但 Token 数量越多。固定图像尺寸时，Patch 边长减半会让 Token 数约变为 4 倍，标准 Self-Attention 的 $L^2$ 分数矩阵约变为 16 倍。

ViT 的 Patch Projection 具有局部感受野，但标准 Encoder 从第一层起即可连接任意 Patch。与 CNN 相比，它较少显式使用局部连接和平移等变先验，因此数据规模、增强和预训练方式对效果很重要。

### 训练与迁移

图像分类训练仍对分类 Logit使用交叉熵。预训练模型迁移到新任务时，需要保持其图像归一化、Patch 大小、位置处理和分类表示方式一致；只复制 Encoder 权重而忽略预处理会造成输入分布不匹配。

作为 [CLIP](./clip.md#%E5%8F%8C%E7%BC%96%E7%A0%81%E5%99%A8%E7%BB%93%E6%9E%84) 的图像编码器时，ViT 输出先经过投影头映射到共享图文空间，再进行 L2 归一化，而不是直接使用分类 Softmax 概率。

### 参考资料

- [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929)
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
