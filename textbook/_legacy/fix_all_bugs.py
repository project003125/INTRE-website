#!/usr/bin/env python3
"""Systematically fix all known bugs across the website."""
import os
import glob

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"
WEBSITE_DIR = r"C:\Users\Administrator\Documents\INTRE\-website"

# ====== FIX 1: Rewrite the TOC JS to be simpler and more reliable ======
# The issue: close button not working, overlay not dismissing
# Root cause: possible element reference issues in the old script

new_toc_js = """
<script>
(function() {
    var sidebar = document.getElementById('tocSidebar');
    var toggleBtn = document.getElementById('tocToggleBtn');
    var closeBtn = document.getElementById('tocCloseBtn');
    var overlay = document.getElementById('tocOverlay');
    var list = document.getElementById('tocSidebarList');
    
    if (!sidebar) return;
    
    // Build TOC from H3 headings
    var headings = document.querySelectorAll('.textbook-content h3');
    headings.forEach(function(h, i) {
        var id = 's' + i;
        h.id = id;
        var link = document.createElement('a');
        link.href = '#' + id;
        link.className = 'toc-item';
        link.textContent = h.textContent;
        link.onclick = function(e) {
            e.preventDefault();
            document.getElementById(id).scrollIntoView({behavior:'smooth'});
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        };
        list.appendChild(link);
    });
    
    function open() { sidebar.classList.add('open'); if (overlay) overlay.classList.add('show'); }
    function close() { sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }
    
    if (toggleBtn) toggleBtn.onclick = open;
    if (closeBtn) closeBtn.onclick = close;
    if (overlay) overlay.onclick = close;
    
    // Highlight active section
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                list.querySelectorAll('.toc-item').forEach(function(el) { el.classList.remove('active'); });
                var active = list.querySelector('.toc-item[href="#' + entry.target.id + '"]');
                if (active) active.classList.add('active');
            }
        });
    }, {rootMargin: '-80px 0px -60% 0px'});
    headings.forEach(function(h) { observer.observe(h); });
})();
</script>
"""

# Fix all textbook chapter and appendix files
html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

count = 0
for filepath in sorted(html_files):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    changed = False
    
    # Find and replace the old TOC JS
    old_script_start = "// Build TOC from H2 headings"
    old_script_start2 = "// Build TOC from H3 headings"
    
    for marker in [old_script_start, old_script_start2]:
        js_idx = content.find(marker)
        if js_idx > 0:
            # Find the <script> block
            script_start = content.rfind("<script", 0, js_idx)
            script_end = content.find("</script>", js_idx)
            if script_start >= 0 and script_end >= 0:
                content = content[:script_start] + new_toc_js + content[script_end + 9:]
                changed = True
                break
    
    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  [FIX JS] {os.path.basename(filepath)}")
        count += 1
    else:
        # Check if there's any TOC JS at all
        if 'tocSidebarList' in content and 'getElementById' not in content[content.find('tocSidebarList'):content.find('tocSidebarList')+500]:
            # Add JS at the end if missing
            body_end = content.find("</body>")
            if body_end > 0:
                content = content[:body_end] + "\n" + new_toc_js + "\n" + content[body_end:]
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"  [ADD JS] {os.path.basename(filepath)}")
                count += 1
            else:
                print(f"  [SKIP] {os.path.basename(filepath)}")
        else:
            print(f"  [OK] {os.path.basename(filepath)} (no change needed)")

print(f"\nFixed JS in {count} files.")

# ====== FIX 2: Check all main HTML files for broken structure ======
print("\n=== Systematic bug check ===")

# Check all top-level HTML files
for f in glob.glob(os.path.join(WEBSITE_DIR, "*.html")):
    name = os.path.basename(f)
    with open(f, "r", encoding="utf-8") as fp:
        content = fp.read()
    
    issues = []
    
    # Check HTML structure
    if "<!DOCTYPE html>" not in content:
        issues.append("Missing DOCTYPE")
    if "<html" not in content:
        issues.append("Missing <html>")
    if "</html>" not in content:
        issues.append("Missing </html>")
    if "<head>" not in content:
        issues.append("Missing <head>")
    if "</head>" not in content:
        issues.append("Missing </head>")
    if "<body" not in content:
        issues.append("Missing <body>")
    if "</body>" not in content:
        issues.append("Missing </body>")
    if 'lang="zh-CN"' not in content and 'lang="en"' not in content:
        issues.append("Missing lang attribute")
    if 'charset="UTF-8"' not in content and 'charset=utf-8' not in content.lower():
        issues.append("Missing charset")
    if "viewport" not in content:
        issues.append("Missing viewport meta")
    
    # Check for broken links (common patterns)
    if 'href="//' in content or 'src="//' in content:
        issues.append("Protocol-relative URL (//) found")
    
    if issues:
        print(f"  [{name}] ISSUES: {', '.join(issues)}")
    else:
        print(f"  [{name}] OK")

print("\n=== Bug check complete ===")
