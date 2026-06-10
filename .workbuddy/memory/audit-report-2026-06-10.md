# INTRE 网站品牌规范审查报告

**审查日期**：2026-06-10  
**对照规范**：06-S-05-INTRE-品牌视觉规范.md v2.2.1  
**审查范围**：index.html + 6 子页面 + textbook/ + shared/  
**审查人**：WorkBuddy (Agent-ID: WB)

---

## 一、P0 级 — 严重缺陷（必须立即修复）

### P0-01 全站缺失 Favicon 链接
**问题**：所有页面 `<head>` 中均未引用 `assets/favicon.svg`。  
**影响**：浏览器标签页不显示 INTRE 图标，品牌识别缺失。  
**规范依据**：§2.4 Favicon 定义；§8.1 网站导航栏。  
**涉及文件**：index.html, upls/, unis/, ubms/, pse/, rever/, glossary/, textbook/  
**修复**：所有页面 `<head>` 添加 `<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">`（子页面用 `../assets/favicon.svg`）

### P0-02 index.html 使用未定义 CSS 变量
**问题**：index.html 中多处使用 `var(--blue)`, `var(--navy)`, `var(--blue-light)`，这些变量在 `brand.css` 中**不存在**，浏览器会回退到继承值或初始值。  
**涉及位置**：
- line 643: `border-left-color: var(--blue-light)` — 行为通道卡片
- line 648: `border-left-color: var(--navy)` — 功能层卡片
- line 650: `background: var(--navy)` — 工程核心标签
- line 653: `border-left-color: var(--blue-light)` — 神经层卡片
- line 667: `background:var(--blue-light)` — 行为通道 dot
- line 671: `background:var(--navy)` — 语义通道 dot
- line 675: `background:var(--blue-light)` — 神经通道 dot
- line 689: `color: var(--blue)` — 教材 CTA 图标
**修复**：替换为对应 design token：
- `--blue-light` → `--color-navy-400` 或 `--color-navy-50`
- `--navy` → `--color-navy-600`
- `--blue` → `--color-navy-600`

---

## 二、P1 级 — 主要缺陷（品牌规范违规）

### P1-01 多处 UI 元素使用渐变（违反 §3.5 渐变禁令）
**规范**：§3.5 "所有 UI 和品牌视觉使用纯色填充，不使用渐变"。例外：数据可视化。

| 文件 | 位置 | 违规内容 |
|------|------|----------|
| shared/components.css | line 353-355 | Hero `::before` radial-gradient（装饰性，可保留但需标注为例外） |
| shared/components.css | line 455 | `.page-title::after` linear-gradient |
| shared/components.css | line 555 | `.subpage-info-box` linear-gradient |
| shared/components.css | line 642 | `.subpage-h3::before` linear-gradient |
| index.html | line 37 | `.accent-dot` linear-gradient |
| index.html | line 517 | `::-webkit-scrollbar-thumb` 颜色可接受，但非 token |
| glossary/index.html | line 173 | Page header gradient accent |
| glossary/index.html | line 183 | 分隔线 gradient |
| glossary/index.html | line 199 | h1::after gradient |
| glossary/index.html | line 214 | info-box gradient |

**修复建议**：
- `.page-title::after` / `.subpage-h3::before`：改为纯色 `--color-navy-600`
- `.subpage-info-box` / glossary info-box：改为纯色背景 `--color-navy-50` 或 `--color-slate-100`
- `.accent-dot`：改为纯色圆点 `--color-amber-600`
- glossary 分隔线：改为纯色线 `--color-navy-600`

### P1-02 大量硬编码颜色未使用 Design Token
**规范**：§3 色彩系统要求全部使用 CSS 变量。

| 文件 | 硬编码颜色 | 应替换为 |
|------|-----------|----------|
| index.html:516-518 | `#f1f5f9`, `#cbd5e1`, `#94a3b8` | `--color-slate-100`, `--color-slate-200`, `--color-slate-400` |
| index.html:629 | `#c44545` (REVER 图标) | `--color-rever` `#8B6050` |
| upls/index.html:119 | `#f8fafc` | `--color-slate-100` |
| upls/index.html:199 | `#fff` | `--color-white` |
| upls/index.html:335 | `#2D8A5E` (语义通道徽章) | `--color-upls` `#5A8270` |
| unis/index.html:63 | `#fff` | `--color-white` |
| ubms/index.html:123 | `#f8fafc` | `--color-slate-100` |
| ubms/index.html:204 | `#fff` | `--color-white` |
| ubms/index.html:340 | `#C65D21` (行为通道徽章) | `--color-ubms` `#8B7360` |
| pse/index.html:215 | `#f8fafc` | `--color-slate-100` |
| pse/index.html:234 | `#fff` | `--color-white` |
| pse/index.html:370 | `#6B21A8` (计算引擎徽章) | `--color-pse` `#7B6080` |
| rever/index.html:65,94,115 | `#e2e8f0` | `--color-slate-200` |
| rever/index.html:125,242 | `#f8fafc` | `--color-slate-100` |
| rever/index.html:234 | `#334155` | `--color-slate-700` |
| rever/index.html:270 | `#fff` | `--color-white` |
| rever/index.html:406 | `#B45309` (伦理约束徽章) | `--color-rever` `#8B6050` |
| rever/index.html:409 | `#c44545` | `--color-rever` |
| glossary/index.html:173 | `#ffffff` | `--color-white` |
| textbook/index.html:41-43 | `#f1f5f9`, `#cbd5e1`, `#94a3b8` | 对应 token |

