/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f0ff",
          100: "#e5e5ff",
          200: "#d0d0ff",
          300: "#b0b0ff",
          400: "#8080ff",
          500: "#5050ff",
          600: "#090666",
          700: "#070555",
          800: "#060444",
          900: "#040333",
          950: "#020122"
        },
        accent: {
          50: "#fffdf0",
          100: "#fffbe0",
          200: "#fff5b8",
          300: "#ffed80",
          400: "#ecb517",
          500: "#d9a315",
          600: "#c69213",
          700: "#b38111",
          800: "#a0710f",
          900: "#8d600d",
          950: "#7a4f0b"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
}