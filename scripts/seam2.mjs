/** Services → Industries boundary stills. URL=... node scripts/seam2.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, vp, extra] of [['d', { width: 1440, height: 900 }, { deviceScaleFactor: 2 }], ['m', { width: 390, height: 844 }, { deviceScaleFactor: 3, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext({ viewport: vp, ...extra })).newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4322/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await p.waitForTimeout(6000);
  for (const f of [0.6, 0.25]) {
    await p.evaluate((f) => { const el = document.getElementById('industries'); const y = el.getBoundingClientRect().top + scrollY - innerHeight * (1 - f); window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, f);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `shots/seam2-${name}-${Math.round(f * 100)}.png` });
  }
  await p.close();
}
await b.close();
