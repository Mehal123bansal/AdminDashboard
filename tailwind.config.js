/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      text: "#234E95", // Blue
text: "#FF6A00", // Orange
border:"#FF6A00",
bg:"#FF6A00" // for backgrounds if needed
     // Dark gray background
      },
fontFamily: {
        'segoe': ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
