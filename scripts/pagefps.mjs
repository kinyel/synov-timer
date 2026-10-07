/**
 * Frame pacing down the whole home page below the hero: a slow linear scroll
 * from the AI section to the footer, with every frame interval recorded and
 * grouped by the section on screen.
 *
 *   node scripts/pagefps.mjs [desktop|mobile] [seconds]   (mobile = 390×844, CPU ×4 slower)
 */
import { chromium } from 'playwright';

const url = process.env.URL ?? 'http://localhost:4322/';
const which = process.argv[2] ?? 'desktop';
const secs = Number(process.argv[3] ?? 24);
const mobile = which === 'mobile';
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
if (mobile) await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const settle = Number(process.env.SETTLE ?? 1500);
const result = await page.evaluate(async ([secs, settle]) => {
  const lenis = window.__raleston.lenis;
  const start = document.querySelector('#ai').getBoundingClientRect().top + scrollY - innerHeight;
  const end = document.documentElement.scrollHeight - innerHeight;
  lenis.scrollTo(start, { immediate: true });
  // A moment to settle (SETTLE ms) before measuring.
  await new Promise((r) => setTimeout(r, settle));
  const ids = [...document.querySelectorAll('main > section[id]')].map((s) => s.id);
  const at = () => {
    for (const id of ids) {
      const r = document.getElementById(id).getBoundingClientRect();
      if (r.top <= innerHeight / 2 && r.bottom > innerHeight / 2) return id;
    }
    return 'other';
  };
  const gaps = {};
  let last = performance.now();
  let run = true;
  const tick = (t) => {
    const id = at();
    (gaps[id] ??= []).push(t - last);
    last = t;
    if (run) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  lenis.scrollTo(end, { duration: secs, easing: (x) => x });
  await new Promise((r) => setTimeout(r, secs * 1000 + 300));
  run = false;
  const out = {};
  for (const [id, g] of Object.entries(gaps)) {
    const s = g.slice(1).sort((a, b) => a - b);
    if (s.length < 5) continue;
    out[id] = { frames: s.length, p50: s[Math.floor(s.length * 0.5)].toFixed(1), p95: s[Math.floor(s.length * 0.95)].toFixed(1), over25: s.filter((x) => x > 25).length };
  }
  return out;
}, [secs, settle]);
console.log(which);
for (const [id, r] of Object.entries(result)) console.log(`  ${id.padEnd(14)} frames ${String(r.frames).padStart(4)}  p50 ${r.p50}ms  p95 ${r.p95}ms  >25ms ${r.over25}`);
await browser.close();
