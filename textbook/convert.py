#!/usr/bin/env python3
"""Convert textbook markdown files to clean HTML pages."""

import os
import re
import html

SRC = r"C:\Users\Administrator\Documents\INTRE\08-导论教材"
DST = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"
SHARED_CSS = "textbook.css"

# Chapter order mapping
CHAPTERS = [
    ("第1章 范式演变：从变量到功能层诞生", "ch01"),
    ("第2章 层次定位：本体论、认识论与合法性", "ch02"),
    ("第3章 框架总览：INTRE核心资产与子系统", "ch03"),
    ("第4章 范式批判：变量范式的边界与吸纳", "ch04"),
    ("第5章 架构推导：从元公理到操作系统", "ch05"),
    ("第6章 状态维度：资源、调度与结构三轴", "ch06"),
    ("第7章 功能模块：M1至M6划分与级联", "ch07"),
    ("第8章 状态向量：42维表示与动力学", "ch08"),
    ("第9章 测量方法：ABC分类与桥接校准", "ch09"),
    ("第10章 原子操作：GMAR语法与临床直觉", "ch10"),
    ("第11章 干预序列：DRS深度法则与例外", "ch11"),
    ("第12章 流派分解：六大流派的GMAR映射", "ch12"),
    ("第13章 流派生成：从语法空位到预测疗法", "ch13"),
    ("第14章 概念标识：PCUI编码与同义词映射", "ch14"),
    ("第15章 语义架构：PSA推理与PSL编译", "ch15"),
    ("第16章 共识工程：三阶段知识生产流水线", "ch16"),
    ("第17章 逻辑指纹：解析差异的标准化治理", "ch17"),
    ("第18章 PSE架构：五层引擎与心智六论", "ch18"),
    ("第19章 系统动力学：资源、调度与结构方程", "ch19"),
    ("第20章 仿真校准：蒙特卡罗与贝叶斯", "ch20"),
    ("第21章 临床案例：焦虑、创伤与抑郁", "ch21"),
    ("第22章 神经对接：翻译与约束的根本差异", "ch22"),
    ("第23章 双向约束：正向预测与反向信号", "ch23"),
    ("第24章 边界修订：从信号检测到概念修订", "ch24"),
    ("第25章 REVER：结构伦理、依赖雷达与门控", "ch25"),
    ("第26章 心理AI：功能层驱动的智能交互", "ch26"),
    ("第27章 跨学科接口：学科映射与范式协作", "ch27"),
    ("第28章 研究方法：从N-of-1到状态空间建模", "ch28"),
    ("第29章 未来方向：挑战、争议与计算愿景", "ch29"),
]

APPENDICES = [
    ("附录A：42子维度列表——符号、定义、分类与测量", "app-a"),
    ("附录B：G-M-A-R速查——按临床问题索引", "app-b"),
    ("附录C：PSE快速入门——代码示例与仿真模板", "app-c"),
    ("附录D：REVER审计——四子协议模板", "app-d"),
    ("附录E：流派映射——10大流派的功能签名与操作分解", "app-e"),
    ("附录F：逻辑指纹——编码协议与PCUI JSON示例", "app-f"),
    ("附录G：术语对照——中英文约500条", "app-g"),
    ("附录H：形式审查——压力测试与替代测试结果摘要", "app-h"),
    ("附录I：家教案例——学生拖延的INTRE干预", "app-i"),
    ("附录J：PCUI规范——角色标签、映射与消歧", "app-j"),
    ("附录K：PSA依赖——矩阵、级联模板与文化参数", "app-k"),
    ("附录L：架构速查——推导链与公理体系", "app-l"),
    ("附录M：数学速成——函数、微分、概率与滤波", "app-m"),
    ("附录N：概念速查——心理学、神经科学与系统论", "app-n"),
]

ALL_ITEMS = CHAPTERS + APPENDICES  # Ordered list for prev/next nav

def build_nav(current_id):
    """Build prev/next navigation links."""
    idx = None
    for i, (title, fid) in enumerate(ALL_ITEMS):
        if fid == current_id:
            idx = i
            break
    prev_link = ""
    next_link = ""
    if idx is not None and idx > 0:
        pt, pf = ALL_ITEMS[idx - 1]
        short = pt.replace("第", "").replace("章", "").replace("附录", "附")
        prev_link = f'<a href="{pf}.html" class="nav-link prev">‹ {short}</a>'
    if idx is not None and idx < len(ALL_ITEMS) - 1:
        nt, nf = ALL_ITEMS[idx + 1]
        short = nt.replace("第", "").replace("章", "").replace("附录", "附")
        next_link = f'<a href="{nf}.html" class="nav-link next">{short} ›</a>'
    return f'<div class="chapter-nav">{prev_link}<a href="index.html" class="nav-link up">☰ 目录</a>{next_link}</div>'


