/**
 * NovaBash design tokens. Single source of truth for colour, type, spacing,
 * radius, and motion. Tailwind config and globals.css both consume from here.
 */

export const colors = {
  bg: '#0A0A0A',
  bgElev: '#111111',
  bgElev2: '#161616',
  bgElev3: '#1C1C1C',
  hairline: '#1F1F1F',
  hairlineBright: '#2A2A2A',

  fg: '#FAFAFA',
  fgMid: '#A0A0A0',
  fgDim: '#606060',
  fgFade: '#3A3A3A',

  gold: '#C9A84C',
  goldBright: '#E2C070',
  goldDeep: '#8A6E2A',
  goldFade: 'rgba(201,168,76,0.10)',

  ember: '#FF7A2E',
  emberFade: 'rgba(255,122,46,0.12)',
  mint: '#5BD9C2',
  mintFade: 'rgba(91,217,194,0.12)',
} as const;

export const fonts = {
  sans: ['Onest', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  mono: ['Commit Mono', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  display: 800,
} as const;

export const tracking = {
  display: '-0.045em',
  heading: '-0.03em',
  body: '-0.005em',
  flat: '0',
  caps: '0.1em',
} as const;

export const radius = {
  none: '0',
  sm: '2px',
  md: '4px',
} as const;

export const motion = {
  fast: '150ms',
  base: '250ms',
  intro: '600ms',
  ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

export const shadow = {
  hero: '0 0 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03) inset',
  card: '0 0 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.02) inset',
  goldRing: '0 0 0 1px rgba(201,168,76,0.4)',
  emberRing: '0 0 0 1px rgba(255,122,46,0.4)',
} as const;

export type ColorToken = keyof typeof colors;
