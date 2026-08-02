# INTRE 3D Hero 子项目 — 系统介绍

> **项目位置**：`d:\INTRE\intre-3d-hero\`
> **项目状态**：v2.5 视觉质量升级定稿（部分功能已实现，部分待执行）
> **最后更新**：2026-07-24
> **本文档性质**：子项目完整系统介绍（项目层级 · 文件结构 · 内容资产 · 治理状态 · 上下游衔接）

---

## 一、项目层级与定位

### 1.1 INTRE 顶层结构

INTRE（Integrated Psychological Layer Engineering）是功能层心理学（FLP）的工程实现框架。其顶层结构采用**三种子项目并列**的形态：

```
INTRE 顶层
├── 00-阅读指南 ~ 10-外部探索（10 大模块理论文档库，数百篇 md）
├── Website/                ← INTRE Website 子项目
│   ├── -website/           ← 2D 静态官网（GitHub Pages 已上线）
│   └── intre-3d-hero/      ← 3D 交互首页（本子项目）
└── 历史文档/ 共享智能体工具/ 元数据
```

### 1.2 3D Hero 在 Website 子项目中的角色

```
Website/ 子项目
├── -website/（2D 静态官网 · 已上线）
│   ├── index.html              ← 首页（含"3D 体验"入口链接）
│   ├── upls/unis/ubms/pse/rever/  ← 五大模块子站
│   ├── textbook/               ← 29 章 + 14 附录教材
│   ├── glossary/               ← 术语表
│   ├── shared/                 ← 共享品牌 token 与组件
│   └── assets/                 ← Logo、favicon、OG image
│
└── intre-3d-hero/（3D 交互首页 · 本文档主体）
    ├── pages/3d-hero.html      ← 单页滚动叙事
    ├── lib/                    ← Three.js + 节点数据
    ├── docs/                   ← 设计文档 12 件套
    ├── archive/                ← 历史归档（2026-07-24 起）
    └── colors_and_type.css     ← 设计 token
