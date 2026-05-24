/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // WellPath sage green — matches the web palette
        sage: {
          DEFAULT: '#84a98c',
          light:   '#a8c5af',
          dark:    '#6a8c72',
        },
      },
    },
  },
  plugins: [],
}
