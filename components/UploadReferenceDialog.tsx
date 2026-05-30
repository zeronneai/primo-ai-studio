"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, Sparkles, ImagePlus } from "lucide-react";
import { saveReference } from "@/lib/data/references-store";
import { downscaleImage, generateId } from "@/lib/utils";
import type {
  Workspace,
  WorkspaceStyle,
  ReferenceAsset,
  ReferenceAnalysis,
} from "@/types";

export function UploadReferenceDialog({
  workspace,
  styles,
  onClose,
  onSaved,
}: {
  workspace: Workspace;
  styles: WorkspaceStyle[];
  onClose: () => void;
  onSaved: (reference: ReferenceAsset) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [styleSlug, setStyleSlug] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = workspace.brand_colors.accent;

  function readFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
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

  async function handleSubmit() {
    if (!imageDataUrl || analyzing) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Redimensionar antes de enviar/guardar para no saturar localStorage
      const compressed = await downscaleImage(imageDataUrl);

      const res = await fetch("/api/analyze-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: compressed,
          workspaceSlug: workspace.slug,
          styleSlug: styleSlug || null,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const data: { analysis: ReferenceAnalysis } = await res.json();

      const reference: ReferenceAsset = {
        id: generateId("ref"),
        workspace_id: workspace.id,
        image_url: compressed,
        style_slug: styleSlug || null,
        notes: notes.trim() || "Referencia subida por el usuario",
        is_user_uploaded: true,
        analysis: data.analysis,
        created_at: new Date().toISOString(),
      };

      saveReference(reference);
      onSaved(reference);
      onClose();
    } catch (e) {
      console.error(e);
      setError("No se pudo analizar la imagen. Intenta de nuevo.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-primo-surface border border-primo-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primo-border">
          <div>
            <h2 className="font-display text-2xl tracking-tight">
              SUBIR REFERENCIA
            </h2>
            <p className="text-xs text-primo-muted mt-1">
              {workspace.name} · ADN visual
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-primo-muted hover:text-primo-text transition-colors"
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
              borderColor: isDragging ? accent : "#2A3E4F",
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
                <p className="text-center text-xs text-primo-muted">
                  Click o arrastra otra imagen para reemplazar
                </p>
              </div>
            ) : (
              <div className="text-center text-primo-muted py-4">
                <ImagePlus className="h-10 w-10 mx-auto mb-3" />
                <p className="text-sm font-medium text-primo-text">
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
              className="w-full bg-primo-bg border border-primo-border rounded-md px-4 py-2.5 text-primo-text focus:outline-none transition-colors"
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
              placeholder="Ej. Thumbnail que funcionó muy bien, mantener este estilo de texto..."
              rows={2}
              className="w-full bg-primo-bg border border-primo-border rounded-md px-4 py-2.5 text-primo-text placeholder:text-primo-muted focus:outline-none transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-primo-accentSecondary">{error}</p>
          )}

          {/* Analyzing state */}
          {analyzing && (
            <div className="flex items-center gap-3 bg-primo-bg border border-primo-border rounded-lg p-4 fade-in">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: accent }} />
              <div>
                <p className="text-sm font-medium">
                  Claude Vision está analizando...
                </p>
                <p className="text-xs text-primo-muted">
                  Extrayendo colores, composición y mood (~3s)
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={analyzing}
              className="text-sm text-primo-muted hover:text-primo-text transition-colors px-4 py-2 disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!imageDataUrl || analyzing}
              className="inline-flex items-center gap-2 text-primo-bg px-5 py-2.5 rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accent }}
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
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
