import { getAllWorkspaces } from "@/lib/data/workspaces-store";
import { getAllMembers } from "@/lib/data/members-store";

// ─────────────────────────────────────────────────────────────
// SISTEMA DE PERMISOS (híbrido)
// Super admin se detecta por DOS vías (cualquiera basta):
//   1. Clerk publicMetadata.role === "super_admin"  (fuente de verdad)
//   2. SUPER_ADMIN_EMAILS hardcoded                 (fallback / bootstrap)
// Membresía de workspace se resuelve por email contra localStorage.
//
// Este módulo NO importa React ni Clerk: funciona en server y cliente.
// Los hooks de Clerk viven en lib/auth/hooks.ts.
// ─────────────────────────────────────────────────────────────

// Emails de super admin (fallback). Agrega aquí el tuyo de Clerk si no
// quieres/puedes setear el publicMetadata.role todavía.
export const SUPER_ADMIN_EMAILS: string[] = [
  "admin@primo.demo",
  "zero@primo.demo",
];

const SUPER_ADMIN_ROLE = "super_admin";

// Forma mínima de un usuario de Clerk que necesitamos. Tanto el
// UserResource del cliente como el User del server son estructuralmente
// compatibles con esto.
export type MetadataUser = {
  publicMetadata?: Record<string, unknown> | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
  emailAddresses?: Array<{ emailAddress?: string | null }> | null;
};

// Muchos call sites solo tienen el email; otros tienen el user completo.
export type UserOrEmail = MetadataUser | string | null | undefined;

function norm(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

/** Extrae el email primario de un user de Clerk (o null). */
export function emailOf(user?: MetadataUser | null): string | null {
  if (!user) return null;
  return (
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    null
  );
}

/** Normaliza cualquier input (user o email) a { user, email }. */
function resolve(input: UserOrEmail): {
  user: MetadataUser | null;
  email: string | null;
} {
  if (!input) return { user: null, email: null };
  if (typeof input === "string") return { user: null, email: input };
  return { user: input, email: emailOf(input) };
}

// ── Super admin ─────────────────────────────────────────────

/** Fallback: el email está en el array hardcoded. */
export function isSuperAdminByEmail(email?: string | null): boolean {
  const e = norm(email);
  if (!e) return false;
  return SUPER_ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(e);
}

/** Fuente de verdad: Clerk publicMetadata.role === "super_admin". */
export function isSuperAdminByMetadata(user?: MetadataUser | null): boolean {
  const role = user?.publicMetadata?.role;
  return role === SUPER_ADMIN_ROLE;
}

/**
 * Combina ambas vías. Acepta el user completo (recomendado, permite leer
 * metadata) o solo el email (usa únicamente el fallback hardcoded).
 */
export function isSuperAdmin(input?: UserOrEmail): boolean {
  const { user, email } = resolve(input);
  return isSuperAdminByMetadata(user) || isSuperAdminByEmail(email);
}

// ── Membresía / acceso ──────────────────────────────────────

export function isWorkspaceMember(
  input: UserOrEmail,
  workspaceId: string
): boolean {
  const { email } = resolve(input);
  const e = norm(email);
  if (!e) return false;
  return getAllMembers().some(
    (m) => m.workspace_id === workspaceId && norm(m.email) === e
  );
}

/** True si el user tiene rol "owner" en el workspace. */
export function isWorkspaceOwner(
  input: UserOrEmail,
  workspaceId: string
): boolean {
  const { email } = resolve(input);
  const e = norm(email);
  if (!e) return false;
  return getAllMembers().some(
    (m) =>
      m.workspace_id === workspaceId &&
      norm(m.email) === e &&
      m.role === "owner"
  );
}

/** Puede configurar el workspace: super admin O su owner. */
export function canConfigureWorkspace(
  input: UserOrEmail,
  workspaceId: string
): boolean {
  if (isSuperAdmin(input)) return true;
  return isWorkspaceOwner(input, workspaceId);
}

/**
 * IDs de workspaces accesibles. Super admin → todos. Resto → donde es
 * miembro. Acepta user completo o email.
 */
export function getUserWorkspaces(input?: UserOrEmail): string[] {
  if (isSuperAdmin(input)) {
    return getAllWorkspaces().map((w) => w.id);
  }

  const { email } = resolve(input);
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
  input: UserOrEmail,
  workspaceId: string
): boolean {
  if (isSuperAdmin(input)) return true;
  return isWorkspaceMember(input, workspaceId);
}
