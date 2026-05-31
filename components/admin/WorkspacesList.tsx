"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Users, Trash2 } from "lucide-react";
import { getAllWorkspaces } from "@/lib/data/workspaces-store";
import { getStylesForWorkspace } from "@/lib/data/workspaces-store";
import { getMembers } from "@/lib/data/members-store";
import type { Workspace } from "@/types";

type Row = {
  workspace: Workspace;
  styleCount: number;
  memberCount: number;
};

export function WorkspacesList() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const all = getAllWorkspaces();
    setRows(
      all.map((workspace) => ({
        workspace,
        styleCount: getStylesForWorkspace(workspace.id).length,
        memberCount: getMembers(workspace.id).length,
      }))
    );
  }, []);

  // Cargando (SSR / primer render cliente)
  if (rows === null) {
    return (
      <div className="space-y-2">
        <div className="shimmer h-14 rounded-md" />
        <div className="shimmer h-14 rounded-md" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-primo-surface border border-primo-border rounded-lg p-12 text-center">
        <p className="text-primo-muted">No hay workspaces todavía.</p>
      </div>
    );
  }

  return (
    <div className="bg-primo-surface border border-primo-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primo-border text-left text-xs uppercase tracking-wider text-primo-muted">
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Industry</th>
              <th className="px-4 py-3 font-medium text-center">Estilos</th>
              <th className="px-4 py-3 font-medium text-center">Miembros</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ workspace, styleCount, memberCount }) => (
              <WorkspaceRow
                key={workspace.id}
                workspace={workspace}
                styleCount={styleCount}
                memberCount={memberCount}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorkspaceRow({
  workspace,
  styleCount,
  memberCount,
}: Row) {
  const isCustom = workspace.is_custom === true;
  const accent = workspace.brand_colors.accent;

  return (
    <tr className="border-b border-primo-border last:border-0 hover:bg-primo-bg/40 transition-colors">
      {/* Logo + nombre + badge */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {workspace.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={workspace.logo_url}
              alt={workspace.name}
              className="h-9 w-9 rounded-md object-contain bg-primo-bg"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center font-display text-base"
              style={{ backgroundColor: accent + "20", color: accent }}
            >
              {workspace.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-primo-text">
                {workspace.name}
              </span>
              {isCustom ? (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primo-accent/15 text-primo-accent font-medium">
                  Custom
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primo-border text-primo-muted font-medium">
                  Demo
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 font-mono text-xs text-primo-muted">
        /{workspace.slug}
      </td>
      <td className="px-4 py-3 text-primo-muted">{workspace.industry}</td>
      <td className="px-4 py-3 text-center text-primo-text">{styleCount}</td>
      <td className="px-4 py-3 text-center text-primo-text">{memberCount}</td>

      {/* Acciones */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/${workspace.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-primo-muted hover:text-primo-text px-2 py-1.5 rounded-md hover:bg-primo-bg transition-colors"
            title="Ver workspace"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Link>

          <Link
            href={`/admin/${workspace.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-primo-muted hover:text-primo-text px-2 py-1.5 rounded-md hover:bg-primo-bg transition-colors"
            title="Editar workspace"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>

          <button
            disabled
            title="Próximamente — Fase 5"
            className="inline-flex items-center gap-1.5 text-xs text-primo-muted/40 px-2 py-1.5 rounded-md cursor-not-allowed"
          >
            <Users className="h-3.5 w-3.5" />
            Miembros
          </button>

          {isCustom && (
            <button
              disabled
              title="Próximamente — Fase 3"
              className="inline-flex items-center gap-1.5 text-xs text-red-400/40 px-2 py-1.5 rounded-md cursor-not-allowed"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
