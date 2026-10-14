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
          red: '#e74450',
          button: '#c83243',
          'button-hover': '#ad2b3b',
          gold: '#c9a452',
          dark: '#101011',
          charcoal: '#19191b',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'DM Sans', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}