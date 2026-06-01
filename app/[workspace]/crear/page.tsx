"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import { CreateForm } from "@/components/CreateForm";
import type { Workspace, WorkspaceStyle } from "@/types";

export default function CrearPage() {
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
      <div className="p-8 max-w-5xl mx-auto">
        <div className="shimmer h-12 w-64 rounded-md mb-4" />
        <div className="shimmer h-64 rounded-md" />
      </div>
    );
  }

  if (!workspace) notFound();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-ws-text-muted mb-2">
          {workspace.name} · Crear
        </div>
        <h1 className="font-display text-4xl tracking-tight">
          GENERAR CONTENIDO
        </h1>
      </div>

      <CreateForm workspace={workspace} styles={styles} />
    </div>
  );
}
