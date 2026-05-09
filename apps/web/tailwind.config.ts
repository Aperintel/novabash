import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/brand/src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-elev': 'var(--bg-elev)',
        'bg-elev-2': 'var(--bg-elev-2)',
        'bg-elev-3': 'var(--bg-elev-3)',
        hairline: 'var(--hairline)',
        'hairline-bright': 'var(--hairline-bright)',
        fg: 'var(--fg)',
        'fg-mid': 'var(--fg-mid)',
        'fg-dim': 'var(--fg-dim)',
        'fg-fade': 'var(--fg-fade)',
        gold: 'var(--gold)',
        'gold-bright': 'var(--gold-bright)',
        'gold-deep': 'var(--gold-deep)',
        'gold-fade': 'var(--gold-fade)',
        ember: 'var(--ember)',
        'ember-fade': 'var(--ember-fade)',
        mint: 'var(--mint)',
        'mint-fade': 'var(--mint-fade)',
      },
      fontFamily: {
        sans: ['var(--font-onest)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '-0.045em',
        heading: '-0.03em',
        body: '-0.005em',
        caps: '0.1em',
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
      },
      boxShadow: {
        hero: '0 0 80px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03) inset',
        card: '0 0 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.02) inset',
      },
      transitionTimingFunction: {
        nb: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        pageIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
        blink: 'blink 1s steps(2) infinite',
        'page-in': 'pageIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
