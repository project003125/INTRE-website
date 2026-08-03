# INTRE 3D Hero — 链接系统规划方案

> **文件编号**：10-link-system-plan.md（MECE 编号体系：横切规范 · 链接系统）
> **本文件位置**：UI 设计流程**横切规范**（跨阶段生效）
> **关联文档**：[00-progress.md](./00-progress.md) · [01-prd.md](./01-prd.md) · [02-ia.md](./02-ia.md) · [11-ui-elements-index.md](./11-ui-elements-index.md)
> 版本：v1.0 · 2026-07-23
> 目标：将 3D Hero 原型的所有可点击位点与 2D 网站的内容体系打通
> 前提：2D 网站已上线于 GitHub Pages，URL 基路径 `/INTRE-website/`
> **2026-07-24 重编号**：从 `LINK-SYSTEM-PLAN.md` → `10-link-system-plan.md`（MECE 编号体系），并从根目录移入 `docs/`

---

## 一、2D 网站内容架构全貌

### 1.1 页面清单与 URL 映射

| 页面 | URL 路径 | 内容定位 |
|---|---|---|
| 首页 | `/INTRE-website/` | 品牌入口、三层架构概览、五大模块卡片 |
| UPLP | `/INTRE-website/uplp/` | 语义端口（L1-S）：语义编译流水线、PCUI 映射、PSA 标注体系、PSL 词汇库 |
| UNIP | `/INTRE-website/unip/` | 神经通道：EEG/fNIRS/PPG 六层递进架构 |
| UBMP | `/INTRE-website/ubmp/` | 行为通道：量表、EMA、数字表型三层管道 |
| PSE | `/INTRE-website/pse/` | 计算引擎：蒙特卡罗仿真、贝叶斯校准 |
| REVER | `/INTRE-website/rever/` | 伦理门控：四层伦理架构、依赖雷达、四点式门控 |
| 教材 | `/INTRE-website/textbook/` | 29 章正文 + 14 篇附录 |
| 术语表 | `/INTRE-website/glossary/` | 概念检索，支持搜索 |
| 教材章节 | `/INTRE-website/textbook/ch01.html` ~ `ch29.html` | 各章节独立页面 |
| 教材附录 | `/INTRE-website/textbook/app-a.html` ~ `app-n.html` | 附录独立页面 |

### 1.2 外部资源

| 资源 | URL | 用途 |
|---|---|---|
| GitHub 仓库 | `https://github.com/project003125/INTRE-website` | 源码 |
| PSE · Zenodo | `https://doi.org/10.5281/zenodo.18818607` | PSE 论文 DOI |
| UPLP · Zenodo | `https://doi.org/10.5281/zenodo.18818307` | UPLP 论文 DOI |
| REVER · Zenodo | `https://doi.org/10.5281/zenodo.18820091` | REVER 论文 DOI |

### 1.3 2D 网站导航结构

```
顶部导航栏（所有页面统一）
├── 首页 → /
├── UPLP → /uplp/
├── UNIP → /unip/
├── UBMP → /ubmp/
├── PSE → /pse/
├── REVER → /rever/
├── 教材 → /textbook/
└── 术语表 → /glossary/

页脚 Sitemap（四列）
├── Modules: UPLP / UNIP / UBMP / PSE / REVER
├── Learn: 教材 / 术语表
├── Resources: GitHub / Zenodo × 3
└── Framework: 状态语法 / 操作语法 / 证据标签（均指向术语表）
```

### 1.4 三层架构与三通道对应关系

```
L1 现象层 (Phenomenal)    ← 可观测的心理现象
    ↓ 观测 Observe
L2 功能层 (Functional)    ← Ψ(t) ∈ ℝ⁴²，INTRE 运算中心
    ↑ 校准 Calibrate
L3 神经层 (Neural)        ← 神经回路、脑区激活

三通道汇聚于功能层：
├── UBMP → p(y_b|Ψ)  行为通道（现象层 → 功能层）
├── UPLP → p(y_s|Ψ)  语义通道（现象层 → 功能层）
└── UNIP → p(y_n|Ψ)  神经通道（神经层 → 功能层）

融合公式：
p(Ψₜ | y_{b,t}, y_{s,t}, y_{n,t}) ∝ p(y_b|Ψ) · p(y_s|Ψ) · p(y_n|Ψ) · p(Ψₜ|Ψₜ₋₁)
```

