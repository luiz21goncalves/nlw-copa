/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: 'Roboto, sans-serif',
      },
      backgroundImage: {
        app: 'url(/app-bg.png)',
      },
      colors: {
        ignite: {
          500: '#129e57',
        },

        gray: {
          900: '#121214',
          800: '#202024',
          600: '#323238',
          300: '#8d8d99',
          100: '#e1e1e6',
        },

        yellow: {
          700: '#e5cd3d',
          500: '#f7dd43',
        },
      },
    },
  },
  plugins: [],
}
