/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["var(--font-satoshi)", "Satoshi", "sans-serif"],
        manrope: ["var(--font-manrope)", "Manrope", "sans-serif"],
      },
      colors: {
        nerolia: {
          DEFAULT: "#00C28B",
          dark:    "#009B6B",
          light:   "rgba(0,194,139,0.12)",
          50:      "#e6fff7",
          100:     "#b3ffe6",
          200:     "#66ffd0",
          500:     "#00C28B",
          600:     "#009B6B",
          700:     "#007a52",
        },
      },
      backgroundImage: {
        "nerolia-gradient": "linear-gradient(135deg, #00C28B 0%, #00E6A3 100%)",
        "nerolia-dark":     "linear-gradient(135deg, #009B6B 0%, #00C28B 100%)",
      },
      borderRadius: {
        nerolia: "16px",
        "nerolia-lg": "24px",
      },
      boxShadow: {
        nerolia: "0 8px 32px rgba(0,194,139,0.18)",
        card:    "0 8px 32px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
