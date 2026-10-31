---
title: INTRE 3D Hero 子项目 — 系统介绍
version: v2.0.0
date: 2026-10-31
status: review
taxonomy: IET v3.0
document_type: report
revision_notes: v2.0.0 四幕体验从零重构，拆分 HTML/CSS/JS，接入程序化脑与 DTI 纤维；等待主理验收放行。
---

# INTRE 3D Hero 子项目 — 系统介绍

> **当前状态**：2026-10-31 重构候选版，独立分支验收中；首页入口暂不添加，不直接发布 main。
> **页面入口**：`pages/3d-hero.html`
> **旧实现**：171KB 单体源码仅留档于 `.work/general-261031-072118/3d-hero-draft-20261031/`，未被本版复用。

## 一、定位与边界

3D Hero 是 INTRE 的四幕叙事体验页，用简短视觉路径连接现象层、功能层与神经层；2D 网站仍承担教材、术语和模块详述。功能层保持独立的解释位置，不被表达为神经层的附属或替代。

本版遵循品牌视觉规范 v2.7.1：Navy 主色、深蓝玻璃、Josefin Sans / Inter / Noto Sans SC / JetBrains Mono。页面样式完全局部化，不修改 `shared/` 的 2D 站共享 CSS。

## 二、当前文件结构

```
3d-hero/
├── pages/3d-hero.html          # 四幕语义 HTML、42 节点与静态降级内容
├── css/3d-hero.css             # 局部视觉、响应式、reduced-motion
├── js/
│   ├── 3d-hero.js              # 幕导航、hash、键盘、节点详情、模式降级
│   └── brain-scene.js          # Three.js 场景、脑几何、纤维合批
├── lib/
│   ├── three.module.js         # 本地 Three.js，无 CDN 3D 依赖
│   ├── node-details.js         # 42 节点详情数据源
│   └── dti/
│       ├── fibers.js           # 程序化解剖纤维束
│       └── dec.js              # DEC 方向编码颜色
├── assets/brain-cortex-texture.jpg
├── docs/                      # 需求、IA、线框、设计、QA 等规格
└── qa/                        # 1440/390 四幕截图与本轮验收记录
```

## 三、四幕与交互

| 幕 | 内容 | 主要交互 |
|---|---|---|
| `#act-1` 开场 | INTRE、功能层主张、Ψ(t) ∈ ℝ⁴² | 状态向量芯片深链术语表 |
| `#act-2` 现象层 | 从无限到有限、三通道入口 | UPLP / UBMP / UNIP 相对链接 |
| `#act-3` 功能层 | M1–M6 × RES-D…STR-S，42 节点 | 悬停、聚焦、点击显示详情；关闭或 Escape 清除 |
| `#act-4` 神经层 | 半透明脑与 DTI 纤维 | DEC 图例；IODS / PSE / 教材 / 术语表出口 |

滚动是主导航；右侧 rail、数字键 1–4 与 URL hash 同步。hash 更新使用 `history.replaceState`，避免滚动时污染浏览历史。

节点详情由 DOM 管理，不在动画帧中重写，因此 hover 不会被渲染循环覆盖。展示标题与描述将数据文件中的旧子维名称映射为 glossary 术语：调度资源、基底资源、前台调度、后台调度、规则结构、连接结构、序列结构；原始数据文件保持不改。

## 四、3D 与性能策略

- 唯一 Three.js 来源为 `lib/three.module.js`，通过 import map 映射 `three`。
- 无 Bloom、无 EffectComposer、无外部 GLB；使用本地几何和纹理。
- 脑模型包含双半球、小脑、脑干和程序化皮层起伏；皮层纹理仅作低强度 bump。
- DTI 使用 `buildFibers()` 与 `decFromTangent()`：红=左右 X、绿=前后 Z、蓝=上下 Y。
- 全部纤维合并为一个 `LineSegments`，42 背景节点使用一个 `InstancedMesh`。
- DPR 上限 1.6；`?lite` 降为 1.0，并减少星点、纤维数量及采样密度。
- 纤维采用受控颜色、透明度与 NormalBlending，避免叠白和过曝。
- 页面隐藏时暂停动画；reduced-motion 下停用连续动画，仅按幕切换静态渲染。

## 五、降级与可访问性

| 场景 | 行为 |
|---|---|
| 无 JavaScript | 四幕正文可读；42 节点均为教材链接；不显示空白 canvas |
| 无 WebGL / 上下文丢失 | 自动切换文字状态与 CSS 结构示意 |
| `?no3d` | 强制文字模式，不初始化 Three.js |
| `?lite` | 降低粒子、纤维密度、几何细分与 DPR |
| reduced-motion | 关闭平滑滚动与连续场景运动 |
| 键盘 | 1–4 切幕；Tab 聚焦节点；Escape 关闭详情 |

390px 下 42 节点仍完整显示为 6×7，不采用旧版裁切布局；节点最小高度 44px。

## 六、链接与发布

站内出口均使用相对路径，避免旧版绝对 `/hero/` 路径在 GitHub Pages 项目站点失效。sitemap 条目为：

`https://project003125.github.io/INTRE-website/3d-hero/pages/3d-hero.html`

首页入口暂未添加。候选版只在 `ws/3d-hero-rebuild-20261031` 分支提交，待主理验收后再放行上线。

## 七、验收证据

`qa/` 保存 1440×900 与 390×844 的四幕截图。本轮自动验收覆盖：42 节点、详情术语、键盘/rail/hash、`?lite`、`?no3d`、无 JS、reduced-motion、横向溢出、控制台异常与本地 HTTP 错误。结果详见 `qa/QA-20261031.md`。
