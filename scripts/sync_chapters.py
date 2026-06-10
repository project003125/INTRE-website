#!/usr/bin/env python3
"""
INTRE 教材自动同步脚本
======================
从 Vault (08-导论教材/*.md) 读取 Markdown，转换为 HTML，
插入到章节模板中，写入 Website (-website/textbook/*.html)。

用法:
    python sync_chapters.py              # 同步所有章节
    python sync_chapters.py --dry-run    # 仅预览变更，不写入
    python sync_chapters.py ch01         # 仅同步指定章节
"""

import os
import re
import sys
import argparse
from pathlib import Path

# ============================================================
# CONFIGURATION
# ============================================================
# Paths are computed relative to this script's location:
#   -website/                  ← BASE_DIR (parent of scripts/)
#   -website/scripts/          ← this script
#   INTRE/08-导论教材/         ← VAULT_DIR (sibling of -website/)
#   -website/textbook/         ← WEBSITE_DIR

BASE_DIR = Path(__file__).resolve().parent.parent
VAULT_DIR = BASE_DIR.parent / "08-导论教材"
WEBSITE_DIR = BASE_DIR / "textbook"

# Chapter mapping: vault filename pattern → (html_filename, section, short_label, chapter_label)
# Keys are regex patterns matched against vault filenames
CHAPTER_MAP = [
    # 上篇 导论 (ch01-ch09)
    (r"第1章\s", "ch01.html", "上篇 导论", "1 范式演变", "第1章"),
    (r"第2章\s", "ch02.html", "上篇 导论", "2 层次定位", "第2章"),
    (r"第3章\s", "ch03.html", "上篇 导论", "3 框架总览", "第3章"),
    (r"第4章\s", "ch04.html", "上篇 导论", "4 范式批判", "第4章"),
    (r"第5章\s", "ch05.html", "上篇 导论", "5 架构推导", "第5章"),
    (r"第6章\s", "ch06.html", "上篇 导论", "6 状态维度", "第6章"),
    (r"第7章\s", "ch07.html", "上篇 导论", "7 功能模块", "第7章"),
    (r"第8章\s", "ch08.html", "上篇 导论", "8 状态向量", "第8章"),
    (r"第9章\s", "ch09.html", "上篇 导论", "9 测量方法", "第9章"),
    # 中篇 PSE六论 (ch10-ch18)
    (r"第10章\s", "ch10.html", "中篇 PSE六论", "10 原子操作", "第10章"),
    (r"第11章\s", "ch11.html", "中篇 PSE六论", "11 干预序列", "第11章"),
    (r"第12章\s", "ch12.html", "中篇 PSE六论", "12 流派分解", "第12章"),
    (r"第13章\s", "ch13.html", "中篇 PSE六论", "13 流派生成", "第13章"),
    (r"第14章\s", "ch14.html", "中篇 PSE六论", "14 概念标识", "第14章"),
    (r"第15章\s", "ch15.html", "中篇 PSE六论", "15 语义架构", "第15章"),
    (r"第16章\s", "ch16.html", "中篇 PSE六论", "16 共识工程", "第16章"),
    (r"第17章\s", "ch17.html", "中篇 PSE六论", "17 逻辑指纹", "第17章"),
    (r"第18章\s", "ch18.html", "中篇 PSE六论", "18 PSE架构", "第18章"),
    # 下篇 应用 (ch19-ch29)
    (r"第19章\s", "ch19.html", "下篇 应用", "19 系统动力学", "第19章"),
    (r"第20章\s", "ch20.html", "下篇 应用", "20 仿真校准", "第20章"),
    (r"第21章\s", "ch21.html", "下篇 应用", "21 临床案例", "第21章"),
    (r"第22章\s", "ch22.html", "下篇 应用", "22 神经对接", "第22章"),
    (r"第23章\s", "ch23.html", "下篇 应用", "23 双向约束", "第23章"),
    (r"第24章\s", "ch24.html", "下篇 应用", "24 边界修订", "第24章"),
    (r"第25章\s", "ch25.html", "下篇 应用", "25 REVER", "第25章"),
    (r"第26章\s", "ch26.html", "下篇 应用", "26 心理AI", "第26章"),
    (r"第27章\s", "ch27.html", "下篇 应用", "27 跨学科接口", "第27章"),
    (r"第28章\s", "ch28.html", "下篇 应用", "28 研究方法", "第28章"),
    (r"第29章\s", "ch29.html", "下篇 应用", "29 未来方向", "第29章"),
    # 附录 (app-a through app-n)
    (r"附录A[：\s]", "app-a.html", "附录", "A 42子维度", "附录A"),
    (r"附录B[：\s]", "app-b.html", "附录", "B GMAR速查", "附录B"),
    (r"附录C[：\s]", "app-c.html", "附录", "C PSE入门", "附录C"),
    (r"附录D[：\s]", "app-d.html", "附录", "D REVER审计", "附录D"),
    (r"附录E[：\s]", "app-e.html", "附录", "E 流派映射", "附录E"),
    (r"附录F[：\s]", "app-f.html", "附录", "F 逻辑指纹", "附录F"),
    (r"附录G[：\s]", "app-g.html", "附录", "G 术语对照", "附录G"),
    (r"附录H[：\s]", "app-h.html", "附录", "H 形式审查", "附录H"),
    (r"附录I[：\s]", "app-i.html", "附录", "I 家教案例", "附录I"),
    (r"附录J[：\s]", "app-j.html", "附录", "J PCUI规范", "附录J"),
    (r"附录K[：\s]", "app-k.html", "附录", "K PSA依赖", "附录K"),
    (r"附录L[：\s]", "app-l.html", "附录", "L 架构速查", "附录L"),
    (r"附录M[：\s]", "app-m.html", "附录", "M 数学速成", "附录M"),
    (r"附录N[：\s]", "app-n.html", "附录", "N 概念速查", "附录N"),
]


