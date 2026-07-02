import type { ContentPillar } from "@/types";

// ─────────────────────────────────────────────────────────────
// CONTENT PILLARS (genéricos, adaptables a cualquier industria)
// El color es solo base semántica: la UI usa ws-accent y variantes.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_PILLARS: ContentPillar[] = [
  { slug: "educacion", label: "Educación / valor", color: "#2E7AF0" },
  { slug: "demostracion", label: "Demostración / producto", color: "#E55B3C" },
  { slug: "proceso", label: "Detrás de cámara / proceso", color: "#8DAA7B" },
  { slug: "cultura", label: "Cultura / trend", color: "#F4C842" },
  { slug: "cta", label: "CTA / resultado / oferta", color: "#A855F7" },
  { slug: "descanso", label: "Descanso / repost", color: "#7A8B9A" },
];

export function getPillar(slug: string): ContentPillar {
  return (
    DEFAULT_PILLARS.find((p) => p.slug === slug) ?? DEFAULT_PILLARS[0]
  );
}
