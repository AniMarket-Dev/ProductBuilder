import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: "#F8F5EF",
        ink: "#111111",
        gold: {
          300: "#F9D76A",
          400: "#E7B93E",
          500: "#D8A125",
          600: "#BE841C",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "var(--font-fraunces)",
          "ui-serif",
          "Georgia",
          "serif",
        ],
      },
      boxShadow: {
        soft: "0 16px 48px rgba(17, 17, 17, 0.08)",
        panel: "0 18px 40px rgba(17, 17, 17, 0.06)",
        pillow: "0 30px 80px rgba(74, 74, 74, 0.18)",
      },
      backgroundImage: {
        "grid-fade": "radial-gradient(circle at top left, rgba(216, 161, 37, 0.12), transparent 38%), radial-gradient(circle at bottom right, rgba(17, 17, 17, 0.06), transparent 40%)",
      },
    },
  },
  plugins: [],
};

export default config;
