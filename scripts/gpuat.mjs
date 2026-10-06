/** Average GPU ms per frame at a fixed scroll spot, with optional tweaks. URL=... node scripts/gpuat.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto((process.env.URL ?? 'http://localhost:4322/') + '?debug');
await p.waitForFunction(() => window.__raleston?.introDone() && window.__engine, null, { timeout: 30000 });
await p.waitForTimeout(6000);
await p.evaluate(() => {
  const e = window.__engine; const gl = e.renderer.getContext(); const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const pending = []; window.__g = [];
  const orig = e.post.composer.render.bind(e.post.composer);
  e.post.composer.render = (dt) => { const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); orig(dt); gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push(q); };
  const poll = () => { while (pending.length && gl.getQueryParameter(pending[0], gl.QUERY_RESULT_AVAILABLE)) { const q = pending.shift(); window.__g.push(gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6); gl.deleteQuery(q); } requestAnimationFrame(poll); };
  requestAnimationFrame(poll);
});
const sample = async (label) => { await p.waitForTimeout(1500); await p.evaluate(() => (window.__g = [])); await p.waitForTimeout(2000); const g = await p.evaluate(() => window.__g); const s = g.sort((a, b) => a - b); console.log(label.padEnd(36), 'gpu ms p50', s[s.length >> 1].toFixed(1), 'p95', s[Math.floor(s.length * 0.95)].toFixed(1)); };
const spot = async (fn) => { await p.evaluate(fn); await p.waitForTimeout(800); };
// Descent spot: industries just starting, 30% of the screen.
await spot(() => { const s = document.getElementById('industries'); window.__raleston.lenis.scrollTo(s.getBoundingClientRect().top + scrollY - innerHeight * 0.7, { immediate: true }); });
await p.mouse.move(700, 450); await p.mouse.wheel(0, 1); // keep it from resting
await p.evaluate(() => { window.__keep = setInterval(() => (window.__raleston.live.speed = 0.05), 16); });
await sample('descent, as is');
await p.evaluate(() => (window.__city().city.clouds.visible = false)); await sample('descent, clouds hidden');
await p.evaluate(() => (window.__city().city.clouds.visible = true));
await p.evaluate(() => { window.__engine.post.bloom.resolution.scale = 0.5; }); await sample('descent, bloom at half res');
await p.evaluate(() => (window.__engine.post.composer.passes[1].enabled = false)); await sample('descent, + AO off');
await p.evaluate(() => (window.__engine.post.composer.passes[1].enabled = true));
await spot(() => window.__raleston.lenis.scrollTo(0, { immediate: true }));
await sample('hero, bloom half res');
await p.evaluate(() => { window.__engine.post.bloom.resolution.scale = 1; }); await sample('hero, bloom full res');
await b.close();
