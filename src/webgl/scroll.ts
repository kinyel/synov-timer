/**
 * Section progress, written by DOM ScrollTriggers (src/scripts/scroll.ts) and
 * read by the WebGL scene every frame. Plain numbers so GSAP can tween them.
 */
export type World = 'campus' | 'none';

export const scroll = {
  /** The foundation section, 0..1 across its scroll length. */
  foundation: 0,
  /** Which 3D world the visible 3D sections need. */
  world: 'none' as World,
  /** Fraction of the viewport the 3D currently occupies (0..1). */
  coverage: 0,
  /** The visible 3D band in CSS px from the top of the viewport. */
  bandTop: 0,
  bandBottom: 0,
};

/** Screen positions of 3D anchors (labels with leader lines), written by the scene, read by the DOM. */
export interface Anchor {
  x: number;
  y: number;
  /** 0..1: how "active" the labelled object is. */
  weight: number;
}
const anchorList = (n: number): Anchor[] => Array.from({ length: n }, () => ({ x: 0, y: 0, weight: 0 }));
export const anchors = { foundation: anchorList(3), xray: anchorList(3) };
