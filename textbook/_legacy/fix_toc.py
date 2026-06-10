#!/usr/bin/env python3
"""Fix TOC to use H3 instead of H2 headings."""
import os
import glob

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"

old_js = "var headings = document.querySelectorAll('.textbook-content h2');"
new_js = "var headings = document.querySelectorAll('.textbook-content h3');"

html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

count = 0
for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    if old_js in content:
        content = content.replace(old_js, new_js)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [FIX] {os.path.basename(filepath)}")
        count += 1
    else:
        print(f"  [SKIP] {os.path.basename(filepath)}")

print(f"\nFixed {count} files.")
