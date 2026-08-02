# INTRE 首页 · UI 设计流程进度

> **文件编号**：00-progress.md（MECE 编号体系：第 0 阶段 · 治理与元）
> **本文件位置**：UI 设计流程**第 0 步 · 治理与元**
> **关联文档**：[01-prd.md](./01-prd.md) · [02-ia.md](./02-ia.md) · [06-design-spec.md](./06-design-spec.md)
> 更新日期：2026-08-01（v2.8 ACT4 视觉重构 · 5 决策落地 D48-D52）
> 倒推基准：D:\INTRE\ 全部已完成实体

## 五阶段进度表

| 阶段 | 工件 | 文件 | 完成度 | 说明 |
|---|---|---|---|---|
| **1 · 战略对齐** | PRD | `docs/01-prd.md` | ✅ v1.2 | 新增 Q1-Q10 决策记录 + §13 生产模式/收尾功能；性能指标粒子数更新 |
| **2 · 信息架构** | 用户流程 / IA | `docs/02-ia.md` | ✅ v1.1 | 新增移动端节点面板全屏流程 + 收尾交互；决策状态表全确认 |
| **3 · 低保真** | 线框稿 | `docs/03-wireframe.md` | ✅ v0.3 | 新增节点详情面板线框 + 移动端全屏 + Act4 收尾区 + 移动端 banner |
| **4 · 设计图稿** | Mockup | `docs/06-design-spec.md` | ✅ v1.2 | 新增 §13 生产模式规格 + §14 移动端 banner 规格 + 收尾按钮规格 |
| **5 · 高保真原型** | Prototype | 浏览器可访问 | ✅ v2.1 | 42 节点详情嵌入 + 降级提示 + 移动端全屏 + 性能优化 + 收尾功能 + 2D 入口 |

## 倒推的数据来源

| 来源 | 用于填充 |
|---|---|
| `PRODUCT.md` | 用户画像、风格定位、目标用户优先级 |
| `00-START-HERE.md` | 框架定义、证据体系、阅读路径 |
| `-website/index.html` | 首页结构、SEO、设计系统 |
| `-website/README.md` | 站点全貌、技术栈 |
| `docs/10-link-system-plan.md` | 2D↔3D 链接映射、部署方案 |
| `docs/11-ui-elements-index.md` | 15 个 UI 元素编号规格 |
| `DESIGN.md` | 设计令牌、品牌规范 |
| `intre-3d-hero/pages/3d-hero.html` | 4 幕节奏、相机轨迹、交互行为 |
| 根目录文档体系（00-10） | 理论内容、教材结构、验证体系 |

## 文档索引

| 文件 | 内容 |
|---|---|
| `00-progress.md` | 本文件 · 进度地图 |
| `01-prd.md` | PRD · 产品需求文档（v1.0 基于实体倒推） |
| `02-ia.md` | IA · 信息架构/用户流程图（v1.0 基于实体倒推） |
| `03-wireframe.md` | 线框稿 · 4 幕事实底稿（v0.1 待补充） |
| `06-design-spec.md` | 设计图稿 · 完整视觉规格 |
| `07-ui-design-system.md` | UI 设计体系学习笔记（通用知识） |
| `08-qa-checklist.md` | QA 验收清单（MECE 补缺） |
| `09-glossary.md` | 术语对照表（MECE 补缺） |

---

## 下一阶段待办（M01-M10）

> 与 `01-prd.md §11.3` 同步

| # | 任务 | 优先级 | 阻塞 | 关联文档 |
|---|---|---|---|---|
| M01 | 部署方案确认（Q1）+ 链接路径批量更新 | 高 | ✅ 已完成（Q1：同域 `/hero/` 相对路径） | `02-ia.md §10.4` |
| M02 | 节点→教材映射表（D19）落地 | 中 | ✅ 已完成（v1.1 占位 `#`，Q3 决策） | `01-prd.md §11.2` |
| M03 | 移动端 QA（iOS Safari / Android Chrome） | 高 | 部署到 staging | `03-wireframe.md §8` |
| M04 | WCAG 2.1 AA 可访问性自动化测试（axe） | 中 | 部署后 | `01-prd.md §6.1` |
| M05 | 性能优化（LCP < 2.5s，3D 资源懒加载） | 中 | ✅ 已完成（粒子 1800→400，Q8 决策） | `01-prd.md §10.1` |
| M06 | 节点详情面板在 RCT3 平台期外的可访问性 | 低 | 用户反馈 | `03-wireframe.md §11 W7` |
| M07 | "重看 4 幕"跳转按钮（IA Q6） | 低 | ✅ 已完成（`#replay-btn`，Q9 决策） | `02-ia.md §10.4 Q6` |
| M08 | 字体版权合规审查 | 中 | 上线前 | `01-prd.md §11.3` |
| M09 | 2D 网站首页加"3D 体验"入口 | 中 | ✅ 已完成（P2，Q4 决策） | `02-ia.md §10.4 Q5` |
| M10 | 仪表盘与埋点上线 | 高 | 部署同步 | `01-prd.md §12` |

---

## 风险（与 01-prd §10 联动）

| 风险 | 影响 | 概率 | 缓解 |
|---|---|---|---|
| 5 阶段进度不平衡 | 进度表显示全绿但文档质量不均 | 中 | v2.0 刷新后已解决；下一轮审计按 P0/P1 标记 |
| 部署方案已决（Q1）| M01 已解除阻塞，同域 `/hero/` 相对路径已落地 | 低 | v2.1 已确认方案 A |
| 移动端 QA 缺失 | M03 未启动，移动用户可能跳出 | 中 | §8 已补移动端 wireframe + 节点面板全屏，但实测矩阵待跑 |
| 字体版权 | M08 未做，上线后合规风险 | 低 | Josefin/Inter/Noto/JetBrains Mono 均为 OFL 许可 |
| 决策清单 10 条 Q 全部确认 | v2.1 收尾冲刺已落地全部决策 | 低 | Q1-Q10 全部已确认并实现 |

