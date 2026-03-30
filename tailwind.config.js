/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 👉 This line is what makes Satoshi appear everywhere automatically!
        sans: ['"Satoshi"', 'sans-serif'], 
      },
    },
  },
  plugins: [],
}