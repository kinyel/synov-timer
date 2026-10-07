/**
 * QA for every built page: full-page screenshots (desktop and phone) plus
 * checks for console errors, failed requests, horizontal overflow, one H1,
 * title and description length, image alt text, share image and internal
 * links. Needs a server on URL (default: astro preview on :4322).
 *   node scripts/pages.mjs [path …]
 */
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.URL ?? 'http://localhost:4322';
const fromSitemap = [...readFileSync('dist/sitemap-0.xml', 'utf8').matchAll(/<loc>https:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1]);
const paths = process.argv.slice(2).length ? process.argv.slice(2) : [...fromSitemap, '/404.html'];
const sizes = { d: { viewport: { width: 1440, height: 900 } }, m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const name = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[/.]/g, '_'));

const b = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const links = new Set();
const problems = [];
for (const path of paths) {
  for (const [key, opts] of Object.entries(sizes)) {
    const ctx = await b.newContext(opts);
    const p = await ctx.newPage();
    const errors = [];
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    p.on('pageerror', (e) => errors.push(String(e)));
    p.on('response', (r) => r.status() >= 400 && !(path === '/404.html' && r.url().endsWith('/404.html')) && errors.push(`${r.status()} ${r.url()}`));
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    // Walk down the page so lazy images load and reveals fire.
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await p.evaluate((y) => scrollTo(0, y), y);
      await p.waitForTimeout(90);
    }
    await p.evaluate(() => scrollTo(0, 0));
    await p.addStyleTag({ content: '[data-reveal]{opacity:1!important;transform:none!important} #fx-grain,[data-cursor-dot],[data-cursor-ring]{display:none!important}' });
    await p.waitForTimeout(700);
    const info = await p.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      winW: innerWidth,
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content ?? '',
      og: document.querySelector('meta[property="og:image"]')?.content ?? '',
      noAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.src).slice(0, 3),
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
      wide: [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('[aria-hidden="true"]'))
        .map((el) => `${el.tagName}.${String(el.className?.baseVal ?? el.className).slice(0, 30)}`)
        .slice(0, 4),
    }));
    info.links.forEach((l) => links.add(l.split('#')[0]));
    const issues = [];
    if (info.docW > info.winW) issues.push(`overflow ${info.docW}>${info.winW} ${info.wide.join(' ')}`);
    if (key === 'd') {
      if (info.h1 !== 1) issues.push(`${info.h1} h1`);
      if (info.title.length > 70) issues.push(`title ${info.title.length} chars`);
      if (info.desc.length < 70 || info.desc.length > 165) issues.push(`description ${info.desc.length} chars`);
      if (info.noAlt.length) issues.push(`img without alt ${info.noAlt}`);
      const og = new URL(info.og);
      const r = await p.request.get(BASE + og.pathname);
      if (!r.ok()) issues.push(`og image ${og.pathname} ${r.status()}`);
    }
    if (errors.length) issues.push(...errors.slice(0, 5));
    await p.screenshot({ path: `shots/pages/${name(path)}-${key}.png`, fullPage: true });
    console.log(`${path} [${key}] ${issues.length ? '✗ ' + issues.join(' | ') : '✓'}`);
    if (issues.length) problems.push([path, key, issues]);
    await ctx.close();
  }
}
// Internal links that don't resolve.
const ctx = await b.newContext();
for (const l of links) {
  if (!l || l.startsWith('/_astro')) continue;
  const r = await ctx.request.get(BASE + l, { maxRedirects: 0 });
  if (r.status() >= 400) console.log(`broken link ${l} ${r.status()}`);
}
await b.close();
console.log(problems.length ? `${problems.length} page views with issues` : 'all pages clean');
