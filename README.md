---
title: INTRE 官方网站
version: 1.1.0
date: 2026-08-09
status: final
document_type: standard
description: INTRE 项目官方网站源码，基于品牌视觉规范 (06-S-05) 构建的静态站点
revision_notes: v1.1.0 同步 2026-08 WP-13 落地状态（新增 /iods/ 页、UBMP 三→五、nav 10 链接版）；明确 3 项主理人决策进展；指向 15 号工程 E5-C 治理底稿（2026-08-09）
---

# INTRE Website

INTRE 官网静态站点源码。该仓库对应 `project003125/INTRE-website`，线上地址为：

```text
https://project003125.github.io/INTRE-website/
```

## 一、项目性质

本仓库是纯静态站点，当前不依赖构建工具或包管理器。主要文件类型为：

- `*.html`：首页、系统子页面、教材章节与附录页面
- `shared/brand.css`：品牌设计 token，对应 Vault 中 `06-格式治理/06-S-05-INTRE-品牌视觉规范.md`
- `shared/components.css`：导航、页脚、卡片、按钮、表格、徽章等共享组件
- `shared/nav-toggle.js`：移动端导航菜单交互
- `assets/`：Logo、favicon 与触点图标资源

## 二、与 06 规范的关系

本仓库不是 Markdown 文档体系，因此不套用 `06-S-01-INTRE-文档生产标准.md` 的 YAML/frontmatter 规则；但必须遵守以下 06 系列约束：

| 规范 | 对网站的要求 |
|------|--------------|
| `06-S-05-INTRE-品牌视觉规范.md` | 优先使用 Navy、Amber、Slate、大地通道色与既有 Logo / favicon 规则 |
| `06-S-06-INTRE-Agent协作标准.md` | 修改前确认 Git 状态（顶层 `INTRE-vault` 与 `-website` 分属不同仓库）；项目采用混用无界模式，无注册表/专属 Agent 身份，提交遵循手册 §8 Git 工作流与 §9 冲突处理 |
| `06-S-06-INTRE-Agent协作标准.md` | 区分顶层 `INTRE-vault` 与本仓库 `INTRE-website`，网站任务需在 `-website` 内单独查看状态（详见手册 §3.6 本地仓库边界） |

## 三、维护原则

1. 优先复用 `shared/brand.css` 中的设计 token，不新增平行色彩、字体、阴影体系。
2. 页面级样式可以存在，但跨页面复用样式应沉淀到 `shared/components.css`。
3. 避免新增内联 `style`、内联 `onclick` 与不必要的 `!important`。
4. 新增页面必须包含 `<title>`、`meta name="description"`、Open Graph 标题与描述。
5. 导航按钮必须保留 `aria-expanded` 与 `aria-controls`，移动端菜单交互由 `shared/nav-toggle.js` 统一处理。
6. 图片资源必须提供 `alt`；非关键图片建议添加 `loading="lazy"` 与 `decoding="async"`。
7. 修改教材批量页面前，先判断页面是否为生成产物；优先修共享组件，避免手工逐页漂移。

## 四、质量检查清单

提交前建议检查：

```bash
git status --short
```

人工审查重点：

- 是否仍使用品牌 token，而非随意硬编码颜色与阴影
- 是否存在新增内联样式或内联事件处理器
- 移动端导航是否可用，Escape 与点击链接后是否关闭菜单
- 主要页面是否有语义化 `<main>`、清晰标题与 SEO 描述
- 是否误改 `assets/`、生成教材页面或非本任务目标文件

## 五、当前质量基线

截至 2026-08-09，本仓库已完成以下治理：

- 共享品牌 token 集中在 `shared/brand.css`
- 大部分跨页面组件集中在 `shared/components.css`
- 移动端导航交互集中在 `shared/nav-toggle.js`
- 首页与主要子页面具备基础 SEO / Open Graph 元信息
- 导航与主体内容使用语义化结构，并保留跳转到主体内容的可访问性路径

### 5.1 2026-08 WP-13 落地状态（v1.1.0 同步）

| 模块 | 状态 | 备注 |
|------|------|------|
| `/iods/` 新建 | ✅ 已落地 | WP-13 新建页面 |
| `/uplp/` 重写 | ✅ 已落地 | 端口命名变更（UPLS → UPLP） |
| UBMP 三层→五层（B1-B5） | ✅ 已落地 | 详见 `01-M-10 v1.1.0` |
| 首页 IODS 卡 | ✅ 已落地 | 突出 IODS 在两系统中的地位 |
| glossary 补 IODS 词条 | ✅ 已落地 | |
| nav 10 链接版 | ✅ 已落地 | 主导航扩展到 10 链接 |

### 5.2 待主理人决策（WP-13 D1/D2/D3）

| 编号 | 内容 | 状态 |
|------|------|------|
| D1 | 教材命名统一口径（UPLP/UBMP/UNIP vs 旧名 UPLS/UBMS/UNIS） | ⏸ 待签发 |
| D2 | 教材 grep 审定（grep 残留旧命名） | ⏸ 待签发 |
| D3 | GitHub Pages 部署流水线确认 | ⏸ 待签发 |

### 5.3 治理对接

本站的对外呈现治理由 15 号工程（IPDP，`/15-对外传播与发表工程/`）承载，详见：

- E5-C WEBSITE 治理底稿：`/15-对外传播与发表工程/E5-C-WEBSITE治理/WRK-E5C-WEBSITE对外呈现治理-底稿.md`
- 与仓库结构关系：`/06-格式治理/06-S-04-知识库维护协议.md` 附录A §A.3.2（15 号工程与 -website 边界）
