/**
 * v2.9 真实大脑轮廓渲染系统
 * --------------------------------------------------------------------------
 * 取代 v2.7 程序化球壳：基于真实矢状面侧视轮廓（241 个解剖标志点），
 * 围绕中线（Z 轴）旋转展开 12 个角度切片，形成"半透明剪影"线稿。
 * 优点：
 *   1. 真正的脑轮廓（额极前凸、枕极后凸、小脑突起、脑干延伸、外侧裂）
 *   2. 线稿风格（DTI 参考图顶级美学：深色基底 + 轮廓线条 + 内部纤维）
 *   3. 围绕纵轴慢转时，脑壳各角度轮廓渐次显形（更像"线稿图")
 *   4. 性能友好：12 切片 × 241 点 ≈ 3k 顶点（vs 球壳 20k 面）
 */
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

/* 解剖学锚点（按索引；与脑轮廓数据严格对齐） */
const ANCHORS = {
  frontalPole: 0,        // 额极最前
  frontalSuperior: 12,   // 额上回顶
  centralSulcus: 30,     // 中央沟（额顶分界）
  parietalTop: 48,       // 顶叶顶点
  parietoOccipital: 60,  // 顶枕沟
  occipitalPole: 78,     // 枕极最后
  cerebellumTop: 109,    // 小脑上界
  brainstemLowest: 130,  // 脑干最低
  sylvianFissure: 167,   // 外侧裂
  inferiorFrontal: 200,  // 额下回
};

/**
 * 围绕 y 轴旋转一个 3D 点（绕垂直轴展开矢状面轮廓成冠状面切片）
 */
function rotateAroundY(p, angleRad) {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  /* 输入 (x, y, z) 中：x=前后, y=上下, z=0
     输出：x'= x·cos + z·sin, z'= -x·sin + z·cos, y 不变
     目的是把 z=0 的矢状面转成 z'=±r 的冠状面切片 */
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
}

/**
 * 构建大脑轮廓渲染系统（多角度 Line2 切片）
 *
 * @param {object} opts
 * @param {number[][]} opts.outline - 矢状面轮廓数据（[x,y,z][]）
 * @param {number} opts.slices - 围绕 y 轴展开的切片数（默认 12，过多影响性能）
 * @param {number} opts.lineWidth - 线条宽度（世界单位）
 * @param {number} opts.opacity - 整体透明度
 * @returns {object} { group, meta, update, setOpacity, setVisibility, setResolution, dispose, anchors }
 */
