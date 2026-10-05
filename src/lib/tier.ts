import { getGPUTier } from 'detect-gpu';
import type { Tier } from './store';

export interface TierBudget {
  dprMax: number;
  particles: number;
  shadowMap: number;
  /** Bloom resolution scale and mip levels. */
  bloomScale: number;
  bloomLevels: number;
  /** Real transmission on the glass bands (else a transparent-glass approximation). */
  transmission: boolean;
  /** Planar reflection render-target scale (0 = off). */
  reflection: number;
  /** Ambient occlusion pass (used by the city scene). */
  ao: boolean;
}

export const BUDGETS: Record<Tier, TierBudget> = {
  0: { dprMax: 1, particles: 160, shadowMap: 1024, bloomScale: 0.5, bloomLevels: 4, transmission: false, reflection: 0.25, ao: false },
  1: { dprMax: 1.5, particles: 320, shadowMap: 1024, bloomScale: 0.5, bloomLevels: 5, transmission: false, reflection: 0.35, ao: true },
  2: { dprMax: 1.75, particles: 520, shadowMap: 1024, bloomScale: 0.75, bloomLevels: 6, transmission: true, reflection: 0.5, ao: true },
  3: { dprMax: 2, particles: 800, shadowMap: 2048, bloomScale: 1, bloomLevels: 7, transmission: true, reflection: 0.5, ao: true },
};

/**
 * Starting tier from detect-gpu (benchmarks self-hosted in /benchmarks).
 * `?tier=N` forces a tier for testing. The engine may only lower it later.
 */
export async function detectTier(reducedMotion: boolean): Promise<Tier> {
  const forced = new URL(location.href).searchParams.get('tier');
  if (forced && /^[0-3]$/.test(forced)) return Number(forced) as Tier;
  if (reducedMotion) return 1;
  try {
    const gpu = await getGPUTier({ benchmarksURL: '/benchmarks' });
    const mobile = gpu.isMobile ?? false;
    if (gpu.tier >= 3) return mobile ? 2 : 3;
    if (gpu.tier === 2) return mobile ? 1 : 2;
    return 1;
  } catch {
    return 1;
  }
}
