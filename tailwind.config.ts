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
          bg: "#0a0a0b",
          surface: "#141416",
          border: "#1f1f23",
          text: "#fafafa",
          muted: "#71717a",
          accent: "#a855f7",
        },
      },
    },
  },
  plugins: [],
};
export default config;
