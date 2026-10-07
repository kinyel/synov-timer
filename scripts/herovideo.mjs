/**
 * Screen recording of the hero journey: load, a pause on screen one, then a
 * steady scroll through all five waypoints. Saves .webm files to shots/hero/.
 *
 *   node scripts/herovideo.mjs [desktop|mobile|both]
 */
import { chromium } from 'playwright';
import { mkdirSync, renameSync } from 'node:fs';

const url = process.env.URL ?? 'http://localhost:4322/';
const which = process.argv[2] ?? 'both';
const out = 'shots/hero';
mkdirSync(out, { recursive: true });

const sizes = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: out, size: { width: 1440, height: 900 } } },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: out, size: { width: 585, height: 1266 } },
  },
};

const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const name of which === 'both' ? ['desktop', 'mobile'] : [which]) {
  const context = await browser.newContext(sizes[name]);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(3600);
  await page.evaluate(async () => {
    const end = document.querySelector('#hero').offsetHeight - innerHeight;
    window.__raleston.lenis.scrollTo(end, { duration: 16, easing: (x) => x });
    await new Promise((r) => setTimeout(r, 17200));
  });
  const video = page.video();
  await context.close();
  const path = await video.path();
  renameSync(path, `${out}/journey-${name}.webm`);
  console.log(`${out}/journey-${name}.webm`);
}
await browser.close();
