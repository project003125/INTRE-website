/* ============================================================================
   shared/domain-switch.js — 把「碳基 · 心理科学域 ／ 硅基 · 智能科学域」切换胶囊
   插到导航栏 logo 右侧（主理 Agent 2026-09-21 圈定的位置）。
   归属：27 号工程 INSP；依据 DR-2026-09-21-27-INSP-004。

   设计要点：
   ① 一处生效：原站 10 个带 .site-nav 的页面各自引这一行脚本，控件由脚本注入，
      不在每页手写 HTML，避免 10 份副本日后分叉。
   ② 根路径自算：脚本用自身 src 反推站点根前缀（`<script src="{前缀}shared/domain-switch.js">`），
      因此本地任意层级目录与 GitHub Pages 的 /INTRE-website/ 子路径都能算对，不写死绝对路径。
   ③ 不改原站任何行为：只做「插一个控件 ＋ 给 body 打域标记」两件事。
   ============================================================================ */
(function () {
  'use strict';

  var CARBON = '碳基 · 心理科学域';
  var SILICON = '硅基 · 智能科学域';

  /* 根前缀必须在脚本执行当场算：DOMContentLoaded 之后 document.currentScript 已为 null，
     兜底 './' 会让硅基页与全部子目录页的胶囊链接指错（2026-09-21 实测）。 */
  var ROOT = (function () {
    var s = document.currentScript && document.currentScript.src;
    if (!s) { return './'; }
    var i = s.indexOf('shared/domain-switch.js');
    return i >= 0 ? s.slice(0, i) : './';
  })();

  function isSiliconPath() {
    return /(^|\/)silicon(\/|$)/.test(location.pathname.replace(/\/index\.html$/, ''));
  }

  function build(root, domain) {
    var host = document.querySelector('.site-nav .nav-container');
    if (!host) { return; }                       // 无标准导航的页（实验室页／归档页）不插
    if (host.querySelector('.domain-switch')) { return; }

    var wrap = document.createElement('div');
    wrap.className = 'domain-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', '受众域切换');

    var links = [
      { key: 'carbon', label: CARBON, href: root + 'index.html' },
      { key: 'silicon', label: SILICON, href: root + 'silicon/index.html' }
    ];
    links.forEach(function (L) {
      var a = document.createElement('a');
      a.href = L.href;
      a.dataset.domainKey = L.key;
      a.textContent = L.label;
      if (L.key === domain) { a.setAttribute('aria-current', 'page'); }
      wrap.appendChild(a);
    });

    var logo = host.querySelector('.nav-logo');
    if (logo && logo.nextSibling) { host.insertBefore(wrap, logo.nextSibling); }
    else if (logo) { host.appendChild(wrap); }
    else { host.insertBefore(wrap, host.firstChild); }
  }

  function init() {
    var domain = isSiliconPath() ? 'silicon' : 'carbon';
    document.body.setAttribute('data-domain', domain);
    build(ROOT, domain);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
