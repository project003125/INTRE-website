import * as THREE from 'three';
import { buildFibers } from '../lib/dti/fibers.js';
import { decFromTangent } from '../lib/dti/dec.js';

export function createHeroScene(canvas, options) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !options.lite, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, options.lite ? 1 : 1.6));
  renderer.setClearColor(0x06172e, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x06172e, 0.035);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0x9fc9ef, 0x071426, 1.3));
  const keyLight = new THREE.DirectionalLight(0xa9d3ff, 2.1);
  keyLight.position.set(3, 5, 6);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x326ead, 1.2);
  rimLight.position.set(-4, 1, -3);
  scene.add(rimLight);

  const stars = createStars(options.lite ? 220 : 620);
  scene.add(stars);
  const phenomena = createPhenomena();
  scene.add(phenomena);
  const lattice = createLattice();
  scene.add(lattice);
  const brain = createBrain(options.lite);
  scene.add(brain);

  let currentAct = 1;
  let targetAct = 1;
  let frameId = 0;
  let lastFrame = 0;
  let disposed = false;
  const clock = new THREE.Clock();

  function layout() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
    const mobile = width <= 640;
    phenomena.position.set(mobile ? 0.8 : 2.1, mobile ? -0.2 : 0, 0);
    phenomena.scale.setScalar(mobile ? 0.72 : 1);
    brain.position.set(mobile ? 0.7 : 2.05, mobile ? -0.55 : 0, 0);
    brain.scale.setScalar(mobile ? 0.92 : 1.35);
    lattice.position.set(0, 0, -3);
    lattice.scale.setScalar(mobile ? 0.65 : 1);
  }

  function updateVisibility() {
    phenomena.visible = currentAct === 2;
    lattice.visible = currentAct === 3;
    brain.visible = currentAct === 4;
    stars.material.opacity = currentAct === 4 ? 0.22 : currentAct === 3 ? 0.18 : 0.62;
  }

  function render(time = 0) {
    if (disposed) return;
    if (!options.reducedMotion && time - lastFrame < 15) {
      frameId = requestAnimationFrame(render);
      return;
    }
    lastFrame = time;
    const t = clock.getElapsedTime();
    if (!options.reducedMotion) {
      stars.rotation.y = t * 0.006;
      phenomena.rotation.y = -0.25 + Math.sin(t * 0.16) * 0.08;
      brain.rotation.y = -0.32 + Math.sin(t * 0.18) * 0.12;
      brain.rotation.x = Math.sin(t * 0.13) * 0.025;
    }
    if (currentAct !== targetAct) {
      currentAct = targetAct;
      updateVisibility();
    }
    renderer.render(scene, camera);
    if (!options.reducedMotion) frameId = requestAnimationFrame(render);
  }

  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    cancelAnimationFrame(frameId);
    options.onContextLost();
  });
  window.addEventListener('resize', layout, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frameId);
    else if (!options.reducedMotion) frameId = requestAnimationFrame(render);
  });

  layout();
  updateVisibility();
  render();

  return {
    setAct(number) {
      targetAct = number;
      currentAct = number;
      updateVisibility();
      if (options.reducedMotion) render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', layout);
      renderer.dispose();
    }
  };
}

function createStars(count) {
  const positions = new Float32Array(count * 3);
  let seed = 7349;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (random() - 0.5) * 25;
    positions[i * 3 + 1] = (random() - 0.5) * 16;
    positions[i * 3 + 2] = -3 - random() * 18;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x8ab9e4, size: 0.025, transparent: true, opacity: 0.62, depthWrite: false, sizeAttenuation: true });
  return new THREE.Points(geometry, material);
}

function createPhenomena() {
  const group = new THREE.Group();
  const points = [
    [-1.4, 0.8, 0], [-0.8, 1.25, 0.1], [-0.25, 0.72, 0], [0.35, 1.05, -0.2], [1.15, 0.55, 0],
    [-1.1, -0.25, 0.1], [-0.35, 0.05, 0], [0.35, -0.35, 0.2], [1.25, -0.5, 0],
    [-0.75, -1.1, 0], [0.05, -1.3, -0.1], [0.7, -1.05, 0]
  ];
  const connections = [[0,1],[1,2],[2,3],[3,4],[0,5],[2,6],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[7,11],[6,2],[6,3]];
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  group.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xc2e0fa, size: 0.095, transparent: true, opacity: 0.9, depthWrite: false })));
  const linePoints = [];
  connections.forEach(([a,b]) => linePoints.push(new THREE.Vector3(...points[a]), new THREE.Vector3(...points[b])));
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  group.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x4b83b9, transparent: true, opacity: 0.55, depthWrite: false })));
  return group;
}

