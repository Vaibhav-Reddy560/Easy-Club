import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        airstream: ["var(--font-airstream)", "serif"],
        dymaxion: ["var(--font-dymaxion)", "cursive"],
        sometype: ["var(--font-sometype)", "monospace"],
        astronomus: ["var(--font-astronomus)", "sans-serif"],
      },
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
        "signature-gradient": "linear-gradient(180deg, #FF8800 0%, #FF9D00 18%, #FFB405 36%, #FFBF44 49%, #F99A00 63%, #AE7102 100%)",
      },
      boxShadow: {
        "gold-glow": "0 0 15px 0 rgba(245, 158, 11, 0.5)",
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;