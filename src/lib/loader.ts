import { $loadProgress } from './store';

/**
 * Weighted load progress feeding the preloader counter. Each part reports
 * 0..1; the total is monotonic so the counter never runs backwards.
 */
const WEIGHTS = {
  fonts: 0.15,
  engine: 0.25,
  environment: 0.15,
  compile: 0.35,
  frame: 0.1,
} as const;

export type LoadPart = keyof typeof WEIGHTS;
const parts = Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, 0])) as Record<LoadPart, number>;

export function reportLoad(part: LoadPart, value = 1) {
  parts[part] = Math.max(parts[part], Math.min(1, value));
  let total = 0;
  for (const k of Object.keys(WEIGHTS) as LoadPart[]) total += WEIGHTS[k] * parts[k];
  if (total > $loadProgress.get()) $loadProgress.set(total);
}

/** Without WebGL there is nothing to wait for. */
export function completeAll() {
  for (const k of Object.keys(WEIGHTS) as LoadPart[]) reportLoad(k, 1);
}