def parse_markdown(text):
    """Convert markdown text to HTML."""
    lines = text.split("\n")
    in_yaml = False
    yaml_done = False
    in_code = False
    in_table = False
    html_lines = []
    table_rows = []
    
    # Detect if content starts with --- for YAML
    # We'll skip YAML frontmatter
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Skip YAML frontmatter
        if i == 0 and line.strip() == "---":
            in_yaml = True
            i += 1
            continue
        if in_yaml:
            if line.strip() == "---":
                in_yaml = False
                yaml_done = True
            i += 1
            continue
        
        # Code blocks
        if line.strip().startswith("```"):
            if in_code:
                html_lines.append("</code></pre>")
                in_code = False
            else:
                lang = line.strip()[3:].strip()
                html_lines.append(f'<pre><code class="language-{lang}">')
                in_code = True
            i += 1
            continue
        if in_code:
            html_lines.append(html.escape(line))
            i += 1
            continue
        
        # Skip the title line if it's the H1 (we'll use it in the template)
        stripped = line.strip()
        
        # Horizontal rule
        if stripped == "---" and not in_table:
            html_lines.append('<hr class="section-divider">')
            i += 1
            continue
        
        # Headings
        if stripped.startswith("###### "):
            html_lines.append(f"<h6>{html.escape(stripped[7:])}</h6>")
            i += 1
            continue
        if stripped.startswith("##### "):
            html_lines.append(f"<h5>{html.escape(stripped[6:])}</h5>")
            i += 1
            continue
        if stripped.startswith("#### "):
            html_lines.append(f"<h4>{html.escape(stripped[5:])}</h4>")
            i += 1
            continue
        if stripped.startswith("### "):
            html_lines.append(f"<h3>{html.escape(stripped[4:])}</h3>")
            i += 1
            continue
        if stripped.startswith("## "):
            html_lines.append(f"<h2>{html.escape(stripped[3:])}</h2>")
            i += 1
            continue
        if stripped.startswith("# "):
            # Skip H1 - we use it in the page template
            html_lines.append(f'<h1 class="chapter-title">{html.escape(stripped[2:])}</h1>')
            i += 1
            continue
        
        # Blockquote
        if stripped.startswith("> "):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            content = "<br>".join(html.escape(l) for l in quote_lines)
            html_lines.append(f"<blockquote><p>{content}</p></blockquote>")
            continue
        if stripped == ">":
            html_lines.append("<blockquote><br></blockquote>")
            i += 1
            continue
        
        # Table detection
        if "|" in stripped and stripped.startswith("|") and stripped.endswith("|"):
            # Check if next line is a separator row
            if not in_table:
                in_table = True
                table_rows = []
                # Parse header row
                cells = [c.strip() for c in stripped.split("|")[1:-1]]
                table_rows.append(cells)
                i += 1
                # Skip separator row
                if i < len(lines) and "---" in lines[i]:
                    i += 1
                continue
            else:
                cells = [c.strip() for c in stripped.split("|")[1:-1]]
                table_rows.append(cells)
                i += 1
                continue
        else:
            if in_table:
                # End table
                html_lines.append(build_table(table_rows))
                in_table = False
                table_rows = []
                # Don't increment i - process this line as normal
        
        # List items
        if stripped.startswith("- ") or stripped.startswith("* "):
            list_items = []
            while i < len(lines):
                s = lines[i].strip()
                if s.startswith("- ") or s.startswith("* "):
                    list_items.append(s[2:])
                    i += 1
                elif s == "":
                    i += 1
                    break
                else:
                    break
            html_lines.append("<ul>")
            for item in list_items:
                html_lines.append(f"<li>{format_inline(item)}</li>")
            html_lines.append("</ul>")
            continue
        
        if stripped.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.")):
            list_items = []
            while i < len(lines):
                s = lines[i].strip()
                if re.match(r"^\d+\.", s):
                    content = re.sub(r"^\d+\.\s*", "", s)
                    list_items.append(content)
                    i += 1
                elif s == "":
                    i += 1
                    break
                else:
                    break
            html_lines.append("<ol>")
            for item in list_items:
                html_lines.append(f"<li>{format_inline(item)}</li>")
            html_lines.append("</ol>")
            continue
        
        # Empty line
        if stripped == "":
            i += 1
            continue
        
        # Regular paragraph
        para_lines = []
        para_lines.append(stripped)
        i += 1
        while i < len(lines):
            s = lines[i].strip()
            if s == "" or s.startswith("#") or s.startswith("> ") or s == ">" or s.startswith("```") or s.startswith("- ") or s.startswith("* ") or s.startswith("---") or re.match(r"^\d+\.", s) or (s.startswith("|") and s.endswith("|")):
                break
            para_lines.append(s)
            i += 1
        html_lines.append(f"<p>{format_inline(' '.join(para_lines))}</p>")
    
    # Close any open table
    if in_table:
        html_lines.append(build_table(table_rows))
    
    return "\n".join(html_lines)


