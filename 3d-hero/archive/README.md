# INTRE 3D Hero — 归档目录（Archive）

> **目录作用**：存放项目演进过程中被替换、废弃或仅作为历史快照的文件。所有归档文件**不再被主项目引用**，仅供查阅与追溯。
> **最后更新**：2026-07-24
> **维护原则**：归档 ≠ 删除。每个归档文件保留原内容 + 归档元数据 + 关联决策记录。

---

## 1. 目录结构

```
archive/
└── YYYY-MM-DD/                     ← 归档日期（按操作日期分组）
    ├── bloom-disabled/             ← 主题：bloom 禁用（D32 废弃）
    ├── design-binary/              ← 主题：二进制设计稿（不可读，保留以备引用）
    ├── preflight/                  ← 主题：CSS preflight 备份副本
    └── reports/                    ← 主题：一次性审查/审查报告
```

> **命名约定**：`YYYY-MM-DD/` 为操作日期，主题子目录为归档原因分类。每个主题子目录内文件保留原名 + 必要时加版本后缀。

---

## 2. 2026-07-24 归档清单

### 2.1 bloom-disabled/（D32 bloom 后处理废弃 · 8 文件）

> **归档原因**：2026-07-24 系统审查发现 `UnrealBloomPass` 后处理管线将星核辉光扩散至全帧，导致 Navy 950 底色（RGB 10,30,61）被抬升至 RGB(56,96,134)，形成"白色蒙皮"。品牌规范 §3.5 规定纯色填充、D09 禁止渐变效果，bloom 的全帧辉光叠加与品牌克制气质冲突。已禁用 composer 管线，代码注释保留以便未来恢复。
> **关联决策**：[01-prd.md](../docs/01-prd.md) D32（待修订为 D39 决策记录）· [05-tech-impl-spec.md](../docs/05-tech-impl-spec.md) Phase 1
> **保留理由**：bloom 代码未删除（commented-out），归档作为"完整状态"快照；若未来找到不影响底色的 bloom 方案（如 selective bloom），可从归档恢复。
> **被替代位置**：`pages/3d-hero.html` 第 1175-1188 行（composer 创建块已注释）

| 文件 | 原始路径 | 用途 |
|------|----------|------|
| `EffectComposer.js` | `lib/postprocessing/EffectComposer.js` | 后期合成管线 |
| `RenderPass.js` | `lib/postprocessing/RenderPass.js` | 渲染通道 |
| `MaskPass.js` | `lib/postprocessing/MaskPass.js` | 遮罩通道 |
| `Pass.js` | `lib/postprocessing/Pass.js` | 通道基类 |
| `ShaderPass.js` | `lib/postprocessing/ShaderPass.js` | Shader 通道 |
| `UnrealBloomPass.js` | `lib/postprocessing/UnrealBloomPass.js` | 辉光通道（白色蒙皮根因） |
| `CopyShader.js` | `lib/shaders/CopyShader.js` | 复制 Shader |
| `LuminosityHighPassShader.js` | `lib/shaders/LuminosityHighPassShader.js` | 亮度阈值 Shader |

### 2.2 reports/（本轮审查报告 · 1 文件）

> **归档原因**：`intre-3d-hero-system-review.html` 是 2026-07-24 本轮系统性审查的最终交付物，包含白色蒙皮根因分析、修复清单、像素验证数据。审查已完成、修复已落地、报告已交付给用户。后续工作通过 `00-progress.md` 修订日志追溯。
> **关联文档**：[00-progress.md](../docs/00-progress.md) 修订日志
> **保留理由**：作为本轮工作的"决策快照"，供未来审计与回溯。

| 文件 | 原始路径 | 用途 |
|------|----------|------|
| `intre-3d-hero-system-review-v1.0.html` | `intre-3d-hero-system-review.html` | 系统审查报告 v1.0 |

### 2.3 preflight/（CSS 预检备份 · 1 文件）

> **归档原因**：`.preflight/preflight.html` 是子代理在写入 `3d-hero.html` 前的 CSS preflight 备份。CSS preflight 状态已通过，备份已完成其使命。
> **关联元数据**：`.tasks/page-3d-hero-completion.json` `cssPreflightStatus: passed`
> **保留理由**：作为"通过 preflight 时的 CSS 状态"快照，供未来回溯。

| 文件 | 原始路径 | 用途 |
|------|----------|------|
| `preflight-2026-07-23.html` | `.preflight/preflight.html` | CSS preflight 备份（2026-07-22 23:43） |

### 2.4 design-binary/（二进制设计稿 · 1 文件）

> **归档原因**：`intre-3d-hero.design` 是 2026-07-23 设计的二进制文件，文本不可读。其内容已通过 `docs/06-design-spec.md`（文本版设计图稿）+ `docs/03-wireframe.md`（线框稿）完整覆盖。二进制文件本身无版本控制价值。
> **关联文档**：[06-design-spec.md](../docs/06-design-spec.md) 文本版设计图稿 + [03-wireframe.md](../docs/03-wireframe.md) 线框稿
> **保留理由**：以防用户需要原始设计文件作为"创作轨迹"留档。

| 文件 | 原始路径 | 用途 |
|------|----------|------|
| `intre-3d-hero.design` | `intre-3d-hero.design` | 二进制设计稿（2026-07-23 20:46） |

---

## 3. 归档策略

### 3.1 何时归档

| 触发场景 | 归档原因 | 命名规范 |
|----------|----------|----------|
| 一次性报告/审查已完成 | 报告使命完成 | `reports/<name>-v<version>.html` |
| 第三方库 / 工具被替代 | 主项目不再使用但可能复用 | `<theme>/<原文件名>` |
| 临时副本 / 调试文件 | 已完成其使命 | `<theme>/<原文件名>` |
| 二进制设计稿 | 文本版已覆盖 | `design-binary/<原文件名>` |
| 早期版本快照 | 主版本已升级 | `versions/v<旧版本>/<原文件>` |

### 3.2 何时不归档（直接删除）

| 触发场景 | 原因 |
|----------|------|
| 临时调试代码 | 仅为过程产物，无追溯价值 |
| 重复文件 | 已有唯一权威版本 |
| 损坏文件 | 不可恢复 |

### 3.3 归档元数据（每个文件必填）

```
文件级元数据（README 中表格）：
- 文件名 / 原始路径 / 用途
- 归档原因（含决策编号）
- 关联文档 / 决策
- 保留理由
```

---

## 4. 不归档保留清单

下列文件**保留在主项目**（不在 `archive/`）：

| 文件 | 保留原因 |
|------|----------|
| `pages/3d-hero.html` | 核心实现，不可归档 |
| `lib/three.module.js` | Three.js r160 核心库 |
| `lib/node-details.js` | 42 节点数据 |
| `colors_and_type.css` | 设计 token |
| `assets/dti-reference.png` | 待 v2.5 升级为 3D 脑模型 |
| `docs/00-11` 12 件套 | 权威规范与件套 |
| `.tasks/page-3d-hero-completion.json` | 元数据状态（子代理报告） |
| `orchestration-summary.json` | 元数据状态（子代理报告） |
| `validation-report.json` | 元数据状态（子代理报告） |
| `intre-3d-hero-overview.md` | 子项目系统介绍（持续维护） |

---

## 5. 修订日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-07-24 | 初版：建立 `archive/` 目录结构，4 主题分类，2026-07-24 归档 11 文件 |

---

*本目录遵循 INTRE 06-格式治理 06-S-04 知识库维护协议。归档文件**不修改**，仅追加元数据。如需恢复，请从归档目录 `Copy-Item` 回主项目并通过 PDR 决策记录。*
