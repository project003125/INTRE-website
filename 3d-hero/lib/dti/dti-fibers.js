/**
 * dti-fibers.js — 3D-HERO RCT4 神经层 Line2 纤维束系统
 *
 * 将 rct4-lab S4 方案集成到主项目：
 * - Line2 宽线 + DEC 顶点色 + 双材质（NormalBlending 解剖束 + AdditiveBlending 放射丝）
 * - 电流扫描波直接写入 LineMaterial fragment shader（无需 bloom）
 * - 坐标系变换：lab (x=LR, y=UD, z=BF) → main (X=BF, Y=UD, Z=LR)
 *
 * 用法：
 *   const system = createDTIFibers({ density: 2.0 });
 *   brainMesh.add(system.group);
 *   // 每帧：
 *   system.update(time, currentFlow);
 *   // 滚动控制透明度：
 *   system.setOpacity(opacity);
 *   // 窗口缩放：
 *   system.setResolution(w, h);
 */
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { buildFibers, TRACTS } from './fibers.js';
import { decFromTangent } from './dec.js';

/* ============ 坐标系变换常量 ============
 * Lab 坐标: x=左(-)/右(+), y=下(-)/上(+), z=后(-)/前(+)
 * Main 坐标: X=前(+)/后(-), Y=上(+)/下(-), Z=右(+)/左(-)
 * 映射: main_X = lab_z, main_Y = lab_y, main_Z = lab_x
 *
 * 脑尺寸映射：
 *   lab x (LR, half=0.72) → main Z (half=7.0): scale = 7.0/0.72
 *   lab y (UD, half=0.62) → main Y (half=5.0): scale = 5.0/0.62
 *   lab z (BF, half=0.86) → main X (half=8.5): scale = 8.5/0.86
 */
const SCALE_X = 8.5 / 0.86;   // lab z → main X (front-back)
const SCALE_Y = 5.0 / 0.62;   // lab y → main Y (up-down)
const SCALE_Z = 7.0 / 0.72;   // lab x → main Z (left-right)

/* ============ 电流扫描波 shader 注入 ============
 * v2.7 性能修复：扫描波/脉冲因子只依赖每顶点 vFiberY，
 * 在顶点着色器算好（exp/pow 每顶点 1 次），片元仅用线性插值。
 * 原实现每片元 exp+pow，13676 纤维 × 数百万片元在软件渲染器上导致 2 FPS。
 */
const SWEEP_VERT_INJECT = `
  uniform float uTime;
  uniform float uPulseY;
  varying float vFiberY;
  varying float vSweep;
  varying float vPulse;
`;

const SWEEP_VERT_MAIN = `
  vFiberY = (position.y < 0.5) ? instanceStart.y : instanceEnd.y;
  float _sweepY = mix(-5.0, 5.0, fract(uTime * 0.06));
  vSweep = exp(-pow((vFiberY - _sweepY) * 0.35, 2.0));
  vPulse = exp(-pow((vFiberY - uPulseY) * 1.6, 2.0));
`;

const SWEEP_FRAG_UNIFORMS = `
  uniform float uCurrentFlow;
  uniform float uPulseStrength;
  varying float vSweep;
  varying float vPulse;
`;

const SWEEP_FRAG_LOGIC = `
  /* === v2.9: 电流扫描波 — 按品牌规范 §3.1 用 Navy 600 #1F4880 偏亮版本 === */
  float sweep = vSweep * uCurrentFlow;
  /* v2.7 RX-06: 点击脉冲沿纤维扩散 */
  float pulseFib = vPulse * uPulseStrength;
  /* 扫描波：Navy 600 #1F4880 的偏亮版（保留 DEC 色但叠加品牌色调） */
  vec3 sweepTint = vec3(0.45, 0.60, 0.95);   /* Navy 600 偏亮 + 微量蓝扩展，与品牌一致 */
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * sweepTint + vec3(0.03, 0.05, 0.10), sweep * 0.28);
  diffuseColor.rgb *= 1.0 + sweep * 0.10;
  /* 脉冲：Amber 600 #D97706 强调色（§3.2 仅用于关键标记，<5% 面积由 pulseFib 控制） */
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.85, 0.47, 0.02), pulseFib * 0.35);
  diffuseColor.rgb *= 1.0 + pulseFib * 0.18;
  /* 硬限制：扫描/脉冲后不超过 1.0，避免过 bloom 阈值白爆 */
  diffuseColor.rgb = clamp(diffuseColor.rgb, vec3(0.0), vec3(1.0));
`;

/**
 * 创建自定义 LineMaterial（带电流扫描波）
 */
