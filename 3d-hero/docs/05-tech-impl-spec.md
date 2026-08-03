# INTRE 3D Hero — v2.5 技术实现规格

> **文件编号**：05-tech-impl-spec.md（MECE 编号体系：第 5 阶段 · 技术实现规格）
> **本文件位置**：UI 设计流程**第 5 步配套 · 技术实现规格**
> **关联文档**：[01-prd.md](./01-prd.md) D32-D38 · [02-ia.md](./02-ia.md) v1.3 · [03-wireframe.md](./03-wireframe.md) v0.5 · [04-d21-transition-design.md](./04-d21-transition-design.md)
> **版本**：v1.0
> **日期**：2026-07-24
> **状态**：✅ 定稿，待执行
> **关联**：PRD v1.4（D32-D38）、IA v1.3、Wireframe v0.5、D21 转场设计定稿
> **目的**：为 sub-agent 提供精确的实现规格，使任何 agent 在中断后都能接力继续

---

## 0. 执行顺序与依赖关系

```
Phase 0: Bug 修复（无依赖，可立即执行）
    │
Phase 1: WebGL Bloom 后处理（无依赖，可立即执行）
    │
Phase 2: 3D 脑模型 + DTI 投影（依赖 Phase 1 的 EffectComposer 管线）
    │
Phase 3: 真实星座数据替换（无依赖，可与 Phase 1/2 并行）
    │
Phase 4: D21 转场实现（依赖 Phase 2 的 3D 脑模型）
```

---

## Phase 0: Bug 修复

### 0.1 .act 容器 pointer-events 修复

**文件**：`pages/3d-hero.html`
**问题**：`.act { pointer-events: none; }` 导致所有幕内的链接/按钮不可点击
**修复**：在 CSS 中添加：
```css
.act[style*="visibility: visible"] { pointer-events: auto; }
```
或在 JS 的 `updateHUD` 函数中，当 `o > 0.001` 时设置 `actEls[i].style.pointerEvents = 'auto'`，否则 `'none'`。

**推荐方案**：JS 方案更精确。在 `updateHUD` 的 for 循环中，`actEls[i].style.visibility` 赋值之后，加一行：
```js
actEls[i].style.pointerEvents = o > 0.001 ? 'auto' : 'none';
```

### 0.2 SVG 内无效 span 元素

**文件**：`pages/3d-hero.html`
**问题**：L314 `<span class="feat-tag">#02</span>` 在 `<svg>` 内部，HTML span 不是合法 SVG 子元素
**修复**：将该 span 移到 `</svg>` 之后，用 CSS 绝对定位覆盖在 SVG 上方

### 0.3 actTexts 与 HTML 文案不同步

**文件**：`pages/3d-hero.html`
**问题**：JS 中 `actTexts[1].body` 的内容与 HTML 中 `#act-2 .act-body` 的内容不一致
**修复**：将 `actTexts[1].body` 更新为与 HTML 一致：
```js
{ body: '漫天繁星被心智勾勒为星座——大五人格、认知类型、行为模式。人类模式识别，是从无限特征到有限标签的第一步。' },
```

### 0.4 Rail 点击与高亮对齐

**文件**：`pages/3d-hero.html`
**问题**：Rail 有 3 项（现象层/功能层/神经层，data-act 0/1/2），但 `scrollToAct(i)` 的 `ACT_SCROLL_TARGETS` 有 4 项 [0, 0.30, 0.58, 0.88]。Rail 点击 `scrollToAct(i)` 时 i=0 跳到 ACT_SCROLL_TARGETS[0]=0（开场），但 Rail 第一项是"现象层"应对应 Act 2。
**修复**：Rail 点击改为 `scrollToAct(i + 1)`，使 Rail 0→Act2, Rail 1→Act3, Rail 2→Act4。

### 0.5 内联 cursor:none 移除

