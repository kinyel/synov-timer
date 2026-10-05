/** Record a full top-to-bottom scroll of the page. node scripts/tour.mjs → shots/tour-<size>.webm */
import { chromium } from 'playwright';
import { readdirSync, renameSync, mkdirSync } from 'node:fs';
const sizes = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
].filter((s) => !process.env.ONLY || s.name === process.env.ONLY);
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const s of sizes) {
  const dir = `shots/.tour-${s.name}`;
  mkdirSync(dir, { recursive: true });
  const ctx = await b.newContext({ ...s, recordVideo: { dir, size: s.viewport } });
  const p = await ctx.newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4321/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await p.waitForTimeout(6000);
  // Glide to the bottom, slowing inside the pinned sections.
  await p.evaluate(async () => {
    const l = window.__raleston.lenis;
    const max = document.documentElement.scrollHeight - innerHeight;
    const stepPx = innerHeight * 0.012;
    for (let y = 0; y <= max; y += stepPx) {
      l ? l.scrollTo(y, { immediate: true }) : scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
  });
  await p.waitForTimeout(3000);
  await ctx.close();
  const f = readdirSync(dir).find((n) => n.endsWith('.webm'));
  if (f) renameSync(`${dir}/${f}`, `shots/tour-${s.name}.webm`);
  console.log('recorded', s.name);
}
await b.close();
