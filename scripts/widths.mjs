/** Check every test width for horizontal overflow and capture the hero. node scripts/widths.mjs */
import { chromium } from 'playwright';
const widths = [[360, 780], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]];
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [w, h] of widths) {
  const mobile = w < 768;
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile })).newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(process.env.URL ?? 'http://localhost:4321/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await p.waitForTimeout(6000);
  const overflow = await p.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[data-band],[data-craft-words],[aria-hidden="true"]')) out.push(el.tagName + '.' + (el.className?.baseVal ?? el.className).toString().slice(0, 40));
    }
    return { docW: document.documentElement.scrollWidth, winW: innerWidth, offenders: out.slice(0, 5) };
  });
  await p.screenshot({ path: `shots/w-${w}.png` });
  console.log(w, JSON.stringify(overflow), errors.length ? errors : '');
  await p.close();
}
await b.close();
