/**
 * fibers.js — 程序化解剖纤维束生成器
 *
 * 坐标系：x = 左(-)/右(+)，y = 下(-)/上(+)，z = 后(-)/前(+)
 * 脑尺度：宽 ~1.5，高 ~1.3，长 ~1.8（场景单位）
 *
 * 每条 tract 定义一侧（+x）的脊柱控制点，mirror=true 自动生成对侧。
 * 每根纤维 = 控制点加高斯抖动 → CatmullRom 曲线 → 等距采样 SAMPLES 点。
 *
 * 输出：{ fibers: [{tract, pts:Float32Array, tan:Float32Array, rand}], meta }
 */
import * as THREE from 'three';

export const SAMPLES = 64;

/* ---------------- 纤维束解剖定义 ---------------- */
export const TRACTS = [
  {
    id: 'CC', name: '胼胝体', latin: 'Corpus Callosum',
    ctrl: [[-0.60,0.02,0.42],[-0.42,0.38,0.34],[-0.10,0.56,0.10],[0.10,0.56,-0.05],[0.42,0.38,-0.28],[0.60,0.00,-0.50]],
    mirror: false, count: 320, jitter: 0.012, radius: 0.020,
  },
  {
    id: 'CST', name: '皮质脊髓束', latin: 'Corticospinal Tract',
    ctrl: [[0.30,0.62,0.10],[0.24,0.42,0.02],[0.17,0.22,-0.04],[0.13,0.02,-0.10],[0.09,-0.28,-0.14],[0.06,-0.58,-0.10]],
    mirror: true, count: 210, jitter: 0.010, radius: 0.016,
  },
  {
    id: 'AF', name: '弓状束', latin: 'Arcuate Fasciculus',
    ctrl: [[0.52,-0.18,0.30],[0.58,0.02,0.02],[0.52,0.22,-0.22],[0.34,0.36,-0.10],[0.34,0.38,0.30],[0.40,0.30,0.48]],
    mirror: true, count: 160, jitter: 0.011, radius: 0.015,
  },
  {
    id: 'CG', name: '扣带束', latin: 'Cingulum',
    ctrl: [[0.12,0.02,0.52],[0.15,0.30,0.44],[0.16,0.44,0.10],[0.15,0.40,-0.30],[0.13,0.22,-0.52],[0.11,0.02,-0.62]],
    mirror: true, count: 140, jitter: 0.010, radius: 0.014,
  },
  {
    id: 'SLF', name: '上纵束', latin: 'Superior Longitudinal F.',
    ctrl: [[0.48,0.12,0.50],[0.58,0.20,0.15],[0.56,0.20,-0.20],[0.42,0.16,-0.52],[0.30,0.12,-0.66]],
    mirror: true, count: 160, jitter: 0.011, radius: 0.015,
  },
  {
    id: 'ILF', name: '下纵束', latin: 'Inferior Longitudinal F.',
    ctrl: [[0.46,-0.24,0.44],[0.54,-0.28,0.05],[0.48,-0.24,-0.35],[0.36,-0.18,-0.62]],
    mirror: true, count: 140, jitter: 0.011, radius: 0.015,
  },
  {
    id: 'UF', name: '钩束', latin: 'Uncinate Fasciculus',
    ctrl: [[0.40,-0.32,0.34],[0.50,-0.18,0.32],[0.46,0.00,0.40],[0.32,0.10,0.50]],
    mirror: true, count: 100, jitter: 0.010, radius: 0.014,
  },
  {
    id: 'FX', name: '穹窿', latin: 'Fornix',
    ctrl: [[0.09,-0.28,0.28],[0.08,0.00,0.24],[0.10,0.18,0.05],[0.14,0.14,-0.30],[0.20,-0.02,-0.52]],
    mirror: true, count: 90, jitter: 0.009, radius: 0.013,
  },
  {
    id: 'OR', name: '视放射', latin: 'Optic Radiation',
    ctrl: [[0.14,0.02,-0.06],[0.26,0.00,-0.28],[0.28,0.02,-0.55]],
    spread: {0:[0.03,0.03,0.03], 1:[0.04,0.06,0.04], 2:[0.08,0.08,0.05]},
    mirror: true, count: 170, jitter: 0.009, radius: 0.014,
  },
  {
    id: 'ATR', name: '前丘脑放射', latin: 'Anterior Thalamic R.',
    ctrl: [[0.12,0.06,0.02],[0.20,0.16,0.25],[0.28,0.24,0.50]],
    spread: {2:[0.06,0.05,0.04]},
    mirror: true, count: 130, jitter: 0.010, radius: 0.014,
  },
  {
    id: 'IFOF', name: '下额枕束', latin: 'Inf. Fronto-Occipital F.',
    ctrl: [[0.34,0.02,0.52],[0.46,-0.06,0.15],[0.42,-0.04,-0.25],[0.32,0.00,-0.58]],
    mirror: true, count: 120, jitter: 0.015, radius: 0.015,
  },
  {
    id: 'CR', name: '放射冠', latin: 'Corona Radiata',
    ctrl: [[0.15,0.12,0.00],[0.24,0.32,0.04],[0.38,0.52,0.08]],
    spread: {0:[0.03,0.02,0.06], 2:[0.10,0.06,0.18]},
    mirror: true, count: 300, jitter: 0.012, radius: 0.012,
  },
  {
    // 全脑放射填充层：模拟 whole-brain tractography，从中心种子团向壳内表面
    // 发射全向径向丝 → 填满脑轮廓 + 补全 DEC 彩虹（参考图的丝绒灵魂）
    id: 'WB', name: '全脑放射', latin: 'Whole-brain Radiata',
    kind: 'radial', mirror: false, count: 1500,
  },
];

