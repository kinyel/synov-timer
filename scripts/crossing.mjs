/** Frame pacing while wheel-scrolling across Services → Industries and back. URL=... node scripts/crossing.mjs [desktop|mobile] */
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'desktop';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', ...(process.env.UNCAP ? ['--disable-frame-rate-limit', '--disable-gpu-vsync'] : [])] });
const ctx = mode === 'mobile'
  ? await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  : await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto(process.env.URL ?? 'http://localhost:4322/');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(4000);
await p.evaluate(() => { const s = document.getElementById('services'); const y = s.getBoundingClientRect().top + scrollY + s.offsetHeight - innerHeight * 1.4; window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); });
await p.waitForTimeout(1200);
await p.mouse.move(700, 450);
await p.evaluate(() => { window.__dts = []; let l = performance.now(); const f = () => { const n = performance.now(); window.__dts.push(n - l); l = n; requestAnimationFrame(f); }; requestAnimationFrame(f); });
const step = async (dy) => (mode === 'mobile' ? p.evaluate((dy) => scrollBy(0, dy), dy) : p.mouse.wheel(0, dy));
for (let i = 0; i < 40; i++) { await step(55); await p.waitForTimeout(30); }   // down across the boundary
await p.waitForTimeout(700);                                                      // stop with a sliver visible
for (let i = 0; i < 25; i++) { await step(-55); await p.waitForTimeout(30); }  // back up
await p.waitForTimeout(700);
for (let i = 0; i < 12; i++) { await step(260); await p.waitForTimeout(16); }  // fast down
await p.waitForTimeout(900);
const d = (await p.evaluate(() => window.__dts)).slice(2).sort((a, b) => a - b);
const pct = (q) => d[Math.min(d.length - 1, Math.floor(d.length * q))].toFixed(1);
console.log(mode, 'frames', d.length, 'dt p50', pct(0.5), 'p95', pct(0.95), 'p99', pct(0.99), 'max', d.at(-1).toFixed(1), 'over 25ms:', d.filter((x) => x > 25).length);
await b.close();
