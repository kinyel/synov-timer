/** Steady-state cost of each post pass (settle 2 s, sample 2 s). URL=... node scripts/passes.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--disable-gpu-vsync'] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto((process.env.URL ?? 'http://localhost:4322/') + '?debug');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(6000);
const fps = async () => { await p.waitForTimeout(2000); return p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; performance.now() - s < 2000 ? requestAnimationFrame(f) : r(Math.round(n / (performance.now() - s) * 1000)); }; requestAnimationFrame(f); })); };
const set = (fn) => p.evaluate(fn);
console.log('all on            ', await fps());
await set(() => (window.__engine.post.composer.passes[1].enabled = false)); console.log('AO off            ', await fps());
await set(() => (window.__engine.post.composer.passes[1].enabled = true));
await set(() => (window.__engine.post.composer.passes[3].enabled = false, window.__engine.post.composer.passes[2].renderToScreen = true)); console.log('SMAA off          ', await fps());
await set(() => (window.__engine.post.composer.passes[3].enabled = true, window.__engine.post.composer.passes[2].renderToScreen = false));
await set(() => { const s = window.__engine.renderer.shadowMap; window.__sm = s.enabled; }); 
await set(() => { window.__engine.renderer.setPixelRatio(1); window.__engine.post.setSize(1440, 900); }); console.log('DPR 1             ', await fps());
await b.close();