---

## 二、3D Hero 当前可点击位点盘点

### 2.1 现状：所有链接均为空 (`href="#"`)

| 位点 | 当前行为 | 应该指向 |
|---|---|---|
| 顶部导航"理论" | 空链接 | 需确定目标 |
| 顶部导航"模块" | 空链接 | 需确定目标 |
| 顶部导航"教材" | 空链接 | 需确定目标 |
| 顶部导航"关于" | 空链接 | 需确定目标 |
| 品牌标志 INTRE | 无链接 | 首页 |
| 右侧指示器"现象层" | 仅滚动 | 需确定是否加链接 |
| 右侧指示器"功能层" | 仅滚动 | 需确定是否加链接 |
| 右侧指示器"神经层" | 仅滚动 | 需确定是否加链接 |
| 公式芯片 Ψ(t) | 无链接 | 需确定目标 |
| 42 徽章 | 无链接 | 需确定目标 |
| 三通道图例 UPLP | 无链接 | UPLP 模块页 |
| 三通道图例 UNIP | 无链接 | UNIP 模块页 |
| 三通道图例 UBMP | 无链接 | UBMP 模块页 |
| 节点详情面板 #14 | 仅显示文字 | 可加教材链接 |

---

## 三、链接系统设计方案

### 3.1 设计原则

1. **3D Hero 是入口，不是替代**——它是品牌展示和概念可视化，所有深度内容指向 2D 网站
2. **导航对齐**——3D Hero 的导航项与 2D 网站导航项语义对齐，用户认知一致
3. **上下文链接**——3D 场景中出现的概念（UPLP、UNIP、UBMP、42 维等）点击后直达对应详情页
4. **新标签打开**——所有外链用 `target="_blank"`，保留 3D Hero 不被关闭

### 3.2 路径策略

由于 3D Hero 与 2D 网站的部署关系尚未确定，提供两种方案：

**方案 A（同域部署，推荐）**：3D Hero 部署为 2D 网站的子页面，如 `/INTRE-website/hero/`，所有链接用相对路径 `../uplp/` 等。

**方案 B（独立部署）**：3D Hero 独立域名/路径，所有链接用完整 URL `https://project003125.github.io/INTRE-website/uplp/`。

### 3.3 完整链接映射表

#### 3.3.1 顶部导航栏

| 导航项 | 当前 | 改为 | 对应 2D 页面 |
|---|---|---|---|
| INTRE 品牌标志 | 无链接 | → 首页 | `/INTRE-website/` |
| 理论 | `#` | → 改为"首页" | `/INTRE-website/` |
| 模块 | `#` | → 展开下拉子菜单 | UPLP/UNIP/UBMP/PSE/REVER |
| 教材 | `#` | → 教材首页 | `/INTRE-website/textbook/` |
| 关于 | `#` | → 术语表 | `/INTRE-website/glossary/` |

> **导航项语义说明**：2D 网站导航是"首页 / UPLP / UNIP / UBMP / PSE / REVER / 教材 / 术语表"，3D Hero 当前是"理论 / 模块 / 教材 / 关于"。建议对齐为 2D 的命名，或保留 3D 简化命名但链接指向正确目标。

#### 3.3.2 三通道图例（第四幕）

| 图例项 | 当前 | 改为 | 说明 |
|---|---|---|---|
| UPLP 语义通道 | 无链接 | → `/INTRE-website/uplp/` | 新标签打开 |
| UNIP 神经通道 | 无链接 | → `/INTRE-website/unip/` | 新标签打开 |
| UBMP 行为通道 | 无链接 | → `/INTRE-website/ubmp/` | 新标签打开 |

#### 3.3.3 公式芯片与徽章

| 位点 | 当前 | 改为 | 说明 |
|---|---|---|---|
| 公式芯片 Ψ(t) ∈ ℝ⁴² | 无链接 | → `/INTRE-website/glossary/?q=状态向量` | 点击查术语 |
| 42 徽章 | 无链接 | → `/INTRE-website/textbook/ch08.html` | 第 8 章"状态向量：42维表示与动力学" |

