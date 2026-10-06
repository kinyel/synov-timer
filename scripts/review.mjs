/** Review stills of every section after copy and design changes. URL=... node scripts/review.mjs */
import { chromium } from 'playwright';
const spots = [['hero', 0, 7000], ['craft', 0.5, 2200], ['expertise', 0.22, 2400], ['expertise', 0.93, 2400], ['services', 0.03, 2200], ['industries', 0.3, 2600], ['industries', 0.97, 2600], ['impact', 0.25, 2200], ['contact', 1, 2400]];
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, vp, extra] of [['d', { width: 1440, height: 900 }, {}], ['m', { width: 390, height: 844 }, { deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext({ viewport: vp, ...extra })).newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4322/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  let n = 0;
  for (const [id, prog, wait] of spots) {
    await p.evaluate(([id, prog]) => { const el = document.getElementById(id); const top = el.getBoundingClientRect().top + scrollY; const y = top + Math.max(0, el.offsetHeight - innerHeight) * prog; window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, [id, prog]);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: `shots/rv-${name}-${n++}-${id}.png` });
  }
  await p.close();
}
await b.close();