export function createBrainShellShells(opts = {}) {
  const outline = opts.outline || [];
  const slices = opts.slices || 12;
  const baseLineWidth = opts.lineWidth || 1.2;
  const baseOpacity = opts.opacity || 0.55;
  /* v2.9: shellOpacityRef 由外部传入 getter（applyScene 调用）以控制全局可见度 */
  let shellOpacityRef = null;

  /* v2.9 修复：必须在所有循环之前定义 resolution，否则 LineMaterial.set 报错 */
  const resolution = new THREE.Vector2(
    typeof window !== 'undefined' ? window.innerWidth : 1920,
    typeof window !== 'undefined' ? window.innerHeight : 1080
  );

  const group = new THREE.Group();
  group.name = 'BrainShellShells';

  const sliceLines = [];
  const sliceAngles = [];

  /* 每条切片的颜色按角度渐变：正侧（z>0 切片）偏冷蓝，背侧（z<0 切片）偏冷紫
     营造"线稿透视感"，让用户能从颜色微妙变化感知脑壳在 3D 空间的位置 */
  /* v2.9: 大脑轮廓线稿色系严格按品牌规范 §3.1 Navy 色阶
     Navy 800 #122F5C 是背景基色（场景 setClearColor），线稿必须比背景亮才能可见
     → 用 Navy 600 #1F4880（主色）作主轮廓线，Navy 400 #3B6FB5（次要）作高亮切片
     → 关键解剖标志（中央沟/外侧裂）用 Amber 600 #D97706（强调色，占面积 <5%） */
  const colorFront = new THREE.Color(0x1F4880);   /* Navy 600 主色（最前/最后切片） */
  const colorSide = new THREE.Color(0x3B6FB5);    /* Navy 400 辅助色（最侧切片） */
  const colorBack = new THREE.Color(0x122F5C);   /* Navy 800 背景色（中间过渡，与底色融合） */

  for (let i = 0; i < slices; i++) {
    /* 切片角度从 +90°（右冠状面）扫到 -90°（左冠状面）*/
    const angleDeg = 90 - (i * 180 / (slices - 1));
    const angleRad = angleDeg * Math.PI / 180;
    sliceAngles.push(angleRad);

    /* 把每个矢状面点绕 y 轴旋转，形成冠状面切片 */
    const positions = [];
    for (const p of outline) {
      const r = rotateAroundY(p, angleRad);
      positions.push(r[0], r[1], r[2]);
    }

    const geo = new LineGeometry();
    geo.setPositions(positions);

    /* 颜色按角度在 front/side/back 之间插值 */
    const t = Math.abs(Math.sin(angleRad));   /* 0=正侧, 1=正前/正后 */
    const c = new THREE.Color().lerpColors(colorSide, t > 0.5 ? colorFront : colorBack, t);

    const mat = new LineMaterial({
      vertexColors: false,
      color: c.getHex(),
      linewidth: baseLineWidth,
      transparent: true,
      opacity: baseOpacity,
      depthWrite: false,
      depthTest: true,
      worldUnits: false,
      dashed: false,
      blending: THREE.NormalBlending,
    });
    /* v2.9 关键：LineMaterial 必须设置 resolution 才能正确渲染屏幕空间线宽 */
    mat.resolution = resolution;

    const line = new Line2(geo, mat);
    line.computeLineDistances();
    line.renderOrder = 4;   // 在纤维之上（轮廓是视觉终极层）
    line.frustumCulled = false;
    line.scale.set(1, 1, 1);
    /* v2.9 关键：每条切片绕 y 轴的固定旋转，使其在不同角度显形 */
    line.rotation.y = angleRad;
    /* 但因为我们已经把数据旋转过，这里不再二次旋转 — 数据本身已经包含 Z 维度 */
    /* 修正：因为数据已旋转，Line2 自身不需要 rotation.y */
    line.rotation.y = 0;

    group.add(line);
    sliceLines.push({ line, mat, angle: angleRad, t });
  }

  /* 中央高亮切片（矢状面侧视图本身，即 z=0 那一层）— 加强对比 */
  /* 实际上切片从 +90 到 -90 时，z=0 的侧视切片不存在（因为是冠状面）；
     这里额外加一条专门渲染的矢状面线稿，绕 y=0 但数据点直接用 outline */
  {
    const geo = new LineGeometry();
    geo.setPositions(outline.flat());
    /* v2.9: 矢状面主轮廓用 Navy 50 #D6E5F3（最亮淡色），与 Navy 800 背景形成最强对比，
       让用户第一眼看到清晰的脑侧视图 */
    const mat = new LineMaterial({
      vertexColors: false,
      color: 0xD6E5F3,   /* Navy 50 — 品牌规范 §3.1 */
      linewidth: baseLineWidth * 1.5,
      transparent: true,
      opacity: baseOpacity * 1.2,
      depthWrite: false,
      depthTest: true,
      worldUnits: false,
      dashed: false,
      blending: THREE.AdditiveBlending,
    });
    mat.resolution = resolution;   /* LineMaterial 必须设 */
    const sagittal = new Line2(geo, mat);
    sagittal.computeLineDistances();
    sagittal.renderOrder = 5;
    sagittal.frustumCulled = false;
    group.add(sagittal);
    sliceLines.push({ line: sagittal, mat, angle: 0, t: 0, isSagittal: true });
  }

  /* 内部解剖结构细节：
     - 中央沟、外侧裂（额顶、颞额分界线）：用金色高亮
     - 小脑上界、脑干最低（重要解剖标志）：用浅紫色辅助
     这些"解剖标签"叠加在基础轮廓上，让用户立刻识别这是大脑 */
  const detailLines = [];
  /* 中央沟 + 外侧裂：选两个解剖区段作高亮 */
  /* v2.9: 解剖分区配色严格按品牌规范 §3.2（Amber 强调色仅用于关键 CTA/标记）
     - 中央沟 + 外侧裂（额顶/颞额分界 = INTRE 核心语义枢纽）：Amber 600 #D97706 强调（<5% 面积）
     - 其他分区（额上回、小脑-脑干）：Navy 400 #3B6FB5 辅助色 */
  const detailSpecs = [
    { from: ANCHORS.centralSulcus, to: ANCHORS.parietalTop, color: 0xD97706, width: baseLineWidth * 1.4, opacity: baseOpacity * 0.85, label: 'central-sulcus' },
    { from: ANCHORS.sylvianFissure, to: ANCHORS.inferiorFrontal, color: 0xD97706, width: baseLineWidth * 1.4, opacity: baseOpacity * 0.85, label: 'sylvian-fissure' },
    { from: ANCHORS.frontalPole, to: ANCHORS.frontalSuperior, color: 0x3B6FB5, width: baseLineWidth, opacity: baseOpacity * 0.7, label: 'frontal-superior' },
    { from: ANCHORS.cerebellumTop, to: ANCHORS.brainstemLowest, color: 0x3B6FB5, width: baseLineWidth, opacity: baseOpacity * 0.7, label: 'cerebellum-brainstem' },
  ];
  for (const spec of detailSpecs) {
    /* 提取区段，但创建闭合环（从 from 到 to，再回到 from，形成"贴片"边界）*/
    const seg = [];
    if (spec.to > spec.from) {
      for (let k = spec.from; k <= spec.to; k++) seg.push(outline[k]);
      for (let k = spec.to; k >= spec.from; k--) seg.push(outline[k]);
    } else {
      for (let k = spec.from; k >= spec.to; k--) seg.push(outline[k]);
      for (let k = spec.to; k <= spec.from; k--) seg.push(outline[k]);
    }
    const geo = new LineGeometry();
    geo.setPositions(seg.flat());
    const mat = new LineMaterial({
      vertexColors: false, color: spec.color,
      linewidth: spec.width, transparent: true, opacity: spec.opacity,
      depthWrite: false, worldUnits: false, blending: THREE.AdditiveBlending,
    });
    mat.resolution = resolution;   /* LineMaterial 必须设 */
    const ln = new Line2(geo, mat);
    ln.computeLineDistances();
    ln.renderOrder = 6;
    ln.frustumCulled = false;
    group.add(ln);
    detailLines.push({ line: ln, mat });
  }

  function update(time, currentFlow = 0) {
    /* v2.9: 全局 shellOpacity 缩放（applyScene 传入，控制可见度） */
    const globalK = (typeof shellOpacityRef === 'function' && shellOpacityRef()) || 1.0;
    /* 让正侧切片（侧视图最显眼）透明度随电流波动 */
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.8);
    for (const s of sliceLines) {
      if (s.isSagittal) {
        s.mat.opacity = baseOpacity * (1.0 + 0.25 * pulse) * (1.0 + 0.4 * currentFlow) * globalK;
      } else {
        s.mat.opacity = baseOpacity * (0.7 + 0.3 * Math.abs(Math.sin(s.angle * 2 + time * 0.3))) * globalK;
      }
    }
    for (const d of detailLines) {
      d.mat.opacity = baseOpacity * (0.7 + 0.3 * pulse) * globalK;
    }
  }

  function setOpacity(v) {
    group.visible = v > 0.001;
    const k = v;
    for (const s of sliceLines) {
      if (s.isSagittal) s.mat.opacity = baseOpacity * 1.2 * k;
      else s.mat.opacity = baseOpacity * k;
    }
    for (const d of detailLines) d.mat.opacity = baseOpacity * 0.9 * k;
  }

  function setVisibility(v) { group.visible = v; }

  function setShellOpacityGetter(fn) { shellOpacityRef = fn; }

  function setResolution(w, h) {
    resolution.set(w, h);
    for (const s of sliceLines) s.mat.resolution = resolution;
    for (const d of detailLines) d.mat.resolution = resolution;
  }

  /* v2.9 终幕呼吸 + 微自转：脑壳整体慢速绕 y 轴左右小幅摆动（±5°）*/
  let baseRotY = 0;
  function applyBreath(time, strength, reducedMotion) {
    if (reducedMotion) return;
    baseRotY = strength * Math.sin(time * 0.25) * 0.08;   /* ±4.6° */
    group.rotation.y = baseRotY;
  }

  function dispose() {
    for (const s of sliceLines) { s.line.geometry.dispose(); s.mat.dispose(); }
    for (const d of detailLines) { d.line.geometry.dispose(); d.mat.dispose(); }
  }

  /* v2.8b 修复：返回 Group 本体并挂载方法（html 期望 brainMesh.isGroup === true，
     且直接调用 brainMesh.update()/applyBreath()/setShellOpacityGetter()） */
  group.update = update;
  group.setOpacity = setOpacity;
  group.setVisibility = setVisibility;
  group.setResolution = setResolution;
  group.setShellOpacityGetter = setShellOpacityGetter;
  group.applyBreath = applyBreath;
  group.dispose = dispose;
  group.userData.meta = { slices: sliceLines.length, detailLines: detailLines.length, anchors: ANCHORS };
  return group;
}