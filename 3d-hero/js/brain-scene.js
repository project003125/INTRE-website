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
    brain.position.set(mobile ? 0 : 2.05, mobile ? -1.5 : 0, 0);
    brain.scale.setScalar(mobile ? 0.85 : 1.55);
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
      brain.rotation.y = -0.98 + Math.sin(t * 0.14) * 0.07;
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
  loadBrainAnatomy(group);

  const { fibers } = buildFibers(lite ? 0.32 : 0.55, 20261031, 0.62, lite ? 32 : 48);
  const visibleTracts = new Set(['CC', 'CST', 'AF', 'CG', 'SLF', 'ILF', 'UF', 'IFOF', 'FX', 'OR']);
  const positions = [];
  const colors = [];
  const color = new THREE.Color();
  for (const fiber of fibers) {
    if (!visibleTracts.has(fiber.tract.id)) continue;
    const samples = fiber.pts.length / 3;
    for (let i = 0; i < samples - 1; i++) {
      for (const j of [i, i + 1]) {
        positions.push(fiber.pts[j * 3], fiber.pts[j * 3 + 1], fiber.pts[j * 3 + 2]);
        const c = decFromTangent(fiber.tan[j * 3], fiber.tan[j * 3 + 1], fiber.tan[j * 3 + 2]);
        color.setRGB(0.04 + c[0] * 0.66, 0.05 + c[1] * 0.54, 0.08 + c[2] * 0.7, THREE.SRGBColorSpace);
        colors.push(color.r, color.g, color.b);
      }
    }
  }
  const fiberGeometry = new THREE.BufferGeometry();
  fiberGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fiberGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const fiberMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.56, blending: THREE.NormalBlending, depthWrite: false });
  const fiberLines = new THREE.LineSegments(fiberGeometry, fiberMaterial);
  fiberLines.renderOrder = 4;
  group.add(fiberLines);
  group.rotation.set(-0.1, -0.98, -0.03);
  return group;
}

// Allen Human Reference Atlas 3D (2020), HuBMAP CCF v1.2, CC BY 4.0.
// Source: https://github.com/hubmapconsortium/ccf-releases/blob/main/v1.2/models/Allen_F_Brain.glb
// Preprocessed locally into four simplified meshes; no runtime external requests.
function loadBrainAnatomy(group) {
  const materials = {
    cortex: new THREE.MeshStandardMaterial({
      color: 0x6f9ab8, emissive: 0x081e32, emissiveIntensity: 0.32,
      roughness: 0.82, metalness: 0.02, transparent: true, opacity: 0.24,
      depthWrite: false, side: THREE.DoubleSide
    }),
    cerebellum: new THREE.MeshStandardMaterial({
      color: 0x537f9e, emissive: 0x071a2c, emissiveIntensity: 0.28,
      roughness: 0.88, transparent: true, opacity: 0.44, depthWrite: false
    }),
    brainstem: new THREE.MeshStandardMaterial({
      color: 0x456f8e, emissive: 0x071827, emissiveIntensity: 0.24,
      roughness: 0.9, transparent: true, opacity: 0.5, depthWrite: false
    })
  };

  fetch('../assets/brain-anatomy.bin')
    .then(response => {
      if (!response.ok) throw new Error('Brain anatomy unavailable');
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
        const material = name.startsWith('cortex') ? materials.cortex : materials[name];
        const mesh = new THREE.Mesh(geometry, material);
        mesh.renderOrder = 3;
        group.add(mesh);
      }
    })
    .catch(() => {
      group.userData.anatomyUnavailable = true;
    });
}
