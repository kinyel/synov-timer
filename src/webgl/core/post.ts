import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import type { TierBudget } from '../../lib/tier';

export interface Post {
  composer: EffectComposer;
  ao: N8AOPostPass | null;
  bloom: BloomEffect;
  toneMapping: ToneMappingEffect;
  setSize(w: number, h: number): void;
  dispose(): void;
}

/**
 * HDR pipeline on a transparent canvas:
 * render → ambient occlusion → bloom → neutral tone map → SMAA.
 *
 * - AO (N8AO) gives the architectural-model look: soft contact shading where
 *   buildings meet the ground and in every recess.
 * - Bloom is selective by intensity: only emissives authored above 1.0
 *   (the gold build line, lit windows at dusk) glow.
 * - Khronos Neutral tone mapping keeps whites white and the gold true to the
 *   brand, with no filmic hue shifts.
 * Vignette and film grain are page-level CSS layers (see global.css).
 */
export function createPost(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, budget: TierBudget): Post {
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
  const render = new RenderPass(scene, camera);
  render.clearPass.overrideClearAlpha = 0;
  composer.addPass(render);

  let ao: N8AOPostPass | null = null;
  if (budget.ao) {
    ao = new N8AOPostPass(scene, camera, innerWidth, innerHeight);
    ao.autosetGamma = false;
    Object.assign(ao.configuration, {
      gammaCorrection: false,
      aoRadius: 1.4,
      distanceFalloff: 0.7,
      intensity: 4,
      // Half-res AO is indistinguishable on soft model shading and saves ~25% of the frame.
      halfRes: true,
      color: new THREE.Color('#1b2340'),
    });
    ao.setQualityMode(budget.bloomScale < 1 ? 'Low' : 'Medium');
    composer.addPass(ao);
  }

  const bloom = new BloomEffect({
    mipmapBlur: true,
    luminanceThreshold: 1.0,
    luminanceSmoothing: 0.2,
    intensity: 0.8,
    radius: 0.6,
    levels: budget.bloomLevels,
    resolutionScale: budget.bloomScale,
  });
  const toneMapping = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  composer.addPass(new EffectPass(camera, bloom, toneMapping));
  composer.addPass(new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.HIGH })));

  return {
    composer,
    ao,
    bloom,
    toneMapping,
    setSize: (w, h) => composer.setSize(w, h),
    dispose: () => composer.dispose(),
  };
}
