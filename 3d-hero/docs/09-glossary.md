# INTRE 3D Hero — 术语对照表（Glossary）

> **文件编号**：09-glossary.md（MECE 编号体系：第 7 阶段 · 术语对照）
> **本文件位置**：UI 设计流程**第 7 阶段 · 术语对照**
> **关联文档**：[00-progress.md](./00-progress.md) · [01-prd.md](./01-prd.md) · [02-ia.md](./02-ia.md) · [11-ui-elements-index.md](./11-ui-elements-index.md)
> **版本**：v1.0
> **日期**：2026-07-24
> **状态**：✅ 初版

---

## 0. 用途说明

本文档是 INTRE 3D Hero 子项目的**项目级术语对照表**，确保：

1. **设计/开发/QA 协作语言统一**（同一个词指同一件事）
2. **跨阶段引用无歧义**（D 决策 / Q 决策 / # 元素编号都能查到这里）
3. **MECE 编号体系可追溯**（每个术语在哪个件套定义）

> 顶层 INTRE 术语表见 `06-格式治理/06-S-02-INTRE-术语对照表.md`（D1b 级）。本文档**仅收录 3D Hero 子项目特有术语**，不重复顶层定义。

---

## 1. 4 幕叙事术语（RCT × 4）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| RCT1 | Roll Call Timestamp 1 · 开场 | INTRE 品牌入口幕，p ∈ [0, 0.24] | `02-ia.md §3.1` |
| RCT2 | Roll Call Timestamp 2 · 现象层 | 星座浮现与漏斗收敛幕，p ∈ [0.26, 0.52] | `02-ia.md §3.1` |
| RCT3 | Roll Call Timestamp 3 · 功能层 | 6×7 晶格核心展示幕，p ∈ [0.52, 0.82] | `02-ia.md §3.1` |
| RCT4 | Roll Call Timestamp 4 · 神经层 | 脑图永驻幕，p ∈ [0.80, 1.00] | `02-ia.md §3.1` |
| 淡入区间 | inA–inB | 文本浮岛透明度由 0→1 的进度区间 | `02-ia.md §3.2` |
| 满显 | Full Display | 当前幕内容完整可读、无任何透明度 | `06-design-spec.md §0` |
| 稳态 | Steady State | 视觉元素完成入场进入静止/呼吸 | `06-design-spec.md §0` |
| 永驻 | Permanent | 一旦满显就不退场（直到页面刷新） | `06-design-spec.md §0` |

---

## 2. 滚动驱动术语（Scroll-driven）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| 滚动进度 p | Scroll Progress | p ∈ [0, 1]，由 `scrollY / max` 派生 | `06-design-spec.md §0` |
| 滚轮进度 raw | Raw Scroll | 实际滚轮产生的线性进度，p 经 `pace()` 重映射而来 | `02-ia.md §3.2` |
| 场景进度 pm | Scene Progress | pace() 重映射后的非线性进度，供所有消费者使用 | `02-ia.md §3.2` |
| pace() 函数 | Pace Function | 9 个 `[raw, pm]` 控制点的 Fritsch-Carlson 单调三次插值 | `01-prd.md D26` |
| 1170vh 滚动 | 1170vh Scroll | 总滚动高度，RCT1→2 紧凑快切 + RCT2/3/4 满屏停留 | `01-prd.md D02` |
| 0.06 lerp 平滑 | 0.06 lerp Smoothing | pCur = 0.06 lerp 平滑，消除分段线性的微小 kink | `02-ia.md §3.2` |
| 幕边界阈值 | Act Boundary | 统一 0.30 / 0.52 / 0.80，驱动 checkActChange | `01-prd.md D25` |

---

