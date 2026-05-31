"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { WorkspaceForm } from "@/components/admin/WorkspaceForm";
import {
  getWorkspaceById,
  getStylesForWorkspace,
} from "@/lib/data/workspaces-store";
import type { Workspace, WorkspaceStyle } from "@/types";

type LoadState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "ok"; workspace: Workspace; styles: WorkspaceStyle[] };

export default function EditWorkspacePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    const workspace = getWorkspaceById(id);
    if (!workspace) {
      setState({ kind: "not_found" });
      return;
    }
    setState({
      kind: "ok",
      workspace,
      styles: getStylesForWorkspace(workspace.id),
    });
  }, [id]);

  if (state.kind === "loading") {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primo-muted" />
      </div>
    );
  }

  if (state.kind === "not_found") {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-primo-surface border border-primo-border rounded-xl p-12 text-center">
          <h1 className="font-display text-3xl tracking-tight mb-3">
            WORKSPACE NO ENCONTRADO
          </h1>
          <p className="text-primo-muted mb-6">
            No existe un workspace con id <code>{id}</code>.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-primo-border hover:border-primo-muted text-primo-text px-5 py-2.5 rounded-md font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Workspaces
          </Link>
        </div>
      </div>
    );
  }

  const { workspace, styles } = state;
  const isSeed = workspace.is_custom !== true;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-primo-muted mb-2">
          <Link href="/admin" className="hover:text-primo-text transition-colors">
            Workspaces
          </Link>{" "}
          / Editar
        </div>
        <h1 className="font-bold text-3xl text-primo-navy tracking-tight">
          Editar {workspace.name}
        </h1>
      </div>

      {isSeed && (
        <div className="flex items-start gap-3 bg-primo-accentYellow/20 border border-primo-accentYellow rounded-lg p-4 mb-8">
          <AlertTriangle className="h-5 w-5 text-primo-navy shrink-0 mt-0.5" />
          <p className="text-sm text-primo-navy">
            Estás editando un workspace de demo. Los cambios solo se guardarán
            en este browser (localStorage), no en el repositorio.
          </p>
        </div>
      )}

      <WorkspaceForm mode="edit" initialData={{ workspace, styles }} />
    </div>
  );
}
