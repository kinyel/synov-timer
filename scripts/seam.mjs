/** Capture the Expertise → Services seam at a few offsets. URL=... node scripts/seam.mjs [prefix] */
import { chromium } from 'playwright';
const prefix = process.argv[2] ?? 'seam';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, vp, extra] of [['d', { width: 1440, height: 900 }, {}], ['m', { width: 390, height: 844 }, { deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext({ viewport: vp, ...extra })).newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4322/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await p.waitForTimeout(4000);
  for (const f of [0.75, 0.5, 0.25]) {
    // Place the boundary (top of #services) at f of the viewport height.
    await p.evaluate((f) => { const el = document.getElementById('services'); const y = el.getBoundingClientRect().top + scrollY - innerHeight * f; window.__raleston.lenis.scrollTo(y, { immediate: true }); }, f);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: `shots/${prefix}-${name}-${Math.round(f * 100)}.png` });
  }
  await p.close();
}
await b.close();
