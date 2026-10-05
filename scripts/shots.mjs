/**
 * Art-direction capture: screenshots of the intro and of scroll points,
 * a screen recording, and in-page FPS, at desktop and phone sizes.
 *
 *   npm run dev            (in another terminal)
 *   npm run shots          → shots/<size>-*.png, shots/<size>.webm, shots/report.json
 *
 * Env: URL (default http://localhost:4321/), ONLY=desktop|mobile, TIER=0-3, NOVIDEO=1
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, renameSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const URL_ = process.env.URL ?? 'http://localhost:4321/';
const OUT = 'shots';
mkdirSync(OUT, { recursive: true });

const SIZES = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  {
    name: 'mobile',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  },
].filter((s) => !process.env.ONLY || s.name === process.env.ONLY);

const browser = await chromium.launch({
  channel: 'chromium',
  // UNCAP=1 lifts vsync/battery-saver caps to measure headroom rather than the display's refresh.
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', ...(process.env.UNCAP ? ['--disable-frame-rate-limit', '--disable-gpu-vsync'] : [])],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = {};

for (const size of SIZES) {
  const vdir = join(OUT, `.video-${size.name}`);
  const context = await browser.newContext({
    ...size,
    recordVideo: process.env.NOVIDEO ? undefined : { dir: vdir, size: size.viewport },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  const url = new URL(URL_);
  if (process.env.TIER) url.searchParams.set('tier', process.env.TIER);
  const t0 = Date.now();
  await page.goto(url.toString(), { waitUntil: 'domcontentloaded' });
  const shot = (label) => page.screenshot({ path: join(OUT, `${size.name}-${label}.png`) });

  await sleep(700);
  await shot('00-preloader');
  await page.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  const introAt = Date.now() - t0;
  const info = await page.evaluate(() => {
    const c = document.querySelector('#webgl canvas');
    const gl = c?.getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'n/a',
      tier: document.documentElement.dataset.tier,
      dpr: devicePixelRatio,
      canvas: c ? `${c.width}x${c.height}` : 'none',
    };
  });
  await sleep(350);
  await shot('01-bang');
  await sleep(1300);
  await shot('02-assembling');
  await sleep(1400);
  await shot('03-locking');
  await sleep(2600);
  await shot('04-hero');

  const fps = async (ms = 3000) =>
    page.evaluate(
      (ms) =>
        new Promise((res) => {
          let n = 0;
          const start = performance.now();
          const tick = () => {
            n++;
            if (performance.now() - start < ms) requestAnimationFrame(tick);
            else res(Math.round((n / (performance.now() - start)) * 1000 * 10) / 10);
          };
          requestAnimationFrame(tick);
        }),
      ms,
    );
  const fpsIdle = await fps();

  // Pointer interaction (desktop) / touch drag (mobile) over the mark.
  if (size.hasTouch) {
    await page.touchscreen.tap(size.viewport.width * 0.5, size.viewport.height * 0.28);
  } else {
    await page.mouse.move(size.viewport.width * 0.62, size.viewport.height * 0.45);
    await sleep(200);
    await page.mouse.move(size.viewport.width * 0.7, size.viewport.height * 0.5, { steps: 12 });
    await page.mouse.down();
    await page.mouse.up();
  }
  await sleep(450);
  await shot('05-interact');

  // Scroll points, in viewport heights from the top.
  const heroH = size.viewport.height;
  const points = [0.35, 0.7, 1.1];
  let fpsScroll = 0;
  for (const [i, p] of points.entries()) {
    const y = Math.round(heroH * p);
    await page.evaluate((y) => {
      const l = window.__raleston?.lenis;
      if (l) l.scrollTo(y, { duration: 1.2 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    }, y);
    if (i === 1) fpsScroll = await fps(1200);
    await sleep(i === 1 ? 900 : 2000);
    await shot(`1${i}-scroll-${Math.round(p * 100)}`);
  }

  report[size.name] = { ...info, introReadyMs: introAt, fpsIdle, fpsScroll, errors };
  await context.close();
  if (!process.env.NOVIDEO) {
    const f = readdirSync(vdir).find((n) => n.endsWith('.webm'));
    if (f) renameSync(join(vdir, f), join(OUT, `${size.name}.webm`));
  }
  console.log(size.name, report[size.name]);
}

writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
await browser.close();
