import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        primo: {
          bg: "#0F1E2D",
          surface: "#1A2E3F",
          border: "#2A3E4F",
          text: "#FAFAFA",
          muted: "#7A8B9A",
          accent: "#F4C842",
          accentSecondary: "#E55B3C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
