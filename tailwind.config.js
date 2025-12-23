module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: "360px",     // small phones
      sm: "640px",     // mobile
      md: "768px",     // tablet
      lg: "1024px",    // laptop
      xl: "1280px",    // desktop
      "2xl": "1536px", // large screens
    },
    extend: {},
  },
  plugins: [],
};