# ============================================================
# MARKDOWN → HTML CONVERSION
# ============================================================

def strip_yaml_frontmatter(text: str) -> str:
    """Remove YAML frontmatter (--- ... ---) from markdown."""
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            return text[end + 3:].lstrip()
    return text


def convert_markdown_body(md_text: str) -> str:
    """
    Convert markdown body to HTML suitable for textbook-content.
    Uses regex-based conversion (no external dependencies).
    """
    text = strip_yaml_frontmatter(md_text)
    
    # Remove the first H1 heading (chapter title — added by template)
    text = re.sub(r'^# .+\n+', '', text, count=1)
    
    lines = text.split('\n')
    result = []
    in_table = False
    in_code_block = False
    in_blockquote = False
    code_lines = []
    table_lines = []
    quote_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # --- Code blocks (fenced) ---
        if line.strip().startswith('```'):
            if in_code_block:
                # End of code block
                lang = code_lines[0].strip() if code_lines else ''
                code_content = '\n'.join(code_lines[1:]) if len(code_lines) > 1 else ''
                # Escape HTML entities in code
                code_content = code_content.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                if lang:
                    result.append(f'<pre><code class="language-{lang}">{code_content}</code></pre>')
                else:
                    result.append(f'<pre><code>{code_content}</code></pre>')
                code_lines = []
                in_code_block = False
            else:
                # Start of code block
                in_code_block = True
                code_lines.append(line.strip()[3:])  # Store language identifier
            i += 1
            continue
        
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue
        
        # --- Tables ---
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(line)
            # Check if next line is a separator or table continues
            if i + 1 < len(lines) and '|' in lines[i + 1] and lines[i + 1].strip().startswith('|'):
                i += 1
                continue
            elif i + 1 < len(lines) and re.match(r'^\|[\s\-:|]+\|$', lines[i + 1].strip()):
                # This is a separator row
                table_lines.append(lines[i + 1])
                i += 2
                # Continue collecting data rows
                while i < len(lines) and '|' in lines[i] and lines[i].strip().startswith('|'):
                    table_lines.append(lines[i])
                    i += 1
                in_table = False
                result.append(convert_table(table_lines))
                table_lines = []
                continue
            else:
                i += 1
                continue
        
        if in_table:
            # End of table
            in_table = False
            result.append(convert_table(table_lines))
            table_lines = []
            # Don't increment i — reprocess current line
            continue
        
        # --- Blockquotes ---
        if line.strip().startswith('>'):
            if not in_blockquote:
                in_blockquote = True
                quote_lines = []
            quote_lines.append(re.sub(r'^>\s?', '', line))
            i += 1
            continue
        
        if in_blockquote:
            in_blockquote = False
            quote_text = '\n'.join(quote_lines)
            quote_html = convert_inline_formatting(quote_text)
            result.append(f'<blockquote><p>{quote_html}</p></blockquote>')
            quote_lines = []
            continue
        
        # --- Horizontal rules ---
        if re.match(r'^[-*_]{3,}$', line.strip()):
            result.append('<hr class="section-divider">')
            i += 1
            continue
        
        # --- Headings ---
        h2_match = re.match(r'^## (.+)$', line)
        h3_match = re.match(r'^### (.+)$', line)
        h4_match = re.match(r'^#### (.+)$', line)
        
        if h2_match:
            result.append(f'<h2>{convert_inline_formatting(h2_match.group(1))}</h2>')
            i += 1
            continue
        if h3_match:
            result.append(f'<h3>{convert_inline_formatting(h3_match.group(1))}</h3>')
            i += 1
            continue
        if h4_match:
            result.append(f'<h4>{convert_inline_formatting(h4_match.group(1))}</h4>')
            i += 1
            continue
        
        # --- Empty lines ---
        if line.strip() == '':
            # Close any open paragraph
            i += 1
            continue
        
        # --- Regular paragraph ---
        para_lines = [line]
        i += 1
        while (i < len(lines) and 
               lines[i].strip() != '' and
               not lines[i].strip().startswith('```') and
               not lines[i].strip().startswith('>') and
               not re.match(r'^[-*_]{3,}$', lines[i].strip()) and
               not re.match(r'^#{1,4} ', lines[i]) and
               not (lines[i].strip().startswith('|') and '|' in lines[i])
               ):
            para_lines.append(lines[i])
            i += 1
        
        para_text = ' '.join(para_lines)
        
        # Handle lists
        if re.match(r'^[\d]+\. ', para_text) or re.match(r'^[-*] ', para_text):
            result.append(convert_list(para_lines, lines, i))
        else:
            para_html = convert_inline_formatting(para_text)
            if para_html.strip():
                result.append(f'<p>{para_html}</p>')
    
    # Close any remaining blockquote
    if in_blockquote and quote_lines:
        quote_text = '\n'.join(quote_lines)
        quote_html = convert_inline_formatting(quote_text)
        result.append(f'<blockquote><p>{quote_html}</p></blockquote>')
    
    return '\n'.join(result)