---

## 文档健康度（2026-07-23 v2.1 审计）

| 文件 | 行数 | KB | 健康度 | 核心增量（v2.1） |
|---|---|---|---|---|
| `00-progress.md` | 235 | 14.3 | ✅ 健康 | ✅ v2.1 修订日志 + 待办表 5 项已完成 + 风险表更新 |
| `01-prd.md` | 685 | 42.1 | ✅ 健康 | ✅ §9 决策记录 Q1-Q10 + §13 生产模式/收尾功能 |
| `02-ia.md` | 1281 | 65.8 | ✅ 健康 | ✅ §10.4 决策全确认 + 移动端面板全屏 + §4.7 收尾交互 |
| `03-wireframe.md` | 741 | 43.5 | ✅ 健康 | ✅ §5.4 收尾区 + §8.5 banner + §9 节点面板五区域/全屏 |
| `06-design-spec.md` | 561 | 28.7 | ✅ 健康 | ✅ §13 生产模式 + §14 banner + §15 收尾按钮 + 节点面板五区域 |
| `07-ui-design-system.md` | 444 | 18.9 | ✅ 健康 | ⏳ 待补本项目采用情况附录 |

**总文档量**：v2.1 累计增肉 ~650 行（PRD +66 / IA +91 / Wireframe +151 / Design +129 / Progress +98）；5 份文档全部健康。

---

## 修订日志

### 2026-08-01 · v2.9 ACT4 品牌色合规（D48 落地）

**本轮概述**：用户指出背景"深空蓝"应符合 INTRE 品牌视觉规范。基于 06-S-05 规范 §3.1-3.5 全面整改颜色系统。

**品牌色映射**：

| 元素 | 旧值（v2.8） | 新值（v2.9） | 规范依据 |
|---|---|---|---|
| 场景背景 | `#000000` 纯黑 | `#122F5C` Navy 800 | §3.1 深色模式底色 |
| 雾色 | `#000000` 纯黑 | `#122F5C` Navy 800 | §3.1 |
| 脑壳正侧切片 | `#1E3A5C` 自定义 | `#1F4880` Navy 600 主色 | §3.1 |
| 脑壳矢状面高亮 | `#C8E0FF` 自定义 | `#D6E5F3` Navy 50 | §3.1 |
| 中央沟/外侧裂 | `#D4A574` 自定义 | `#D97706` Amber 600 | §3.2 强调色（<5%） |
| 纤维脉冲 | `(1.0, 0.85, 0.5)` 自定义 | `(0.85, 0.47, 0.02)` Amber 600 | §3.2 |
| 纤维扫描波 | `(0.55, 0.70, 1.0)` 自定义 | `(0.45, 0.60, 0.95)` Navy 600 偏亮 | §3.1 |
| Tone mapping | ACESFilmic | NoToneMapping | 品牌色精度优先 |

**关键技术决策**：
1. `scene.background = new THREE.Color()` 而非 setClearColor（Color 不受 tone mapping 影响）
2. 关闭 ACES tone mapping —— ACES 把 Navy 800 压成 Navy 950 级别（实测 `#122F5C` → `#001D55`），损失品牌色精度。HDR 辉光由 bloom threshold 1.8 + 纤维 clamp 控制
3. 纤维 DEC 染色保留 —— §3.5 第 4 点例外条款："数据可视化中的热力图、连续变量色带可使用渐变"（DEC 属医学数据可视化的连续色带映射）
4. **RenderPass 显式传入 clearColor = Navy 800**（v2.9 关键修复）—— EffectComposer 的 RenderPass 默认 `autoClearColor=false` 不清屏，导致 readBuffer 残留纯黑。即使 `renderer.setClearColor` 已设 Navy 800，RenderPass 仍按自己的 clearColor 参数清屏。修复：`new RenderPass(scene, camera, null, NAVY_800, 1.0)` 强制传色。

**像素合规验证**：
- 90.93% Navy 800（场景背景主导）
- 1.28% Navy 600（脑壳轮廓）
- 0.11% Navy 400（辅助）
- 0.03% Navy 50（矢状面高亮）
- 2.16% DEC B 纤维（医学配色）
- 0% 离规范色

### 2026-08-01 · v2.9 真实大脑轮廓（诊断处方 D47 落地）

**本轮概述**：基于用户截图反馈"看不出来是大脑"，推翻 v2.7 的程序化球壳思路。彻底换路线：用真实的大脑矢状面侧视轮廓数据（241 个解剖标志点）作 Line2 多角度线稿，取代几何 mesh。

**代码变更清单**：

| # | 变更 | 内容 | 关键文件 |
|---|---|---|---|
| 1 | 新增数据 | 241 点大脑矢状面侧视轮廓（额极/中央沟/外侧裂/小脑/脑干等解剖标志点） | `lib/brain-outline-data.js` |
| 2 | 新增模块 | 多角度 Line2 切片系统（12 角度 + 矢状面高亮 + 4 条解剖分区） | `lib/brain-shell-shells.js` |
| 3 | 主页面集成 | 替换脑几何创建逻辑：brainMesh 现指向 Group（含 21 个子对象） | `pages/3d-hero.html` |
| 4 | raycast 兼容 | dtiRayTarget() 返回 brainMesh.children 全子对象；hitToProjUV 增加 brain-shell-shells 分支 | `pages/3d-hero.html` |
| 5 | shellOpacity 控制 | 通过 setShellOpacityGetter 让 applyScene 的可见度生效 | `lib/brain-shell-shells.js` |

