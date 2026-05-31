"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllWorkspaces } from "@/lib/data/workspaces-store";
import { WorkspacesList } from "@/components/admin/WorkspacesList";

export default function AdminWorkspacesPage() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    setCount(getAllWorkspaces().length);
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">WORKSPACES</h1>
          <p className="text-primo-muted text-sm mt-2">
            {count === null
              ? "Cargando…"
              : `${count} workspace${count === 1 ? "" : "s"} ${
                  count === 1 ? "total" : "totales"
                }`}
          </p>
        </div>
        <Link
          href="/admin/nuevo"
          className="inline-flex items-center gap-2 bg-primo-accent text-primo-bg px-4 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nuevo workspace
        </Link>
      </div>

      <WorkspacesList />
    </div>
  );
}
