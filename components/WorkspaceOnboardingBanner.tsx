"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, Settings } from "lucide-react";
import { useIsWorkspaceOwner, useIsSuperAdmin } from "@/lib/auth/hooks";
import { readableTextOn } from "@/lib/utils/palette";
import type { Workspace, WorkspaceStyle, ReferenceAsset } from "@/types";

/** Un workspace está "configurado" si tiene logo, ≥1 estilo o ≥1 referencia. */
export function isWorkspaceConfigured(
  workspace: Workspace,
  styles: WorkspaceStyle[],
  references: ReferenceAsset[]
): boolean {
  return !!workspace.logo_url || styles.length > 0 || references.length > 0;
}

export function WorkspaceOnboardingBanner({
  workspace,
  styles,
  references,
}: {
  workspace: Workspace;
  styles: WorkspaceStyle[];
  references: ReferenceAsset[];
}) {
  const isOwner = useIsWorkspaceOwner(workspace.id);
  const isSuperAdmin = useIsSuperAdmin();
  const [dismissed, setDismissed] = useState(true);

  const dismissKey = `primo_dismissed_onboarding_${workspace.id}`;

  useEffect(() => {
    setDismissed(localStorage.getItem(dismissKey) === "1");
  }, [dismissKey]);

  const configured = isWorkspaceConfigured(workspace, styles, references);
  const accent = workspace.brand_colors.accent;
  const onAccent = readableTextOn(accent);
  const configHref = `/${workspace.slug}/configuracion`;

  function dismiss() {
    localStorage.setItem(dismissKey, "1");
    setDismissed(true);
  }

  // ── Super admin viendo un workspace sin configurar (white-glove) ──
  // Banner estilo admin que NO se descarta (es un to-do real).
  if (isSuperAdmin && !configured) {
    return (
      <div
        className="flex items-start gap-4 rounded-2xl p-5 mb-8 border bg-ws-accent/10"
        style={{ borderColor: accent + "55" }}
      >
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent, color: onAccent }}
        >
          <Settings className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ws-text">
            Este workspace aún no está configurado.
          </h3>
          <p className="text-sm text-ws-text-muted mt-1">
            Define logo, colores, estilos y referencias antes de dar acceso al
            cliente.
          </p>
          <Link
            href={configHref}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            Configurar ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Owner (cliente) en un workspace sin configurar (raro en white-glove) ──
  if (isOwner && !configured && !dismissed) {
    return (
      <div
        className="relative flex items-start gap-4 rounded-2xl p-5 mb-8 border bg-ws-accent/10"
        style={{ borderColor: accent + "55" }}
      >
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent, color: onAccent }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="font-bold text-ws-text">
            ¡Bienvenido a tu workspace! Completa tu perfil para empezar a generar
            contenido on-brand.
          </h3>
          <p className="text-sm text-ws-text-muted mt-1">
            Sube tu logo, define tus colores y crea tus primeros estilos
            signature.
          </p>
          <Link
            href={configHref}
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            Configurar workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <button
          onClick={dismiss}
          aria-label="Descartar"
          className="absolute top-3 right-3 text-ws-text-muted hover:text-ws-text transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Configurado, o member regular → sin banner.
  return null;
}
