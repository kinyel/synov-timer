/**
 * Frame pacing through the hero journey: a 10 s smooth scroll from the top of
 * the page to the end of the journey, with every frame interval recorded.
 *
 *   node scripts/herofps.mjs [desktop|mobile]   (mobile = 390×844, CPU ×4 slower)
 */
import { chromium } from 'playwright';

const url = process.env.URL ?? 'http://localhost:4322/';
const which = process.argv[2] ?? 'desktop';
const mobile = which === 'mobile';
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(
  mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } },
);
if (mobile) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
await page.goto(url, { waitUntil: process.env.WAIT ? 'load' : 'networkidle' });
await page.waitForTimeout(Number(process.env.WAIT ?? 3500));
const stats = await page.evaluate(async () => {
  const end = document.querySelector('#hero').offsetHeight - innerHeight;
  const gaps = [];
  let last = performance.now();
  let run = true;
  const tick = (t) => {
    gaps.push(t - last);
    last = t;
    if (run) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const lenis = window.__raleston?.lenis;
  if (lenis) lenis.scrollTo(end, { duration: 10, easing: (x) => x });
  else {
    const t0 = performance.now();
    await new Promise((r) => {
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / 10000);
        scrollTo(0, p * end);
        p < 1 ? requestAnimationFrame(step) : r();
      };
      step();
    });
  }
  await new Promise((r) => setTimeout(r, 10300));
  run = false;
  gaps.shift();
  const sorted = [...gaps].sort((a, b) => a - b);
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];
  return {
    frames: gaps.length,
    fps: +(1000 / pct(0.5)).toFixed(1),
    p95: +pct(0.95).toFixed(1),
    p99: +pct(0.99).toFixed(1),
    max: +sorted[sorted.length - 1].toFixed(1),
    over25: gaps.filter((g) => g > 25).length,
    over40: gaps.filter((g) => g > 40).length,
  };
});
console.log(which, stats);
await browser.close();
