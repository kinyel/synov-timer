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

/**
 * DPR is capped at 1.5: above that, AO, bloom and SMAA cost grows with the
 * square of the ratio while the soft, matte model look gains nothing visible.
 */
export const BUDGETS: Record<Tier, TierBudget> = {
  0: { dprMax: 1, particles: 160, shadowMap: 1024, bloomScale: 0.5, bloomLevels: 4, transmission: false, reflection: 0.25, ao: false },
  1: { dprMax: 1.25, particles: 320, shadowMap: 1024, bloomScale: 0.5, bloomLevels: 5, transmission: false, reflection: 0.35, ao: true },
  2: { dprMax: 1.5, particles: 520, shadowMap: 1024, bloomScale: 0.75, bloomLevels: 6, transmission: true, reflection: 0.5, ao: true },
  3: { dprMax: 1.5, particles: 800, shadowMap: 2048, bloomScale: 0.75, bloomLevels: 7, transmission: true, reflection: 0.5, ao: true },
};

/**
 * Starting tier from detect-gpu (benchmarks self-hosted in /benchmarks).
 * `?tier=N` forces a tier for testing. The engine may only lower it later.
 */
export async function detectTier(reducedMotion: boolean): Promise<Tier> {
  const forced = new URL(location.href).searchParams.get('tier');
  if (forced && /^[0-3]$/.test(forced)) return Number(forced) as Tier;
  if (reducedMotion) return 1;
  // Repeat visits skip the benchmark lookup entirely.
  try {
    const cached = localStorage.getItem('raleston:tier');
    if (cached && /^[0-3]$/.test(cached)) return Number(cached) as Tier;
  } catch {
    /* storage unavailable */
  }
  let tier: Tier = 1;
  try {
    const gpu = await getGPUTier({ benchmarksURL: '/benchmarks' });
    const mobile = gpu.isMobile ?? false;
    tier = gpu.tier >= 3 ? (mobile ? 2 : 3) : gpu.tier === 2 ? (mobile ? 1 : 2) : 1;
  } catch {
    tier = 1;
  }
  try {
    localStorage.setItem('raleston:tier', String(tier));
  } catch {
    /* storage unavailable */
  }
  return tier;
}
