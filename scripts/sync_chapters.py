#!/usr/bin/env python3
"""
INTRE 教材同步脚本 — Vault Markdown → Website HTML

将 08-导论教材/ 中的 Markdown 章节转换为 textbook/ 中的 HTML 页面。
逐字符比较生成的 HTML 与现有文件，仅在实际内容变更时重写 HTML。

路径默认基于脚本位置推导，换机器可用参数覆盖：
  python scripts/sync_chapters.py                       # 用默认路径
  python scripts/sync_chapters.py --vault-dir /path/to/md --textbook-dir /path/to/html
"""

import os
import re
import sys
import html as html_mod
from pathlib import Path
from datetime import datetime

# --- 路径配置（基于脚本位置推导，可用命令行参数覆盖） ---
# 脚本位于 <website>/scripts/，故：
#   <website>     = scripts 的父目录
#   <textbook>    = <website>/textbook/
#   <vault 教材>  = <website>/../08-导论教材/
SCRIPT_DIR = Path(__file__).resolve().parent
WEBSITE_DIR = SCRIPT_DIR.parent
TEXTBOOK_DIR = WEBSITE_DIR / "textbook"
VAULT_DIR = WEBSITE_DIR.parent / "08-导论教材"

# --- 工具函数 ---

# MM_G1_CARD 已撤（2026-10-31 对外呈现面减负批）：〔MM·G1〕独立码引不再渲染，见下方 continue 分支

def parse_frontmatter(text):
    """解析简单的 YAML frontmatter (key: value 格式，无嵌套)。返回 (meta, body)。"""
    meta = {}
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1].strip()
            body = parts[2].strip()
            for line in fm_text.split("\n"):
                line = line.strip()
                if ":" in line:
                    key, _, value = line.partition(":")
                    meta[key.strip()] = value.strip()
    return meta, body


def extract_chapter_id(filename):
    """从文件名提取章节 ID，如 'ch01', 'app-a'。"""
    name = Path(filename).stem
    m = re.match(r"第(\d+)章", name)
    if m:
        return f"ch{int(m.group(1)):02d}"
    m = re.match(r"附录([A-Z])", name)
    if m:
        return f"app-{m.group(1).lower()}"
    return None


def extract_chapter_number(chapter_id):
    """从 ID 提取数字用于排序。ch01→1, ch29→29, app-a→101, app-n→114。"""
    if chapter_id.startswith("ch"):
        return int(chapter_id[2:])
    if chapter_id.startswith("app-"):
        return 100 + (ord(chapter_id[4]) - ord("a") + 1)
    return 999


def get_chapter_label(chapter_id):
    """获取页面标签：'第1章' 或 '附录A'。"""
    if chapter_id.startswith("ch"):
        n = int(chapter_id[2:])
        return f"第{n}章"
    if chapter_id.startswith("app-"):
        letter = chapter_id[4].upper()
        return f"附录{letter}"
    return ""


def get_short_title(full_title):
    """从完整标题提取短标题用于导航链接。"""
    # 移除章节编号前缀
    t = re.sub(r"^第\d+章\s*", "", full_title)
    t = re.sub(r"^附录[A-Z][：:]?\s*", "", t)
    # 取第一个分隔符前的内容
    for sep in ["：", "——", "——", ":", "—"]:
        if sep in t:
            t = t.split(sep)[0].strip()
            break
    # 限制长度
    if len(t) > 8:
        t = t[:8] + "…"
    return t


