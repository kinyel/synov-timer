import * as THREE from 'three';
import { live, type Tier } from '../../lib/store';
import { BUDGETS, type TierBudget } from '../../lib/tier';
import { createStudioEnvironment } from './environment';
import { createPost, type Post } from './post';

/** Layer for objects the planar reflection skips (glass, tiny details) to keep the mirror pass cheap. */
export const LAYER_NO_REFLECT = 1;

/** The camera pose a scene asks for; the engine eases toward it and layers handheld drift on top. */
export interface CameraRig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  /** 0..1 strength of the handheld drift and pointer parallax. */
  handheld: number;
  parallax: number;
  /** Easing rate toward the pose, per second. */
  stiffness: number;
  /** Added after easing, for impacts and shakes that must stay crisp. */
  offset: THREE.Vector3;
}

export interface View {
  width: number;
  height: number;
  aspect: number;
  portrait: boolean;
  dpr: number;
}

export interface SceneModule {
  /** Called every frame with delta and elapsed seconds. */
  update(dt: number, t: number): void;
  resize?(view: View): void;
  dispose?(): void;
}

/**
 * One renderer, one camera, one transparent canvas for the whole site.
 * Scenes add themselves to `scene`, write the camera `rig`, and are ticked
 * every frame. The canvas is transparent so section backgrounds and giant
 * kinetic type (DOM, below the canvas) show through.
 */
export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  readonly rig: CameraRig = {
    position: new THREE.Vector3(0, 3, 14),
    target: new THREE.Vector3(0, 2, 0),
    fov: 30,
    handheld: 1,
    parallax: 1,
    stiffness: 3.5,
    offset: new THREE.Vector3(),
  };
  readonly view: View = { width: 1, height: 1, aspect: 1, portrait: false, dpr: 1 };
  readonly clock = new THREE.Timer();
  budget: TierBudget;
  tier: Tier;
  post: Post;
  private modules: SceneModule[] = [];
  private look = new THREE.Vector3(0, 2, 0);
  private parallax = new THREE.Vector2();
  private fpsAcc = { t: 0, n: 0, slow: 0 };
  private running = false;
  onTierDrop?: (tier: Tier) => void;
  /** When this returns false (no 3D section on screen) the frame is skipped entirely. */
  shouldRender: () => boolean = () => true;

  constructor(readonly canvas: HTMLCanvasElement, tier: Tier) {
    this.tier = tier;
    this.budget = BUDGETS[tier];
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      stencil: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.autoUpdate = false;
    // VSM: soft, wide penumbrae like studio-lit architectural models (r186 PCF + this pipeline rendered no shadows).
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.scene.environment = createStudioEnvironment(this.renderer);
    this.scene.environmentIntensity = 0.45;
    this.camera.layers.enable(LAYER_NO_REFLECT);
    this.post = createPost(this.renderer, this.scene, this.camera, this.budget);
    this.resize();
    addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  add(module: SceneModule) {
    this.modules.push(module);
    module.resize?.(this.view);
  }

  /** Compile every program up front so the first animated frames never hitch. */
  async warm() {
    await this.renderer.compileAsync(this.scene, this.camera);
    this.post.composer.render(0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.reset();
    this.renderer.setAnimationLoop(this.frame);
  }

  stop() {
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private onVisibility = () => (document.hidden ? this.renderer.setAnimationLoop(null) : this.running && this.renderer.setAnimationLoop(this.frame));

  resize = () => {
    const w = innerWidth;
    // lvh-sized canvas: mobile toolbars collapsing never resize the drawing buffer.
    const h = this.canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio, this.budget.dprMax);
    Object.assign(this.view, { width: w, height: h, aspect: w / h, portrait: w / h < 0.85, dpr });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.post.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    for (const m of this.modules) m.resize?.(this.view);
  };

  private frame = () => {
    this.clock.update();
    const dt = Math.min(this.clock.getDelta(), 1 / 20);
    const t = this.clock.getElapsed();
    if (!this.shouldRender()) return;
    for (const m of this.modules) m.update(dt, t);
    this.updateCamera(dt, t);
    this.post.composer.render(dt);
    this.measure(dt);
  };

  private updateCamera(dt: number, t: number) {
    const r = this.rig;
    const k = 1 - Math.exp(-dt * r.stiffness);
    this.parallax.x += (live.pointer.x - this.parallax.x) * (1 - Math.exp(-dt * 2));
    this.parallax.y += (live.pointer.y - this.parallax.y) * (1 - Math.exp(-dt * 2));
    // Reduced motion: no handheld drift at all.
    const hh = document.documentElement.classList.contains('reduced-motion') ? 0 : r.handheld;
    const hx = (Math.sin(t * 0.21) * 0.1 + Math.sin(t * 0.53 + 1.3) * 0.04) * hh;
    const hy = (Math.sin(t * 0.17 + 2.1) * 0.08 + Math.sin(t * 0.47) * 0.03) * hh;
    const px = this.parallax.x * 0.5 * r.parallax;
    const py = this.parallax.y * 0.3 * r.parallax;
    this.camera.position.x += (r.position.x + hx + px - this.camera.position.x) * k;
    this.camera.position.y += (r.position.y + hy + py - this.camera.position.y) * k;
    this.camera.position.z += (r.position.z - this.camera.position.z) * k;
    this.look.lerp(r.target, k);
    this.camera.position.add(r.offset);
    this.camera.lookAt(this.look);
    this.camera.position.sub(r.offset);
    if (Math.abs(this.camera.fov - r.fov) > 0.01) {
      this.camera.fov += (r.fov - this.camera.fov) * k;
      this.camera.updateProjectionMatrix();
    }
  }

  /** Rolling FPS; if it stays under 40 for ~3s, step the quality tier down once per step. */
  private measure(dt: number) {
    const a = this.fpsAcc;
    a.t += dt;
    a.n++;
    if (a.t < 0.5) return;
    live.fps = a.n / a.t;
    a.slow = live.fps < 40 ? a.slow + 1 : 0;
    a.t = 0;
    a.n = 0;
    if (a.slow >= 6 && this.tier > 0) {
      a.slow = 0;
      this.setTier((this.tier - 1) as Tier);
    }
  }

  setTier(tier: Tier) {
    this.tier = tier;
    this.budget = BUDGETS[tier];
    this.resize();
    this.onTierDrop?.(tier);
  }

  dispose() {
    this.stop();
    removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    for (const m of this.modules) m.dispose?.();
    this.post.dispose();
    this.renderer.dispose();
  }
}
