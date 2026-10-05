/** One-frame capture + FPS: node scripts/quick.mjs <tier> <name> [w] [h] [waitMs]. Needs `npm run dev`. */
import { chromium } from 'playwright';
const [,, tier = '3', out = 'quick', w = '1440', h = '900', wait = '7000'] = process.argv;
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const mobile = +w < 800;
const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile })).newPage();
await p.goto(`http://localhost:4321/?tier=${tier}`);
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(+wait);
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; performance.now() - s < 2000 ? requestAnimationFrame(f) : r(Math.round(n / (performance.now() - s) * 1000)); }; requestAnimationFrame(f); }));
await p.screenshot({ path: `shots/${out}.png` });
console.log(out, 'tier', tier, 'fps', fps);
await b.close();
