#!/usr/bin/env python3
"""Add cache-busting version to textbook.css link in all chapter/appendix pages."""
import os
import glob

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"

html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Add cache busting to textbook.css link
    if 'textbook.css' in content and 'textbook.css?v=' not in content:
        content = content.replace('href="textbook.css"', 'href="textbook.css?v=3"')
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [OK] {os.path.basename(filepath)}")
    else:
        print(f"  [---] {os.path.basename(filepath)}")

print("Done.")
