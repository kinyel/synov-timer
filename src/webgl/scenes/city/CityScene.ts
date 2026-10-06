import * as THREE from 'three';
import type { Engine, SceneModule, View } from '../../core/Engine';
import { applyShot, mixShots, shot, type Shot } from '../../core/shots';
import { anchors, scroll } from '../../scroll';
import { City } from './City';

const VISITS_START = 0.1;
const VISITS_END = 0.86;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Shortest-path azimuth from a to b (degrees). */
const unwrap = (a: number, b: number) => a + ((((b - a) % 360) + 540) % 360) - 180;

interface Light3 {
  sun: THREE.Color;
  sunI: number;
  sunEl: number;
  sky: THREE.Color;
  ground: THREE.Color;
  hemiI: number;
  env: number;
  lit: number;
  glow: number;
}
const DAY: Light3 = { sun: new THREE.Color('#fffaf2'), sunI: 3.8, sunEl: 52, sky: new THREE.Color('#eef3ff'), ground: new THREE.Color('#c3cad6'), hemiI: 0.42, env: 0.45, lit: 0.14, glow: 0 };
const GOLDEN: Light3 = { sun: new THREE.Color('#ffb56b'), sunI: 3.4, sunEl: 14, sky: new THREE.Color('#ffe3c2'), ground: new THREE.Color('#d6b391'), hemiI: 0.42, env: 0.32, lit: 0.55, glow: 0.25 };
const DUSK: Light3 = { sun: new THREE.Color('#ff8f63'), sunI: 0.9, sunEl: 5, sky: new THREE.Color('#2b3770'), ground: new THREE.Color('#0b1030'), hemiI: 0.3, env: 0.12, lit: 2.2, glow: 1 };

/**
 * Industries: a floating model city. The camera descends through a cloud
 * deck, visits each district (its arc and ring light up), and the light runs
 * from day to golden hour to dusk, ending with every window and arc glowing.
 */
export class CityScene implements SceneModule {
  readonly group = new THREE.Group();
  readonly city: City;
  private sun: THREE.DirectionalLight;
  private hemi: THREE.HemisphereLight;
  private view: View | null = null;
  private out: Shot = shot([0, 0, 0], 0, 0, 1);
  private proj = new THREE.Vector3();
  private lastSunEl = -1;
  private camQ = new THREE.Quaternion();
  private wasVisible = false;

  constructor(private engine: Engine) {
    this.city = new City({ shadows: true, detail: engine.tier >= 2 ? 1 : 0.6 });
    this.group.add(this.city.root);
    this.sun = new THREE.DirectionalLight('#ffffff', 3.8);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(engine.budget.shadowMap);
    const sc = this.sun.shadow.camera;
    sc.left = -11;
    sc.right = 11;
    sc.top = 11;
    sc.bottom = -11;
    sc.near = 1;
    sc.far = 60;
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.02;
    this.sun.shadow.radius = 6;
    this.sun.shadow.blurSamples = 12;
    this.hemi = new THREE.HemisphereLight('#eef3ff', '#c3cad6', 0.42);
    this.group.add(this.sun, this.sun.target, this.hemi);
    this.group.visible = false;
    engine.scene.add(this.group);
  }

  resize(view: View) {
    this.view = view;
  }

  private overview(v: View, az: number, el: number, k = 1): Shot {
    if (v.portrait) return shot([0, 0.6, 0], az, el, 36 * k, 0, 0.1);
    if (v.aspect < 1.25) return shot([0, 0.6, 0], az, el, 31 * k, 0, 0.04);
    return shot([0, 0.6, 0], az, el, 24 * k, 0.14, 0.02);
  }

  private districtShot(i: number, v: View, ref: number): Shot {
    const d = this.city.districts[i]!;
    const outward = THREE.MathUtils.radToDeg(Math.atan2(d.position.x, d.position.z));
    const az = unwrap(ref, outward + 28);
    const size = d.model.height * 1.5 + d.model.radius * 1.7;
    const target: [number, number, number] = [d.position.x, d.model.height * 0.35, d.position.z];
    if (v.portrait) return shot(target, az, 32, (8 + size) * 1.7, 0, 0.12);
    return shot(target, az, 30, 9 + size * 1.25, 0.17, -0.02);
  }

