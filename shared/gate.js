/* INTRE 阅读须知门禁（2026-10-31 主理会话令；同日视觉改版＋外审文案返修 v1.1）——全站首次访问拦截，sessionStorage 会话记忆 */
(function () {
  try { if (sessionStorage.getItem('intre-gate-ack') === '1') return; } catch (e) {}
  if (document.querySelector('.intre-gate')) return;
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var css = [
      '.intre-gate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(10,30,61,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);font-family:var(--font-body,"Inter",-apple-system,BlinkMacSystemFont,"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif);animation:igFade .18s ease-out;}',
      '.ig-card{width:100%;max-width:660px;max-height:84vh;display:flex;flex-direction:column;overflow:hidden;background:var(--color-white,#fff);color:var(--color-slate-800,#1e293b);border:1px solid rgba(31,72,128,.14);border-radius:10px;box-shadow:0 40px 90px -36px rgba(10,30,61,.55),0 8px 24px -12px rgba(10,30,61,.25);animation:igRise .22s cubic-bezier(.2,.8,.2,1);}',
      '.ig-card::before{content:"";display:block;height:3px;flex:0 0 auto;background:var(--color-navy-600,#1F4880);}',
      '.ig-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 24px 16px;border-bottom:1px solid rgba(31,72,128,.10);}',
      '.ig-kicker{margin:0 0 6px;font-size:11px;line-height:1.4;letter-spacing:.18em;text-transform:uppercase;color:var(--color-slate-500,#64748b);}',
      '.ig-title{margin:0;font-size:20px;line-height:1.3;font-weight:700;letter-spacing:.01em;color:var(--color-navy-800,#122F5C);}',
      '.ig-brand{padding-top:3px;font-family:var(--font-logo,"Josefin Sans","Century Gothic",Futura,sans-serif);font-size:12px;letter-spacing:.28em;color:var(--color-navy-600,#1F4880);white-space:nowrap;}',
      '.ig-body{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:6px 24px 10px;}',
      '.ig-row{display:grid;grid-template-columns:86px 1fr;gap:16px;padding:12px 0;border-bottom:1px solid rgba(31,72,128,.08);}',
      '.ig-row:last-of-type{border-bottom:0;}',
      '.ig-k{padding-top:1px;font-size:12px;line-height:1.7;font-weight:600;letter-spacing:.03em;color:var(--color-navy-600,#1F4880);}',
      '.ig-v{font-size:13.5px;line-height:1.75;color:var(--color-slate-700,#334155);}',
      '.ig-more{margin:12px 0 4px;border:1px solid rgba(31,72,128,.14);border-radius:8px;background:var(--color-slate-50,#f8fafc);}',
      '.ig-more[open]{background:var(--color-white,#fff);}',
      '.ig-more summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;font-size:13px;font-weight:600;line-height:1.5;color:var(--color-navy-700,#1A3866);cursor:pointer;list-style:none;}',
      '.ig-more summary::-webkit-details-marker{display:none;}',
      '.ig-more summary::after{content:"";flex:0 0 auto;width:8px;height:8px;margin-right:2px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg);transition:transform .18s ease;}',
      '.ig-more[open] summary::after{transform:rotate(-135deg);}',
      '.ig-full{padding:0 14px 12px;border-top:1px solid rgba(31,72,128,.08);}',
      '.ig-clause{padding:10px 0;border-bottom:1px dashed rgba(31,72,128,.10);}',
      '.ig-clause:last-child{border-bottom:0;padding-bottom:4px;}',
      '.ig-clause b{display:block;margin-bottom:3px;font-size:12.5px;line-height:1.6;letter-spacing:.02em;color:var(--color-navy-700,#1A3866);}',
      '.ig-clause span{display:block;font-size:12.5px;line-height:1.75;color:var(--color-slate-600,#475569);}',
      '.ig-foot{position:sticky;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 24px 16px;background:var(--color-white,#fff);border-top:1px solid rgba(31,72,128,.10);}',
      '.ig-hint{font-size:11.5px;line-height:1.5;color:var(--color-slate-500,#64748b);}',
      '.ig-btn{padding:11px 22px;border:0;border-radius:8px;background:var(--color-navy-600,#1F4880);color:#fff;font-family:inherit;font-size:14px;font-weight:600;line-height:1.4;white-space:nowrap;cursor:pointer;transition:background .15s ease,box-shadow .15s ease;}',
      '.ig-btn:hover{background:var(--color-navy-800,#122F5C);}',
      '.ig-btn:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(31,72,128,.22);}',
      '.ig-out{opacity:0;transition:opacity .16s ease;}',
      '@media (max-width:560px){.intre-gate{padding:0;}.ig-card{max-height:100vh;height:100%;border:0;border-radius:0;}.ig-head{padding:18px 18px 14px;}.ig-body{padding:4px 18px 8px;}.ig-row{grid-template-columns:74px 1fr;gap:12px;padding:11px 0;}.ig-foot{flex-direction:column-reverse;align-items:stretch;gap:8px;padding:12px 18px calc(12px + env(safe-area-inset-bottom));}.ig-hint{text-align:center;}.ig-btn{width:100%;padding:12px 18px;}}',
      '@media (prefers-reduced-motion:reduce){.intre-gate,.ig-card,.ig-out{animation:none;transition:none;}}',
      '@keyframes igFade{from{opacity:0}to{opacity:1}}',
      '@keyframes igRise{from{opacity:0;transform:translateY(10px) scale(.99)}to{opacity:1;transform:none}}'
    ].join('');
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var rows = [
      ['阶段状态', '本项目处于早期建构阶段（理论蓝图期），内容持续修订中，暂不宜作为定稿引用。'],
      ['术语变动', '术语与命名可能随版本修订调整，请以各页标注的最新版本为准。'],
      ['错漏与修订', '内容可能存在错漏，欢迎指出；学术规范与伦理相关问题将优先核实（不构成持续更新承诺）。'],
      ['反馈渠道', '如有异议或勘误建议，欢迎邮件反馈：zhou781670711@outlook.com（仅用于沟通，不作他用）。'],
      ['非专业建议', '本站内容不构成医疗、心理诊断、治疗或任何专业建议；干预语法（如 DMD）为研究性描述、量表数值为示例，均不可用于个体诊疗或产品决策；相关需求请咨询合格专业人士。'],
      ['非机构背书', '站内观点仅代表作者个人，不代表任何教育或研究机构立场。']
    ];
    var full = [
      ['研究快照·无更新义务', '页面内容为撰写时点快照，按「现状」提供（as is）；作者不承担持续更新或纠错义务。在法律允许的最大范围内不承担责任；本条不排除依法不得排除的责任（如故意或重大过失、人身损害）。'],
      ['学术引用规范', '本站原创内容采用 CC0 1.0 公共领域贡献（第三方内容除外，见下条）；CC0 不免除学术诚信义务——引用请注明出处、版本与访问日期（此为学术规范请求，非 CC0 附加条件）。'],
      ['未认证声明', '本站内容（含 REVER 伦理引擎设计、实验方案与量表数值）未经伦理审查、同行评审定稿或任何监管认证（不构成 IRB／伦理委员会批准、医疗器械注册或心理治疗资质）；REVER 为设计性伦理护栏，不构成伦理合规认证或合规依据。'],
      ['第三方内容', '站内涉及的 DSM-5、RDoC 等第三方分类体系，其版权与商标归原机构；外部链接（Zenodo、GitHub 等）内容归其所有者，链接不构成背书。'],
      ['观点属性', '本框架属建构期一家之言，不代表学界共识；建议将支持性与批评性证据并读。'],
      ['未成年人提示', '本站面向研究者与成年读者；未满 18 周岁请在监护人指导下阅读，本站不提供任何专业服务。'],
      ['隐私与数据', '本站不主动收集个人数据；门禁仅以 sessionStorage 记忆本次确认（关闭标签页即失效）；邮件反馈以邮件内容为限。'],
      ['适用法律与管辖', '本须知及本站使用适用中华人民共和国法律；因本站内容产生的争议，由作者住所地有管辖权的人民法院管辖。']
    ];
    var trs = rows.map(function (r) {
      return '<div class="ig-row"><div class="ig-k">' + r[0] + '</div><div class="ig-v">' + r[1] + '</div></div>';
    }).join('');
    var ps = full.map(function (r) {
      return '<div class="ig-clause"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>';
    }).join('');

    var ov = document.createElement('div');
    ov.className = 'intre-gate';
    ov.innerHTML =
      '<div class="ig-card" role="dialog" aria-modal="true" aria-labelledby="igTitle">' +
        '<div class="ig-head">' +
          '<div><p class="ig-kicker">Reading Notice</p><div class="ig-title" id="igTitle">阅读须知</div></div>' +
          '<div class="ig-brand">INTRE</div>' +
        '</div>' +
        '<div class="ig-body">' +
          trs +
          '<details class="ig-more"><summary>阅读完整声明（免责与使用条款 · 8 条）</summary><div class="ig-full">' + ps + '</div></details>' +
        '</div>' +
        '<div class="ig-foot"><div class="ig-hint">确认仅在本浏览器会话内有效 · 按 Esc 可暂离（不记忆）</div><button class="ig-btn" type="button">我已阅读并理解 · 确认进入</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    var btn = ov.querySelector('.ig-btn');
    var summary = ov.querySelector('.ig-more summary');
    try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); }
    function close(remember) {
      if (remember) { try { sessionStorage.setItem('intre-gate-ack', '1'); } catch (e) {} }
      ov.classList.add('ig-out');
      window.setTimeout(function () {
        if (ov.parentNode) ov.parentNode.removeChild(ov);
        document.documentElement.style.overflow = '';
      }, 160);
    }
    btn.addEventListener('click', function () { close(true); });
    ov.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(false); return; }
      if (e.key === 'Tab') {
        var f = [summary, btn].filter(Boolean);
        var i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && (i === f.length - 1 || i === -1)) { e.preventDefault(); f[0].focus(); }
      }
    });
  });
})();
