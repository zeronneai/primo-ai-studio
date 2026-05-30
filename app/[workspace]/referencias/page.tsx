import { notFound } from "next/navigation";
import { getWorkspace, getWorkspaceReferences } from "@/lib/data/workspaces";

export default async function ReferenciasPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace: slug } = await params;
  const workspace = getWorkspace(slug);
  if (!workspace) notFound();

  const references = getWorkspaceReferences(workspace.id);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-primo-muted mb-2">
          {workspace.name} · Referencias
        </div>
        <h1 className="font-display text-4xl tracking-tight">
          REFERENCIAS VISUALES
        </h1>
        <p className="text-primo-muted text-sm mt-2">
          ADN visual del workspace · {references.length} referencias cargadas
        </p>
      </div>

      <div className="bg-primo-surface border border-primo-border rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-2">¿Cómo funciona?</h2>
        <p className="text-sm text-primo-muted leading-relaxed">
          Las referencias visuales son thumbnails/flyers ya producidos que el
          sistema analiza para aprender el estilo de la marca. Cada vez que
          generas un nuevo thumbnail, Claude consulta estas referencias para
          mantener coherencia con el ADN visual establecido.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {references.map((ref) => (
          <div
            key={ref.id}
            className="bg-primo-surface border border-primo-border rounded-lg overflow-hidden"
          >
            <div className="aspect-[4/5] bg-primo-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ref.image_url}
                alt={ref.notes}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              {ref.style_slug && (
                <div className="text-xs font-mono text-primo-muted mb-1">
                  {ref.style_slug}
                </div>
              )}
              <p className="text-sm text-primo-text">{ref.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
