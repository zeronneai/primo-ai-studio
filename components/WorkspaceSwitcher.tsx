"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Check, Shield } from "lucide-react";
import { useSuperAdminContext } from "@/lib/auth/hooks";
import { getUserWorkspaces } from "@/lib/auth/permissions";
import { getAllWorkspaces } from "@/lib/data/workspaces-store";
import type { Workspace } from "@/types";

// Logo o inicial de un workspace (reutilizado en trigger y en items).
function WorkspaceMark({
  workspace,
  size = "lg",
}: {
  workspace: Workspace;
  size?: "lg" | "sm";
}) {
  const accent = workspace.brand_colors.accent;
  const dim = size === "lg" ? "h-10 w-10" : "h-7 w-7";
  const text = size === "lg" ? "text-lg" : "text-sm";

  if (workspace.logo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={workspace.logo_url}
        alt={workspace.name}
        className={`${dim} rounded-md object-contain`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-md flex items-center justify-center font-display tracking-wider ${text}`}
      style={{ backgroundColor: accent + "20", color: accent }}
    >
      {workspace.name.charAt(0)}
    </div>
  );
}

export function WorkspaceSwitcher({ workspace }: { workspace: Workspace }) {
  const { email, isSuperAdmin } = useSuperAdminContext();
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState<Workspace[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const accent = workspace.brand_colors.accent;

  useEffect(() => {
    const accessibleIds = new Set(getUserWorkspaces(email));
    const all = getAllWorkspaces();
    // Super admin ve todos; el resto solo los suyos.
    const list = isSuperAdmin
      ? all
      : all.filter((w) => accessibleIds.has(w.id));
    setAvailable(list);
  }, [email, isSuperAdmin]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Marca visual del workspace actual (nombre + industry).
  const brand = (
    <div className="flex items-center gap-3">
      <WorkspaceMark workspace={workspace} />
      <div className="hidden sm:flex flex-col text-left">
        <span
          className="font-display text-lg tracking-wide leading-none"
          style={{ color: accent }}
        >
          {workspace.name}
        </span>
        <span className="text-[10px] text-ws-text-muted leading-tight mt-0.5">
          {workspace.industry}
        </span>
      </div>
    </div>
  );

  // Sin dropdown: 1 solo workspace y no es super admin.
  const canSwitch = isSuperAdmin || available.length > 1;
  if (!canSwitch) {
    return brand;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md px-1.5 py-1 hover:bg-ws-bg transition-colors"
      >
        {brand}
        <ChevronDown className="h-4 w-4 text-ws-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-ws-surface border border-ws-border rounded-lg shadow-2xl overflow-hidden z-50 fade-in">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-ws-text-muted">
            Cambiar workspace
          </div>
          <div className="max-h-72 overflow-y-auto">
            {available.map((w) => {
              const isCurrent = w.id === workspace.id;
              return (
                <Link
                  key={w.id}
                  href={`/${w.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-ws-bg transition-colors"
                >
                  <WorkspaceMark workspace={w} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ws-text truncate">
                      {w.name}
                    </div>
                    <div className="text-[10px] font-mono text-ws-text-muted">
                      /{w.slug}
                    </div>
                  </div>
                  {isCurrent && (
                    <Check
                      className="h-4 w-4 shrink-0"
                      style={{ color: w.brand_colors.accent }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {isSuperAdmin && (
            <div className="border-t border-ws-border">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-ws-text-muted hover:text-ws-text hover:bg-ws-bg transition-colors"
              >
                <Shield className="h-4 w-4" />
                Ir al Admin Panel
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
