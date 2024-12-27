/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "winter-night": {
          DEFAULT: "#0a1a2a",
          dark: "#000000",
        },
      },
      animation: {
        "gentle-pulse": "gentlePulse 3s ease-in-out infinite",
      },
      keyframes: {
        gentlePulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