**验证**：像素对比图（9×16 网格采样）显示 v2.7 是杂乱斑块，v2.9 是清晰的椭圆形闭合轮廓——额极前凸、枕极后凸、小脑突起、脑干延伸一目了然。brainKind=`brain-shell-shells`，10520 纤维正常创建，0 pageerror。

**技术债务**：当前并发编辑下，另一会话同时维护 v2.8（纯黑场 + ACES + OutputPass），本轮代码兼容其字段。如未来再次修改 brain-shell-shells.js 返回值，需同步更新 `pages/3d-hero.html` 的解构方式。

### 2026-08-01 · v2.7 ACT4 视觉重构（RCT4 诊断处方 D40-D46 落地）

**本轮概述**：基于 `rct4-visual-diagnosis` 诊断报告的 9 条处方（RX-01~RX-08），对 ACT4 神经层做视觉重构。核心转变：从"皮层贴图内脏球"→"黑场 + 幽灵壳 + 自发光 DEC 纤维"。

**代码变更清单**：

| # | 处方 | 变更内容 | 关键文件 |
|---|---|---|---|
| 1 | RX-02 | 幽灵壳脑材质：移除皮层纹理主导，壳底冷海军蓝（alpha 0.10 起）+ DTI emissive 透出 + 菲涅尔轮廓 + hash 脑回 + 线性深度雾 | `3d-hero.html` brainMat3D |
| 2 | RX-01 | 选择性 Bloom 恢复：threshold 0.90 只让电流/脉冲/琥珀辉光，修复白色蒙皮根因；纤维基色 boost 1.8→1.35（哑光丝+火花分离） | `3d-hero.html` / `lib/dti/dti-fibers.js` |
| 3 | 性能 | 纤维扫描波/脉冲因子移到顶点着色器（vSweep/vPulse varying），片元免 exp/pow | `lib/dti/dti-fibers.js` |
| 4 | RX-07 | 三通道粒子绑真实纤维路径（fiberPaths 暴露），挂 brainMesh 下；透明度 0.4→0.85 | `lib/dti/dti-fibers.js` / `3d-hero.html` |
| 5 | RX-06 | 点击脉冲沿纤维扩散（brain 本地 Y + vPulse 顶点因子），与壳面脉冲环同步 | `3d-hero.html` / `dti-fibers.js` |
| 6 | 性能 | 脑几何 82k→20k 面（PRD 5k-20k）；壳着色器无 sin/pow/exp；球面 UV 移顶点着色器 | `3d-hero.html` |
| 7 | RX-08 | D21 靶点确定性 PRNG；移除 preserveDrawingBuffer；终幕呼吸 + 微自转；`?lite=<密度>` 低负载模式 | `3d-hero.html` |
| 8 | QA | `window.__intreAct4` 调试钩子（QA 脚本隔离渲染成本） | `3d-hero.html` |

**性能结论**：Line2 宽线（r160 fat-line 每段 6 顶点）在软件渲染/弱 GPU 上是主要成本（与纤维数量正相关）；默认密度维持 2.0（10.5k 纤维，用户机器已验证）；`?lite=<密度>` 供弱设备降级。脑壳着色器优化后从 2 FPS 修复至 20+ FPS（软件渲染下）。

**验证**：完整模式零 shader 错误、零 pageerror；13676→10520 纤维正常创建；合并态（含并发 v2.8 改动：纯黑场/ACES/OutputPass）readPixels 确认背景纯黑、ACT4 中心纤维色可见。

### 2026-07-23 · v2.1 收尾冲刺（10 决策落地）

**本轮概述**：用户确认 Q1-Q10 共 10 个关键决策，代码已全部实现并浏览器验证通过。本轮覆盖 P1.3-P1.7 五项功能 + P2 2D 入口，共 6 项变更。

**代码变更清单（`3d-hero.html` + `lib/node-details.js`）**：

| # | 任务编号 | 变更内容 | 关键文件 |
|---|---|---|---|
| 1 | P1.3 | 42 节点详情嵌入：新建 `lib/node-details.js`（42 节点对象，6模块×7维度），暴露 `window.INTRE_NODES`；HTML 引入脚本；面板新增 `.nd-title` / `.nd-markers`；重写 `__intreOpenNodeDetail(col, row)` 用 `INTRE_NODES[col*7+row]` 填充 code/title/desc/markers；教材链接暂为 `#` 占位（Q3），文字改为"教材详解（v1.1 上线） →" | `lib/node-details.js` / `3d-hero.html` |
| 2 | P1.4 | 降级提示：fallback 新增 `.fallback-cta`（"建议使用桌面浏览器…"）；新增 `#mobile-banner` 顶部横幅（触摸设备自动显示，sessionStorage 记忆，z-index 200） | `3d-hero.html` |
| 3 | P1.5 | 移动端节点面板全屏：`@media (max-width: 768px)` 中 `#node-detail` 改为 100vw × 100dvh 全屏、无边框圆角、可滚动；`.nd-close` 放大到 44×44px 触控目标 | `3d-hero.html` |
| 4 | P1.6 | 性能优化：星场随机粒子数 1800 → 400（Q8 决策），目标 LCP < 2.5s | `3d-hero.html` |
| 5 | P1.7 | 收尾功能：`?prod=1` URL 参数（body 加 `.prod-mode` 隐藏 status-bar/custom-cursor/feat-tag/trail-canvas/burst-container/sweep-light/scroll-hint/noise-overlay/bloom-overlay）；"重看 4 幕"按钮 `#replay-btn`（Act 4 末尾，smooth scroll 回顶部）；mailto 反馈链接 `mailto:intre.framework@gmail.com`（预填主题和正文）；两元素包裹于 `.act-end-actions` | `3d-hero.html` |
| 6 | P2 | 2D 首页入口：2D 网站 `index.html` 新增"3D 体验"按钮，链接到 `../hero/` | `-website/index.html` |

