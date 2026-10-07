import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4322/?debug', { waitUntil: 'networkidle' });
await p.waitForTimeout(2000);
const y = await p.evaluate(() => document.getElementById('capabilities').getBoundingClientRect().top + scrollY);
await p.evaluate((y) => window.__raleston.lenis.scrollTo(y, { immediate: true }), y);
await p.waitForTimeout(800);
const r = await p.evaluate(() => {
  const c = document.querySelector('.f-labels'); const s = document.getElementById('foundation');
  const cr = c.getBoundingClientRect(), sr = s.getBoundingClientRect();
  return { container: [Math.round(cr.top), Math.round(cr.bottom)], section: [Math.round(sr.top), Math.round(sr.bottom)], pos: getComputedStyle(c).position,
    labels: [...document.querySelectorAll('[data-xlabel]')].map(l => { const b = l.getBoundingClientRect(); return [Math.round(b.top), getComputedStyle(l).opacity]; }) };
});
console.log(JSON.stringify(r));
await b.close();
