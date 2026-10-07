/**
 * WCAG AA check for every text / background pair the site uses, with colours
 * read from src/styles/tokens.css. Badge and glow backgrounds are computed the
 * way CSS color-mix() does (in sRGB). Exits 1 if any pair fails.
 *
 *   npm run contrast
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const T = Object.fromEntries([...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]));

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** color-mix(in srgb, a p%, b) */
const mix = (a, p, b) => toHex(rgb(T[a]).map((v, i) => v * p + rgb(T[b])[i] * (1 - p)));
const lum = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const c = (name) => T[name] ?? name;

// [label, text, background, minimum] (4.5 for body text, 3 for large text and UI)
const pairs = [
  // Dark sections
  ...['night', 'navy', 'indigo'].flatMap((bg) => [
    [`heading / white on ${bg}`, 'white', bg, 4.5],
    [`body / grey-200 on ${bg}`, 'grey-200', bg, 4.5],
    [`secondary / grey-400 on ${bg}`, 'grey-400', bg, 4.5],
    [`eyebrow, numbers / gold on ${bg}`, 'gold', bg, 4.5],
    [`data accent / azure on ${bg}`, 'azure', bg, 4.5],
    [`AI accent / violet-soft on ${bg}`, 'violet-soft', bg, 4.5],
    [`emphasis, eyebrow / iris-soft on ${bg}`, 'iris-soft', bg, 4.5],
  ]),
  ['AI badge / violet-soft on violet 7% + navy', 'violet-soft', mix('violet', 0.07, 'navy'), 4.5],
  ['data badge / azure on azure 6% + navy', 'azure', mix('azure', 0.06, 'navy'), 4.5],
  ['fact chip / white on white 6% + navy', 'white', mix('white', 0.06, 'navy'), 4.5],
  ['primary button / white on iris', 'white', 'iris', 4.5],
  ['primary button / white on azure-ink', 'white', 'azure-ink', 4.5],
  ['eyebrow pill / iris-soft on iris 14% + night', 'iris-soft', mix('iris', 0.14, 'night'), 4.5],
  ['outcome badge / white on gold 10% + navy', 'white', mix('gold', 0.1, 'navy'), 4.5],
  // Hero glow peaks (worst case behind text)
  ['glow peak, violet 46% / grey-200', 'grey-200', mix('violet', 0.46, 'navy'), 4.5],
  ['glow peak, violet 46% / grey-400 (large text only)', 'grey-400', mix('violet', 0.46, 'navy'), 3],
  ['glow peak, iris 70% / white', 'white', mix('iris', 0.7, 'navy'), 4.5],
  ['glow peak, iris 70% / gold', 'gold', mix('iris', 0.7, 'navy'), 4.5],
  ['glow peak, azure 36% / grey-200', 'grey-200', mix('azure', 0.36, 'navy'), 4.5],
  // Light sections
  ...['white', 'grey-50', 'grey-100'].flatMap((bg) => [
    [`heading / navy on ${bg}`, 'navy', bg, 4.5],
    [`body / grey-600 on ${bg}`, 'grey-600', bg, 4.5],
    [`eyebrow / iris on ${bg}`, 'iris', bg, 4.5],
    [`AI accent / violet-ink on ${bg}`, 'violet-ink', bg, 4.5],
    [`data accent / azure-ink on ${bg}`, 'azure-ink', bg, 4.5],
  ]),
  ...['white', 'grey-50'].map((bg) => [`link, secondary button / iris on ${bg}`, 'iris', bg, 4.5]),
  ['AI badge / violet-ink on violet 9% + white', 'violet-ink', mix('violet', 0.09, 'white'), 4.5],
  ['data badge / azure-ink on azure 9% + white', 'azure-ink', mix('azure', 0.09, 'white'), 4.5],
  ['outcome badge / navy on gold 12% + white', 'navy', mix('gold', 0.12, 'white'), 4.5],
  ['marker / navy on gold', 'navy', 'gold', 4.5],
];

let failed = 0;
const rows = pairs.map(([label, fg, bg, min]) => {
  const r = ratio(c(fg), c(bg));
  const ok = r >= min;
  if (!ok) failed++;
  return { pair: label, ratio: +r.toFixed(2), needs: min, result: ok ? 'pass' : 'FAIL' };
});
console.table(rows);
console.log(failed ? `${failed} pair(s) fail AA` : `All ${rows.length} pairs pass WCAG AA`);
process.exit(failed ? 1 : 0);
