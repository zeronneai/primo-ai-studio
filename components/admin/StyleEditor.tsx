"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { WorkspaceStyle } from "@/types";

const MAX_STYLES = 5;
const inputCls =
  "w-full bg-primo-bg border border-primo-border rounded-md px-3 py-2 text-sm text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors";

export function StyleEditor({
  styles,
  onChange,
  workspaceId,
}: {
  styles: WorkspaceStyle[];
  onChange: (styles: WorkspaceStyle[]) => void;
  workspaceId: string;
}) {
  // Por defecto expandimos el último estilo (recién agregado / vacío).
  const [expandedId, setExpandedId] = useState<string | null>(
    styles[styles.length - 1]?.id ?? null
  );

  function update(id: string, patch: Partial<WorkspaceStyle>) {
    onChange(styles.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateName(id: string, name: string) {
    const style = styles.find((s) => s.id === id);
    // Auto-generar slug desde el nombre si el slug estaba vacío o seguía
    // al nombre anterior (heurística: si coincide con slugify del previo).
    const autoSlug =
      !style?.slug || style.slug === slugify(style.name) ? slugify(name) : style.slug;
    update(id, { name, slug: autoSlug });
  }

  function remove(id: string) {
    if (styles.length <= 1) return;
    onChange(styles.filter((s) => s.id !== id));
  }

  function add() {
    if (styles.length >= MAX_STYLES) return;
    const newStyle: WorkspaceStyle = {
      id: `style_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      workspace_id: workspaceId,
      name: "",
      slug: "",
      description: "",
      template_prompt: "",
      sort_order: styles.length + 1,
      is_custom: true,
    };
    onChange([...styles, newStyle]);
    setExpandedId(newStyle.id);
  }

  return (
    <div className="space-y-3">
      {styles.map((style, idx) => {
        const isExpanded = expandedId === style.id;
        const title = style.name.trim() || `Estilo ${idx + 1}`;
        return (
          <div
            key={style.id}
            className="border border-primo-border rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-primo-bg/40">
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : style.id)}
                className="flex items-center gap-2 text-sm font-medium text-primo-text"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-primo-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-primo-muted" />
                )}
                {title}
                {style.slug && (
                  <span className="text-xs font-mono text-primo-muted">
                    {style.slug}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(style.id)}
                disabled={styles.length <= 1}
                title={
                  styles.length <= 1
                    ? "Debe haber al menos 1 estilo"
                    : "Eliminar estilo"
                }
                className="text-primo-muted hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-3 fade-in">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={style.name}
                      onChange={(e) => updateName(style.id, e.target.value)}
                      placeholder="Ej. Estilo Editorial"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={style.slug}
                      onChange={(e) =>
                        update(style.id, { slug: slugify(e.target.value) })
                      }
                      placeholder="estilo_editorial"
                      className={`${inputCls} font-mono`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={style.description}
                    onChange={(e) =>
                      update(style.id, { description: e.target.value })
                    }
                    placeholder="Breve descripción del estilo y su vibe."
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Template prompt
                  </label>
                  <textarea
                    value={style.template_prompt}
                    onChange={(e) =>
                      update(style.id, { template_prompt: e.target.value })
                    }
                    placeholder="Plantilla del prompt. Usa [SCENE] y [TITLE] como placeholders: se reemplazan por la escena detectada y el título del thumbnail en cada generación."
                    rows={4}
                    className={`${inputCls} font-mono text-xs leading-relaxed resize-y`}
                  />
                  <p className="text-[11px] text-primo-muted mt-1">
                    Usa <code className="text-primo-accent">[SCENE]</code> y{" "}
                    <code className="text-primo-accent">[TITLE]</code> como
                    placeholders.
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        disabled={styles.length >= MAX_STYLES}
        className="inline-flex items-center gap-2 text-sm text-primo-accent hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        <Plus className="h-4 w-4" />
        Agregar estilo
        {styles.length >= MAX_STYLES && (
          <span className="text-primo-muted">(máx. {MAX_STYLES})</span>
        )}
      </button>
    </div>
  );
}
