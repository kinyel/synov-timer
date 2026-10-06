/**
 * Reproduce the Services → Industries twitch: wheel-scroll until only a sliver
 * of Industries shows, stop, then record per-frame state for 3 s.
 * URL=... node scripts/twitch.mjs [desktop|mobile] [sliverFraction]
 */
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'desktop';
const sliver = Number(process.argv[3] ?? 0.12);
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = mode === 'mobile'
  ? await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  : await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(process.env.URL ?? 'http://localhost:4322/');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(3000);
// Jump near the end of Services, then approach the boundary with real wheel steps.
await p.evaluate(() => { const s = document.getElementById('services'); const y = s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight * 1.6; window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
await p.waitForTimeout(1500);
await p.mouse.move(700, 500);
for (let i = 0; i < 40; i++) {
  const vis = await p.evaluate(() => (innerHeight - document.getElementById('industries').getBoundingClientRect().top) / innerHeight);
  if (vis >= sliver) break;
  if (mode === 'mobile') await p.evaluate(() => scrollBy(0, 40)); else await p.mouse.wheel(0, 60);
  await p.waitForTimeout(60);
}
const out = await p.evaluate(async () => {
  const nav = document.querySelector('[data-nav]');
  const ring = document.querySelector('[data-stair-ring]');
  const stage = document.querySelector('.stair-stage');
  const ind = document.getElementById('industries');
  const rows = [];
  let last = performance.now();
  await new Promise((done) => {
    const t0 = performance.now();
    const f = () => {
      const now = performance.now();
      rows.push({
        dt: +(now - last).toFixed(1),
        y: +scrollY.toFixed(2),
        navTop: +nav.getBoundingClientRect().top.toFixed(2),
        theme: document.documentElement.dataset.theme,
        stageTop: +stage.getBoundingClientRect().top.toFixed(2),
        ring: ring.style.transform.slice(0, 48),
        indTop: +ind.getBoundingClientRect().top.toFixed(2),
        world: window.__scroll?.world,
        clip: document.getElementById('webgl').style.clipPath,
        tier: document.documentElement.dataset.tier,
        fps: Math.round(window.__raleston.live.fps),
      });
      last = now;
      if (now - t0 < 3000) requestAnimationFrame(f); else done();
    };
    requestAnimationFrame(f);
  });
  return rows;
});
const uniq = (k) => [...new Set(out.map((r) => r[k]))];
const dts = out.map((r) => r.dt).sort((a, b) => a - b);
console.log(mode, 'frames', out.length, 'dt p50/p95/max', dts[dts.length >> 1], dts[Math.floor(dts.length * 0.95)], dts.at(-1));
console.log('scrollY values (last 2s):', [...new Set(out.slice(out.length / 3).map((r) => r.y))].length, 'navTop:', uniq('navTop'), 'themes:', uniq('theme'), 'worlds:', uniq('world'), 'tiers:', uniq('tier'));
console.log('stageTop values (last 2s):', [...new Set(out.slice(out.length / 3).map((r) => r.stageTop))].slice(0, 12));
console.log('sample', out.slice(-4));
await b.close();