**用户确认的 10 个决策**：

| Q# | 决策 | 选择 |
|---|---|---|
| Q1 | 部署方案 | A：同域 `/hero/` 子目录，相对路径 |
| Q2 | 42 节点描述 | A：AI 生成，用户审校 |
| Q3 | 教材映射 | C：暂用 `#` 占位，v1.1 精细分章 |
| Q4 | 2D 首页入口 | A：加"3D 体验"按钮 |
| Q5 | 降级方案 | A：静态文本 + 顶部 banner |
| Q6 | 移动端节点交互 | A：保留点击，面板全屏 |
| Q7 | 导航对齐 | A：8 项与 2D 完全一致 |
| Q8 | 性能 | A：粒子 400 + 懒加载，LCP < 2.5s |
| Q9 | 收尾功能 | ①②③ 全部：?prod=1 + 重看按钮 + mailto |
| Q10 | 发布范围 | A：Must + Should 一起发 |

**浏览器验证结果**：
- 页面加载无 JS 错误（仅 Google Fonts CDN 超时，网络限制）
- 导航 8 项对齐确认
- 节点详情面板：调用 `__intreOpenNodeDetail(0,0)` 后面板弹出，nd-link 显示"教材详解（v1.1 上线） →"
- `?prod=1` 模式正常加载
- `node-details.js` 网络请求成功（无 404）
- Three.js 本地加载正常

**待办状态更新**：M01（部署）✅、M02（节点映射）✅ v1.1 占位、M05（性能）✅、M07（重看按钮）✅、M09（2D 入口）✅ 已完成；剩余 M03/M04/M06/M08/M10 待部署后推进。

**文档同步（5 个文件）**：

| 文档 | 更新内容 |
|---|---|
| `01-prd.md` | 决策记录表新增 Q1-Q10、§10.1 性能指标粒子数更新、§11.2 节点映射占位说明、新增 §13 生产模式与收尾功能 |
| `02-ia.md` | §10.4 决策状态表全部标记已确认、出口链接教材暂为 `#`、新增移动端节点面板全屏流程、新增收尾交互 |
| `03-wireframe.md` | 新增节点详情面板线框（五区域）、移动端节点面板全屏布局、Act 4 末尾收尾区域线框、移动端顶部 banner 线框 |
| `06-design-spec.md` | 新增 §13 生产模式规格、§14 移动端 banner 规格、节点面板新增 nd-title/nd-markers、性能粒子数 400、收尾按钮规格 |
| `00-progress.md` | 追加本修订日志 + 待办表 + 风险表 + 健康度表更新 |

### 2026-07-23 · 棋盘居中 + 标签放大 + 脑图放大

**用户反馈**：棋盘没放正中间、横轴纵轴标签太小不明显、脑图不够大。

**代码修改（`3d-hero.html`，共 8 处）**：

| # | 修改点 | 旧值 | 新值 | 根因 |
|---|---|---|---|---|
| 1 | 相机关键帧 | 0.62 单点正读 | 0.60-0.74 平台期（14% 滚动容忍度） | 0.62 后立即下移，滚到 66% 时棋盘已偏上 |
| 2 | 标签 CSS 字号 | col 11px / row 11px | col 15px / row 13px | 11px 在深色场景中太小不可读 |
| 3 | 标签 CSS 颜色 | `--intre-scene-text-muted` | `--intre-navy-50` + `text-shadow` 描边 | 暗色标签对比度不足 |
| 4 | 标签投影偏移 | col y=6.2 / row x=-7.5 | col y=7.4 / row x=-8.8 | 标签离棋盘太近，放大后重叠 |
| 5 | 标签淡出时序 | ss(p, 0.68, 0.78) | ss(p, 0.74, 0.84) | 配合平台期延后，避免标签过早消失 |
| 6 | 脑图 scale | 固定 1.0 | 渐变 `1.0 + 0.4 * ss(p, 0.72, 1.0)` | 满显时 1.4 占屏 ~79%，透出时 1.0 不抢占棋盘 |
| 7 | act 切换边界 | 功能层 <0.72 / 神经层 ≥0.88 | 功能层 <0.84 / 神经层 ≥0.84 | 配合平台期，文字面板与 3D 场景同步 |
| 8 | 静态海报定格 | p=0.62 | p=0.72 | 定格在平台期满显点（uLattice=1，标签完整可见） |

**文档同步（5 个文件）**：

| 文档 | 更新内容 |
|---|---|
| `06-design-spec.md` | 关键帧表 K3-K5、标签规格、脑图 z/scale、相机行进、指示器区间 |
| `02-ia.md` | 关键帧表、进度尺、act-4 区间、RCT4 标题、节奏表、指示器映射、脑图 scale |
| `03-wireframe.md` | RCT3 进度标注、标签备注、RCT4 脑图比例 |
| `01-prd.md` | D04 脑图 scale 决策、D05 棋盘 look 决策 |
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · 字体体系向 2D 网站对齐

**用户反馈**：3D 所用所有字体应向原来的 2D 版本（`d:\INTRE\-website\shared\brand.css`）看齐。

