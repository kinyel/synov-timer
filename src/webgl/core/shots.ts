import * as THREE from 'three';
import type { CameraRig, View } from './Engine';

const deg = THREE.MathUtils.degToRad;

/** An orbit camera framing: look at `target` from azimuth/elevation (degrees) at `dist`. */
export interface Shot {
  target: THREE.Vector3;
  az: number;
  el: number;
  dist: number;
  /** Screen-space slide of the subject, in fractions of the viewport (x right, y up). */
  shiftX?: number;
  shiftY?: number;
  fov?: number;
}

const tmp = { pos: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), off: new THREE.Vector3(), target: new THREE.Vector3() };

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Blend two shots (angles interpolated directly; keep azimuths unwrapped). */
export function mixShots(a: Shot, b: Shot, t: number, out: Shot): Shot {
  const e = smooth(Math.min(1, Math.max(0, t)));
  out.target = (out.target ?? new THREE.Vector3()).copy(a.target).lerp(b.target, e);
  out.az = a.az + (b.az - a.az) * e;
  out.el = a.el + (b.el - a.el) * e;
  out.dist = a.dist + (b.dist - a.dist) * e;
  out.shiftX = (a.shiftX ?? 0) + ((b.shiftX ?? 0) - (a.shiftX ?? 0)) * e;
  out.shiftY = (a.shiftY ?? 0) + ((b.shiftY ?? 0) - (a.shiftY ?? 0)) * e;
  out.fov = (a.fov ?? 30) + ((b.fov ?? 30) - (a.fov ?? 30)) * e;
  return out;
}

/** Walk a list of shots with progress 0..1 (equal segments). */
export function alongShots(shots: Shot[], p: number, out: Shot): Shot {
  const n = shots.length - 1;
  const x = Math.min(n - 1e-6, Math.max(0, p * n));
  const i = Math.floor(x);
  return mixShots(shots[i]!, shots[i + 1]!, x - i, out);
}

/** Write a shot into the engine's camera rig, sliding the frame so the subject lands where asked. */
export function applyShot(shot: Shot, view: View, rig: CameraRig) {
  const az = deg(shot.az);
  const el = deg(shot.el);
  const { pos, right, up, off, target } = tmp;
  target.copy(shot.target);
  pos.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(shot.dist).add(target);
  const fov = shot.fov ?? 30;
  const halfH = shot.dist * Math.tan(deg(fov / 2));
  right.set(Math.cos(az), 0, -Math.sin(az));
  up.subVectors(target, pos).normalize().cross(right).negate();
  off.copy(right).multiplyScalar(-(shot.shiftX ?? 0) * 2 * halfH * view.aspect).addScaledVector(up, -(shot.shiftY ?? 0) * 2 * halfH);
  rig.position.copy(pos).add(off);
  rig.target.copy(target).add(off);
  rig.fov = fov;
}

export const shot = (target: [number, number, number], az: number, el: number, dist: number, shiftX = 0, shiftY = 0, fov = 30): Shot => ({
  target: new THREE.Vector3(...target),
  az,
  el,
  dist,
  shiftX,
  shiftY,
  fov,
});
