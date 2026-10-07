import { atom } from 'nanostores';

/**
 * Shared page state. Discrete state lives in nanostores; per-frame values
 * live in `live`, a plain mutable object.
 */

export const SCENES = [
  { id: 'hero', label: 'Journey' },
  { id: 'ai', label: 'AI in the work' },
  { id: 'foundation', label: 'Foundation' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'services', label: 'Services' },
  { id: 'cases', label: 'Case studies' },
  { id: 'industries', label: 'Industries' },
  { id: 'why', label: 'Why Raleston' },
  { id: 'faq', label: 'FAQ' },
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

export const $scene = atom<SceneId>('hero');
export const $progress = atom(0);
/** True once the page has painted and the hero intro may play. */
export const $introDone = atom(false);
export const $reducedMotion = atom(false);

export interface LiveState {
  /** Scroll delta this frame in px, signed. */
  velocity: number;
  /** Smoothed absolute scroll speed, 0..1. */
  speed: number;
}

export const live: LiveState = { velocity: 0, speed: 0 };
