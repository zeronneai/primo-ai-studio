"use client";

import { useUser } from "@clerk/nextjs";
import {
  isSuperAdmin,
  emailOf,
  type MetadataUser,
} from "@/lib/auth/permissions";

// ─────────────────────────────────────────────────────────────
// AUTH HOOKS (cliente)
// Centralizan el acceso a Clerk en el cliente para no esparcir
// useUser() por toda la app. permissions.ts queda agnóstico de React.
// ─────────────────────────────────────────────────────────────

// Tipo del user que devuelve Clerk (UserResource | null | undefined).
export type ClerkUser = ReturnType<typeof useUser>["user"];

export type SuperAdminContext = {
  isSuperAdmin: boolean;
  email: string | null;
  user: ClerkUser;
  isLoaded: boolean;
};

/** Email primario del usuario actual (o null). */
export function useCurrentUserEmail(): string | null {
  const { user } = useUser();
  // UserResource es estructuralmente compatible con MetadataUser.
  return emailOf((user as MetadataUser | null) ?? null);
}

/** True si el usuario actual es super admin (metadata o email fallback). */
export function useIsSuperAdmin(): boolean {
  const { user } = useUser();
  return isSuperAdmin((user as MetadataUser | null) ?? null);
}

/** Contexto completo de super admin para usar en componentes. */
export function useSuperAdminContext(): SuperAdminContext {
  const { user, isLoaded } = useUser();
  const metaUser = (user as MetadataUser | null) ?? null;
  return {
    isSuperAdmin: isSuperAdmin(metaUser),
    email: emailOf(metaUser),
    user,
    isLoaded,
  };
}
