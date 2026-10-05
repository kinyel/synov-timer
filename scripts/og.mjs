/** Render the 1200×630 Open Graph image from the live hero. node scripts/og.mjs (needs a server on URL). */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const p = await (await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
await p.goto(process.env.URL ?? 'http://localhost:4321/');
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 30000 });
await p.waitForTimeout(6500);
await p.addStyleTag({ content: '[data-progress], #fx-grain, [data-cursor-dot], [data-cursor-ring] { display: none !important; }' });
await p.screenshot({ path: 'public/og.png' });
await b.close();
console.log('wrote public/og.png');
