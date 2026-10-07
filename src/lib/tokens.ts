import css from '../styles/tokens.css?raw';

/**
 * The colour tokens from src/styles/tokens.css, for code that can't use CSS
 * (Three.js materials, canvas drawing). Parsed from the same file Tailwind
 * reads, so the DOM and the 3D can never drift apart.
 */
const NAMES = [
  'gold',
  'white',
  'black',
  'navy',
  'indigo',
  'iris',
  'azure',
  'violet',
  'grey-50',
  'grey-100',
  'grey-200',
  'grey-400',
  'grey-600',
  'grey-800',
  'gold-ink',
  'violet-ink',
  'azure-ink',
  'violet-soft',
  'iris-soft',
  'gold-glow',
  'night',
] as const;

export type TokenName = (typeof NAMES)[number];

const found = new Map([...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));

export const TOKENS = Object.fromEntries(
  NAMES.map((name) => {
    const value = found.get(name);
    if (!value) throw new Error(`Colour token --color-${name} is missing from src/styles/tokens.css`);
    return [name, value];
  }),
) as Record<TokenName, string>;

/** A token as a 0xRRGGBB number, the form THREE.Color accepts most cheaply. */
export const hex = (name: TokenName) => Number.parseInt(TOKENS[name].slice(1), 16);
