import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Building } from './buildings';
import type { CampusUniforms } from './materials';

/**
 * X-ray layer: crisp edge lines of every shell, plus the interiors you only
 * see in x-ray (floor plates, cores, racks, machines). Both appear only where
 * the scan plane has already passed, so it "develops" the inside of the model
 * as it sweeps down, like the Ducati x-ray pass in the reference.
 */
function lineMaterial(campus: CampusUniforms, color: string, strength: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uXray: campus.uXray, uScan: campus.uScan, uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vY = w.y;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uXray, uScan, uStrength;
      uniform vec3 uColor;
      varying float vY;
      void main() {
        if (uXray < 0.001 || vY < uScan) discard;
        // Lines just behind the plane are brightest, as if freshly scanned.
        float fresh = 1.0 + 2.5 * (1.0 - smoothstep(0.0, 0.6, vY - uScan));
        gl_FragColor = vec4(uColor * uStrength * fresh, uXray * min(1.0, 0.55 * fresh));
      }
    `,
  });
}

const box = (w: number, h: number, d: number, x: number, y: number, z: number) => {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y + h / 2, z);
  return g;
};

/** Plausible insides for each building type. */
function interiorFor(b: Building): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const w = b.half.x * 2 * 0.86;
  const d = b.half.y * 2 * 0.86;
  const floors = Math.max(1, Math.round(b.height / 0.34));
  switch (b.id) {
    case 'hq':
      for (let i = 1; i < 11; i++) parts.push(box(2.0, 0.015, 1.55, -0.55, 0.62 + i * 0.37, -0.35));
      parts.push(box(0.45, 3.6, 0.45, -0.55, 0.62, -0.35));
      for (let i = 0; i < 4; i++) parts.push(box(0.5, 0.25, 0.3, -1.2 + i * 0.6, 0.08, 0.6));
      break;
    case 'itam':
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) parts.push(box(0.36, 0.55, 0.14, -1.25 + c * 0.5, 0.02, -0.65 + r * 0.42));
      break;
    case 'appEngine':
      for (let i = 0; i < 5; i++) parts.push(box(0.32, 0.22 + (i % 2) * 0.12, 0.4, -1.0 + i * 0.5, 0.02, -0.2));
      parts.push(box(2.3, 0.02, 0.08, 0, 0.3, 0.4));
      break;
    case 'itom':
      for (let i = 0; i < 6; i++) parts.push(box(0.16, 0.42, 0.5, -0.8 + i * 0.32, 0.02, 0));
      break;
    default:
      for (let i = 1; i < floors; i++) parts.push(box(w, 0.015, d, 0, i * (b.height / floors), 0));
      parts.push(box(0.3, b.height * 0.9, 0.3, 0, 0, 0));
  }
  return parts;
}

export interface XrayLayer {
  shells: THREE.LineSegments;
  interiors: THREE.LineSegments;
}

/** Build the x-ray lines for one placed building group. */
export function buildXray(building: Building, group: THREE.Group, campus: CampusUniforms): XrayLayer {
  const shellGeos: THREE.BufferGeometry[] = [];
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) shellGeos.push(new THREE.EdgesGeometry(o.geometry, 28));
  });
  const shells = new THREE.LineSegments(mergeGeometries(shellGeos) ?? new THREE.BufferGeometry(), lineMaterial(campus, '#8FE6FF', 0.9));
  for (const g of shellGeos) g.dispose();
  const inner = interiorFor(building).map((g) => {
    const e = new THREE.EdgesGeometry(g, 20);
    g.dispose();
    return e;
  });
  const interiors = new THREE.LineSegments(mergeGeometries(inner) ?? new THREE.BufferGeometry(), lineMaterial(campus, '#FFC21A', 1.3));
  for (const g of inner) g.dispose();
  for (const l of [shells, interiors]) {
    l.frustumCulled = false;
    l.renderOrder = 5;
  }
  return { shells, interiors };
}