```

**3D Hero 与 2D 网站的协作关系**：
- 2D 网站是**内容枢纽**（深度阅读、模块详解、教材、术语表）
- 3D Hero 是**叙事入口**（2-3 分钟建立心智模型）
- 出口链接系统：3D Hero 全部指向 2D 网站（`../upls/` 等相对路径）
- 入口引导：2D 网站首页加"3D 体验"按钮（v2.1 决策 Q4）

---

## 二、子项目根目录文件结构

`intre-3d-hero/` 包含 8 类文件：

### 2.1 核心代码资产（4 项）

| 文件 | 大小 | 性质 | 作用 |
|------|------|------|------|
| `pages/3d-hero.html` | 约 2500 行 | 单页应用 | 整个 3D 首页实现（HTML + CSS + JS 内联） |
| `lib/three.module.js` | ~600 KB | 第三方库 | Three.js r160 核心（本地化，无 CDN 依赖） |
| `lib/node-details.js` | ~10 KB | 数据文件 | 42 节点详情（6 模块 × 7 维度），通过 `window.INTRE_NODES` 暴露 |
| `colors_and_type.css` | ~3 KB | 设计 token | 品牌色/字体 CSS 变量（与 2D 网站 `shared/brand.css` 对齐） |

### 2.2 lib/ 目录（Three.js 本地依赖 · 消除 CDN 风险）

```
lib/
├── three.module.js              ← Three.js r160 核心
└── node-details.js              ← 42 节点详情数据
```

> **设计决策回顾**：v2.5 升级时将 Three.js addons 从 CDN（`unpkg.com` / `cdn.jsdelivr.net`）下载到本地 `lib/` 目录，importmap 改为本地路径映射，避免 CDN 不可用时白屏风险。
> **2026-07-24 归档**：postprocessing/ 与 shaders/ 8 个文件已归档至 `archive/2026-07-24/bloom-disabled/`（D32 bloom 废弃后不再使用）。

### 2.3 docs/ 设计文档 12 件套（MECE 编号体系 · 2026-07-24 重整）

| 文件 | 角色 | 版本 | 行数 |
|------|------|------|------|
| `00-progress.md` | 进度地图（五阶段全览 + 修订日志） | v2.1 | 235 |
| `01-prd.md` | PRD · 产品需求文档 | v1.4 | 728 |
| `02-ia.md` | IA · 信息架构/用户流程图 | v1.3 | 1281 |
| `03-wireframe.md` | 线框稿 · 4 幕事实底稿 | v0.5 | 784 |
| `04-d21-transition-design.md` | RCT3→4 转场设计（4 方案对比） | v1.0 | 331 |
| `05-tech-impl-spec.md` | v2.5 技术实现规格 | v1.0 | 342 |
| `06-design-spec.md` | 设计图稿 · 完整视觉规格 | v1.2 | 561 |
| `07-ui-design-system.md` | UI 设计体系学习笔记 | — | 444 |
| `08-qa-checklist.md` | QA 验收清单（5 维度） | v1.0 | MECE 补缺 |
| `09-glossary.md` | 术语对照表（13 类） | v1.0 | MECE 补缺 |
| `10-link-system-plan.md` | 链接系统规划（横切规范） | v1.0 | 重命名 + 移入 |
| `11-ui-elements-index.md` | UI 元素编号手册（横切规范） | v2 | 重命名 + 移入 |

**5 阶段 + 横切 + 元对照**：
- 第 0 阶段治理 → `00-progress.md`
- 第 1 阶段战略对齐 → `01-prd.md`
- 第 2 阶段信息架构 → `02-ia.md`
- 第 3 阶段低保真线框 → `03-wireframe.md`
- 第 4 阶段转场专章 → `04-d21-transition-design.md`
- 第 5 阶段技术规格 → `05-tech-impl-spec.md`
- 第 4 阶段设计图稿 → `06-design-spec.md`（注：与 D21 转场同属 04-05 区间配套）
- 设计体系参考 → `07-ui-design-system.md`
- 质量验收 → `08-qa-checklist.md`
- 术语对照 → `09-glossary.md`
- 横切规范：链接系统 → `10-link-system-plan.md`
- 横切规范：UI 元素 → `11-ui-elements-index.md`
- 高保真原型实现 → `pages/3d-hero.html`

### 2.4 横切规范文档（已移入 docs/ · 见 2.3 节）

- `docs/10-link-system-plan.md`（原根目录 `LINK-SYSTEM-PLAN.md`）
- `docs/11-ui-elements-index.md`（原根目录 `UI-ELEMENTS-INDEX.md`）

### 2.5 元数据与状态文件（4 项）

| 文件 | 格式 | 性质 |
|------|------|------|
| `orchestration-summary.json` | JSON | 子代理编排摘要（设计模式 + 风格定义 + 页面元数据） |
| `validation-report.json` | JSON | 设计验证报告（0 阻塞错误，1 软警告） |
| `.tasks/page-3d-hero-completion.json` | JSON | 页面完工度报告（CSS preflight / HTML 写入 / 视觉结构证据） |
| `.preflight/preflight.html` | HTML | CSS 预检副本（preflight 备份） |

### 2.6 资源文件

| 文件 | 用途 |
|------|------|
| `assets/dti-reference.png` | RCT4 神经层 DTI 脑图参考图（v2.5 v2.4 2D 贴图用，v2.5 D33 升级后待替换为 3D 脑模型 GLB） |

### 2.7 系统介绍文档（1 项 · 本文档）

| 文件 | 用途 |
|------|------|
| `intre-3d-hero-overview.md` | 本文档（子项目完整系统介绍） |

### 2.8 历史归档（archive/ · 2026-07-24 起）

| 子目录 | 数量 | 主题 |
|--------|------|------|
| `archive/2026-07-24/bloom-disabled/` | 8 文件 | D32 bloom 废弃（EffectComposer/RenderPass/MaskPass/Pass/ShaderPass/UnrealBloomPass/CopyShader/LuminosityHighPassShader） |
| `archive/2026-07-24/reports/` | 1 文件 | 本轮审查报告 `intre-3d-hero-system-review-v1.0.html` |
| `archive/2026-07-24/preflight/` | 1 文件 | CSS preflight 备份 |
| `archive/2026-07-24/design-binary/` | 1 文件 | 二进制设计稿 `intre-3d-hero.design` |

> 详见 `archive/README.md` 归档策略与元数据。

---

## 三、4 幕叙事内容架构

3D Hero 是**单页 1170vh 滚动叙事**，4 幕对应 INTRE 三层架构（开场幕为品牌入口）：

### 3.1 节奏表

| 幕 ID | 命名 | 进度区间 p | 淡入 | 满显（阅读窗） | 淡出 | 3D 场景主轴 |
|-------|------|------------|------|---------------|------|--------------|
| RCT1 | 开场 | 0 → 0.24 | instant | 0 – 0.16 | 0.16 – 0.24 | 深空星空（400 暗星） |
| RCT2 | 现象层 | 0.26 → 0.52 | 0.26 – 0.34 | 0.34 – 0.44 | 0.44 – 0.52 | 真实星座浮现 → 漏斗收敛 |
| RCT3 | 功能层 | 0.52 → 0.82 | 0.56 – 0.66 | 0.66 – 0.74 | 0.74 – 0.82 | 6×7 晶格展开 + 星辰散布 |
| RCT4 | 神经层 | 0.80 → 1.0 | 0.80 – 0.88 | 0.88 – 1.00 | **永不淡出** | DTI 脑图 + 三通道 legend + D21 转场 |

### 3.2 节奏设计

- **非线性进度重映射 `pace()`**：9 个 `[raw, pm]` 控制点的 Fritsch-Carlson 单调三次插值
- **RCT1→2 紧凑快切**（速率 3.50，8% 滚轮跨 28% 场景）
- **RCT2/3/4 满屏停留**（速率 0.38，16% 滚轮仅推进 6%）
- 相机 5 个关键帧 K0-K5，y 方向下潜 48→-15（约 63 个单位）
- 总滚动距离 1170vh（v2.1 决策 Q10）

### 3.3 4 幕内容详解

**RCT1 · 开场（品牌入口）**
- 主标 INTRE（72px / Josefin Sans）
- 副文"在现象与神经之间，建立可计算的功能层"
- 公式芯片 `Ψ(t) ∈ ℝ⁴² · 6 × 7`（链接到术语表）
- 3D 场景：400 颗暗星构成天幕（v2.1 Q8 性能优化 1800→400）

**RCT2 · 现象层**
- 标"从无限到有限"
- 正文"漫天繁星被心智勾勒为星座——大五人格、认知类型、行为模式。人类模式识别，是从无限特征到有限标签的第一步。"
- 3D 场景：8 个真实星座（IAU 数据子集 D34），约 50 颗亮恒星 + 110 条连线

**RCT3 · 功能层（关键停留）**
- 标"六模块 × 七维度"
- 正文"M1 具身 · M2 认知 · M3 意志 · M4 情绪 · M5 言语 · M6 行为。每一个节点都可被测量、被定位、被干预。"
- 徽章"42 / 42 可数"（点击跳教材第 8 章）
- 3D 场景：6×7=42 节点晶格，HTML 标签浮在节点上方（M1-M6 / RES-D / RES-B / DSP-F / DSP-B / STR-R / STR-C / STR-S）
- 节点可点击 → 弹出 42 节点详情面板（v2.1 P1.3）

**RCT4 · 神经层（永驻）**
- 标"向下扎根"
- 正文"功能层不是终点。UPLS 统一语义，UBMS 校准行为，UNIS 对接神经——三通道似然经 PSE 贝叶斯融合，更新状态后验。"
- 三通道 legend（点击跳 UPLS/UNIS/UBMS 模块子站）
- 3D 场景：DTI 脑图（v2.4 2D 贴图 / v2.5 D33 升级为 3D 脑模型 + DTI 纹理投影）
- 末尾收尾：#replay-btn（重看 4 幕） + mailto 反馈邮箱（v2.1 Q9 决策）

---

## 四、相机轨迹与 3D 场景参数

### 4.1 相机关键帧

| 关键帧 | p | 相机 (x, y, z) | 注视 (x, y, z) | 视觉感受 |
|--------|---|----------------|----------------|----------|
| K0 | 0.00 | (0, 48, 34) | (0, 30, 0) | 极远极高，星空全景 |
| K1 | 0.25 | (0, 20, 30) | (0, 10, 0) | 下沉，星座渐入眼底 |
| K2 | 0.50 | (0, 6, 26) | (0, 0, 0) | 接近圆柱星系 |
| K3 | 0.60 | (0, 0, 19) | (0, 0, 0) | 棋盘正读起点 |
| K3b | 0.74 | (0, 0, 19) | (0, 0, 0) | 平台期终点（14% 滚动容忍度） |
| K4 | 0.84 | (0, -6, 26) | (0, -10, 0) | 越过晶格，向神经层下行 |
| K5 | 1.00 | (0, -15, 28) | (0, -15, 0) | 与脑图平面齐平，脸对脑 |

### 4.2 棋盘规格（RCT3）

| 属性 | 值 | 说明 |
|------|-----|------|
| 网格 | 6 列 × 7 行 = 42 节点 | M1-M6 × {R:2, D:2, S:3} = 6×7=42 维 |
| 节点球尺寸 | radius 0.28 单位 | 世界单位 |
| 列宽 | 2.4 单位 | 水平间距 |
| 行高 | 1.7 单位 | 垂直间距 |
| 世界中心 | (0, 0, 0) | y 范围 ±5.1 |
| 节点 hover | scale 1.65×（阻尼趋近） / amber 变色 | D24 品牌色 + 阻尼化 |
| 节点点击 | 打开 42 节点详情面板 #14 | 五区域结构 |
| 晶格连线 | Navy 400 #3B6FB5 | latBase 0.55 + 0.25 × uLattice |

### 4.3 脑图规格（RCT4 · v2.5 升级中）

| 属性 | v2.4 值 | v2.5 值（D33） |
|------|---------|-----------------|
| 几何 | PlaneGeometry 14×18 | 3D 脑模型 GLB（5k-20k 面） |
| 纹理 | dti-reference.png 直接采样 | DTI 纹理投影到脑表面 |
| 着色 | texture2D + 透明度 | 自定义 Shader：漫反射 + 菲涅尔边缘光 + DTI emissive |
| scale | 1.0 + 1.1 × ss(p, 0.72, 1.0) | 同左（纤维束靶点需乘以 brainScale） |
| 交互 | 无（2D 平面） | 可旋转/缩放/射线检测（3D 网格） |

---

## 五、链接系统与 2D 网站衔接

3D Hero 是**入口不是替代**。所有深度内容通过链接系统指向 2D 网站。

### 5.1 链接映射总览

| 3D Hero 位点 | 2D 目标 |
|--------------|---------|
| 顶部导航 INTRE 标志 | `/INTRE-website/` 首页 |
| 顶部导航"首页" | `/INTRE-website/` |
| 顶部导航"UPLS" | `/INTRE-website/upls/` |
| 顶部导航"UNIS" | `/INTRE-website/unis/` |
| 顶部导航"UBMS" | `/INTRE-website/ubms/` |
| 顶部导航"PSE" | `/INTRE-website/pse/` |
| 顶部导航"REVER" | `/INTRE-website/rever/` |
| 顶部导航"教材" | `/INTRE-website/textbook/` |
| 顶部导航"术语表" | `/INTRE-website/glossary/` |
| 公式芯片 Ψ(t) | `/INTRE-website/glossary/?q=状态向量` |
| 42 徽章 | `/INTRE-website/textbook/ch08.html`（第 8 章） |
| 三通道 legend UPLS | `/INTRE-website/upls/` |
| 三通道 legend UNIS | `/INTRE-website/unis/` |
| 三通道 legend UBMS | `/INTRE-website/ubms/` |
| 节点详情面板"查看教材" | 教材对应章节（v1.1 精细化，v2.1 暂用 `#` 占位） |

