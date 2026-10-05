import * as THREE from 'three';
import { Kit } from '../campus/kit';
import { hq } from '../campus/buildings';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export type DistrictId = 'finance' | 'healthcare' | 'government' | 'tech' | 'manufacturing' | 'energy';

export interface DistrictModel {
  id: DistrictId;
  kit: Kit;
  /** Height of the tallest element, for framing and the label anchor. */
  height: number;
  radius: number;
  /** Animated parts (turbine rotors, smoke emitters) in district-local space. */
  rotors?: THREE.Vector3[];
  stacks?: THREE.Vector3[];
}

/** Glass block wrapped in white floor slabs: the basic modern volume. */
function block(k: Kit, w: number, h: number, d: number, x: number, z: number, y = 0, floor = 0.3) {
  k.box('glass', w - 0.05, h, d - 0.05, x, y, z, 0.01);
  const n = Math.max(1, Math.round(h / floor));
  for (let i = 0; i <= n; i++) k.box('clay', w, 0.04, d, x, y + Math.min(h - 0.04, i * (h / n)), z, 0.01);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box('clay', 0.06, h, 0.06, x + sx * (w / 2 - 0.03), y, z + sz * (d / 2 - 0.03), 0.01);
}

/** Finance: a cluster of towers; the tallest wears a gold crown band. */
function finance(): DistrictModel {
  const k = new Kit();
  block(k, 0.9, 3.2, 0.9, 0, 0);
  k.box('clay', 0.96, 0.12, 0.96, 0, 3.2, 0, 0.02);
  k.box('gold', 0.98, 0.26, 0.98, 0, 3.32, 0, 0.02);
  k.box('clay', 0.7, 0.08, 0.7, 0, 3.58, 0, 0.02);
  block(k, 0.75, 2.3, 0.75, 1.0, 0.35);
  k.box('clay', 0.8, 0.1, 0.8, 1.0, 2.3, 0.35, 0.02);
  block(k, 0.7, 1.7, 1.0, -0.85, 0.5);
  k.box('clay', 0.76, 0.1, 1.06, -0.85, 1.7, 0.5, 0.02);
  block(k, 0.6, 1.2, 0.6, 0.35, -1.0);
  k.box('clay', 0.66, 0.08, 0.66, 0.35, 1.2, -1.0, 0.02);
  return { id: 'finance', kit: k, height: 3.7, radius: 1.5 };
}

/** Healthcare: an H-plan hospital with a rooftop helipad and an entrance canopy. */
function healthcare(): DistrictModel {
  const k = new Kit();
  block(k, 0.7, 1.2, 2.2, -0.8, 0);
  block(k, 0.7, 1.2, 2.2, 0.8, 0);
  block(k, 0.95, 0.9, 0.6, 0, 0);
  for (const x of [-0.8, 0.8]) k.box('clay', 0.76, 0.08, 2.26, x, 1.2, 0, 0.02);
  k.box('clay', 1.0, 0.08, 0.66, 0, 0.9, 0, 0.02);
  // Helipad: a disc with an H, on the right wing.
  k.cylinder('shade', 0.32, 0.32, 0.03, 0.8, 1.28, -0.5, 32);
  k.box('gold', 0.05, 0.012, 0.3, 0.72, 1.31, -0.5, 0.004);
  k.box('gold', 0.05, 0.012, 0.3, 0.88, 1.31, -0.5, 0.004);
  k.box('gold', 0.16, 0.012, 0.05, 0.8, 1.31, -0.5, 0.004);
  k.box('clay', 0.9, 0.04, 0.5, 0, 0.42, 1.3, 0.01);
  k.row('clay', 2, V(-0.35, 0, 1.5), V(0.35, 0, 1.5), [0.04, 0.42, 0.04]);
  return { id: 'healthcare', kit: k, height: 1.4, radius: 1.5 };
}

/**
 * Government: a colonnaded hall under copper-green roofs and a short clock
 * tower, a nod to Ottawa's Parliament Hill, kept civic and secular.
 */
function government(): DistrictModel {
  const k = new Kit();
  k.box('shade', 2.6, 0.12, 1.3, 0, 0, 0, 0.02);
  k.box('clay', 2.3, 0.75, 0.9, 0, 0.12, -0.05, 0.02);
  k.row('clay', 11, V(-1.1, 0.12, 0.5), V(1.1, 0.12, 0.5), [0.06, 0.62, 0.06]);
  k.box('clay', 2.42, 0.08, 1.12, 0, 0.74, 0.05, 0.015);
  // Hipped copper roof as two stepped slabs.
  k.box('mint', 2.36, 0.12, 1.02, 0, 0.82, 0.02, 0.05);
  k.box('mint', 2.0, 0.1, 0.62, 0, 0.94, 0.02, 0.05);
  // Clock tower: square shaft, clock faces, low copper cap.
  k.box('clay', 0.42, 1.25, 0.42, 0, 0.9, -0.1, 0.02);
  k.box('gold', 0.2, 0.2, 0.012, 0, 1.75, 0.115, 0.004);
  k.box('gold', 0.012, 0.2, 0.2, 0.215, 1.75, -0.1, 0.004);
  k.box('mint', 0.48, 0.1, 0.48, 0, 2.15, -0.1, 0.03);
  k.box('mint', 0.32, 0.12, 0.32, 0, 2.25, -0.1, 0.03);
  return { id: 'government', kit: k, height: 2.4, radius: 1.4 };
}

