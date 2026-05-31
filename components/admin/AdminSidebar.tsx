"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Settings } from "lucide-react";

// Sidebar del admin panel. Paleta Primo siempre.
export function AdminSidebar() {
  const pathname = usePathname();

  // Activo en /admin exacto (la lista de workspaces). /admin/nuevo etc.
  // no marcan "Workspaces" como activo para no confundir.
  const workspacesActive = pathname === "/admin";

  return (
    <aside className="w-60 shrink-0 bg-primo-surface border-r border-primo-border min-h-[calc(100vh-4rem)] py-6">
      <nav className="flex flex-col gap-1 px-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors border-l-2 ${
            workspacesActive
              ? "border-primo-accent bg-primo-accent/10 text-primo-accent font-semibold"
              : "border-transparent text-primo-muted hover:text-primo-navy hover:bg-primo-surfaceAlt"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          Workspaces
        </Link>

        <div
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm border-l-2 border-transparent text-primo-muted opacity-50 cursor-not-allowed"
          title="Próximamente"
          aria-disabled="true"
        >
          <span className="flex items-center gap-3">
            <Settings className="h-4 w-4" />
            Configuración
          </span>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primo-border text-primo-muted">
            Pronto
          </span>
        </div>
      </nav>
    </aside>
  );
}
