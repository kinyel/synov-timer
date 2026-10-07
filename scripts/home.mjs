/**
 * Home page frames below the hero: the foundation section at each station,
 * then every later section, at desktop and phone sizes.
 *
 *   node scripts/home.mjs [desktop|mobile|both] [outDir]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.env.URL ?? 'http://localhost:4322/';
const which = process.argv[2] ?? 'both';
const out = process.argv[3] ?? 'shots/home';
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
  await page.goto(url + '?debug', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const go = async (y, wait = 1400) => {
    await page.evaluate((y) => window.__raleston.lenis.scrollTo(y, { immediate: true }), y);
    await page.waitForTimeout(wait);
  };
  // Foundation: centre each panel in turn.
  const steps = await page.evaluate(() => [...document.querySelectorAll('[data-fstep]')].map((s) => s.getBoundingClientRect().top + scrollY + s.offsetHeight / 2 - innerHeight / 2));
  // Let the 3D finish starting up before filming it.
  await go(steps[0] - sizes[name].viewport.height, 400);
  await page.waitForFunction(() => window.__raleston?.ready(), null, { timeout: 30000 }).catch(() => {});
  const names = ['intro', 'itsm', 'itom', 'itam', 'xray'];
  for (let i = 0; i < steps.length; i++) {
    await go(steps[i], 2200);
    await page.screenshot({ path: `${out}/${name}-f${i}-${names[i]}.png` });
  }
  for (const id of ['capabilities', 'ai', 'services', 'cases', 'industries', 'why', 'tcpwave', 'faq']) {
    const y = await page.evaluate((id) => {
      const el = document.getElementById(id);
      return el.getBoundingClientRect().top + scrollY + (id === 'services' ? el.offsetHeight * 0.3 : 0);
    }, id);
    await go(y);
    await page.screenshot({ path: `${out}/${name}-${id}.png` });
  }
  const end = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await go(end);
  await page.screenshot({ path: `${out}/${name}-footer.png` });
  console.log(name, errors.length ? `errors:\n  ${errors.slice(0, 8).join('\n  ')}` : 'no console errors');
  await page.close();
}
await browser.close();
