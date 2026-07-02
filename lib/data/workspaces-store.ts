import { WORKSPACES, WORKSPACE_STYLES } from "@/lib/data/workspaces";
import type { Workspace, WorkspaceStyle, BusinessProfile } from "@/types";

// ─────────────────────────────────────────────────────────────
// WORKSPACES STORE (dinámico)
// Combina el seed que vive en el repo (workspaces.ts) con los
// workspaces/estilos creados por el usuario y guardados en localStorage.
// En el server (sin window) solo se ve el seed.
// Cuando llegue Supabase: cambiar implementación, no la interfaz.
// ─────────────────────────────────────────────────────────────

const WS_KEY = "primo_workspaces";
const STYLES_KEY = "primo_styles";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Workspaces ──────────────────────────────────────────────

/** Workspaces creados por el usuario (solo localStorage). */
export function getCustomWorkspaces(): Workspace[] {
  return read<Workspace>(WS_KEY).map((w) => ({ ...w, is_custom: true }));
}

/**
 * Todos los workspaces: seed + custom. Si un slug existe en ambas
 * fuentes, el custom (localStorage) tiene prioridad (permite override).
 */
export function getAllWorkspaces(): Workspace[] {
  const seed: Workspace[] = WORKSPACES.map((w) => ({ ...w, is_custom: false }));
  const custom = getCustomWorkspaces();

  const customSlugs = new Set(custom.map((w) => w.slug));
  const customIds = new Set(custom.map((w) => w.id));

  const seedFiltered = seed.filter(
    (w) => !customSlugs.has(w.slug) && !customIds.has(w.id)
  );
  return [...custom, ...seedFiltered];
}

export function getWorkspaceById(id: string): Workspace | null {
  return getAllWorkspaces().find((w) => w.id === id) ?? null;
}

// ── Business profile ────────────────────────────────────────

/** Perfil de negocio de un workspace (o null). */
export function getBusinessProfile(
  workspaceId: string
): BusinessProfile | null {
  return getWorkspaceById(workspaceId)?.business_profile ?? null;
}

/**
 * "Listo para calendario": tiene perfil con al menos tipo de negocio y
 * objetivo principal definidos.
 */
export function hasBusinessProfile(workspaceId: string): boolean {
  const p = getBusinessProfile(workspaceId);
  return !!p && !!p.business_type.trim() && !!p.main_goal.trim();
}

export function getWorkspaceBySlug(slug: string): Workspace | null {
  return getAllWorkspaces().find((w) => w.slug === slug) ?? null;
}

export function saveWorkspace(workspace: Workspace): void {
  if (typeof window === "undefined") return;
  const existing = read<Workspace>(WS_KEY).filter((w) => w.id !== workspace.id);
  write(WS_KEY, [{ ...workspace, is_custom: true }, ...existing]);
}

export function updateWorkspace(id: string, updates: Partial<Workspace>): void {
  if (typeof window === "undefined") return;
  const existing = read<Workspace>(WS_KEY).map((w) =>
    w.id === id ? { ...w, ...updates, id, is_custom: true } : w
  );
  write(WS_KEY, existing);
}

/** Elimina un workspace custom (las seed no se pueden borrar). */
export function deleteWorkspace(id: string): void {
  if (typeof window === "undefined") return;
  write(
    WS_KEY,
    read<Workspace>(WS_KEY).filter((w) => w.id !== id)
  );
  // limpiar estilos asociados
  write(
    STYLES_KEY,
    read<WorkspaceStyle>(STYLES_KEY).filter((s) => s.workspace_id !== id)
  );
}

// ── Styles ──────────────────────────────────────────────────

/** Estilos custom (solo localStorage) de un workspace. */
export function getCustomStyles(workspaceId: string): WorkspaceStyle[] {
  return read<WorkspaceStyle>(STYLES_KEY)
    .filter((s) => s.workspace_id === workspaceId)
    .map((s) => ({ ...s, is_custom: true }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Todos los estilos custom de todos los workspaces. */
export function getAllStyles(): WorkspaceStyle[] {
  return read<WorkspaceStyle>(STYLES_KEY).map((s) => ({
    ...s,
    is_custom: true,
  }));
}

/**
 * Estilos de un workspace: seed + custom. Si un slug coincide, el
 * custom tiene prioridad (permite override del seed).
 */
export function getStylesForWorkspace(workspaceId: string): WorkspaceStyle[] {
  const seed = WORKSPACE_STYLES.filter(
    (s) => s.workspace_id === workspaceId
  ).map((s) => ({ ...s, is_custom: false }));
  const custom = getCustomStyles(workspaceId);

  const customSlugs = new Set(custom.map((s) => s.slug));
  const customIds = new Set(custom.map((s) => s.id));

  const seedFiltered = seed.filter(
    (s) => !customSlugs.has(s.slug) && !customIds.has(s.id)
  );
  return [...seedFiltered, ...custom].sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export function saveStyle(style: WorkspaceStyle): void {
  if (typeof window === "undefined") return;
  const existing = read<WorkspaceStyle>(STYLES_KEY).filter(
    (s) => s.id !== style.id
  );
  write(STYLES_KEY, [...existing, { ...style, is_custom: true }]);
}

export function updateStyle(id: string, updates: Partial<WorkspaceStyle>): void {
  if (typeof window === "undefined") return;
  write(
    STYLES_KEY,
    read<WorkspaceStyle>(STYLES_KEY).map((s) =>
      s.id === id ? { ...s, ...updates, id } : s
    )
  );
}

export function deleteStyle(id: string): void {
  if (typeof window === "undefined") return;
  write(
    STYLES_KEY,
    read<WorkspaceStyle>(STYLES_KEY).filter((s) => s.id !== id)
  );
}

/**
 * Reemplaza por completo el set de estilos custom de un workspace
 * (útil al editar desde el form, donde se manda la lista completa).
 */
export function replaceStylesForWorkspace(
  workspaceId: string,
  styles: WorkspaceStyle[]
): void {
  if (typeof window === "undefined") return;
  const others = read<WorkspaceStyle>(STYLES_KEY).filter(
    (s) => s.workspace_id !== workspaceId
  );
  const own = styles.map((s) => ({
    ...s,
    workspace_id: workspaceId,
    is_custom: true,
  }));
  write(STYLES_KEY, [...others, ...own]);
}