def convert_table(lines: list) -> str:
    """Convert markdown table lines to HTML table."""
    if len(lines) < 2:
        return ''
    
    # Remove separator row (|---|---|)
    clean_lines = [l for l in lines if not re.match(r'^\|[\s\-:|]+\|$', l.strip())]
    if not clean_lines:
        return ''
    
    html = '<div class="table-wrap"><table>\n'
    
    # Header row
    header_cells = [c.strip() for c in clean_lines[0].split('|')[1:-1]]
    html += '<thead><tr>\n'
    for cell in header_cells:
        html += f'<th>{convert_inline_formatting(cell)}</th>\n'
    html += '</tr></thead>\n'
    
    # Data rows
    if len(clean_lines) > 1:
        html += '<tbody>\n'
        for row in clean_lines[1:]:
            cells = [c.strip() for c in row.split('|')[1:-1]]
            html += '<tr>\n'
            for cell in cells:
                html += f'<td>{convert_inline_formatting(cell)}</td>\n'
            html += '</tr>\n'
        html += '</tbody>\n'
    
    html += '</table></div>'
    return html


def convert_list(lines: list, all_lines: list, current_idx: int) -> str:
    """Convert markdown list to HTML list."""
    items = []
    in_list = True
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        # Check if still a list item
        if re.match(r'^[\d]+\. ', stripped):
            items.append(('ol', re.sub(r'^[\d]+\.\s*', '', stripped)))
        elif re.match(r'^[-*] ', stripped):
            items.append(('ul', re.sub(r'^[-*]\s*', '', stripped)))
        else:
            break
    
    if not items:
        return convert_inline_formatting(' '.join(lines))
    
    # Determine list type from first item
    list_type = items[0][0]
    html = f'<{list_type}>\n'
    for _, item_text in items:
        html += f'<li>{convert_inline_formatting(item_text)}</li>\n'
    html += f'</{list_type}>'
    return html


