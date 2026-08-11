#!/usr/bin/env python3
"""
-website/ 元数据批量注入工具（INTRE v2.10.0 §五 ★ 5 延展配套）

目的：
  1. 给所有未含 JSON-LD 的 index.html 自动注入 Schema.org/Article 块
  2. 修复已知 bug（textbook/index.html 缺 og:url）
  3. 幂等可重跑（检测 `<script type="application/ld+json">` 已存在则跳过）

用法：
  python _inject_meta.py [--dry-run]

设计原则（与 00-M-00 v2.9.0 JSON-LD 单一权威源对齐）：
  - 8 工程 alternateName 由 06-S-01 §14.4 代号表驱动（不在脚本中重复）
  - 每页的 headline/description 从该页的 og:title/og:description 提取（保证 og:meta 与 jsonld 一致）
  - publisher 固定为 INTRE Organization（与主页 JSON-LD 一致）
"""
import argparse
import re
import sys
from pathlib import Path

# PowerShell 默认 GBK 编码会导致 UnicodeEncodeError
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

ROOT = Path(__file__).parent
PAGES = ["index", "iods", "uplp", "unip", "ubmp", "pse", "rever", "glossary", "textbook"]

# 出版社固定元数据（与主页 JSON-LD publisher 一致）
PUBLISHER = {
    "@type": "Organization",
    "name": "INTRE",
    "url": "https://project003125.github.io/INTRE-website/",
}

META_TITLE_RE = re.compile(r'<meta\s+property="og:title"\s+content="([^"]+)"\s*/?>')
META_DESC_RE = re.compile(r'<meta\s+property="og:description"\s+content="([^"]+)"\s*/?>')
META_URL_RE = re.compile(r'<meta\s+property="og:url"\s+content="([^"]+)"\s*/?>')
JSONLD_RE = re.compile(r'<script\s+type="application/ld\+json">')
HEAD_END_RE = re.compile(r'</head>')


def build_jsonld(title: str, description: str, url: str) -> str:
    return (
        '<script type="application/ld+json">\n'
        '{\n'
        '  "@context": "https://schema.org",\n'
        '  "@type": "Article",\n'
        f'  "headline": "{title}",\n'
        f'  "description": "{description}",\n'
        f'  "url": "{url}",\n'
        f'  "publisher": {repr(PUBLISHER)}\n'
        '}\n'
        '</script>\n'
    )


def inject_jsonld(html: str, dry: bool = False) -> tuple[str, bool]:
    """如果页面无 JSON-LD，从 og: meta 提取并注入。返回 (new_html, modified)。"""
    if JSONLD_RE.search(html):
        return html, False  # 已含 JSON-LD，跳过

    m_title = META_TITLE_RE.search(html)
    m_desc = META_DESC_RE.search(html)
    m_url = META_URL_RE.search(html)
    if not (m_title and m_desc and m_url):
        return html, False  # 缺 og: meta，无法注入

    title = m_title.group(1).replace('"', '\\"')
    desc = m_desc.group(1).replace('"', '\\"')
    url = m_url.group(1)
    jsonld_block = build_jsonld(title, desc, url)

    # 在 </head> 前注入
    new_html, n = HEAD_END_RE.subn(jsonld_block + '</head>', html, count=1)
    if n == 0:
        return html, False

    if dry:
        return html, True  # dry 模式：报告但不写
    return new_html, True


def fix_textbook_og_url(html: str, dry: bool = False) -> tuple[str, bool]:
    """textbook/index.html 缺 og:url 修复：在 og:image 前插入 og:url。"""
    if META_URL_RE.search(html):
        return html, False
    # 推断 textbook 的 url
    url_line = '    <meta property="og:url" content="https://project003125.github.io/INTRE-website/textbook/">\n'
    new_html, n = re.subn(
        r'(\s*<meta property="og:image")',
        '\n' + url_line.rstrip() + r'\1',
        html,
        count=1,
    )
    if n == 0:
        return html, False
    if dry:
        return html, True
    return new_html, True


def main():
    parser = argparse.ArgumentParser(description="-website/ 元数据注入工具")
    parser.add_argument("--dry-run", action="store_true", help="只报告，不写文件")
    args = parser.parse_args()

    modified = []
    skipped = []
    for page in PAGES:
        html_path = ROOT / page / "index.html"
        if not html_path.exists():
            continue
        html = html_path.read_text(encoding="utf-8")
        orig = html

        if page == "textbook":
            html, ok1 = fix_textbook_og_url(html, dry=args.dry_run)
        else:
            ok1 = False
        html, ok2 = inject_jsonld(html, dry=args.dry_run)
        if ok1 or ok2:
            if not args.dry_run:
                html_path.write_text(html, encoding="utf-8")
            modified.append(str(html_path))
        else:
            skipped.append(str(html_path))

    mode = "[DRY-RUN] " if args.dry_run else ""
    print(f"{mode}扫描 {len(PAGES)} 个 index.html:")
    for p in modified:
        print(f"  ✓ 修改: {Path(p).relative_to(ROOT)}")
    for p in skipped:
        print(f"  - 跳过: {Path(p).relative_to(ROOT)}")
    print(f"\n共 {len(modified)} 个待修改，{len(skipped)} 个跳过")


if __name__ == "__main__":
    main()