function createLattice() {
  const group = new THREE.Group();
  const geometry = new THREE.SphereGeometry(0.055, 8, 6);
  const material = new THREE.MeshBasicMaterial({ color: 0x6ca5d9, transparent: true, opacity: 0.5 });
  const mesh = new THREE.InstancedMesh(geometry, material, 42);
  const dummy = new THREE.Object3D();
  const lines = [];
  for (let col = 0; col < 6; col++) {
    for (let row = 0; row < 7; row++) {
      const i = col * 7 + row;
      const x = (col - 2.5) * 0.85;
      const y = (3 - row) * 0.58;
      dummy.position.set(x, y, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (col < 5) lines.push(x, y, 0, x + 0.85, y, 0);
      if (row < 6) lines.push(x, y, 0, x, y - 0.58, 0);
    }
  }
  group.add(mesh);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  group.add(new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x3b6fb5, transparent: true, opacity: 0.28 })));
  return group;
}

function createBrain(lite) {
  const group = new THREE.Group();
  const texture = new THREE.TextureLoader().load('../assets/brain-cortex-texture.jpg');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 2.5);
  const shellMaterial = new THREE.MeshStandardMaterial({
    color: 0x467aa5, emissive: 0x07182a, emissiveIntensity: 0.35,
    roughness: 0.82, metalness: 0, transparent: true, opacity: 0.24,
    depthWrite: false, bumpMap: texture, bumpScale: 0.055, side: THREE.FrontSide
  });
  const left = new THREE.Mesh(makeCortexGeometry(-1, lite), shellMaterial);
  const right = new THREE.Mesh(makeCortexGeometry(1, lite), shellMaterial);
  left.renderOrder = right.renderOrder = 3;
  group.add(left, right);

  const cerebellumMaterial = shellMaterial.clone();
  cerebellumMaterial.color.setHex(0x355f83);
  cerebellumMaterial.opacity = 0.36;
  cerebellumMaterial.bumpScale = 0.08;
  for (const side of [-1, 1]) {
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.48, lite ? 20 : 32, lite ? 14 : 22), cerebellumMaterial);
    lobe.position.set(side * 0.35, -0.85, -0.68);
    lobe.scale.set(1, 0.62, 0.82);
    lobe.renderOrder = 3;
    group.add(lobe);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.85, 16, 4), cerebellumMaterial);
  stem.position.set(0, -1.03, -0.25);
  stem.rotation.x = -0.25;
  stem.renderOrder = 3;
  group.add(stem);

  const { fibers } = buildFibers(lite ? 0.24 : 0.5, 20261031, 0.8, lite ? 32 : 48);
  const positions = [];
  const colors = [];
  const color = new THREE.Color();
  for (const fiber of fibers) {
    const samples = fiber.pts.length / 3;
    for (let i = 0; i < samples - 1; i++) {
      for (const j of [i, i + 1]) {
        positions.push(fiber.pts[j * 3], fiber.pts[j * 3 + 1], fiber.pts[j * 3 + 2]);
        const c = decFromTangent(fiber.tan[j * 3], fiber.tan[j * 3 + 1], fiber.tan[j * 3 + 2]);
        color.setRGB(0.06 + c[0] * 0.48, 0.08 + c[1] * 0.44, 0.12 + c[2] * 0.5, THREE.SRGBColorSpace);
        colors.push(color.r, color.g, color.b);
      }
    }
  }
  const fiberGeometry = new THREE.BufferGeometry();
  fiberGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fiberGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const fiberMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.58, blending: THREE.NormalBlending, depthWrite: false });
  const fiberLines = new THREE.LineSegments(fiberGeometry, fiberMaterial);
  fiberLines.renderOrder = 2;
  group.add(fiberLines);
  group.rotation.set(0.04, -0.32, 0.04);
  return group;
}

function makeCortexGeometry(side, lite) {
  const geometry = new THREE.SphereGeometry(1, lite ? 36 : 56, lite ? 26 : 42);
  const position = geometry.attributes.position;
  const vector = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vector.fromBufferAttribute(position, i);
    const originalX = vector.x;
    const folds = Math.sin(vector.y * 24 + vector.z * 7) * Math.sin(vector.z * 20 - originalX * 5) * 0.026
      + Math.sin((vector.y + vector.z) * 34) * 0.012;
    const inferiorTaper = vector.y < -0.35 ? 1 - (-vector.y - 0.35) * 0.18 : 1;
    vector.multiplyScalar(1 + folds);
    vector.x = originalX * 0.76 * inferiorTaper + side * 0.43;
    vector.y = vector.y * 1.02 + 0.12;
    vector.z = vector.z * 1.23 + 0.05 * (1 - originalX * originalX);
    position.setXYZ(i, vector.x, vector.y, vector.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}