/* ---------------- 可复现随机数 ---------------- */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- 纤维生成 ---------------- */
/**
 * 生成全部纤维
 * @param {number} density 密度倍率 (0.3 ~ 3.0)
 * @param {number} seed 随机种子
 * @param {number} jitterScale 散布缩放 (0.3=极紧密 ~ 2.0=松散)
 */
export function buildFibers(density = 1, seed = 20260725, jitterScale = 1.0, samples = SAMPLES) {
  const rng = mulberry32(seed);
  const fibers = [];
  for (const tract of TRACTS) {
    const n = Math.max(4, Math.round(tract.count * density));
    const sides = tract.mirror ? [1, -1] : [1];
    const gen = tract.kind === 'radial'
      ? (s) => makeRadialFiber(tract, rng, s, samples)
      : (s) => makeFiberScaled(tract, rng, s, jitterScale, samples);
    for (const sign of sides) {
      for (let i = 0; i < n; i++) fibers.push(gen(sign));
    }
  }
  return { fibers, meta: { total: fibers.length, tracts: TRACTS.length } };
}

/* ---------------- 全脑放射丝：中心种子团 → 壳内表面，全向 ---------------- */
function makeRadialFiber(tract, rng, sign, samples = SAMPLES) {
  const g = () => {
    const u = Math.max(rng(), 1e-9), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const A = 0.72, B = 0.62, C = 0.86;                 // 脑椭球半轴
  const cz = 1 - 2 * rng();                            // 球面均匀方向
  const rxy = Math.sqrt(Math.max(0, 1 - cz * cz));
  const phi = 2 * Math.PI * rng();
  const dx = rxy * Math.cos(phi), dy = rxy * Math.sin(phi), dz = cz;
  const rDir = 1 / Math.sqrt((dx / A) ** 2 + (dy / B) ** 2 + (dz / C) ** 2);

  const cx = 0.0, cy = -0.06, czz = 0.02;              // 种子团中心（略偏下=丘脑/脑干）
  const seedJit = 0.075;                               // 种子团体积，避免所有丝交于一点
  const lenF = 0.42 + rng() * 0.40;                    // 丝长比例 0.42..0.82（不戳壳）
  const endR = rDir * lenF;

  const start = new THREE.Vector3(cx + g() * seedJit, cy + g() * seedJit, czz + g() * seedJit);
  const end = new THREE.Vector3(
    cx + dx * endR + g() * 0.012,
    cy + dy * endR + g() * 0.012,
    czz + dz * endR + g() * 0.012
  );
  // 端点 clamp 到脑椭球内（留 0.86 余量），杜绝毛刺戳壳
  const ell = ((end.x - cx) / A) ** 2 + ((end.y - cy) / B) ** 2 + ((end.z - czz) / C) ** 2;
  if (ell > 0.86 * 0.86) {
    const s = (0.86) / Math.sqrt(ell);
    end.x = cx + (end.x - cx) * s; end.y = cy + (end.y - cy) * s; end.z = czz + (end.z - czz) * s;
  }
  const lerp = (a, b, t) => a.clone().lerp(b, t);
  const band = 0.013, bend = 0.088;                    // 沿程丝带宽 + 优雅弧度（长程穿过中心）
  const m1 = lerp(start, end, 0.33).add(new THREE.Vector3(g() * bend, g() * bend, g() * bend))
    .add(new THREE.Vector3(g() * band, g() * band, g() * band));
  const m2 = lerp(start, end, 0.66).add(new THREE.Vector3(g() * bend, g() * bend, g() * bend))
    .add(new THREE.Vector3(g() * band * 1.4, g() * band * 1.4, g() * band * 1.4));

  const curve = new THREE.CatmullRomCurve3([start, m1, m2, end], false, 'catmullrom', 0.5);
  const P = curve.getSpacedPoints(samples - 1);
  const pts = new Float32Array(samples * 3);
  const tan = new Float32Array(samples * 3);
  for (let i = 0; i < samples; i++) {
    pts[i * 3] = P[i].x; pts[i * 3 + 1] = P[i].y; pts[i * 3 + 2] = P[i].z;
  }
  for (let i = 0; i < samples; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(samples - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z;
    const l = Math.hypot(tx, ty, tz) || 1;
    tan[i * 3] = tx / l; tan[i * 3 + 1] = ty / l; tan[i * 3 + 2] = tz / l;
  }
  return { tract, curve, pts, tan, rand: rng() };
}

function makeFiberScaled(tract, rng, sign, jScale, samples = SAMPLES) {
  const g = () => {
    const u = Math.max(rng(), 1e-9), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const N = tract.ctrl.length;
  // fanning 包络：端点散开成毛刷、中间收束 → 参考图的丝绒/扇形形态
  const FAN_MID = 0.62, FAN_END = 1.85;
  const ctrlPts = tract.ctrl.map((c, k) => {
    const t = N > 1 ? k / (N - 1) : 0.5;
    const edge = Math.pow(Math.abs(t - 0.5) * 2, 1.4);   // 0@mid → 1@ends
    const fan = FAN_MID + (FAN_END - FAN_MID) * edge;
    let sx, sy, sz;
    if (tract.spread && tract.spread[k]) {
      // 作者手工指定散布的端点：保留原值，仅轻微 fan
      const f2 = 0.7 + 0.5 * edge;
      sx = tract.spread[k][0] * f2; sy = tract.spread[k][1] * f2; sz = tract.spread[k][2] * f2;
    } else {
      sx = tract.jitter * fan; sy = tract.jitter * fan; sz = tract.jitter * fan;
    }
    return new THREE.Vector3(
      (c[0] + g() * sx * jScale) * sign,
      (c[1] + g() * sy * jScale),
      (c[2] + g() * sz * jScale)
    );
  });
  const curve = new THREE.CatmullRomCurve3(ctrlPts, false, 'catmullrom', 0.5);
  const P = curve.getSpacedPoints(samples - 1);
  const pts = new Float32Array(samples * 3);
  const tan = new Float32Array(samples * 3);
  for (let i = 0; i < samples; i++) {
    pts[i * 3] = P[i].x; pts[i * 3 + 1] = P[i].y; pts[i * 3 + 2] = P[i].z;
  }
  for (let i = 0; i < samples; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(samples - 1, i + 1)];
    let tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z;
    const l = Math.hypot(tx, ty, tz) || 1;
    tan[i * 3] = tx / l; tan[i * 3 + 1] = ty / l; tan[i * 3 + 2] = tz / l;
  }
  return { tract, curve, pts, tan, rand: rng() };
}
