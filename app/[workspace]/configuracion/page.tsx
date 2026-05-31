"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { ArrowLeft, Loader2, ShieldX } from "lucide-react";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import {
  useSuperAdminContext,
  useCanConfigureWorkspace,
} from "@/lib/auth/hooks";
import { WorkspaceForm } from "@/components/admin/WorkspaceForm";
import { ToastProvider } from "@/components/Toast";
import type { Workspace, WorkspaceStyle } from "@/types";

export default function ConfiguracionPage() {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;
  const { isLoaded } = useSuperAdminContext();

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

  // Hook siempre se llama (regla de hooks); con "" devuelve false.
  const { isSuperAdmin } = useSuperAdminContext();
  const canConfigure = useCanConfigureWorkspace(workspace?.id ?? "");

  if (loading || !isLoaded) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-ws-text-muted" />
      </div>
    );
  }

  if (!workspace) notFound();

  if (!canConfigure) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-14 w-14 rounded-full bg-ws-surface border border-ws-border flex items-center justify-center mb-5">
          <ShieldX className="h-7 w-7 text-ws-text-muted" />
        </div>
        <h1 className="font-bold text-2xl text-ws-text mb-3">
          Solo el owner puede configurar este workspace
        </h1>
        <Link
          href={`/${slug}`}
          className="bg-ws-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity mt-2"
        >
          Volver al workspace
        </Link>
      </div>
    );
  }

  // El owner (no super admin) no edita nombre/slug/créditos.
  const hideFields = isSuperAdmin
    ? []
    : (["name", "slug", "monthly_credit_limit"] as const);

  // El formulario reusa el chrome cream del admin (primo-*); lo envolvemos
  // en una superficie clara para que se lea bien dentro del workspace.
  return (
    <ToastProvider>
      <div className="p-8 max-w-6xl mx-auto">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-ws-text-muted hover:text-ws-text transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al workspace
        </Link>

        <h1 className="font-bold text-3xl text-ws-text tracking-tight mb-8">
          Configuración de {workspace.name}
        </h1>

        <div className="bg-primo-bg text-primo-navy rounded-2xl border border-primo-border p-6">
          <WorkspaceForm
            mode="edit"
            initialData={{ workspace, styles }}
            hideFields={[...hideFields]}
            redirectTo={null}
          />
        </div>
      </div>
    </ToastProvider>
  );
}
