/** Cold-load (fast 4G): first text paint and the moment the hero campus is fully built. URL=... node scripts/visual-complete.mjs */
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const [name, opts, slow] of [['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }, 1], ['mobile x4 CPU', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, 4]]) {
  const ctx = await b.newContext(opts);
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (3 * 1024 * 1024) / 8 });
  if (slow > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: slow });
  await p.goto((process.env.URL ?? 'http://localhost:4322/') + '?debug', { waitUntil: 'commit' });
  await p.waitForFunction(() => window.__campus && window.__campus.campus.placed.every((x) => x.build.uBuild.value >= 100), null, { timeout: 60000, polling: 50 });
  const t = await p.evaluate(() => ({ text: Math.round(performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint')?.startTime ?? 0), complete: Math.round(performance.now()) }));
  console.log(name.padEnd(14), 'text visible @', t.text, 'ms   hero campus fully built @', t.complete, 'ms');
  await ctx.close();
}
await b.close();
