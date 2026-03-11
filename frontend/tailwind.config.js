/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#1e3a5f',
        'primary-blue': '#2c5282',
        'accent-orange': '#ff6b35',
        'accent-orange-hover': '#ff8c5a',
      },
    },
  },
  plugins: [],
}
