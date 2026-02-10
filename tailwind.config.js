/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Luxury palette - Banshee Editorial */
        void: '#0A0A0A',
        navy: '#0B1D2E',
        carbon: '#2B2B2B',
        cream: '#F5F1E8',
        'cream-warm': '#EDE6D6',
        'cream-dark': '#f8f5f0',
        gold: '#D4AF37',
        copper: '#B87333',
        'warm-gray': '#8B8680',
        /* Legacy names (auth etc.) mapped to luxury */
        banshee: {
          primary: '#D4AF37',
          secondary: '#0B1D2E',
          accent: '#D4AF37',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      transitionDuration: {
        400: '400ms',
        500: '500ms',
        600: '600ms',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0, 0, 0, 0.04)',
        gold: '0 8px 24px rgba(212, 175, 55, 0.2)',
        'book': '0 8px 32px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'luxury': '2px',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        'breathing': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.3)' },
          '50%': { opacity: '0.9', boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'breathing': 'breathing 2.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
