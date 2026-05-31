"use client";

import Link from "next/link";
import { ArrowLeft, Hammer } from "lucide-react";

export default function NuevoWorkspacePlaceholder() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-primo-surface border border-primo-border rounded-xl p-12 text-center">
        <div className="h-14 w-14 rounded-full bg-primo-accent/15 flex items-center justify-center mx-auto mb-5">
          <Hammer className="h-7 w-7 text-primo-accent" />
        </div>
        <h1 className="font-display text-3xl tracking-tight mb-3">
          PRÓXIMAMENTE — FASE 3
        </h1>
        <p className="text-primo-muted mb-8">
          El formulario para crear workspaces (identidad, branding visual,
          estilos signature) llegará en la siguiente fase.
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
