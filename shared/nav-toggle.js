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
