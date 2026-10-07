/** Capture every section of the current site at desktop and phone into reference/before/. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('reference/before', { recursive: true });
const spots = [
  ['01-hero', 'hero', 0, 6500], ['02-craft-a', 'craft', 0.1, 2200], ['03-craft-b', 'craft', 0.85, 2200],
  ['04-expertise-appengine', 'expertise', 0.03, 2400], ['05-expertise-itam', 'expertise', 0.3, 2400], ['06-expertise-integration', 'expertise', 0.6, 2400], ['07-expertise-xray', 'expertise', 0.93, 2400],
  ['08-services-stair', 'services', 0.03, 2200], ['09-services-stair-end', 'services', 0.97, 2200],
  ['10-industries-intro', 'industries', 0.05, 2600], ['11-industries-district', 'industries', 0.3, 2600], ['12-industries-dusk', 'industries', 0.97, 2600],
  ['13-impact', 'impact', 0.2, 2200], ['14-contact', 'contact', 1, 2400],
];
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [size, vp, extra] of [['desktop', { width: 1440, height: 900 }, {}], ['mobile', { width: 390, height: 844 }, { deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await (await b.newContext({ viewport: vp, ...extra })).newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4322/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  for (const [name, id, prog, wait] of spots) {
    await p.evaluate(([id, prog]) => { const el = document.getElementById(id); const top = el.getBoundingClientRect().top + scrollY; const y = top + Math.max(0, el.offsetHeight - innerHeight) * prog; window.__raleston.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); }, [id, prog]);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: `reference/before/${size}-${name}.png` });
  }
  await p.close();
}
await b.close();
console.log('done');
