import { atom } from 'nanostores';

/**
 * Shared state between the DOM layer and the WebGL engine.
 * Discrete state lives in nanostores; per-frame values live in `live`,
 * a plain mutable object read inside the render loop.
 */

export const SCENES = [
  { id: 'hero', label: 'Platform', theme: 'dark' },
  { id: 'craft', label: 'Craft', theme: 'dark' },
  { id: 'expertise', label: 'Expertise', theme: 'dark' },
  { id: 'services', label: 'Services', theme: 'light' },
  { id: 'industries', label: 'Industries', theme: 'dark' },
  { id: 'impact', label: 'Impact', theme: 'dark' },
  { id: 'contact', label: 'Contact', theme: 'dark' },
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

/** 0 = weakest / reduced motion … 3 = desktop discrete GPU */
export type Tier = 0 | 1 | 2 | 3;

export const $scene = atom<SceneId>('hero');
export const $progress = atom(0);
export const $tier = atom<Tier>(2);
/** 0..1 combined load progress (fonts + engine + environment + shader warmup). */
export const $loadProgress = atom(0);
/** True once the engine has compiled shaders and rendered a warm frame. */
export const $sceneReady = atom(false);
/** True when the preloader has finished and the hero intro may play. */
export const $introDone = atom(false);
export const $webgl = atom<'pending' | 'ok' | 'unavailable'>('pending');
export const $reducedMotion = atom(false);

export interface LiveState {
  /** Scroll delta this frame in px, signed. */
  velocity: number;
  /** Smoothed absolute scroll speed, 0..1. */
  speed: number;
  /** Pointer in NDC (-1..1), y up. */
  pointer: { x: number; y: number };
  pointerActive: boolean;
  /** Accumulated touch-drag, in NDC units, decays back to 0. */
  drag: { x: number; y: number };
  fps: number;
}

export const live: LiveState = {
  velocity: 0,
  speed: 0,
  pointer: { x: 0, y: 0 },
  pointerActive: false,
  drag: { x: 0, y: 0 },
  fps: 60,
};
