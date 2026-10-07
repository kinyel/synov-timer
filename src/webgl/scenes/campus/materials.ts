import * as THREE from 'three';
import { hash } from '../../shaders/chunks';
import { TOKENS } from '../../../lib/tokens';

/**
 * Architectural-model materials: matte white clay, dark glass with lit
 * windows, Raleston gold paint. Every material supports a "build" clip:
 * geometry above uBuild (world y) is cut away and a thin gold line glows at
 * the cut, so buildings grow upward like a model being made.
 *
 * X-ray: when uXray > 0, the scan plane (uScan, world y) sweeps down; the
 * part it has passed (above it) loses its shell and shows edge lines and
 * interiors instead (see xray.ts). A thin line glows where it cuts the model.
 */
export interface BuildUniforms {
  [name: string]: THREE.IUniform;
  /** World-space height the building has been built up to. */
  uBuild: THREE.IUniform<number>;
  /** 0..1 fade toward white, so the building under discussion stands out. */
  uDim: THREE.IUniform<number>;
}

export interface CampusUniforms {
  [name: string]: THREE.IUniform;
  uTime: THREE.IUniform<number>;
  /** Window light strength: ~0.25 by day, up to ~2 at dusk. */
  uLit: THREE.IUniform<number>;
  uGold: THREE.IUniform<THREE.Color>;
  uWarm: THREE.IUniform<THREE.Color>;
  /** X-ray mode 0..1 and the scan plane's world height. */
  uXray: THREE.IUniform<number>;
  uScan: THREE.IUniform<number>;
  uScanColor: THREE.IUniform<THREE.Color>;
}

/** Every model colour comes from the site's design tokens (src/styles/tokens.css). */
export const GOLD = TOKENS.gold;
export const CLAY = TOKENS['grey-50'];
export const CLAY_SHADE = TOKENS['grey-100'];
export const GLASS = TOKENS.navy;
export const TREE = TOKENS['grey-200'];
export const AZURE = TOKENS.azure;
/** Window light: Azure lifted toward white, so lit rooms read as cool and clean. */
export const WINDOW = new THREE.Color(AZURE).lerp(new THREE.Color(TOKENS.white), 0.55).getStyle();

export function createCampusUniforms(): CampusUniforms {
  return {
    uTime: { value: 0 },
    uLit: { value: 0.9 },
    uGold: { value: new THREE.Color(GOLD) },
    uWarm: { value: new THREE.Color(WINDOW) },
    uXray: { value: 0 },
    uScan: { value: 20 },
    uScanColor: { value: new THREE.Color(AZURE) },
  };
}

const buildVertex = (shader: THREE.WebGLProgramParametersWithUniforms) => {
  shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 vWorldP;\nvarying vec3 vObjP;\nvarying vec3 vObjN;')
    // project_vertex exists in every program (incl. the shadow depth pass); worldpos_vertex does not.
    .replace(
      '#include <project_vertex>',
      /* glsl */ `#include <project_vertex>
      vec4 wp = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        wp = instanceMatrix * wp;
      #endif
      vWorldP = (modelMatrix * wp).xyz;
      vObjP = position;
      vObjN = normal;`,
    );
};

const buildFragmentHead = /* glsl */ `
uniform float uBuild, uDim, uXray, uScan;
uniform vec3 uGold, uScanColor;
varying vec3 vWorldP;
varying vec3 vObjP;
varying vec3 vObjN;
`;
const buildClip = /* glsl */ `
if (vWorldP.y > uBuild) discard;
if (uXray > 0.001 && vWorldP.y > uScan) discard;
float buildEdge = 1.0 - smoothstep(0.0, 0.035, uBuild - vWorldP.y);
float scanEdge = uXray * (1.0 - smoothstep(0.0, 0.045, uScan - vWorldP.y));
`;
const buildDim = /* glsl */ `
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.94, 0.95, 0.965), uDim * 0.75);
`;
const buildGlow = /* glsl */ `
totalEmissiveRadiance += uGold * buildEdge * 4.0 * step(uBuild, 50.0) + uScanColor * scanEdge * 4.0;
`;

function withBuild<T extends THREE.MeshStandardMaterial>(
  m: T,
  build: BuildUniforms,
  campus: CampusUniforms,
  key: string,
  extra?: (s: THREE.WebGLProgramParametersWithUniforms) => void,
): T {
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, campus, build);
    buildVertex(shader);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${buildFragmentHead}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${buildClip}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n${buildDim}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n${buildGlow}`);
    extra?.(shader);
  };
  m.customProgramCacheKey = () => `campus-${key}`;
  return m;
}

export interface BuildingMaterials {
  clay: THREE.MeshStandardMaterial;
  shade: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  mint: THREE.MeshStandardMaterial;
}

/** One set per building, so each can be built (clipped) independently while sharing programs. */
export function buildingMaterials(build: BuildUniforms, campus: CampusUniforms): BuildingMaterials {
  const clay = withBuild(new THREE.MeshStandardMaterial({ color: CLAY, roughness: 0.92, metalness: 0, side: THREE.DoubleSide }), build, campus, 'clay');
  const shade = withBuild(new THREE.MeshStandardMaterial({ color: CLAY_SHADE, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }), build, campus, 'clay');
  const gold = withBuild(
    // Gold trims are the model's lights: emissive above 1, so bloom picks them out.
    new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.35, metalness: 0.3, emissive: GOLD, emissiveIntensity: 1.9 }),
    build,
    campus,
    'gold',
  );
  // Dark glass with a window grid: mullions, floor slabs, and warm lit rooms at random.
  const glass = withBuild(
    new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.18, metalness: 0.55, emissive: '#ffffff', side: THREE.DoubleSide }),
    build,
    campus,
    'glass',
    (shader) => {
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>\nuniform float uLit, uTime;\nuniform vec3 uWarm;\n${hash}`)
        .replace(
          '#include <color_fragment>',
          /* glsl */ `#include <color_fragment>
          vec3 an = abs(vObjN);
          float side = step(an.y, 0.5);
          float along = an.x > 0.5 ? vObjP.z : vObjP.x;
          vec2 cell = vec2(along / 0.26, vObjP.y / 0.34);
          vec2 f = fract(cell);
          float mullion = max(step(f.x, 0.07), step(0.93, f.x));
          float slab = step(f.y, 0.16);
          float frame = max(mullion, slab) * side;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.88, 0.92), frame * 0.85);
          float room = hash21(floor(cell) + floor(vObjP.x * 1.7 + vObjP.z * 3.1) * 13.0);
          float lit = step(0.58, room) * (1.0 - frame) * side;
          // Inside faces (seen while a building is rising) read as white model board, not a void.
          if (!gl_FrontFacing) { diffuseColor.rgb = vec3(0.9, 0.91, 0.93); lit = 0.0; frame = 1.0; }
          lit = max(lit, step(0.3, room) * (1.0 - frame) * side * 0.35);`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          /* glsl */ `#include <emissivemap_fragment>
          totalEmissiveRadiance = uWarm * lit * uLit * (0.6 + 0.4 * room);`,
        )
        .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.9, frame);')
        .replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 0.0, frame);');
    },
  );
  const mint = withBuild(new THREE.MeshStandardMaterial({ color: AZURE, roughness: 0.55, metalness: 0.2 }), build, campus, 'mint');
  return { clay, shade, glass, gold, mint };
}
