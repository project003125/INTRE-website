#!/usr/bin/env python3
"""Add sticky sidebar Table of Contents to all textbook pages."""
import os
import glob
import re

TEXTBOOK_DIR = r"C:\Users\Administrator\Documents\INTRE\-website\textbook"

TOC_HTML = """    <!-- 侧边栏目录 -->
    <nav class="toc-sidebar" id="tocSidebar">
        <div class="toc-sidebar-header">
            <span class="toc-sidebar-title">目录</span>
            <button class="toc-close-btn" id="tocCloseBtn" aria-label="关闭目录">&times;</button>
        </div>
        <div class="toc-sidebar-list" id="tocSidebarList"></div>
    </nav>

    <!-- 移动端目录切换按钮 -->
    <button class="toc-toggle-btn" id="tocToggleBtn" aria-label="打开目录">
        <i class="fas fa-list"></i> 目录
    </button>

    <!-- 遮罩层 -->
    <div class="toc-overlay" id="tocOverlay"></div>
"""

TOC_JS = """
<script>
(function() {
    // Build TOC from H3 headings (section titles like "1.1 历史溯源")
    var tocList = document.getElementById('tocSidebarList');
    var headings = document.querySelectorAll('.textbook-content h3');
    var items = [];
    
    headings.forEach(function(h, i) {
        var text = h.textContent.trim();
        // Create anchor ID from text
        var id = 'section-' + i;
        h.id = id;
        items.push({id: id, text: text});
        
        var link = document.createElement('a');
        link.href = '#' + id;
        link.className = 'toc-item';
        link.textContent = text;
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById(this.getAttribute('href').substring(1)).scrollIntoView({behavior: 'smooth'});
            // Close sidebar on mobile
            document.getElementById('tocSidebar').classList.remove('open');
            document.getElementById('tocOverlay').classList.remove('show');
        });
        tocList.appendChild(link);
    });
    
    // Toggle sidebar
    var toggleBtn = document.getElementById('tocToggleBtn');
    var sidebar = document.getElementById('tocSidebar');
    var overlay = document.getElementById('tocOverlay');
    var closeBtn = document.getElementById('tocCloseBtn');
    
    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    }
    
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }
    
    if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
    
    // Highlight active section on scroll
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                document.querySelectorAll('.toc-item').forEach(function(el) {
                    el.classList.remove('active');
                });
                var activeLink = document.querySelector('.toc-item[href="#' + entry.target.id + '"]');
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, {rootMargin: '-80px 0px -60% 0px'});
    
    headings.forEach(function(h) {
        observer.observe(h);
    });
})();
</script>
"""

TOC_CSS = """
/* ========== SIDEBAR TOC ========== */
.toc-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 260px;
    height: 100vh;
    background: var(--bg);
    border-right: 1px solid var(--border-light);
    padding: 5rem 0 2rem;
    overflow-y: auto;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toc-sidebar.open {
    transform: translateX(0);
}

.toc-sidebar-header {
    display: none;
    padding: 1rem 1.2rem 0.5rem;
    justify-content: space-between;
    align-items: center;
}

.toc-sidebar-title {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text);
}

.toc-close-btn {
    background: none;
    border: none;
    font-size: 1.4rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.2rem;
    line-height: 1;
}

.toc-close-btn:hover {
    color: var(--text);
}

.toc-sidebar-list {
    padding: 0.5rem 0;
}

.toc-item {
    display: block;
    padding: 0.4rem 1.2rem 0.4rem 1.2rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    text-decoration: none;
    line-height: 1.5;
    border-left: 2px solid transparent;
    transition: all 0.15s ease;
}

.toc-item:hover {
    color: var(--accent);
    background: var(--bg-secondary);
}

.toc-item.active {
    color: var(--accent);
    border-left-color: var(--accent);
    font-weight: 500;
}

/* Toggle button - prominent bottom bar on mobile */
.toc-toggle-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 45;
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.85rem 1.2rem;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    box-shadow: 0 -4px 16px rgba(22,58,95,0.12);
    transition: all 0.2s ease;
}

.toc-toggle-btn:active {
    background: var(--navy-light);
}

.toc-toggle-btn i {
    font-size: 1rem;
}

/* Bottom sheet overlay */
.toc-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 49;
}

.toc-overlay.show {
    display: block;
}

/* Bottom sheet panel (mobile) */
.toc-sidebar {
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 55vh;
    border-right: none;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    padding: 0.5rem 0 1.5rem;
    transform: translateY(100%);
    box-shadow: 0 -8px 30px rgba(0,0,0,0.12);
}

.toc-sidebar.open {
    transform: translateY(0);
}

/* Drag handle */
.toc-sidebar::before {
    content: '';
    display: block;
    width: 36px;
    height: 4px;
    background: var(--border);
    border-radius: 4px;
    margin: 0.6rem auto 0.4rem;
}

.toc-sidebar-header {
    display: flex;
    padding: 0.4rem 1.2rem 0.3rem;
}

.toc-sidebar-title {
    font-size: 0.95rem;
}

.toc-close-btn {
    font-size: 1.5rem;
}

.toc-sidebar-list {
    padding: 0.2rem 0;
}

.toc-item {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    line-height: 1.5;
    border-left-width: 3px;
}

.toc-close-btn {
    display: block;
}

/* Desktop: show sidebar by default */
@media (min-width: 1400px) {
    .toc-sidebar {
        top: 0;
        left: 0;
        width: 260px;
        height: 100vh;
        max-height: none;
        border-right: 1px solid var(--border-light);
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        padding: 5rem 0 2rem;
        transform: translateX(-100%);
        box-shadow: none;
    }

    .toc-sidebar::before {
        display: none;
    }

    .toc-sidebar.open {
        transform: translateX(0);
    }

    .toc-toggle-btn {
        display: none;
    }

    .toc-sidebar-header {
        display: none;
    }

    .toc-item {
        padding: 0.4rem 1.2rem;
        font-size: 0.8rem;
        border-left-width: 2px;
    }

    .textbook-content,
    .page-footer-nav,
    .page-header-inner {
        margin-left: 130px;
    }
}

@media (max-width: 1399px) {
    .toc-toggle-btn {
        display: flex;
    }
    .toc-sidebar-header {
        display: flex;
    }
}

@media (min-width: 769px) and (max-width: 1399px) {
    /* Tablet: keep bottom sheet but make items nicer */
    .toc-sidebar {
        max-height: 45vh;
    }
}
"""

