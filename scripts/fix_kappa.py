"""Fix κ ≥/κ≥ patterns to KaTeX inline math across textbook HTML files."""
import os, re

textbook_dir = os.path.join(os.path.dirname(__file__), '..', 'textbook')
fixes = 0

for fname in sorted(os.listdir(textbook_dir)):
    if not fname.endswith(".html") or fname == "index.html":
        continue
    filepath = os.path.join(textbook_dir, fname)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # Fix: κ ≥ 0.60 → \(\kappa \geq 0.60\)
    content = content.replace("κ ≥ 0.60", r"\(\kappa \geq 0.60\)")
    content = content.replace("κ ≥ 0.75", r"\(\kappa \geq 0.75\)")
    content = content.replace("κ ≥ 0.80", r"\(\kappa \geq 0.80\)")
    content = content.replace("κ≥0.60", r"\(\kappa \geq 0.60\)")
    content = content.replace("κ≥0.75", r"\(\kappa \geq 0.75\)")

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        changes = len(original) - len(content)
        fixes += 1
        print(f"Fixed: {fname}")

print(f"\nTotal files fixed: {fixes}")