def convert_inline_formatting(text: str) -> str:
    """Convert bold, italic, inline code, links, and footnotes."""
    # Footnotes [^1]
    text = re.sub(r'\[\^(\d+)\]', r'<sup><a href="#fn\1" id="fnref\1">[\1]</a></sup>', text)
    
    # Bold **text** or __text__
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__(.+?)__', r'<strong>\1</strong>', text)
    
    # Italic *text* or _text_ (but not inside words)
    text = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<em>\1</em>', text)
    
    # Inline code `text`
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    
    # Links [text](url)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    
    return text


# ============================================================
# HTML TEMPLATE (using %PLACEHOLDER% substitution)
# ============================================================

_HTML_TEMPLATE = r'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%TITLE% · INTRE 导论教材</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600&family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=Noto+Sans+SC:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="textbook.css?v=10">
    <link rel="stylesheet" href="../shared/brand.css">
    <link rel="stylesheet" href="../shared/components.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">
</head>
<body>

    <nav class="toc-sidebar" id="tocSidebar">
        <div class="toc-sidebar-header">
            <span class="toc-sidebar-title">目录</span>
            <button class="toc-close-btn" id="tocCloseBtn" aria-label="关闭目录">&times;</button>
        </div>
        <div class="toc-sidebar-list" id="tocSidebarList"></div>
    </nav>

    <button class="toc-toggle-btn" id="tocToggleBtn" aria-label="打开目录">
        <i class="fas fa-list"></i> 目录
    </button>

    <div class="toc-overlay" id="tocOverlay"></div>

<nav>
        <div class="nav-container">
            <a href="/INTRE/" class="nav-logo">
                <img src="../assets/logo-dark.svg" alt="INTRE" onerror="this.style.display='none'">
                <span class="logo-text">INTRE</span>
            </a>
            <button class="nav-toggle" aria-label="菜单" onclick="this.nextElementSibling.classList.toggle('open')">☰</button>
            <div class="nav-links">
                <a href="/INTRE/">首页</a>
                <a href="/INTRE/upls/">UPLS</a>
                <a href="/INTRE/unis/">UNIS</a>
                <a href="/INTRE/ubms/">UBMS</a>
                <a href="/INTRE/pse/">PSE</a>
                <a href="/INTRE/rever/">REVER</a>
                <a href="/INTRE/textbook/" class="active">教材</a>
                <a href="/INTRE/glossary/">术语表</a>
            </div>
        </div>
    </nav>

    <div class="page-header">
        <div class="page-header-inner">
            <a href="index.html" class="back-link">← 返回目录</a>
            <span class="page-label">%CHAPTER_LABEL%</span>
        </div>
    </div>

    <main class="textbook-content">
        <h1 class="chapter-title">%TITLE%</h1>
%CONTENT_BODY%
    </main>

    <div class="page-footer-nav">
        <div class="chapter-nav">%NAV_HTML%</div>
    </div>

    <footer>
        <div class="footer-brand">INTRE</div>
        <p style="font-size:0.88rem; opacity:0.6; margin:0.3rem 0 1rem;">功能层心理学 (FLP) · 导论教材</p>
        <div class="footer-links">
            <a href="https://github.com/project003125/INTRE" target="_blank">GitHub</a>
            <a href="https://doi.org/10.5281/zenodo.18818607" target="_blank">PSE</a>
            <a href="https://doi.org/10.5281/zenodo.18818307" target="_blank">UPLS</a>
            <a href="https://doi.org/10.5281/zenodo.18820091" target="_blank">REVER</a>
        </div>
        <div class="footer-meta">
            <p>版本 v2.1 (2026-06-10) · CC0 1.0</p>
        </div>
    </footer>

    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous"
        onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'\\\\[',right:'\\\\]',display:true},{left:'\\\\(',right:'\\\\)',display:false}]});"></script>


