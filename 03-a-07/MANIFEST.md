# 03-A-07 多媒体专题 · 发布清单（MANIFEST）

> 口径：SHA-256 前 16 hex，切片＝整文件字节。建立 2026-11-22。
> 属主：15-IPDP / E5-C-WEBSITE 治理。源件权威位＝03-现象层对接（PHENO）。

## 一、资产对照

| 站点文件 | 源文件 | 版本 | 发布字节 | SHA-256 前 16 | 外部依赖 |
|---|---|---|---|---|---|
| animation.html | 03-A-07-走出洞穴-SVG动画-v2.2.0-2026-11-22.html | v2.2.0 | 7,422,574 | dfc948982e5e0c1d | 无 |
| lecture.html | 03-A-07-走出洞穴-双范式对照讲解-v2.3.0-2026-11-22.html | v2.3.0 | 105,899 | 14f948208d73f338 | 无 |
| script.html | 03-A-07-走出洞穴-脚本与结构图-v2.2.0-2026-11-22.html | v2.2.0 | 87,254 | 285377e3b50830ce | 无 |
| read.html | 03-A-07-走出洞穴-全文阅读版-v3.1.0-2026-11-22.html | v3.1.0 | 118,882 | 660b5903a41b9000 | 飞书字体 CDN（有本地回退栈） |

发布件在源件基础上注入了 description／OG／canonical／JSON-LD、返回条与 `intre-version`，故字节与源件不同。

## 二、体积与警戒

- animation.html 7,422,574 B。8 MB 为性能警戒线，越线即触发可选优化（外置资源或转 WebP/MP4）。
- GitHub Pages 限制：站点上限 1 GB；源仓建议 1 GB；部署超时 10 分钟。无 10 MB 单文件硬限。

## 三、同步更新

03 号源件或派生 HTML 版本变更时：重拷源件 → 刷本清单的版本／SHA-256 前 16／字节／日期 → 刷各页 `<meta name="intre-version">` → 刷 sitemap lastmod → 单文件 commit。属主 E5-C 窗。

## 四、回滚记录

- 上线前 HEAD（回滚基线）：df73976
- 上线 commit：见 03-PHENO 批次表 B261122 执行行
- 回滚动作：revert 专题 commit 后 push；同一次 revert 恢复首页 CTA、defense 旧链与 sitemap 未增前状态。禁止 reset 覆盖他窗在途件。
