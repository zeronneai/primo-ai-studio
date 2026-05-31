"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2, Save, X } from "lucide-react";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { WorkspacePreview } from "@/components/admin/WorkspacePreview";
import { StyleEditor } from "@/components/admin/StyleEditor";
import { useToast } from "@/components/Toast";
import {
  getAllWorkspaces,
  saveWorkspace,
  updateWorkspace,
  replaceStylesForWorkspace,
} from "@/lib/data/workspaces-store";
import {
  generatePaletteFromPrimary,
  isValidHex,
  withColorFallbacks,
  DEFAULT_WORKSPACE_COLORS,
} from "@/lib/utils/palette";
import { slugify } from "@/lib/utils";
import type { Workspace, WorkspaceStyle, WorkspaceColors } from "@/types";

type ColorKey = keyof WorkspaceColors;

const COLOR_FIELDS: { key: ColorKey; label: string; helper?: string }[] = [
  { key: "primary", label: "Primary", helper: "Color principal de marca" },
  { key: "accent", label: "Accent", helper: "Botones / acciones" },
  { key: "accentSecondary", label: "Accent secundario" },
  { key: "bg", label: "Background", helper: "Fondo general" },
  { key: "surface", label: "Surface", helper: "Cards / superficies" },
  { key: "border", label: "Border" },
  { key: "text", label: "Texto" },
  { key: "textMuted", label: "Texto atenuado" },
];

const inputCls =
  "w-full bg-primo-surface border border-primo-border rounded-md px-3 py-2.5 text-sm text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors";

