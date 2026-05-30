import type { WorkspaceMember, MemberRole } from "@/types";

// ─────────────────────────────────────────────────────────────
// MEMBERS STORE (miembros de cada workspace en localStorage)
// localStorage key: "primo_members" → objeto { [workspaceId]: Member[] }
// Seed: Torque tiene "cliente@torque.demo" como owner inicial.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "primo_members";

const TORQUE_ID = "ws_torque";
const TORQUE_OWNER = "cliente@torque.demo";

type MembersMap = Record<string, WorkspaceMember[]>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function readAll(): MembersMap {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as MembersMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: MembersMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Asegura que el seed por defecto exista (Torque con su owner demo).
 * Idempotente: solo agrega el seed si ese workspace aún no tiene entrada.
 * Devuelve el mapa resultante.
 */
export function seedDefaultMembers(): MembersMap {
  if (typeof window === "undefined") return {};
  const map = readAll();
  if (!map[TORQUE_ID]) {
    map[TORQUE_ID] = [
      {
        workspace_id: TORQUE_ID,
        email: TORQUE_OWNER,
        role: "owner",
        added_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ];
    writeAll(map);
  }
  return map;
}

/** Miembros de un workspace (asegura el seed primero). */
export function getMembers(workspaceId: string): WorkspaceMember[] {
  const map = seedDefaultMembers();
  return map[workspaceId] ?? [];
}

/** Todos los miembros de todos los workspaces (para resolver acceso). */
export function getAllMembers(): WorkspaceMember[] {
  const map = seedDefaultMembers();
  return Object.values(map).flat();
}

export function addMember(
  workspaceId: string,
  email: string,
  role: MemberRole = "member"
): void {
  if (typeof window === "undefined") return;
  const clean = normalizeEmail(email);
  if (!clean) return;

  const map = seedDefaultMembers();
  const current = (map[workspaceId] ?? []).filter(
    (m) => normalizeEmail(m.email) !== clean
  );
  map[workspaceId] = [
    {
      workspace_id: workspaceId,
      email: clean,
      role,
      added_at: new Date().toISOString(),
    },
    ...current,
  ];
  writeAll(map);
}

export function removeMember(workspaceId: string, email: string): void {
  if (typeof window === "undefined") return;
  const clean = normalizeEmail(email);
  const map = seedDefaultMembers();
  if (!map[workspaceId]) return;
  map[workspaceId] = map[workspaceId].filter(
    (m) => normalizeEmail(m.email) !== clean
  );
  writeAll(map);
}