## 3. 3D 场景术语（Three.js Scene）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| uLattice | Lattice Uniform | 晶格展开进度 0→1（圆柱态→蜂巢态→棋谱态） | `06-design-spec.md §4.3` |
| uConverge | Converge Uniform | 星座向中心收敛进度 0→1 | `06-design-spec.md §4.2` |
| uLatticeSpread | Lattice Spread Uniform | 星辰从漏斗散开铺满棋盘进度 | `01-prd.md D20` |
| uStarFade | Star Fade Uniform | 星辰整体淡出进度（RCT3 后期） | `06-design-spec.md §4.2` |
| uDimFade | Dim Star Fade Uniform | 暗星在 RCT2 收敛期淡至 0.3 | `00-progress.md v2.4` |
| fiberFade | Fiber Fade | DTI 纤维束淡入进度 0→1 | `06-design-spec.md §4.4` |
| brainReveal | Brain Reveal | 脑图微提亮进度（额外 15% 透明度） | `06-design-spec.md §4.4` |
| brainScale | Brain Scale | 脑图缩放系数 1.0→2.1 | `01-prd.md D04` |
| BRAIN_SX | Brain Scale X | 14/16，DTI 平面 x 方向缩窄补偿 | `06-design-spec.md §4.4` |
| brainSDF | Brain SDF | 大脑/颞叶/小脑三椭圆并集 SDF | `06-design-spec.md §4.4` |
| sampleInBrain | Sample In Brain | 在脑内随机采样的工具函数 | `04-d21-transition-design.md §2` |
| AdditiveBlending | 加法混合 | 星场/通道粒子的自然辉光混合模式 | `pages/3d-hero.html` |
| Fragment Shader | 片段着色器 | GPU 上每像素运行的着色器 | `pages/3d-hero.html` |
| Vertex Shader | 顶点着色器 | GPU 上每顶点运行的着色器 | `pages/3d-hero.html` |
| smoothstep | 平滑阶跃 | 0→1 的 Hermite 平滑插值 | `pages/3d-hero.html` |
| clock | THREE.Clock | Three.js 时间管理 | `pages/3d-hero.html` |
| Three.js r160 | Three.js r160 | 3D 渲染库，2023-12-15 发布 | `lib/three.module.js` |

---

## 4. 相机术语（Camera Trajectory）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| KEYS | Camera Keyframes | 6 个相机关键帧 K0-K5 数组 | `06-design-spec.md §2` |
| K0 | Keyframe 0 | p=0，极远高俯瞰整片星空 | `06-design-spec.md §2` |
| K1 | Keyframe 1 | p=0.25，星座渐入眼底 | `06-design-spec.md §2` |
| K2 | Keyframe 2 | p=0.50，接近圆柱星系 | `06-design-spec.md §2` |
| K3 | Keyframe 3 | p=0.60，棋盘正读起点 | `06-design-spec.md §2` |
| K3b | Keyframe 3b | p=0.74，平台期终点 | `06-design-spec.md §2` |
| K4 | Keyframe 4 | p=0.84，越过晶格向神经层下行 | `06-design-spec.md §2` |
| K5 | Keyframe 5 | p=1.00，与脑图平面齐平 | `06-design-spec.md §2` |
| lookPos | Look Position | 相机注视点（look-at target） | `pages/3d-hero.html` |
| 鼠标视差 | Mouse Parallax | ±12° 水平 / ±6.9° 垂直受控偏航 | `06-design-spec.md §1.1` |

---

## 5. 棋盘术语（Lattice · 42 Nodes）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| M-R-D-S | Module × Resource-Dispatch-Structure | 6 模块 × 7 维度 = 42 维状态向量 | `01-prd.md` D02 |
| M1-M6 | Modules 1-6 | 6 大功能模块：具身/认知/意志/情绪/言语/行为 | `01-prd.md` 附录 A |
| G-M-A-R | Generate-Modify-Anchor-Release | 4 类原子操作语法 | `01-prd.md` D02 |
| RES-D / RES-B | Resource Descriptive / Basic | 资源维度 - 描述性/基础 | `02-ia.md §4.4` |
| DSP-F / DSP-B | Dispatch Forward / Backward | 调度维度 - 前向/后向 | `02-ia.md §4.4` |
| STR-R / STR-C / STR-S | Structure Resource/Core/System | 结构维度 - 资源/核心/系统策略 | `02-ia.md §4.4` |
| 42 节点 | 42 Lattice Nodes | 6×7 矩阵的 42 个交点 | `02-ia.md §4.4` |
| 节点详情面板 | Node Detail Panel | #14，点击节点弹出五区域面板 | `11-ui-elements-index.md` |
| INTRE_NODES | Nodes Data | 42 节点详情数据（`window.INTRE_NODES`） | `lib/node-details.js` |
| INTRE_MODULES | Modules Data | 6 模块名数组（`window.INTRE_MODULES`） | `lib/node-details.js` |
| INTRE_SUBDIMS | Subdimensions Data | 7 维度定义数组（`window.INTRE_SUBDIMS`） | `lib/node-details.js` |
| latBase | Lattice Base | 晶格连线透明度基线 0.55 + 0.25 × uLattice | `00-progress.md v2.4` |
| 蜂巢态 | Honeycomb State | 晶格中间过渡态（六边形斜管） | `06-design-spec.md §4.3` |
| 棋谱态 | Board State | 晶格稳态（横平竖直矩形网格） | `06-design-spec.md §4.3` |
| 圆柱态 | Cylinder State | 晶格初始态（环状半径 5.5） | `06-design-spec.md §4.3` |

