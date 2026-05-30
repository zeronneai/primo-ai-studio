"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  History,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Workspace } from "@/types";

const NAV_ITEMS = [
  { label: "Dashboard", href: "", icon: LayoutDashboard },
  { label: "Crear", href: "/crear", icon: Plus },
  { label: "Historial", href: "/historial", icon: History },
  { label: "Referencias", href: "/referencias", icon: ImageIcon },
];

export function WorkspaceSidebar({ workspace }: { workspace: Workspace }) {
  const pathname = usePathname();
  const base = `/${workspace.slug}`;

  return (
    <aside className="w-60 border-r border-primo-border min-h-[calc(100vh-64px)] hidden md:block">
      <nav className="p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = base + item.href;
          const isActive =
            item.href === ""
              ? pathname === base
              : pathname === href || pathname.startsWith(href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primo-surface text-primo-text"
                  : "text-primo-muted hover:bg-primo-surface/50 hover:text-primo-text"
              )}
              style={
                isActive
                  ? {
                      borderLeft: `2px solid ${workspace.brand_colors.accent}`,
                    }
                  : undefined
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits indicator */}
      <div className="absolute bottom-6 left-4 right-4 max-w-[208px]">
        <div className="bg-primo-surface border border-primo-border rounded-md p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-primo-muted">Créditos del mes</span>
            <span className="text-xs font-mono">
              {workspace.monthly_credit_limit}
            </span>
          </div>
          <div className="h-1 bg-primo-bg rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "12%",
                backgroundColor: workspace.brand_colors.accent,
              }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