#### 3.3.4 右侧三层指示器

| 指示器 | 当前 | 建议 | 说明 |
|---|---|---|---|
| 现象层 | 仅滚动 | 保持滚动行为 + 加 tooltip 提示 | 滚动行为不变，hover 时显示"查看现象层详情 → 术语表" |
| 功能层 | 仅滚动 | 保持滚动行为 + 加 tooltip | 同上 |
| 神经层 | 仅滚动 | 保持滚动行为 + 加 tooltip | 同上 |

> 指示器的主要功能是幕内滚动导航，不宜直接跳走。可在指示器旁加一个小图标"↗"单独提供外链。

#### 3.3.5 节点详情面板 #14

当前面板只显示模块名称和描述。建议增加"查看教材详解"按钮：

| 节点 | 模块 | 教材链接 |
|---|---|---|
| M1 具身 | M1 | `/INTRE-website/textbook/ch07.html`（第7章 功能模块：M1至M6划分与级联） |
| M2 认知 | M2 | 同上 |
| M3 意志 | M3 | 同上 |
| M4 情绪 | M4 | 同上 |
| M5 言语 | M5 | 同上 |
| M6 行为 | M6 | 同上 |
| 任意节点 × RES | 资源维度 | `/INTRE-website/textbook/ch06.html`（第6章 状态维度） |
| 任意节点 × DSP | 调度维度 | 同上 |
| 任意节点 × STR | 结构维度 | 同上 |

#### 3.3.6 新增底部信息条

建议在 3D Hero 底部增加一个极简信息条，提供完整导航出口：

```
INTRE · 功能层心理学    UPLP · UNIP · UBMP · PSE · REVER    教材    术语表    GitHub
```

---

## 四、专业术语说明

### 4.1 UI 与其他界面的链接

这类问题属于**前端导航架构**领域，以下是需要了解的核心术语：

| 术语 | 英文 | 大白话解释 |
|---|---|---|
| 导航模式 | Navigation Pattern | 页面上引导用户去其他页面的方式，比如顶部菜单、侧边栏、面包屑 |
| 跨页导航 | Cross-page Navigation | 从当前页面跳到另一个页面，比如从 3D Hero 跳到 UPLP 模块页 |
| 深度链接 | Deep Linking | 直接指向网站内部某个具体内容的链接，比如直接打开教材第 8 章而非首页 |
| 路由 | Routing | 决定 URL 对应显示哪个页面的机制。2D 网站是多页应用（每个 URL 一个 HTML 文件），3D Hero 是单页应用（一个 HTML 内滚动切换） |
| 上下文导航 | Contextual Navigation | 根据当前内容智能提供的链接。比如看到"UPLP"这个词时，旁边出现一个可点击的入口 |
| 行动召唤 | Call-to-Action (CTA) | 引导用户做特定动作的按钮或链接，比如"进入模块 →" |
| 面包屑 | Breadcrumb | 显示"你在哪一层级"的路径，比如"首页 > 模块 > UPLP" |
| 锚点定位 | Anchor Link | 页面内跳转，比如点击"神经层"滚动到对应幕，URL 不变 |
| 新标签打开 | `target="_blank"` | 链接在新浏览器标签打开，当前页面保留不关闭 |

**3D Hero 的导航模式定位**：
3D Hero 是**单页滚动叙事**（Single-page Scroll Narrative），用户通过滚动在四幕间切换。它不需要路由系统，但需要**出口链接**（Exit Links）——在关键概念出现时提供跳转到 2D 网站的入口。

### 4.2 与后台数据的链接

这类问题属于**数据集成架构**领域。2D 网站目前是纯静态站点（Static Site），没有后台。以下是相关术语和适用分析：

