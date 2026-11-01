import * as THREE from 'three';
import { EffectComposer } from '../lib/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../lib/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../lib/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../lib/addons/postprocessing/OutputPass.js';
import { buildFibers } from '../lib/dti/fibers.js';
import { decFromTangent } from '../lib/dti/dec.js';

/**
 * INTRE 3D 场景层 v2
 * 单场景、四世界：核心（开场）→ 涡旋（现象层）→ 42 晶格（功能层）→ 脑与纤维（神经层）。
 * 幕间以透明度权重交叉过渡，镜头随滚动进度在四个机位间插值。
 */

const KF = [
  { p: 0.0, pos: [0.0, 0.15, 8.6] },
  { p: 0.33, pos: [0.55, 0.20, 7.7] },
  { p: 0.67, pos: [0.95, 0.55, 7.1] },
  { p: 1.0, pos: [1.20, 0.35, 6.3] }
];

const COL = {
  ice: 0xcfe6ff,
  beam: 0x74b6f0,
  deep: 0x1f5f9e,
  uplp: 0x6fbfa4,
  ubmp: 0xd9a878,
  unip: 0x86a9d6,
  amber: 0xffb648
};

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function createHeroScene(canvas, options = {}) {
  const lite = !!options.lite;
  const reduced = !!options.reducedMotion;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lite, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

  // 泛光后处理：仅高质量路径启用（lite / reduced-motion / 窄屏走直接渲染）
  let composer = null;
  if (!lite && !reduced) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.5, 0.62));
      composer.addPass(new OutputPass());
    } catch (error) {
      composer = null;
      console.warn('泛光不可用，回退直渲。');
    }
  }

  scene.add(new THREE.HemisphereLight(0x9fc9ef, 0x061223, 1.1));
  const key = new THREE.DirectionalLight(0xbcdcff, 1.9);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2f6fae, 1.4);
  rim.position.set(-4, 1, -4);
  scene.add(rim);

  const glowTex = makeGlowTexture();

  const dust = makeDust(lite ? 300 : 780, glowTex);
  const hero = makeCore(glowTex, lite);
  const phenomena = makeVortex(glowTex, lite);
  const lattice = makeLattice(glowTex);
  const brain = makeBrain(glowTex, lite);

  scene.add(dust);
  scene.add(hero.group);
  scene.add(phenomena.group);
  scene.add(lattice.group);
  scene.add(brain.group);

  const worlds = [hero, phenomena, lattice, brain];
  let progress = 0;
  let currentAct = 1;
  let hovered = -1;
  let pointer = new THREE.Vector2(-4, -4);
  let parallax = { x: 0, y: 0 };
  let aimShift = 1.55;
  const fadeScale = [1, 1, 1, 1];
  const lookTarget = new THREE.Vector3(1.4, 0, 0);
  const aim = new THREE.Vector3(1.4, 0, 0);
  const camPos = new THREE.Vector3(...KF[0].pos);
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const clock = new THREE.Clock();
  let frameId = 0;
  let last = 0;
  let disposed = false;

  function layout() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();

    const mobile = w <= 760;
    aimShift = mobile ? 0 : 1.55;
    fadeScale[2] = mobile ? 0.5 : 1;
    fadeScale[0] = mobile ? 0.55 : 1;
    hero.group.position.set(mobile ? 0 : 2.15, mobile ? 0.6 : 0.1, mobile ? -1.4 : -0.4);
    hero.group.scale.setScalar(mobile ? 0.62 : 1);
    phenomena.group.position.set(mobile ? 0 : 2.0, mobile ? 0.35 : 0.05, mobile ? -1.8 : 0);
    phenomena.group.scale.setScalar(mobile ? 0.8 : 1);
    lattice.group.position.set(mobile ? 0 : 2.15, mobile ? 0.15 : 0.15, mobile ? -1.6 : 0);
    lattice.group.scale.setScalar(mobile ? 0.95 : 0.85);
    brain.group.position.set(mobile ? 0 : 2.0, mobile ? -0.1 : -0.02, mobile ? -1.2 : 0);
    brain.group.scale.setScalar(mobile ? 0.82 : 1.45);
  }

  function resize() {
    layout();
    if (reduced) renderOnce();
  }

  function weights(p) {
    return [
      1 - smoothstep(0.20, 0.35, p),
      smoothstep(0.20, 0.35, p) * (1 - smoothstep(0.57, 0.70, p)),
      smoothstep(0.57, 0.70, p) * (1 - smoothstep(0.84, 0.95, p)),
      smoothstep(0.84, 0.95, p)
    ];
  }

  function applyWeights(w) {
    worlds.forEach((world, i) => {
      const weight = w[i];
      world.group.visible = weight > 0.015;
      world.fades.forEach(material => {
        if (material.uniforms && material.uniforms.uIntensity) {
          material.uniforms.uIntensity.value = material.userData.baseIntensity * weight * fadeScale[i];
        } else {
          material.opacity = material.userData.baseOpacity * weight * fadeScale[i];
        }
      });
    });
    dust.material.opacity = 0.22 + 0.28 * w[0];
  }

  function updateCamera(p, w) {
    for (let i = 0; i < KF.length - 1; i++) {
      if (p <= KF[i + 1].p) {
        const span = KF[i + 1].p - KF[i].p;
        const t = span <= 0 ? 0 : (p - KF[i].p) / span;
        camPos.set(
          KF[i].pos[0] + (KF[i + 1].pos[0] - KF[i].pos[0]) * t,
          KF[i].pos[1] + (KF[i + 1].pos[1] - KF[i].pos[1]) * t,
          KF[i].pos[2] + (KF[i + 1].pos[2] - KF[i].pos[2]) * t
        );
        break;
      }
    }
    const total = w[0] + w[1] + w[2] + w[3] || 1;
    aim.set(0, 0, 0);
    worlds.forEach((world, i) => {
      aim.x += world.group.position.x * w[i];
      aim.y += world.group.position.y * w[i];
      aim.z += world.group.position.z * w[i];
    });
    aim.multiplyScalar(1 / total);
    aim.x -= aimShift;

    camera.position.set(camPos.x + parallax.x, camPos.y + parallax.y, camPos.z);
    lookTarget.lerp(aim, 0.08);
    camera.lookAt(lookTarget);
  }

  function updateNodes(t) {
    if (!lattice.group.visible) return;
    const dummy = lattice.dummy;
    const color = lattice.tmpColor;
    for (let i = 0; i < 42; i++) {
      const base = lattice.basePositions[i];
      const pulse = 1 + Math.sin(t * 1.8 + i * 0.42) * 0.16;
      const grow = i === hovered ? 2.15 : pulse;
      dummy.position.set(base[0], base[1], base[2] + Math.sin(t * 0.8 + i) * 0.035);
      dummy.scale.setScalar(grow);
      dummy.updateMatrix();
      lattice.nodes.setMatrixAt(i, dummy.matrix);
      lattice.halo.setMatrixAt(i, dummy.matrix);
      const lit = i === hovered ? 1 : 0.82;
      color.setRGB(0.4 * lit, 0.78 * lit, 1 * lit);
      if (i === hovered) color.setHex(COL.amber);
      lattice.nodes.setColorAt(i, color);
    }
    lattice.nodes.instanceMatrix.needsUpdate = true;
    lattice.halo.instanceMatrix.needsUpdate = true;
    if (lattice.nodes.instanceColor) lattice.nodes.instanceColor.needsUpdate = true;

    const span = lattice.halfH * 2 + 0.5;
    lattice.scan.position.y = lattice.halfH + 0.25 - ((t * 0.32) % 1) * span;
    lattice.scan.material.opacity = 0.12 + Math.sin(t * 1.4) * 0.05;

    if (hovered >= 0) {
      const base = lattice.basePositions[hovered];
      lattice.hoverRing.position.set(base[0], base[1], base[2] + 0.12);
      lattice.hoverRing.material.opacity = 0.42 + Math.sin(t * 3.4) * 0.12;
      lattice.hoverRing.scale.setScalar(0.5 + Math.sin(t * 2.2) * 0.08);
    } else {
      lattice.hoverRing.material.opacity = 0;
    }

    lattice.beacons.forEach(({ sprite, phase }) => {
      const p = (t * 0.35 + phase) % 1;
      sprite.position.y = lattice.halfH + 0.2 - p * span;
      sprite.material.opacity = 0.28 * Math.sin(p * Math.PI);
    });
  }

  function pick() {
    if (!lattice.group.visible) return -1;
    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObject(lattice.nodes, false);
    if (!hits.length) return -1;
    return hits[0].instanceId ?? -1;
  }

  function renderOnce(time = 0) {
    const t = time / 1000;
    const w = weights(progress);
    applyWeights(w);

    if (!reduced) {
      hero.group.rotation.y = t * 0.12;
      hero.group.rotation.x = Math.sin(t * 0.22) * 0.06;
      hero.orbit.rotation.z = t * 0.16;
      hero.orbit.rotation.y = -t * 0.1;
      phenomena.group.rotation.y = t * 0.10;
      phenomena.group.rotation.z = Math.sin(t * 0.06) * 0.1;
      phenomena.orbit.update(t);
      brain.group.rotation.y = -0.95 + Math.sin(t * 0.1) * 0.28;
      brain.group.rotation.x = -0.05 + Math.sin(t * 0.16) * 0.04;
      brain.signals.update(t);
      if (lattice.group.visible) {
        lattice.group.rotation.y = Math.sin(t * 0.16) * 0.16 - 0.04;
        lattice.group.rotation.x = -0.1 + Math.cos(t * 0.2) * 0.03;
      }
      updateNodes(t);
    }

    updateCamera(progress, w);

    if (lattice.group.visible && !reduced) {
      const hit = pick();
      if (hit !== hovered) {
        hovered = hit;
        options.onNodeHover?.(hit >= 0 ? hit : null);
        document.body.classList.toggle('node-hovering', hit >= 0);
      }
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function loop(time) {
    if (disposed) return;
    frameId = requestAnimationFrame(loop);
    if (time - last < 14) return;
    last = time;
    renderOnce(time);
  }

  function start() {
    if (reduced) renderOnce();
    else if (!frameId) frameId = requestAnimationFrame(loop);
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  }

  const onPointerMove = event => {
    pointerNdc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    parallax.x = -pointerNdc.x * 0.14;
    parallax.y = pointerNdc.y * 0.1;
  };
  const onPointerLeave = () => {
    pointerNdc.set(-4, -4);
    parallax.x = 0;
    parallax.y = 0;
    hovered = -1;
    document.body.classList.remove('node-hovering');
  };
  const onClick = event => {
    if (hovered < 0) return;
    if (event.target.closest?.('a, button, img')) return;
    options.onNodePick?.(hovered);
  };
  const onContextLost = event => {
    event.preventDefault();
    stop();
    options.onContextLost?.();
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('click', onClick);
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);

  layout();
  applyWeights(weights(0));
  updateCamera(0, weights(0));
  start();

  return {
    setAct(number) {
      currentAct = number;
    },
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      if (reduced) renderOnce();
    },
    dispose() {
      disposed = true;
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse(obj => {
        obj.geometry?.dispose?.();
        const material = obj.material;
        if (material) (Array.isArray(material) ? material : [material]).forEach(m => m.dispose?.());
      });
      renderer.dispose();
    }
  };
}

