import type { Workspace, WorkspaceStyle, ReferenceAsset } from "@/types";

// ─────────────────────────────────────────────────────────────
// WORKSPACES (datos pre-poblados que viven en el repo)
// Cuando llegue Supabase real, esto se reemplaza por queries
// ─────────────────────────────────────────────────────────────

export const WORKSPACES: Workspace[] = [
  {
    id: "ws_torque",
    slug: "torque",
    name: "Torque Performance",
    logo_url: null,
    brand_colors: {
      primary: "#080f1e",
      accent: "#2E7AF0",
      bg: "#0A1628",
      text: "#FFFFFF",
    },
    industry: "Baseball Training",
    monthly_credit_limit: 500,
  },
];

export const WORKSPACE_STYLES: WorkspaceStyle[] = [
  {
    id: "style_torque_2",
    workspace_id: "ws_torque",
    name: "Estilo 2 — Texto Inclinado",
    slug: "estilo_2",
    description:
      "Texto masivo italic ultra-condensed inclinado -8°, atleta encima rompiendo la tipografía. Vibe Nike x MLB training raw energy.",
    template_prompt: `Indoor baseball facility photo of [SCENE]. Massive italic ultra-condensed white text "[TITLE]" tilted -8 degrees filling entire frame behind the subjects. Subjects/players cutout layered ON TOP breaking through the typography. One key word from the title accented in electric royal blue (#2E7AF0). Small "TORQUE" logo top right corner. Dark navy overall tone (#080f1e). Raw Nike x MLB training energy. Vertical 4:5 format. High contrast, dramatic lighting, athletic editorial.`,
    sort_order: 1,
  },
  {
    id: "style_torque_3",
    workspace_id: "ws_torque",
    name: "Estilo 3 — Editorial Apilado",
    slug: "estilo_3",
    description:
      "Bloques de texto apilados (top/middle/bottom), atleta integrado rompiendo límites del texto. Estilo ESPN The Magazine.",
    template_prompt: `Indoor baseball training photo of [SCENE]. Stacked text block composition: first word of "[TITLE]" huge white letters top third, middle words medium size on a solid navy blue horizontal bar middle, last word massive white bottom third. Subjects integrated into center breaking all text boundaries. Clean thin white rule lines between sections. TORQUE wordmark subtle bottom left. ESPN The Magazine editorial sports style. Vertical 4:5 format. High contrast, cinematic, premium athletic editorial.`,
    sort_order: 2,
  },
];

export const REFERENCE_ASSETS: ReferenceAsset[] = [
  // Pre-cargamos referencias visuales con URLs de placeholder
  // (en producción real serían URLs de Supabase Storage)
  {
    id: "ref_1",
    workspace_id: "ws_torque",
    image_url: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
    style_slug: "estilo_2",
    notes: "Referencia clásica - texto inclinado con coach + atleta",
  },
  {
    id: "ref_2",
    workspace_id: "ws_torque",
    image_url: "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800",
    style_slug: "estilo_3",
    notes: "Referencia editorial apilado - parent testimonial",
  },
  {
    id: "ref_3",
    workspace_id: "ws_torque",
    image_url: "https://images.unsplash.com/photo-1592664474498-bd3b1f8f8c98?w=800",
    style_slug: "estilo_2",
    notes: "Training intenso - acción dinámica",
  },
];

// Helpers
export function getWorkspace(slug: string): Workspace | null {
  return WORKSPACES.find((w) => w.slug === slug) ?? null;
}

export function getWorkspaceStyles(workspaceId: string): WorkspaceStyle[] {
  return WORKSPACE_STYLES.filter((s) => s.workspace_id === workspaceId).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export function getWorkspaceReferences(workspaceId: string): ReferenceAsset[] {
  return REFERENCE_ASSETS.filter((r) => r.workspace_id === workspaceId);
}
