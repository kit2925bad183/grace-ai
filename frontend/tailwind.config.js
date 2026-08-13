/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        grace: {
          sandal: '#14B8A6',
          coffee: '#0F766E',
          white: '#FFFFFF',
          text: '#0F172A',
          sand: '#F0FDFA',
          muted: '#64748B',
          border: '#CCFBF1',
          success: '#22C55E',
          warning: '#F59E0B',
          critical: '#EF4444',
          info: '#06B6D4',
        },
        civic: {
          primary: '#0F766E',
          secondary: '#14B8A6',
          mint: '#F0FDFA',
          bg: '#F8FAFC',
          text: '#0F172A',
          muted: '#64748B',
          warning: '#F59E0B',
          critical: '#EF4444',
          success: '#22C55E',
          border: '#E2E8F0',
          info: '#06B6D4',
        },
        navy: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        elevated: '0 8px 24px -4px rgb(15 118 110 / 0.15)',
        soft: '0 2px 8px 0 rgb(15 23 42 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
