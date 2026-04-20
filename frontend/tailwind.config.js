/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#25D366", // WhatsApp Green
        secondary: "#128C7E", // Darker WhatsApp Green
        dark: "#0b141a", // WhatsApp Background Dark
        light: "#f0f2f5", // WhatsApp Background Light
      }
    },
  },
  plugins: [],
}
