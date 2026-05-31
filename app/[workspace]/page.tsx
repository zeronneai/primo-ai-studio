"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowRight, Plus, Image as ImageIcon, Layers } from "lucide-react";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import { ReferencesStat } from "@/components/ReferencesStat";
import type { Workspace, WorkspaceStyle } from "@/types";

export default function WorkspacePage() {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [styles, setStyles] = useState<WorkspaceStyle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspace(slug);
    if (ws) {
      setWorkspace(ws);
      setStyles(getWorkspaceStyles(ws.id));
    }
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="shimmer h-12 w-64 rounded-md mb-4" />
        <div className="shimmer h-4 w-96 rounded-md" />
      </div>
    );
  }

  if (!workspace) notFound();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-12">
        <div className="text-sm text-ws-text-muted mb-2">Workspace</div>
        <h1 className="font-display text-5xl tracking-tight mb-3">
          {workspace.name.toUpperCase()}
        </h1>
        <p className="text-ws-text-muted">
          Generador de thumbnails y assets visuales · {workspace.industry}
        </p>
      </div>

      {/* CTA principal */}
      <Link
        href={`/${workspace.slug}/crear`}
        className="block bg-gradient-to-br from-ws-surface to-ws-bg border border-ws-border hover:border-ws-accent rounded-xl p-8 mb-10 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="h-5 w-5" style={{ color: workspace.brand_colors.accent }} />
              <span className="text-sm font-medium" style={{ color: workspace.brand_colors.accent }}>
                Acción principal
              </span>
            </div>
            <h2 className="font-display text-3xl tracking-tight mb-1">
              CREAR NUEVO THUMBNAIL
            </h2>
            <p className="text-ws-text-muted text-sm">
              Sube una imagen + título → recibe prompts e imágenes en segundos
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-ws-text-muted group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* Stats / Quick info */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatCard
          label="Estilos signature"
          value={styles.length.toString()}
          icon={<Layers className="h-4 w-4" />}
        />
        <ReferencesStat workspaceId={workspace.id} />
        <StatCard
          label="Créditos del mes"
          value={`${workspace.monthly_credit_limit}`}
          icon={<ImageIcon className="h-4 w-4" />}
        />
        <StatCard
          label="Modo"
          value="DEMO"
          icon={<span className="h-2 w-2 rounded-full bg-yellow-400" />}
        />
      </div>

      {/* Styles preview */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-ws-text-muted uppercase tracking-wider mb-4">
          Estilos signature del workspace
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {styles.map((style) => (
            <div
              key={style.id}
              className="bg-ws-surface border border-ws-border rounded-lg p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: workspace.brand_colors.accent }}
                />
                <span className="text-xs font-mono text-ws-text-muted">
                  {style.slug}
                </span>
              </div>
              <h4 className="font-semibold mb-2">{style.name}</h4>
              <p className="text-sm text-ws-text-muted leading-relaxed">
                {style.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-ws-surface border border-ws-border rounded-lg p-5">
      <div className="flex items-center gap-2 text-ws-text-muted text-xs mb-2">
        {icon}
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display text-3xl tracking-tight">{value}</div>
    </div>
  );
}
