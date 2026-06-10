#!/usr/bin/env python3
"""Replace TOC CSS in all textbook pages with the new mobile-friendly version."""
import os
import glob

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"

with open(os.path.join(TEXTBOOK_DIR, "add_toc.py"), "r", encoding="utf-8") as f:
    add_toc_content = f.read()

# Extract the CSS block from add_toc.py
css_marker = "TOC_CSS = \"\"\""
css_start = add_toc_content.find(css_marker)
if css_start < 0:
    print("ERROR: Could not find TOC_CSS in add_toc.py")
    exit(1)

css_start += len(css_marker)
css_end = add_toc_content.find("\"\"\"", css_start)
new_css = add_toc_content[css_start:css_end].strip()

# Also extract the new JS
js_marker = "TOC_JS = \"\"\""
js_start = add_toc_content.find(js_marker)
js_start += len(js_marker)
js_end = add_toc_content.find("\"\"\"", js_start)
new_js = add_toc_content[js_start:js_end].strip()

# Also extract new HTML
html_marker = "TOC_HTML = \"\"\""
html_start = add_toc_content.find(html_marker)
html_start += len(html_marker)
html_end = add_toc_content.find("\"\"\"", html_start)
new_html = add_toc_content[html_start:html_end].strip()

html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

old_css_marker = "/* ========== SIDEBAR TOC ========== */"
old_js_marker = "// Build TOC from H3 headings"

count = 0
for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    changed = False
    
    # Replace CSS: find the old block and replace with new one
    if old_css_marker in content:
        css_start_idx = content.find(old_css_marker)
        # Find the end of this CSS block (next similar comment or </style>)
        css_end_marker = "/* ========== CARD GRID"
        css_end_idx = content.find(css_end_marker, css_start_idx)
        if css_end_idx < 0:
            css_end_idx = content.find("/* ========== RESET", css_start_idx)
        if css_end_idx < 0:
            css_end_idx = content.find("</style>", css_start_idx)
        
        if css_end_idx > css_start_idx:
            # Replace everything from the CSS start to the next section/</style>
            content = content[:css_start_idx] + new_css + "\n\n" + content[css_end_idx:]
            changed = True
        else:
            print(f"  [WARN] {os.path.basename(filepath)} - could not find CSS end")
    else:
        print(f"  [WARN] {os.path.basename(filepath)} - no old CSS marker")
    
    # Replace JS if needed
    if old_js_marker in content:
        js_start_idx = content.find(old_js_marker)
        # Find the enclosing <script> block
        script_start = content.rfind("<script", 0, js_start_idx)
        script_end = content.find("</script>", js_start_idx)
        if script_start >= 0 and script_end >= 0:
            content = content[:script_start] + "\n" + new_js + "\n" + content[script_end + 9:]
            changed = True
    
    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [OK]  {os.path.basename(filepath)}")
        count += 1
    else:
        print(f"  [--]  {os.path.basename(filepath)} (no changes)")

print(f"\nUpdated {count} files.")
