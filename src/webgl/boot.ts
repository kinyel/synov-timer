import { $introDone, $reducedMotion, $sceneReady, $tier, $webgl } from '../lib/store';
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

/**
 * Starts the single site-wide WebGL layer. Loaded as its own chunk after the
 * DOM has painted, so text is readable long before three.js arrives.
 */
export async function boot(canvas: HTMLCanvasElement): Promise<Engine | null> {
  if (!hasWebGL2()) {
    $webgl.set('unavailable');
    document.documentElement.classList.add('no-webgl');
    completeAll();
    return null;
  }
  $webgl.set('ok');
  reportLoad('engine', 1);

  const tier = await detectTier($reducedMotion.get());
  $tier.set(tier);
  document.documentElement.dataset.tier = String(tier);

  const engine = new Engine(canvas, tier);
  engine.shouldRender = () => scroll.world !== 'none';
  reportLoad('environment', 1);
  await nextFrame();

  const campus = new CampusScene(engine);
  engine.add(campus);
  const city = new CityScene(engine);
  engine.add(city);
  engine.onTierDrop = (t) => {
    $tier.set(t);
    document.documentElement.dataset.tier = String(t);
  };

  // Compile with everything visible so no program compiles mid-scroll.
  campus.settle();
  city.group.visible = true;
  await engine.warm();
  city.group.visible = false;
  reportLoad('compile', 1);
  campus.reset();
  engine.start();
  await nextFrame();
  await nextFrame();
  reportLoad('frame', 1);
  $sceneReady.set(true);

  $introDone.subscribe((done) => {
    if (!done) return;
    if ($reducedMotion.get()) campus.settle();
    else campus.playIntro();
  });

  if (import.meta.env.DEV) Object.assign(window, { __engine: engine, __campus: campus, __city: city, __scroll: scroll });
  return engine;
}
