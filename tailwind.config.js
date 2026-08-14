/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#9c27b0',
          600: '#6a1b9a',
          700: '#4a148c',
          800: '#38006b',
          900: '#26004d',
          950: '#180033',
        },
        dark: {
          bg: '#090D16',
          surface: '#0F172A',
          card: '#131B2E',
          cardHover: '#182238',
          border: '#1E293B',
          borderLight: '#334155',
          text: '#F8FAFC',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 25px -5px rgba(124, 58, 237, 0.35)',
        'glow-sm': '0 0 15px -3px rgba(139, 92, 246, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
