/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        background: '#fbfaf8',
        petrol: {
          950: '#070d12',
          900: '#0b161e',
          800: '#11222d',
          700: '#1a3240',
        },
        sage: {
          300: '#a3c9b8',
          400: '#7fae9b',
          500: '#5c937f',
        },
        sand: {
          200: '#f5edd6',
          300: '#e5d7b5',
          400: '#cfbe95',
        }
      },
      animation: {
        'pulse-slow': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
