/**
 * Dev-only scene lab (injected for `astro dev` only, see astro.config.mjs).
 * Scrub every section's progress with sliders, outside the page scroll.
 */
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { $introDone, live } from '../lib/store';
import { boot } from '../webgl/boot';
import type { CampusScene } from '../webgl/scenes/campus/CampusScene';
import { scroll } from '../webgl/scroll';

addEventListener('pointermove', (e) => {
  live.pointer.x = (e.clientX / innerWidth) * 2 - 1;
  live.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  live.pointerActive = true;
});

const canvas = document.querySelector<HTMLCanvasElement>('#webgl canvas')!;
const engine = await boot(canvas);
if (engine) {
  const campus = (window as unknown as { __campus: CampusScene }).__campus;
  $introDone.set(true);
  const gui = new GUI({ title: 'Raleston lab' });
  void campus;
  scroll.world = 'campus';
  gui.add(scroll, 'world', ['campus', 'none']);
  gui.add(scroll, 'foundation', 0, 1, 0.001).name('Foundation progress');
  const p = gui.addFolder('Post');
  p.add(engine.post.bloom, 'intensity', 0, 4, 0.01).name('Bloom');
  if (engine.post.ao) p.add(engine.post.ao.configuration, 'intensity', 0, 8, 0.01).name('AO intensity');
}
