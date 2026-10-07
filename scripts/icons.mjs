/**
 * Favicons and app icons from public/brand/mark.svg. Run once after the mark
 * changes: node scripts/icons.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const NAVY = '#0a1d3b';
const mark = await readFile('public/brand/mark.svg', 'utf8');
// The mark is 470×400: centre it in a square for the favicon.
const square = mark.replace(/viewBox="[^"]+"/, 'viewBox="30 27 470 470"');
await writeFile('public/favicon.svg', square);

/** The mark at `scale` of the canvas, centred, on navy (or transparent). */
async function icon(size, scale, background) {
  const inner = Math.round(size * scale);
  const png = await sharp(Buffer.from(square), { density: 600 }).resize(inner, inner).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: png, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const out = {
  'favicon-32.png': await icon(32, 1),
  'apple-touch-icon.png': await icon(180, 0.66, NAVY),
  'icon-192.png': await icon(192, 0.7, NAVY),
  'icon-512.png': await icon(512, 0.7, NAVY),
  'icon-maskable-512.png': await icon(512, 0.56, NAVY),
};
for (const [name, buf] of Object.entries(out)) await writeFile(`public/${name}`, buf);

// favicon.ico: one 32×32 PNG inside an ICO container.
const png = out['favicon-32.png'];
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); // reserved
head.writeUInt16LE(1, 2); // type: icon
head.writeUInt16LE(1, 4); // one image
head.writeUInt8(32, 6); // width
head.writeUInt8(32, 7); // height
head.writeUInt8(0, 8); // palette
head.writeUInt8(0, 9); // reserved
head.writeUInt16LE(1, 10); // colour planes
head.writeUInt16LE(32, 12); // bits per pixel
head.writeUInt32LE(png.length, 14); // image size
head.writeUInt32LE(22, 18); // image offset
await writeFile('public/favicon.ico', Buffer.concat([head, png]));

await writeFile(
  'public/manifest.webmanifest',
  JSON.stringify(
    {
      name: 'Raleston Consulting',
      short_name: 'Raleston',
      description: 'ServiceNow consultancy in Ottawa, Canada.',
      start_url: '/',
      display: 'standalone',
      background_color: '#040a16',
      theme_color: NAVY,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('wrote favicon.svg, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192/512, icon-maskable-512, manifest.webmanifest');