def get_description(body):
    """从正文提取描述（学习目标后的第一段正文，截断至 155 字符）。"""
    # 移除 blockquote 内容
    cleaned = re.sub(r"^>.*$", "", body, flags=re.MULTILINE)
    # 移除标题行和分隔线
    cleaned = re.sub(r"^#{1,4}\s.*$", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^---\s*$", "", cleaned, flags=re.MULTILINE)
    # 找到第一个非空段落
    for line in cleaned.split("\n"):
        line = line.strip()
        if line and not line.startswith(">") and not line.startswith("#"):
            # 清理 markdown 标记
            line = re.sub(r"\*\*(.+?)\*\*", r"\1", line)
            line = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line)
            line = re.sub(r"\[\^?\d+\]", "", line)
            line = re.sub(r"\s+", " ", line)
            if len(line) > 30:
                if len(line) > 155:
                    # 在 150-155 字符范围内找最后一个句号或空格截断
                    cut = line[:155].rfind("。")
                    if cut > 100:
                        return line[: cut + 1]
                    cut = line[:155].rfind("，")
                    if cut > 100:
                        return line[:cut] + "……"
                    return line[:150] + "……"
                return line
            return line
    return ""


# --- Markdown → HTML 转换 ---

def strip_version_record(body):
    """从正文中剥离 ## 版本记录 及其之后的所有内容。"""
    # 找到 ## 版本记录 的位置
    idx = body.find("\n## 版本记录")
    if idx == -1:
        idx = body.find("\n## 版本记录")
    if idx == -1:
        return body
    body = body[:idx].rstrip()
    # 移除尾部的 --- 分隔线
    while body.endswith("\n---") or body.endswith("\r\n---"):
        body = body[: body.rfind("\n")].rstrip()
    return body


