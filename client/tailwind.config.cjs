/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      'vrplayer.html',
      'index.html',
      'src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#fff0f6',
            100: '#ffdeeb',
            200: '#fcc2e6',
            300: '#faa2c1',
            400: '#f783ac',
            500: '#f06595',
            600: '#e64980',
            700: '#d6336c',
            800: '#a61e4d',
            900: '#6c1e3a',
          },
          brand: {
            50: '#fff0fb',
            100: '#ffd6f5',
            200: '#ffb3ec',
            300: '#ff80df',
            400: '#ff4dd2',
            500: '#ff1ac6',
            600: '#e600b3',
            700: '#b3008a',
            800: '#800060',
            900: '#4d0036',
          },
        },
      },
    },
    plugins: [],
  }