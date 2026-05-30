import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/data/workspaces";
import { CoBrandedHeader } from "@/components/CoBrandedHeader";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";

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

  const cssVars = {
    "--ws-primary": workspace.brand_colors.primary,
    "--ws-accent": workspace.brand_colors.accent,
    "--ws-bg": workspace.brand_colors.bg,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="min-h-screen bg-primo-bg">
      <CoBrandedHeader workspace={workspace} />
      <div className="flex">
        <WorkspaceSidebar workspace={workspace} />
        <main className="flex-1 min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}