### 5.2 部署方案

- **Q1 决策（v2.1）**：方案 A — 同域 `/hero/` 子目录，相对路径
- 实际当前使用完整 URL（GitHub Pages：`https://project003125.github.io/INTRE-website/...`）
- 目标态：3D Hero 部署为 `https://project003125.github.io/INTRE-website/hero/`
- 2D 首页已加"3D 体验"按钮链接到 `../hero/`（v2.1 Q4 决策）

### 5.3 链接系统 4 阶段执行计划

| 阶段 | 内容 | 状态 |
|------|------|------|
| Phase 1 | 链接打通（不依赖部署） | ✅ 已完成 |
| Phase 2 | 导航对齐（3D vs 2D 命名一致） | ✅ 已完成（8 项导航） |
| Phase 3 | 部署集成（同域子目录） | ⏳ 待部署验证 |
| Phase 4 | 数据集成（API 化节点详情） | ⏳ 未来可选 |

---

## 六、设计 token 与品牌规范对齐

### 6.1 品牌色（Navy 6 阶 + Amber 4 阶 + 大地通道色 5 种）

| Token | 色值 | 用途 |
|-------|------|------|
| `--intre-navy-950` | `#0A1E3D` | 最深底色（RCT1-4 全场） |
| `--intre-navy-800` | `#122F5C` | 顶栏背景 |
| `--intre-navy-600` | `#1F4880` | 主色（标题、关键交互） |
| `--intre-navy-500` | `#2A5DA0` | 主色悬浮态 |
| `--intre-navy-400` | `#3B6FB5` | 晶格连线 |
| `--intre-navy-50` | `#D6E5F3` | 淡色背景块、文字 |
| `--intre-amber-600` | `#D97706` | 强调（CTA） |
| `--intre-amber-500` | `#F59E0B` | 次要强调（节点 hover、徽章） |
| `--intre-upls` | `#5A8270` | UPLS 大地绿（语义通道） |
| `--intre-unis` | `#5B7080` | UNIS 大地蓝（神经通道） |
| `--intre-ubms` | `#8B7360` | UBMS 大地棕（行为通道） |

