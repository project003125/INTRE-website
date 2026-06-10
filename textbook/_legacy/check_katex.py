#!/usr/bin/env python3
"""Check actual KaTeX auto-render config in HTML."""
with open("C:/Users/Administrator/Documents/INTRE/-website/textbook/ch08.html", "r", encoding="utf-8") as f:
    content = f.read()

idx = content.find("renderMathInElement")
if idx >= 0:
    snippet = content[idx:idx+200]
    print(repr(snippet))
    print("---raw---")
    print(snippet)