**文件**：`pages/3d-hero.html`
**问题**：多个元素有 `style="... cursor: none;"` 内联样式，在 prod-mode 下 CSS 的 `cursor: pointer` 无法覆盖内联样式
**修复**：删除所有内联 `cursor: none`，统一由 CSS 类控制

---

## Phase 1: WebGL Bloom 后处理

### 1.1 目标
用 Three.js 的 EffectComposer + UnrealBloomPass 替换 CSS `backdrop-filter` 伪辉光。

### 1.2 实现步骤

1. **导入后处理模块**：在 `<script type="module">` 中，Three.js 导入之后，添加：
```js
// 后处理模块需要从 three.module.js 的 examples 路径导入
// 由于我们使用本地 three.module.js，需要确认是否包含 addons
// 如果不包含，需要将 EffectComposer/RenderPass/UnrealBloomPass 内联或从 CDN 加载
```

**注意**：当前 `lib/three.module.js` 可能不包含 addons。需要检查。如果不包含，有两个选择：
- 选项 A：从 CDN 加载 addons（`https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js` 等）
- 选项 B：将 addons 代码下载到 `lib/` 目录

**推荐选项 A**（CDN），因为 addons 代码量大且更新频繁。

2. **创建 EffectComposer**：在 renderer 创建之后：
```js
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.6,   // strength（辉光强度）
  0.4,   // radius（辉光扩散半径）
  0.85   // threshold（亮度阈值，只有超过此值的像素才辉光）
);
composer.addPass(bloomPass);
```

3. **替换渲染调用**：将 `renderer.render(scene, camera)` 替换为 `composer.render()`

4. **resize 处理**：在 resize 事件中添加 `composer.setSize(innerWidth, innerHeight)`

5. **删除 CSS 伪辉光**：
   - 删除 `#bloom-overlay` 的 CSS 规则（`backdrop-filter: blur(6px) brightness(1.28)` 等）
   - 删除 HTML 中的 `<div id="bloom-overlay">` 元素
   - 删除 prod-mode 中 `#bloom-overlay` 的隐藏规则

6. **reduced-motion 处理**：在 reduced-motion 模式下，将 bloomPass.strength 设为 0.3（降低但不完全关闭）

7. **prod-mode 处理**：在 prod-mode 下，将 bloomPass.strength 设为 0.4（比开发模式略低）

### 1.3 参数调优指南

| 参数 | 推荐值 | 说明 |
|---|---|---|
| strength | 0.6 | 辉光强度，太高会糊 |
| radius | 0.4 | 扩散半径，太大会有"雾气感" |
| threshold | 0.85 | 亮度阈值，只有亮元素（星/节点/amber）才辉光 |

### 1.4 验收标准
- [ ] 星场粒子有柔和光晕
- [ ] 晶格节点在 hover 时辉光增强
- [ ] Amber 色元素（badge/公式芯片）有明显辉光
- [ ] CSS `#bloom-overlay` 元素和样式已完全删除
- [ ] resize 时 composer 正确更新尺寸
- [ ] reduced-motion 下辉光减弱但不消失
- [ ] prod-mode 下辉光参数适当降低

---

## Phase 2: 3D 脑模型 + DTI 纹理投影

### 2.1 目标
将 RCT4 的脑图从 2D PNG 贴图升级为 3D 模型，具有体积感、光照响应和交互能力。

### 2.2 脑模型获取

