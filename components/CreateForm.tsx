"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Sparkles, Image as ImageIcon, Copy, Check, Wand2 } from "lucide-react";
import { saveGeneration } from "@/lib/data/generations-store";
import { getReferences } from "@/lib/data/references-store";
import { downscaleImage, generateId } from "@/lib/utils";
import type {
  Workspace,
  WorkspaceStyle,
  Generation,
  ReferenceAsset,
} from "@/types";

type GenerationResult = {
  scene_description_es: string;
  styles: Record<string, string>;
  references_used?: number;
};

export function CreateForm({
  workspace,
  styles,
}: {
  workspace: Workspace;
  styles: WorkspaceStyle[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    styles.map((s) => s.slug)
  );

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function toggleStyle(slug: string) {
    setSelectedStyles((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  async function handleGenerate() {
    if (!title.trim() || selectedStyles.length === 0) return;

    setGenerating(true);
    setResult(null);
    setGeneratedImages({});

    try {
      // El server no puede leer localStorage: mandamos las referencias
      // (seed + subidas) para que Claude las "consulte". Omitimos image_url
      // (dataURLs pesados) porque el análisis es lo único que se usa.
      const references = getReferences(workspace.id).map(
        (ref: ReferenceAsset) => ({
          id: ref.id,
          workspace_id: ref.workspace_id,
          style_slug: ref.style_slug,
          notes: ref.notes,
          is_user_uploaded: ref.is_user_uploaded,
          analysis: ref.analysis,
        })
      );

      const res = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug: workspace.slug,
          title,
          context,
          styleSlugs: selectedStyles,
          hasImage: !!imageFile,
          references,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const data: GenerationResult = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Error al generar. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateImage(styleSlug: string, prompt: string) {
    setGeneratingImages((prev) => ({ ...prev, [styleSlug]: true }));

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, styleSlug }),
      });

      if (!res.ok) throw new Error("Image generation failed");
      const data: { imageUrl: string } = await res.json();
      setGeneratedImages((prev) => ({ ...prev, [styleSlug]: data.imageUrl }));
    } catch (e) {
      console.error(e);
      alert("Error al generar imagen.");
    } finally {
      setGeneratingImages((prev) => ({ ...prev, [styleSlug]: false }));
    }
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(key);
    setTimeout(() => setCopiedPrompt(null), 2000);
  }

  async function handleSaveAndGoToHistory() {
    if (!result) return;
    // Redimensionar la imagen fuente antes de persistir en localStorage
    const compressedSource = imagePreview
      ? await downscaleImage(imagePreview)
      : null;
    const generation: Generation = {
      id: generateId("gen"),
      workspace_id: workspace.id,
      source_image_url: compressedSource,
      title,
      context,
      scene_description: result.scene_description_es,
      prompts: result.styles,
      generated_images: generatedImages,
      created_at: new Date().toISOString(),
    };
    saveGeneration(generation);
    router.push(`/${workspace.slug}/historial`);
  }

  const canGenerate = title.trim().length > 0 && selectedStyles.length > 0 && !generating;

  return (
    <div className="space-y-8">
      {/* INPUT FORM */}
      <div className="bg-primo-surface border border-primo-border rounded-xl p-6 space-y-6">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Imagen de referencia (opcional)
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-primo-border hover:border-primo-muted rounded-lg p-6 cursor-pointer transition-colors"
          >
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-md"
              />
            ) : (
              <div className="text-center text-primo-muted">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Click para subir foto del atleta/escena</p>
                <p className="text-xs mt-1">Sin imagen también funciona</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Título del thumbnail <span className="text-primo-accent">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. TRAINING WITH BASEBALL PROS"
            className="w-full bg-primo-bg border border-primo-border rounded-md px-4 py-2.5 text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors"
          />
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Contexto adicional (opcional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ej. Episodio sobre entrenamiento con jugadores profesionales..."
            rows={2}
            className="w-full bg-primo-bg border border-primo-border rounded-md px-4 py-2.5 text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors resize-none"
          />
        </div>

        {/* Style selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Estilos a generar
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {styles.map((style) => {
              const isSelected = selectedStyles.includes(style.slug);
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => toggleStyle(style.slug)}
                  className="text-left p-4 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? workspace.brand_colors.accent + "10"
                      : "transparent",
                    borderColor: isSelected
                      ? workspace.brand_colors.accent
                      : "#1f1f23",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{style.name}</span>
                    {isSelected && (
                      <Check
                        className="h-4 w-4"
                        style={{ color: workspace.brand_colors.accent }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-primo-muted leading-relaxed line-clamp-2">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-md font-medium transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: workspace.brand_colors.accent }}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generando prompts con Claude...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generar prompts
            </>
          )}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="space-y-4 fade-in">
          {/* Scene description */}
          <div className="bg-primo-surface border border-primo-border rounded-xl p-6">
            <h3 className="text-sm font-medium text-primo-muted uppercase tracking-wider mb-2">
              Escena detectada
            </h3>
            <p className="text-primo-text italic">
              &ldquo;{result.scene_description_es}&rdquo;
            </p>
            {!!result.references_used && result.references_used > 0 && (
              <div
                className="inline-flex items-center gap-1.5 mt-3 text-xs px-2.5 py-1 rounded-full border"
                style={{
                  color: workspace.brand_colors.accent,
                  borderColor: workspace.brand_colors.accent + "40",
                  backgroundColor: workspace.brand_colors.accent + "10",
                }}
              >
                <Sparkles className="h-3 w-3" />
                Generado usando {result.references_used}{" "}
                {result.references_used === 1
                  ? "referencia visual"
                  : "referencias visuales"}{" "}
                del workspace
              </div>
            )}
          </div>

          {/* Prompts */}
          {Object.entries(result.styles).map(([styleSlug, prompt]) => {
            const style = styles.find((s) => s.slug === styleSlug);
            if (!style) return null;
            const generatedImage = generatedImages[styleSlug];
            const isGeneratingImage = generatingImages[styleSlug];
            const isCopied = copiedPrompt === styleSlug;

            return (
              <div
                key={styleSlug}
                className="bg-primo-surface border border-primo-border rounded-xl p-6 fade-in"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: workspace.brand_colors.accent }}
                    />
                    <h3 className="font-semibold">{style.name}</h3>
                  </div>
                  <span className="text-xs font-mono text-primo-muted">
                    {style.slug}
                  </span>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Prompt */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primo-muted uppercase tracking-wider">
                        Prompt
                      </span>
                      <button
                        onClick={() => handleCopy(prompt, styleSlug)}
                        className="inline-flex items-center gap-1.5 text-xs text-primo-muted hover:text-primo-text transition-colors"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copiar
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-primo-bg border border-primo-border rounded-md p-4 font-mono text-xs text-primo-text leading-relaxed max-h-64 overflow-y-auto">
                      {prompt}
                    </div>
                  </div>

                  {/* Image generation */}
                  <div className="space-y-2">
                    <span className="text-xs text-primo-muted uppercase tracking-wider">
                      Imagen generada
                    </span>
                    <div className="aspect-[4/5] bg-primo-bg border border-primo-border rounded-md overflow-hidden relative">
                      {generatedImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={generatedImage}
                          alt={style.name}
                          className="w-full h-full object-cover fade-in"
                        />
                      ) : isGeneratingImage ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-primo-muted">
                          <Loader2 className="h-6 w-6 animate-spin mb-2" />
                          <p className="text-xs">Generando con Nano Banana...</p>
                          <p className="text-[10px] mt-1">~3-5 segundos</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateImage(styleSlug, prompt)}
                          className="absolute inset-0 flex flex-col items-center justify-center text-primo-muted hover:text-primo-text transition-colors group"
                        >
                          <Wand2 className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                          <p className="text-xs">Generar imagen</p>
                          <p className="text-[10px] mt-1 text-primo-muted">
                            5 créditos
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Save action */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setResult(null);
                setGeneratedImages({});
              }}
              className="text-sm text-primo-muted hover:text-primo-text transition-colors px-4 py-2"
            >
              Descartar
            </button>
            <button
              onClick={handleSaveAndGoToHistory}
              className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: workspace.brand_colors.accent }}
            >
              <ImageIcon className="h-4 w-4" />
              Guardar en historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
