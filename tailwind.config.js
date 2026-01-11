/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwritten': ['Caveat', 'Patrick Hand', 'Kalam', 'cursive'],
      },
      colors: {
        'neno-yellow': '#FFF9C4',
        'week-white': '#F7F9F9',
        'year-kraft': '#E0C9A6',
        'ink-gray': '#2D3436',
        'coral-pink': '#FF7675',
        'sage-green': '#55EFC4',
      },
    },
  },
  plugins: [],
}
