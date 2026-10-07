import * as THREE from 'three';
import { live } from '../../../lib/store';
import { TOKENS } from '../../../lib/tokens';
import type { Engine, SceneModule, View } from '../../core/Engine';
import { applyShot, mixShots, shot, type Shot } from '../../core/shots';
import { anchors, scroll } from '../../scroll';
import { Campus } from './Campus';

/** Section stations, in page order: the slab, three buildings, the x-ray. */
const STATIONS = 5;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The foundation section's world: one CMDB slab with the three practice
 * buildings on it, lit like a model at night. Scroll moves the camera from
 * the whole slab to each building in turn, then x-rays the model so the
 * buildings' contents drop onto the slab as records and relationships.
 */
export class CampusScene implements SceneModule {
  readonly group = new THREE.Group();
  readonly campus: Campus;
  private key: THREE.DirectionalLight;
  private rim: THREE.DirectionalLight;
  private sky: THREE.HemisphereLight;
  private view: View | null = null;
  private drag = 0;
  private wasVisible = false;
  private out: Shot = shot([0, 0, 0], 0, 0, 1);
  private proj = new THREE.Vector3();

  constructor(private engine: Engine) {
    const { budget, tier } = engine;
    this.campus = new Campus({ shadows: true, detail: tier >= 2 ? 1 : 0.6 });
    this.group.add(this.campus.root);

    // A cool key light like moonlight, a blue rim from behind, a navy sky.
    this.key = new THREE.DirectionalLight('#e6ecff', 3.1);
    this.key.position.set(-8, 14, 9);
    this.key.castShadow = true;
    this.key.shadow.mapSize.setScalar(budget.shadowMap);
    const sc = this.key.shadow.camera;
    sc.left = -11;
    sc.right = 11;
    sc.top = 9;
    sc.bottom = -9;
    sc.near = 1;
    sc.far = 40;
    this.key.shadow.bias = -0.0003;
    this.key.shadow.normalBias = 0.02;
    this.key.shadow.radius = 6;
    this.key.shadow.blurSamples = 12;
    this.rim = new THREE.DirectionalLight(TOKENS.azure, 1.4);
    this.rim.position.set(6, 5, -10);
    this.sky = new THREE.HemisphereLight(TOKENS.iris, TOKENS.navy, 0.55);
    this.group.add(this.key, this.key.target, this.rim, this.sky);
    engine.scene.add(this.group);
  }

  settle() {
    this.campus.finish();
    this.key.shadow.intensity = 1;
  }

  resize(view: View) {
    this.view = view;
  }

  // ── Shots ────────────────────────────────────────────────────────────────
  /** The whole slab, the subject sliding right of the copy (desktop) or up (phone). */
  private overview(v: View, t: number, high = 0): Shot {
    const lean = live.pointerActive ? live.pointer.x * 2.5 : 0;
    const az = 28 + Math.sin(t * 0.06) * 3 + lean + this.drag;
    if (v.portrait) return shot([0, 0.4, 0], az, 40 + high * 14, 31 + high * 3, 0, 0.19);
    return shot([0, 0.3, 0.2], az, 33 + high * 14, 21.5 + high * 2, 0.17, 0.02);
  }

  private visit(i: number, v: View): Shot {
    const p = this.campus.placed[i]!;
    const b = p.building;
    const size = b.height * 1.35 + Math.max(p.half.x, p.half.y) * 1.25;
    const target: [number, number, number] = [p.position.x, b.height * 0.5, p.position.z];
    const az = [36, 18, 28][i]! + this.drag * 0.4;
    if (v.portrait) return shot(target, az, 30, (6.5 + size) * 1.75, 0, 0.21);
    return shot(target, az, 26, 6.2 + size * 1.2, 0.18, 0.03);
  }

  /** Section progress → camera. Dwell on each station for the first half of its segment. */
  private camera(v: View, p: number, t: number, out: Shot) {
    const f = Math.min(STATIONS - 1 - 1e-6, Math.max(0, p * (STATIONS - 1)));
    const i = Math.floor(f);
    const blend = smooth(0.5, 1, f - i);
    const at = (k: number): Shot => (k === 0 ? this.overview(v, t) : k === STATIONS - 1 ? this.overview(v, t, 1) : this.visit(k - 1, v));
    mixShots(at(i), at(i + 1), blend, out);
    // Weight of each building as the subject (for highlighting and labels).
    const w = [0, 0, 0];
    if (i >= 1 && i <= 3) w[i - 1] = 1 - blend;
    if (i + 1 >= 1 && i + 1 <= 3) w[i] = Math.max(w[i]!, blend);
    return w;
  }

  update(dt: number, t: number) {
    const v = this.view;
    const visible = scroll.world === 'campus';
    this.group.visible = visible;
    this.drag += (live.drag.x * 10 - this.drag) * (1 - Math.exp(-dt * 5));
    if (visible && !this.wasVisible) this.engine.renderer.shadowMap.needsUpdate = true;
    this.wasVisible = visible;
    if (!visible || !v) return;

    const rig = this.engine.rig;
    const p = scroll.foundation;
    if (p > 0.45) this.campus.ensureXray();
    const weights = this.camera(v, p, t, this.out);
    applyShot(this.out, v, rig);
    rig.handheld = 0.3;
    rig.parallax = 0.22;
    rig.stiffness = 2.6;

    // X-ray over the last station: the scan sweeps down from above the roofs into the slab.
    const xray = smooth(0.78, 0.83, p);
    const scan = THREE.MathUtils.lerp(2.6, -0.26, smooth(0.82, 0.97, p));
    const u = this.campus.uniforms;
    u.uXray.value = xray;
    u.uScan.value = scan;

    // The subject building stands out; the others recede a little.
    const anyActive = Math.max(...weights);
    this.campus.placed.forEach((pl, i) => {
      const w = weights[i]!;
      pl.build.uDim.value = anyActive * (1 - w) * 0.6 * (1 - xray);
      const mat = pl.ring.material as THREE.MeshBasicMaterial;
      mat.opacity = w * (0.7 + 0.3 * Math.sin(t * 3)) * (1 - xray);
      pl.ring.scale.setScalar(1 + (1 - w) * 0.12);
      this.proj.copy(pl.anchor).project(this.engine.camera);
      const a = anchors.foundation[i]!;
      a.x = (this.proj.x * 0.5 + 0.5) * v.width;
      a.y = (-this.proj.y * 0.5 + 0.5) * v.height;
      // Labels show on the overview and for the building being visited.
      a.weight = Math.max(w, 1 - smooth(0, 0.12, p)) * (1 - xray);
    });
    // X-ray labels: records, relationships, discovery.
    this.campus.xrayAnchors.forEach((pt, i) => {
      this.proj.copy(pt).project(this.engine.camera);
      const a = anchors.xray[i]!;
      a.x = (this.proj.x * 0.5 + 0.5) * v.width;
      a.y = (-this.proj.y * 0.5 + 0.5) * v.height;
      a.weight = smooth(0.9, 0.96, p);
    });
    this.campus.update(dt, t);
  }
}