| 术语 | 英文 | 大白话解释 | INTRE 适用性 |
|---|---|---|---|
| 静态站点生成 | Static Site Generation (SSG) | 网页内容提前写好成 HTML 文件，部署后直接访问，不需要服务器实时处理 | 当前 2D 网站就是这种 |
| 内容分发网络 | Content Delivery Network (CDN) | 把网站文件复制到全球多个节点，用户就近访问，加载更快 | GitHub Pages 自带 CDN |
| API 端点 | API Endpoint | 后台提供的一个网址，前端访问它可以拿到数据 | 暂不需要 |
| RESTful 接口 | RESTful API | 一种标准的接口设计风格，用 URL 表示资源，用 HTTP 方法（GET/POST）表示操作 | 暂不需要 |
| 数据绑定 | Data Binding | 把界面元素和后台数据自动关联，数据变了界面自动更新 | 暂不需要 |
| 无头内容管理 | Headless CMS | 后台管理内容、前台自由展示的内容管理系统，前后端分离 | 未来可选 |
| 客户端渲染 | Client-Side Rendering (CSR) | 浏览器下载空 HTML，用 JavaScript 动态生成内容 | 3D Hero 的 3D 部分就是这种 |
| 服务端渲染 | Server-Side Rendering (SSR) | 服务器生成完整 HTML 再发给浏览器，SEO 友好 | 2D 网站不需要（SSG 更合适） |
| 外部数据源 | External Data Source | 网站引用的外部数据提供方，比如 Zenodo 的论文 DOI | 当前已有（Zenodo 链接） |

**INTRE 数据架构现状与建议**：

```
当前架构：
  2D 网站（静态 HTML） → 部署在 GitHub Pages → 纯文件，无后台
  3D Hero（单页 HTML） → 本地开发 → 尚未部署

未来可选升级路径：
  路径 1（推荐，零成本）：3D Hero 也作为静态文件部署到 GitHub Pages
    → 优势：与 2D 网站同域，链接用相对路径，无跨域问题
    → 劣势：无后台数据，所有内容硬编码

  路径 2（中阶，引入轻后台）：
    → 用 GitHub Actions 自动构建
    → 教材内容由 Markdown 自动生成 HTML
    → 术语表支持搜索（前端全文检索，如 Fuse.js）
    → 优势：内容维护更方便
    → 劣势：需要构建流程

  路径 3（高阶，完整后台）：
    → 引入 Headless CMS（如 Strapi、Sanity）
    → API 提供模块内容、术语定义、教材章节
    → 3D Hero 的节点详情从 API 动态拉取
    → 优势：内容与展示完全分离，多人协作
    → 劣势：维护成本高，需要服务器
```

---

## 五、执行计划

### Phase 1：链接打通（立即可做，不依赖部署）

1. 顶部导航 4 项改为指向 2D 网站对应页面
2. 品牌标志 INTRE 加首页链接
3. 三通道图例 3 项各加对应模块链接
4. 公式芯片加术语表链接
5. 42 徽章加教材第 8 章链接
6. 节点详情面板 #14 加"查看教材"按钮
7. 底部加极简信息条

### Phase 2：导航对齐（需要确认设计方向）

1. 确认 3D Hero 导航命名是否对齐 2D（"理论/模块/教材/关于" vs "首页/UPLP/UNIP/.../术语表"）
2. 确认"模块"是否做成下拉菜单（hover 展开 5 个子模块）
3. 确认底部信息条的样式和内容

### Phase 3：部署集成（需要确认部署方案）

1. 确认 3D Hero 部署位置（同域子目录 vs 独立部署）
2. 根据部署方案调整所有链接路径（相对路径 vs 绝对路径）
3. 确认是否需要 2D 网站首页加入 3D Hero 入口

### Phase 4：数据集成（未来可选）

1. 评估是否引入轻量后台
2. 节点详情面板从硬编码改为 API 拉取
3. 术语表搜索功能增强

---

## 六、待确认决策清单

以下决策会影响执行，建议在开始前确认：

1. **导航命名**：3D Hero 导航是保持"理论/模块/教材/关于"还是对齐 2D 的"首页/UPLP/UNIP/UBMP/PSE/REVER/教材/术语表"？
2. **"模块"下拉**：是否把"模块"做成 hover 下拉菜单，展开 5 个子模块链接？
3. **部署方案**：3D Hero 部署到 GitHub Pages 的哪个路径？这决定链接用相对路径还是绝对路径。
4. **指示器外链**：右侧三层指示器是否需要额外的外链按钮，还是仅保留滚动功能？
5. **底部信息条**：是否需要新增底部导航条，还是用顶部导航已足够？
6. **2D 首页入口**：是否需要在 2D 网站首页加入"3D 体验"入口链接？
