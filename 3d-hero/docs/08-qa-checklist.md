# INTRE 3D Hero — QA 验收清单（Quality Assurance Checklist）

> **文件编号**：08-qa-checklist.md（MECE 编号体系：第 6 阶段 · 质量验收）
> **本文件位置**：UI 设计流程**第 6 阶段 · 质量验收**
> **关联文档**：[00-progress.md](./00-progress.md) · [01-prd.md](./01-prd.md) §6 验收标准 · [03-wireframe.md](./03-wireframe.md) §11 待办 · [05-tech-impl-spec.md](./05-tech-impl-spec.md)
> **版本**：v1.0
> **日期**：2026-07-24
> **状态**：✅ 初版（v2.5 升级配套）

---

## 0. 用途说明

本文档是 INTRE 3D Hero 的**质量验收清单**，覆盖以下五个维度：

| 维度 | 含义 | 关联规范 |
|------|------|----------|
| 1. 品牌合规 | 视觉与品牌视觉规范 v2.3.0 一致 | `06-格式治理/06-S-05-INTRE-品牌视觉规范.md` |
| 2. 设计实现 | wireframe / design-spec 中的视觉与交互全部实现 | `03-wireframe.md` / `06-design-spec.md` |
| 3. 性能指标 | 满足 PRD §4.4 性能阈值 | `01-prd.md §4.4` |
| 4. 可访问性 | WCAG 2.1 AA 达标 + `prefers-reduced-motion` 支持 | `01-prd.md §6.1` |
| 5. 链接打通 | 全部可点击位点指向 2D 网站正确目标 | `10-link-system-plan.md` |

每个验收项前用 `[ ]` 标记，**全部勾选**才视为"可发布"状态。

---

## 1. 品牌合规清单（Brand Compliance）

> 权威来源：`06-格式治理/06-S-05-INTRE-品牌视觉规范.md` v2.3.0（D1a 级）

### 1.1 色彩使用

- [ ] 底色为 `--intre-navy-950` `#0A1E3D`（WebGL `readPixels` 采样验证）
- [ ] 无任何 CSS `linear-gradient` / `radial-gradient`（除数据可视化例外）
- [ ] 无 `backdrop-filter` glass morphism 效果
- [ ] 无 SaaS 紫蓝渐变 / 拟物 / 高光 / 玻璃拟态
- [ ] Navy 90% / Amber 5% / 通道色 5% 比例符合
- [ ] 通道色使用大地色系（UPLP `#5A8270` / UNIP `#5B7080` / UBMP `#8B7360`）
- [ ] 单视口通道色同时出现 ≤ 2 种

### 1.2 字体

- [ ] Logo / H1 使用 Josefin Sans（不可替换）
- [ ] H2 及以下使用 Inter（拉丁）+ Noto Sans SC（中文）
- [ ] 等宽使用 JetBrains Mono
- [ ] 字号阶梯与 2D 网站 `shared/brand.css` 对齐（9 级 rem）
- [ ] 桌面端 768px / 移动端单断点

### 1.3 圆角与阴影

- [ ] 圆角仅使用 R1（0）/ R2（4px）/ R4（pill）三种
- [ ] 无大圆角（12-20px）
- [ ] 阴影仅 A 类（环境光）或 B 类（硬投影）
- [ ] 无弥散阴影 / 强玻璃效果

### 1.4 动效

- [ ] 缓动曲线统一 `cubic-bezier(0.16, 1, 0.3, 1)`（品牌曲线）
- [ ] 过渡时长 150-300ms
- [ ] `prefers-reduced-motion` 下 burst / 拖尾 / 视差自动关闭
- [ ] 无扫光（v2.3 已移除）

---

## 2. 设计实现清单（Design Implementation）

> 权威来源：`06-design-spec.md` v1.2 + `03-wireframe.md` v0.5

### 2.1 全局外围

- [ ] 顶栏 `#hud-top` 永驻显示（51px 高 / Navy 800 背景）
- [ ] 顶栏 8 项导航对齐 2D 网站（首页 / UPLP / UNIP / UBMP / PSE / REVER / 教材 / 术语表）
- [ ] 三层指示器 `#hud-rail` 永驻（3 圆点 + 标签）
- [ ] 公式芯片 `#formula-chip` RCT1 可见 / 其他幕隐藏
- [ ] 滚动提示 `#scroll-hint` p>0.05 淡出
- [ ] 移动端顶部 banner 触摸设备自动显示
- [ ] 自定义光标桌面端显示 / 触摸设备关闭

### 2.2 4 幕叙事