def add_toc_to_page(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Force replace existing TOC by removing old markers first
    for marker in ['toc-sidebar', 'toc-toggle-btn', 'toc-overlay']:
        while marker in content:
            # Find the block containing this marker and remove it
            idx = content.find(marker)
            if idx < 0:
                break
            # Find containing element boundaries - remove from containing tag start to tag end
            start = content.rfind('<', 0, idx)
            if start < 0:
                start = idx
            end = content.find('>', idx)
            if end < 0:
                end = idx + len(marker)
            # Try to find the full block
            block_start = max(0, start - 1)
            content = content[:block_start] + content[end+1:]
    
    # Remove old TOC JS
    js_marker = '// Build TOC from H3 headings'
    js_idx = content.find(js_marker)
    if js_idx > 0:
        # Find the <script> block containing this
        script_start = content.rfind('<script', 0, js_idx)
        script_end = content.find('</script>', js_idx)
        if script_start >= 0 and script_end >= 0:
            content = content[:script_start] + content[script_end + 9:]
    
    # Remove old TOC CSS
    css_marker = 'SIDEBAR TOC'
    css_idx = content.find(css_marker)
    if css_idx > 0:
        # Find from before this comment to before the next </style> rule
        comment_start = content.rfind('/*', 0, css_idx)
        # Find the next style closing or css comment
        next_comment = content.find('/* ==========', css_idx + 10)
        if next_comment < 0:
            next_comment = content.find('</style>', css_idx)
        if comment_start >= 0 and next_comment >= 0:
            content = content[:comment_start] + content[next_comment:]
    
    # Add TOC CSS before closing </style>
    style_end = content.rfind("</style>")
    if style_end > 0:
        content = content[:style_end] + TOC_CSS + "\n" + content[style_end:]
    
    # Add TOC HTML after <body> tag (before nav)
    body_tag = content.find("<body>")
    if body_tag > 0:
        nav_start = content.find("<nav", body_tag)
        if nav_start > 0:
            content = content[:nav_start] + "\n" + TOC_HTML + "\n" + content[nav_start:]
    
    # Add TOC JS before </body>
    body_end = content.find("</body>")
    if body_end > 0:
        content = content[:body_end] + "\n" + TOC_JS + "\n" + content[body_end:]
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    
    return True


html_files = glob.glob(os.path.join(TEXTBOOK_DIR, "ch*.html")) + glob.glob(os.path.join(TEXTBOOK_DIR, "app*.html"))

count = 0
for filepath in sorted(html_files):
    if add_toc_to_page(filepath):
        print(f"  [OK]  {os.path.basename(filepath)}")
        count += 1
    else:
        print(f"  [SKIP] {os.path.basename(filepath)} (already has TOC)")

print(f"\nDone! {count} files updated with sidebar TOC.")