/* ---------------- 公共构件 ---------------- */

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.25, 'rgba(190,225,255,0.7)');
  gradient.addColorStop(0.6, 'rgba(90,150,210,0.18)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function registerFades(root) {
  const fades = [];
  root.traverse(obj => {
    const material = obj.material;
    if (!material) return;
    (Array.isArray(material) ? material : [material]).forEach(m => {
      if (m.uniforms && m.uniforms.uIntensity) {
        if (m.userData.baseIntensity === undefined) m.userData.baseIntensity = m.uniforms.uIntensity.value;
        fades.push(m);
        return;
      }
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      fades.push(m);
    });
  });
  return fades;
}

/* 菲涅耳边缘光壳体：暗场里只亮轮廓 */
function fresnelMaterial(hex, power = 2.2, intensity = 0.9) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(hex) },
      uPower: { value: power },
      uIntensity: { value: intensity }
    },
    vertexShader: `
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      varying vec3 vN;
      varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
        gl_FragColor = vec4(uColor * (0.4 + f), f * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
}

/* ---------------- 开场：核心 ---------------- */

function makeCore(glowTex, lite) {
  const group = new THREE.Group();

  const icosa = new THREE.IcosahedronGeometry(1.5, lite ? 0 : 1);
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(icosa),
    new THREE.LineBasicMaterial({ color: COL.beam, transparent: true, opacity: 0.46, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(wire);

  const verts = [];
  const posAttr = icosa.getAttribute('position');
  const seen = new Set();
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
    const key = `${x.toFixed(3)}|${y.toFixed(3)}|${z.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    verts.push(x, y, z);
  }
  const vGeo = new THREE.BufferGeometry();
  vGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  const vPoints = new THREE.Points(vGeo, new THREE.PointsMaterial({
    map: glowTex, color: COL.ice, size: 0.18, transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  group.add(vPoints);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x2b76bd, transparent: true, opacity: 0.36,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.setScalar(4.6);
  group.add(halo);

  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 48, 32),
    fresnelMaterial(0x86c8ff, 2.3, 0.85)
  );
  group.add(shell);

  // 环绕粒子带：给核心一个可读的"轨道"
  const orbitCount = lite ? 140 : 300;
  const orbitPos = new Float32Array(orbitCount * 3);
  for (let i = 0; i < orbitCount; i++) {
    const a = (i / orbitCount) * Math.PI * 2;
    const r = 2.35 + Math.sin(i * 1.7) * 0.12;
    orbitPos[i * 3] = Math.cos(a) * r;
    orbitPos[i * 3 + 1] = Math.sin(a * 3.1) * 0.16;
    orbitPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const orbitGeo = new THREE.BufferGeometry();
  orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
  const orbit = new THREE.Points(orbitGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0x9fd6ff, size: 0.048, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  orbit.rotation.x = 0.42;
  group.add(orbit);

  const ringMaterial = new THREE.MeshBasicMaterial({ color: COL.beam, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
  [2.35, 2.75, 3.15].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.006, 6, 140), ringMaterial);
    ring.rotation.set(Math.PI / 2 + index * 0.35, index * 0.5, index * 0.22);
    group.add(ring);
  });

  return { group, fades: registerFades(group), orbit };
}

