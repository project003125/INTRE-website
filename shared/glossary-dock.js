/* 术语速查浮窗 · 全站共享组件（2026-11-27）
   自注入 DOM / CSS：页面只需引 glossary-data.js + 本文件
   打开后默认列「本页常用」（按页面正文命中排序），检索时覆盖全部术语 */
(function () {
  var self = document.currentScript;
  if (!self) return;
  var base = self.src.replace(/[^/]*$/, '');
  if (/\/glossary\//.test(location.pathname)) return;

  var data = window.INTRE_GLOSSARY || [];

  // ---- 样式 ----
  if (!document.getElementById('gxStyle')) {
    var link = document.createElement('link');
    link.id = 'gxStyle';
    link.rel = 'stylesheet';
    link.href = base + 'glossary-dock.css?v=20261127b';
    document.head.appendChild(link);
  }

  // ---- 页面命中 ----
  function pageText() {
    var main = document.querySelector('main') || document.body;
    var t = main.innerText || main.textContent || '';
    return t.toLowerCase();
  }
  function countHits(hay, needle) {
    if (!needle) return 0;
    var n = 0, i = 0;
    while ((i = hay.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }
  function pageTerms() {
    var hay = pageText();
    var list = [];
    data.forEach(function (t) {
      var key = (t.k || '').toLowerCase();
      if (key.length < 2 || /^[dlfxpner]$/.test(key)) return;
      var c = countHits(hay, key);
      if (c > 0) list.push({ t: t, c: c });
    });
    list.sort(function (x, y) { return y.c - x.c; });
    return list.slice(0, 10).map(function (x) { return x.t; });
  }

  var CORE = ['操作算子', 'GATE', 'MODULATE', 'ALIGN', 'RELINK', 'M-R-D-S', 'STR-R', 'S-P'];
  function fallbackTerms() {
    return CORE.map(function (k) {
      for (var i = 0; i < data.length; i++) if (data[i].k === k) return data[i];
      return null;
    }).filter(Boolean);
  }

  // ---- DOM ----
  var dock = document.createElement('aside');
  dock.className = 'gx-dock';
  dock.id = 'gxDock';
  dock.setAttribute('data-open', 'false');
  dock.setAttribute('aria-label', '术语速查');
  dock.innerHTML =
    '<button class="gx-tab" id="gxTab" type="button" aria-expanded="false" aria-controls="gxPanel">术语<em>A</em></button>' +
    '<div class="gx-panel" id="gxPanel" role="region" aria-label="术语速查面板">' +
      '<div class="gx-head"><span class="gx-title">术语速查 · 可拖动</span><button class="gx-close" type="button" aria-label="收起">×</button></div>' +
      '<input class="gx-search" type="search" placeholder="全部术语，输入 ALIGN、STR-R、资源…" aria-label="检索全部术语">' +
      '<p class="gx-scope"></p>' +
      '<ul class="gx-list"></ul>' +
      '<p class="gx-empty" hidden>没有匹配的条目，换个词试试。</p>' +
      '<a class="gx-more" href="/INTRE-website/glossary/">完整术语表 →</a>' +
    '</div>';
  document.body.appendChild(dock);

  var tab = dock.querySelector('.gx-tab');
  var panel = dock.querySelector('.gx-panel');
  var closeBtn = dock.querySelector('.gx-close');
  var search = dock.querySelector('.gx-search');
  var scope = dock.querySelector('.gx-scope');
  var list = dock.querySelector('.gx-list');
  var empty = dock.querySelector('.gx-empty');
  var KEY = 'intre-gx-dock';

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(p) { var s = load(); for (var k in p) s[k] = p[k]; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  function trim(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s; }
  function render(items, label) {
    scope.textContent = label;
    list.innerHTML = '';
    items.forEach(function (t) {
      var li = document.createElement('li');
      var b = document.createElement('span'); b.className = 'gx-term'; b.textContent = t.k;
      var d = document.createElement('span'); d.className = 'gx-def'; d.textContent = trim(t.d || '', 96);
      li.appendChild(b); li.appendChild(d);
      list.appendChild(li);
    });
    empty.hidden = items.length !== 0;
  }

  var pool = data, pageList = null;
  function defList() {
    if (!pageList) {
      pageList = pageTerms();
      if (pageList.length < 4) pageList = pageList.concat(fallbackTerms()).slice(0, 10);
    }
    return pageList;
  }
  function showDefault() {
    render(defList(), '本页常用 ' + defList().length + ' 条 · 检索可查全部 ' + data.length + ' 条');
  }
  function showSearch() {
    var q = search.value.trim().toLowerCase();
    if (!q) { pool = data; showDefault(); return; }
    var hits = data.filter(function (t) {
      var hay = ((t.k || '') + ' ' + (t.a || '') + ' ' + (t.d || '')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    render(hits, '全部匹配 ' + hits.length + ' 条');
  }

  showDefault();
  search.addEventListener('input', showSearch);

  function setOpen(on, focus) {
    dock.setAttribute('data-open', on ? 'true' : 'false');
    tab.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on && focus) search.focus({ preventScroll: true });
    save({ open: on });
  }

  function place(left, top) {
    var w = dock.offsetWidth, h = dock.offsetHeight;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - h - 8));
    dock.style.left = left + 'px';
    dock.style.top = top + 'px';
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
    save({ left: left, top: top });
  }

  var s = load();
  if (typeof s.left === 'number' && typeof s.top === 'number') {
    dock.style.left = s.left + 'px';
    dock.style.top = s.top + 'px';
    dock.style.right = 'auto';
    dock.style.bottom = 'auto';
  }
  setOpen(s.open === true, false);

  tab.addEventListener('click', function () { setOpen(dock.getAttribute('data-open') !== 'true', true); });
  closeBtn.addEventListener('click', function () { setOpen(false, false); tab.focus(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && dock.getAttribute('data-open') === 'true') setOpen(false, false);
  });

  // 拖拽
  var drag = null;
  function startDrag(e) {
    if (dock.getAttribute('data-open') !== 'true') return;
    if (e.target.closest('.gx-close, .gx-search, a')) return;
    var r = dock.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top };
    dock.style.transition = 'none';
    if (dock.setPointerCapture && e.pointerId != null) { try { dock.setPointerCapture(e.pointerId); } catch (err) {} }
    e.preventDefault();
  }
  function moveDrag(e) {
    if (!drag) return;
    place(drag.l + (e.clientX - drag.x), drag.t + (e.clientY - drag.y));
  }
  function endDrag() { if (!drag) return; drag = null; dock.style.transition = ''; }
  dock.querySelector('.gx-head').addEventListener('pointerdown', startDrag);
  dock.addEventListener('pointermove', moveDrag);
  dock.addEventListener('pointerup', endDrag);
  dock.addEventListener('pointercancel', endDrag);
})();
