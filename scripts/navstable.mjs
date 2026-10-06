/** Header and staircase stability while wheel-scrolling hero → services → industries and back. URL=... node scripts/navstable.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(process.env.URL ?? 'http://localhost:4322/');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(3000);
await p.evaluate(() => { const s = document.getElementById('services'); window.__raleston.lenis.scrollTo(s.getBoundingClientRect().top + scrollY - innerHeight * 1.2, { immediate: true }); });
await p.waitForTimeout(1200);
await p.mouse.move(720, 600);
await p.evaluate(() => {
  window.__s = [];
  const nav = document.querySelector('[data-nav]'); const pill = document.querySelector('[data-nav-pill]');
  const tick = () => { const r = nav.getBoundingClientRect(); window.__s.push({ top: Math.round(r.top * 10) / 10, x: Math.round(pill.getBoundingClientRect().left * 10) / 10, h: Math.round(r.height) }); requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const services = await p.evaluate(() => document.getElementById('services').offsetHeight);
for (let i = 0; i < Math.ceil((services + 900) / 300); i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(45); }
await p.waitForTimeout(600);
for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(60); }
await p.waitForTimeout(600);
const s = await p.evaluate(() => window.__s);
console.log({ frames: s.length, navTop: [...new Set(s.map((x) => x.top))], pillX: [...new Set(s.map((x) => x.x))], navHeights: [...new Set(s.map((x) => x.h))] });
await b.close();
