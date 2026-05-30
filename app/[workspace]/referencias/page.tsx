"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import {
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  Star,
} from "lucide-react";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import {
  getReferences,
  deleteReference,
} from "@/lib/data/references-store";
import { UploadReferenceDialog } from "@/components/UploadReferenceDialog";
import type { Workspace, WorkspaceStyle, ReferenceAsset } from "@/types";

export default function ReferenciasPage() {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [styles, setStyles] = useState<WorkspaceStyle[]>([]);
  const [references, setReferences] = useState<ReferenceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const ws = getWorkspace(slug);
    if (!ws) {
      notFound();
      return;
    }
    setWorkspace(ws);
    setStyles(getWorkspaceStyles(ws.id));
    setReferences(getReferences(ws.id));
    setLoading(false);
  }, [slug]);

  function refresh(ws: Workspace) {
    setReferences(getReferences(ws.id));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaved() {
    if (!workspace) return;
    refresh(workspace);
    showToast("Referencia analizada y guardada ✓");
  }

  function handleDelete(id: string) {
    if (!workspace) return;
    deleteReference(id);
    refresh(workspace);
    showToast("Referencia eliminada");
  }

  if (loading || !workspace) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="shimmer h-12 w-64 rounded-md mb-4" />
        <div className="shimmer h-4 w-96 rounded-md" />
      </div>
    );
  }

  const accent = workspace.brand_colors.accent;
  const styleName = (s: string | null) =>
    styles.find((st) => st.slug === s)?.name ?? s;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="text-sm text-primo-muted mb-2">
            {workspace.name} · Referencias
          </div>
          <h1 className="font-display text-4xl tracking-tight">
            REFERENCIAS VISUALES
          </h1>
          <p className="text-primo-muted text-sm mt-2">
            ADN visual del workspace · {references.length} referencias cargadas
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 text-primo-bg px-4 py-2.5 rounded-md font-medium transition-opacity hover:opacity-90 shrink-0"
          style={{ backgroundColor: accent }}
        >
          <Upload className="h-4 w-4" />
          Subir referencia
        </button>
      </div>

      {/* Explainer */}
      <div className="bg-primo-surface border border-primo-border rounded-lg p-6 mb-8">
        <h2 className="font-semibold mb-2">¿Cómo funciona?</h2>
        <p className="text-sm text-primo-muted leading-relaxed">
          Las referencias visuales son thumbnails/flyers ya producidos que el
          sistema analiza para aprender el estilo de la marca. Cuando subes una
          referencia, Claude Vision extrae su ADN visual (colores, composición,
          mood, tipografía) y lo inyecta como contexto en cada nueva generación
          para mantener coherencia.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {references.map((ref) => {
          const isExpanded = expanded === ref.id;
          return (
            <div
              key={ref.id}
              className="bg-primo-surface border border-primo-border rounded-lg overflow-hidden fade-in flex flex-col"
            >
              <div className="aspect-[4/5] bg-primo-bg relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ref.image_url}
                  alt={ref.notes}
                  className="w-full h-full object-cover"
                />
                {ref.is_user_uploaded && (
                  <span
                    className="absolute top-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full text-primo-bg"
                    style={{ backgroundColor: accent }}
                  >
                    Subida por ti
                  </span>
                )}
                {ref.is_user_uploaded && (
                  <button
                    onClick={() => handleDelete(ref.id)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-primo-accentSecondary hover:bg-black/80 transition-colors"
                    aria-label="Eliminar referencia"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="p-4 flex flex-col flex-1">
                {ref.style_slug && (
                  <div
                    className="text-xs font-mono mb-1"
                    style={{ color: accent }}
                  >
                    {styleName(ref.style_slug)}
                  </div>
                )}
                <p className="text-sm text-primo-text flex-1">{ref.notes}</p>

                {ref.analysis && (
                  <>
                    <button
                      onClick={() =>
                        setExpanded(isExpanded ? null : ref.id)
                      }
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-primo-muted hover:text-primo-text transition-colors"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isExpanded ? "Ocultar análisis IA" : "Ver análisis IA"}
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2.5 text-xs fade-in border-t border-primo-border pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-primo-muted uppercase tracking-wider">
                            Quality score
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold">
                            <Star
                              className="h-3 w-3"
                              style={{ color: accent }}
                              fill={accent}
                            />
                            {ref.analysis.quality_score}/10
                          </span>
                        </div>

                        <div>
                          <span className="text-primo-muted uppercase tracking-wider block mb-1">
                            Colores
                          </span>
                          <div className="flex gap-1.5">
                            {ref.analysis.dominant_colors.map((c) => (
                              <span
                                key={c}
                                title={c}
                                className="h-5 w-5 rounded border border-primo-border"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>

                        <AnalysisRow
                          label="Composición"
                          value={ref.analysis.composition}
                        />
                        <AnalysisRow
                          label="Iluminación"
                          value={ref.analysis.lighting_style}
                        />
                        <AnalysisRow label="Mood" value={ref.analysis.mood} />
                        <AnalysisRow
                          label="Tipografía"
                          value={ref.analysis.typography_style}
                        />

                        <div>
                          <span className="text-primo-muted uppercase tracking-wider block mb-1">
                            Elementos recurrentes
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {ref.analysis.recurring_elements.map((el) => (
                              <span
                                key={el}
                                className="px-2 py-0.5 rounded-full bg-primo-bg border border-primo-border text-primo-muted"
                              >
                                {el}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload dialog */}
      {dialogOpen && (
        <UploadReferenceDialog
          workspace={workspace}
          styles={styles}
          onClose={() => setDialogOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[110] flex items-center gap-2 bg-primo-surface border border-primo-border rounded-lg px-4 py-3 shadow-2xl fade-in">
          <Check className="h-4 w-4" style={{ color: accent }} />
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-primo-muted uppercase tracking-wider block mb-0.5">
        {label}
      </span>
      <p className="text-primo-text leading-relaxed">{value}</p>
    </div>
  );
}