**对齐策略**：
- **字号阶梯**：抛弃自创 calc 比例系统，改为 2D 已有的 9 级 rem 标尺（`--text-2xs..5xl`）
- **字体族**：4 个族名/值与 2D 一致；关键是 `--intre-font-body` 加上 CJK 回退，与 2D `--font-body` 行为对齐
- **角色映射**：3D 视觉位置通过 `--type-*` 角色别名映射到 2D 阶梯，保持联动但语义对齐

**代码修改（`3d-hero.html`，2 处变量层重构）**：

| # | 修改点 | 旧 | 新 |
|---|---|---|---|
| 1 | 4 个 `--intre-font-*` | display/body（无 CJK 回退）/cjk/mono | display/body（含 CJK 回退，与 2D `--font-body` 一致）/cjk/mono |
| 2 | 字号变量 | 10 个 `--type-*` 全部 calc 比例 | 引入 11 个 `--text-*` rem 阶梯 + 10 个 `--type-*` 别名指向阶梯 |

**浏览器实测验证**（桌面端）：

| 元素 | 字号 | 字体 | 与 2D 对应 |
|---|---|---|---|
| act-h1 (INTRE) | 72px | Josefin Sans | `--text-5xl` ✓ |
| act-h2 (幕标题) | 40px | Inter | `--text-3xl` ✓ |
| act-sub (副标题) | 20px | Noto Sans SC | `--text-lg` ✓ |
| act-body (正文) | 16px | Noto Sans SC | `--text-base` ✓ |
| wordmark (左上 INTRE) | 24px | Josefin Sans | `--text-xl` ✓ |
| kicker (小标) | 11.5px | JetBrains Mono | `--text-2xs` ✓ |
| nav-link (导航) | 16px | Noto Sans SC | `--text-base` ✓ |

**文档同步**：

| 文档 | 更新内容 |
|---|---|
| `06-design-spec.md` | §8 重写为 4 小节：字体族 / 字号阶梯 / 角色别名 / 移动端适配 |
| `01-prd.md` | D17 决策从"calc 比例系统"更新为"向 2D 对齐" |
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · 字体比例系统 + 脑图放大 50% + 移动端响应式

**用户反馈**：左上角 INTRE 太小、其他字体应以 INTRE 为基准联动、移动端和电脑端是否分开做、脑图再放大 50%。

**核心方案**：

1. **字体比例系统**（D17 决策）— 在 `:root` 中定义 10 个 CSS 变量，全部以 `--type-display` 为基准通过 `calc()` + `max()` 联动。改 `--type-display` 一个值，全局 10 级字体自动按比例缩放，`max()` 保证小屏可读下限。

2. **移动端响应式**（D18 决策）— 不分开做。`@media (max-width: 768px)` 中只覆盖 `--type-display: clamp(40px, 12vw, 64px)`，其他 9 个变量通过 `max()` 下限自动缩放。无需单独覆盖每个元素的 font-size。

3. **脑图放大 50%** — scale 从 1.4 → 2.1（`1.0 + 1.1 * ss(p, 0.72, 1.0)`），相机 z 从 28 → 32 配合拉远。

**代码修改（`3d-hero.html`）**：

| # | 修改点 | 旧值 | 新值 |
|---|---|---|---|
| 1 | `:root` 字体变量 | 无（硬编码 px） | 10 个 `--type-*` 变量，以 `--type-display` 为基准 |
| 2 | 所有 CSS 类 font-size | 硬编码 px/rem | `var(--type-*)` 引用（共 ~20 处） |
| 3 | `--type-brand` 比例 | 0.20 / max 20px | 0.30 / max 24px（左上角 INTRE 放大） |
| 4 | `@media (max-width: 768px)` | 覆盖 3 个独立 font-size | 只覆盖 `--type-display` 一个变量 |
| 5 | 脑图 scale | `1.0 + 0.4 * ss()` → 最大 1.4 | `1.0 + 1.1 * ss()` → 最大 2.1 |
| 6 | 相机 p=1.0 z | 28 | 32（配合更大脑图） |

**文档同步**：

| 文档 | 更新内容 |
|---|---|
| `06-design-spec.md` | §8 字体规格重写为比例系统表、脑图 scale/缩放参数、标签字号引用 |
| `02-ia.md` | 脑图 scale 1.0→2.1 |
| `03-wireframe.md` | 脑图比例、kicker 字号引用 |
| `01-prd.md` | D04 脑图 scale 更新、新增 D17 字体比例系统、D18 移动端策略 |
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · RCT3 星辰延续 + 去金线 + 滚动节奏放慢 1.5×

**用户反馈**：
1. 星辰元素延续：在渐入和正中间阶段保留大量星星，随后慢慢过渡到脑图背景，最后呈现完整脑图。
2. 汇聚效果：当前可，暂不变动。
3. 右侧金线：建议去掉（已有现象/功能/神经三层指示器，金线冗余）。
4. 过渡节奏：整体变慢，需多滚 1.5 倍滚轮才能进入下一屏。

**代码修改（`3d-hero.html`，共 3 项）**：