function createSweepLineMaterial(opts) {
  const mat = new LineMaterial({
    vertexColors: true,
    linewidth: opts.linewidth || 2.0,
    worldUnits: false,
    transparent: true,
    opacity: opts.opacity || 0.65,
    depthWrite: false,
    depthTest: true,
    blending: opts.blending || THREE.NormalBlending,
    dashed: false,
  });

  // 添加自定义 uniforms
  mat.uniforms.uTime = { value: 0 };
  mat.uniforms.uCurrentFlow = { value: 0 };
  mat.uniforms.uPulseY = { value: 0 };          /* v2.7 RX-06 */
  mat.uniforms.uPulseStrength = { value: 0 };   /* v2.7 RX-06 */

  // 注入 vertex shader
  mat.vertexShader = mat.vertexShader
    .replace('#include <common>', '#include <common>\n' + SWEEP_VERT_INJECT)
    .replace('void main() {', 'void main() {\n' + SWEEP_VERT_MAIN);

  // 注入 fragment shader
  mat.fragmentShader = mat.fragmentShader
    .replace('#include <common>', '#include <common>\n' + SWEEP_FRAG_UNIFORMS)
    .replace('#include <color_fragment>', '#include <color_fragment>\n' + SWEEP_FRAG_LOGIC);

  return mat;
}

/**
 * 创建 DTI 纤维束系统
 * @param {Object} opts
 * @param {number} opts.density - 纤维密度倍率 (默认 2.0)
 * @param {number} opts.samples - 每根纤维采样点数 (默认 40)
 * @param {number} opts.jitterScale - 散布缩放 (默认 0.40)
 * @returns {Object} - { group, update, setOpacity, setResolution, dispose }
 */
