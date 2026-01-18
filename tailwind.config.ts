import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505", // macOS Style Deep Black
        gold: {
          50: "#FFFDF0",
          100: "#FEF9C3",
          400: "#FBBF24", // Primary Gold
          500: "#F59E0B", // Deep Gold
          600: "#D97706", // Darker Shadow Gold
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FBBF24 0%, #D97706 100%)",
        "gold-text": "linear-gradient(to bottom, #FEF9C3 0%, #FBBF24 50%, #D97706 100%)",
        "mac-folder": "linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)",
      },
    },
  },
  plugins: [],
};
export default config;