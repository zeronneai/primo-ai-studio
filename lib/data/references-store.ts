"use client";

import { getWorkspaceReferences } from "@/lib/data/workspaces";
import type { ReferenceAsset } from "@/types";

// ─────────────────────────────────────────────────────────────
// REFERENCES STORE (localStorage para persistir referencias subidas)
// Combina el seed que vive en el repo (workspaces.ts) con las que el
// usuario sube. Mismo patrón que generations-store.ts.
// Cuando llegue Supabase: cambiar implementación, no la interfaz.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "primo_references";

function readUploaded(): ReferenceAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as ReferenceAsset[]) : [];
  } catch {
    return [];
  }
}

function writeUploaded(refs: ReferenceAsset[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
}

/**
 * Devuelve las referencias del workspace: primero las subidas por el
 * usuario (más recientes arriba) y luego las pre-cargadas (seed).
 */
export function getReferences(workspaceId: string): ReferenceAsset[] {
  const seed = getWorkspaceReferences(workspaceId);

  if (typeof window === "undefined") {
    return seed;
  }

  const uploaded = readUploaded()
    .filter((r) => r.workspace_id === workspaceId)
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );

  return [...uploaded, ...seed];
}

/** Cuenta total de referencias (seed + subidas) para un workspace. */
export function countReferences(workspaceId: string): number {
  return getReferences(workspaceId).length;
}

/** Guarda una referencia subida por el usuario en localStorage. */
export function saveReference(reference: ReferenceAsset): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readUploaded();
    const toSave: ReferenceAsset = { ...reference, is_user_uploaded: true };
    writeUploaded([toSave, ...existing]);
  } catch (e) {
    console.error("Failed to save reference:", e);
  }
}

/**
 * Elimina una referencia subida por el usuario. Las del seed no se
 * pueden borrar (no viven en localStorage), así que esto es un no-op
 * para ellas.
 */
export function deleteReference(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readUploaded();
    writeUploaded(existing.filter((r) => r.id !== id));
  } catch (e) {
    console.error("Failed to delete reference:", e);
  }
}