/** Technology: a ring-shaped campus around a green courtyard, plus a lab block. */
function tech(): DistrictModel {
  const k = new Kit();
  const ring = 12;
  for (let i = 0; i < ring; i++) {
    const a = (i / ring) * Math.PI * 2;
    const g = new Kit();
    block(g, 0.52, 0.55, 0.3, 0, 0, 0, 0.275);
    g.box('clay', 0.56, 0.06, 0.34, 0, 0.55, 0, 0.01);
    g.transferTo(k, new THREE.Matrix4().compose(V(Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), -a + Math.PI / 2), V(1, 1, 1)));
  }
  k.cylinder('shade', 0.75, 0.75, 0.03, 0, 0, 0, 40);
  block(k, 0.6, 0.9, 0.5, 1.6, -1.0);
  k.box('gold', 0.62, 0.05, 0.52, 1.6, 0.9, -1.0, 0.01);
  return { id: 'tech', kit: k, height: 1.0, radius: 1.6 };
}

/** Manufacturing: a sawtooth-roof factory with two stacks that breathe soft smoke. */
function manufacturing(): DistrictModel {
  const k = new Kit();
  k.box('clay', 2.4, 0.55, 1.5, 0, 0, 0, 0.02);
  for (let i = 0; i < 4; i++) {
    const z = -0.55 + i * 0.37;
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.36, 0), new THREE.Vector2(0, 0.26)]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 2.3, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    g.translate(1.15, 0.55, z - 0.18);
    k.add('clay', g);
    k.box('glass', 2.2, 0.24, 0.02, 0, 0.56, z - 0.17, 0.004);
  }
  k.row('gold', 2, V(-0.6, 0, 0.76), V(0.6, 0, 0.76), [0.45, 0.4, 0.03]);
  k.cylinder('shade', 0.1, 0.13, 1.5, 0.9, 0, -0.95, 16);
  k.cylinder('shade', 0.08, 0.11, 1.2, 1.3, 0, -0.95, 16);
  return { id: 'manufacturing', kit: k, height: 1.5, radius: 1.5, stacks: [V(0.9, 1.5, -0.95), V(1.3, 1.2, -0.95)] };
}

/** Energy: wind turbines (rotors animated separately) and solar arrays. */
function energy(): DistrictModel {
  const k = new Kit();
  const rotors: THREE.Vector3[] = [];
  for (const [x, z] of [
    [-0.8, -0.6],
    [0.4, -1.0],
    [1.1, 0.2],
  ] as const) {
    k.cylinder('clay', 0.025, 0.05, 1.9, x, 0, z, 10);
    k.box('clay', 0.1, 0.08, 0.16, x, 1.88, z + 0.02, 0.02);
    rotors.push(V(x, 1.92, z + 0.11));
  }
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) {
      const g = new THREE.BoxGeometry(0.42, 0.02, 0.26);
      g.rotateX(-0.45);
      g.translate(-1.0 + c * 0.48, 0.16, 0.55 + r * 0.32);
      k.add('glass', g);
      k.box('shade', 0.03, 0.12, 0.03, -1.0 + c * 0.48, 0, 0.55 + r * 0.32, 0.004);
    }
  return { id: 'energy', kit: k, height: 2.2, radius: 1.5, rotors };
}

export const DISTRICTS: { make: () => DistrictModel; name: string; short: string; body: string }[] = [
  { make: finance, name: 'Financial Services', short: 'Finance', body: 'Resilient, auditable service operations for regulated money.' },
  { make: healthcare, name: 'Healthcare', short: 'Healthcare', body: 'Clinical and IT services that keep care running.' },
  { make: government, name: 'Government & Public Sector', short: 'Government', body: 'Modern citizen and employee services, built to policy.' },
  { make: tech, name: 'Technology & Startups', short: 'Tech', body: 'Platforms that grow as fast as the company does.' },
  { make: manufacturing, name: 'Manufacturing', short: 'Manufacturing', body: 'Plant, asset and operations workflows in one place.' },
  { make: energy, name: 'Energy & Utilities', short: 'Energy', body: 'Field service and asset management for critical infrastructure.' },
];

/** The HQ, at model scale for the city centre. */
export function miniHq(): Kit {
  const src = hq();
  const k = new Kit();
  src.kit.transferTo(k, new THREE.Matrix4().makeScale(0.55, 0.55, 0.55));
  return k;
}
