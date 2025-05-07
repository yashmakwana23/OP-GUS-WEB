// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = { // Key change: module.exports
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};