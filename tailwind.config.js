/** @type {import('tailwindcss').Config} */
export default {
  // Kaam: Tailwind ko batao kon si files mein classes use hongi
  // Taake sirf wahi CSS bundle mein aaye jo use ho rahi hai
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}