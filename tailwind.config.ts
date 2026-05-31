import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
        display: ["var(--font-nunito)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        primo: {
          bg: "#F5E6C8",
          surface: "#FFFFFF",
          surfaceAlt: "#FAF0DD",
          border: "#E8D5A8",
          text: "#1A2E3F",
          muted: "#5A6878",
          accent: "#E55B3C",
          accentYellow: "#F4C842",
          accentGreen: "#8DAA7B",
          navy: "#1A2E3F",
        },
        // Colores del workspace activo. Mapean a CSS variables que setea
        // app/[workspace]/layout.tsx. Fuera de un workspace, los fallbacks
        // de :root (paleta Primo) mantienen todo coherente.
        ws: {
          primary: "var(--ws-primary)",
          accent: "var(--ws-accent)",
          "accent-secondary": "var(--ws-accent-secondary)",
          bg: "var(--ws-bg)",
          surface: "var(--ws-surface)",
          border: "var(--ws-border)",
          text: "var(--ws-text)",
          "text-muted": "var(--ws-text-muted)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