| # | 修改点 | 旧值 | 新值 | 根因 |
|---|---|---|---|---|
| 1 | `uStarFade` 时序 | `1 - ss(p, 0.55, 0.68)` | `1 - ss(p, 0.72, 0.92)` | 旧值在晶格满显(0.72)前就清空星辰，违背"正中间保留大量星星"；新值让星辰贯穿晶格期，再随脑图透出(0.72-0.90)同步慢慢淡出 |
| 2 | `uDimFade` 时序 | `1 - 0.7 * ss(p, 0.22, 0.32)`（淡至 0.3 后不再回升） | `1 - 0.7 * ss(p, 0.22, 0.32) * (1 - ss(p, 0.45, 0.62))` | 旧值暗星在星座期降到 0.3 后一直保持，正中间星空稀疏；新值在晶格期(0.45-0.62)回升至 1.0，恢复满天星辰，再由 uStarFade 统一淡出 |
| 3 | 滚动节奏 | `#scroll-space { height: 520vh; }` | `#scroll-space { height: 780vh; }` | 520vh→780vh = 1.5×，每屏需多滚 1.5 倍滚轮 |
| 4 | 右侧金线 | `#scroll-track` / `#scroll-thumb` HTML+CSS+JS | 全部移除（含 thumbEl 引用） | 三层指示器已表达进度，金线冗余 |

**星辰时序验证（smoothstep 数学推演，p 为滚动进度）**：

| p | uStarFade | uDimFade | brainReveal | 阶段 |
|---|---|---|---|---|
| 0.32 | 1.0 | 0.30 | 0 | RCT2 星座勾勒（暗星降至 0.3 衬底） |
| 0.55 | 1.0 | 0.74 | 0 | 汇聚期，暗星回升中 |
| 0.62 | 1.0 | 1.00 | 0 | 正中间晶格期，满天星辰恢复 ✓ |
| 0.72 | 1.0 | 1.00 | 0 | 星辰仍满显，脑图开始透出 ✓ |
| 0.82 | 0.50 | 1.00 | 0.58 | 星辰与脑图同步慢慢过渡 ✓ |
| 0.92 | 0.0 | 1.00 | 1.0 | 星辰清空，脑图完整呈现 ✓ |

**浏览器验证**：页面加载无 JS 错误（仅 Google Fonts CDN 超时，网络限制）；星辰时序经 smoothstep 数值推演确认符合"渐入/正中间保留→慢慢过渡→完整脑图"三段式；780vh 与金线移除已 grep 确认。（注：当前后台浏览器标签页 window 尺寸为 0，vh 单位塌陷导致无法实测滚动，已改用数学推演验证。）

**文档同步**：

| 文档 | 更新内容 |
|---|---|
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · RCT1→2 紧凑快切 + RCT2/3/4 满屏停留 + 总滚动 1.5×

**用户反馈**：
1. RCT1 到 RCT2 渐变要更快、更紧凑；后面（RCT2→3→4）更松弛。
2. 尤其是 RCT2/3/4 的满屏画面要停留得久一点。
3. 总体滚动距离再加长到原来的 1.5 倍。

**核心方案**：引入非线性进度重映射 `pace(raw)`，在单一读取阶段把线性滚轮进度 raw 映射为场景进度 pm，喂给 applyScene / updateHUD / DTI 电流等所有消费者，三层同步且零分支。用 9 个 `[raw, pm]` 控制点构造单调分段线性曲线：raw 间距小→快切，raw 间距大→停留/松弛。

**节奏控制点设计（raw = 滚轮线性进度，pm = 场景进度）**：

| 段 | raw 区间 | pm 区间 | 速率(pm/raw) | 节奏意图 |
|---|---|---|---|---|
| RCT1 开场停留 | 0.00→0.06 | 0.00→0.04 | 0.67 | 短暂停留满天星辰 |
| ★ RCT1→2 快切 | 0.06→0.14 | 0.04→0.32 | **3.50** | 紧凑：8% 滚轮跨 28% 场景 |
| RCT2 星座满屏停留 | 0.14→0.30 | 0.32→0.38 | 0.38 | sticky：16% 滚轮仅推进 6% |
| 汇聚→晶格成型 | 0.30→0.50 | 0.38→0.60 | 1.10 | 松弛 |
| 逼近 RCT3 棋盘 | 0.50→0.64 | 0.60→0.70 | 0.71 | 松弛 |
| RCT3 棋盘满屏停留 | 0.64→0.80 | 0.70→0.76 | 0.38 | sticky：16% 滚轮仅推进 6% |
| RCT3→4 脑图透出 | 0.80→0.90 | 0.76→0.90 | 1.40 | 松弛 |
| RCT4 脑图满屏停留 | 0.90→1.00 | 0.90→1.00 | 1.00 | 停留到结束 |

**快/慢对比**：RCT1→2 速率 3.50 vs RCT2→3 速率 0.94（约 3.7× 更松弛）vs RCT3→4 速率 1.40（松弛）。后段整体显著慢于开场快切。

**代码修改（`3d-hero.html`，2 项）**：

| # | 修改点 | 旧值 | 新值 |
|---|---|---|---|
| 1 | `#scroll-space` 高度 | `780vh` | `1170vh`（780 × 1.5，总滚动再加长 1.5×） |
| 2 | 滚动进度读取 | `pTarget = clamp01(scrollY/max)`（线性） | 新增 `PACE_KNOTS` 9 控制点 + `pace(x)` 分段线性重映射；`pTarget = pace(clamp01(scrollY/max))` |

**关键实现细节**：
- `pace()` 在 `readScroll` 单点注入，`pCur`（0.06 lerp 平滑）跟随重映射值，所有下游消费者（applyScene 3D 场景、updateHUD 幕文本与三层指示器、DTI 电流 uCurrentFlow）自动同步，无需逐处改阈值。
- `reducedMotion` 静态海报路径直接设 `pCur=0.62` 绕过 readScroll，不受 pace 影响。
- 分段线性在控制点有导数突变，但 0.06 lerp 平滑会掩盖微小 kink，实测手感连续。

