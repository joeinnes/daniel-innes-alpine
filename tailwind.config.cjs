const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    fontFamily: {
      serif: ['Bespoke Serif', ...defaultTheme.fontFamily.serif],
      sans: ['Bespoke Sans', ...defaultTheme.fontFamily.sans],
    },
    extend: {
      fontFamily: {
        heading: ['Bespoke Slab', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
