import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { BuildingMaterials } from './materials';

export type Part = keyof BuildingMaterials;

/**
 * Collects primitives per material, then merges them so each building is a
 * handful of draw calls. All boxes are rounded so edges catch light the way
 * a real architectural model's milled edges do.
 */
export class Kit {
  private parts = new Map<Part, THREE.BufferGeometry[]>();

  add(part: Part, geo: THREE.BufferGeometry, matrix?: THREE.Matrix4) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (matrix) g.applyMatrix4(matrix);
    if (!g.getAttribute('uv')) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((g.getAttribute('position').count) * 2), 2));
    const list = this.parts.get(part) ?? [];
    list.push(g);
    this.parts.set(part, list);
    return this;
  }

  /** Rounded box with its base at y. */
  box(part: Part, w: number, h: number, d: number, x = 0, y = 0, z = 0, r = 0.02, rotY = 0) {
    const g = new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2));
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y + h / 2, z),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY),
      new THREE.Vector3(1, 1, 1),
    );
    return this.add(part, g, m);
  }

  cylinder(part: Part, rTop: number, rBottom: number, h: number, x = 0, y = 0, z = 0, seg = 20) {
    const g = new THREE.CylinderGeometry(rTop, rBottom, h, seg);
    return this.add(part, g, new THREE.Matrix4().makeTranslation(x, y + h / 2, z));
  }

  /** A row of evenly spaced boxes (fins, louvres, columns). */
  row(part: Part, count: number, from: THREE.Vector3, to: THREE.Vector3, size: [number, number, number], r = 0.008) {
    for (let i = 0; i < count; i++) {
      const p = from.clone().lerp(to, count === 1 ? 0.5 : i / (count - 1));
      this.box(part, size[0], size[1], size[2], p.x, p.y, p.z, r);
    }
    return this;
  }

  /** Move every collected part into another kit, transformed (for composing sub-assemblies). */
  transferTo(target: Kit, matrix: THREE.Matrix4) {
    for (const [part, list] of this.parts) for (const g of list) target.add(part, g, matrix);
    this.parts.clear();
  }

  build(mats: BuildingMaterials, shadows = true): THREE.Group {
    const group = new THREE.Group();
    for (const [part, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      if (!merged) continue;
      for (const g of list) g.dispose();
      merged.computeBoundingSphere();
      const mesh = new THREE.Mesh(merged, mats[part]);
      mesh.castShadow = shadows;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}
