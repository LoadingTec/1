很好，我们把问题严格建模一下：

目标是建立一条链路：

[
\textbf{缺陷物理尺寸} \rightarrow \textbf{Pixel 尺度} \rightarrow \textbf{SNR} \rightarrow \textbf{检测概率}
]

并最终给出：

[
\boxed{\text{H3000 最小可检缺陷尺寸表达式}}
]

---

# 一、Pixel 尺度与 SNR 的关系（从统计本质出发）

## 1️⃣ 信号模型

假设暗场下单个缺陷成像为一个二维高斯 spot：

[
I(x,y) = I_0 \exp\left(-\frac{x^2+y^2}{2\sigma^2}\right)
]

离散到像素后：

* Pixel size = p
* PSF 宽度 ≈ σ
* 缺陷在图像中占据：

[
N_{pix} \sim \left(\frac{d_{img}}{p}\right)^2
]

其中
( d_{img} ) = 缺陷在像面的等效直径

---

## 2️⃣ 总信号能量

若单像素信号均值为 ( S )，噪声为 ( \sigma_n )

总信号：

[
S_{tot} \propto N_{pix}
]

总噪声（独立噪声）：

[
\sigma_{tot} \propto \sqrt{N_{pix}}
]

---

## 3️⃣ SNR 推导

[
SNR = \frac{S_{tot}}{\sigma_{tot}}
]

[
SNR \propto \frac{N_{pix}}{\sqrt{N_{pix}}}
]

[
\boxed{SNR \propto \sqrt{N_{pix}}}
]

代入像素关系：

[
N_{pix} \sim \left(\frac{d_{img}}{p}\right)^2
]

得到：

[
\boxed{
SNR \propto \frac{d_{img}}{p}
}
]

---

# 🔥 关键结论 1

[
\boxed{
SNR \sim \frac{\text{缺陷像面尺寸}}{\text{Pixel Size}}
}
]

**SNR 与缺陷尺寸成线性关系**

---

# 二、把光学放进来

像面尺寸：

[
d_{img} = M \cdot d_{wafer}
]

其中：

* ( M ) = 光学放大率
* ( d_{wafer} ) = 实际缺陷尺寸

则：

[
SNR \sim \frac{M \cdot d_{wafer}}{p}
]

---

# 三、检测概率模型

经验上，检测概率近似 logistic：

[
P_{det} =
\frac{1}{1 + \exp(-k(SNR - SNR_0))}
]

其中：

* ( SNR_0 ) = 检测阈值
* k = 过渡陡峭度

通常工程上：

[
SNR_0 \approx 5
]

（对应 false alarm 可控）

---

# 四、推导 H3000 最小可检尺寸

设：

* Pixel size = p
* 放大率 = M
* 最小可检 SNR = SNR₀

由：

[
SNR = C \frac{M d}{p}
]

设常数 C≈1（归一化）

令：

[
SNR = SNR_0
]

得到：

[
\boxed{
d_{min} =
\frac{p}{M} \cdot SNR_0
}
]

---

# 五、代入典型 H3000 参数（举例）

假设：

* Pixel = 5 µm
* 放大率 M = 10
* SNR₀ = 5

则：

[
d_{min} =
\frac{5}{10} \cdot 5
= 2.5 , \mu m
]

---

# 🔥 关键结论 2

[
\boxed{
d_{min} \propto \frac{p}{M}
}
]

而不是直接由 NA 决定。

NA 决定的是 PSF 宽度（信息带宽），
Pixel/M 决定的是采样能力。

---

# 六、与 CRLB 统一

CRLB 定位极限：

[
\sigma_x \ge \frac{\lambda}{2\pi NA \sqrt{N}}
]

而检测极限：

[
d_{min} \sim \frac{p}{M} \cdot SNR_0
]

统一视角：

| 限制类型    | 主导因素      |
| ------- | --------- |
| 光学分辨率极限 | λ / NA    |
| 统计定位极限  | √N        |
| AI检测极限  | Pixel / M |
| 暗场尺寸极限  | SNR       |

---

# 七、把完整链路写成一条公式

[
\boxed{
d_{min}
=======

\frac{p}{M}
\cdot
\frac{SNR_0}{C}
}
]

其中 C 包含：

* 散射强度系数
* NA 收集效率
* 光源功率
* 积分时间

---

# 八、真正影响 H3000 尺寸下限的 5 个旋钮

1️⃣ Pixel size
2️⃣ 放大率 M
3️⃣ 光强 / 曝光时间
4️⃣ NA
5️⃣ 背景噪声（暗场设计质量）

---

# 九、工程结论

如果你想把 H3000 从 2.5 µm 推到 1 µm：

必须满足：

[
\frac{M}{p}
\text{ 提升 2.5 倍}
]

或：

[
SNR 提升 2.5 倍
]

否则算法无论如何优化，都无法突破。

---

如果你愿意，我可以：

* 画出「缺陷尺寸 vs SNR vs 检测概率」三维图
* 推导 NA、λ、曝光时间如何进入 C
* 用你真实的 H3000 参数算一个精确下限
* 或把这套推导写成“技术白皮书级”文档

你想走工程实算，还是理论统一框架？