### 6.2 字体体系（向 2D 网站对齐）

| 角色 | 字体 | 用途 |
|------|------|------|
| Logo / H1 | Josefin Sans | INTRE 字标、h1 大标题 |
| 拉丁正文 | Inter | 拉丁字符 |
| 中文正文 | Noto Sans SC | 中文字符 |
| 等宽 | JetBrains Mono | 公式、遥测、kicker |

### 6.3 与 2D 网站 `shared/brand.css` 的关系

- 3D 子项目 `colors_and_type.css` 是 2D 网站 `shared/brand.css` 的**镜像子集**
- 2D 使用 `--color-navy-950` 命名空间，3D 使用 `--intre-navy-950` 命名空间
- 数值完全一致（Navy 6 阶 / Amber 4 阶 / 大地通道色 5 种）
- v2.4 字体体系向 2D 阶梯看齐（9 级 rem 标尺 + 4 个字体族）

---

## 七、决策记录（D01-D38 + Q1-Q10）

3D Hero 经历了 4 个主要版本迭代（v2.1 → v2.2 → v2.3 → v2.4 → v2.5），累计 48 个决策：

### 7.1 主要决策类别

| 类别 | 决策数 | 代表性决策 |
|------|--------|------------|
| 4 幕节奏与叙事 | D01-D02 | 4 幕结构 / 1170vh 滚动 |
| 视觉质量升级 | D24-D31 | 品牌色权威 / pace Fritsch-Carlson / 帧率无关化 |
| v2.5 视觉质量 | D32-D38 | Bloom 后处理 / 3D 脑模型 / 真实星座 / D21 转场 |
| v2.1 收尾冲刺 | Q1-Q10 | 部署方案 / 节点描述 / 教材映射 / 2D 入口 / 降级 / 移动端 / 导航 / 性能 / 收尾 / 发布范围 |
| v2.3 去扫光 | D22 | 幕切换扫光移除（更克制） |
| v2.4 品牌色权威 | D24 | 通道色改大地色系（v1.x 高饱和色作废） |

