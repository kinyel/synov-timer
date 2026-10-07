/**
 * Hero journey frames: screen one, the intro scroll, every waypoint and one
 * travel between waypoints, at desktop and phone sizes. Prints console errors.
 *
 *   node scripts/hero.mjs [desktop|mobile|both] [outDir]
 *   URL=http://localhost:4322/ node scripts/hero.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.env.URL ?? 'http://localhost:4322/';
const which = process.argv[2] ?? 'both';
const out = process.argv[3] ?? 'shots/hero';
mkdirSync(out, { recursive: true });

const sizes = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const name of which === 'both' ? ['desktop', 'mobile'] : [which]) {
  const page = await browser.newPage(sizes[name]);
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);
  await page.screenshot({ path: `${out}/${name}-00-load.png` });

  // Scroll positions for the stations (mirrors src/scripts/hero.ts).
  const marks = await page.evaluate(() => {
    const hero = document.querySelector('#hero');
    const len = hero.offsetHeight - innerHeight;
    const INTRO = 0.08, END = 0.86, N = 5, D = 1, T = 1.1, U = N * D + (N - 1) * T;
    const at = (u) => (INTRO + (u / U) * (END - INTRO)) * len;
    const m = [['01-intro-half', INTRO * 0.5 * len]];
    for (let k = 0; k < N; k++) m.push([`${String(k + 2).padStart(2, '0')}-step${k + 1}`, at(k * (D + T) + D * 0.6)]);
    m.push(['07-travel-2-3', at(1 * (D + T) + D + T * 0.5)]);
    m.push(['08-closing', (END + (1 - END) * 0.45) * len]);
    m.push(['09-closed', 0.998 * len]);
    m.push(['10-after', len + innerHeight * 0.6]);
    return m;
  });
  for (const [label, y] of marks) {
    await page.evaluate((y) => (window.__raleston?.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), y);
    await page.waitForTimeout(1700);
    await page.screenshot({ path: `${out}/${name}-${label}.png` });
  }
  console.log(name, errors.length ? `errors:\n  ${errors.join('\n  ')}` : 'no console errors');
  await page.close();
}
await browser.close();
