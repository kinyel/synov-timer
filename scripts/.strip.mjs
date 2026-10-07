// node strip.mjs in.png out.png [colWidth] [segHeight]: a tall screenshot as side-by-side columns.
import sharp from 'sharp';
const [inp, out, cw = 560, sh = 1150] = process.argv.slice(2);
const img = sharp(inp);
const { width, height } = await img.metadata();
const scale = +cw / width;
const resized = await sharp(inp).resize(+cw).png().toBuffer();
const H = (await sharp(resized).metadata()).height;
const n = Math.ceil(H / +sh);
const comps = [];
for (let i = 0; i < n; i++) {
  const top = i * +sh, h = Math.min(+sh, H - top);
  const seg = await sharp(resized).extract({ left: 0, top, width: +cw, height: h }).toBuffer();
  comps.push({ input: seg, left: i * (+cw + 12), top: 0 });
}
await sharp({ create: { width: n * (+cw + 12), height: +sh, channels: 3, background: '#333' } }).composite(comps).png().toFile(out);
console.log(out, n, 'cols');