def convert_markdown_body(body):
    """
    将 Markdown 正文转换为 INTRE 教材 HTML 正文片段。
    处理：标题、段落、粗体、斜体、行内代码、代码块、表格、列表、脚注、
    分隔线、引用块、LaTeX 数学公式。
    """
    # 剥离版本记录章节（由 build_version_record 统一处理）
    body = strip_version_record(body)

    lines = body.split("\n")
    output = []
    i = 0

    # 收集脚注定义
    footnote_defs = {}
    fn_pattern = re.compile(r"^\[\^(\d+)\]:\s*(.*)$")

    # 第一遍：收集脚注定义
    for j, line in enumerate(lines):
        m = fn_pattern.match(line.strip())
        if m:
            footnote_defs[int(m.group(1))] = m.group(2)

    in_code_block = False
    code_block_lang = ""
    code_block_lines = []
    in_table = False
    table_lines = []
    in_list = False
    list_type = None  # 'ul' or 'ol'
    list_lines = []
    in_math_block = False
    math_block_lines = []

    def flush_table():
        nonlocal in_table, table_lines
        if not table_lines:
            return ""
        html_table = markdown_table_to_html(table_lines)
        table_lines = []
        in_table = False
        return f'<div class="table-wrap">\n{html_table}\n</div>'

    def flush_list():
        nonlocal in_list, list_type, list_lines
        if not list_lines:
            return ""
        tag = list_type
        result = f"<{tag}>\n"
        for item in list_lines:
            result += f"<li>{convert_inline(item)}</li>\n"
        result += f"</{tag}>"
        list_lines = []
        in_list = False
        list_type = None
        return result

    def flush_code_block():
        nonlocal in_code_block, code_block_lang, code_block_lines
        if not code_block_lines:
            return ""
        code = "\n".join(code_block_lines)
        code_escaped = html_mod.escape(code)
        if code_block_lang:
            result = f'<pre><code class="language-{code_block_lang}">{code_escaped}</code></pre>'
        else:
            result = f"<pre><code>{code_escaped}</code></pre>"
        code_block_lines = []
        code_block_lang = ""
        in_code_block = False
        return result

    def convert_inline(text):
        """转换行内标记：粗体、斜体、行内代码、脚注引用、LaTeX。"""
        # 行内代码（保护 LaTeX 中的反引号）
        text = re.sub(r"(?<!\$)`([^`]+?)`(?!\$)", r"<code>\1</code>", text)
        # 粗体 + 斜体
        text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<strong><em>\1</em></strong>", text)
        # 粗体
        text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
        # 斜体
        text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", text)
        # 脚注引用 [^1]
        text = re.sub(
            r"\[\^(\d+)\](?!\])",
            r'<sup><a href="#fn\1-2" id="fnref\1">[\1]</a></sup>',
            text,
        )
        # 上标引用（已处理过的）
        return text

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # 数学块 $$...$$
        if stripped == "$$" and not in_math_block:
            in_math_block = True
            math_block_lines = [stripped]
            i += 1
            continue
        if in_math_block:
            math_block_lines.append(line)
            if stripped == "$$":
                output.append("\n".join(math_block_lines))
                math_block_lines = []
                in_math_block = False
            i += 1
            continue

        # 代码块
        if stripped.startswith("```"):
            if in_code_block:
                output.append(flush_code_block())
                i += 1
                continue
            else:
                # 刷新之前的列表/表格
                if in_list:
                    output.append(flush_list())
                if in_table:
                    output.append(flush_table())
                in_code_block = True
                code_block_lang = stripped[3:].strip()
                i += 1
                continue
        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue

        # 空行：刷新表格或列表
        if stripped == "":
            if in_table:
                output.append(flush_table())
            if in_list:
                output.append(flush_list())
            output.append("")
            i += 1
            continue

        # 分隔线 ---
        if stripped == "---":
            if in_table:
                output.append(flush_table())
            if in_list:
                output.append(flush_list())
            output.append('<hr class="section-divider">')
            i += 1
            continue

        # 脚注定义：跳过（已在第一遍收集）
        if fn_pattern.match(stripped):
            i += 1
            continue

        # 表格检测
        if "|" in stripped and stripped.startswith("|"):
            if in_list:
                output.append(flush_list())
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(stripped)
            i += 1
            continue
        else:
            if in_table:
                output.append(flush_table())

        # 列表项
        ul_match = re.match(r"^(\s*)[-*]\s+(.*)", stripped)
        ol_match = re.match(r"^(\s*)(\d+)\.\s+(.*)", stripped)
        if ul_match:
            if in_table:
                output.append(flush_table())
            if not in_list or list_type != "ul":
                if in_list:
                    output.append(flush_list())
                in_list = True
                list_type = "ul"
            list_lines.append(ul_match.group(2))
            i += 1
            continue
        if ol_match:
            if in_table:
                output.append(flush_table())
            if not in_list or list_type != "ol":
                if in_list:
                    output.append(flush_list())
                in_list = True
                list_type = "ol"
            list_lines.append(ol_match.group(3))
            i += 1
            continue
        else:
            if in_list:
                output.append(flush_list())

        # 标题
        h_match = re.match(r"^(#{1,4})\s+(.*)", stripped)
        if h_match:
            level = len(h_match.group(1))
            # 跳过 # 标题（页面模板中已有 h1）
            if level == 1:
                i += 1
                continue
            title_text = convert_inline(h_match.group(2))
            # ##→h2, ###→h2, ####→h3
            html_level = max(2, level - 1)
            output.append(f"<h{html_level}>{title_text}</h{html_level}>")
            i += 1
            continue

        # 引用块
        if stripped.startswith(">"):
            quote_content = stripped[1:].strip()
            quote_content = convert_inline(quote_content)
            # 合并连续的引用块
            quote_lines = [quote_content]
            j = i + 1
            while j < len(lines) and lines[j].strip().startswith(">"):
                q = lines[j].strip()[1:].strip()
                quote_lines.append(convert_inline(q))
                j += 1
            i = j
            quote_html = "<br>".join(quote_lines) if len(quote_lines) > 1 else quote_lines[0]
            if quote_html.strip() == "〔MM·G1〕":
                i += 0  # 对外呈现面减负（主理 2026-10-31 会话令）：独立码引〔MM·G1〕不渲染为代际注卡，源件码引保留；权威链＝00-M-05 §三／06-S-02 §二十一
                continue   # 跳过整卡输出（原渲染规则已撤·防回退点）
            output.append(f"<blockquote><p>{quote_html}</p></blockquote>")
            continue

        # 普通段落
        para = convert_inline(stripped)
        output.append(f"<p>{para}</p>")
        i += 1

    # 刷新残留状态
    if in_table:
        output.append(flush_table())
    if in_list:
        output.append(flush_list())
    if in_code_block:
        output.append(flush_code_block())

    # 添加脚注定义
    if footnote_defs:
        for num in sorted(footnote_defs.keys()):
            fn_text = convert_inline(footnote_defs[num])
            output.append(
                f'<p id="fn{num}-2"><sup><a href="#fnref{num}">[{num}]</a></sup>: {fn_text}</p>'
            )

    return "\n".join(output)


