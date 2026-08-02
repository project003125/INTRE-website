/**
 * brain-shell.js — 幽灵壳脑（Ghost Shell）
 * 程序化脑形：球体 + 多频噪声位移（脑回感）+ 纵裂沟 + 小脑 + 脑干
 * 材质：Fresnel 边缘辉光，深蓝半透明，亮度刻意压在 bloom 阈值之下
 */
import * as THREE from 'three';

/* 廉价确定性伪噪声：多层正弦叠加 */
function pseudoNoise(x, y, z) {
  return (
    Math.sin(x * 3.1 + y * 1.7) * Math.sin(y * 2.9 + z * 2.3) * 0.5 +
    Math.sin(z * 3.7 + x * 1.3) * Math.sin(x * 2.1 + z * 1.9) * 0.3 +
    Math.sin(y * 4.3 + x * 2.7) * 0.2
  );
}

const SHELL_VERT = /* glsl */`
varying vec3 vN;
varying vec3 vView;
varying vec3 vPos;
void main(){
  vPos = position;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const SHELL_FRAG = /* glsl */`
uniform vec3 uRim;
uniform vec3 uBase;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vView;
varying vec3 vPos;
void main(){
  vec3 n = normalize(vN);
  vec3 v = normalize(vView);
  float fres = pow(1.0 - abs(dot(n, v)), 2.2);
  // 脑回褶皱暗纹
  float gyri = sin(vPos.x*22.0 + sin(vPos.y*17.0)*1.5) * sin(vPos.y*19.0 + vPos.z*23.0) * sin(vPos.z*21.0);
  float wrinkle = 0.5 + 0.5 * gyri;
  vec3 col = uBase * (0.35 + 0.4 * wrinkle) + uRim * fres;
  float a = uOpacity * (0.25 + 0.75 * fres) * (0.7 + 0.3 * wrinkle);
  gl_FragColor = vec4(col, a);
}
`;

function displaceBrain(geo, freq, amp, squashBottom) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = pseudoNoise(v.x * freq, v.y * freq, v.z * freq);
    const n2 = pseudoNoise(v.x * freq * 2.3 + 7.0, v.y * freq * 2.3, v.z * freq * 2.3 + 3.0);
    let scale = 1 + amp * n + amp * 0.45 * n2;
    // 纵裂沟：x≈0 且顶部，向内压
    const fissure = Math.exp(-Math.pow(v.x / 0.055, 2)) * Math.max(0, v.y - 0.05);
    scale -= fissure * 0.16;
    v.multiplyScalar(scale);
    if (squashBottom && v.y < -0.35) v.y *= 0.82; // 颅底收平
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function buildShellGroup(opts = {}) {
  const {
    rimColor = 0x3d6ad0,
    baseColor = 0x0a1730,
    opacity = 0.5,
  } = opts;

  const group = new THREE.Group();
  const mat = new THREE.ShaderMaterial({
    vertexShader: SHELL_VERT,
    fragmentShader: SHELL_FRAG,
    uniforms: {
      uRim: { value: new THREE.Color(rimColor) },
      uBase: { value: new THREE.Color(baseColor) },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    blending: THREE.NormalBlending,
  });

  // 大脑
  const brainGeo = new THREE.SphereGeometry(1, 128, 96);
  displaceBrain(brainGeo, 2.6, 0.055, true);
  brainGeo.scale(0.74, 0.66, 0.95);
  const brain = new THREE.Mesh(brainGeo, mat);
  brain.position.y = 0.06;
  group.add(brain);

  // 小脑
  const cereGeo = new THREE.SphereGeometry(1, 64, 48);
  displaceBrain(cereGeo, 5.5, 0.05, false);
  cereGeo.scale(0.34, 0.24, 0.28);
  const cere = new THREE.Mesh(cereGeo, mat);
  cere.position.set(0, -0.40, -0.52);
  group.add(cere);

  // 脑干
  const stemGeo = new THREE.CylinderGeometry(0.075, 0.055, 0.42, 24, 4);
  const stem = new THREE.Mesh(stemGeo, mat);
  stem.position.set(0, -0.52, -0.12);
  stem.rotation.x = 0.22;
  group.add(stem);

  group.userData.material = mat;
  return group;
}