### 7.2 当前活跃决策（v2.5 D32-D38）

- **D32**：WebGL Bloom 后处理 — 评审中（白色蒙皮根因分析后建议禁用）
- **D33**：3D 脑模型 + DTI 纹理投影 — 评审中
- **D34**：真实星座数据替换 — 评审中
- **D35-D38**：D21 转场（A+D 混合）— 评审中

---

## 八、技术实现规格（v2.5 5 阶段）

`05-tech-impl-spec.md` 详细列出 v2.5 升级的执行计划：

| Phase | 内容 | 依赖 | 状态 |
|-------|------|------|------|
| Phase 0 | Bug 修复（pointer-events / SVG span / actTexts / Rail / cursor） | 无 | 部分完成 |
| Phase 1 | WebGL Bloom 后处理 | 无 | ⏸️ 暂停（白色蒙皮根因） |
| Phase 2 | 3D 脑模型 + DTI 投影 | 依赖 Phase 1 | ⏳ 待执行 |
| Phase 3 | 真实星座数据替换 | 无 | ⏳ 待执行 |
| Phase 4 | D21 转场实现 | 依赖 Phase 2 | ⏳ 待执行 |

### 8.1 本轮（2026-07-24）已修复

| 修复 | 文件 | 状态 |
|------|------|------|
| Bloom 禁用（根因） | `pages/3d-hero.html` L1175-1188 | ✅ 已完成 |
| SVG linearGradient 移除 | `pages/3d-hero.html` L302-310 | ✅ 已完成 |
| CSS radial-gradient 移除 | `pages/3d-hero.html` L322-334 | ✅ 已完成 |
| preserveDrawingBuffer 调试参数移除 | `pages/3d-hero.html` L1155 | ✅ 已完成 |