def build_table(rows):
    """Build HTML table from parsed rows."""
    if not rows:
        return ""
    html = ["<div class='table-wrap'><table>"]
    # Header row
    html.append("<thead><tr>")
    for cell in rows[0]:
        html.append(f"<th>{format_inline(cell)}</th>")
    html.append("</tr></thead>")
    # Data rows
    if len(rows) > 1:
        html.append("<tbody>")
        for row in rows[1:]:
            html.append("<tr>")
            for cell in row:
                html.append(f"<td>{format_inline(cell)}</td>")
            html.append("</tr>")
        html.append("</tbody>")
    html.append("</table></div>")
    return "\n".join(html)


def format_inline(text):
    """Format inline markdown elements (bold, italic, code, links)."""
    # Code: `text`
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    # Bold: **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    # Italic: *text*
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", text)
    # Links: [text](url)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
    return text


def convert_file(filename, file_id):
    """Convert a markdown file to an HTML page."""
    filepath = os.path.join(SRC, filename + ".md")
    if not os.path.exists(filepath):
        print(f"  [WARN] Not found: {filepath}")
        return
    
    with open(filepath, "r", encoding="utf-8") as f:
        md = f.read()
    
    # Extract title from YAML or first H1
    title_match = re.search(r"^title:\s*(.+)", md, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else filename
    
    # Extract H1 for the page
    h1_match = re.search(r"^#\s+(.+)", md, re.MULTILINE)
    h1_text = h1_match.group(1).strip() if h1_match else title
    
    content_html = parse_markdown(md)
    nav_html = build_nav(file_id)
    
    # Determine if chapter or appendix
    is_chapter = file_id.startswith("ch")
    section_label = f"第{int(file_id[2:]):d}章" if is_chapter else "附录"
    
    html_page = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)} · INTRE 导论教材</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{SHARED_CSS}">
</head>
<body>
    <nav>
        <div class="nav-container">
            <div class="logo"><a href="/INTRE/">INTRE</a></div>
            <div class="nav-links">
                <a href="/INTRE/">首页</a>
                <a href="/INTRE/upls/">UPLS</a>
                <a href="/INTRE/unis/">UNIS</a>
                <a href="/INTRE/pse/">PSE</a>
                <a href="/INTRE/rever/">REVER</a>
                <a href="/INTRE/textbook/" class="active">📖教材</a>
                <a href="/INTRE/glossary/">术语表</a>
            </div>
        </div>
    </nav>

    <div class="page-header">
        <div class="page-header-inner">
            <a href="index.html" class="back-link">← 返回目录</a>
            <span class="page-label">{section_label}</span>
        </div>
    </div>

    <main class="textbook-content">
        {content_html}
    </main>

    <div class="page-footer-nav">
        {nav_html}
    </div>

    <footer>
        <p>INTRE 心理学功能层工程框架 · 导论教材</p>
        <p style="font-size:0.8rem; margin-top:0.5rem; opacity:0.6;">CC0 1.0 · 保留部分权利</p>
    </footer>
</body>
</html>"""
    
    outpath = os.path.join(DST, file_id + ".html")
    with open(outpath, "w", encoding="utf-8") as f:
        f.write(html_page)
    print(f"  [OK] {file_id}.html")


def main():
    print("Converting chapters...")
    for title, fid in CHAPTERS:
        # Find the file by matching the title
        filename = title  # The file is named like "第1章 范式演变：从变量到功能层诞生"
        convert_file(filename, fid)
    
    print("\nConverting appendices...")
    for title, fid in APPENDICES:
        filename = title
        convert_file(filename, fid)
    
    print(f"\nDone! {len(CHAPTERS) + len(APPENDICES)} files converted.")


if __name__ == "__main__":
    main()