/* ---------------- 现象层：涡旋 ---------------- */

function makeVortex(glowTex, lite) {
  const group = new THREE.Group();
  group.rotation.x = -0.72;
  const count = lite ? 1100 : 2400;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const t = i / count;
    const arm = (i % 3) * (Math.PI * 2 / 3);
    const angle = t * Math.PI * 5.4 + arm;
    const radius = 0.4 + t * 2.1;
    const wave = Math.sin(t * 10 + arm) * 0.42 * (1 - t * 0.55);
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = wave;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    color.setHSL(0.57 - t * 0.05, 0.52 + t * 0.25, 0.36 + t * 0.34);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    map: glowTex, vertexColors: true, size: 0.068, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  group.add(points);

  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x9fd2ff, transparent: true, opacity: 0.26,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  core.scale.setScalar(1.7);
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.007, 8, 180),
    new THREE.MeshBasicMaterial({ color: COL.ice, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(ring);

  const orbs = [];
  const orbitRadius = 2.5;
  [[COL.uplp, 0], [COL.ubmp, 2.1], [COL.unip, 4.2]].forEach(([hex, phase]) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: hex, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sprite.scale.setScalar(0.65);
    group.add(sprite);
    orbs.push({ sprite, phase });
  });

  // 三条旋臂丝带：给粒子云加一层可辨的"结构"
  const ribbons = [];
  [[1.55, 0x8fd0ff, 0], [1.95, 0x5da2d8, 2.1], [2.3, 0x3d74a8, 4.2]].forEach(([radius, hex, phase]) => {
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const a = (i / 220) * Math.PI * 6 + phase;
      const r = radius + Math.sin(i * 0.22 + phase) * 0.16;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a * 3 + phase) * 0.2, Math.sin(a) * r));
    }
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })
    ));
  });

  // 自中心向外扩散的波纹
  const pulses = [];
  for (let i = 0; i < 3; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0xa8d8ff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sprite.scale.setScalar(0.2);
    group.add(sprite);
    pulses.push({ sprite, phase: i / 3 });
  }

  const orbit = {
    update(t) {
      orbs.forEach(({ sprite, phase }) => {
        const angle = t * 0.35 + phase;
        sprite.position.set(Math.cos(angle) * orbitRadius, Math.sin(angle * 1.4) * 0.16, Math.sin(angle) * orbitRadius);
      });
      pulses.forEach(({ sprite, phase }) => {
        const p = (t * 0.26 + phase) % 1;
        sprite.scale.setScalar(0.3 + p * 3.6);
        sprite.material.opacity = 0.26 * (1 - p) * (1 - p);
      });
    }
  };

  return { group, fades: registerFades(group), orbit };
}