### 8.2 像素级验证

通过 WebGL `readPixels` 8 点采样确认：

| 状态 | 像素值 | 含义 |
|------|--------|------|
| 修复前 | RGB(56, 96, 134) | 白色蒙皮（Navy 950 被抬升 46/66/73） |
| 修复后 | RGB(10, 30, 61) | 完全符合品牌 Navy 950 |

---

## 九、验证与质量保证

### 9.1 子代理验证报告

`validation-report.json` 显示：
- **renderBlockingErrorCount**: 0
- **softWarningCount**: 1（`colors_and_type.css` 中 `--intre-shadow-sm` 阴影 alpha 0.06 略高于 0.05 阈值）
- **qualityGate**: passed

### 9.2 子代理完工度报告

`.tasks/page-3d-hero-completion.json` 关键字段：
- `qualityGate`: passed
- `cssPreflightStatus`: passed
- `headInfrastructureStatus.themeVars`: present
- `headInfrastructureStatus.tailwindCdn`: present
- `headInfrastructureStatus.lucideCdn`: present
- `renderRisk`: none

### 9.3 设计风格定义

`orchestration-summary.json` 完整记录：
- **operatingMode**: free-explore
- **designDials**: layoutVariance 3 / motionIntensity 5 / visualDensity 3
- **styleDefinitionBrief**: INTRE Navy 深空学术风（Bauhaus 几何 + Apple 克制）
- **visualNorthStar**: 深空中自上而下的三层宇宙（星场 → 漏斗 → 6×7 晶格 → 纤维束）
- **compositionPattern**: full-bleed scroll-driven 3D narrative with fixed overlay HUD

### 9.4 视觉结构证据

完工报告列出关键区域的原始 token 使用：
- `formula-chip` border: `var(--intre-navy-700)`
- `badge-42` border: `color-mix(in srgb, var(--intre-amber-600) 40%, transparent)`
- `hud-rail` dots: `var(--intre-navy-500)`
- `scroll-hint` track: `var(--intre-navy-500)`
- `tooltip` border: `var(--intre-navy-700)`

---

## 十、性能与可访问性

### 10.1 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| LCP（桌面） | < 2.5s | 待实测（Q8 粒子 1800→400 优化后） |
| LCP（移动） | < 4s | 待实测 |
| 桌面端跳出率 | < 40% | 待实测 |
| 移动端跳出率 | < 60% | 待实测 |
| 4 幕全程滚动占比 | > 25% | 待实测 |
| 2D 子页跳转占比 | > 15% | 待实测 |

### 10.2 性能优化决策

- **Q8 决策**：粒子数 1800→400（性能预算）
- **D26 决策**：pace() 用 Fritsch-Carlson 单调三次插值（替代线性插值）
- **D27 决策**：动画帧率无关化（per-frame → dt 时间制）
- **本地加载 Three.js**：消除 CDN 网络依赖

### 10.3 可访问性

- **D10 决策**：WCAG 2.1 AA 达标
- 文字 vs 背景对比度 ≥ 4.5:1
- 全局 `prefers-reduced-motion` 支持
- 键盘可达（数字键 1-4 / 方向键）
- 焦点指示器 2px Navy 50 + 2px 偏移
- prefers-reduced-motion 下 burst / 拖尾 / 视差自动关闭

### 10.4 移动端降级

- **Q5 决策**：静态文本 + 顶部 banner 引导桌面浏览器
- **Q6 决策**：节点详情面板移动端全屏
- 触摸设备自动关闭：拖尾粒子、自定义光标、视差拖拽

---

## 十一、生产模式与收尾功能

### 11.1 生产模式（`?prod=1`）

