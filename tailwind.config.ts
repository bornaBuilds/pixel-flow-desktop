import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "menu-bar": "#181818",
        "top-gradient": "#404040",
        "bottom-gradient": "#282828",
        "primary-text": "#ffffff",
        "secondary-text": "#b3b3b3",
        "bid-purple": "#1D1C2C",
        "bid-gold": "#FFA173",
        "bid-creme": "#F4EADA",
        "white-text": "#FEFEFE",
      },
      fontFamily: {
        gilroy: "var(--font-gilroy), sans-serif",
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
export default config;
