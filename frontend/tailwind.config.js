/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'Segoe UI', 'ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        serif: ['Playfair Display', 'serif'],
        body: ['Lora', 'serif'],
        display: ['Baloo 2', 'Impact', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
