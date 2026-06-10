#!/usr/bin/env python3
"""Check LaTeX delimiters in a textbook HTML file."""
with open("C:/Users/Administrator/Documents/INTRE/-website/textbook/ch18.html", "r", encoding="utf-8") as f:
    content = f.read()

# Find display math ($$)
idx = content.find("$$")
if idx >= 0:
    print(f"FOUND $$ at {idx}: {repr(content[idx:idx+60])}")

# Find inline math (\()
idx = content.find("\\(")
if idx >= 0:
    print(f"FOUND \\( at {idx}: {repr(content[idx:idx+60])}")

# Find display math (\[)
idx = content.find("\\[")
if idx >= 0:
    print(f"FOUND \\[ at {idx}: {repr(content[idx:idx+60])}")

# Count occurrences
print(f"\n$$ count: {content.count('$$')}")
print(f"\\( count: {content.count('\\(')}")
print(f"\\[ count: {content.count('\\[')}")
print(f"\\\\( count: {content.count('\\\\(')}")
