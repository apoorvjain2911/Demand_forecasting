/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#07111f',
        panel: '#0f1b2d',
        panelSoft: '#15243a',
        signal: '#2dd4bf',
        ember: '#f97316',
        frost: '#e2e8f0',
      },
      fontFamily: {
        body: ['"IBM Plex Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 60px rgba(45, 212, 191, 0.15)',
      },
    },
  },
  plugins: [],
}