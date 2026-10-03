/** @type {import('tailwindcss').Config} */

// Colors resolve to CSS variables (defined per theme in src/index.css) so a
// single class like `bg-surface` adapts to light and dark mode.
const TOKENS = [
  'surface', 'surface-dim', 'surface-bright',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest',
  'on-surface', 'on-surface-variant', 'inverse-surface', 'inverse-on-surface',
  'outline', 'outline-variant', 'surface-tint',
  'primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'primary-fixed', 'primary-fixed-dim', 'on-primary-fixed', 'on-primary-fixed-variant',
  'secondary-fixed', 'secondary-fixed-dim', 'on-secondary-fixed', 'on-secondary-fixed-variant',
];

const colors = Object.fromEntries(
  TOKENS.map((token) => [token, `rgb(var(--color-${token}) / <alpha-value>)`])
);

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        background: colors.surface,
        'on-background': colors['on-surface'],
        'surface-variant': colors['surface-container'],
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 24px 0 rgba(31, 31, 31, 0.05)',
        'glass-lg': '0 8px 32px -4px rgba(31, 31, 31, 0.08)',
        'wine-halo': '0 4px 20px -2px rgba(217, 119, 87, 0.35)',
        'wine-deep': '0 20px 50px -10px rgba(77, 31, 10, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