---

## 6. 通道色术语（Channel Colors）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| UPLS | Unified Psychological Language System | 统一心理语言系统（语义通道） | `06-S-05 §3.4` |
| UNIS | Unified Neural Interface System | 统一神经接口系统（神经通道） | `06-S-05 §3.4` |
| UBMS | Unified Behavior Measurement System | 统一行为测量系统（行为通道） | `06-S-05 §3.4` |
| PSE | Psychological System Engine | 心理系统计算引擎 | `06-S-05 §3.4` |
| REVER | REVER Ethical Engine | 伦理门控引擎 | `06-S-05 §3.4` |
| 大地色 | Earth Tone | v2.3 起的 5 种通道色（饱和度低、向灰色偏移 15%） | `06-S-05 §3.4` |
| 通道粒子 | Channel Particles | UPLS/UNIS/UBMS 沿 CatmullRom 曲线流动的点粒子 | `01-prd.md D36` |

---

## 7. 决策编号术语（Decision Codes）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| D01-D38 | PRD Decisions 1-38 | PRD §9 决策记录的 38 个决策 | `01-prd.md §9` |
| Q1-Q10 | v2.1 Decisions 1-10 | v2.1 收尾冲刺的 10 个 Q 决策 | `00-progress.md v2.1` |
| 决策记录 | Decision Log | 追踪"我们为什么这么做"的轻量日志 | `01-prd.md §9` |
| 替代方案 | Alternative | 决策表"被否"列，记录已被否决的备选 | `01-prd.md §9` |

### 7.1 关键 D 决策速查

| 编号 | 主题 | 关联 |
|------|------|------|
| D02 | 1170vh 滚动叙事 | 滚动节奏 |
| D04 | 脑图 scale 1.0→2.1 | RCT4 视觉 |
| D08 | 字体栈 | 字体体系 |
| D22 | 去扫光 | v2.3 修订 |
| D24 | 品牌色权威（大地色） | v2.4 修订 |
| D25 | 幕边界统一 0.30/0.52/0.80 | v2.4 修订 |
| D26 | pace() Fritsch-Carlson | v2.4 修订 |
| D27 | 帧率无关化（dt） | v2.4 修订 |
| D32 | WebGL Bloom 后处理 | v2.5 升级（**已禁用**） |
| D33 | 3D 脑模型 + DTI 投影 | v2.5 升级 |
| D34 | 真实星座数据 | v2.5 升级 |
| D35-D38 | D21 转场 A+D 混合 | v2.5 升级 |

---

## 8. UI 元素编号（UI Element Codes）

> 完整定义见 `11-ui-elements-index.md`，本文档仅列速查

| 编号 | 名称 | 编号 | 名称 |
|------|------|------|------|
| #01 | 右侧三层指示器 | #09 | 拖尾粒子 |
| #02 | 数据流连线 | #10 | 幕切换扫光（v2.3 已移除） |
| #03 | 坐标实时读数 | #11 | 粒子爆发 |
| #04 | 遥测 HUD | #12 | 打字机效果 |
| #05 | 键盘切幕提示 | #13 | 数字滚动 0→42 |
| #06 | 噪点叠加 | #14 | 节点详情面板 |
| #07 | 辉光泛光（v2.5 已禁用） | #15 | 通道状态灯 |
| #08 | 自定义光标 | | |

---

