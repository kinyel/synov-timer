/** Uncapped frame rate at key scroll positions (retina desktop). URL=... node scripts/headroom.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--disable-gpu-vsync'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto(process.env.URL ?? 'http://localhost:4322/');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(5000);
const fps = () => p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; performance.now() - s < 2000 ? requestAnimationFrame(f) : r(Math.round(n / (performance.now() - s) * 1000)); }; requestAnimationFrame(f); }));
const at = async (label, fn) => { await p.evaluate(fn); await p.waitForTimeout(1800); console.log(label.padEnd(34), await fps()); };
await at('hero (campus)', () => window.__raleston.lenis.scrollTo(0, { immediate: true }));
await at('services pinned (no canvas)', () => { const s = document.getElementById('services'); window.__raleston.lenis.scrollTo(s.offsetTop + innerHeight, { immediate: true }); });
await at('boundary, 12% of industries', () => { const s = document.getElementById('industries'); window.__raleston.lenis.scrollTo(s.getBoundingClientRect().top + scrollY - innerHeight * 0.88, { immediate: true }); });
await at('boundary, 4% of industries', () => { const s = document.getElementById('industries'); window.__raleston.lenis.scrollTo(s.getBoundingClientRect().top + scrollY - innerHeight * 0.96, { immediate: true }); });
await at('industries pinned 0.3', () => { const s = document.getElementById('industries'); window.__raleston.lenis.scrollTo(s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * 0.3, { immediate: true }); });
await b.close();
