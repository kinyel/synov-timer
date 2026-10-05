/** Capture navigation states. node scripts/nav-shots.mjs (needs npm run dev). */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const go = async (vp, extra = {}) => {
  const p = await (await b.newContext({ viewport: vp, ...extra })).newPage();
  await p.goto(process.env.URL ?? 'http://localhost:4321/');
  await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
  await p.waitForTimeout(5500);
  return p;
};
const to = (p, id, prog = 0) => p.evaluate(([id, prog]) => { const el = document.getElementById(id); window.__raleston.lenis.scrollTo(el.getBoundingClientRect().top + scrollY + Math.max(0, el.offsetHeight - innerHeight) * prog, { immediate: true }); }, [id, prog]);
const clip = { x: 0, y: 0, width: 1440, height: 520 };

const d = await go({ width: 1440, height: 900 });
await d.screenshot({ path: 'shots/nav-1-light-top.png', clip });
await to(d, 'craft', 0.2);
await d.waitForTimeout(800);
await d.mouse.wheel(0, -120);
await d.waitForTimeout(1200);
await d.screenshot({ path: 'shots/nav-1b-light-condensed.png', clip: { x: 0, y: 0, width: 1440, height: 140 } });
await to(d, 'hero', 0);
await d.waitForTimeout(1500);
await d.hover('[data-nav-trigger="expertise"]');
await d.waitForTimeout(900);
await d.screenshot({ path: 'shots/nav-2-light-flyout.png', clip });
await d.hover('[data-nav-trigger="industries"]');
await d.waitForTimeout(900);
await d.screenshot({ path: 'shots/nav-3-light-flyout-industries.png', clip });
await d.mouse.move(700, 800);
await to(d, 'services', 0.4);
await d.waitForTimeout(1500);
await d.screenshot({ path: 'shots/nav-4-dark.png', clip });
await d.hover('[data-nav-trigger="services"]');
await d.waitForTimeout(900);
await d.screenshot({ path: 'shots/nav-5-dark-flyout.png', clip });
await d.hover('.nav-cta');
await d.waitForTimeout(900);
await d.screenshot({ path: 'shots/nav-6-dark-cta-hover.png', clip: { x: 900, y: 0, width: 540, height: 120 } });
await d.close();

const t = await go({ width: 1024, height: 768 });
await t.screenshot({ path: 'shots/nav-7-tablet.png', clip: { x: 0, y: 0, width: 1024, height: 200 } });
await t.close();

const m = await go({ width: 390, height: 844 }, { deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await m.screenshot({ path: 'shots/nav-8-mobile.png', clip: { x: 0, y: 0, width: 390, height: 160 } });
await m.tap('[data-menu-toggle]');
await m.waitForTimeout(1200);
await m.tap('[data-sheet-toggle]');
await m.waitForTimeout(800);
await m.screenshot({ path: 'shots/nav-9-mobile-menu.png' });
await m.close();
await b.close();
console.log('done');
