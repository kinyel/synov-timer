/**
 * Capture one section at several scroll-progress points, desktop and phone.
 *   node scripts/section.mjs <sectionId> [p1 p2 ...]   (needs `npm run dev`)
 * Writes shots/<section>-<size>-<p>.png and prints FPS while scrolling.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [, , id = 'craft', ...ps] = process.argv;
const points = ps.length ? ps.map(Number) : [0, 0.33, 0.66, 0.95];
mkdirSync('shots', { recursive: true });
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const sizes = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
].filter((s) => !process.env.ONLY || s.name === process.env.ONLY);

for (const size of sizes) {
  const page = await (await browser.newContext(size)).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(process.env.URL ?? 'http://localhost:4321/');
  await page.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await page.waitForTimeout(5500);
  for (const p of points) {
    await page.evaluate(
      ([id, p]) => {
        const el = document.getElementById(id);
        const top = el.getBoundingClientRect().top + scrollY;
        const span = Math.max(0, el.offsetHeight - innerHeight);
        const y = top + span * p;
        const l = window.__raleston?.lenis;
        if (l) l.scrollTo(y, { immediate: true });
        else scrollTo(0, y);
      },
      [id, p],
    );
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `shots/${id}-${size.name}-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
  }
  const fps = await page.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; performance.now() - s < 2000 ? requestAnimationFrame(f) : r(Math.round(n / (performance.now() - s) * 1000)); }; requestAnimationFrame(f); }));
  console.log(id, size.name, 'fps', fps, errors.length ? errors : '');
  await page.close();
}
await browser.close();
