/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables standard dark mode toggling or system based tracking
  theme: {
    extend: {
      colors: {
        // Minimalist Zinc-based monochrome aesthetic
        background: '#09090b',
        surface: '#18181b',
        primary: '#fafafa',
        secondary: '#a1a1aa',
        accent: '#2dd4bf', // Teal accent for interactive elements
        danger: '#ef4444',
        success: '#22c55e'
      }
    },
  },
  plugins: [],
}
