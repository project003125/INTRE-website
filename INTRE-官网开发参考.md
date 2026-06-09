# INTRE 官网开发参考文档

> 保存日期：2026-06-09
> 用途：后续建站参考
> 仓库：https://github.com/project003125/INTRE（公开）
> 网站：https://project003125.github.io/INTRE/

---

## 一、项目概述

INTRE 官方网站，托管于 GitHub Pages，以清晰、专业的方式呈现 INTRE 框架的四个核心模块——**UPLS**、**PSE**、**REVER**、**MOAT**，并作为项目思想遗产的官方入口。

---

## 二、技术栈

- **前端**：纯 HTML5 + CSS3（无框架）
- **字体**：Google Fonts Inter
- **图标**：Font Awesome 6（免费版）
- **部署**：GitHub Pages（自动从 main 分支部署）
- **版本控制**：Git + GitHub

---

## 三、目录结构

```
INTRE/                        # 对应 GitHub 仓库 project003125/INTRE
├── index.html                # 首页
├── upls/
│   └── index.html            # UPLS 页面
├── pse/
│   └── index.html            # PSE 页面
├── rever/
│   └── index.html            # REVER 页面
├── moat/
│   └── index.html            # MOAT 页面（当前为占位）
├── assets/
│   └── images/               # 存放图片资源
└── README.md                 # 项目说明
```

> 所有页面均使用**内联样式**（`<style>` 块），未单独提取 CSS 文件。

---

## 四、页面状态

| 页面 | 路径 | 核心内容 | 状态 |
|------|------|---------|:----:|
| 首页 | `/` | 项目标语、三层架构图、四个核心模块卡片、页脚 | ✅ |
| UPLS | `/upls/` | M-R-D-S 语法、G-M-A-R 操作、PCUI/PSA/PSL、跨流派整合表格 | ✅ |
| PSE | `/pse/` | 五层架构、心智六论、PSE-M/PSE-C 仿真流程、王梅案例 | ✅ |
| REVER | `/rever/` | 四层架构、依赖雷达、伦理门控、透明性机制 | ✅ |
| MOAT | `/moat/` | 占位页面 | ⏳ |

---

## 五、样式规范

| 规则 | 值 |
|------|-----|
| 主色调 | 深蓝 `#163A5F` |
| 辅蓝 | `#2b6390` |
| 背景色 | 浅灰蓝 `#f4f7fc` |
| 卡片样式 | 白色背景，圆角 `1.2rem`，浅灰边框，悬停阴影 |
| H1 标题 | `2.8rem`，`#163A5F` |
| 章节标题 | `1.8rem`，加图标前缀 |
| 表格 | 表头深蓝背景，`.table` 类 |
| 代码块 | 深色背景，等宽字体，`.code-block` 类 |
| 响应式 | 已内置移动端适配（`@media` 查询） |

---

## 六、后续开发任务

**优先级高：**
- [ ] **添加术语表页面**：`/glossary/`
- [ ] **添加论文引用**：首页或模块页面底部增加 Zenodo DOI 链接
- [ ] **统一页脚链接**：确保所有页面 GitHub/DOI 链接正确
- [ ] **增加图表可视化**：SVG 绘制五层架构图、依赖雷达等
- [ ] **案例页面**：`/demo/wangmei/`

**优先级中：**
- [ ] 更新 UPLS/PSE 页面内容以反映 PSE v2.0 / UPLS v1.2 新版本信息
- [ ] 添加三通道融合架构说明
- [ ] 在 PSE 页面增加对 UNIS 的引用

---

## 七、部署方式

```bash
git add .
git commit -m "更新说明"
git push origin main
```

GitHub 自动构建（1-2 分钟生效）。

---

## 八、注意事项

- 修改应遵循现有类名和结构，不破坏响应式布局
- 导航栏在每个页面中硬编码，统一修改需手动编辑所有页面
- 提交前建议在本地预览效果
