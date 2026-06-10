# Legacy Scripts

These scripts were used incrementally during development to add features to the textbook HTML pages (TOC, KaTeX, bug fixes, etc.).

They have been **superseded** by `../scripts/sync_chapters.py`, which generates complete HTML pages from vault Markdown sources in a single pass with all features included.

## Superseded Scripts

| Script | Purpose | Superseded By |
|--------|---------|---------------|
| `convert.py` | MD→HTML conversion (old) | `sync_chapters.py` |
| `add_toc.py` | Add sidebar TOC to pages | `sync_chapters.py` (built-in) |
| `add_katex.py` | Add KaTeX math rendering | `sync_chapters.py` (built-in) |
| `fix_all_bugs.py` | Fix TOC JS and check HTML structure | `sync_chapters.py` (built-in) |
| `fix_toc.py` | Change TOC from H2 to H3 | `sync_chapters.py` (built-in) |
| `cache_bust.py` | Add cache-busting to CSS link | `sync_chapters.py` (built-in) |
| `update_toc_mobile.py` | Update TOC for mobile | `sync_chapters.py` (built-in) |
| `check_katex.py` | Debug: check KaTeX config | One-off debug tool |
| `check_delimiters.py` | Debug: count LaTeX delimiters | One-off debug tool |

## Current Workflow

```bash
# From -website/ directory:
python scripts/sync_chapters.py              # Sync all chapters
python scripts/sync_chapters.py --dry-run    # Preview only
python scripts/sync_chapters.py ch01         # Sync single chapter
```
