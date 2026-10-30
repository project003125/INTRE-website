/* INTRE 阅读须知门禁（2026-10-31 主理会话令）——全站首次访问拦截，sessionStorage 会话记忆 */
(function () {
  try { if (sessionStorage.getItem('intre-gate-ack') === '1') return; } catch (e) {}
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var css = [
      '.intre-gate{position:fixed;inset:0;background:rgba(15,18,24,.62);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;}',
      '.ig-card{background:#fffdf7;color:#20231f;max-width:640px;width:100%;max-height:84vh;display:flex;flex-direction:column;border-radius:16px;box-shadow:0 30px 80px -30px rgba(0,0,0,.5);overflow:hidden;border:1px solid #ddd7c9;}',
      '.ig-head{display:flex;justify-content:space-between;align-items:baseline;padding:14px 18px;border-bottom:1px solid #ddd7c9;}',
      '.ig-head b{font-size:18px;letter-spacing:.04em;}',
      '.ig-head span{font-size:11px;letter-spacing:.22em;color:#6d726a;text-transform:uppercase;}',
      '.ig-body{overflow-y:auto;padding:16px 18px;}',
      '.ig-table{width:100%;border-collapse:collapse;font-size:13.5px;line-height:1.65;}',
      '.ig-table td{border:1px solid #ddd7c9;padding:8px 11px;vertical-align:top;}',
      '.ig-table td.k{white-space:nowrap;font-weight:700;width:92px;background:#f8f4ea;}',
      '.ig-more{margin-top:14px;font-size:12.5px;line-height:1.7;}',
      '.ig-more summary{cursor:pointer;color:#7b2a20;font-weight:700;}',
      '.ig-more .ig-full{margin-top:9px;color:#3b3f39;}',
      '.ig-more p{margin:7px 0;}',
      '.ig-foot{position:sticky;bottom:0;background:#fffdf7;border-top:1px solid #ddd7c9;padding:12px 18px;text-align:center;}',
      '.ig-btn{background:#9a3b2d;color:#fff;border:0;border-radius:10px;padding:10px 24px;font-size:14px;cursor:pointer;font-family:inherit;}',
      '.ig-btn:hover{background:#7b2a20;}',
      '@media (max-width:560px){.intre-gate{padding:0;}.ig-card{max-height:100vh;height:100%;border-radius:0;}}'
    ].join('');
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var rows = [
      ['阶段状态', '本项目处于早期建构阶段（理论蓝图期），内容持续修订中，暂不宜作为定稿引用。'],
      ['术语变动', '术语与命名可能随版本修订调整，请以各页标注的最新版本为准。'],
      ['错漏与修订', '内容可能存在错漏；学术规范性表述与伦理规则相关问题将优先修订。'],
      ['反馈渠道', '如有明显异议或勘误建议，请邮件联系 zhou781670711@outlook.com。'],
      ['非专业建议', '本站内容不构成医疗、心理诊断、治疗或任何专业建议；相关需求请咨询合格专业人士。'],
      ['非机构背书', '站内观点仅代表作者个人，不代表任何教育或研究机构立场。']
    ];
    var full = [
      ['研究快照·无更新义务', '页面内容为撰写时点快照，按「现状」提供（as is）；作者不承担持续更新或纠错义务。在法律允许的最大范围内，对因使用或依赖本站内容产生的任何损失不承担责任。'],
      ['学术引用规范', '本站内容采用 CC0 1.0 公共领域贡献；CC0 不免除学术诚信义务——引用请注明出处、版本与访问日期。'],
      ['未认证声明', '本站内容（含 REVER 伦理引擎设计、实验方案与量表数值）未通过伦理审查、同行评审定稿或任何监管认证，不构成合规依据或伦理合规认证。'],
      ['第三方内容', '站内涉及的 DSM-5、RDoC 等第三方分类体系版权归原机构；外部链接（Zenodo、GitHub 等）内容归其所有者，链接不构成背书。'],
      ['观点属性', '本框架属建构期一家之言，不代表学界共识；建议将支持性与批评性证据并读。']
    ];
    var trs = rows.map(function (r) { return '<tr><td class="k">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('');
    var ps = full.map(function (r) { return '<p><b>' + r[0] + '</b>：' + r[1] + '</p>'; }).join('');

    var ov = document.createElement('div');
    ov.className = 'intre-gate';
    ov.innerHTML =
      '<div class="ig-card" role="dialog" aria-modal="true" aria-label="阅读须知">' +
        '<div class="ig-head"><b>阅读须知</b><span>INTRE</span></div>' +
        '<div class="ig-body">' +
          '<table class="ig-table"><tbody>' + trs + '</tbody></table>' +
          '<details class="ig-more"><summary>阅读完整声明（免责与使用条款）</summary><div class="ig-full">' + ps + '</div></details>' +
        '</div>' +
        '<div class="ig-foot"><button class="ig-btn" type="button">我已阅读并理解 · 确认进入</button></div>' +
      '</div>';
    document.body.appendChild(ov);
    document.documentElement.style.overflow = 'hidden';
    ov.querySelector('.ig-btn').addEventListener('click', function () {
      try { sessionStorage.setItem('intre-gate-ack', '1'); } catch (e) {}
      ov.remove();
      document.documentElement.style.overflow = '';
    });
  });
})();
