// ------------------------------------------------------------------
// 夜间模式开关（2026-11-01）
// 开关位：html[data-theme="light"|"dark"]；视觉规则在 components.css 末段。
// 默认跟随系统；用户点选后写入 localStorage（intre-theme）覆盖系统。
// ------------------------------------------------------------------
(function() {
    'use strict';
    var KEY = 'intre-theme';
    var root = document.documentElement;

    function stored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function apply(mode) {
        root.setAttribute('data-theme', mode);
    }
    function syncButton(btn) {
        var dark = root.getAttribute('data-theme') === 'dark';
        btn.textContent = dark ? '☀' : '☾';
        btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
        btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到夜间模式');
        btn.title = dark ? '浅色模式' : '夜间模式';
    }

    var initial = stored();
    if (!initial) {
        initial = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    apply(initial);

    document.addEventListener('DOMContentLoaded', function() {
        var nav = document.querySelector('nav.site-nav .nav-container') ||
                  document.querySelector('.nav-container');
        if (!nav) return;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        syncButton(btn);

        btn.addEventListener('click', function() {
            var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            apply(next);
            try { localStorage.setItem(KEY, next); } catch (e) {}
            syncButton(btn);
        });

        var links = nav.querySelector('.nav-links');
        if (links) {
            nav.insertBefore(btn, links);
        } else {
            nav.appendChild(btn);
        }

        // 未手动选择时，跟随系统切换
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (mq.addEventListener) {
            mq.addEventListener('change', function(e) {
                if (stored()) return;
                apply(e.matches ? 'dark' : 'light');
                syncButton(btn);
            });
        }
    });
})();

// Shared navigation toggle script (M4)
// Replaces inline onclick handlers with accessible JS
// v2.4.3 — 断点回退 768px（P2-6a 修正：959px 导致平板横排导航折叠为汉堡菜单）
(function() {
    var MOBILE_MQ = '(max-width: 768px)';
    function isMobile() {
        return window.matchMedia(MOBILE_MQ).matches;
    }

    function setMenuState(menu, button, isOpen) {
        menu.classList.toggle('open', isOpen);
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        // 仅移动端管理 aria-hidden；桌面端导航恒可见，不设此属性
        if (isMobile()) {
            menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        } else {
            menu.removeAttribute('aria-hidden');
        }
    }

    function getMenuItems(menu) {
        return Array.from(menu.querySelectorAll('a'));
    }

    function trapFocus(event, menu) {
        if (event.key !== 'Tab') return;
        var items = getMenuItems(menu);
        if (items.length === 0) return;

        var first = items[0];
        var last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        var toggles = document.querySelectorAll('.nav-toggle');
        toggles.forEach(function(button) {
            var menuId = button.getAttribute('aria-controls') || 'nav-menu';
            var menu = document.getElementById(menuId);
            if (!menu) return;

            // 不再设 role="menu" / role="menuitem"：
            // 导航链接使用原生 <nav> + <a> 语义即可，menu 角色要求方向键焦点协议

            // 初始化 aria-hidden：仅移动端
            setMenuState(menu, button, menu.classList.contains('open'));

            button.addEventListener('click', function(event) {
                event.stopPropagation();
                var opening = !menu.classList.contains('open');
                setMenuState(menu, button, opening);
                if (opening && isMobile()) {
                    var items = getMenuItems(menu);
                    if (items.length > 0) items[0].focus();
                }
            });

            menu.addEventListener('click', function(event) {
                if (event.target && event.target.closest('a')) {
                    setMenuState(menu, button, false);
                }
            });

            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && menu.classList.contains('open')) {
                    setMenuState(menu, button, false);
                    button.focus();
                }
                if (menu.classList.contains('open')) {
                    trapFocus(event, menu);
                }
            });

            document.addEventListener('click', function(event) {
                if (!menu.classList.contains('open')) return;
                if (menu.contains(event.target) || button.contains(event.target)) return;
                setMenuState(menu, button, false);
            });
        });

        // 视口切换时清理：从移动端切到桌面端，移除 aria-hidden
        window.matchMedia(MOBILE_MQ).addEventListener('change', function() {
            if (!isMobile()) {
                toggles.forEach(function(button) {
                    var menuId = button.getAttribute('aria-controls') || 'nav-menu';
                    var menu = document.getElementById(menuId);
                    if (menu) {
                        menu.removeAttribute('aria-hidden');
                        menu.classList.remove('open');
                        button.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    });
})();

// ------------------------------------------------------------------
// v2.5 顶部阅读进度条（rAF 节流；纯装饰性读数，无障碍中性）
// 样式在 shared/components.css 的 .scroll-progress；无 JS 时不渲染。
// ------------------------------------------------------------------
(function() {
    'use strict';
    if (!document.body) return;
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
        ticking = false;
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', function() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

// ------------------------------------------------------------------
// v2.5.1 移动端表格滑动提示：仅当 .table-responsive 实际横向溢出时
// 标注 .is-scrollable（配合 components.css 的条件显示），resize 时复扫。
// ------------------------------------------------------------------
(function() {
    'use strict';
    function scan() {
        var els = document.querySelectorAll('.table-responsive');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var scrollable = el.scrollWidth - el.clientWidth > 4;
            el.classList.toggle('is-scrollable', scrollable);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scan);
    } else {
        scan();
    }
    window.addEventListener('resize', scan);
})();
