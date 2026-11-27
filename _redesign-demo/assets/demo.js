/* INTRE Redesign Demo — 交互层（本地 Demo，未上线） */
(function () {
  'use strict';
  var body = document.body;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 域 / 主题 ---------- */
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  var domain = read('intre-demo-domain') || body.getAttribute('data-domain') || 'carbon';
  var theme = read('intre-demo-theme') || 'light';
  body.setAttribute('data-domain', domain);
  body.setAttribute('data-theme', theme);

  var DOMAIN_LABEL = { carbon: '碳基 · 心理科学域', silicon: '硅基 · 智能科学域' };
  function syncDomainUI() {
    document.querySelectorAll('.domain-seg button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-d') === domain));
    });
    document.querySelectorAll('[data-domain-label]').forEach(function (el) {
      el.textContent = DOMAIN_LABEL[domain];
    });
  }
  document.querySelectorAll('.domain-seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      domain = b.getAttribute('data-d');
      body.setAttribute('data-domain', domain);
      store('intre-demo-domain', domain);
      syncDomainUI();
    });
  });
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function syncThemeUI() {
    if (!themeBtn) return;
    themeBtn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    themeBtn.querySelector('.i-sun').style.display = theme === 'dark' ? 'none' : '';
    themeBtn.querySelector('.i-moon').style.display = theme === 'dark' ? '' : 'none';
  }
  if (themeBtn) themeBtn.addEventListener('click', function () {
    theme = theme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', theme);
    store('intre-demo-theme', theme);
    syncThemeUI();
  });
  syncDomainUI(); syncThemeUI();

  /* ---------- 导航：折叠 + 阅读进度 ---------- */
  var burger = document.querySelector('.nav-burger');
  var menu = document.getElementById('nav-menu');
  if (burger && menu) burger.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  var prog = document.querySelector('.progress');
  function onScroll() {
    if (!prog) return;
    var h = root.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 入场：JS 在场才隐藏，且兜底全显 ---------- */
  var rvs = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  function showAll() { rvs.forEach(function (el) { el.classList.add('in'); }); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) { io.observe(el); });
    setTimeout(showAll, 2500);
  } else { showAll(); }

  /* ---------- 42 维状态仪表 ---------- */
  var COLS = ['RES-D', 'RES-B', 'DSP-F', 'DSP-B', 'STR-R', 'STR-C', 'STR-S'];
  var ROWS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
  var grid = document.getElementById('psiGrid');
  var out = document.getElementById('psiOut');
  var clock = document.getElementById('psiClock');
  var vals = [];
  function seed(i) { var x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }
  function paint(cell, v) { cell.style.background = 'rgba(var(--d-rgb), ' + (0.10 + v * 0.72).toFixed(3) + ')'; }
  if (grid) {
    ROWS.forEach(function (r, ri) {
      var lab = document.createElement('span');
      lab.className = 'psi-rowlab'; lab.textContent = r;
      grid.appendChild(lab);
      COLS.forEach(function (c, ci) {
        var i = ri * 7 + ci;
        var v = 0.18 + seed(i + 1) * 0.7;
        vals[i] = v;
        var cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'psi-cell';
        cell.setAttribute('aria-label', r + ' ' + c + ' 状态分量');
        cell.dataset.i = i;
        paint(cell, v);
        function report() {
          if (out) out.textContent = r + '·' + c + ' = ' + vals[i].toFixed(2);
        }
        cell.addEventListener('pointerenter', report);
        cell.addEventListener('focus', report);
        grid.appendChild(cell);
      });
    });
    var t = 0;
    if (!reduce) {
      setInterval(function () {
        t += 1;
        for (var k = 0; k < 6; k++) {
          var i = Math.floor(Math.random() * 42);
          var target = 0.15 + seed(i + t * 7.13) * 0.75;
          vals[i] = target;
          var cell = grid.querySelector('[data-i="' + i + '"]');
          if (cell) paint(cell, target);
        }
        if (clock) clock.textContent = 't = ' + String(t).padStart(4, '0');
      }, 1100);
    }
    if (out) out.textContent = 'Ψ(t) ∈ ℝ⁴² · 6 × 7';
  }

  /* ---------- 数字带计数 ---------- */
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        nio.unobserve(en.target);
        var el = en.target, end = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / 900);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3)))).padStart(2, '0');
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (el) { nio.observe(el); });
  }

  /* ---------- 内页目录 scrollspy ---------- */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var heads = tocLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + en.target.id));
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    heads.forEach(function (h) { sio.observe(h); });
  }
})();