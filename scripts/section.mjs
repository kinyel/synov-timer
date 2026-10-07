/**
 * Screenshot one home section (or any element) at desktop and phone sizes.
 *   node scripts/section.mjs <#id or selector> [name] [offset 0..1 of the element] [path]
 */
import { chromium } from 'playwright';
const [sel = '#capabilities', name = 'section', off = '0', path = '/'] = process.argv.slice(2);
const BASE = process.env.URL ?? 'http://localhost:4322';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [key, opts] of Object.entries({
  d: { viewport: { width: 1440, height: 900 } },
  m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
})) {
  const p = await b.newPage(opts);
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await p.goto(BASE + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const y = await p.evaluate(([sel, off]) => {
    const el = document.querySelector(sel);
    return el.getBoundingClientRect().top + scrollY + el.offsetHeight * Number(off);
  }, [sel, off]);
  await p.evaluate((y) => (window.__raleston?.lenis ? window.__raleston.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)), y);
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `shots/${name}-${key}.png` });
  console.log(key, errors.length ? errors.slice(0, 4).join(' | ') : 'ok');
  await p.close();
}
await b.close();
