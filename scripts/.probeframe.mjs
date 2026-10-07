// Find where the baked frame ends: scan rows/cols from each edge for the first "photo-like" line.
import sharp from 'sharp';
for (const f of ['team-datacentre', 'engineers-racks', 'ai-chat', 'man-desk', 'woman-desk', 'team-glass-icons', 'about-1', 'about-2', 'navy-wave']) {
  const img = sharp(`reference/old-site/images/${f}.png`);
  const { width: w, height: h } = await img.metadata();
  const { data, info } = await img.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; };
  // Sample the colour of the middle of each edge and a bit inside.
  const row = (y) => Array.from({ length: 9 }, (_, k) => px(Math.round((w * (k + 0.5)) / 9), y));
  const col = (x) => Array.from({ length: 9 }, (_, k) => px(x, Math.round((h * (k + 0.5)) / 9)));
  const v = (arr) => { const m = arr.map((c) => (c[0] + c[1] + c[2]) / 3); const mean = m.reduce((a, b) => a + b) / m.length; return Math.sqrt(m.reduce((a, b) => a + (b - mean) ** 2, 0) / m.length); };
  const fmt = (c) => '#' + c.slice(0, 3).map((x) => x.toString(16).padStart(2, '0')).join('') + (c[3] < 255 ? `/${c[3]}` : '');
  console.log(f, w, h, 'corner', fmt(px(2, 2)), 'mid-top', fmt(px(w >> 1, 2)), 'mid-left', fmt(px(2, h >> 1)), 'mid-right', fmt(px(w - 3, h >> 1)), 'mid-bottom', fmt(px(w >> 1, h - 3)));
}
