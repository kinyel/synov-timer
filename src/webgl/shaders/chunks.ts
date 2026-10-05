/** Shared GLSL snippets, kept as TS strings so they type-check next to the uniforms that use them. */

export const hash = /* glsl */ `
float hash11(float n) { return fract(sin(n) * 43758.5453123); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
`;

/** 2D value noise + fbm, cheap enough for smoke, clouds and grain-free shimmer. */
export const noise = /* glsl */ `
float vnoise2(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0)), c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm2(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise2(p); p *= 2.02; a *= 0.5; }
  return s;
}
`;

/** Anti-aliased line mask for a repeating grid coordinate (uses screen-space derivatives). */
export const gridLine = /* glsl */ `
float gridLine(vec2 coord, float width) {
  vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float l = min(g.x, g.y);
  return 1.0 - smoothstep(width - 0.5, width + 0.5, l);
}
`;
