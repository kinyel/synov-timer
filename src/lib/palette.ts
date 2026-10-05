/**
 * Brand palette. Mirrored in src/styles/global.css (@theme) for the DOM.
 * Change a colour here AND there; the WebGL layer reads only this file.
 */
export const palette = {
  /** Dark section backgrounds. */
  void: '#04060F',
  /** Raised dark surfaces, and ink text on light. */
  deep: '#0A1030',
  /** Primary; glossy 3D bodies. */
  cobalt: '#2350FF',
  cobaltLight: '#5B82FF',
  /** Main accent. */
  gold: '#FFC21A',
  /** Emissive lights (bloom). */
  goldGlow: '#FFE07A',
  /** Data, x-ray, light trails. */
  cyan: '#22D3FF',
  snow: '#FFFFFF',
  /** Light section backgrounds. */
  cloud: '#EEF2F9',
  ink: '#0A1030',
  /** City greenery and copper roofs only. */
  mint: '#14C99A',
  /** Secondary text on dark. */
  muted: '#AEB8D6',
} as const;

export type PaletteKey = keyof typeof palette;
