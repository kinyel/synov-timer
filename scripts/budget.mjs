/**
 * Per-frame budget across the Services → Industries crossing:
 *   cpu = whole GSAP tick (Lenis, DOM choreography, 3D update + submit)
 *   gpu = 3D render time from EXT_disjoint_timer_query_webgl2 (when exposed)
 * Works even when the browser's frame rate is capped (e.g. battery saver).
 * URL=... node scripts/budget.mjs [desktop|mobile]
 */
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'desktop';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-privileged-webgl-extensions', '--enable-webgl-draft-extensions'] });
const ctx = mode === 'mobile'
  ? await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  : await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto((process.env.URL ?? 'http://localhost:4322/') + '?debug');
await p.waitForFunction(() => window.__raleston?.introDone() && window.__engine, null, { timeout: 30000 });
await p.waitForTimeout(6000);
await p.evaluate(() => { const s = document.getElementById('services'); const y = s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight * 1.4; window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
await p.waitForTimeout(1200);
const hasTimer = await p.evaluate(() => {
  const e = window.__engine;
  const gl = e.renderer.getContext();
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  window.__cpu = [];
  window.__gpu = [];
  // CPU: first and last callbacks of each GSAP tick.
  let t0 = 0;
  window.gsapTicker = null;
  const ticker = window.__engine.constructor && null;
  return !!ext;
});
// Wrap the tick from the page's own gsap instance via the engine's frame method.
await p.evaluate(() => {
  const e = window.__engine;
  const gl = e.renderer.getContext();
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const pending = [];
  const orig = e.post.composer.render.bind(e.post.composer);
  e.post.composer.render = (dt) => {
    let q = null;
    if (ext) { q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); }
    orig(dt);
    if (q) { gl.endQuery(ext.TIME_ELAPSED_EXT); q.__meta = { world: window.__scroll.world, cov: +window.__scroll.coverage.toFixed(2), ind: +window.__scroll.industries.toFixed(3), shadow: e.renderer.shadowMap.needsUpdate }; pending.push(q); }
  };
  const poll = () => {
    while (pending.length) {
      const q = pending[0];
      if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
      if (!gl.getParameter(ext.GPU_DISJOINT_EXT)) { const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6; window.__gpu.push(ms); (window.__gpuRows ||= []).push({ ms: +ms.toFixed(1), ...q.__meta }); }
      gl.deleteQuery(q); pending.shift();
    }
    requestAnimationFrame(poll);
  };
  if (ext) requestAnimationFrame(poll);
  // CPU per rAF: from rAF start to end of all rAF callbacks (measured via a late microtask).
  const tick = (ts) => { const start = performance.now(); queueMicrotask(() => setTimeout(() => {}, 0)); requestAnimationFrame(tick); Promise.resolve().then(() => {}); window.__cpuStart = start; };
  const end = () => { if (window.__cpuStart) window.__cpu.push(performance.now() - window.__cpuStart); window.__cpuStart = 0; };
  // Run first (registered before GSAP's next rAF) and measure until the next task.
  const loop = () => { const s = performance.now(); setTimeout(() => window.__cpu.push(performance.now() - s), 0); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
});
await p.mouse.move(700, 450);
const step = async (dy) => (mode === 'mobile' ? p.evaluate((dy) => scrollBy(0, dy), dy) : p.mouse.wheel(0, dy));
for (let i = 0; i < 40; i++) { await step(55); await p.waitForTimeout(30); }
await p.waitForTimeout(700);
for (let i = 0; i < 25; i++) { await step(-55); await p.waitForTimeout(30); }
await p.waitForTimeout(700);
for (let i = 0; i < 12; i++) { await step(260); await p.waitForTimeout(16); }
await p.waitForTimeout(1000);
const r = await p.evaluate(() => ({ cpu: window.__cpu, gpu: window.__gpu, rows: window.__gpuRows || [] }));
if (process.env.ROWS) {
  // Bucket GPU time by coverage to see where the cost sits.
  const buckets = {};
  for (const row of r.rows) { const k = row.world + ' cov ' + (Math.floor(row.cov * 5) / 5).toFixed(1); (buckets[k] ||= []).push(row.ms); }
  for (const [k, v] of Object.entries(buckets)) { const s = v.sort((a, b) => a - b); console.log('   ', k.padEnd(18), 'n', String(v.length).padStart(3), 'p50', s[s.length >> 1].toFixed(1), 'max', s.at(-1).toFixed(1)); }
  console.log('   slow rows:', JSON.stringify(r.rows.filter((x) => x.ms > 16.7).slice(0, 12)));
}
const stats = (a) => { if (!a.length) return 'n/a'; const s = [...a].sort((x, y) => x - y); const q = (k) => s[Math.min(s.length - 1, Math.floor(s.length * k))].toFixed(1); return `n=${s.length} p50 ${q(0.5)} p95 ${q(0.95)} p99 ${q(0.99)} max ${s.at(-1).toFixed(1)} over16.7: ${s.filter((x) => x > 16.7).length}`; };
console.log(mode, 'timerQuery:', hasTimer);
console.log('  cpu ms', stats(r.cpu));
console.log('  gpu ms', stats(r.gpu));
await b.close();
