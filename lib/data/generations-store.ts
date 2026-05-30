"use client";

import type { Generation } from "@/types";

// ─────────────────────────────────────────────────────────────
// GENERATIONS STORE (localStorage para persistir creaciones nuevas)
// Cuando llegue Supabase: cambiar implementación, no API
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "primo_generations";

// Generaciones pre-cargadas que aparecen en el historial desde el día 1
const SEED_GENERATIONS: Generation[] = [
  {
    id: "gen_seed_1",
    workspace_id: "ws_torque",
    source_image_url:
      "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
    title: "TRAINING WITH BASEBALL PROS",
    context: "Episodio sobre entrenamiento con jugadores profesionales",
    scene_description:
      "Coach trabajando con atleta joven en facility indoor, golden hour lighting, postura de entrenamiento de bateo",
    prompts: {
      estilo_2: `Indoor baseball facility photo of a coach guiding a young athlete through batting stance under golden hour lighting. Massive italic ultra-condensed white text "TRAINING WITH BASEBALL PROS" tilted -8 degrees filling entire frame behind the subjects. Subjects layered ON TOP breaking through the typography. Word "PROS" accented in electric royal blue (#2E7AF0). Small "TORQUE" logo top right. Dark navy tone. Raw Nike x MLB training energy. Vertical 4:5.`,
      estilo_3: `Indoor baseball training photo of coach and young athlete in batting stance. Stacked text composition: "TRAINING" huge white letters top third, "WITH BASEBALL" medium on navy horizontal bar middle, "PROS" massive white bottom third. Subjects integrated center breaking text boundaries. Thin white rule lines between sections. TORQUE wordmark bottom left. ESPN The Magazine editorial. Vertical 4:5.`,
    },
    generated_images: {
      estilo_2:
        "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
      estilo_3:
        "https://images.unsplash.com/photo-1592664474498-bd3b1f8f8c98?w=800",
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "gen_seed_2",
    workspace_id: "ws_torque",
    source_image_url:
      "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800",
    title: "PARENT TESTIMONIAL",
    context: "Padre de atleta contando experiencia con la academia",
    scene_description:
      "Padre sentado en entrevista, ambiente intimo, iluminación cálida tipo documental deportivo",
    prompts: {
      estilo_2: `Documentary-style portrait photo of a parent in interview setting, warm intimate lighting. Massive italic ultra-condensed white text "PARENT TESTIMONIAL" tilted -8 degrees behind subject. Subject cutout ON TOP breaking through typography. Word "TESTIMONIAL" in electric royal blue. Small "TORQUE" logo top right. Dark navy backdrop. Vertical 4:5.`,
      estilo_3: `Documentary portrait of parent in interview, warm lighting. Stacked text: "PARENT" huge top, "REAL" medium on navy bar middle, "TESTIMONIAL" massive bottom. Subject center breaking boundaries. Thin white rules. TORQUE wordmark bottom left. ESPN editorial style. Vertical 4:5.`,
    },
    generated_images: {
      estilo_2:
        "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800",
      estilo_3:
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800",
    },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function getGenerations(workspaceId: string): Generation[] {
  if (typeof window === "undefined") {
    return SEED_GENERATIONS.filter((g) => g.workspace_id === workspaceId);
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const userGens: Generation[] = stored ? JSON.parse(stored) : [];
    const all = [...userGens, ...SEED_GENERATIONS];
    return all
      .filter((g) => g.workspace_id === workspaceId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  } catch {
    return SEED_GENERATIONS.filter((g) => g.workspace_id === workspaceId);
  }
}

export function saveGeneration(generation: Generation): void {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: Generation[] = stored ? JSON.parse(stored) : [];
    const updated = [generation, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save generation:", e);
  }
}

export function getGenerationById(id: string): Generation | null {
  const allGens = [
    ...(typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
      : []),
    ...SEED_GENERATIONS,
  ];
  return allGens.find((g: Generation) => g.id === id) ?? null;
}
