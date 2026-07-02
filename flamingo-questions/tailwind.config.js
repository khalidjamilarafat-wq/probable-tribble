/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flamingo: {
          50: "#fff1f6",
          100: "#ffe0ec",
          200: "#ffc1d9",
          300: "#ff94bc",
          400: "#fb6299",
          500: "#f13a78",
          600: "#dd1f61",
          700: "#b91551",
          800: "#9a1548",
          900: "#831541",
        },
      },
    },
  },
  plugins: [],
};
