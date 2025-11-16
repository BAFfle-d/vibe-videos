/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B7FE6', // Main blue from mockups
          dark: '#1E5BB8',
          light: '#4A9AFF',
        },
        danger: '#E53E3E',
        success: '#48BB78',
        warning: '#ED8936',
      },
    },
  },
  plugins: [],
}
