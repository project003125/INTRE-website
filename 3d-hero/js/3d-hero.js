const root = document.documentElement;
const body = document.body;
const acts = [...document.querySelectorAll('.act')];
const railLinks = [...document.querySelectorAll('.act-rail a')];
const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeAct = 1;
let sceneController;

function setActiveAct(number, updateHash = true) {
  if (number === activeAct && body.dataset.active) return;
  activeAct = number;
  body.dataset.active = String(number);
  railLinks.forEach((link, index) => {
    if (index + 1 === number) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  if (updateHash && location.hash !== `#act-${number}`) {
    history.replaceState(null, '', `#act-${number}`);
  }
  sceneController?.setAct(number);
}

function syncActiveFromScroll() {
  const probe = scrollY + Math.min(innerHeight * 0.34, 340);
  let number = 1;
  acts.forEach((act, index) => {
    if (act.getBoundingClientRect().top + scrollY <= probe) number = index + 1;
  });
  setActiveAct(number);
}

let scrollPending = false;
window.addEventListener('scroll', () => {
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    syncActiveFromScroll();
  });
}, { passive: true });

window.addEventListener('hashchange', () => {
  const match = location.hash.match(/^#act-([1-4])$/);
  if (match) setActiveAct(Number(match[1]), false);
});

document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  if (/^[1-4]$/.test(event.key)) {
    event.preventDefault();
    document.querySelector(`#act-${event.key}`).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  if (event.key === 'Escape') clearDetail();
});

const nodes = [...document.querySelectorAll('[data-node]')];
const detailEmpty = document.querySelector('#detail-empty');
const detailContent = document.querySelector('#detail-content');
const detailCode = document.querySelector('#detail-code');
const detailTitle = document.querySelector('#detail-title');
const detailDesc = document.querySelector('#detail-desc');
const detailMarkers = document.querySelector('#detail-markers');
const subdims = ['RES-D', 'RES-B', 'DSP-F', 'DSP-B', 'STR-R', 'STR-C', 'STR-S'];
const subdimNames = ['调度资源', '基底资源', '前台调度', '后台调度', '规则结构', '连接结构', '序列结构'];
const legacyTerms = [['描述性资源', '调度资源'], ['基础资源', '基底资源'], ['前向处理', '前台调度'], ['后向处理', '后台调度'], ['资源策略', '规则结构'], ['核心策略', '连接结构'], ['系统策略', '序列结构']];
let pinnedNode = null;

function showDetail(link, pin = false) {
  const index = Number(link.dataset.node);
  const data = window.INTRE_NODES?.[index];
  if (!data) return;
  if (pin) pinnedNode = link;
  nodes.forEach(node => node.classList.toggle('is-active', node === link));
  const moduleName = window.INTRE_MODULES[Math.floor(index / 7)];
  const glossaryText = text => legacyTerms.reduce((value, [legacy, current]) => value.replaceAll(legacy, current), text);
  detailCode.textContent = `${data.code}`;
  detailTitle.textContent = `${moduleName} × ${subdimNames[index % 7]}`;
  detailDesc.textContent = glossaryText(data.desc);
  const markers = Array.isArray(data.markers) ? data.markers : String(data.markers || '').split('、').filter(Boolean);
  detailMarkers.replaceChildren(...markers.map(marker => {
    const span = document.createElement('span');
    span.textContent = marker;
    return span;
  }));
  detailEmpty.hidden = true;
  detailContent.hidden = false;
}

function clearDetail() {
  pinnedNode = null;
  nodes.forEach(node => node.classList.remove('is-active'));
  detailContent.hidden = true;
  detailEmpty.hidden = false;
}

nodes.forEach(link => {
  link.addEventListener('mouseenter', () => showDetail(link));
  link.addEventListener('mouseleave', () => pinnedNode ? showDetail(pinnedNode) : clearDetail());
  link.addEventListener('focus', () => showDetail(link));
  link.addEventListener('click', event => {
    if (!window.INTRE_NODES) return;
    event.preventDefault();
    showDetail(link, true);
  });
});
document.querySelector('#detail-close').addEventListener('click', clearDetail);

function setTextMode(label) {
  body.classList.add('no-webgl');
  document.querySelector('#render-status').textContent = label;
}

async function initScene() {
  if (params.has('no3d')) {
    body.classList.add('force-text');
    document.querySelector('#render-status').textContent = 'TEXT';
    return;
  }
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) throw new Error('WebGL unavailable');
    const { createHeroScene } = await import('./brain-scene.js');
    sceneController = createHeroScene(document.querySelector('#scene'), {
      lite: params.has('lite'),
      reducedMotion,
      onContextLost: () => setTextMode('TEXT')
    });
    sceneController.setAct(activeAct);
    document.querySelector('#render-status').textContent = params.has('lite') ? 'LITE' : '3D';
  } catch (error) {
    console.warn('3D 场景不可用，已切换文字模式。');
    setTextMode('TEXT');
  }
}

const initialHash = location.hash.match(/^#act-([1-4])$/);
setActiveAct(initialHash ? Number(initialHash[1]) : 1, false);
initScene();
window.addEventListener('load', syncActiveFromScroll);
requestAnimationFrame(syncActiveFromScroll);
