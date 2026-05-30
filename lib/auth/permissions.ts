import { getAllWorkspaces } from "@/lib/data/workspaces-store";
import { getAllMembers } from "@/lib/data/members-store";

// ─────────────────────────────────────────────────────────────
// SISTEMA DE PERMISOS
// 3 roles:
//  - Super Admin (Primo): acceso a todo + /admin
//  - Workspace Owner (cliente): dueño de su workspace
//  - Workspace Member (empleado): acceso a su workspace
// La membresía se resuelve por email contra localStorage (members-store).
// ─────────────────────────────────────────────────────────────

// Emails de super admin. Agrega aquí el tuyo de Clerk.
export const SUPER_ADMIN_EMAILS: string[] = [
  "admin@primo.demo",
  "zero@primo.demo",
];

function norm(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function isSuperAdmin(email: string | null | undefined): boolean {
  const e = norm(email);
  if (!e) return false;
  return SUPER_ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(e);
}

export function isWorkspaceMember(
  email: string | null | undefined,
  workspaceId: string
): boolean {
  const e = norm(email);
  if (!e) return false;
  return getAllMembers().some(
    (m) => m.workspace_id === workspaceId && norm(m.email) === e
  );
}

/**
 * IDs de workspaces accesibles para un email.
 * Super admin → todos. Resto → aquellos donde es miembro.
 */
export function getUserWorkspaces(
  email: string | null | undefined
): string[] {
  if (isSuperAdmin(email)) {
    return getAllWorkspaces().map((w) => w.id);
  }

  const e = norm(email);
  if (!e) return [];

  return Array.from(
    new Set(
      getAllMembers()
        .filter((m) => norm(m.email) === e)
        .map((m) => m.workspace_id)
    )
  );
}

export function canAccessWorkspace(
  email: string | null | undefined,
  workspaceId: string
): boolean {
  if (isSuperAdmin(email)) return true;
  return isWorkspaceMember(email, workspaceId);
}
