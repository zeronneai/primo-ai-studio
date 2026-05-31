"use client";

import Link from "next/link";
import { WorkspaceForm } from "@/components/admin/WorkspaceForm";

export default function NuevoWorkspacePage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-primo-muted mb-2">
          <Link href="/admin" className="hover:text-primo-text transition-colors">
            Workspaces
          </Link>{" "}
          / Nuevo
        </div>
        <h1 className="font-display text-4xl tracking-tight">NUEVO WORKSPACE</h1>
      </div>

      <WorkspaceForm mode="create" />
    </div>
  );
}
