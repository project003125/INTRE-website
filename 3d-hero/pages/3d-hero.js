/* INTRE 3D 体验 · 状态空间 v3.0
   单画布 / 四幕 / 42 节点 / 脑壳 + DTI 纤维 / 无 WebGL 降级
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const MODULES = window.INTRE_MODULES || ['具身', '认知', '意志', '情绪', '言语', '行为'];
const DIMS = [
  { key: 'RES-D', label: '调度资源' },
  { key: 'RES-B', label: '基底资源' },
  { key: 'DSP-F', label: '前台调度' },
  { key: 'DSP-B', label: '后台调度' },
  { key: 'STR-R', label: '规则结构' },
  { key: 'STR-C', label: '连接结构' },
  { key: 'STR-S', label: '序列结构' }
];
const NODES = window.INTRE_NODES || [];
const OUTLINE = window.BRAIN_SAGITTAL_OUTLINE || [];

const params = new URLSearchParams(location.search);
const LITE = params.has('lite') || matchMedia('(prefers-reduced-data: reduce)').matches;
const NO3D = params.has('no3d');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = $('#c');
const track = $('#track');
const sections = $$('.act');
const rail = $$('.rail a');
const bar = $('#bar');
const actLabel = $('#act-label');
const labelWrap = $('.stage-labels');
const panel = $('#node-panel');
const panelCode = $('#node-code');
const panelTitle = $('#node-title');
const panelDesc = $('#node-desc');
const panelMarkers = $('#node-markers');
const fallback = $('#fallback');

let THREE = null;
let buildFibers = null;
let decFromTangent = null;

function fail(err) {
  console.warn('[hero3d] fallback:', err);
  document.body.classList.add('no-webgl');
  if (fallback) fallback.hidden = false;
}

(async function boot() {
  if (NO3D) { fail('no3d'); return; }
  try {
    THREE = await import('three');
    ({ buildFibers } = await import('../lib/dti/fibers.js'));
    ({ decFromTangent } = await import('../lib/dti/dec.js'));
    init();
  } catch (err) {
    fail(err);
  }
})();

function init() {
  if (!canvas || !track) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LITE ? 1 : 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 16);

  const world = new THREE.Group();
  scene.add(world);

  const stars = makeStars();
  scene.add(stars);

  const lattice = makeLattice();
  world.add(lattice.group);

  const brain = makeBrain();
  brain.group.rotation.y = -.35;
  world.add(brain.group);

  const fiber = makeFibers();
  fiber.group.rotation.y = -.35;
  world.add(fiber.group);

  const labels = makeLabels();
  const hover = makeHover();
  world.add(hover.mesh);

  const ACTS = [
    { pos: new THREE.Vector3(0, 0, 17.5), look: new THREE.Vector3(0, 0, 0), lat: .38, brain: .02, fib: 0, rot: .045 },
    { pos: new THREE.Vector3(0, 1.1, 14.2), look: new THREE.Vector3(0, 0, 0), lat: .2, brain: .55, fib: .35, rot: .065 },
    { pos: new THREE.Vector3(0, 0, 15.2), look: new THREE.Vector3(0, 0, 0), lat: 1, brain: .16, fib: .06, rot: .05 },
    { pos: new THREE.Vector3(0, 1.7, 14.6), look: new THREE.Vector3(0, 0, 0), lat: .22, brain: .7, fib: .6, rot: .08 }
  ];

  const look = ACTS[0].look.clone();
  const cur = { lat: 0, brain: 0, fib: 0 };
  let activeAct = -1;
  let pinned = false;
  let hoverIdx = -1;
  let dragging = false;
  let dragX = 0;
  let dragY = 0;

  const pointer = new THREE.Vector2(-2, -2);
  const raycaster = new THREE.Raycaster();
  const tmpVec = new THREE.Vector3();

  function setAct(next, updateHash = true) {
    const a = Math.max(0, Math.min(3, next));
    if (a === activeAct) return;
    activeAct = a;
    cur.lat = ACTS[a].lat;
    cur.brain = ACTS[a].brain;
    cur.fib = ACTS[a].fib;
    sections.forEach((s, i) => s.classList.toggle('is-active', i === a));
    rail.forEach((r, i) => r.setAttribute('aria-current', i === a ? 'true' : 'false'));
    if (actLabel) actLabel.textContent = `ACT 0${a + 1} / 04`;
    if (a !== 2) hidePanel();
    hover.mesh.visible = false;
    if (updateHash) {
      try { history.replaceState(null, '', `#act-${a + 1}`); } catch (e) { /* file:// */ }
    }
    projectLabels();
    renderer.render(scene, camera);
  }

  function actFromScroll() {
    const max = track.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, p * 100)).toFixed(2)}%`;
    setAct(Math.min(3, Math.max(0, Math.floor(p * 4 + 1e-4))));
  }

  function scrollToAct(i) {
    const el = sections[Math.max(0, Math.min(3, i))];
    if (!el) return;
    window.scrollTo({ top: el.offsetTop, behavior: REDUCED ? 'auto' : 'smooth' });
  }

  function makeStars() {
    const count = LITE ? 260 : 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 22 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x9fc3ee,
      size: .06,
      sizeAttenuation: true,
      transparent: true,
      opacity: .55,
      depthWrite: false
    });
    const points = new THREE.Points(geo, mat);
    points.userData.mat = mat;
    return points;
  }

  function nodePos(m, d, out = new THREE.Vector3()) {
    return out.set((m - 2.5) * 1.5, (3 - d) * 1.05, ((m + d) % 2 ? .28 : -.28));
  }

  function makeLattice() {
    const group = new THREE.Group();
    const linePositions = [];

    for (let m = 0; m < 6; m++) {
      for (let d = 0; d < 6; d++) {
        const a = nodePos(m, d, new THREE.Vector3());
        const b = nodePos(m, d + 1, new THREE.Vector3());
        linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    for (let d = 0; d < 7; d++) {
      for (let m = 0; m < 5; m++) {
        const a = nodePos(m, d, new THREE.Vector3());
        const b = nodePos(m + 1, d, new THREE.Vector3());
        linePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6f9bd1,
      transparent: true,
      opacity: .2,
      depthWrite: false
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    const nodeGeo = new THREE.SphereGeometry(.095, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: 0xbcd6f2,
      transparent: true,
      opacity: .9
    });
    const mesh = new THREE.InstancedMesh(nodeGeo, nodeMat, 42);
    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    for (let m = 0; m < 6; m++) {
      for (let d = 0; d < 7; d++) {
        nodePos(m, d, pos);
        const s = m === 3 ? 1.18 : 1;
        matrix.compose(pos, new THREE.Quaternion(), new THREE.Vector3(s, s, s));
        mesh.setMatrixAt(m * 7 + d, matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    group.add(mesh);

    return { group, lineMat, nodeMat, mesh };
  }

  function makeBrain() {
    const group = new THREE.Group();
    const mats = [];
    if (!OUTLINE.length) return { group, mats };

    const slices = LITE ? 6 : 9;
    const S = .33;
    for (let i = 0; i < slices; i++) {
      const angle = (90 - (i * 180) / (slices - 1)) * Math.PI / 180;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      const pts = OUTLINE.map((p) => new THREE.Vector3(
        (p[0] * ca + p[2] * sa) * S,
        p[1] * S,
        (-p[0] * sa + p[2] * ca) * S
      ));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const base = .05;
      const mat = new THREE.LineBasicMaterial({
        color: 0x4f7fb5,
        transparent: true,
        opacity: base,
        depthWrite: false
      });
      group.add(new THREE.LineLoop(geo, mat));
      mats.push({ mat, base });
    }
    // 矢状面轮廓：让正面视角也能读出“脑”的侧影
    const sagittal = OUTLINE.map((p) => new THREE.Vector3(p[0] * S, p[1] * S, 0));
    const sagMat = new THREE.LineBasicMaterial({
      color: 0xbcd6f2,
      transparent: true,
      opacity: .95,
      depthWrite: false
    });
    group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(sagittal), sagMat));
    mats.push({ mat: sagMat, base: .95 });

    return { group, mats };
  }

  function makeFibers() {
    const group = new THREE.Group();
    if (!buildFibers || !decFromTangent) return { group, mat: null };

    const { fibers } = buildFibers(LITE ? .4 : .7, 20260725, 1.0);
    const positions = [];
    const colors = [];
    const S = 4.0;

    for (const f of fibers) {
      const pts = f.pts;
      const tan = f.tan;
      if (!pts || pts.length < 6) continue;
      const n = pts.length / 3;
      for (let i = 0; i < n - 1; i++) {
        const a = i * 3;
        const b = (i + 1) * 3;
        // buildFibers: x=LR, y=UD, z=BF → 脑壳坐标系 x=AP, y=UD, z=LR
        positions.push(
          pts[a + 2] * S, pts[a + 1] * S, pts[a] * S,
          pts[b + 2] * S, pts[b + 1] * S, pts[b] * S
        );
        const ca = tan && tan.length === pts.length
          ? decFromTangent(tan[a], tan[a + 1], tan[a + 2])
          : [.35, .5, .8];
        const cb = tan && tan.length === pts.length
          ? decFromTangent(tan[b], tan[b + 1], tan[b + 2])
          : [.35, .5, .8];
        colors.push(ca[0], ca[1], ca[2], cb[0], cb[1], cb[2]);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: .5,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    group.add(new THREE.LineSegments(geo, mat));
    return { group, mat };
  }

  function makeLabels() {
    const items = [];
    if (!labelWrap) return items;
    MODULES.forEach((name, m) => {
      const el = document.createElement('span');
      el.className = 'lat-label' + (m === 3 ? ' is-strong' : '');
      el.textContent = name;
      labelWrap.appendChild(el);
      items.push({ el, local: new THREE.Vector3((m - 2.5) * 1.5, 3.85, 0) });
    });
    DIMS.forEach((d, i) => {
      const el = document.createElement('span');
      el.className = 'lat-label';
      el.textContent = d.key;
      labelWrap.appendChild(el);
      items.push({ el, local: new THREE.Vector3(-4.85, (3 - i) * 1.05, 0) });
    });
    return items;
  }

  function makeHover() {
    const geo = new THREE.SphereGeometry(.18, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xf5b64a,
      transparent: true,
      opacity: .95,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    return { mesh, mat };
  }

  function showPanel(idx, pin) {
    if (!panel || !NODES[idx]) return;
    const m = Math.floor(idx / 7);
    const d = idx % 7;
    const node = NODES[idx];
    hoverIdx = idx;
    nodePos(m, d, hover.mesh.position);
    hover.mesh.visible = true;
    panelCode.textContent = `M${m + 1} × ${DIMS[d].key}`;
    panelTitle.textContent = `${MODULES[m]} × ${DIMS[d].label}`;
    panelDesc.textContent = node.desc || '';
    panelMarkers.textContent = node.markers ? `标记：${node.markers}` : '';
    panel.hidden = false;
    panel.classList.add('is-open');
    if (pin) pinned = true;
    canvas.style.cursor = 'pointer';
  }

  function hidePanel() {
    pinned = false;
    hoverIdx = -1;
    hover.mesh.visible = false;
    if (!panel) return;
    panel.classList.remove('is-open');
    window.setTimeout(() => {
      if (!panel.classList.contains('is-open')) panel.hidden = true;
    }, 220);
    canvas.style.cursor = 'grab';
  }

  function projectLabels() {
    if (!labelWrap) return;
    const visible = cur.lat > .32 && activeAct === 2;
    labelWrap.style.opacity = visible ? '1' : '0';
    if (!visible) return;
    for (const item of labels) {
      tmpVec.copy(item.local);
      world.localToWorld(tmpVec);
      tmpVec.project(camera);
      if (tmpVec.z > 1 || tmpVec.z < -1) {
        item.el.style.opacity = '0';
        continue;
      }
      const x = (tmpVec.x * .5 + .5) * window.innerWidth;
      const y = (-tmpVec.y * .5 + .5) * window.innerHeight;
      item.el.style.opacity = '1';
      item.el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }
  }

  function bind() {
    window.addEventListener('scroll', actFromScroll, { passive: true });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LITE ? 1 : 1.6));
    }, { passive: true });

    rail.forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToAct(Number(a.dataset.act || 0));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        scrollToAct(Number(e.key) - 1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToAct((activeAct < 0 ? 0 : activeAct) + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToAct((activeAct < 0 ? 0 : activeAct) - 1);
      }
    });

    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      dragX = e.clientX;
      dragY = e.clientY;
      canvas.setPointerCapture?.(e.pointerId);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (dragging) {
        const dx = e.clientX - dragX;
        const dy = e.clientY - dragY;
        dragX = e.clientX;
        dragY = e.clientY;
        world.rotation.y += dx * .004;
        world.rotation.x = Math.max(-.3, Math.min(.3, world.rotation.x + dy * .002));
        return;
      }
      if (activeAct !== 2) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(lattice.mesh, false)[0];
      if (hit && Number.isInteger(hit.instanceId)) {
        if (!pinned || hoverIdx !== hit.instanceId) showPanel(hit.instanceId, false);
      } else if (!pinned) {
        hidePanel();
      }
    });

    const endDrag = (e) => {
      dragging = false;
      try { canvas.releasePointerCapture?.(e.pointerId); } catch (err) { /* noop */ }
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    canvas.addEventListener('click', (e) => {
      if (activeAct !== 2) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(lattice.mesh, false)[0];
      if (hit && Number.isInteger(hit.instanceId)) {
        showPanel(hit.instanceId, true);
      } else {
        hidePanel();
      }
    });

    $('#node-close')?.addEventListener('click', hidePanel);
    panel?.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hidePanel();
    });
  }

  bind();

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000));
    last = now;

    if (!REDUCED && !dragging) {
      const rot = ACTS[activeAct < 0 ? 0 : activeAct].rot;
      world.rotation.y += dt * rot;
    }

    const target = ACTS[activeAct < 0 ? 0 : activeAct];
    const k = 1 - Math.exp(-dt * 3.2);
    camera.position.lerp(target.pos, k);
    look.lerp(target.look, k);
    camera.lookAt(look);

    cur.lat += (target.lat - cur.lat) * k;
    cur.brain += (target.brain - cur.brain) * k;
    cur.fib += (target.fib - cur.fib) * k;

    lattice.lineMat.opacity = .2 * cur.lat;
    lattice.nodeMat.opacity = .9 * cur.lat;
    brain.mats.forEach(({ mat, base }) => { mat.opacity = base * cur.brain; });
    if (fiber.mat) fiber.mat.opacity = .22 * cur.fib;
    if (stars.userData.mat) stars.userData.mat.opacity = .55 - .18 * cur.brain;

    brain.group.visible = cur.brain > .02;
    fiber.group.visible = cur.fib > .05;

    projectLabels();
    renderer.render(scene, camera);
  }

  // 首帧与初始幕
  const hash = /#act-([1-4])/.exec(location.hash);
  const initial = hash ? Number(hash[1]) - 1 : 0;
  cur.lat = ACTS[initial].lat;
  cur.brain = ACTS[initial].brain;
  cur.fib = ACTS[initial].fib;
  camera.position.copy(ACTS[initial].pos);
  look.copy(ACTS[initial].look);
  camera.lookAt(look);
  activeAct = -1;
  setAct(initial, false);
  if (bar) bar.style.width = `${(initial / 3) * 100}%`;
  if (hash) {
    window.setTimeout(() => {
      sections[initial].scrollIntoView({ behavior: 'auto' });
    }, 60);
  } else {
    window.scrollTo(0, 0);
  }

  requestAnimationFrame(frame);

  window.__hero3d = {
    setAct: (i) => scrollToAct(i),
    forceAct: (i) => setAct(i, false),
    showNode: (i) => showPanel(i, true),
    get act() { return activeAct; },
    lite: LITE,
    reduced: REDUCED
  };
}