def markdown_table_to_html(lines):
    """将 Markdown 表格行转换为 HTML <table>。"""
    if len(lines) < 2:
        return ""

    def parse_row(row):
        # 去掉首尾的 |
        row = row.strip().strip("|")
        return [cell.strip() for cell in row.split("|")]

    is_separator = lambda row: re.match(r"^[\s\|:\-]+$", row.strip())

    # 找到分隔行
    header_end = 0
    for idx, line in enumerate(lines):
        if is_separator(line):
            header_end = idx
            break

    if header_end == 0:
        header_end = 1

    header_rows = lines[:header_end]
    body_rows = lines[header_end + 1 :] if header_end < len(lines) else []

    html = "<table>\n"
    if header_rows:
        html += "<thead><tr>\n"
        for cell in parse_row(header_rows[0]):
            html += f"<th>{cell}</th>\n"
        html += "</tr></thead>\n"
    if body_rows:
        html += "<tbody>\n"
        for row in body_rows:
            html += "<tr>\n"
            for cell in parse_row(row):
                html += f"<td>{cell}</td>\n"
            html += "</tr>\n"
        html += "</tbody>\n"
    html += "</table>"
    return html


# --- HTML 模板 ---

CSS_VERSION = "v=11"
SHARED_VERSION = "v=20260929"   # 15 号扫尾批：共享三件缓存版本号，与全站 ?v=20260929 对齐；改 shared/ 下文件时同步 +1
BASE_URL = "https://project003125.github.io/INTRE-website"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>{title} · INTRE 导论教材</title>
    <meta name="description" content="{description}">
    <meta property="og:title" content="{og_title}">
    <meta property="og:description" content="{description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="{og_url}">
    <meta property="og:image" content="{base_url}/assets/og-image.svg">
    <link rel="canonical" href="{canonical_url}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{og_title}">
    <meta name="twitter:description" content="{description}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600&family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="textbook.css?{css_version}">
    <link rel="stylesheet" href="../shared/brand.css?{shared_version}">
    <link rel="stylesheet" href="../shared/components.css?{shared_version}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+" crossorigin="anonymous">
    <link rel="icon" href="../assets/favicon.png" type="image/png">
    <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
</head>
<body lang="zh">

    <a href="#main-content" class="skip-nav">跳转到主要内容</a>

    <nav class="toc-sidebar" id="tocSidebar">
        <div class="toc-sidebar-header">
            <span class="toc-sidebar-title">目录</span>
            <button class="toc-close-btn" id="tocCloseBtn" aria-label="关闭目录">&times;</button>
        </div>
        <div class="toc-sidebar-list" id="tocSidebarList"></div>
    </nav>

    <button class="toc-toggle-btn" id="tocToggleBtn" aria-label="打开目录">
        <i class="fas fa-list" aria-hidden="true"></i> 目录
    </button>

    <div class="toc-overlay" id="tocOverlay"></div>

