/**
 * Rendered-pixel contrast for hero text: hides the text, samples the real background
 * (glows, trail, scene) under each element and checks WCAG AA. Needs a running server.
 *
 *   node scripts/pixelcontrast.mjs
 */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu'] });
for (const [size, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  for (const frac of [0, 0.35, 0.95]) {
    await p.evaluate((f) => { const len = document.querySelector('#hero').offsetHeight - innerHeight; const y = f * len; window.__raleston.lenis.scrollTo(y, { immediate: true }); }, frac);
    await p.waitForTimeout(1300);
    const els = await p.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('#hero p, #hero dt, #hero dd, #hero span, #hero a, #hero h1, #hero h2, #hero h3')) {
        if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        // Decorative drawings (aria-hidden) are pictures, not text to read.
        if (el.closest('[aria-hidden="true"]')) continue;
        const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
        if (r.width < 4 || r.bottom < 0 || r.top > innerHeight || +cs.opacity === 0) continue;
        let o = 1; for (let e = el; e; e = e.parentElement) o *= +getComputedStyle(e).opacity;
        if (o < 0.95) continue; // faded drum rows and transitions are decorative
        out.push({ text: el.textContent.trim().slice(0, 28), color: cs.color, x: r.left, y: r.top, w: r.width, h: r.height, size: parseFloat(cs.fontSize), weight: +cs.fontWeight });
      }
      return out;
    });
    await p.addStyleTag({ content: '#hero *{color:transparent!important;text-shadow:none!important;transition:none!important} #hero .badge, #hero .step-fact, #hero .note-fact, #hero .btn, #hero .pill-dot, #hero .cue-line, #hero p svg, #hero li svg{visibility:hidden}' });
    await p.waitForTimeout(200);
    const shot = (await p.screenshot()).toString('base64');
    await p.evaluate(() => document.querySelectorAll('style').forEach((s) => s.textContent.includes('color:transparent!important') && s.remove()));
    const helper = await b.newPage();
    const worst = await helper.evaluate(async ({ shot, els }) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + shot; await img.decode();
      const cv = new OffscreenCanvas(img.width, img.height); const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
      const data = cx.getImageData(0, 0, img.width, img.height).data; const W = img.width, H = img.height;
      const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
      const out = [];
      for (const e of els) {
        const fg = e.color.match(/[\d.]+/g).map(Number).slice(0, 3);
        let min = 99;
        for (let y = Math.max(0, Math.floor(e.y)); y < Math.min(H, e.y + e.h); y += 2) for (let x = Math.max(0, Math.floor(e.x)); x < Math.min(W, e.x + e.w); x += 3) {
          const i = (y * W + x) * 4; const r = ratio(fg, [data[i], data[i + 1], data[i + 2]]); if (r < min) min = r;
        }
        const large = e.size >= 24 || (e.size >= 18.66 && e.weight >= 700);
        const need = large ? 3 : 4.5;
        if (min < need + 0.3) out.push(`${min.toFixed(2)} (needs ${need}) "${e.text}" ${e.color}`);
      }
      return out;
    }, { shot, els });
    await helper.close();
    console.log(size, frac, worst.length ? '\n  ' + worst.join('\n  ') : 'all text clears AA');
  }
  await p.close();
}
await b.close();
