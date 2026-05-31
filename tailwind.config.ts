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
