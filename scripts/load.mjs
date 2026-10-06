/**
 * Cold-load timing of the 3D: when each boot stage finishes, when the preloader
 * hands over, and when the campus is fully built. URL=... node scripts/load.mjs [desktop|mobile] [cpuSlowdown]
 */
import { chromium } from 'playwright';
const mode = process.argv[2] ?? 'desktop';
const slow = Number(process.argv[3] ?? 1);
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const ctx = mode === 'mobile'
  ? await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  : await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
if (slow > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: slow });
// "Fast 4G"-ish network.
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 });
await p.goto(process.env.URL ?? 'http://localhost:4322/', { waitUntil: 'commit' });
await p.waitForFunction(() => window.__raleston?.introDone(), null, { timeout: 60000 });
const t = await p.evaluate(() => {
  const m = Object.fromEntries(performance.getEntriesByType('mark').filter((e) => e.name.startsWith('raleston:')).map((e) => [e.name.slice(9), Math.round(e.startTime)]));
  const lcp = performance.getEntriesByType('largest-contentful-paint');
  const res = performance.getEntriesByType('resource').filter((r) => /\.js|benchmarks|\.woff2/.test(r.name)).map((r) => [r.name.split('/').pop().slice(0, 40), Math.round(r.startTime), Math.round(r.responseEnd), Math.round(r.encodedBodySize / 1024) + 'KB']);
  return { marks: m, introDone: Math.round(performance.now()), res };
});
console.log(mode, 'cpu x' + slow, JSON.stringify(t.marks), 'introDone@', t.introDone);
for (const r of t.res) console.log('  ', r.join('  '));
await b.close();
