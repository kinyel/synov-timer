import * as THREE from 'three';
import { gsap } from 'gsap';
import { live } from '../../../lib/store';
import type { Engine, SceneModule, View } from '../../core/Engine';
import { alongShots, applyShot, mixShots, shot, type Shot } from '../../core/shots';
import { anchors, scroll } from '../../scroll';
import { Campus, type Placed } from './Campus';

/** Expertise order on the page (matches the copy in Expertise.astro). */
export const EXPERTISE_ORDER = ['appEngine', 'itsm', 'itam', 'itom', 'integration', 'architecture'] as const;

/** HQ tower centre in world space. */
const TOWER = new THREE.Vector3(-0.55, 2.4, -0.9);
const VISITS_END = 0.72;
const XRAY_START = 0.74;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The campus world. One model, many camera shots, Emons-style: the hero
 * overview, a low orbit around HQ for "Craft", a visit to each expertise
 * building, an x-ray scan of the whole model, and HQ at dusk for "Contact".
 */
export class CampusScene implements SceneModule {
  readonly group = new THREE.Group();
  readonly campus: Campus;
  private sun: THREE.DirectionalLight;
  private sky: THREE.HemisphereLight;
  private view: View | null = null;
  private intro = { lift: 1 };
  private drag = 0;
  private building = true;
  private visits: Placed[];
  private dusk = 0;
  private wasVisible = false;
  private out: Shot = shot([0, 0, 0], 0, 0, 1);
  private tmpA: Shot = shot([0, 0, 0], 0, 0, 1);
  private tmpB: Shot = shot([0, 0, 0], 0, 0, 1);
  private proj = new THREE.Vector3();
  private sunDay = new THREE.Color('#fffaf3');
  private sunDusk = new THREE.Color('#ffb36b');

  constructor(private engine: Engine) {
    const { budget, tier } = engine;
    this.campus = new Campus({ shadows: true, detail: tier >= 2 ? 1 : 0.6 });
    this.group.add(this.campus.root);
    this.visits = EXPERTISE_ORDER.map((id) => this.campus.placed.find((p) => p.building.id === id)!);

    this.sun = new THREE.DirectionalLight('#fffaf3', 4.2);
    this.sun.position.set(-9, 14, 7);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.setScalar(budget.shadowMap);
    const sc = this.sun.shadow.camera;
    sc.left = -13;
    sc.right = 13;
    sc.top = 13;
    sc.bottom = -13;
    sc.near = 1;
    sc.far = 45;
    this.sun.shadow.bias = -0.0003;
    this.sun.shadow.normalBias = 0.02;
    this.sun.shadow.radius = 6;
    this.sun.shadow.blurSamples = 12;
    this.sky = new THREE.HemisphereLight('#eef3ff', '#c3cad6', 0.35);
    this.group.add(this.sun, this.sun.target, this.sky);
    engine.scene.add(this.group);
  }

  /** The model builds itself while the camera settles from a higher, wider angle. */
  playIntro(): gsap.core.Timeline {
    const tl = gsap.timeline();
    this.intro.lift = 1;
    this.building = true;
    // Shadows can't follow the build clip, so they fade in as the model completes: "lights on".
    tl.fromTo(this.sun.shadow, { intensity: 0 }, { intensity: 1, duration: 0.9, ease: 'power2.out' }, 0.9);
    tl.to(this.intro, { lift: 0, duration: 2.4, ease: 'power3.out' }, 0);
    this.campus.playBuild(tl, 0);
    tl.call(() => (this.building = false));
    return tl;
  }

  settle() {
    this.campus.finish();
    this.intro.lift = 0;
    this.sun.shadow.intensity = 1;
    this.building = true;
    requestAnimationFrame(() => requestAnimationFrame(() => (this.building = false)));
  }

  reset() {
    this.campus.reset();
    this.intro.lift = 1;
    this.sun.shadow.intensity = 0;
  }

  resize(view: View) {
    this.view = view;
  }

  // ── Shots ────────────────────────────────────────────────────────────────
  private heroShot(v: View, t: number): Shot {
    const lean = live.pointerActive ? live.pointer.x * 3 : 0;
    const lift = this.intro.lift;
    const az = 36 + Math.sin(t * 0.05) * 4 + lean + this.drag - lift * 22;
    const el = 29 + lift * 18;
    if (v.portrait) return shot([0.2, 1.1, -0.2], az, el, 33 * (1 + lift * 0.35), 0, 0.17);
    if (v.aspect < 1.25) return shot([0.2, 1.1, -0.2], az, el, 28 * (1 + lift * 0.35), 0, 0.08);
    return shot([0.2, 1.1, -0.2], az, el, 23 * (1 + lift * 0.35), 0.16, 0.02);
  }

  /** Low orbit around HQ against the sky, so the kinetic words behind it stay visible. */
  private craftShots(v: View): Shot[] {
    const k = v.portrait ? 1.5 : 1;
    const sy = v.portrait ? 0.12 : -0.02;
    const T: [number, number, number] = [TOWER.x, TOWER.y, TOWER.z];
    return [
      shot(T, 60, 9, 12.5 * k, 0, sy),
      shot([TOWER.x, TOWER.y + 0.2, TOWER.z], 135, 13, 12.5 * k, 0, sy),
      shot(T, 215, 15, 13 * k, 0, sy),
      shot([TOWER.x, TOWER.y - 0.3, TOWER.z], 290, 19, 15 * k, 0, sy),
    ];
  }

