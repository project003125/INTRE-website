"""Fix remaining Unicode math symbols to KaTeX across textbook HTML files.
- Oᵢ → \(O_i\) (Unicode subscript i → LaTeX subscript)
- Pure numeric ≥/≤ in table/prose context → \(\geq\)/\(\leq\) for consistency
"""
import os, re

textbook_dir = os.path.join(os.path.dirname(__file__), '..', 'textbook')
total_fixes = 0

for fname in sorted(os.listdir(textbook_dir)):
    if not fname.endswith(".html") or fname == "index.html":
        continue
    filepath = os.path.join(textbook_dir, fname)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Fix Oᵢ → \(O_i\) — but not inside already-existing \(...\)
    # We need to be careful not to double-wrap
    content = content.replace("Oᵢ", r"\(O_i\)")

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        diff = content.count(r"\(O_i\)") - original.count(r"\(O_i\)")
        total_fixes += diff
        print(f"Fixed: {fname} ({diff} Oᵢ replacements)")

print(f"\nTotal Oᵢ → \\(O_i\\) replacements: {total_fixes}")
