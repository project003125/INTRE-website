/**
 * dec.js — DTI Direction-Encoded Color (DEC)
 * 期刊级 DTI 的标准配色：纤维走向 → 颜色
 *   R = |左右分量| (x)   G = |前后分量| (z)   B = |上下分量| (y)
 * 所以：胼胝体(左右横穿)=红，皮质脊髓束(上下)=蓝，上/下纵束(前后)=绿。
 */

export function decFromTangent(tx, ty, tz) {
  let r = Math.abs(tx);
  let g = Math.abs(tz); // 前后
  let b = Math.abs(ty); // 上下
  // 轻微 gamma + 提亮，避免纯黑纤维，保持饱和度
  const gamma = 0.85;
  r = Math.pow(r, gamma) * 0.94 + 0.045;
  g = Math.pow(g, gamma) * 0.94 + 0.045;
  b = Math.pow(b, gamma) * 0.94 + 0.045;
  return [r, g, b];
}

/** 供 shader 使用的 GLSL 版本（嵌入字符串） */
export const DEC_GLSL = /* glsl */`
vec3 decColor(vec3 tan){
  vec3 c = pow(abs(tan), vec3(0.85)) * 0.94 + 0.045;
  return c;
}
`;
