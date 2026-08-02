/**
 * rig.js — RCT4 实验公共渲染环境
 * 黑场 + PerspectiveCamera + OrbitControls(360°) + EffectComposer + UnrealBloom + OutputPass
 * 附带：GUI 调参面板 / FPS / 参考图对比角 / 纤维束开关列表
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const CSS = `
  html,body{margin:0;padding:0;background:#000;overflow:hidden;width:100%;height:100%}
  canvas{display:block}
  #lab-hud{position:fixed;top:14px;left:16px;z-index:20;pointer-events:none;
    font-family:'JetBrains Mono',ui-monospace,Consolas,monospace;color:#c8d6f2}
  #lab-hud .tag{display:inline-block;font-size:10px;letter-spacing:.18em;color:#0b1220;
    background:#5b8def;padding:3px 8px;border-radius:2px;font-weight:700}
  #lab-hud h1{margin:8px 0 4px;font-size:19px;font-weight:700;letter-spacing:.02em;color:#eef3ff}
  #lab-hud p{margin:0;font-size:11px;line-height:1.6;color:#7f93b8;max-width:340px}
  #lab-fps{position:fixed;top:14px;right:16px;z-index:20;font:11px 'JetBrains Mono',monospace;
    color:#5f7396;pointer-events:none}
  #lab-gui{position:fixed;right:16px;top:44px;z-index:21;width:236px;background:rgba(7,11,20,.88);
    border:1px solid rgba(91,141,239,.22);border-radius:6px;padding:12px 14px;
    font:11px 'JetBrains Mono',monospace;color:#a9bcdc;backdrop-filter:blur(6px)}
  #lab-gui .g-title{font-size:10px;letter-spacing:.2em;color:#5b8def;margin-bottom:10px;font-weight:700}
  #lab-gui .g-row{display:flex;align-items:center;justify-content:space-between;margin:7px 0;gap:8px}
  #lab-gui label{flex:0 0 86px;color:#8299bd;font-size:10.5px}
  #lab-gui input[type=range]{flex:1;accent-color:#5b8def;height:3px}
  #lab-gui .g-val{flex:0 0 34px;text-align:right;color:#e8effc;font-size:10.5px}
  #lab-gui .g-chk{display:flex;align-items:center;gap:8px;margin:7px 0;cursor:pointer;color:#8299bd;font-size:10.5px}
  #lab-gui .g-chk input{accent-color:#ffb454}
  #lab-gui .g-sec{border-top:1px solid rgba(91,141,239,.15);margin:10px 0 8px;padding-top:8px;
    font-size:9.5px;letter-spacing:.16em;color:#54689a}
  #lab-gui .g-tracts{max-height:180px;overflow-y:auto}
  #lab-gui .g-tracts::-webkit-scrollbar{width:4px}
  #lab-gui .g-tracts::-webkit-scrollbar-thumb{background:#26365c;border-radius:2px}
  #lab-ref{position:fixed;left:16px;bottom:16px;z-index:20;width:190px;border:1px solid rgba(91,141,239,.35);
    border-radius:4px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.7);transition:opacity .3s}
  #lab-ref img{display:block;width:100%}
  #lab-ref .cap{font:9px 'JetBrains Mono',monospace;color:#7f93b8;background:rgba(7,11,20,.9);
    padding:4px 8px;letter-spacing:.08em}
  #lab-hint{position:fixed;bottom:16px;right:16px;z-index:20;font:10px 'JetBrains Mono',monospace;
    color:#44587f;pointer-events:none;letter-spacing:.06em}
`;

export function createLab({ title, tag, desc, bloom = {}, camera = {}, onFrame }) {
  /* ---- 注入样式 ---- */
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---- HUD ---- */
  const hud = document.createElement('div');
  hud.id = 'lab-hud';
  hud.innerHTML = `<span class="tag">${tag || 'RCT4 LAB'}</span><h1>${title}</h1><p>${desc || ''}</p>`;
  document.body.appendChild(hud);

  const fps = document.createElement('div');
  fps.id = 'lab-fps';
  document.body.appendChild(fps);

  const hint = document.createElement('div');
  hint.id = 'lab-hint';
  hint.textContent = '拖拽 360° 旋转 · 滚轮缩放 · 右侧调参';
  document.body.appendChild(hint);

  /* ---- 渲染器 ---- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  document.body.appendChild(renderer.domElement);

  /* ---- 场景 / 相机 ---- */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const cam = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 60);
  cam.position.set(camera.x ?? 2.3, camera.y ?? 0.95, camera.z ?? 3.3);

  const controls = new OrbitControls(cam, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.7;
  controls.minDistance = 1.4;
  controls.maxDistance = 8;
  controls.enablePan = false;
  controls.target.set(0, 0.02, 0);

  /* ---- 后期：Bloom ---- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloom.strength ?? 1.15,
    bloom.radius ?? 0.55,
    bloom.threshold ?? 0.55
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  /* ---- 脑容器 ---- */
  const brainGroup = new THREE.Group();
  scene.add(brainGroup);

  /* ---- 全局 uniforms ---- */
  const uniforms = {
    uTime: { value: 0 },
    uPulseAmp: { value: 1.2 },
    uPulseSpeed: { value: 0.8 },
    uSweepAmp: { value: 0.4 },
    uBase: { value: 0.82 },
  };

  /* ---- GUI ---- */
  const guiEl = document.createElement('div');
  guiEl.id = 'lab-gui';
  guiEl.innerHTML = `<div class="g-title">PARAMETERS</div>`;
  document.body.appendChild(guiEl);

  const gui = {
    slider(label, min, max, step, val, cb) {
      const row = document.createElement('div');
      row.className = 'g-row';
      const valEl = document.createElement('span');
      valEl.className = 'g-val';
      valEl.textContent = (+val).toFixed(2);
      row.innerHTML = `<label>${label}</label>`;
      const inp = document.createElement('input');
      inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = val;
      inp.addEventListener('input', () => {
        valEl.textContent = (+inp.value).toFixed(2);
        cb(+inp.value);
      });
      row.appendChild(inp); row.appendChild(valEl);
      guiEl.appendChild(row);
      return inp;
    },
    toggle(label, val, cb) {
      const row = document.createElement('label');
      row.className = 'g-chk';
      const inp = document.createElement('input');
      inp.type = 'checkbox'; inp.checked = val;
      inp.addEventListener('change', () => cb(inp.checked));
      row.appendChild(inp);
      row.appendChild(document.createTextNode(label));
      guiEl.appendChild(row);
      return inp;
    },
    section(text) {
      const s = document.createElement('div');
      s.className = 'g-sec';
      s.textContent = text;
      guiEl.appendChild(s);
    },
  };

  /* ---- 参考图对比角 ---- */
  const ref = document.createElement('div');
  ref.id = 'lab-ref';
  ref.innerHTML = `<img src="../intre-3d-hero/assets/dti-reference.png" alt="DTI Reference">
    <div class="cap">REFERENCE · DTI (Nature 级范式)</div>`;
  document.body.appendChild(ref);

  /* ----  Resize ---- */
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    cam.aspect = w / h; cam.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });

  /* ---- 主循环 ---- */
  const clock = new THREE.Clock();
  let frames = 0, fpsT = 0;
  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    controls.update();
    if (onFrame) onFrame(dt, t);
    composer.render();
    frames++; fpsT += dt;
    if (fpsT >= 0.5) {
      fps.textContent = `${Math.round(frames / fpsT)} FPS · ${(renderer.info.render.triangles/1000).toFixed(0)}k tris`;
      frames = 0; fpsT = 0;
    }
  });

  return {
    renderer, scene, camera: cam, controls, composer, bloomPass,
    brainGroup, uniforms, gui, guiEl, refEl: ref,
    setBloom(s, r, th) {
      if (s != null) bloomPass.strength = s;
      if (r != null) bloomPass.radius = r;
      if (th != null) bloomPass.threshold = th;
    },
  };
}

/** 把纤维束开关列表挂到 GUI 上。tractMeshes: {tractId: Object3D} */
export function attachTractToggles(lab, tractMeshes, meta) {
  lab.gui.section(`TRACTS · ${meta.tracts} 束 / ${meta.total} 根`);
  const wrap = document.createElement('div');
  wrap.className = 'g-tracts';
  lab.guiEl.appendChild(wrap);
  for (const [id, obj] of Object.entries(tractMeshes)) {
    const row = document.createElement('label');
    row.className = 'g-chk';
    const inp = document.createElement('input');
    inp.type = 'checkbox'; inp.checked = true;
    inp.addEventListener('change', () => { obj.visible = inp.checked; });
    row.appendChild(inp);
    row.appendChild(document.createTextNode(`${id} · ${obj.userData.name || ''}`));
    wrap.appendChild(row);
  }
}
