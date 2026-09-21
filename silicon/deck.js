/* ============================================================================
   silicon/deck.js — 网页版 PPT 的翻页与页码高亮（唯一实现）。
   core／icre 两页各引一次：脚本与本文件同放在 silicon/ 下，两页在子目录里，
   故页内写法一律是 <script src="../deck.js"></script>（与 ../shared.css 同级同路）。

   接口约定（脚本不写死任何页面专属常量：屏数、选择器差异一律查询 DOM 得出）
     · 一屏＝一个 <section class="slide">，按文档顺序编号；页码文本由页面自己
       写在屏内的 .pageno 里，脚本只切换 .slide.current，不生成数字。
     · 封面＝同时带 .cover 的那屏；页脚的 scroll-snap-align:end 由 shared.css 管。
     · 吸附偏移（scroll-margin-top:3.2rem）走 CSS，脚本只管 scrollIntoView 的
       block:'start'，故导航高度变了也不必改这里。
   降级：无 JS 时不加 .current，页面按文档顺序正常滚动阅读；无 IntersectionObserver
     时改挂 scroll 监听走同一套几何回读。
   ============================================================================ */
(function () {
  'use strict';

  var slides = [].slice.call(document.querySelectorAll('.slide'));
  if (slides.length < 2) { return; }

  /* 减弱动效偏好：每次用到时实时读，不缓存 ⇒ 用户在系统设置里来回切换即刻生效 */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var current = 0;
  var flying = false;   /* 程序翻页锁：平滑滚动途中观测值会短暂落在旧屏上 */
  var timer = 0;

  function mark(i) {
    current = i;
    slides.forEach(function (s, k) { s.classList.toggle('current', k === i); });
  }

  /* 定当前屏：几何回读「谁盖住视口观测线谁是当前屏」，
     不用 IntersectionObserver 的单一 threshold —— 某屏内容高过 1.67 倍视口
     （小屏／大字号缩放）时 threshold:0.6 永远达不到，页码会冻在旧屏。 */
  function sync() {
    var line = window.innerHeight * 0.4, idx = 0;
    slides.forEach(function (s, k) { if (s.getBoundingClientRect().top <= line) { idx = k; } });
    mark(idx);
  }

  function go(n) {
    var i = Math.max(0, Math.min(slides.length - 1, n));
    mark(i);
    flying = true;
    slides[i].scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { flying = false; sync(); }, reduce.matches ? 60 : 620);
  }

  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) { return; }   /* 不抢浏览器与页面的组合键 */
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); go(current + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(current - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });

  if ('IntersectionObserver' in window) {
    /* 观测带只用来触发回读时机（-40%／-55% 掐出视口上部的窄带），判定一律交给 sync() */
    var io = new IntersectionObserver(function () { if (!flying) { sync(); } },
      { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    slides.forEach(function (s) { io.observe(s); });
  } else {
    window.addEventListener('scroll', function () { if (!flying) { sync(); } }, { passive: true });
  }

  /* 视口高度变了（转屏／缩放／工具条收展）⇒ 观测线跟着变，重算一次 */
  var resizing = 0;
  window.addEventListener('resize', function () {
    if (flying) { return; }
    window.clearTimeout(resizing);
    resizing = window.setTimeout(sync, 150);
  });

  mark(0);
})();
