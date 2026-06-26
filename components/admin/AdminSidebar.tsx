"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, HelpCircle, ArrowLeft } from "lucide-react";

// Sidebar del admin panel. Paleta Primo siempre.
export function AdminSidebar() {
  const pathname = usePathname();

  // Activo en /admin exacto (la lista de workspaces). /admin/nuevo etc.
  // no marcan "Workspaces" como activo para no confundir.
  const workspacesActive = pathname === "/admin";
  const ayudaActive = pathname === "/admin/ayuda";

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

        <Link
          href="/admin/ayuda"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors border-l-2 ${
            ayudaActive
              ? "border-primo-accent bg-primo-accent/10 text-primo-accent font-semibold"
              : "border-transparent text-primo-muted hover:text-primo-navy hover:bg-primo-surfaceAlt"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          ¿Cómo funciona?
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm border-l-2 border-transparent text-primo-muted hover:text-primo-navy hover:bg-primo-surfaceAlt transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al sitio
        </Link>
      </nav>
    </aside>
  );
}