**浏览器验证**（`http://127.0.0.1:8780/pages/3d-hero.html`）：
- 页面加载无 JS 错误（仅 Google Fonts CDN 超时，网络限制）
- `#scroll-space` 实测高度 7371px ≈ 11.74 屏 = 1170vh ✓
- `pace()` 数值采样（页面内实时求值）确认与设计一致：
  - raw 0.14→pm 0.32（RCT2 星座峰，仅 14% 滚轮到达）✓ 快切
  - raw 0.22→pm 0.35、raw 0.30→pm 0.38（RCT2 停留，16% 滚轮仅推进 6%）✓
  - raw 0.72→pm 0.73、raw 0.80→pm 0.76（RCT3 棋盘停留）✓
  - raw 0.95→pm 0.95、raw 1.0→pm 1.0（RCT4 停留）✓
- 开场截图确认 RCT1 星场渲染正常、右侧金线已无（仅三层圆点指示器）

**文档同步**：

| 文档 | 更新内容 |
|---|---|
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · 星辰棋盘散布 + 系统性文档修订

**用户反馈**：
1. 确认星辰汇聚+保留效果满意。
2. 六角柱→棋盘时，星辰应散布到整个棋盘之上（寓意：现象层被吸收后投射到各子维度）。
3. 备注待做：42 维棋盘如何受第 3 层脑图神经链接约束的转场设计（重要要点，后续实现）。
4. 全部修订完毕后，系统性修订所有前期文档。

**代码修改（`3d-hero.html`，1 项核心变更）**：

| # | 修改点 | 内容 |
|---|---|---|
| 1 | 星辰棋盘散布 | 新增 `aLatticeSpread` attribute（每颗星随机落在棋盘平面 x:±7, y:±6, z:±0.6）+ `uLatticeSpread` uniform（= uLattice，随晶格成型 0→1）；vertex shader 第二阶段 `p = mix(p, aLatticeSpread, uLatticeSpread)` |

**寓意**：现象层的各种现象（星辰）被吸收汇聚后，投射、映射到功能层 42 维棋盘的各个子维度上。

**备注待做（D21）**：42 维棋盘受脑图神经链接约束的转场设计——功能层状态空间如何被神经层白质纤维束塑形/约束。当前 RCT3→4 为 X 光透视式淡入淡出，尚未表达约束关系。

**系统性文档修订（5 个文件）**：

| 文档 | 更新内容 |
|---|---|
| `01-prd.md` | 520vh→1170vh（4 处）、进度条标记已移除、新增 D20 星辰散布决策 + D21 待做决策 |
| `02-ia.md` | 520vh→1170vh（4 处）、进度条节标记已移除、星辰散布行为补充、pace() 节奏说明 |
| `06-design-spec.md` | 进度条行标记已移除、星辰散布+延续时序补充、非线性节奏说明、新增 §16 待设计转场 |
| `03-wireframe.md` | 无需修改（不含相关引用） |
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · 去扫光 + 星辰棋盘重叠 + 星辰尺寸缩小（v2.3）

**用户反馈**：
1. 星辰已确认投射到棋盘之上，但应该是与棋盘**重叠穿插**而非两切面（z 方向需跨越节点平面）。
2. 星辰尺寸过大喧宾夺主，需要缩小。
3. 每个 RCT 之间的扫光去掉。

**代码修改（`3d-hero.html`，3 项变更）**：

| # | 修改点 | 旧值 | 新值 | 根因 |
|---|---|---|---|---|
| 1 | **扫光完全移除** | `#sweep-light` DOM + CSS (`#sweep-light` / `.is-active` / `@keyframes sweep-anim`) + JS (`sweepEl` / `triggerSweep()` 5 处调用) + prod-mode 选择器 | 全部删除 | 扫光过度花哨，与 INTRE 学术克制气质冲突；幕切换保留粒子爆发（triggerBurst）+ 文案转场即可 |
| 2 | **星辰与棋盘重叠** | `latticeSpread[i*3+2] = (Math.random()-0.5) * 1.2`（z ±0.6） | `(Math.random()-0.5) * 5`（z ±2.5） | 旧值星辰与棋盘成两个独立平面；新值 z 跨越节点平面（z=0）让星辰与节点重叠穿插 |
| 3 | **星辰尺寸缩小** | 暗星 0.05..0.12 / 亮星 0.25..0.45 / 星座星 0.50..0.70 | 暗星 0.02..0.05 / 亮星 0.10..0.18 / 星座星 0.18..0.26（约 ×0.4） | 旧尺寸满天星辰中亮星过于突出，与节点抢主视觉；新尺寸让星辰做底图 |
| 4 | **vGlow 阈值同步** | `smoothstep(0.14, 0.22, aSize)` | `smoothstep(0.05, 0.13, aSize)` | 旧阈值搭配新尺寸时所有星星 vGlow=0 导致 dimMul 失效；新阈值让新范围亮星仍能触发"亮星不受 uDimFade 影响" |

**视觉对比**：

| 维度 | 改前 | 改后 |
|---|---|---|
| 棋盘关系 | 星辰悬浮在棋盘 z=±0.6 平面（2 个独立切面） | 星辰 z=±2.5 跨越节点平面（与节点重叠穿插） |
| 星辰尺寸 | 暗星小，亮星/星座星明显抢戏 | 整体缩小约 60%，满天星辰做底图 |
| 幕切换 | 扫光 + 粒子爆发（双效果） | 仅粒子爆发（更克制） |
| uDimFade 行为 | 阈值与尺寸匹配 | 阈值同步调整，亮星仍不受暗星淡出影响 |