  /** Camera and per-district weights for progress p. */
  private choreograph(v: View, p: number, t: number, out: Shot): number[] {
    const weights = new Array<number>(6).fill(0);
    const baseAz = 30;
    if (p < VISITS_START) {
      // Descent through the cloud deck to the overview.
      const e = smooth(0, VISITS_START, p);
      mixShots(this.overview(v, baseAz - 20, 72, 1.25), this.overview(v, baseAz, 36), e, out);
      return weights;
    }
    if (p >= VISITS_END) {
      const last = this.districtShot(5, v, baseAz);
      const fin = this.overview(v, last.az + 40 + (p - VISITS_END) * 60, 40, 1.05);
      mixShots(last, fin, smooth(VISITS_END, VISITS_END + 0.06, p), out);
      return weights.fill(1);
    }
    const f = ((p - VISITS_START) / (VISITS_END - VISITS_START)) * 6;
    const i = Math.min(5, Math.floor(f));
    const u = f - i;
    // Each visit eases in from the previous framing; azimuths unwrap along the way.
    let ref = baseAz;
    const shots: Shot[] = [];
    for (let k = 0; k <= i + 1 && k < 6; k++) {
      const s = this.districtShot(k, v, ref);
      ref = s.az;
      shots.push(s);
    }
    const a = i === 0 ? this.overview(v, baseAz, 36) : shots[i - 1]!;
    const b = shots[i]!;
    // First 40% of each segment travels from the previous framing; then it holds with a slow drift.
    const travel = smooth(0, 0.4, u);
    mixShots(a, b, travel, out);
    out.az += Math.sin(t * 0.2) * 1.5 + (u - 0.4) * 6;
    weights[i] = smooth(0.2, 0.45, u) * (1 - smooth(0.9, 1, u));
    return weights;
  }

  update(dt: number, t: number) {
    const visible = scroll.world === 'city';
    this.group.visible = visible;
    const v = this.view;
    if (!visible || !v) {
      this.wasVisible = false;
      return;
    }
    const p = scroll.industries;
    const weights = this.choreograph(v, p, t, this.out);
    applyShot(this.out, v, this.engine.rig);
    const rig = this.engine.rig;
    rig.handheld = 0.3;
    rig.parallax = 0.2;
    rig.stiffness = 2.6;

    // Day → golden hour → dusk.
    const g = smooth(0.25, 0.55, p);
    const dk = smooth(0.62, 0.9, p);
    const L = (k: keyof Light3) => {
      const a = DAY[k] as number;
      const b = GOLDEN[k] as number;
      const c = DUSK[k] as number;
      return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, g), c, dk);
    };
    this.sun.color.copy(DAY.sun).lerp(GOLDEN.sun, g).lerp(DUSK.sun, dk);
    this.sun.intensity = L('sunI');
    const el = THREE.MathUtils.degToRad(L('sunEl'));
    const az = THREE.MathUtils.degToRad(-60 + g * 50);
    this.sun.position.set(Math.cos(el) * Math.sin(az) * 30, Math.sin(el) * 30, Math.cos(el) * Math.cos(az) * 30);
    this.hemi.color.copy(DAY.sky).lerp(GOLDEN.sky, g).lerp(DUSK.sky, dk);
    this.hemi.groundColor.copy(DAY.ground).lerp(GOLDEN.ground, g).lerp(DUSK.ground, dk);
    this.hemi.intensity = L('hemiI');
    this.engine.scene.environmentIntensity = L('env');
    this.city.uniforms.uLit.value = L('lit');
    this.city.glow.value = L('glow');
    // Re-render the (otherwise static) shadow map only when the sun has moved.
    if (!this.wasVisible || Math.abs(el - this.lastSunEl) > 0.002) {
      this.engine.renderer.shadowMap.needsUpdate = true;
      this.lastSunEl = el;
    }
    this.wasVisible = true;

    // Clouds thin out once we are below the deck. A puff right next to the
    // camera fills the screen several layers deep for no visible gain, so the
    // closest ones are skipped (pure overdraw, the dominant cost of the descent).
    const cam = this.engine.camera.position;
    this.city.clouds.children.forEach((c, i) => {
      const deck = c.position.y > 5 ? p < VISITS_START + 0.04 || i % 3 === 0 : true;
      c.visible = deck && c.position.distanceTo(cam) > 6;
    });

    this.city.setActive(weights);
    const any = p >= VISITS_END ? 0 : Math.max(...weights);
    this.city.districts.forEach((d, i) => {
      d.build.uDim.value = any * (1 - (weights[i] ?? 0));
      this.proj.copy(d.anchor).project(this.engine.camera);
      const a = anchors.industries[i]!;
      a.x = (this.proj.x * 0.5 + 0.5) * v.width;
      a.y = (-this.proj.y * 0.5 + 0.5) * v.height;
      a.weight = p >= VISITS_END ? 0 : weights[i]!;
    });
    this.city.hqBuild.uDim.value = any * 0.6;

    this.engine.camera.getWorldQuaternion(this.camQ);
    this.city.update(dt, t, this.camQ);
  }
}
