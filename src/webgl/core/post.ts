import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset, ToneMappingEffect, ToneMappingMode } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import type { TierBudget } from '../../lib/tier';

export interface Post {
  /** Every render target whose work can be confined to a band of the screen. */
  bandTargets(): THREE.WebGLRenderTarget[];
  /** Enable SMAA only where it is visible: below ~1.4× the image isn't supersampled. */
  setPixelRatio(dpr: number): void;
  composer: EffectComposer;
  ao: N8AOPostPass | null;
  bloom: BloomEffect;
  toneMapping: ToneMappingEffect;
  setSize(w: number, h: number): void;
  dispose(): void;
}

/**
 * HDR pipeline on a transparent canvas:
 * render → ambient occlusion → bloom → neutral tone map → SMAA (low DPR only).
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
    // N8AO auto-enables a transparency-aware mode when it finds transparent
    // materials (our fading ground edges, rings, smoke), which adds extra
    // passes every frame. The matte model look doesn't need it.
    ao.autoDetectTransparency = false;
    Object.assign(ao.configuration, {
      transparencyAware: false,
      gammaCorrection: false,
      aoRadius: 1.4,
      distanceFalloff: 0.7,
      intensity: 4,
      // Half-res AO is indistinguishable on soft model shading and saves ~25% of the frame.
      halfRes: true,
      color: new THREE.Color('#1b2340'),
    });
    // 'Low' (fewer denoise samples) is indistinguishable from 'Medium' on the
    // soft, matte model look (side-by-side checked).
    ao.setQualityMode('Low');
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
  const main = new EffectPass(camera, bloom, toneMapping);
  const smaa = new EffectPass(camera, new SMAAEffect({ preset: SMAAPreset.HIGH }));
  composer.addPass(main);
  composer.addPass(smaa);

  const aoTargets = (): THREE.WebGLRenderTarget[] =>
    ao ? Object.values(ao as unknown as Record<string, unknown>).filter((v): v is THREE.WebGLRenderTarget => !!v && (v as THREE.WebGLRenderTarget).isWebGLRenderTarget === true) : [];

  return {
    bandTargets: () => [composer.inputBuffer, composer.outputBuffer, ...aoTargets()],
    // At ≥1.4× the canvas is already supersampled and SMAA's edge passes cost
    // ~3 ms a frame for no visible gain (measured on retina, compared side by side).
    setPixelRatio: (dpr) => {
      const on = dpr < 1.4;
      smaa.enabled = on;
      smaa.renderToScreen = on;
      main.renderToScreen = !on;
    },
    composer,
    ao,
    bloom,
    toneMapping,
    setSize: (w, h) => composer.setSize(w, h),
    dispose: () => composer.dispose(),
  };
}