<script>
(function() {
    var chapters = [%CHAPTERS_JS%];
    var currentPage = window.location.pathname.split('/').pop() || '%CURRENT_HTML%';

    // === BUILD LEFT SIDEBAR: chapter navigation ===
    var chapterNav = document.createElement('nav');
    chapterNav.className = 'toc-sidebar--left';
    chapterNav.id = 'chapterNav';
    var navList = document.createElement('div');
    navList.className = 'chapter-nav-list';

    var lastSection = '';
    chapters.forEach(function(c) {
        if (c[0] !== lastSection) {
            lastSection = c[0];
            var sec = document.createElement('div');
            sec.className = 'chapter-nav-section';
            sec.textContent = lastSection;
            navList.appendChild(sec);
        }
        var a = document.createElement('a');
        a.className = 'chapter-nav-link';
        if (c[1] === currentPage) a.classList.add('active');
        a.href = c[1];
        a.textContent = c[2];
        navList.appendChild(a);
    });
    chapterNav.appendChild(navList);
    document.body.insertBefore(chapterNav, document.body.firstChild);

    // === BUILD RIGHT SIDEBAR: current page H2+H3 TOC ===
    var sidebar = document.getElementById('tocSidebar');
    var toggleBtn = document.getElementById('tocToggleBtn');
    var closeBtn = document.getElementById('tocCloseBtn');
    var overlay = document.getElementById('tocOverlay');
    var list = document.getElementById('tocSidebarList');

    if (!sidebar) return;

    function isDesktop() { return window.innerWidth >= 1200; }

    var headings = document.querySelectorAll('.textbook-content h2, .textbook-content h3');
    var hIdx = 0, h2Idx = 0;
    headings.forEach(function(h, i) {
        var id = 's' + i;
        h.id = id;
        var link = document.createElement('a');
        link.href = '#' + id;
        link.className = 'toc-item';
        if (h.tagName === 'H2') { link.classList.add('toc-h2'); }
        link.textContent = h.textContent;
        link.onclick = function(e) {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({behavior:'smooth'});
            if (!isDesktop()) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('show');
            }
        };
        list.appendChild(link);
    });

    function open() { sidebar.classList.add('open'); if (overlay) overlay.classList.add('show'); }
    function close() { sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }

    if (toggleBtn) toggleBtn.onclick = open;
    if (closeBtn) closeBtn.onclick = close;
    if (overlay) overlay.onclick = close;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                list.querySelectorAll('.toc-item').forEach(function(el) { el.classList.remove('active'); });
                var active = list.querySelector('.toc-item[href="#' + entry.target.id + '"]');
                if (active) active.classList.add('active');
            }
        });
    }, {rootMargin: '-80px 0px -60% 0px'});
    headings.forEach(function(h) { observer.observe(h); });
})();
</script>

