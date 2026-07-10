import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#060608',
        surface: '#0d0d11',
        'surface-2': '#13131a',
        border: '#1a1a24',
        'border-2': '#222230',
        lime: '#c8f135',
        coral: '#ff6b35',
        white: '#f2f2f5',
        text: '#70708a',
        'text-bright': '#b0b0c8',
        muted: '#3a3a50',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
