/**
 * INTRE Textbook Sidebar Navigation Component
 * Provides: left chapter sidebar, mobile drawer, breadcrumb
 * Depends on: brand.css design tokens
 */
(function () {
  'use strict';

  /* ================================================================
     Chapter Data
     [section, filename, shortTitle]
     ================================================================ */
  var CHAPTERS = [
    ['上篇 导论', 'ch01.html', '1 范式演变'],
    ['上篇 导论', 'ch02.html', '2 层次定位'],
    ['上篇 导论', 'ch03.html', '3 框架总览'],
    ['上篇 导论', 'ch04.html', '4 范式批判'],
    ['上篇 导论', 'ch05.html', '5 架构推导'],
    ['上篇 导论', 'ch06.html', '6 状态维度'],
    ['上篇 导论', 'ch07.html', '7 功能模块'],
    ['上篇 导论', 'ch08.html', '8 状态向量'],
    ['上篇 导论', 'ch09.html', '9 测量方法'],
    ['中篇 PSE六论', 'ch10.html', '10 原子操作'],
    ['中篇 PSE六论', 'ch11.html', '11 干预序列'],
    ['中篇 PSE六论', 'ch12.html', '12 流派分解'],
    ['中篇 PSE六论', 'ch13.html', '13 流派生成'],
    ['中篇 PSE六论', 'ch14.html', '14 概念标识'],
    ['中篇 PSE六论', 'ch15.html', '15 语义架构'],
    ['中篇 PSE六论', 'ch16.html', '16 共识工程'],
    ['中篇 PSE六论', 'ch17.html', '17 逻辑指纹'],
    ['中篇 PSE六论', 'ch18.html', '18 PSE架构'],
    ['下篇 应用', 'ch19.html', '19 系统动力学'],
    ['下篇 应用', 'ch20.html', '20 仿真校准'],
    ['下篇 应用', 'ch21.html', '21 临床案例'],
    ['下篇 应用', 'ch22.html', '22 神经对接'],
    ['下篇 应用', 'ch23.html', '23 双向约束'],
    ['下篇 应用', 'ch24.html', '24 边界修订'],
    ['下篇 应用', 'ch25.html', '25 REVER'],
    ['下篇 应用', 'ch26.html', '26 心理AI'],
    ['下篇 应用', 'ch27.html', '27 跨学科接口'],
    ['下篇 应用', 'ch28.html', '28 研究方法'],
    ['下篇 应用', 'ch29.html', '29 未来方向'],
    ['附录', 'app-a.html', 'A 42子维度'],
    ['附录', 'app-b.html', 'B GMAR速查'],
    ['附录', 'app-c.html', 'C PSE入门'],
    ['附录', 'app-d.html', 'D REVER审计'],
    ['附录', 'app-e.html', 'E 流派映射'],
    ['附录', 'app-f.html', 'F 逻辑指纹'],
    ['附录', 'app-g.html', 'G 术语对照'],
    ['附录', 'app-h.html', 'H 形式审查'],
    ['附录', 'app-i.html', 'I 家教案例'],
    ['附录', 'app-j.html', 'J PCUI规范'],
    ['附录', 'app-k.html', 'K PSA依赖'],
    ['附录', 'app-l.html', 'L 架构速查'],
    ['附录', 'app-m.html', 'M 数学速成'],
    ['附录', 'app-n.html', 'N 概念速查']
  ];

  /* ================================================================
     Helpers
     ================================================================ */
  function getCurrentPage() {
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'ch01.html';
    return file.split('?')[0]; // strip query string
  }

  function findChapter(file) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i][1] === file) return CHAPTERS[i];
    }
    return null;
  }

  /* ================================================================
     Auto-hide button on scroll
     Hides button when scrolling down, shows when scrolling up.
     ================================================================ */
  function autoHideOnScroll(btn) {
    if (!btn) return;
    var lastScrollY = 0;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var currentY = window.pageYOffset || document.documentElement.scrollTop;
        if (currentY > 400) {
          if (currentY > lastScrollY + 10) {
            btn.classList.add('btn-hidden');
          } else if (currentY < lastScrollY - 10) {
            btn.classList.remove('btn-hidden');
          }
        } else {
          btn.classList.remove('btn-hidden');
        }
        lastScrollY = currentY;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ================================================================
     Desktop Sidebar (left, chapter navigation)
     Fixed position, 240px, always visible on wide screens.
     Collapses to icon on tablets (< 1200px).
     ================================================================ */
  function buildChapterSidebar() {
    var currentPage = getCurrentPage();

    var nav = document.createElement('nav');
    nav.className = 'textbook-sidebar';
    nav.id = 'chapterNav';
    nav.setAttribute('aria-label', '章节目录');

    var list = document.createElement('div');
    list.className = 'chapter-nav-list';
    list.setAttribute('role', 'list');

    var lastSection = '';
    CHAPTERS.forEach(function (ch) {
      // Section header
      if (ch[0] !== lastSection) {
        lastSection = ch[0];
        var sec = document.createElement('div');
        sec.className = 'chapter-nav-section';
        sec.setAttribute('role', 'presentation');
        sec.textContent = lastSection;
        list.appendChild(sec);
      }

      // Chapter link
      var a = document.createElement('a');
      a.className = 'chapter-nav-link';
      a.setAttribute('role', 'listitem');
      if (ch[1] === currentPage) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      a.href = ch[1];
      a.textContent = ch[2];
      list.appendChild(a);
    });

    nav.appendChild(list);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ================================================================
     Mobile Drawer (bottom sheet)
     Floating action button (bottom-right) to open.
     Bottom sheet with chapter list.
     Closes on selection or outside click.
     ================================================================ */
  function buildMobileDrawer() {
    var currentPage = getCurrentPage();

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'textbook-sidebar-overlay';
    overlay.id = 'sidebarOverlay';

    // Drawer
    var drawer = document.createElement('nav');
    drawer.className = 'textbook-sidebar-drawer';
    drawer.id = 'sidebarDrawer';
    drawer.setAttribute('aria-label', '章节目录');

    // Drag handle
    var handle = document.createElement('div');
    handle.className = 'textbook-sidebar-handle';
    drawer.appendChild(handle);

    // Header
    var header = document.createElement('div');
    header.className = 'textbook-sidebar-drawer-header';
    var title = document.createElement('span');
    title.className = 'textbook-sidebar-drawer-title';
    title.textContent = '章节目录';
    var closeBtn = document.createElement('button');
    closeBtn.className = 'textbook-sidebar-close';
    closeBtn.setAttribute('aria-label', '关闭目录');
    closeBtn.innerHTML = '&times;';
    header.appendChild(title);
    header.appendChild(closeBtn);
    drawer.appendChild(header);

    // Chapter list
    var list = document.createElement('div');
    list.className = 'textbook-sidebar-drawer-list';

    var lastSection = '';
    CHAPTERS.forEach(function (ch) {
      if (ch[0] !== lastSection) {
        lastSection = ch[0];
        var sec = document.createElement('div');
        sec.className = 'textbook-sidebar-drawer-section';
        sec.textContent = lastSection;
        list.appendChild(sec);
      }

      var a = document.createElement('a');
      a.className = 'textbook-sidebar-drawer-link';
      if (ch[1] === currentPage) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      a.href = ch[1];
      a.textContent = ch[2];
      a.addEventListener('click', closeDrawer);
      list.appendChild(a);
    });

    drawer.appendChild(list);

    // FAB toggle button
    var fab = document.createElement('button');
    fab.className = 'textbook-sidebar-toggle';
    fab.id = 'sidebarToggle';
    fab.setAttribute('aria-label', '打开章节目录');
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'sidebarDrawer');
    fab.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4" width="14" height="1.5" rx="0.75" fill="currentColor"/><rect x="3" y="9.25" width="14" height="1.5" rx="0.75" fill="currentColor"/><rect x="3" y="14.5" width="14" height="1.5" rx="0.75" fill="currentColor"/></svg>';

    // Append to body
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    document.body.appendChild(fab);

    // Event handlers
    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('show');
      fab.setAttribute('aria-expanded', 'true');
      document.body.classList.add('sidebar-open');

      // Scroll active link into view
      var activeLink = drawer.querySelector('.textbook-sidebar-drawer-link.active');
      if (activeLink) {
        activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
      fab.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sidebar-open');
    }

    fab.addEventListener('click', function () {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Keyboard: Escape to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
        fab.focus();
      }
    });

    // Auto-hide FAB on scroll
    autoHideOnScroll(fab);
  }

  /* ================================================================
     Breadcrumb Navigation
     Adds breadcrumb at top of chapter pages: 教材 > 第N章 标题
     ================================================================ */
  function buildBreadcrumb() {
    var currentPage = getCurrentPage();
    var chapter = findChapter(currentPage);
    if (!chapter) return;

    // Extract chapter number and title from shortTitle like "1 范式演变"
    var parts = chapter[2].split(' ');
    var num = parts[0];
    var title = parts.slice(1).join(' ');

    // Determine prefix: chapters use "第N章", appendices use the letter
    var isAppendix = currentPage.startsWith('app-');
    var chapterLabel = isAppendix ? '附录 ' + num : '第' + num + '章';

    var nav = document.createElement('nav');
    nav.className = 'breadcrumb';
    nav.setAttribute('aria-label', '面包屑导航');

    var ol = document.createElement('ol');
    ol.className = 'breadcrumb-list';

    // Home
    var liHome = document.createElement('li');
    liHome.className = 'breadcrumb-item';
    var aHome = document.createElement('a');
    aHome.href = '../';
    aHome.textContent = '首页';
    liHome.appendChild(aHome);
    ol.appendChild(liHome);

    // Textbook
    var liTextbook = document.createElement('li');
    liTextbook.className = 'breadcrumb-item';
    var aTextbook = document.createElement('a');
    aTextbook.href = 'index.html';
    aTextbook.textContent = '教材';
    liTextbook.appendChild(aTextbook);
    ol.appendChild(liTextbook);

    // Current chapter
    var liCurrent = document.createElement('li');
    liCurrent.className = 'breadcrumb-item breadcrumb-current';
    liCurrent.setAttribute('aria-current', 'page');
    liCurrent.textContent = chapterLabel + ' ' + title;
    ol.appendChild(liCurrent);

    nav.appendChild(ol);

    // Insert after the nav bar, before page-header
    var pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      pageHeader.parentNode.insertBefore(nav, pageHeader);
    } else {
      // Fallback: insert after the main nav
      var mainNav = document.querySelector('nav:not(.textbook-sidebar):not(.toc-sidebar--left)');
      if (mainNav && mainNav.nextSibling) {
        mainNav.parentNode.insertBefore(nav, mainNav.nextSibling);
      }
    }
  }

  /* ================================================================
     Page TOC Sidebar (right panel — per-page headings)
     Built from H2/H3 in .textbook-content
     ================================================================ */
  function buildPageToc() {
    var sidebar = document.getElementById('tocSidebar');
    var toggleBtn = document.getElementById('tocToggleBtn');
    var closeBtn = document.getElementById('tocCloseBtn');
    var overlay = document.getElementById('tocOverlay');
    var list = document.getElementById('tocSidebarList');

    if (!sidebar || !list) return;

    function isDesktop() { return window.innerWidth >= 1200; }

    var headings = document.querySelectorAll('.textbook-content h2, .textbook-content h3');
    headings.forEach(function (h, i) {
      var id = 's' + i;
      if (!h.id) h.id = id;
      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.className = 'toc-item';
      if (h.tagName === 'H2') link.classList.add('toc-h2');
      link.textContent = h.textContent;
      link.onclick = function (e) {
        e.preventDefault();
        document.getElementById(h.id).scrollIntoView({ behavior: 'smooth' });
        if (!isDesktop()) closeToc();
      };
      list.appendChild(link);
    });

    function openToc() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('show');
      document.body.classList.add('toc-open');
      if (toggleBtn) {
        toggleBtn.classList.add('is-open');
        toggleBtn.innerHTML = '<i class="fas fa-times" aria-hidden="true"></i> 关闭';
      }
      // Scroll active link into view
      var activeLink = sidebar.querySelector('.toc-item.active');
      if (activeLink) {
        setTimeout(function() { activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 100);
      }
    }

    function closeToc() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.classList.remove('toc-open');
      if (toggleBtn) {
        toggleBtn.classList.remove('is-open');
        toggleBtn.innerHTML = '<i class="fas fa-list" aria-hidden="true"></i> 目录';
      }
    }

    if (toggleBtn) toggleBtn.onclick = function () {
      if (sidebar.classList.contains('open')) closeToc(); else openToc();
    };
    if (closeBtn) closeBtn.onclick = closeToc;
    if (overlay) overlay.onclick = closeToc;

    // 移动端滚动时自动收起目录浮动按钮（桌面按钮隐藏，监听无副作用）
    if (toggleBtn) autoHideOnScroll(toggleBtn);

    // Swipe down to close on mobile
    var touchStartY = 0;
    var touchCurrentY = 0;
    sidebar.addEventListener('touchstart', function(e) {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    sidebar.addEventListener('touchmove', function(e) {
      touchCurrentY = e.touches[0].clientY;
      var diff = touchCurrentY - touchStartY;
      if (diff > 0) {
        sidebar.style.transform = 'translateY(' + diff + 'px)';
      }
    }, { passive: true });
    sidebar.addEventListener('touchend', function() {
      var diff = touchCurrentY - touchStartY;
      if (diff > 80) {
        closeToc();
      }
      sidebar.style.transform = '';
      touchStartY = 0;
      touchCurrentY = 0;
    }, { passive: true });

    // Escape key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeToc();
        if (toggleBtn) toggleBtn.focus();
      }
    });

    // Auto-open on desktop (toggle button is hidden at ≥1200px)
    if (isDesktop()) openToc();

    // React to viewport resize across the 1200px breakpoint
    var wasDesktop = isDesktop();
    window.addEventListener('resize', function () {
      var nowDesktop = isDesktop();
      if (nowDesktop && !wasDesktop) { openToc(); wasDesktop = true; }
      else if (!nowDesktop && wasDesktop) { closeToc(); wasDesktop = false; }
    });

    // Scroll spy
    if (headings.length > 0) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            list.querySelectorAll('.toc-item').forEach(function (el) { el.classList.remove('active'); });
            var active = list.querySelector('.toc-item[href="#' + entry.target.id + '"]');
            if (active) active.classList.add('active');
          }
        });
      }, { rootMargin: '-80px 0px -60% 0px' });
      headings.forEach(function (h) { observer.observe(h); });
    }
  }

  /* ================================================================
     Init
     ================================================================ */
  function init() {
    buildChapterSidebar();
    buildMobileDrawer();
    buildBreadcrumb();
    buildPageToc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