<nav class="site-nav">
        <div class="nav-container">
            <a href="/INTRE-website/" class="nav-logo">INTRE</a>
            <button class="nav-toggle" aria-label="菜单" aria-expanded="false" aria-controls="nav-menu">☰</button>
            <div class="nav-links" id="nav-menu">
                <a href="/INTRE-website/">首页</a>
                <a href="/INTRE-website/iods/">IODS</a>
                <a href="/INTRE-website/uplp/">UPLP</a>
                <a href="/INTRE-website/unip/">UNIP</a>
                <a href="/INTRE-website/ubmp/">UBMP</a>
                <a href="/INTRE-website/pse/">PSE</a>
                <a href="/INTRE-website/rever/">REVER</a>
                <a href="/INTRE-website/textbook/" class="active">教材</a>
                <a href="/INTRE-website/glossary/">术语表</a>
            </div>
        </div>
    </nav>

    <div class="page-header">
        <div class="page-header-inner">
            <a href="index.html" class="back-link">← 返回目录</a>
            <span class="page-label">{chapter_label}</span>
        </div>
    </div>

    <main class="textbook-content" id="main-content">
        <h1 class="chapter-title">{title}</h1>
{body}
    </main>

    <div class="page-footer-nav">
        <div class="chapter-nav">{nav_links}</div>
    </div>

    <footer>
        <div class="footer-brand">INTRE</div>
        <p class="footer-watermark">功能层心理学 (FLP) · 导论教材</p>
        <div class="footer-links">
            <a href="https://github.com/project003125/INTRE-website" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://doi.org/10.5281/zenodo.18818607" target="_blank" rel="noopener noreferrer">PSE</a>
            <a href="https://doi.org/10.5281/zenodo.18818307" target="_blank" rel="noopener noreferrer">UPLS</a>
            <a href="https://doi.org/10.5281/zenodo.18820091" target="_blank" rel="noopener noreferrer">REVER</a>
        </div>
        <div class="footer-meta">
            <p>版本 v2.1 (2026-06-10) · CC0 1.0</p>
        </div>
    </footer>

    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" integrity="sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" integrity="sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk" crossorigin="anonymous"
        onload="renderMathInElement(document.querySelector('.textbook-content') || document.body,{{delimiters:[{{left:'$$',right:'$$',display:true}},{{left:'\\\\[',right:'\\\\]',display:true}},{{left:'\\\\(',right:'\\\\)',display:false}}]}});"></script>

    <script src="../shared/nav-toggle.js?{shared_version}"></script>
    <script src="../shared/sidebar.js"></script>
</body>
</html>"""


def build_nav_links(chapter_id, all_chapters):
    """构建章节导航链接 HTML。"""
    titles = all_chapters
    ids_sorted = sorted(titles.keys(), key=extract_chapter_number)
    try:
        idx = ids_sorted.index(chapter_id)
    except ValueError:
        idx = -1

    links = []
    if idx > 0:
        prev_id = ids_sorted[idx - 1]
        prev_short = get_short_title(titles[prev_id])
        links.append(f'<a href="{prev_id}.html" class="nav-link prev">‹ {prev_short}</a>')
    else:
        links.append('<a href="index.html" class="nav-link prev">‹ 目录</a>')

    links.append('<a href="index.html" class="nav-link up">☰ 目录</a>')

    if idx >= 0 and idx < len(ids_sorted) - 1:
        next_id = ids_sorted[idx + 1]
        next_short = get_short_title(titles[next_id])
        links.append(f'<a href="{next_id}.html" class="nav-link next">{next_short} ›</a>')

    return "\n".join(links)


def build_version_record(meta):
    """构建版本记录 HTML 表格。"""
    version = meta.get("version", "v1.0")
    date = meta.get("date", datetime.now().strftime("%Y-%m-%d"))
    return f"""<hr class="section-divider">
