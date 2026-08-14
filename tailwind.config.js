/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5EFFB',
          100: '#E9D6F7',
          200: '#D5ADEF',
          300: '#C082E6',
          400: '#A44DDD',
          500: '#8E24AA',
          600: '#6A1B9A', // Primary Purple requested by user
          700: '#52147C',
          800: '#3E0C5E',
          900: '#290642',
          950: '#1A022B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 4px 25px -3px rgba(106, 27, 154, 0.25)',
        'glow-sm': '0 2px 15px -2px rgba(106, 27, 154, 0.18)',
        'card-light': '0 4px 20px -2px rgba(106, 27, 154, 0.05)',
      }
    },
  },
  plugins: [],
}