export function createDTIFibers(opts = {}) {
  const density = opts.density || 2.0;
  const samples = opts.samples || 40;
  const jitterScale = opts.jitterScale || 0.40;
  const plain = !!opts.plain;   /* 诊断：true=原生 LineMaterial（无扫描波注入） */

  const group = new THREE.Group();
  group.name = 'DTIFibers';

  const resolution = new THREE.Vector2(
    typeof window !== 'undefined' ? window.innerWidth : 1920,
    typeof window !== 'undefined' ? window.innerHeight : 1080
  );

  // 双材质系统（v2.8d: 参考图级极细丝绒——单条不可见，数千条叠加出丝绸质感）
  const anatomicalMat = plain ? new LineMaterial({
    vertexColors: true, linewidth: 0.6, worldUnits: false,
    transparent: true, opacity: 0.015, depthWrite: false, depthTest: true,
    blending: THREE.AdditiveBlending, dashed: false,
  }) : createSweepLineMaterial({
    linewidth: 0.6,       /* v2.8d: 0.8→0.6，更细 */
    opacity: 0.015,       /* v2.8d: 0.025→0.015，配合 density 3.5 叠加出丝绒 */
    blending: THREE.AdditiveBlending,
  });
  anatomicalMat.resolution = resolution;

  const radialMat = plain ? new LineMaterial({
    vertexColors: true, linewidth: 0.4, worldUnits: false,
    transparent: true, opacity: 0.005, depthWrite: false, depthTest: true,
    blending: THREE.AdditiveBlending, dashed: false,
  }) : createSweepLineMaterial({
    linewidth: 0.4,       /* v2.8d: 0.5→0.4 */
    opacity: 0.005,       /* v2.8d: 0.008→0.005 */
    blending: THREE.AdditiveBlending,
  });
  radialMat.resolution = resolution;

  const materials = [anatomicalMat, radialMat];
  const line2Objects = [];

  // 生成纤维
  const { fibers, meta } = buildFibers(density, 20260725, jitterScale, samples);

  // 按 tract 分组
  const byTract = {};
  for (let fi = 0; fi < fibers.length; fi++) {
    const f = fibers[fi];
    (byTract[f.tract.id] = byTract[f.tract.id] || []).push(f);
  }

  for (const tract of TRACTS) {
    const list = byTract[tract.id] || [];
    if (list.length === 0) continue;

    const isRadial = tract.kind === 'radial';
    const mat = isRadial ? radialMat : anatomicalMat;

    // 合并所有纤维到单一数组，纤维间用重复点断开
    const allPositions = [];
    const allColors = [];

    for (const f of list) {
      const pts = f.pts;
      const tan = f.tan;

      for (let i = 0; i < samples; i++) {
        // 坐标变换: lab (x, y, z) → main (X=z, Y=y, Z=x)
        const mx = pts[i * 3 + 2] * SCALE_X;
        const my = pts[i * 3 + 1] * SCALE_Y;
        const mz = pts[i * 3] * SCALE_Z;
        allPositions.push(mx, my, mz);

        // DEC 色（使用 lab 空间切线，DEC 约定基于物理方向而非轴名）
        const [r, g, b] = decFromTangent(tan[i * 3], tan[i * 3 + 1], tan[i * 3 + 2]);

        // 端点衰减（中间亮、端点暗）→ 参考图的丝绒感
        const u = i / (samples - 1);
        const atten = 0.55 + 0.45 * Math.sin(u * Math.PI);

        // v2.8c: 色彩压暗——DEC 方向色保持但亮度低，靠叠加出丝绒
        const boost = isRadial ? 0.5 : 0.55;
        allColors.push(r * atten * boost, g * atten * boost, b * atten * boost);
      }
      // 重复最后一个点断开下一根纤维（Line2 退化段技巧）
      const lastIdx = (samples - 1) * 3;
      allPositions.push(
        pts[lastIdx + 2] * SCALE_X,
        pts[lastIdx + 1] * SCALE_Y,
        pts[lastIdx] * SCALE_Z
      );
      allColors.push(0, 0, 0);
    }

    const geo = new LineGeometry();
    geo.setPositions(allPositions);
    geo.setColors(allColors);

    /* v2.7 诊断: legacy=true 用普通 THREE.Line（1px）替代 Line2 宽线 */
    if (opts.legacy) {
      const bgeo = new THREE.BufferGeometry();
      bgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(allPositions), 3));
      bgeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(allColors), 3));
      const lmat = new THREE.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: isRadial ? 0.14 : 0.70,
        depthWrite: false, blending: isRadial ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const l = new THREE.Line(bgeo, lmat);
      l.frustumCulled = false;
      l.renderOrder = isRadial ? 2 : 3;
      l.userData.name = tract.name;
      group.add(l);
      line2Objects.push(l);
      continue;
    }

    const line2 = new Line2(geo, mat);
    line2.computeLineDistances();
    line2.renderOrder = isRadial ? 2 : 3;  // 解剖束在上层
    line2.frustumCulled = false;
    line2.userData.name = tract.name;
    group.add(line2);
    line2Objects.push(line2);
  }

  // 初始透明度为 0（由滚动动画控制）
  group.visible = false;

  /* v2.7 RX-07: 暴露真实纤维折线路径（brainMesh 本地坐标）
     用于三通道粒子沿真实纤维流动（替代旧的 2D brainSDF 采样曲线） */
  const fiberPaths = [];
  {
    const pathStep = Math.max(1, Math.floor(samples / 12));   /* 每根纤维降采样为 ~12 点 */
    for (let fi = 0; fi < fibers.length; fi++) {
      const f = fibers[fi];
      const pts = f.pts;
      const path = [];
      const n = pts.length / 3;
      for (let i = 0; i < n; i += pathStep) {
        path.push(new THREE.Vector3(
          pts[i * 3 + 2] * SCALE_X,   /* lab z (前后) → main X */
          pts[i * 3 + 1] * SCALE_Y,   /* lab y (上下) → main Y */
          pts[i * 3] * SCALE_Z        /* lab x (左右) → main Z */
        ));
      }
      fiberPaths.push(path);
    }
  }

  /**
   * 每帧更新
   * @param {number} time - 累计时间（秒）
   * @param {number} currentFlow - 电流强度 0..1
   * @param {number} pulseY - 脉冲 Y 位置（brain 本地坐标）
   * @param {number} pulseStrength - 脉冲强度 0..1
   */
  function update(time, currentFlow, pulseY = 0, pulseStrength = 0) {
    if (plain) return;   /* 原生 LineMaterial 无自定义 uniform */
    for (const mat of materials) {
      mat.uniforms.uTime.value = time;
      mat.uniforms.uCurrentFlow.value = currentFlow;
      mat.uniforms.uPulseY.value = pulseY;
      mat.uniforms.uPulseStrength.value = pulseStrength;
    }
  }

  /**
   * 设置点击脉冲（RX-06：脉冲沿纤维扩散）
   * @param {number} y - brain 本地坐标 Y（targetY 范围约 ±5）
   * @param {number} strength - 0..1
   */
  function setPulse(y, strength) {
    if (plain) return;
    for (const mat of materials) {
      mat.uniforms.uPulseY.value = y;
      mat.uniforms.uPulseStrength.value = strength;
    }
  }

  /**
   * 设置整体透明度（由滚动进度控制）
   * @param {number} opacity - 0..1
   */
  function setOpacity(opacity) {
    group.visible = opacity > 0.001;
    // v2.8d: 与材质基础值一致
    anatomicalMat.uniforms.opacity.value = 0.015 * opacity;
    radialMat.uniforms.opacity.value = 0.005 * opacity;
  }

  /**
   * 更新分辨率（窗口缩放时调用）
   */
  function setResolution(w, h) {
    resolution.set(w, h);
    // 必须同步到每个材质的 uniform（LineMaterial.resolution setter 使用 .copy()）
    anatomicalMat.resolution = resolution;
    radialMat.resolution = resolution;
  }

  /**
   * 释放资源
   */
  function dispose() {
    for (const obj of line2Objects) {
      if (obj.geometry) obj.geometry.dispose();
    }
    for (const mat of materials) {
      mat.dispose();
    }
  }

  return {
    group,
    meta,
    update,
    setOpacity,
    setResolution,
    dispose,
    fiberPaths,   /* v2.7: 真实纤维路径（粒子通道用） */
    setPulse,     /* v2.7 RX-06: 脉冲沿纤维扩散 */
    // 暴露材质供高级控制
    materials: { anatomicalMat, radialMat },
  };
}
