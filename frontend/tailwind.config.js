/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#38bdf8',
          violet: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      boxShadow: {
        glass: '0 8px 30px rgb(15 23 42 / 40%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