</body>
</html>'''


def build_html(content_body: str, title: str, chapter_label: str,
               prev_html: str, next_html: str, chapters_js: str, current_html: str) -> str:
    """Insert converted content into the chapter HTML template."""
    nav_items = []
    if prev_html:
        nav_items.append(prev_html)
    nav_items.append('<a href="index.html" class="nav-link up">☰ 目录</a>')
    if next_html:
        nav_items.append(next_html)
    nav_html = ''.join(nav_items)

    html = _HTML_TEMPLATE
    html = html.replace('%TITLE%', title)
    html = html.replace('%CHAPTER_LABEL%', chapter_label)
    html = html.replace('%CONTENT_BODY%', content_body)
    html = html.replace('%NAV_HTML%', nav_html)
    html = html.replace('%CHAPTERS_JS%', chapters_js)
    html = html.replace('%CURRENT_HTML%', current_html)
    return html


# ============================================================
# CHAPTER DATA BUILDERS
# ============================================================

def build_chapters_js():
    """Build the JS chapters array from CHAPTER_MAP."""
    entries = []
    for _, html_name, section, label, _ in CHAPTER_MAP:
        escaped_section = section.replace("'", "\\'")
        escaped_label = label.replace("'", "\\'")
        entries.append(f"['{escaped_section}', '{html_name}', '{escaped_label}']")
    return ', '.join(entries)


def build_nav_link(html_name: str, label: str, direction: str) -> str:
    """Build a prev/next nav link."""
    display_label = label.split(' ', 1)[1] if ' ' in label else label
    if direction == 'prev':
        return f'<a href="{html_name}" class="nav-link prev">‹ {display_label}</a>'
    else:
        return f'<a href="{html_name}" class="nav-link next">{display_label} ›</a>'


# ============================================================
# MAIN SYNC LOGIC
# ============================================================

def find_vault_file(pattern: str) -> Path | None:
    """Find a vault markdown file matching the given regex pattern."""
    for f in VAULT_DIR.glob("*.md"):
        if re.search(pattern, f.name):
            return f
    return None


def sync_chapter(chapter_idx: int, dry_run: bool = False) -> bool:
    """Sync a single chapter. Returns True if changes were made."""
    pattern, html_name, section, label, chapter_label = CHAPTER_MAP[chapter_idx]
    
    vault_file = find_vault_file(pattern)
    if not vault_file:
        print(f"  !! Vault file not found for pattern: {pattern}")
        return False
    
    # Read markdown
    with open(vault_file, 'r', encoding='utf-8') as f:
        md_text = f.read()
    
    # Extract title from YAML or first H1
    title_match = re.search(r'^title:\s*(.+)$', md_text, re.MULTILINE)
    if title_match:
        title = title_match.group(1).strip()
    else:
        h1_match = re.search(r'^# (.+)$', md_text, re.MULTILINE)
        title = h1_match.group(1).strip() if h1_match else label
    
    # Convert markdown to HTML
    content_body = convert_markdown_body(md_text)
    
    # Build prev/next links
    prev_html = ""
    next_html = ""
    if chapter_idx > 0:
        _, prev_name, _, prev_label, _ = CHAPTER_MAP[chapter_idx - 1]
        prev_html = build_nav_link(prev_name, prev_label, 'prev')
    if chapter_idx < len(CHAPTER_MAP) - 1:
        _, next_name, _, next_label, _ = CHAPTER_MAP[chapter_idx + 1]
        next_html = build_nav_link(next_name, next_label, 'next')
    
    # Build full HTML
    chapters_js = build_chapters_js()
    html = build_html(content_body, title, chapter_label, prev_html, next_html,
                      chapters_js, html_name)
    
    # Write output
    output_path = WEBSITE_DIR / html_name
    if dry_run:
        print(f"  → Would write: {output_path} ({len(html)} bytes)")
        return True
    
    # Check if content actually changed
    if output_path.exists():
        with open(output_path, 'r', encoding='utf-8') as f:
            existing = f.read()
        if existing.strip() == html.strip():
            print(f"  [OK] {html_name} — unchanged")
            return False
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  >> {html_name} — synced from {vault_file.name}")
    return True


def main():
    parser = argparse.ArgumentParser(description="Sync INTRE textbook from vault to website")
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without writing')
    parser.add_argument('targets', nargs='*', help='Specific chapter IDs to sync (e.g. ch01, app-a)')
    args = parser.parse_args()
    
    if not VAULT_DIR.exists():
        print(f"ERROR: Vault directory not found: {VAULT_DIR}")
        sys.exit(1)
    
    if not WEBSITE_DIR.exists():
        print(f"ERROR: Website textbook directory not found: {WEBSITE_DIR}")
        sys.exit(1)
    
    # Determine which chapters to sync
    if args.targets:
        indices = []
        for target in args.targets:
            found = False
            for i, (_, html_name, _, _, _) in enumerate(CHAPTER_MAP):
                if html_name.replace('.html', '') == target:
                    indices.append(i)
                    found = True
                    break
            if not found:
                print(f"Warning: '{target}' not found in chapter map, skipping")
        if not indices:
            print("No valid targets found.")
            sys.exit(1)
    else:
        indices = list(range(len(CHAPTER_MAP)))
    
    mode = "DRY RUN" if args.dry_run else "SYNC"
    print(f"=== INTRE Textbook Sync ({mode}) ===")
    print(f"Vault:  {VAULT_DIR}")
    print(f"Output: {WEBSITE_DIR}")
    print(f"Chapters to sync: {len(indices)}")
    print()
    
    changed = 0
    for idx in indices:
        try:
            if sync_chapter(idx, dry_run=args.dry_run):
                changed += 1
        except Exception as e:
            print(f"  !! Error syncing chapter {idx}: {e}")
    
    print()
    if args.dry_run:
        print(f"Dry run complete. {changed} chapter(s) would be updated.")
    else:
        print(f"Sync complete. {changed} chapter(s) updated.")


if __name__ == '__main__':
    main()
