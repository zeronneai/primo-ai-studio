"use client";

import { useRef, useState } from "react";
import { Loader2, X, Sparkles, ImagePlus, Save } from "lucide-react";
import {
  saveReference,
  updateReference,
} from "@/lib/data/references-store";
import { downscaleImage, generateId } from "@/lib/utils";
import { readableTextOn } from "@/lib/utils/palette";
import type {
  Workspace,
  WorkspaceStyle,
  ReferenceAsset,
  ReferenceAnalysis,
} from "@/types";

export function UploadReferenceDialog({
  workspace,
  styles,
  editing,
  onClose,
  onSaved,
}: {
  workspace: Workspace;
  styles: WorkspaceStyle[];
  /** Si se pasa, el dialog está en modo edición de esa referencia. */
  editing?: ReferenceAsset | null;
  onClose: () => void;
  onSaved: (reference: ReferenceAsset) => void;
}) {
  const isEditing = !!editing;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // En edición arrancamos con la imagen existente; marcamos si cambió.
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(
    editing?.image_url ?? null
  );
  const [imageChanged, setImageChanged] = useState(false);
  const [styleSlug, setStyleSlug] = useState<string>(editing?.style_slug ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = workspace.brand_colors.accent;
  const onAccent = readableTextOn(accent);

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
      setImageChanged(true);
    };
    reader.readAsDataURL(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  async function analyze(imageUrl: string): Promise<ReferenceAnalysis | null> {
    const res = await fetch("/api/analyze-reference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: imageUrl,
        workspaceSlug: workspace.slug,
        styleSlug: styleSlug || null,
        notes,
      }),
    });
    if (!res.ok) throw new Error("Analysis failed");
    const data: { analysis: ReferenceAnalysis } = await res.json();
    return data.analysis;
  }

  async function handleSubmit() {
    if (!imageDataUrl || saving) return;

    setSaving(true);
    setError(null);

    try {
      // ── Modo edición sin cambiar imagen: solo guardar estilo/notas ──
      if (isEditing && !imageChanged && editing) {
        updateReference(editing.id, {
          style_slug: styleSlug || null,
          notes: notes.trim() || editing.notes,
        });
        onSaved({
          ...editing,
          style_slug: styleSlug || null,
          notes: notes.trim() || editing.notes,
        });
        onClose();
        return;
      }

      // ── Imagen nueva o reemplazada: comprimir + re-analizar ──
      const compressed = await downscaleImage(imageDataUrl);
      const analysis = await analyze(compressed);

      if (isEditing && editing) {
        const updated: ReferenceAsset = {
          ...editing,
          image_url: compressed,
          style_slug: styleSlug || null,
          notes: notes.trim() || editing.notes,
          analysis,
        };
        updateReference(editing.id, updated);
        onSaved(updated);
      } else {
        const reference: ReferenceAsset = {
          id: generateId("ref"),
          workspace_id: workspace.id,
          image_url: compressed,
          style_slug: styleSlug || null,
          notes: notes.trim() || "Referencia del workspace",
          is_user_uploaded: true,
          analysis,
          created_at: new Date().toISOString(),
        };
        saveReference(reference);
        onSaved(reference);
      }
      onClose();
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  // Cuándo necesitamos re-analizar (muestra el estado "analizando").
  const willAnalyze = !isEditing || imageChanged;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-ws-surface border border-ws-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ws-border">
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              {isEditing ? "EDITAR REFERENCIA" : "SUBIR REFERENCIA"}
            </h2>
            <p className="text-xs text-ws-text-muted mt-1">
              {workspace.name} · ADN visual
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ws-text-muted hover:text-ws-text transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors"
            style={{
              borderColor: isDragging ? accent : "var(--ws-border)",
              backgroundColor: isDragging ? accent + "10" : "transparent",
            }}
          >
            {imageDataUrl ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageDataUrl}
                  alt="Preview"
                  className="max-h-56 mx-auto rounded-md"
                />
                <p className="text-center text-xs text-ws-text-muted">
                  Click o arrastra otra imagen para reemplazar
                </p>
              </div>
            ) : (
              <div className="text-center text-ws-text-muted py-4">
                <ImagePlus className="h-10 w-10 mx-auto mb-3" />
                <p className="text-sm font-medium text-ws-text">
                  Arrastra una imagen aquí
                </p>
                <p className="text-xs mt-1">o haz click para seleccionar</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Style select */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Asignar a estilo (opcional)
            </label>
            <select
              value={styleSlug}
              onChange={(e) => setStyleSlug(e.target.value)}
              className="w-full bg-ws-bg border border-ws-border rounded-md px-4 py-2.5 text-ws-text focus:outline-none transition-colors"
              style={{ borderColor: styleSlug ? accent : undefined }}
            >
              <option value="">Sin estilo específico</option>
              {styles.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Pieza que funcionó muy bien, mantener este estilo de texto..."
              rows={2}
              className="w-full bg-ws-bg border border-ws-border rounded-md px-4 py-2.5 text-ws-text placeholder:text-ws-text-muted focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Analyzing state */}
          {saving && willAnalyze && (
            <div className="flex items-center gap-3 bg-ws-bg border border-ws-border rounded-lg p-4 fade-in">
              <Loader2
                className="h-5 w-5 animate-spin"
                style={{ color: accent }}
              />
              <div>
                <p className="text-sm font-medium">
                  Claude Vision está analizando...
                </p>
                <p className="text-xs text-ws-text-muted">
                  Extrayendo colores, composición y mood (~3s)
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="text-sm text-ws-text-muted hover:text-ws-text transition-colors px-4 py-2 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!imageDataUrl || saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent, color: onAccent }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {willAnalyze ? "Analizando..." : "Guardando..."}
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  Guardar cambios
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Subir y analizar con IA
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