/* ---------------- 功能层：42 晶格 ---------------- */

function makeLattice(glowTex) {
  const group = new THREE.Group();
  const cols = 6;
  const rows = 7;
  const gapX = 0.92;
  const gapY = 0.66;
  const basePositions = [];

  const nodeGeo = new THREE.SphereGeometry(0.07, 10, 8);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, 42);

  const haloGeo = new THREE.SphereGeometry(0.075, 8, 6);
  const haloMat = new THREE.MeshBasicMaterial({
    color: COL.beam, transparent: true, opacity: 0.1,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const halo = new THREE.InstancedMesh(haloGeo, haloMat, 42);

  const edges = [];
  const seams = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = (col - (cols - 1) / 2) * gapX;
      const y = ((rows - 1) / 2 - row) * gapY;
      const z = Math.sin(col * 0.9 + row * 0.55) * 0.11;
      basePositions[col * rows + row] = [x, y, z];
      if (col < cols - 1) edges.push(x, y, z, x + gapX, y, z);
      if (row < rows - 1) edges.push(x, y, z, x, y - gapY, z);
      if (col < cols - 1 && row < rows - 1) seams.push(x, y, z, x + gapX, y - gapY, z);
    }
  }

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
  group.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({
    color: 0x8fd0ff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false
  })));

  const seamGeo = new THREE.BufferGeometry();
  seamGeo.setAttribute('position', new THREE.Float32BufferAttribute(seams, 3));
  group.add(new THREE.LineSegments(seamGeo, new THREE.LineBasicMaterial({
    color: COL.deep, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false
  })));

  // 外框
  const halfW = gapX * (cols - 1) / 2 + 0.45;
  const halfH = gapY * (rows - 1) / 2 + 0.45;
  const frame = new THREE.LineSegments(
    new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([
      -halfW, halfH, 0, halfW, halfH, 0, halfW, -halfH, 0, -halfW, -halfH, 0, -halfW, halfH, 0,
      -halfW, halfH, -0.6, halfW, halfH, -0.6, halfW, -halfH, -0.6, -halfW, -halfH, -0.6, -halfW, halfH, -0.6,
      -halfW, halfH, 0, -halfW, halfH, -0.6, halfW, halfH, 0, halfW, halfH, -0.6,
      halfW, -halfH, 0, halfW, -halfH, -0.6, -halfW, -halfH, 0, -halfW, -halfH, -0.6
    ], 3)),
    new THREE.LineBasicMaterial({ color: COL.beam, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(frame);

  group.add(nodes, halo);

  // 扫描光带 + 悬停光环 + 每列数据灯
  const scan = new THREE.Mesh(
    new THREE.PlaneGeometry(halfW * 2 - 0.2, 0.055),
    new THREE.MeshBasicMaterial({ color: 0xa8dcff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scan.position.z = 0.32;
  group.add(scan);

  const hoverRing = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: COL.amber, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
  }));
  hoverRing.scale.setScalar(0.55);
  group.add(hoverRing);

  const beacons = [];
  for (let col = 0; col < cols; col++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: 0x9fd2ff, transparent: true, opacity: 0.4,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sprite.scale.setScalar(0.12);
    sprite.position.set((col - (cols - 1) / 2) * gapX, 2.4, 0.1);
    group.add(sprite);
    beacons.push({ sprite, phase: col / cols });
  }

  const dummy = new THREE.Object3D();
  const tmpColor = new THREE.Color();
  for (let i = 0; i < 42; i++) {
    const [x, y, z] = basePositions[i];
    dummy.position.set(x, y, z);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    nodes.setMatrixAt(i, dummy.matrix);
    halo.setMatrixAt(i, dummy.matrix);
    tmpColor.setRGB(0.4, 0.78, 1);
    nodes.setColorAt(i, tmpColor);
  }
  nodes.instanceMatrix.needsUpdate = true;
  halo.instanceMatrix.needsUpdate = true;
  if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;

  return { group, fades: registerFades(group), nodes, halo, dummy, tmpColor, basePositions, scan, hoverRing, beacons, halfH };
}

/* ---------------- 神经层：解剖脑 + DTI ---------------- */

function makeBrain(glowTex, lite) {
  const group = new THREE.Group();
  group.rotation.set(-0.08, -0.95, -0.02);

  const aura = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: 0x1d5f9f, transparent: true, opacity: 0.14,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  aura.scale.setScalar(6.2);
  aura.position.set(0, 0, -0.4);
  group.add(aura);

  const cortex = new THREE.MeshStandardMaterial({
    color: 0x6d9cbc, emissive: 0x0a2b4a, emissiveIntensity: 0.4,
    roughness: 0.85, metalness: 0.05, transparent: true, opacity: 0.2,
    depthWrite: false, side: THREE.DoubleSide
  });
  const cerebellum = new THREE.MeshStandardMaterial({
    color: 0x557f9d, emissive: 0x08233c, emissiveIntensity: 0.4,
    roughness: 0.9, metalness: 0.04, transparent: true, opacity: 0.38, depthWrite: false
  });
  const brainstem = new THREE.MeshStandardMaterial({
    color: 0x48738f, emissive: 0x071e33, emissiveIntensity: 0.38,
    roughness: 0.92, transparent: true, opacity: 0.46, depthWrite: false
  });
  const shellMat = new THREE.MeshBasicMaterial({
    color: COL.beam, wireframe: true, transparent: true, opacity: 0.07,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const rimMat = fresnelMaterial(0x4b8fd2, 3.2, 0.28);

  fetch('../assets/brain-anatomy.bin')
    .then(response => {
      if (!response.ok) throw new Error('anatomy missing');
      return response.arrayBuffer();
    })
    .then(buffer => {
      const view = new DataView(buffer);
      const count = view.getUint32(12, true);
      let offset = 16;
      for (let i = 0; i < count; i++) {
        let name = '';
        for (let j = 0; j < 16; j++) {
          const code = view.getUint8(offset + j);
          if (code) name += String.fromCharCode(code);
        }
        offset += 16;
        const vertexCount = view.getUint32(offset, true);
        const indexCount = view.getUint32(offset + 4, true);
        offset += 8;
        const positions = new Float32Array(buffer, offset, vertexCount * 3);
        offset += positions.byteLength;
        const indices = new Uint32Array(buffer, offset, indexCount);
        offset += indices.byteLength;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();

        const material = name.startsWith('cortex') ? cortex : (materialsByName(name) || cerebellum);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 3;
        group.add(mesh);

        if (name.startsWith('cortex')) {
          const shell = new THREE.Mesh(geometry, shellMat);
          shell.renderOrder = 2;
          group.add(shell);
          const rim = new THREE.Mesh(geometry, rimMat);
          rim.renderOrder = 6;
          group.add(rim);
        }
      }
      fades.push(...registerFades(group).filter(m => !fades.includes(m)));
    })
    .catch(() => { group.userData.anatomyUnavailable = true; });

  function materialsByName(name) {
    if (name === 'cerebellum') return cerebellum;
    if (name === 'brainstem') return brainstem;
    return null;
  }

  const fades = registerFades(group);

  const { fibers } = buildFibers(lite ? 0.34 : 0.58, 20261101, 0.62, lite ? 32 : 48);
  const keep = new Set(['CC', 'CST', 'AF', 'CG', 'SLF', 'ILF', 'UF', 'IFOF', 'FX', 'OR']);
  const positions = [];
  const colors = [];
  const color = new THREE.Color();
  const sparks = [];
  const paths = [];

  for (const fiber of fibers) {
    if (!keep.has(fiber.tract.id)) continue;
    paths.push(fiber.pts);
    const samples = fiber.pts.length / 3;
    for (let i = 0; i < samples - 1; i++) {
      for (const j of [i, i + 1]) {
        positions.push(fiber.pts[j * 3], fiber.pts[j * 3 + 1], fiber.pts[j * 3 + 2]);
        const c = decFromTangent(fiber.tan[j * 3], fiber.tan[j * 3 + 1], fiber.tan[j * 3 + 2]);
        color.setRGB(0.05 + c[0] * 0.8, 0.06 + c[1] * 0.72, 0.09 + c[2] * 0.85, THREE.SRGBColorSpace);
        colors.push(color.r, color.g, color.b);
        if (i % 4 === 0) sparks.push(fiber.pts[j * 3], fiber.pts[j * 3 + 1], fiber.pts[j * 3 + 2]);
      }
    }
  }

  const fiberGeo = new THREE.BufferGeometry();
  fiberGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fiberGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const fiberLines = new THREE.LineSegments(fiberGeo, new THREE.LineBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.NormalBlending
  }));
  fiberLines.renderOrder = 4;
  group.add(fiberLines);

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.Float32BufferAttribute(sparks, 3));
  const sparkPoints = new THREE.Points(sparkGeo, new THREE.PointsMaterial({
    map: glowTex, color: COL.ice, size: 0.04, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  sparkPoints.renderOrder = 5;
  group.add(sparkPoints);

  // 脑外粒子晕：把模型"托"起来
  const haloCount = lite ? 240 : 560;
  const haloPos = new Float32Array(haloCount * 3);
  let seed = 913;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < haloCount; i++) {
    const theta = rnd() * Math.PI * 2;
    const phi = Math.acos(2 * rnd() - 1);
    const radius = 0.95 + rnd() * 0.55;
    haloPos[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    haloPos[i * 3 + 1] = Math.cos(phi) * radius * 0.8;
    haloPos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius * 1.1;
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
  const haloPoints = new THREE.Points(haloGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0x9ecdff, size: 0.032, transparent: true, opacity: 0.28,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  group.add(haloPoints);

  // 沿纤维游走的信号点
  const signalCount = lite ? 18 : 60;
  const sigPos = new Float32Array(signalCount * 3);
  const sigState = [];
  for (let i = 0; i < signalCount; i++) {
    const path = paths[(i * 7) % paths.length];
    if (!path) break;
    sigState.push({
      path,
      samples: path.length / 3,
      speed: 0.05 + rnd() * 0.1,
      phase: rnd()
    });
  }
  const sigGeo = new THREE.BufferGeometry();
  sigGeo.setAttribute('position', new THREE.BufferAttribute(sigPos, 3));
  const sigPoints = new THREE.Points(sigGeo, new THREE.PointsMaterial({
    map: glowTex, color: 0xf2f9ff, size: 0.05, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  sigPoints.renderOrder = 7;
  group.add(sigPoints);

  const signals = {
    update(t) {
      for (let i = 0; i < sigState.length; i++) {
        const s = sigState[i];
        const idx = ((s.phase + t * s.speed) % 1) * (s.samples - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(s.samples - 1, i0 + 1);
        const f = idx - i0;
        const a = i0 * 3;
        const b = i1 * 3;
        sigPos[i * 3] = s.path[a] + (s.path[b] - s.path[a]) * f;
        sigPos[i * 3 + 1] = s.path[a + 1] + (s.path[b + 1] - s.path[a + 1]) * f;
        sigPos[i * 3 + 2] = s.path[a + 2] + (s.path[b + 2] - s.path[a + 2]) * f;
      }
      sigGeo.attributes.position.needsUpdate = true;
    }
  };

  return { group, fades: registerFades(group), signals };
}

function makeDust(count, glowTex) {
  const positions = new Float32Array(count * 3);
  let seed = 20261101;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (rand() - 0.5) * 26;
    positions[i * 3 + 1] = (rand() - 0.5) * 16;
    positions[i * 3 + 2] = -1 - rand() * 14;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    map: glowTex, color: 0x9fc9ef, size: 0.035, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
  return points;
}
