#!/usr/bin/env python3
"""Add KaTeX to all textbook HTML pages."""
import os
import glob

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"
KATEX_CSS = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous">'
KATEX_JS = '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script>'
KATEX_AUTO = '<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMathInElement(document.body,{delimiters:[{left:\'$$\',right:\'$$\',display:true},{left:\'\\\\[\',right:\'\\\\]\',display:true},{left:\'\\\\(\',right:\'\\\\)\',display:false}]});"></script>'

html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

count = 0
for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Skip if already has KaTeX
    if "katex.min.css" in content:
        print(f"  [SKIP] {os.path.basename(filepath)} (already has KaTeX)")
        continue
    
    # Add KaTeX CSS after the last <link> tag in <head>
    head_end = content.find("</head>")
    if head_end == -1:
        print(f"  [ERR]  {os.path.basename(filepath)} - no </head>")
        continue
    
    # Find the last <link> tag before </head>
    insert_point = head_end
    
    # Insert KaTeX CSS before </head>
    css_insert = f"\n    {KATEX_CSS}\n"
    content = content[:insert_point] + css_insert + content[insert_point:]
    
    # Adjust head_end since we inserted text
    head_end += len(css_insert)
    
    # Insert KaTeX JS before </body> or before </html>
    body_end = content.find("</body>")
    if body_end == -1:
        body_end = content.find("</html>")
    
    js_block = f"\n    {KATEX_JS}\n    {KATEX_AUTO}\n"
    content = content[:body_end] + js_block + content[body_end:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"  [OK]  {os.path.basename(filepath)}")
    count += 1

print(f"\nDone! {count} files updated with KaTeX.")
