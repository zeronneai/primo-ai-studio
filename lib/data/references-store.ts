"use client";

import type { ReferenceAsset } from "@/types";

// ─────────────────────────────────────────────────────────────
// REFERENCES STORE (localStorage)
// Todas las referencias son subidas por el usuario y viven en
// localStorage → todas son editables y eliminables. Ya no hay seed.
// Cuando llegue Supabase: cambiar implementación, no la interfaz.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "primo_references";

function readAll(): ReferenceAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ReferenceAsset[]) : [];
  } catch {
    return [];
  }
}

function writeAll(refs: ReferenceAsset[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
}

/** Referencias del workspace, más recientes primero. */
export function getReferences(workspaceId: string): ReferenceAsset[] {
  return readAll()
    .filter((r) => r.workspace_id === workspaceId)
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );
}

/** Cuenta de referencias de un workspace. */
export function countReferences(workspaceId: string): number {
  return getReferences(workspaceId).length;
}

/** Guarda (crea) una referencia nueva. */
export function saveReference(reference: ReferenceAsset): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readAll().filter((r) => r.id !== reference.id);
    const toSave: ReferenceAsset = { ...reference, is_user_uploaded: true };
    writeAll([toSave, ...existing]);
  } catch (e) {
    console.error("Failed to save reference:", e);
  }
}

/** Actualiza campos de una referencia existente (estilo, notas, imagen…). */
export function updateReference(
  id: string,
  updates: Partial<ReferenceAsset>
): void {
  if (typeof window === "undefined") return;
  try {
    writeAll(
      readAll().map((r) => (r.id === id ? { ...r, ...updates, id } : r))
    );
  } catch (e) {
    console.error("Failed to update reference:", e);
  }
}

/** Elimina una referencia. */
export function deleteReference(id: string): void {
  if (typeof window === "undefined") return;
  try {
    writeAll(readAll().filter((r) => r.id !== id));
  } catch (e) {
    console.error("Failed to delete reference:", e);
  }
}
