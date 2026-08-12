/** @type {import('tailwindcss').Config} */

export default {

  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {

    extend: {

      colors: {

        grace: {

          sandal: '#AA8D6F',

          coffee: '#6F4E37',

          white: '#FFFFFF',

          text: '#3F3026',

          sand: '#F5F0EB',

          muted: '#7A6B5D',

          border: '#E5D9CE',

          success: '#5F7D61',

          warning: '#B98545',

          critical: '#A84A42',

          info: '#66849A',

        },

        civic: {

          primary: '#6F4E37',

          secondary: '#AA8D6F',

          mint: '#F5F0EB',

          bg: '#F5F0EB',

          text: '#3F3026',

          muted: '#7A6B5D',

          warning: '#B98545',

          critical: '#A84A42',

          success: '#5F7D61',

          border: '#E5D9CE',

          info: '#66849A',

        },

        navy: {

          50: '#F5F0EB',

          100: '#E5D9CE',

          200: '#D4C4AE',

          300: '#AA8D6F',

          400: '#8B7355',

          500: '#7A6B5D',

          600: '#6F4E37',

          700: '#5C4033',

          800: '#3F3026',

          900: '#2A1C0E',

          950: '#1A1108',

        },

      },

      fontFamily: {

        sans: ['Inter', 'system-ui', 'sans-serif'],

        display: ['Inter', 'system-ui', 'sans-serif'],

      },

      boxShadow: {

        card: '0 1px 3px 0 rgb(63 48 38 / 0.06), 0 1px 2px -1px rgb(63 48 38 / 0.04)',

        elevated: '0 8px 24px -4px rgb(111 78 55 / 0.12)',

        soft: '0 2px 8px 0 rgb(63 48 38 / 0.06)',

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