  private visitShot(p: Placed, i: number, v: View): Shot {
    const b = p.building;
    const size = b.height * 1.6 + Math.max(b.half.x, b.half.y) * 1.8;
    const target: [number, number, number] = [p.position.x, b.height * 0.4, p.position.z];
    // ITAM sits behind HQ, so it is filmed from the back of the campus.
    const az = b.id === 'itam' ? 205 : 30 + (i % 3) * 12 - (i > 2 ? 8 : 0);
    if (v.portrait) return shot(target, az, 32, (7 + size) * 1.6, 0, 0.2);
    return shot(target, az, 30, 6.5 + size, 0.17, 0.04);
  }

  private xrayShot(v: View, p: number): Shot {
    const az = 30 + p * 40;
    if (v.portrait) return shot([0, 1.2, 0], az, 34, 38, 0, 0.12);
    return shot([0, 1.2, 0], az, 32, 25, 0.12, 0.02);
  }

  private contactShot(v: View, t: number): Shot {
    const az = 20 + t * 1.5;
    if (v.portrait) return shot([TOWER.x, 2.0, TOWER.z], az, 16, 21, 0, 0.16);
    return shot([TOWER.x, 2.0, TOWER.z], az, 14, 14, 0.2, 0);
  }

  /** Expertise progress → camera, which building is the subject, and the x-ray state. */
  private expertise(v: View, p: number, out: Shot): number[] {
    const weights = new Array<number>(6).fill(0);
    if (p < VISITS_END) {
      const f = (p / VISITS_END) * 6;
      const i = Math.min(5, Math.floor(f));
      const u = f - i;
      const blend = smooth(0.62, 1, u);
      const a = this.visitShot(this.visits[i]!, i, v);
      const b = i < 5 ? this.visitShot(this.visits[i + 1]!, i + 1, v) : this.xrayShot(v, 0);
      mixShots(a, b, blend, out);
      weights[i] = 1 - blend;
      if (i < 5) weights[i + 1] = blend;
    } else {
      mixShots(this.xrayShot(v, 0), this.xrayShot(v, 1), (p - VISITS_END) / (1 - VISITS_END), out);
    }
    return weights;
  }

  update(dt: number, t: number) {
    const v = this.view;
    const visible = scroll.world === 'campus';
    this.group.visible = visible;
    this.drag += (live.drag.x * 12 - this.drag) * (1 - Math.exp(-dt * 5));
    // Static shadow map: only request a re-render (three clears the flag after use).
    if (visible && (this.intro.lift > 0.001 || this.building || !this.wasVisible)) this.engine.renderer.shadowMap.needsUpdate = true;
    this.wasVisible = visible;
    if (!visible || !v) return;

    const rig = this.engine.rig;
    const owner = scroll.owner;
    let weights = new Array<number>(6).fill(0);
    let xray = 0;
    let scan = 20;
    let flow = 1;

    if (owner === 'contact' || scroll.contact > 0) {
      applyShot(this.contactShot(v, t), v, rig);
    } else if (owner === 'expertise') {
      const p = scroll.expertise;
      // Normally built in idle time already; this only runs if someone scrolls here first.
      if (p > 0.4) this.campus.ensureXray();
      weights = this.expertise(v, p, this.out);
      applyShot(this.out, v, rig);
      xray = smooth(XRAY_START, XRAY_START + 0.05, p);
      scan = THREE.MathUtils.lerp(5.3, -0.25, smooth(XRAY_START + 0.04, 0.96, p));
    } else if (owner === 'craft') {
      const p = scroll.craft;
      alongShots(this.craftShots(v), p, this.out);
      applyShot(this.out, v, rig);
      // "Lightning results": the data vans speed up while that card is up.
      flow = 1 + 3.5 * smooth(0.28, 0.4, p) * (1 - smooth(0.6, 0.72, p));
    } else {
      // Hero, easing into the first craft shot as the hero scrolls away.
      mixShots(this.heroShot(v, t), this.craftShots(v)[0]!, scroll.hero, this.out);
      applyShot(this.out, v, rig);
    }
    rig.handheld = 0.35;
    rig.parallax = 0.25;
    rig.stiffness = 2.6;

    // Dusk for the contact section: warm low sun, navy sky, every window lit.
    const duskTarget = scroll.contact > 0 ? 1 : 0;
    this.dusk += (duskTarget - this.dusk) * (1 - Math.exp(-dt * 3));
    const d = this.dusk;
    this.sun.color.lerpColors(this.sunDay, this.sunDusk, d);
    this.sun.intensity = THREE.MathUtils.lerp(4.2, 1.6, d);
    this.sky.intensity = THREE.MathUtils.lerp(0.35, 0.12, d);
    this.engine.scene.environmentIntensity = THREE.MathUtils.lerp(0.45, 0.16, d);
    const u = this.campus.uniforms;
    u.uLit.value = THREE.MathUtils.lerp(0.14, 1.8, d);
    u.uXray.value = xray;
    u.uScan.value = scan;

    // Subject highlighting for the expertise tour.
    const anyActive = Math.max(...weights);
    this.visits.forEach((p, i) => {
      const w = weights[i]!;
      p.build.uDim.value = anyActive * (1 - w) * (1 - xray);
      const mat = p.ring.material as THREE.MeshBasicMaterial;
      mat.opacity = w * (0.75 + 0.25 * Math.sin(t * 4)) * (1 - xray);
      p.ring.scale.setScalar(1 + (1 - w) * 0.15);
      // Label anchor in screen pixels.
      this.proj.copy(p.anchor).project(this.engine.camera);
      const a = anchors.expertise[i]!;
      a.x = (this.proj.x * 0.5 + 0.5) * v.width;
      a.y = (-this.proj.y * 0.5 + 0.5) * v.height;
      a.weight = w * (1 - xray);
    });
    this.campus.placed.find((p) => p.building.id === 'hq')!.build.uDim.value = anyActive * (1 - xray);

    this.campus.setFlow(flow);
    this.campus.update(dt, t);
  }
}
