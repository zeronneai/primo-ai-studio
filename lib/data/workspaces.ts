import type { Workspace, WorkspaceStyle, ReferenceAsset } from "@/types";
// Import circular seguro: workspaces-store importa WORKSPACES/WORKSPACE_STYLES
// de este módulo, pero solo los usa dentro de funciones (live bindings),
// nunca en la evaluación del módulo. Aquí ocurre lo mismo.
import {
  getWorkspaceBySlug,
  getStylesForWorkspace,
} from "@/lib/data/workspaces-store";

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
      accentSecondary: "#5BA3F5",
      bg: "#0A1628",
      surface: "#0F1F35",
      border: "#1A2E4A",
      text: "#FFFFFF",
      textMuted: "#8A9BB0",
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
    template_prompt: `Indoor baseball facility photo of [SCENE]. Massive italic ultra-condensed white text "[TITLE]" tilted -8 degrees filling entire frame behind the subjects. Subjects/players cutout layered ON TOP breaking through the typography. One key word from the title accented in electric royal blue (#2E7AF0). Small "TORQUE" logo top right corner. Dark navy overall tone (#080f1e). Raw Nike x MLB training energy. High contrast, dramatic lighting, athletic editorial.`,
    sort_order: 1,
  },
  {
    id: "style_torque_3",
    workspace_id: "ws_torque",
    name: "Estilo 3 — Editorial Apilado",
    slug: "estilo_3",
    description:
      "Bloques de texto apilados (top/middle/bottom), atleta integrado rompiendo límites del texto. Estilo ESPN The Magazine.",
    template_prompt: `Indoor baseball training photo of [SCENE]. Stacked text block composition: first word of "[TITLE]" huge white letters top third, middle words medium size on a solid navy blue horizontal bar middle, last word massive white bottom third. Subjects integrated into center breaking all text boundaries. Clean thin white rule lines between sections. TORQUE wordmark subtle bottom left. ESPN The Magazine editorial sports style. High contrast, cinematic, premium athletic editorial.`,
    sort_order: 2,
  },
];

// Sin referencias seed: cada workspace empieza limpio. El admin/owner
// sube las suyas, y todas viven en localStorage (editables/eliminables).
export const REFERENCE_ASSETS: ReferenceAsset[] = [];

// Helpers
// En el server, el store solo ve el seed (no hay localStorage), así que el
// comportamiento SSR es idéntico al anterior. En el cliente, además mezcla
// los workspaces/estilos custom de localStorage (el custom tiene prioridad).
export function getWorkspace(slug: string): Workspace | null {
  return getWorkspaceBySlug(slug);
}

export function getWorkspaceStyles(workspaceId: string): WorkspaceStyle[] {
  return getStylesForWorkspace(workspaceId);
}

export function getWorkspaceReferences(workspaceId: string): ReferenceAsset[] {
  return REFERENCE_ASSETS.filter((r) => r.workspace_id === workspaceId);
}
