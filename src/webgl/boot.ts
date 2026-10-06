import * as THREE from 'three';
import { $introDone, $reducedMotion, $sceneReady, $tier, $webgl, live } from '../lib/store';
import { completeAll, reportLoad } from '../lib/loader';
import { detectTier } from '../lib/tier';
import { Engine } from './core/Engine';
import { CampusScene } from './scenes/campus/CampusScene';
import { CityScene } from './scenes/city/CityScene';
import { scroll } from './scroll';

function hasWebGL2(): boolean {
  try {
    return !!document.createElement('canvas').getContext('webgl2');
  } catch {
    return false;
  }
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
/** Timing marks, visible in DevTools › Performance and read by scripts/load.mjs. */
const mark = (name: string) => performance.mark(`raleston:${name}`);
/** Resolve when the main thread is idle (falls back to a short timeout). */
const idle = () =>
  new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r(), { timeout: 1500 }) : setTimeout(r, 200)));

/**
 * Starts the single site-wide WebGL layer.
 *
 * Only what the first viewport needs is built and compiled before the curtain
 * lifts: the campus, with exactly the lights it renders with (shader programs
 * depend on the light set, so warming with extra lights would leave the real
 * variants to compile mid-scroll). The x-ray lines and the industries city are
 * built and pre-compiled afterwards in idle time, or on demand if the visitor
 * scrolls there first.
 */
export async function boot(canvas: HTMLCanvasElement): Promise<Engine | null> {
  if (!hasWebGL2()) {
    $webgl.set('unavailable');
    document.documentElement.classList.add('no-webgl');
    completeAll();
    return null;
  }
  $webgl.set('ok');
  mark('boot');
  reportLoad('engine', 1);

  const tier = await detectTier($reducedMotion.get());
  $tier.set(tier);
  document.documentElement.dataset.tier = String(tier);

  mark('tier');
  const engine = new Engine(canvas, tier);
  mark('engine');
  engine.shouldRender = () => scroll.world !== 'none';
  // Rest when only a sliver of 3D shows and the page is still.
  engine.canRest = () => scroll.coverage < 0.3 && live.speed < 0.02;
  engine.canReconfigure = () => scroll.world === 'none' || scroll.coverage < 0.3 || live.speed < 0.002;
  engine.band = () => (scroll.world === 'none' ? null : { top: scroll.bandTop, bottom: scroll.bandBottom });
  engine.onTierDrop = (t) => {
    $tier.set(t);
    document.documentElement.dataset.tier = String(t);
  };
  reportLoad('environment', 1);

  const campus = new CampusScene(engine);
  engine.add(campus);
  mark('campus');

  campus.settle();
  await engine.warm();
  mark('compiled');
  reportLoad('compile', 1);
  campus.reset();
  engine.start();
  await nextFrame();
  reportLoad('frame', 1);
  mark('ready');
  $sceneReady.set(true);

  $introDone.subscribe((done) => {
    if (!done) return;
    if ($reducedMotion.get()) campus.settle();
    else campus.playIntro();
  });

  // ── Below-the-fold 3D, prepared without blocking the first viewport ──────
  let city: CityScene | null = null;
  const buildCity = () => {
    if (!city) {
      city = new CityScene(engine);
      engine.add(city);
    }
    return city;
  };
  // If someone reaches Industries before idle time gets there, build it now.
  engine.beforeFrame = () => {
    if (scroll.world === 'city' && !city) buildCity();
  };

  /** Compile `show` with the light set it will actually render with. */
  const precompile = async (show: THREE.Object3D, hide: THREE.Object3D[]) => {
    const was = [show.visible, ...hide.map((h) => h.visible)];
    show.visible = true;
    for (const h of hide) h.visible = false;
    // compileAsync traverses synchronously; visibility can be restored at once.
    const pending = engine.renderer.compileAsync(engine.scene, engine.camera);
    show.visible = was[0]!;
    hide.forEach((h, i) => (h.visible = was[i + 1]!));
    await pending;
  };

  /**
   * Draw `show` once into a tiny offscreen target: uploads its geometry to the
   * GPU and compiles its shadow programs now, instead of on the first visible
   * frame (which otherwise cost ~90 ms right at a section boundary).
   */
  const warmRender = (show: THREE.Object3D, hide: THREE.Object3D[]) => {
    const r = engine.renderer;
    const rt = new THREE.WebGLRenderTarget(64, 64);
    const was = [show.visible, ...hide.map((h) => h.visible)];
    const culled: THREE.Object3D[] = [];
    show.visible = true;
    for (const h of hide) h.visible = false;
    show.traverse((o) => {
      if (o.frustumCulled) (o.frustumCulled = false), culled.push(o);
    });
    const needs = r.shadowMap.needsUpdate;
    r.shadowMap.needsUpdate = true;
    r.setRenderTarget(rt);
    r.render(engine.scene, engine.camera);
    r.setRenderTarget(null);
    r.shadowMap.needsUpdate = needs;
    for (const o of culled) o.frustumCulled = true;
    show.visible = was[0]!;
    hide.forEach((h, i) => (h.visible = was[i + 1]!));
    rt.dispose();
  };

  void (async () => {
    if (!$introDone.get()) await new Promise<void>((r) => $introDone.listen((d) => d && r()));
    // Let the build-up play undisturbed, then prepare the rest in idle time.
    await new Promise((r) => setTimeout(r, 1800));
    await idle();
    campus.campus.ensureXray();
    await precompile(campus.group, []);
    await idle();
    warmRender(campus.group, []);
    await idle();
    const c = buildCity();
    await precompile(c.group, [campus.group]);
    await idle();
    warmRender(c.group, [campus.group]);
    mark('city');
  })();

  if (import.meta.env.DEV || new URLSearchParams(location.search).has('debug')) Object.assign(window, { __engine: engine, __campus: campus, __city: () => city, __scroll: scroll });
  return engine;
}