通过 URL 参数切换：
- `<body>` 添加 `.prod-mode` class
- 隐藏：status-bar / custom-cursor / feat-tag / trail-canvas / burst-container / scroll-hint / noise-overlay / bloom-overlay（D32 后已删除）
- 保留：4 幕叙事文本、3D 晶格、脑图、节点详情面板、导航、三通道 legend、出口链接

### 11.2 收尾功能

- **#replay-btn**（"重看 4 幕"按钮）：点击 `window.scrollTo({top:0, behavior:'smooth'})`
- **mailto 反馈邮箱**：`intre.framework@gmail.com`（预填主题"INTRE 3D 首页反馈"）
- 位置：act-4 浮岛底部，RCT4 永驻后浮现

### 11.3 静态海报定格帧

| 触发 | p | 用途 |
|------|---|------|
| 默认 | 0.86 | 平台期满显帧（v2.5 D37，reduced-motion） |
| 旧版 | 0.62 | 棋盘满显 + 标签完整 + 脑图未现（v2.4 旧值） |

---

## 十二、上下游衔接关系

### 12.1 上游（依赖）

- **品牌视觉规范**：06-格式治理/06-S-05-INTRE-品牌视觉规范.md v2.3.0（最高权威）
- **AI 合规附录**：06-格式治理/06-S-05.1-AI-Visual-Compliance.md v2.3.1
- **2D 网站 brand.css**：-website/shared/brand.css v2.2.1（共享 token 源）
- **核心理论**：01-核心理论 全部文档（节点描述、模块、维度定义）

### 12.2 下游（被依赖）

- **2D 网站首页**：-website/index.html 含"3D 体验"按钮（v2.1 P2 决策）
- **教材映射表**：v1.1 精细化（节点 → 教材章节），当前用 `#` 占位
- **GitHub Pages 部署**：待执行（v2.5 Phase 0-4 完成前）

### 12.3 同级（2D 网站子项目）

- 共享 `06-S-05` 品牌规范
- 共享 `06-S-07` Agent 长期记忆（区分 `INTRE-vault` 与 `INTRE-website`）
- 共享 4 大模块理论内容（UPLS/UNIS/UBMS/PSE/REVER）

---

## 十三、待办与里程碑

### 13.1 P1 待办（来自系统审查报告）

| # | 任务 | 文件 | 状态 |
|---|------|------|------|
| 1 | PDR 新增 D39 决策记录（bloom 禁用） | `docs/01-prd.md` | ⏳ 待执行 |
| 2 | PDR §6.1 验收标准更新 | `docs/01-prd.md` | ⏳ 待执行 |
| 3 | PDR §8.3 M11 状态更新 | `docs/01-prd.md` | ⏳ 待执行 |
| 4 | PDR §13.1 生产模式 #07 描述更新 | `docs/01-prd.md` | ⏳ 待执行 |
| 5 | PDR D38 纤维束方案修订 | `docs/01-prd.md` | ⏳ 待执行 |

### 13.2 P2 待办

| # | 任务 | 优先级 |
|---|------|--------|
| 1 | Tailwind CSS 本地化（消除 cdn.jsdelivr.net 依赖） | 中 |
| 2 | Lucide 图标内联 SVG 替代 | 低 |
| 3 | D38 纤维束体积感替代方案 | 中 |
| 4 | 噪点叠加 blend-mode 规范注释 | 低（已合规） |

### 13.3 v2.5 5 阶段

- Phase 0: Bug 修复 — 部分完成
- Phase 1: WebGL Bloom 后处理 — 暂停（根因未解决）
- Phase 2: 3D 脑模型 + DTI 投影 — 待执行
- Phase 3: 真实星座数据替换 — 待执行
- Phase 4: D21 转场实现 — 待执行

### 13.4 部署相关

- M01 部署方案确认（Q1）— ✅ 已完成
- M03 移动端 QA（iOS Safari / Android Chrome）— ⏳ 待部署
- M04 WCAG 2.1 AA 自动测试（axe）— ⏳ 待部署
- M08 字体版权合规审查 — ⏳ 上线前
- M10 仪表盘与埋点上线 — ⏳ 部署同步

---

## 十四、文件清单（汇总）

### 14.1 代码资产（3 项）

```
pages/3d-hero.html
lib/three.module.js
lib/node-details.js
colors_and_type.css
```

### 14.2 设计文档（8 项）

