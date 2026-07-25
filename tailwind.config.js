/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        rail: {
          ink: '#15202b',
          steel: '#2c3e50',
          mist: '#e7eef5',
          fog: '#f4f7fa',
          line: '#c5d0db',
          amber: '#c47f14',
          signal: '#e8a317',
          go: '#1f8a4c',
          stop: '#c0392b',
          caution: '#d68910',
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(21, 32, 43, 0.04), 0 8px 24px rgba(21, 32, 43, 0.06)',
        lift: '0 4px 20px rgba(44, 62, 80, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
      },
      backgroundImage: {
        'rail-grid':
          'linear-gradient(180deg, rgba(231,238,245,0.95) 0%, rgba(212,222,233,0.98) 100%), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(44,62,80,0.04) 47px, rgba(44,62,80,0.04) 49px)',
      },
    },
  },
  plugins: [],
};
