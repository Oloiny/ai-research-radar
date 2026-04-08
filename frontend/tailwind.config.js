/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dbe4ff",
          200: "#bac8ff",
          300: "#91a7ff",
          400: "#748ffc",
          500: "#4F6EF7",
          600: "#3B56E8",
          700: "#2A44D4",
          800: "#1e3a8a",
          900: "#1e2d5f",
        },
      },
      maxWidth: {
        "6xl": "72rem",
      },
    },
  },
  plugins: [],
};