## 9. 设计 token 术语（Design Tokens）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| Navy 950 | Navy 950 | `#0A1E3D` 最深底色 | `06-S-05 §3.1` |
| Navy 800 | Navy 800 | `#122F5C` 深色导航栏背景 | `06-S-05 §3.1` |
| Navy 600 | Navy 600 | `#1F4880` 主色 | `06-S-05 §3.1` |
| Amber 500 | Amber 500 | `#F59E0B` 次要强调 | `06-S-05 §3.2` |
| Amber 600 | Amber 600 | `#D97706` 强调 | `06-S-05 §3.2` |
| --intre-navy-XXX | INTRE Navy XXX | 3D 子项目 CSS 变量命名空间 | `colors_and_type.css` |
| --color-navy-XXX | Color Navy XXX | 2D 网站 CSS 变量命名空间 | `-website/shared/brand.css` |
| --type-display | Type Display | 3D 视觉角色别名 → clamp(4.5rem, 9vw, 8rem) | `06-design-spec.md §8.3` |
| --text-XXX | Text XXX | 2D 字号阶梯（9 级 rem） | `-website/shared/brand.css` |
| 焦点指示 | Focus Indicator | 2px Navy 50 + 2px 偏移 | `01-prd.md D24` |
| 品牌曲线 | Brand Easing | `cubic-bezier(0.16, 1, 0.3, 1)` | `01-prd.md D24` |

---

## 10. 部署与版本术语（Deployment & Versioning）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| v2.1 | Version 2.1 | 收尾冲刺版本（10 Q 决策落地） | `00-progress.md v2.1` |
| v2.2 | Version 2.2 | 节奏优化（520vh→1170vh + pace()） | `00-progress.md v2.2` |
| v2.3 | Version 2.3 | 去扫光 + 星辰棋盘重叠 | `00-progress.md v2.3` |
| v2.4 | Version 2.4 | 系统审查修复 + 品牌规范对齐 | `00-progress.md v2.4` |
| v2.5 | Version 2.5 | 视觉质量升级（5 阶段执行中） | `05-tech-impl-spec.md` |
| ?prod=1 | Production Mode | URL 参数切换生产模式（隐藏 HUD） | `06-design-spec.md §13` |
| ?cb= | Cache Bust | URL 参数强制刷新（避免浏览器缓存） | — |
| 同域部署 | Same-domain Deploy | 3D Hero 部署为 2D 网站的子目录 | `01-prd.md D19` |
| GitHub Pages | GitHub Pages | 静态站点托管平台 | `-website/README.md` |

---

## 11. 治理文档术语（Governance Documents）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| 五阶段 | 5-Phase Process | 战略对齐 → 信息架构 → 低保真 → 设计图稿 → 高保真原型 | `07-ui-design-system.md` |
| MECE | Mutually Exclusive, Collectively Exhaustive | 相互独立、完全穷尽（编号体系原则） | 本文档 |
| 颜色比例 | Color Ratio | Navy 90% / Amber 5% / 通道色 5% | `06-S-05 §3.5` |
| WCAG 2.1 AA | WCAG 2.1 AA | Web 内容可访问性指南 AA 级 | `01-prd.md D10` |
| 诚实声明 | Honest Statement | 学术项目明确当前局限 | `01-prd.md §10.4` |
| 包豪斯内核 | Bauhaus Core | 功能决定形式（视觉哲学） | `06-S-05 §1.2` |
| 苹果简约 | Apple Minimalism | 极致减法 + 呼吸感 | `06-S-05 §1.2` |

---

## 12. 验收术语（QA & Compliance）

| 术语 | 英文 | 定义 | 关联文档 |
|------|------|------|----------|
| LCP | Largest Contentful Paint | 最大内容绘制时间（性能指标） | `01-prd.md §4.4` |
| WCAG | Web Content Accessibility Guidelines | Web 内容可访问性指南 | `01-prd.md D10` |
| prefers-reduced-motion | Reduce Motion | 用户系统级减少动效偏好 | `06-design-spec.md §7.4` |
| burst | Particle Burst | 幕切换时 24 粒子爆发（#11） | `11-ui-elements-index.md` |
| fallback | Static Fallback | WebGL 不可用时的静态降级页 | `03-wireframe.md §7` |
| reduced-motion 静帧 | Reduced-motion Still Frame | p=0.86 约束态静帧（D37） | `04-d21-transition-design.md §6.5` |

---

## 13. 修订日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-24 | 初版：13 类术语速查表（MECE 编号体系补缺） |

---

*本文档按 MECE 编号体系作为 `09-glossary.md` 补缺创建，与 `00-progress.md` ~ `11-ui-elements-index.md` 共同构成完整的 12 件套文档体系。*
