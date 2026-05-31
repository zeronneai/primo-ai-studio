import type { WorkspaceColors } from "@/types";

// ─────────────────────────────────────────────────────────────
// PALETTE UTILITIES
// Conversión hex <-> HSL y derivación de una paleta completa de
// workspace a partir de un solo color primario.
// ─────────────────────────────────────────────────────────────

export function normalizeHex(hex: string): string {
  if (!hex) return "#000000";
  let h = hex.trim();
  if (!h.startsWith("#")) h = "#" + h;
  // expandir #rgb -> #rrggbb
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = "#" + h.slice(1).split("").map((c) => c + c).join("");
  }
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toLowerCase() : "#000000";
}

export function isValidHex(hex: string): boolean {
  const h = (hex ?? "").trim();
  return /^#?[0-9a-fA-F]{6}$/.test(h) || /^#?[0-9a-fA-F]{3}$/.test(h);
}

type HSL = { h: number; s: number; l: number };

export function hexToHsl(hex: string): HSL {
  const n = normalizeHex(hex);
  const r = parseInt(n.slice(1, 3), 16) / 255;
  const g = parseInt(n.slice(3, 5), 16) / 255;
  const b = parseInt(n.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sN = Math.max(0, Math.min(100, s)) / 100;
  const lN = Math.max(0, Math.min(100, l)) / 100;
  const hN = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((hN / 60) % 2) - 1));
  const m = lN - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hN < 60) [r, g, b] = [c, x, 0];
  else if (hN < 120) [r, g, b] = [x, c, 0];
  else if (hN < 180) [r, g, b] = [0, c, x];
  else if (hN < 240) [r, g, b] = [0, x, c];
  else if (hN < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Devuelve "#000000" o "#ffffff" según cuál contraste mejor con `hex`. */
export function readableTextOn(hex: string): string {
  const n = normalizeHex(hex);
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#000000" : "#ffffff";
}

/**
 * Deriva una WorkspaceColors completa a partir de un color primario.
 * - bg/surface/border: tonos muy oscuros tintados con el primary
 * - accent: variante saturada/desplazada en hue del primary
 * - accentSecondary: variante más clara del accent
 * - text/textMuted: blanco + gris tintado
 */
export function generatePaletteFromPrimary(
  primaryHex: string
): WorkspaceColors {
  const primary = normalizeHex(primaryHex);
  const { h, s } = hexToHsl(primary);

  // Saturación base para los oscuros: si el primary es muy desaturado
  // (casi gris), conservamos un mínimo de tinte para que no quede negro puro.
  const tintSat = Math.max(s, 12);

  const bg = hslToHex(h, Math.min(tintSat, 40), 5);
  const surface = hslToHex(h, Math.min(tintSat, 40), 10);
  const border = hslToHex(h, Math.min(tintSat, 35), 18);

  // Accent: empujamos hue para diferenciarlo del primary y lo saturamos.
  const accentHue = (h + 18) % 360;
  const accent = hslToHex(accentHue, Math.max(s, 55), 58);
  const accentSecondary = hslToHex(accentHue, Math.max(s, 50), 70);

  const text = "#FAFAFA";
  const textMuted = hslToHex(h, Math.min(tintSat, 22), 60);

  return {
    primary,
    accent,
    accentSecondary,
    bg,
    surface,
    border,
    text,
    textMuted,
  };
}

/** Colores por defecto razonables (paleta Primo) si algo viene vacío. */
export const DEFAULT_WORKSPACE_COLORS: WorkspaceColors = {
  primary: "#0f1e2d",
  accent: "#f4c842",
  accentSecondary: "#e55b3c",
  bg: "#0f1e2d",
  surface: "#1a2e3f",
  border: "#2a3e4f",
  text: "#fafafa",
  textMuted: "#7a8b9a",
};

/** Rellena cualquier color vacío/ inválido con el default correspondiente. */
export function withColorFallbacks(
  colors: Partial<WorkspaceColors>
): WorkspaceColors {
  const out = { ...DEFAULT_WORKSPACE_COLORS };
  (Object.keys(out) as (keyof WorkspaceColors)[]).forEach((k) => {
    const v = colors[k];
    if (v && isValidHex(v)) out[k] = normalizeHex(v);
  });
  return out;
}
