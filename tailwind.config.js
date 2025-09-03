// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // in case you keep stuff inside src
  ],
  theme: {
    extend: {
      colors: {
        "royal-purple": {
          DEFAULT: "#5B21B6",
          600: "#4C1D9F",
          700: "#3B147A",
        },
        "sanaa-orange": "#FF7A00",
      },
    },
  },
  plugins: [],
  darkMode: false,
};
