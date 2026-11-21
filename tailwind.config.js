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
          50: '#fdf4f5',
          100: '#fce8eb',
          200: '#f9d5db',
          300: '#f4b2bd',
          400: '#ec8295',
          500: '#df5672',
          600: '#cb3859',
          700: '#aa2a46',
          800: '#8e263d',
          900: '#772437',
        },
        skybaby: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

