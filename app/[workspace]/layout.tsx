"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getWorkspace } from "@/lib/data/workspaces";
import { getWorkspaceById } from "@/lib/data/workspaces-store";
import { canAccessWorkspace, getUserWorkspaces } from "@/lib/auth/permissions";
import { useSuperAdminContext } from "@/lib/auth/hooks";
import { CoBrandedHeader } from "@/components/CoBrandedHeader";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { WorkspaceFooter } from "@/components/WorkspaceFooter";
import { UnauthorizedAccess } from "@/components/UnauthorizedAccess";
import { withColorFallbacks } from "@/lib/utils/palette";
import type { Workspace } from "@/types";

type Gate =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "unauthorized" }
  | { kind: "ok"; workspace: Workspace };

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;
  const router = useRouter();
  const { email, isSuperAdmin, isLoaded } = useSuperAdminContext();

  const [gate, setGate] = useState<Gate>({ kind: "loading" });

  useEffect(() => {
    if (!isLoaded) return;

    const workspace = getWorkspace(slug);
    if (!workspace) {
      setGate({ kind: "not_found" });
      return;
    }

    // Super admin o miembro → acceso.
    if (canAccessWorkspace(email, workspace.id)) {
      setGate({ kind: "ok", workspace });
      return;
    }

    // Sin acceso a este: si tiene otro workspace, lo mandamos al primero.
    const mine = getUserWorkspaces(email);
    const firstSlug = mine
      .map((id) => getWorkspaceById(id)?.slug)
      .find((s): s is string => !!s);
    if (firstSlug && firstSlug !== slug) {
      router.replace(`/${firstSlug}`);
      setGate({ kind: "loading" });
      return;
    }

    setGate({ kind: "unauthorized" });
  }, [slug, email, isSuperAdmin, isLoaded, router]);

  if (gate.kind === "not_found") {
    notFound();
  }

  if (gate.kind === "loading") {
    return (
      <div className="min-h-screen bg-primo-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primo-muted" />
      </div>
    );
  }

  if (gate.kind === "unauthorized") {
    return <UnauthorizedAccess />;
  }

  const { workspace } = gate;
  const c = withColorFallbacks(workspace.brand_colors);
  const cssVars = {
    "--ws-primary": c.primary,
    "--ws-accent": c.accent,
    "--ws-accent-secondary": c.accentSecondary,
    "--ws-bg": c.bg,
    "--ws-surface": c.surface,
    "--ws-border": c.border,
    "--ws-text": c.text,
    "--ws-text-muted": c.textMuted,
  } as React.CSSProperties;

  return (
    <div
      style={cssVars}
      className="min-h-screen flex flex-col bg-ws-bg text-ws-text"
    >
      <CoBrandedHeader workspace={workspace} />
      <div className="flex flex-1">
        <WorkspaceSidebar workspace={workspace} />
        <main className="flex-1 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
      <WorkspaceFooter />
    </div>
  );
}