```
docs/00-progress.md
docs/01-prd.md
docs/02-ia.md
docs/03-wireframe.md
docs/04-d21-transition-design.md
docs/05-tech-impl-spec.md
docs/06-design-spec.md
docs/07-ui-design-system.md
docs/08-qa-checklist.md
docs/09-glossary.md
docs/10-link-system-plan.md
docs/11-ui-elements-index.md
```

### 14.3 横切规范（2 项 · 已移入 docs/）

```
docs/10-link-system-plan.md
docs/11-ui-elements-index.md
```

### 14.4 元数据与状态（4 项）

```
orchestration-summary.json
validation-report.json
.tasks/page-3d-hero-completion.json
.preflight/preflight.html
```

### 14.5 资源文件

```
assets/dti-reference.png
```

### 14.6 元数据与状态

```
.tasks/page-3d-hero-completion.json
orchestration-summary.json
validation-report.json
```

### 14.7 系统介绍（本文档）

```
intre-3d-hero-overview.md
```

### 14.8 历史归档（archive/ · 2026-07-24）

```
archive/README.md                                  ← 归档策略与元数据
archive/2026-07-24/bloom-disabled/                 ← 8 文件：D32 bloom 废弃
archive/2026-07-24/reports/                        ← 1 文件：本轮审查报告 v1.0
archive/2026-07-24/preflight/                      ← 1 文件：CSS preflight 备份
archive/2026-07-24/design-binary/                  ← 1 文件：二进制设计稿
```

---

## 十五、关键设计哲学

3D Hero 子项目遵循 INTRE 品牌规范的所有约束：

| 原则 | 实现 |
|------|------|
| 包豪斯内核（功能决定形式） | 4 幕结构严格对应 INTRE 三层架构 |
| 苹果简约（极致减法） | 15 个 UI 元素，无冗余装饰 |
| 学术克制（restrained） | 无玻璃拟态、无弥散阴影、无渐变（v2.5 后） |
| 工程严谨（engineered） | 1170vh 滚动节奏精确到 0.06 lerp 平滑 |
| 字符即品牌（typography is brand） | Josefin Sans 不可替换（DNA 级别） |
| 色彩比例 Navy 90% / Amber 5% / 通道色 5% | 全局严格执行 |
| 同视口通道色 ≤ 2 种 | 三通道 legend 在 RCT4 集中展示 |
| WCAG 2.1 AA | 文字对比度 ≥ 4.5:1 |
| `prefers-reduced-motion` 支持 | 完整降级（burst / 拖尾 / 视差自动关闭） |

---

## 十六、总结

INTRE 3D Hero 子项目是一个**面向学术受众的 1170vh 滚动叙事单页应用**，用 Three.js 把 INTRE 三层心智模型（现象层 → 功能层 → 神经层）以 4 幕叙事方式呈现。子项目以品牌视觉规范为最高权威，严格执行 Navy 90% + Amber 5% + 大地通道色 5% 的色彩比例，与 2D 网站共享设计 token 但保留独立 `intre-` 命名空间。

子项目当前状态：
- ✅ 核心叙事（4 幕 + 1170vh 节奏 + 相机轨迹）已稳定
- ✅ 设计文档五件套齐全（PRD/IA/Wireframe/Design/Progress）
- ✅ 链接系统 Phase 1-2 已完成（8 项导航 + 3 通道 legend + 公式芯片 + 42 徽章）
- ✅ Three.js 本地化（消除 CDN 依赖）
- ✅ 4 阶段收尾功能（生产模式、重看按钮、mailto、节点详情）
- ⏸️ v2.5 视觉质量升级（BLOOM/3D 脑模型/真实星座/D21 转场）部分暂停（BLOOM 根因）
- ⏳ 部署到 GitHub Pages 待执行

子项目治理原则：
- 任何视觉变更先更新品牌规范
- 任何代码变更先更新对应文档
- 任何决策先记录到 PDR Dxx
- 任何 token 修改先与 2D 网站 `shared/brand.css` 对齐

---

*本文档基于 2026-07-24 子项目全部实体倒推而成。INTRE 品牌规范权威定义在 `06-格式治理/06-S-05-INTRE-品牌视觉规范.md`（D1a 级），AI 协作者规范在 `06-格式治理/06-S-05.1-AI-Visual-Compliance.md`。*
