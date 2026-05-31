import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/data/workspaces";
import { CoBrandedHeader } from "@/components/CoBrandedHeader";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { WorkspaceFooter } from "@/components/WorkspaceFooter";
import { withColorFallbacks } from "@/lib/utils/palette";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = getWorkspace(slug);

  if (!workspace) {
    notFound();
  }

  // Rellena cualquier color faltante con defaults razonables (workspaces
  // viejos del seed o custom incompletos no rompen la UI).
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
