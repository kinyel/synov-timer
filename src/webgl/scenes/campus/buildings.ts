import * as THREE from 'three';
import { Kit } from './kit';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Wedge (right-triangle prism) for sawtooth roofs: vertical face toward -z. */
function wedge(w: number, h: number, d: number): THREE.BufferGeometry {
  const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(d, 0), new THREE.Vector2(0, h)]);
  const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  g.rotateY(-Math.PI / 2);
  g.translate(w / 2, 0, -d / 2);
  return g;
}

/** Shallow dish for the ops centre: a lathed spherical cap. */
function dish(radius: number): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * 0.75;
    pts.push(new THREE.Vector2(Math.sin(a) * radius, (1 - Math.cos(a)) * radius));
  }
  for (let i = 10; i >= 0; i--) {
    const a = (i / 10) * 0.75;
    pts.push(new THREE.Vector2(Math.sin(a) * radius * 0.97, (1 - Math.cos(a)) * radius + 0.02));
  }
  return new THREE.LatheGeometry(pts, 28);
}

/** A glass volume wrapped by white floor slabs and corner columns: the model's basic modern block. */
function framedBlock(k: Kit, w: number, h: number, d: number, x: number, y: number, z: number, floor = 0.34) {
  k.box('glass', w - 0.06, h, d - 0.06, x, y, z, 0.01);
  const floors = Math.max(1, Math.round(h / floor));
  for (let i = 0; i <= floors; i++) k.box('clay', w, 0.05, d, x, y + Math.min(h - 0.05, i * (h / floors)), z, 0.012);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box('clay', 0.07, h, 0.07, x + sx * (w / 2 - 0.035), y, z + sz * (d / 2 - 0.035), 0.01);
}

/** Rooftop plant: a few units and a louvred screen. */
function plant(k: Kit, x: number, y: number, z: number, w: number, d: number) {
  k.box('shade', w * 0.32, 0.12, d * 0.28, x - w * 0.2, y, z - d * 0.15, 0.015);
  k.box('shade', w * 0.22, 0.09, d * 0.22, x + w * 0.22, y, z + d * 0.12, 0.015);
  k.cylinder('shade', 0.06, 0.06, 0.05, x + w * 0.22, y + 0.09, z + d * 0.12, 14);
}

export interface Building {
  id: 'hq' | 'appEngine' | 'itsm' | 'itam' | 'itom' | 'integration' | 'architecture';
  name: string;
  kit: Kit;
  height: number;
  /** Footprint half-extents, for contact shadows and spacing. */
  half: THREE.Vector2;
}

/** Raleston HQ: glass tower on a podium, white frame, a single gold fin like the model's signature. */
export function hq(): Building {
  const k = new Kit();
  k.box('shade', 4.3, 0.06, 3.4, 0, 0, 0, 0.02);
  k.box('glass', 3.8, 0.46, 2.9, 0, 0.06, 0, 0.01);
  k.box('clay', 4.1, 0.1, 3.2, 0, 0.52, 0, 0.02);
  k.row('clay', 9, V(-1.85, 0.06, 1.42), V(1.85, 0.06, 1.42), [0.06, 0.46, 0.06]);
  // Entrance canopy + gold doors.
  k.box('clay', 1.5, 0.04, 0.7, 0.5, 0.4, 1.75, 0.01);
  k.row('clay', 2, V(-0.15, 0.06, 2.0), V(1.15, 0.06, 2.0), [0.035, 0.34, 0.035]);
  k.box('gold', 0.7, 0.3, 0.03, 0.5, 0.06, 1.46, 0.006);
  // Tower, set back on the podium.
  framedBlock(k, 2.2, 3.7, 1.75, -0.55, 0.62, -0.35, 0.37);
  k.box('clay', 2.3, 0.22, 1.85, -0.55, 4.32, -0.35, 0.03);
  plant(k, -0.55, 4.54, -0.35, 1.8, 1.4);
  // The gold fin: a full-height vertical panel on the tower's front-right corner.
  k.box('gold', 0.16, 3.9, 0.7, 0.62, 0.52, -0.1, 0.03);
  // Podium roof terrace: planters and a pergola.
  k.box('shade', 1.1, 0.08, 0.5, 1.2, 0.62, 0.7, 0.02);
  k.row('clay', 5, V(0.9, 0.62, 1.05), V(1.7, 0.62, 1.05), [0.03, 0.3, 0.03]);
  k.box('clay', 1.0, 0.03, 0.55, 1.3, 0.92, 0.85, 0.008);
  return { id: 'hq', name: 'Raleston HQ', kit: k, height: 4.7, half: new THREE.Vector2(2.15, 1.7) };
}

/** App Engine: a fabrication hall with a sawtooth north-light roof and gold roll-up doors. */
export function appEngine(): Building {
  const k = new Kit();
  k.box('clay', 2.7, 0.62, 1.9, 0, 0, 0, 0.02);
  for (let i = 0; i < 4; i++) {
    const z = -0.7 + i * 0.47;
    k.add('clay', wedge(2.6, 0.32, 0.46), new THREE.Matrix4().makeTranslation(0, 0.62, z));
    k.box('glass', 2.5, 0.3, 0.02, 0, 0.63, z - 0.22, 0.004);
  }
  k.row('gold', 3, V(-0.8, 0, 0.96), V(0.8, 0, 0.96), [0.5, 0.46, 0.03]);
  k.row('shade', 4, V(-1.2, 0.5, 0.97), V(1.2, 0.5, 0.97), [0.12, 0.05, 0.02]);
  framedBlock(k, 0.9, 0.5, 0.8, 1.75, 0, 0.45, 0.25);
  k.box('clay', 1.0, 0.06, 0.9, 1.75, 0.5, 0.45, 0.015);
  return { id: 'appEngine', name: 'App Engine', kit: k, height: 0.95, half: new THREE.Vector2(1.8, 1.0) };
}