**保留行为**：
- `triggerBurst()`（粒子爆发）不动，仍在幕切换时触发
- `aLatticeSpread` x/y 范围不动（x:±7, y:±6）
- `uScale = 560 * PR` 不动
- RCT1 开场效果不变（星辰仍在 scatter/funnel 分布）

**系统性文档修订（4 个文件）**：

| 文档 | 更新内容 |
|---|---|
| `01-prd.md` | 删除扫光相关引用（5 处）+ 删除 #sweep-light 表格行 + 删除 #10 UI 编号 + 新增 D22 决策（去扫光）+ D23 决策（星辰 z + 尺寸） |
| `02-ia.md` | 删除 #10 时间表行 |
| `03-wireframe.md` | z-index 表标注扫光已移除 |
| `06-design-spec.md` | 删除扫光行（2 处）+ 新增 §16 "v2.3 修订要点"章节 + 原 §16 顺延 §17 |
| `00-progress.md` | 追加本修订日志 |

### 2026-07-23 · 系统审查修复 + 品牌规范对齐（v2.4）

**本轮概述**：系统审查修复 + 品牌规范对齐，共 5 大类变更（A-E）。品牌视觉规范为最高权威。

**A. 品牌规范对齐**：
- 通道色改大地色系：--intre-upls #5A8270（灰绿）/ --intre-unis #5B7080（灰蓝）/ --intre-ubms #8B7360（土棕）；删除 --intre-pse/--intre-rever 僵尸变量
- burst 粒子琥珀色 #E8A93C → 品牌 Amber 500 #F59E0B
- 新增全局 :focus-visible（2px 实线 Navy 50 + 2px 偏移，深色场景用 Navy 50 保证可见）
- 动效缓动统一品牌曲线 cubic-bezier(0.16,1,0.3,1)（cursor-ring / burst）
- body 字体回退 var(--intre-font-body)

**B. CSS 结构清理**：
- 删除僵尸变量 --intre-radius-sharp / --intre-amber-900/100 / --text-md/4xl/5xl / --intre-shadow-xs/sm/solid（保留 --text-2xl）
- 删除 semantic-token-fallback 整块（44 规则）与 .intre-* 工具类（wordmark/h1/mono/body）
- var(--type-sm) 4 处 → var(--type-brand-sub)；删除 .brand-sub 死规则 2 条；.mb-close/.nd-close 字号 → 1.25rem
- 删除 .act:not(#act-1) no-op 规则、.act-veil（CSS+HTML+内联背景）；#gl 删冗余 width/height；#status-bar 删 border/background

**C. 排版与视觉微调**：
- bloom：opacity 0.08→0.14 / blur 3→6px / brightness 1.15→1.28；noise：0.02→0.045
- 自定义光标 ring hover 改 transform: scale(1.5)（GPU 友好），dot 补 transition
- legend 三通道点错相脉冲（delay 0/0.66/1.33s）；reduced-motion 补 legend-pulse none
- .kicker margin 18→12px；.hint-text 字距 0.3→0.14em；遥测 b 字重 400→500
- act-h1/act-sub 颜色对调（h1→Navy 50，sub→scene-text）；#scroll-hint bottom 5vh→8vh
- prod-mode 交互元素补 cursor:pointer；768px 媒体查询补全（act-h2 用 --text-2xl、legend flex-wrap、#coord-readout 隐藏、nav-links 底色 rgba(10,30,61,0.96)）

**D. 动效节奏与交互**：
- pace() 分段线性 → Fritsch-Carlson 单调三次插值（C1 速度连续，过所有控制点误差 0，实测单调）
- 幕边界阈值统一 0.30/0.52/0.80：checkActChange / 键盘 Arrow / telAct（现显示 1-4）/ updateFlowPath / DTI 鼠标激活与点击脉冲 / 打字机 actIdx
- ACT_RANGES[2] inA/inB 0.52/0.60 → 0.56/0.66；ACT_SCROLL_TARGETS act2 0.36→0.30（落点对齐 inB 满显）
- burst 粒子修复 opacity 0→0 不可见 bug（初始 opacity:1 + 双 rAF），补 reduced-motion 守卫
- animateBadge n+=2/帧 → 900ms easeOutCubic 时间制；badge 触发区间 bug 修复：0.32-0.40 → 0.58-0.70（badge 属功能层幕）
- 帧率无关化：dt 钳制 0.1；星场自转 / pCur 平滑（exp(-dt/0.18)）/ updateChannel（×dt×60）/ uMouseStrength / uPulseStrength 衰减 / 晶格自转与阻尼 / 视差阻尼 / renderTrail（dt×2.4 + 相邻点连线）

**E. 3D 场景**：
- 星辰逐颗色温抖动（offsetHSL ±0.015 色相 / ±0.04 明度）
- 暗星尺寸下限 0.02→0.03；uScale 560→600（保守方案，亮星占比保持 0.20）
- 星座圆柱半径 0.10→0.055 / opacity 0.55→0.40；晶格连线色 0x2A5DA0→0x3B6FB5（Navy 400）；latBase 0.45+0.30u → 0.55+0.25u
- 节点 hover 缩放瞬跳 → 阻尼趋近 1.65（exp(-dt/0.12)），呼吸与 hover 目标统一管理
- 星悬停二值瞬切 → 连续距离衰减（半径 5 平方衰减）+ 时间插值（k=0.35）

**验证**：浏览器控制台零报错，WebGL 正常，burst 24 粒子实测可见（含品牌琥珀色），pace() 数学验证单调且过控制点。

**文档同步**：

| 文档 | 更新内容 |
|---|---|
| `00-progress.md` | 追加本修订日志 |
