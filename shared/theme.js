/*! INTRE 夜间模式开关（自包含：写 data-theme、记忆选择、注入悬浮按钮） */
(function () {
  "use strict";
  var KEY = "intre-theme";
  var root = document.documentElement;
  function apply(t) {
    if (t === "dark") { root.setAttribute("data-theme", "dark"); }
    else { root.removeAttribute("data-theme"); }
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved !== "dark" && saved !== "light") {
    saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  apply(saved);

  var STYLE = "#themeToggle{position:fixed;left:18px;bottom:18px;z-index:9998;width:42px;height:42px;"
    + "border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;"
    + "background:rgba(255,255,255,.92);border:1px solid #cbd5e1;color:#122f5c;"
    + "box-shadow:0 6px 20px rgba(15,23,42,.14);transition:transform .15s ease,background-color .2s ease,border-color .2s ease,color .2s ease}"
    + "#themeToggle:hover{transform:translateY(-2px)}"
    + "#themeToggle svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}"
    + "#themeToggle .ic-sun{display:none}#themeToggle.is-dark .ic-moon{display:none}#themeToggle.is-dark .ic-sun{display:block}"
    + "html[data-theme=\"dark\"] #themeToggle{background:#1c2431;border-color:#33415a;color:#dbe7f5;box-shadow:0 6px 20px rgba(0,0,0,.5)}"
    + "@media (max-width:640px){#themeToggle{left:12px;bottom:12px;width:38px;height:38px}}";

  function mount() {
    if (document.getElementById("themeToggle")) return;
    var st = document.createElement("style");
    st.textContent = STYLE;
    document.head.appendChild(st);
    var b = document.createElement("button");
    b.id = "themeToggle";
    b.type = "button";
    b.setAttribute("aria-label", "切换夜间模式");
    b.title = "夜间模式";
    b.innerHTML = '<svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
      + '<svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>';
    if (saved === "dark") { b.classList.add("is-dark"); }
    b.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark";
      var next = dark ? "light" : "dark";
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      b.classList.toggle("is-dark", next === "dark");
    });
    document.body.appendChild(b);
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", mount); }
  else { mount(); }
})();