/** ITSM: an L-shaped service centre with a deep canopy over its forecourt. */
export function itsm(): Building {
  const k = new Kit();
  framedBlock(k, 2.4, 0.7, 0.9, 0, 0, -0.45, 0.35);
  framedBlock(k, 0.9, 0.7, 1.5, -0.75, 0, 0.55, 0.35);
  k.box('clay', 2.5, 0.08, 1.0, 0, 0.7, -0.45, 0.02);
  k.box('clay', 1.0, 0.08, 1.6, -0.75, 0.7, 0.55, 0.02);
  k.box('clay', 1.5, 0.05, 1.1, 0.55, 0.42, 0.5, 0.012);
  k.box('gold', 1.52, 0.03, 0.04, 0.55, 0.43, 1.06, 0.006);
  k.row('clay', 3, V(0.05, 0, 1.0), V(1.2, 0, 1.0), [0.04, 0.42, 0.04]);
  plant(k, 0.4, 0.78, -0.45, 1.6, 0.8);
  return { id: 'itsm', name: 'ITSM', kit: k, height: 0.9, half: new THREE.Vector2(1.25, 1.1) };
}

/** ITAM: the asset warehouse: long and low, loading docks, skylight strips, a gold fascia band. */
export function itam(): Building {
  const k = new Kit();
  k.box('clay', 3.2, 0.82, 1.9, 0, 0, 0, 0.02);
  k.box('gold', 3.22, 0.14, 0.03, 0, 0.62, 0.96, 0.008);
  for (let i = 0; i < 5; i++) {
    const x = -1.2 + i * 0.6;
    k.box('shade', 0.36, 0.38, 0.03, x, 0.02, 0.96, 0.006);
    k.box('clay', 0.46, 0.03, 0.22, x, 0.42, 1.06, 0.006);
  }
  for (let i = 0; i < 3; i++) k.box('glass', 2.6, 0.03, 0.16, 0, 0.82, -0.55 + i * 0.5, 0.008);
  k.box('shade', 0.6, 0.12, 0.4, -1.1, 0.82, -0.4, 0.02);
  return { id: 'itam', name: 'ITAM', kit: k, height: 0.95, half: new THREE.Vector2(1.6, 1.0) };
}

/** ITOM: an operations centre with a roof dish and a row of cooling units. */
export function itom(): Building {
  const k = new Kit();
  framedBlock(k, 2.2, 0.62, 1.5, 0, 0, 0, 0.31);
  k.box('clay', 2.3, 0.1, 1.6, 0, 0.62, 0, 0.02);
  for (let i = 0; i < 4; i++) {
    const x = -0.85 + i * 0.32;
    k.box('shade', 0.26, 0.1, 0.26, x, 0.72, 0.45, 0.015);
    k.cylinder('shade', 0.09, 0.09, 0.025, x, 0.82, 0.45, 16);
  }
  k.cylinder('clay', 0.05, 0.07, 0.3, 0.55, 0.72, -0.25, 12);
  const d = dish(0.42);
  d.rotateX(-0.9);
  k.add('clay', d, new THREE.Matrix4().makeTranslation(0.55, 1.0, -0.25));
  k.cylinder('gold', 0.015, 0.015, 0.22, 0.55, 1.08, -0.05, 8);
  return { id: 'itom', name: 'ITOM', kit: k, height: 1.4, half: new THREE.Vector2(1.15, 0.8) };
}

/** Integration: two blocks joined by sky bridges, gold-edged: systems connected. */
export function integration(): Building {
  const k = new Kit();
  framedBlock(k, 1.0, 1.6, 1.0, -0.85, 0, 0, 0.32);
  framedBlock(k, 1.0, 1.1, 1.0, 0.85, 0, 0.1, 0.275);
  k.box('clay', 1.1, 0.1, 1.1, -0.85, 1.6, 0, 0.02);
  k.box('clay', 1.1, 0.1, 1.1, 0.85, 1.1, 0.1, 0.02);
  for (const [y, z] of [
    [0.45, 0.15],
    [0.85, -0.1],
  ] as const) {
    k.box('glass', 0.72, 0.2, 0.3, 0, y, z, 0.01);
    k.box('clay', 0.74, 0.03, 0.34, 0, y + 0.2, z, 0.008);
    k.box('gold', 0.74, 0.03, 0.34, 0, y - 0.03, z, 0.008);
  }
  plant(k, -0.85, 1.7, 0, 0.8, 0.8);
  return { id: 'integration', name: 'Integration', kit: k, height: 1.8, half: new THREE.Vector2(1.4, 0.6) };
}

/** Enterprise Architecture: a studio of stacked, rotated volumes: structure as design. */
export function architecture(): Building {
  const k = new Kit();
  const vols: [number, number, number, number, number][] = [
    [1.7, 1.2, 0, 0, 0],
    [1.45, 1.0, 0.32, 0.47, 0.22],
    [1.25, 0.9, -0.22, 0.94, -0.18],
  ];
  for (const [w, d, x, y, rot] of vols) {
    const g = new Kit();
    framedBlock(g, w, 0.42, d, 0, 0, 0, 0.21);
    g.box('clay', w + 0.06, 0.05, d + 0.06, 0, 0.42, 0, 0.012);
    const m = new THREE.Matrix4().compose(V(x, y, 0), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), rot), V(1, 1, 1));
    g.transferTo(k, m);
  }
  k.box('gold', 1.27, 0.035, 0.035, -0.22, 1.36, 0.46, 0.008);
  return { id: 'architecture', name: 'Enterprise Architecture', kit: k, height: 1.45, half: new THREE.Vector2(1.0, 0.75) };
}
