/**
 * Prepares the reused photos from the old site (reference/old-site/images/)
 * for the build: crops the gold-to-navy frame that is baked into four of them,
 * and writes clean sources to src/assets/images/ (astro:assets makes the
 * AVIF/WebP sizes). Run once: node scripts/images.mjs
 */
import sharp from 'sharp';

const src = (f) => `reference/old-site/images/${f}.png`;
const out = (f) => `src/assets/images/${f}.png`;

// Inner photo bounds as fractions of the framed image, just inside the rounded frame.
const FRAME = { left: 0.067, right: 0.933, top: 0.098, bottom: 0.906 };
for (const f of ['team-datacentre', 'engineers-racks', 'ai-chat', 'man-desk']) {
  const img = sharp(src(f));
  const { width: w, height: h } = await img.metadata();
  const left = Math.round(w * FRAME.left);
  const top = Math.round(h * FRAME.top);
  await img
    .extract({ left, top, width: Math.round(w * FRAME.right) - left, height: Math.round(h * FRAME.bottom) - top })
    .toFile(out(f));
}
for (const f of ['woman-desk', 'team-glass-icons', 'about-2', 'navy-wave']) await sharp(src(f)).toFile(out(f));
await sharp(src('logo')).toFile(out('logo'));
console.log('done');