function emptyStyle(workspaceId: string, sortOrder: number): WorkspaceStyle {
  return {
    id: `style_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    workspace_id: workspaceId,
    name: "",
    slug: "",
    description: "",
    template_prompt: "",
    sort_order: sortOrder,
    is_custom: true,
  };
}

export function WorkspaceForm({
  initialData,
  mode,
}: {
  initialData?: { workspace: Workspace; styles: WorkspaceStyle[] };
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const workspaceId = useMemo(
    () => initialData?.workspace.id ?? `ws_${Date.now()}`,
    [initialData]
  );

  const [name, setName] = useState(initialData?.workspace.name ?? "");
  const [slug, setSlug] = useState(initialData?.workspace.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [industry, setIndustry] = useState(
    initialData?.workspace.industry ?? ""
  );
  const [logoUrl, setLogoUrl] = useState(
    initialData?.workspace.logo_url ?? ""
  );
  const [creditLimit, setCreditLimit] = useState(
    initialData?.workspace.monthly_credit_limit ?? 500
  );
  const [systemPrompt, setSystemPrompt] = useState(
    initialData?.workspace.system_prompt ?? ""
  );
  const [colors, setColors] = useState<WorkspaceColors>(
    initialData
      ? withColorFallbacks(initialData.workspace.brand_colors)
      : { ...DEFAULT_WORKSPACE_COLORS }
  );
  const [styles, setStyles] = useState<WorkspaceStyle[]>(
    initialData && initialData.styles.length > 0
      ? initialData.styles.map((s) => ({ ...s }))
      : [emptyStyle(workspaceId, 1)]
  );
  const [saving, setSaving] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function setColor(key: ColorKey, hex: string) {
    setColors((prev) => ({ ...prev, [key]: hex }));
  }

  function handleGeneratePalette() {
    if (!isValidHex(colors.primary)) {
      showToast("Define un color primary válido primero", "error");
      return;
    }
    setColors(generatePaletteFromPrimary(colors.primary));
    showToast("Paleta generada desde el primary");
  }

  function validate(): string | null {
    if (!name.trim()) return "El nombre es obligatorio";
    if (!slug.trim()) return "El slug es obligatorio";
    if (!industry.trim()) return "La industry es obligatoria";

    // Slug único (excepto el propio workspace en edit)
    const clash = getAllWorkspaces().find(
      (w) => w.slug === slug && w.id !== workspaceId
    );
    if (clash) return `El slug "/${slug}" ya está en uso`;

    // Colores válidos
    for (const f of COLOR_FIELDS) {
      if (!isValidHex(colors[f.key])) return `Color inválido: ${f.label}`;
    }

    // Al menos 1 estilo completo
    const valid = styles.filter(
      (s) => s.name.trim() && s.slug.trim() && s.template_prompt.trim()
    );
    if (valid.length === 0) {
      return "Agrega al menos 1 estilo con nombre, slug y template prompt";
    }

    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) {
      showToast(error, "error");
      return;
    }

    setSaving(true);
    try {
      const workspace: Workspace = {
        id: workspaceId,
        slug,
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        brand_colors: withColorFallbacks(colors),
        industry: industry.trim(),
        monthly_credit_limit: Math.max(0, Number(creditLimit) || 0),
        system_prompt: systemPrompt.trim() || undefined,
        is_custom: true,
      };

      // Estilos válidos, re-numerados
      const cleanStyles = styles
        .filter((s) => s.name.trim() && s.slug.trim() && s.template_prompt.trim())
        .map((s, i) => ({
          ...s,
          workspace_id: workspaceId,
          slug: slugify(s.slug),
          sort_order: i + 1,
          is_custom: true,
        }));

      if (mode === "create") {
        saveWorkspace(workspace);
      } else {
        updateWorkspace(workspaceId, workspace);
      }
      // Reemplaza el set completo de estilos custom del workspace.
      replaceStylesForWorkspace(workspaceId, cleanStyles);

      showToast(
        mode === "create" ? "Workspace creado ✓" : "Cambios guardados ✓"
      );

      if (mode === "create") {
        router.push(`/${slug}`);
      } else {
        router.push("/admin");
      }
    } catch (e) {
      console.error(e);
      showToast("Error al guardar. Intenta de nuevo.", "error");
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
      {/* ── FORM ── */}
      <div className="space-y-8 min-w-0">
        {/* a) IDENTIDAD */}
        <Section title="Identidad">
          <div className="space-y-4">
            <Field label="Nombre">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej. El Rooster Bar"
                className={inputCls}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Slug" hint="La URL será /{slug}">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="rooster"
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field label="Industry">
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Ej. Restaurant-Bar"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* b) BRANDING VISUAL */}
        <Section title="Branding visual">
          <div className="space-y-4">
            <Field label="Logo URL" hint="Opcional">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls}
              />
            </Field>

            <button
              type="button"
              onClick={handleGeneratePalette}
              className="inline-flex items-center gap-2 text-sm border border-primo-border hover:border-primo-accent text-primo-text px-3 py-2 rounded-md transition-colors"
            >
              <Wand2 className="h-4 w-4 text-primo-accent" />
              Generar paleta automática desde primary
            </button>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
              {COLOR_FIELDS.map((f) => (
                <ColorPicker
                  key={f.key}
                  label={f.label}
                  helperText={f.helper}
                  value={colors[f.key]}
                  onChange={(hex) => setColor(f.key, hex)}
                />
              ))}
            </div>
          </div>
        </Section>

        {/* c) CONFIGURACIÓN */}
        <Section title="Configuración">
          <Field label="Límite de créditos mensual">
            <input
              type="number"
              min={0}
              value={creditLimit}
              onChange={(e) => setCreditLimit(Number(e.target.value))}
              className={`${inputCls} max-w-[200px]`}
            />
          </Field>
        </Section>

        {/* d) SYSTEM PROMPT */}
        <Section title="System prompt">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Define la identidad de la marca, audiencia objetivo, influencias visuales, paleta y tipografía, y reglas estrictas para los outputs. Esto se inyecta a Claude en cada generación."
            rows={6}
            className={`${inputCls} leading-relaxed resize-y`}
          />
        </Section>

        {/* e) ESTILOS SIGNATURE */}
        <Section title="Estilos signature">
          <StyleEditor
            styles={styles}
            onChange={setStyles}
            workspaceId={workspaceId}
          />
        </Section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-primo-border">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 text-sm border border-primo-border text-primo-navy hover:bg-primo-surfaceAlt px-5 py-2.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primo-accent text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando…" : "Guardar workspace"}
          </button>
        </div>
      </div>

      {/* ── PREVIEW (sticky) ── */}
      <div className="lg:sticky lg:top-24">
        <WorkspacePreview
          colors={withColorFallbacks(colors)}
          name={name}
          logoUrl={logoUrl.trim() || undefined}
        />
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-bold text-xl text-primo-navy mb-4 pb-2 border-b border-primo-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">
        {label}
        {hint && (
          <span className="text-primo-muted font-normal ml-2 text-xs">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
