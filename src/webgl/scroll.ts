/**
 * Section progress, written by DOM ScrollTriggers (src/scripts/scroll.ts) and
 * read by the WebGL scenes every frame. Plain numbers so GSAP can tween them.
 */
export type World = 'campus' | 'city' | 'none';

export const scroll = {
  /** 0 with the hero at the top → 1 once it has scrolled away. */
  hero: 0,
  /** Pinned progress 0..1. */
  craft: 0,
  expertise: 0,
  industries: 0,
  /** 0 as contact enters → 1 when it fills the screen. */
  contact: 0,
  /** Which 3D world the visible 3D sections need. */
  world: 'campus' as World,
  /** Which section currently owns the camera. */
  owner: 'hero' as 'hero' | 'craft' | 'expertise' | 'industries' | 'contact',
};

/** Screen positions of 3D anchors (labels with leader lines), written by scenes, read by the DOM. */
export interface Anchor {
  x: number;
  y: number;
  /** 0..1: how "active" the labelled object is. */
  weight: number;
}
export const anchors: { expertise: Anchor[]; industries: Anchor[] } = {
  expertise: Array.from({ length: 6 }, () => ({ x: 0, y: 0, weight: 0 })),
  industries: Array.from({ length: 6 }, () => ({ x: 0, y: 0, weight: 0 })),
};