### P1-03 版本号不一致
**规范**：品牌规范当前版本为 v2.2.1。

| 文件 | 当前版本 | 应为 |
|------|---------|------|
| index.html | v2.1 | v2.2.1 |
| glossary/index.html | v2.1 | v2.2.1 |
| upls/index.html | v2.2 | v2.2.1 |
| unis/index.html | v2.2 | v2.2.1 |
| ubms/index.html | v2.2 | v2.2.1 |
| pse/index.html | v2.2 | v2.2.1 |
| rever/index.html | v2.2 | v2.2.1 |
| textbook/index.html | v2.2 | v2.2.1 |

### P1-04 textbook.css 未完全使用 brand.css Token
**问题**：`textbook.css` 自行定义了 `--font` 而非使用 `var(--font-body)`，且硬编码 `#ffffff`。  
**位置**：textbook.css line 12-25  
**修复**：导入 `brand.css` 和 `components.css`，删除重复定义，使用 token。

### P1-05 圆角使用不规范
**规范**：§5.3 圆角体系 — Pill-shape 为 999px。

| 文件 | 位置 | 问题 |
|------|------|------|
| index.html:650 | `border-radius:20px` | 应为 `var(--radius-pill)` (999px) |
| upls/index.html:335 | `border-radius:20px` | 同上 |
| ubms/index.html:340 | `border-radius:20px` | 同上 |
| pse/index.html:370 | `border-radius:20px` | 同上 |
| rever/index.html:406 | `border-radius:20px` | 同上 |

---

## 三、P2 级 — 次要缺陷（建议优化）

### P2-01 nav-logo 使用文本而非 SVG 字标
**规范**：§2.2/§2.3 要求使用 logo.svg / logo-dark.svg；§8.1 "Logo（深色版）置于左侧"。  
**现状**：所有页面 nav-logo 为纯文本 `<a class="nav-logo">INTRE</a>`。  
**说明**：当前文本使用了 Josefin Sans + 600 字重 + -0.02em 字距，视觉上接近字标规范。但 SVG 版本在响应式降级（<140px）时可自动降级为 favicon，文本无法实现此行为。  
**建议**：将 nav-logo 改为 `<img src="assets/logo-dark.svg" alt="INTRE">`，并保留文本作为 `alt` 回退。

### P2-02 滚动条样式冗余定义
**问题**：`shared/components.css` line 667-688 已定义全局滚动条样式，但 index.html、upls、unis、ubms、pse、rever、glossary、textbook/index.html 均重复定义了相同的滚动条 CSS。  
**修复**：删除各页面内联的 `::-webkit-scrollbar` 样式，统一由 `components.css` 控制。

### P2-03 选中文字颜色冗余定义
**问题**：`shared/components.css` line 685-688 已定义 `::selection`，但 index.html line 519 也重复定义。  
**修复**：删除 index.html 中的重复定义。

### P2-04 glossary 页面大量渐变
**问题**：glossary/index.html 有 4 处渐变装饰，虽然视觉效果不错，但与品牌规范 §3.5 冲突。如保留需作为"设计例外"在规范中备案。

---

## 四、合规项（做得正确的地方）

1. **Google Fonts 加载正确**：所有页面均加载 Josefin Sans + Inter + Noto Sans SC + JetBrains Mono ✅
2. **共享 CSS 导入正确**：index.html 和子页面均导入 brand.css + components.css ✅
3. **nav 结构一致**：所有页面使用相同的 nav-container + nav-logo + nav-links 结构 ✅
4. **footer 结构一致**：所有页面使用相同的 footer-brand + footer-links + footer-meta 结构 ✅
5. **术语统一**："功能层心理学 (FLP)" 已全站统一 ✅
6. **通道色 token 定义正确**：brand.css 中 5 个通道色定义准确 ✅
7. **字体边界遵守**：Josefin Sans 仅用于 Logo 和 H1，正文使用 Inter/Noto Sans SC ✅
8. **中文排版**：h1[lang|="zh"] 字距为 0，符合 §4.1 ✅

---

## 五、修复优先级建议

**立即修复（今日）**：P0-01（favicon）、P0-02（未定义变量）、P1-02（硬编码颜色）、P1-03（版本号）  
**本周修复**：P1-01（渐变替换）、P1-04（textbook.css token 化）、P1-05（圆角规范）  
**后续优化**：P2-01（logo SVG）、P2-02（滚动条去重）