- [ ] **RCT1 开场**：INTRE h1（72px Josefin Sans）+ 副文 + 公式芯片 + 400 暗星
- [ ] **RCT2 现象层**：星座浮现 + 漏斗收敛 + 散落棋盘
- [ ] **RCT3 功能层**：6×7=42 节点晶格 + 列/行标签 + 42/42 徽章 + 三通道粒子
- [ ] **RCT4 神经层**：DTI 脑图 + 三通道 legend + 三通道状态灯（永驻）
- [ ] 4 幕文本按节奏淡入淡出（打字机 30ms/字）
- [ ] 平台期 14% 滚动容忍度（RCT3 0.60-0.74）

### 2.3 相机轨迹

- [ ] K0-K5 关键帧位置正确（y 方向 48→-15 下潜 63 单位）
- [ ] 平台期 0.60-0.74 相机保持 K3 (0, 0, 19) 不偏移
- [ ] smoothstep 平滑插值每帧更新

### 2.4 3D 场景

- [ ] 星场 400 颗粒子（Q8 性能优化）
- [ ] 棋盘节点 hover 阻尼 1.65×（D24 修正）
- [ ] 节点点击 → 42 节点详情面板（v2.1 P1.3）
- [ ] 三通道图例 amber 边框胶囊（v2.4 对齐）
- [ ] DTI 脑图居中于相机注视点（y = lookPos[1]）

### 2.5 收尾功能

- [ ] `#replay-btn` 重看按钮（amber 边框胶囊 / smooth scroll 回顶）
- [ ] `.end-link` mailto 反馈邮箱（预填主题+正文）
- [ ] 移动端纵向堆叠（flex-direction: column）/ 触控目标 ≥ 44px

### 2.6 生产模式

- [ ] `?prod=1` 隐藏 status-bar / custom-cursor / feat-tag / trail-canvas / burst-container / scroll-hint / noise-overlay
- [ ] 保留 4 幕叙事、3D 场景、节点详情、导航、legend、出口链接

---

## 3. 性能指标清单（Performance Metrics）

> 权威来源：`01-prd.md §4.4` + `01-prd.md §10.1` 风险表

### 3.1 核心指标（部署后实测）

- [ ] LCP（桌面）< 2.5s
- [ ] LCP（移动）< 4s
- [ ] 桌面端跳出率 < 40%
- [ ] 移动端跳出率 < 60%
- [ ] 4 幕全程滚动占比 > 25%
- [ ] 进入 2D 子页占比 > 15%
- [ ] 桌面端平均停留 ≥ 90s
- [ ] 控制台错误率 < 0.1%

### 3.2 性能优化

- [ ] 粒子数 1800→400（Q8）
- [ ] Three.js 本地加载（无 CDN 依赖）
- [ ] 帧率无关化（dt 时间制 · D27）
- [ ] pace() Fritsch-Carlson 单调三次插值（D26）
- [ ] reduced-motion 模式跳过 burst / 拖尾 / 视差

### 3.3 反指标（避免出现）

- [ ] 弹窗跳出率 0%（学术项目无弹窗）
- [ ] 移动端平均停留 ≥ 30s
- [ ] 无 5 秒自动播放（保持静态等用户主动滚动）

---

## 4. 可访问性清单（Accessibility · WCAG 2.1 AA）

> 权威来源：`01-prd.md §6.1` D10 决策

### 4.1 视觉对比度

- [ ] 文字 vs 背景对比度 ≥ 4.5:1
- [ ] 深色场景弱文字 `--intre-scene-text-muted` Navy 50 @65% ≥ 4.5:1
- [ ] 公式芯片 amber 边框 ≥ 3:1
- [ ] 焦点指示 2px Navy 50 + 2px 偏移

### 4.2 键盘可达

- [ ] 数字键 1-4 切换幕
- [ ] 方向键 ←→ 前进/后退
- [ ] Tab 切换可聚焦元素
- [ ] ESC 关闭节点详情面板
- [ ] Enter / Space 触发按钮

### 4.3 辅助技术

- [ ] 所有可交互元素支持屏幕阅读器（aria-label / aria-expanded / aria-controls）
- [ ] 节点详情面板 `role="img"` + `aria-label`
- [ ] 三层指示器 `role="navigation"` + `aria-label`
- [ ] 公式芯片 / 徽章 / legend 可读

### 4.4 运动偏好

- [ ] `prefers-reduced-motion: reduce` 时 burst 跳过
- [ ] 拖尾粒子自动关闭
- [ ] 鼠标视差自动关闭
- [ ] 自定义光标保持系统光标
- [ ] 幕切换仍正常（仅减少装饰动效）

### 4.5 降级路径

