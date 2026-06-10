#!/usr/bin/env python3
"""
Fix LaTeX delimiters in textbook HTML files.
KaTeX auto-render expects \\( \\) for inline math and \\[ \\] for display math,
but the HTML files have single backslashes \( \) and \[ \].
"""
import os
import re
from pathlib import Path

TEXTBOOK_DIR = Path(__file__).resolve().parent.parent / "textbook"

def fix_latex_delimiters(content: str) -> tuple[str, int]:
    """
    Fix LaTeX delimiters in HTML content.
    Returns (fixed_content, count_of_changes)
    """
    changes = 0
    
    # Split by script tags to avoid modifying JS code
    # The JS code has \\\\ which is correct for JS string literals
    parts = re.split(r'(<script[^>]*>.*?</script>)', content, flags=re.DOTALL)
    
    for i, part in enumerate(parts):
        if part.startswith('<script'):
            continue  # Don't modify script content
        
        # Count changes before
        before = part
        
        # Replace \( with \\( and \) with \\)
        # But only for math delimiters
        # We need to find \( ... \) pairs and escape them
        
        # Pattern: \( followed by content until \)
        # Use regex to find and replace
        # Match \(...\) where ... doesn't contain \( or \) except as pairs
        
        # Simple approach: just replace \( → \\( and \) → \\)
        # This is safe because \( and \) are LaTeX delimiters
        
        # Replace \( → \\(
        part = part.replace(r'\(', r'\\(')
        # Replace \) → \\)
        part = part.replace(r'\)', r'\\)')
        # Replace \[ → \\[
        part = part.replace(r'\[', r'\\[')
        # Replace \] → \\]
        part = part.replace(r'\]', r'\\]')
        
        if part != before:
            parts[i] = part
            # Count how many replacements
            changes += part.count(r'\\(') - before.count(r'\\(')
    
    content = ''.join(parts)
    return content, changes


def fix_file(filepath: Path) -> tuple[bool, int]:
    """Fix a single HTML file. Returns (was_fixed, num_changes)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content, changes = fix_latex_delimiters(content)
    
    if changes > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        return True, changes
    return False, 0


def main():
    print("=== Fixing LaTeX delimiters in textbook HTML files ===\n")
    
    html_files = sorted(TEXTBOOK_DIR.glob("ch*.html")) + sorted(TEXTBOOK_DIR.glob("app-*.html"))
    
    fixed_count = 0
    total_changes = 0
    for filepath in html_files:
        was_fixed, changes = fix_file(filepath)
        if was_fixed:
            print(f"  [FIX] {filepath.name} ({changes} delimiters)")
            fixed_count += 1
            total_changes += changes
        else:
            print(f"  [OK]  {filepath.name}")
    
    print(f"\nDone! Fixed {fixed_count} files, {total_changes} delimiters total.")


if __name__ == '__main__':
    main()