<hr class="section-divider">
<div class="version-record-title">版本记录</div>
<div class="table-wrap"><table>
<thead><tr>
<th>版本</th>
<th>日期</th>
<th>变更内容</th>
</tr></thead>
<tbody>
<tr>
<td>{version}</td>
<td>{date}</td>
<td>初始创建</td>
</tr>
</tbody>
</table></div>"""


# --- 主流程 ---

def main():
    # 命令行参数（默认值基于脚本位置推导，支持换机器/CI 覆盖）
    import argparse
    parser = argparse.ArgumentParser(
        description="INTRE 教材同步：Vault Markdown → Website HTML"
    )
    parser.add_argument(
        "--vault-dir", type=Path, default=VAULT_DIR,
        help=f"教材源 Markdown 目录（默认: {VAULT_DIR}）"
    )
    parser.add_argument(
        "--textbook-dir", type=Path, default=TEXTBOOK_DIR,
        help=f"HTML 输出目录（默认: {TEXTBOOK_DIR}）"
    )
    parser.add_argument(
        "--base-url", default=BASE_URL,
        help=f"站点根 URL（默认: {BASE_URL}）"
    )
    args = parser.parse_args()

    vault_dir = args.vault_dir
    textbook_dir = args.textbook_dir
    base_url = args.base_url

    # 校验输入目录存在
    if not vault_dir.is_dir():
        print(f"错误：教材源目录不存在: {vault_dir}", file=sys.stderr)
        return 0, 1
    if not textbook_dir.parent.exists():
        print(f"错误：输出目录的父级不存在: {textbook_dir.parent}", file=sys.stderr)
        return 0, 1
    textbook_dir.mkdir(parents=True, exist_ok=True)

    # 1. 收集所有源文件及其标题
    all_chapters = {}  # chapter_id → full_title
    src_files = []

    for f in sorted(vault_dir.glob("*.md")):
        cid = extract_chapter_id(f.name)
        if cid is None:
            continue  # 跳过 README、完整目录、后记等
        src_files.append(f)
        # 读取标题
        content = f.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(content)
        title = meta.get("title", "")
        if not title:
            # 从第一个 # 标题提取
            for line in body.split("\n"):
                if line.startswith("# "):
                    title = line[2:].strip()
                    break
        all_chapters[cid] = title

    print(f"找到 {len(src_files)} 个教材文件 ({len(all_chapters)} 个章节/附录)")

    # 2. 逐个转换
    changed = []
    unchanged = []
    errors = []

    for src_file in src_files:
        cid = extract_chapter_id(src_file.name)
        if cid is None:
            continue

        try:
            content = src_file.read_text(encoding="utf-8")
            meta, body = parse_frontmatter(content)
            title = meta.get("title", all_chapters.get(cid, ""))

            # 转换正文
            body_html = convert_markdown_body(body)

            # 添加版本记录
            version_record = build_version_record(meta)
            body_html += "\n" + version_record

            # 提取描述
            desc = get_description(body)
            if not desc:
                desc = title

            # 构建导航
            nav_links = build_nav_links(cid, all_chapters)

            # 构建完整 HTML
            chapter_label = get_chapter_label(cid)
            og_title = title
            og_url = f"{base_url}/textbook/{cid}.html"
            canonical_url = og_url

            html = HTML_TEMPLATE.format(
                title=title,
                description=desc,
                og_title=og_title,
                og_url=og_url,
                canonical_url=canonical_url,
                base_url=base_url,
                css_version=CSS_VERSION,
                shared_version=SHARED_VERSION,
                chapter_label=chapter_label,
                body=body_html,
                nav_links=nav_links,
            )

            # 比较现有文件
            out_path = textbook_dir / f"{cid}.html"
            if out_path.exists():
                existing = out_path.read_text(encoding="utf-8")
                # 标准化比较（忽略尾部空白差异）
                if html.strip() == existing.strip():
                    unchanged.append(cid)
                    continue

            # 写入
            out_path.write_text(html, encoding="utf-8")
            changed.append(cid)
            print(f"  ✓ {cid}.html — {title}")

        except Exception as e:
            errors.append((cid, str(e)))
            print(f"  ✗ {cid}.html — 错误: {e}")

    # 3. 报告
    print(f"\n--- 同步完成 ---")
    print(f"  更新: {len(changed)} 个文件")
    if changed:
        print(f"  文件: {', '.join(changed)}")
    print(f"  未变: {len(unchanged)} 个文件")
    if errors:
        print(f"  错误: {len(errors)} 个文件")
        for cid, err in errors:
            print(f"    - {cid}: {err}")
    print(f"  总计: {len(all_chapters)} 个章节/附录")

    return len(changed), len(errors)


if __name__ == "__main__":
    changed_count, error_count = main()
    sys.exit(0 if error_count == 0 else 1)