- [ ] WebGL 不可用 → 静态 fallback（`#fallback.is-shown`）
- [ ] 触摸设备 → 移动端 banner 引导桌面浏览器
- [ ] 移动端节点面板 → 全屏覆盖
- [ ] 静态海报定格帧（reduced-motion 用，p=0.86 / 旧 0.62）

---

## 5. 链接系统清单（Link System）

> 权威来源：`10-link-system-plan.md` v1.0

### 5.1 顶部导航（8 项）

- [ ] INTRE 品牌标志 → 2D 首页
- [ ] "首页" → 2D 首页
- [ ] "UPLP" → `/INTRE-website/uplp/`
- [ ] "UNIP" → `/INTRE-website/unip/`
- [ ] "UBMP" → `/INTRE-website/ubmp/`
- [ ] "PSE" → `/INTRE-website/pse/`
- [ ] "REVER" → `/INTRE-website/rever/`
- [ ] "教材" → `/INTRE-website/textbook/`
- [ ] "术语表" → `/INTRE-website/glossary/`

### 5.2 出口链接

- [ ] 公式芯片 `Ψ(t) ∈ ℝ⁴²` → `/glossary/?q=状态向量`
- [ ] 42 徽章 → `/textbook/ch08.html`（第 8 章）
- [ ] RCT4 三通道 legend UPLP → `/uplp/`
- [ ] RCT4 三通道 legend UNIP → `/unip/`
- [ ] RCT4 三通道 legend UBMP → `/ubmp/`
- [ ] 节点详情面板"查看教材" → 教材对应章节（v1.1 精细化，v2.1 暂用 `#` 占位）

### 5.3 链接技术

- [ ] 所有外链 `target="_blank"` + `rel="noopener noreferrer"`
- [ ] 部署后验证同域子目录路径
- [ ] 2D 网站首页含"3D 体验"按钮（v2.1 P2 决策）

---

## 6. 元数据与状态清单（Metadata & State）

> 权威来源：子代理验证报告

### 6.1 子代理验证（`validation-report.json`）

- [ ] `renderBlockingErrorCount: 0`
- [ ] `softWarningCount: ≤ 1`（阴影 alpha 软警告可接受）
- [ ] `qualityGate: passed`

### 6.2 完工度报告（`.tasks/page-3d-hero-completion.json`）

- [ ] `qualityGate: passed`
- [ ] `cssPreflightStatus: passed`
- [ ] `headInfrastructureStatus.themeVars: present`
- [ ] `headInfrastructureStatus.tailwindCdn: present`
- [ ] `renderRisk: none`

### 6.3 视觉结构证据

- [ ] 5 个关键区域使用品牌 token（formula-chip / badge-42 / hud-rail / scroll-hint / tooltip）
- [ ] 4 个区域使用 flex 布局（hud-topbar / hud-rail / act-panels / act4-channel-legend）
- [ ] 无 `hardcodedHighContrastSeparatorUsed`

---

## 7. 验收流程

```
7 阶段验收：
1. 静态文件验证（grep / token check / 文件存在性）     → 30 min
2. 子代理报告复核（validation-report / completion）     → 15 min
3. 浏览器实测（像素采样 / 4 幕滚动 / 节点点击）         → 30 min
4. 性能指标测试（Lighthouse / 控制台错误）              → 20 min
5. 可访问性测试（axe / 键盘 / 对比度）                  → 30 min
6. 链接验证（外链 / 同域路径）                          → 15 min
7. 跨设备测试（桌面 / 移动 / 触摸 / reduced-motion）   → 30 min
                                                 总计：~3h
```

---

## 8. 待办与状态

| # | 验收维度 | 阻塞 | 状态 |
|---|----------|------|------|
| 1 | 品牌合规 | — | ✅ 已修复 bloom 蒙皮（2026-07-24） |
| 2 | 设计实现 | — | ✅ 4 幕叙事 / 收尾功能已落地 |
| 3 | 性能指标 | 待部署 | ⏳ M01 部署后实测 |
| 4 | 可访问性 | 待部署 | ⏳ M04 axe 自动化 |
| 5 | 链接系统 | 待部署 | ⏳ Phase 3 部署后验证 |
| 6 | 元数据状态 | — | ✅ qualityGate passed |
| 7 | 跨设备测试 | 待部署 | ⏳ M03 移动端 QA |

---

## 9. 修订日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-24 | 初版：5 维度验收清单（MECE 编号体系补缺） |

---

*本文档按 MECE 编号体系作为 `08-qa-checklist.md` 补缺创建，与 `00-progress.md` ~ `11-ui-elements-index.md` 共同构成完整的 12 件套文档体系。*
