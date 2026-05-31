"use client";

import { LayoutGrid, Image as ImageIcon, Plus } from "lucide-react";
import { readableTextOn } from "@/lib/utils/palette";
import type { WorkspaceColors } from "@/types";

// Mockup en vivo de cómo se verá el workspace con los colores elegidos.
export function WorkspacePreview({
  colors,
  name,
  logoUrl,
}: {
  colors: WorkspaceColors;
  name: string;
  logoUrl?: string;
}) {
  const onAccent = readableTextOn(colors.accent);
  const displayName = name.trim() || "Nuevo Workspace";

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-primo-muted mb-2">
        Vista previa
      </div>
      <div
        className="rounded-xl overflow-hidden border shadow-lg"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        {/* Mini header */}
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <div className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={displayName}
                className="h-6 w-6 rounded object-contain"
                style={{ backgroundColor: colors.bg }}
              />
            ) : (
              <div
                className="h-6 w-6 rounded flex items-center justify-center text-xs font-display"
                style={{ backgroundColor: colors.accent + "33", color: colors.accent }}
              >
                {displayName.charAt(0)}
              </div>
            )}
            <span
              className="text-sm font-semibold"
              style={{ color: colors.accent }}
            >
              {displayName}
            </span>
          </div>
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: colors.border }}
          />
        </div>

        <div className="flex" style={{ minHeight: 160 }}>
          {/* Mini sidebar */}
          <div
            className="w-20 shrink-0 border-r py-2 px-1.5 space-y-1"
            style={{ borderColor: colors.border }}
          >
            <div
              className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] border-l-2"
              style={{
                borderColor: colors.accent,
                backgroundColor: colors.surface,
                color: colors.text,
              }}
            >
              <LayoutGrid className="h-3 w-3" />
              Inicio
            </div>
            <div
              className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] border-l-2 border-transparent"
              style={{ color: colors.textMuted }}
            >
              <ImageIcon className="h-3 w-3" />
              Crear
            </div>
          </div>

          {/* Mini contenido */}
          <div className="flex-1 p-3">
            <div
              className="rounded-lg border p-3"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: colors.text }}
              >
                Card de ejemplo
              </div>
              <div
                className="text-[10px] mb-2 leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                Texto secundario tintado con la marca.
              </div>
              {/* "Imagen" placeholder */}
              <div
                className="rounded-md mb-2 flex items-center justify-center"
                style={{
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`,
                  height: 44,
                }}
              >
                <ImageIcon
                  className="h-4 w-4"
                  style={{ color: colors.textMuted }}
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1.5 rounded-md"
                style={{ backgroundColor: colors.accent, color: onAccent }}
              >
                <Plus className="h-3 w-3" />
                Acción
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
