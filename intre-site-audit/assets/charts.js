/* INTRE 官网盘点报告 · 图表
   规范：IIFE · getComputedStyle 读 :root token · svg 渲染 · 无动画 · tooltip appendToBody · resize 响应 */
(function () {
  'use strict';
  if (!window.echarts) return;

  var rootStyle = getComputedStyle(document.documentElement);
  function token(name, fallback) {
    var v = rootStyle.getPropertyValue(name);
    return v && v.trim() ? v.trim() : fallback;
  }

  var C = {
    p0: token('--p0', '#D97706'),
    p1: token('--p1', '#1F4880'),
    p2: token('--p2', '#7A8AA0'),
    accent: token('--accent', '#D97706'),
    navy: token('--navy', '#1F4880'),
    ink: token('--ink', '#0D2347'),
    muted: token('--muted', '#5B6B82'),
    rule: token('--rule', '#E3E8F0'),
    fontBody: token('--font-body', 'sans-serif'),
    fontMono: token('--font-mono', 'monospace')
  };

  var charts = [];
  function make(id) {
    var dom = document.getElementById(id);
    if (!dom) return null;
    var chart = echarts.init(dom, null, { renderer: 'svg' });
    charts.push(chart);
    return chart;
  }

  var F = window.FINDINGS || { content: [], design: [] };
  var content = F.content || [];
  var design = F.design || [];

  /* ---- 图 1 · 两条审计线的严重度分布（分组柱状） ---- */
  var sev = make('chart-sev');
  if (sev) {
    function count(list, s) {
      var n = 0;
      for (var i = 0; i < list.length; i++) if (list[i].sev === s) n++;
      return n;
    }
    sev.setOption({
      animation: false,
      textStyle: { fontFamily: C.fontBody, color: C.ink },
      tooltip: {
        trigger: 'axis', appendToBody: true, axisPointer: { type: 'shadow' },
        backgroundColor: '#0D2347', borderColor: '#0D2347',
        textStyle: { color: '#fff', fontFamily: C.fontBody, fontSize: 12 }
      },
      legend: {
        top: 4, right: 0, itemWidth: 12, itemHeight: 12,
        textStyle: { fontSize: 12, color: C.muted, fontFamily: C.fontMono }
      },
      grid: { left: 8, right: 16, top: 52, bottom: 8, containLabel: true },
      xAxis: {
        type: 'category', data: ['内容线', '设计线'],
        axisLine: { lineStyle: { color: C.rule } }, axisTick: { show: false },
        axisLabel: { color: C.ink, fontWeight: 700, fontSize: 13 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } },
        axisLabel: { color: C.muted, fontFamily: C.fontMono }
      },
      series: [
        { name: 'P0 阻断', type: 'bar', barWidth: 34, itemStyle: { color: C.p0 },
          data: [count(content, 'P0'), count(design, 'P0')],
          label: { show: true, position: 'top', fontFamily: C.fontMono, fontWeight: 700, color: C.p0 } },
        { name: 'P1 高优', type: 'bar', barWidth: 34, itemStyle: { color: C.p1 },
          data: [count(content, 'P1'), count(design, 'P1')],
          label: { show: true, position: 'top', fontFamily: C.fontMono, fontWeight: 700, color: C.p1 } },
        { name: 'P2 深化', type: 'bar', barWidth: 34, itemStyle: { color: C.p2 },
          data: [count(content, 'P2'), count(design, 'P2')],
          label: { show: true, position: 'top', fontFamily: C.fontMono, fontWeight: 700, color: C.p2 } }
      ]
    });
  }

  /* ---- 图 2 · 问题主题聚类 Top 12（横向条，按 theme 字段跨线聚合） ---- */
  var theme = make('chart-theme');
  if (theme) {
    var all = content.concat(design);
    var agg = {};
    for (var i = 0; i < all.length; i++) {
      var t = all[i].theme;
      if (t) agg[t] = (agg[t] || 0) + 1;
    }
    var rows = Object.keys(agg).map(function (k) { return { name: k, value: agg[k] }; });
    rows.sort(function (a, b) { return b.value - a.value; });
    rows = rows.slice(0, 12);
    rows.reverse(); /* yAxis category 自下而上，倒序使最大值置顶 */
    var max = rows.length ? rows[rows.length - 1].value : 0;
    theme.setOption({
      animation: false,
      textStyle: { fontFamily: C.fontBody, color: C.ink },
      tooltip: {
        trigger: 'item', appendToBody: true,
        backgroundColor: '#0D2347', borderColor: '#0D2347',
        textStyle: { color: '#fff', fontFamily: C.fontBody, fontSize: 12 },
        formatter: '{b}<br/>{c} 条'
      },
      grid: { left: 8, right: 44, top: 8, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: C.rule, type: 'dashed' } },
        axisLabel: { color: C.muted, fontFamily: C.fontMono }
      },
      yAxis: {
        type: 'category',
        data: rows.map(function (r) { return r.name; }),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: C.ink, fontSize: 12 }
      },
      series: [{
        type: 'bar', barWidth: 14,
        data: rows.map(function (r) {
          return { value: r.value, itemStyle: { color: r.value === max ? C.accent : C.navy } };
        }),
        label: { show: true, position: 'right', fontFamily: C.fontMono, fontWeight: 700, color: C.muted, formatter: '{c}' }
      }]
    });
  }

  /* ---- resize ---- */
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var i = 0; i < charts.length; i++) charts[i].resize();
    }, 120);
  });
})();