**推荐来源**（按优先级）：
1. [NIH 3D Print Exchange](https://3dprint.nih.gov/) — 搜索 "brain"，选择低面数模型，CC 协议
2. [Sketchfab](https://sketchfab.com/) — 搜索 "brain low poly"，筛选 downloadable + CC 协议
3. [BrainGL](https://braingl.org/) — 学术级脑模型，可能需要减面

**模型要求**：
- 面数：5,000 - 20,000 面（太低无沟回，太高影响性能）
- 格式：GLB（glTF Binary）
- 朝向：矢状面朝前（与当前 DTI 参考图一致）
- 尺寸：归一化到约 14×18 单位（与当前 dtiPlane 尺寸匹配）

**模型处理**：
- 使用 [gltf-transform](https://gltf-transform.dev/) 或 Blender 减面
- 确保法线正确（用于光照计算）
- 导出为 GLB，放入 `assets/brain.glb`

### 2.3 DTI 纹理投影 Shader

创建自定义 ShaderMaterial，将 `dti-reference.png` 投影到脑模型表面：

```glsl
// Vertex Shader
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment Shader
uniform sampler2D uDTITexture;
uniform float uOpacity;
uniform float uTime;
uniform vec2 uPulsePos;
uniform float uPulseRadius;
uniform float uPulseStrength;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  // 平面投影：将世界坐标 x,y 映射到纹理 UV
  vec2 projUV = vec2(
    (vWorldPosition.x + 7.0) / 14.0,  // 脑模型 x 范围 [-7, 7] → [0, 1]
    (vWorldPosition.y + 9.0) / 18.0   // 脑模型 y 范围 [-9, 9] → [0, 1]
  );
  
  vec4 dtiColor = texture2D(uDTITexture, projUV);
  
  // 菲涅尔边缘光
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
  vec3 fresnelColor = vec3(0.231, 0.435, 0.710) * fresnel * 0.6; // Navy 400
  
  // 漫反射（简单方向光）
  vec3 lightDir = normalize(vec3(0.3, 0.5, 1.0));
  float diffuse = max(dot(vNormal, lightDir), 0.0) * 0.3 + 0.7;
  
  // DTI emissive（纹理自发光）
  vec3 emissive = dtiColor.rgb * 0.8;
  
  // 脉冲环（复用现有 uPulse 逻辑）
  float pulseDist = distance(projUV, uPulsePos);
  float pulseRing = smoothstep(uPulseRadius - 0.02, uPulseRadius, pulseDist) 
                  * smoothstep(uPulseRadius + 0.02, uPulseRadius, pulseDist);
  vec3 pulseColor = vec3(0.961, 0.620, 0.043) * pulseRing * uPulseStrength; // Amber 500
  
  vec3 finalColor = (emissive * diffuse + fresnelColor + pulseColor);
  gl_FragColor = vec4(finalColor, uOpacity * (0.6 + 0.4 * diffuse));
}
```

### 2.4 集成步骤

1. 使用 `GLTFLoader` 加载 `brain.glb`
2. 替换 `dtiPlane` 为加载的脑模型 mesh
3. 将脑模型的 material 替换为上述自定义 ShaderMaterial
4. 脑模型加入 `fibersGroup`（与当前 dtiPlane 同级）
5. 保持 `brainScale` 缩放逻辑不变
6. 纤维束靶点坐标需乘以 `brainScale`（归一化坐标方案）

### 2.5 降级方案
如果 GLB 加载失败，回退到当前的 2D 贴图方案（保留 `dtiPlane` 作为 fallback）。

### 2.6 验收标准
- [ ] 脑模型有体积感，旋转时可见沟回
- [ ] DTI 纹理正确投影到脑表面
- [ ] 菲涅尔边缘光在脑轮廓处可见
- [ ] 脉冲环在脑表面正确扩散
- [ ] brainScale 缩放时纹理不拉伸
- [ ] GLB 加载失败时回退到 2D 贴图
- [ ] 性能：脑模型渲染不超过 2ms/帧

---

## Phase 3: 真实星座数据替换

### 3.1 目标
将 RCT2 的星座从手工坐标替换为真实天文星座数据。

### 3.2 数据源
使用 Hipparcos 星表的前 200 颗亮星（视星等 < 3.0），投影到天球坐标，再映射到 3D 场景的归一化坐标。

### 3.3 星座选择
选择 8 个最易识别的星座（与当前 8 组 CONSTELLATIONS 数量一致）：
1. 北斗七星（Ursa Major 子集）
2. 猎户座（Orion）
3. 仙后座（Cassiopeia）
4. 天鹅座（Cygnus）
5. 天蝎座（Scorpius）
6. 双子座（Gemini）
7. 狮子座（Leo）
8. 小熊座（Ursa Minor，含北极星）

### 3.4 坐标映射
将赤经/赤纬映射到场景坐标：
- 赤经 → x/z（球面投影）
- 赤纬 → y
- 归一化到 [-1, 1] 范围，再乘以星场半径

### 3.5 实现
替换 `CONSTELLATIONS` 数组中的 `stars` 和 `lines` 数据。`lines` 数组使用星座的传统连线模式。

### 3.6 验收标准
- [ ] 8 个星座可被天文爱好者识别
- [ ] 连线模式符合传统星座图
- [ ] 星座在星场中分布均匀，不重叠

---

## Phase 4: D21 转场实现

### 4.1 前置条件
- Phase 1 完成（Bloom 后处理管线就绪）
- Phase 2 完成（3D 脑模型就绪，纤维束靶点可锚定到脑表面）

### 4.2 实现步骤

详见 `04-d21-transition-design.md` §8.2 时间轴和 §10 执行计划。

关键代码改动点：

1. **applyScene 中的 latticeFade 起点**：从 `ss(p, 0.74, 0.88)` 改为 `ss(p, 0.97, 1.0)`
2. **rootGroup.visible**：从 `false` 改为 `true`
3. **rootFibers 终点重建**：从随机后方偏移改为脑区靶点（分区约束采样）
4. **uGrow uniform**：新增，控制纤维束生长进度 `ss(p, 0.70, 0.80)`
5. **接驳点亮**：per-node material 颜色/缩放动画，p 0.80-0.86
6. **注光下行**：复用 makeChannelPoints，方向节点→脑，p 0.86-0.92
7. **脑区点亮**：分 6 批触发 uPulse，p 0.92-0.97
8. **收尾幽灵化**：节点 scale→0.5，opacity→0.3，p 0.97-1.0

### 4.3 RCT4 文案锚定
将 Act 4 的 act-body 文案更新为：
"功能层不是终点。UPLP 统一语义，UBMP 校准行为，UNIP 对接神经——三通道似然经 PSE 贝叶斯融合，更新状态后验。42 维并未消失——它们被锚定在每一束纤维之上。"

### 4.4 验收标准
- [ ] 纤维束从脑区生长并接驳节点
- [ ] 接驳瞬间节点有明确的视觉反馈
- [ ] 光点沿束入脑，脑区逐批点亮
- [ ] 棋盘以幽灵态保留，不完全消失
- [ ] reduced-motion 下定格 p=0.86
- [ ] 60fps 桌面端 / 30fps 移动端

---

## 附录 A：文件清单

| 文件 | 修改类型 | Phase |
|---|---|---|
| `pages/3d-hero.html` | 修改 | 0, 1, 3, 4 |
| `lib/node-details.js` | 已完成 | — |
| `assets/brain.glb` | 新增 | 2 |
| `assets/dti-reference.png` | 保留 | 2（作为纹理源） |

## 附录 B：关键代码位置速查

| 功能 | 行号范围 | 说明 |
|---|---|---|
| PACE_KNOTS | L807-817 | 滚动节奏控制点 |
| ACT_RANGES | L856-861 | 幕淡入淡出区间 |
| ACT_SCROLL_TARGETS | L916 | 键盘/Rail 跳转目标 |
| applyScene | L1886-1966 | 每帧场景更新（核心） |
| rootFibers 构建 | L1549-1596 | 纤维束几何（当前隐藏） |
| brainSDF / sampleInBrain | L1603-1617 | 脑轮廓 SDF |
| dtiMat shader | L1463-1538 | DTI 平面 shader |
| CONSTELLATIONS | L1156-1173 | 星座数据 |
| updateHUD | L874-893 | HUD 更新 |
| actTexts | L1069-1074 | 打字机文案 |
