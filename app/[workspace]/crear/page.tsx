import { notFound } from "next/navigation";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import { CreateForm } from "@/components/CreateForm";

export default async function CrearPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = getWorkspace(slug);
  if (!workspace) notFound();

  const styles = getWorkspaceStyles(workspace.id);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-primo-muted mb-2">
          {workspace.name} · Crear
        </div>
        <h1 className="font-display text-4xl tracking-tight">
          NUEVO THUMBNAIL
        </h1>
      </div>

      <CreateForm workspace={workspace} styles={styles} />
    </div>
  );
}
