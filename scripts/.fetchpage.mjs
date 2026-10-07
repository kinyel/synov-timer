// Fetch a public page's visible text with a real browser (some product pages block simple fetchers).
import { chromium } from 'playwright';
const url = process.argv[2];
const b = await chromium.launch({ channel: 'chromium' });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36' })).newPage();
const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => ({ status: () => 'ERR ' + e.message.slice(0, 60) }));
await p.waitForTimeout(3500);
for (let y = 0; y < 9000; y += 900) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(100); }
const text = await p.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'));
console.log('STATUS', r?.status?.(), '\n', text.slice(0, Number(process.argv[3] ?? 7000)));
await b.close();
