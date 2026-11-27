/* 窄屏表格可用性补丁
   作用：把没有滚动容器的裸 <table> 包进 .table-wrap，使窄屏可横向滑动，
   避免列被压到逐字竖排。已带 .table-wrap／.table-responsive／.vx-wrap 的表跳过。
   附带一份最小样式兜底，兼容仍缓存旧 components.css 的页面。 */
(function () {
  'use strict';
  if (document.getElementById('intre-table-scroll-style')) return;

  var CSS = '.table-wrap{position:relative;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.4rem 0}' +
            '.table-wrap>table{min-width:100%}' +
            '.table-wrap th,.table-wrap td{min-width:5rem}';
  var st = document.createElement('style');
  st.id = 'intre-table-scroll-style';
  st.textContent = CSS;
  document.head.appendChild(st);

  var WRAPPED = '.table-wrap,.table-responsive,.vx-wrap,.table-scroll';

  function wrapTables() {
    var tables = document.querySelectorAll('table');
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      var p = t.parentElement;
      if (!p) continue;
      if (p.closest && p.closest(WRAPPED)) continue;
      if (t.closest && t.closest('.katex, .katex-display, .katex-html')) continue;
      var box = document.createElement('div');
      box.className = 'table-wrap';
      p.insertBefore(box, t);
      box.appendChild(t);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    wrapTables();
    stackWideTables();
    markScrollable();
    window.addEventListener('resize', function () {
      stackWideTables();
      markScrollable();
    });
    window.addEventListener('orientationchange', function () {
      stackWideTables();
      markScrollable();
    });
    window.addEventListener('load', markScrollable);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(markScrollable);
    setTimeout(markScrollable, 400);
  }

  /* 四列以上的 .vx-table 在窄屏改成分行卡片：
     给每个单元格挂表头文字做行内标签，避免主结论列被推出屏幕 */
  function stackWideTables() {
    var narrow = window.matchMedia('(max-width: 640px)').matches;
    var tables = document.querySelectorAll('.vx-table');
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      if (!t.rows || !t.rows.length) continue;
      var cols = t.rows[0].cells.length;
      if (narrow && cols >= 4) {
        var heads = [];
        for (var c = 0; c < cols; c++) {
          heads.push((t.rows[0].cells[c].textContent || '').trim());
        }
        for (var r = 1; r < t.rows.length; r++) {
          var cells = t.rows[r].cells;
          for (var k = 0; k < cells.length; k++) {
            if (k > 0 && heads[k]) cells[k].setAttribute('data-label', heads[k]);
          }
        }
        t.classList.add('vx-stack');
      } else {
        t.classList.remove('vx-stack');
      }
    }
  }

  /* 只给真正需要横滑的表格加提示（与 .table-responsive 同一套 is-scrollable 机制） */
  function markScrollable() {
    var boxes = document.querySelectorAll('.table-wrap, .vx-wrap');
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      if (b.scrollWidth - b.clientWidth > 4) {
        b.classList.add('is-scrollable');
      } else {
        b.classList.remove('is-scrollable');
      }
    }
  }
})();
