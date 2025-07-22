// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // adjust to your project structure
  theme: {
    extend: {
      colors: {
        primary: "#00BCD4",
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))'
      },
    },
  },
  plugins: [],
};
