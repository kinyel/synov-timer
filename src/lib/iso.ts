/** Geometry helpers for the CSS 3D scenes (see .s3d in global.css). */

/** Style for a .s3d-line lying on the ground from (x1, y1) to (x2, y2), in px. */
export function line(x1: number, y1: number, x2: number, y2: number, z = 1): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return `--x1:${x1}px;--y1:${y1}px;--len:${len.toFixed(1)}px;--ang:${ang.toFixed(2)}deg;--z:${z}px`;
}

/** Style for a .blk: footprint w, height h, at (x, y), lifted by z. */
export const blk = (x: number, y: number, w: number, h: number, z = 0, extra = '') => `--x:${x}px;--y:${y}px;--w:${w}px;--h:${h}px;--z:${z}px;${extra}`;
