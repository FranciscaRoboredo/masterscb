import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Marca do SC Braga Masters (brasão vermelho/bordô + "Matação" shark).
      colors: {
        brand: {
          dark: "#6E1220",
          dark2: "#93172A",
          red: "#DD0C15",
          "red-deep": "#A7192E",
          "red-light": "#FBE7E5",
          charcoal: "#333333",
          bg: "#F7F3F2",
          card: "#FFFFFF",
          line: "#EBDFDC",
          muted: "#8A7573",
          green: "#1E8A4C",
          "green-light": "#E5F3EA",
        },
      },
      fontFamily: {
        display: ["var(--font-big-shoulders)", "sans-serif"],
        sans: ["var(--font-barlow)", "sans-serif"],
        condensed: ["var(--font-barlow-condensed)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
