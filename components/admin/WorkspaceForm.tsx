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
import type {
  Workspace,
  WorkspaceStyle,
  WorkspaceColors,
  BusinessProfile,
} from "@/types";

const EMPTY_BUSINESS_PROFILE: BusinessProfile = {
  business_type: "",
  target_audience: "",
  location: "",
  main_goal: "",
  main_goal_detail: "",
  competitors: "",
  current_offer: "",
  content_tone: "",
  avoid_topics: "",
  key_differentiators: "",
  extra_notes: "",
};

const MAIN_GOAL_OPTIONS = [
  { value: "leads", label: "Generar leads" },
  { value: "ventas", label: "Ventas directas" },
  { value: "awareness", label: "Awareness de marca" },
  { value: "comunidad", label: "Construir comunidad" },
  { value: "otro", label: "Otro" },
];

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

export type WorkspaceFormField =
  | "name"
  | "slug"
  | "industry"
  | "monthly_credit_limit"
  | "business_profile";

export function WorkspaceForm({
  initialData,
  mode,
  hideFields = [],
  redirectTo,
}: {
  initialData?: { workspace: Workspace; styles: WorkspaceStyle[] };
  mode: "create" | "edit";
  /** Campos a ocultar (p. ej. para el owner: name/slug/credit limit). */
  hideFields?: WorkspaceFormField[];
  /** A dónde ir tras guardar. Si es null, se queda en la página. */
  redirectTo?: string | null;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isHidden = (f: WorkspaceFormField) => hideFields.includes(f);

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
  const [profile, setProfile] = useState<BusinessProfile>({
    ...EMPTY_BUSINESS_PROFILE,
    ...(initialData?.workspace.business_profile ?? {}),
  });
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
    if (!isHidden("name") && !name.trim()) return "El nombre es obligatorio";
    if (!isHidden("slug") && !slug.trim()) return "El slug es obligatorio";
    if (!isHidden("industry") && !industry.trim())
      return "La industry es obligatoria";

    // Slug único (excepto el propio workspace en edit)
    if (!isHidden("slug")) {
      const clash = getAllWorkspaces().find(
        (w) => w.slug === slug && w.id !== workspaceId
      );
      if (clash) return `El slug "/${slug}" ya está en uso`;
    }

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
      // Guardar el perfil solo si tiene algún dato (evita objeto vacío).
      const trimmedProfile: BusinessProfile = Object.fromEntries(
        Object.entries(profile).map(([k, v]) => [k, v.trim()])
      ) as BusinessProfile;
      const hasProfileData = Object.values(trimmedProfile).some((v) => v);

      const workspace: Workspace = {
        id: workspaceId,
        slug,
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
        brand_colors: withColorFallbacks(colors),
        industry: industry.trim(),
        monthly_credit_limit: Math.max(0, Number(creditLimit) || 0),
        system_prompt: systemPrompt.trim() || undefined,
        business_profile: hasProfileData ? trimmedProfile : undefined,
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
        mode === "create" ? "Workspace creado ✓" : "Configuración guardada ✓"
      );

      // redirectTo === null → quedarse en la página (modo configuración owner)
      if (redirectTo === null) {
        setSaving(false);
        return;
      }
      const dest = redirectTo ?? (mode === "create" ? `/${slug}` : "/admin");
      router.push(dest);
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
        {(!isHidden("name") || !isHidden("slug") || !isHidden("industry")) && (
          <Section title="Identidad">
            <div className="space-y-4">
              {!isHidden("name") && (
                <Field label="Nombre">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej. El Rooster Bar"
                    className={inputCls}
                  />
                </Field>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                {!isHidden("slug") && (
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
                )}
                {!isHidden("industry") && (
                  <Field label="Industry">
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Ej. Restaurant-Bar"
                      className={inputCls}
                    />
                  </Field>
                )}
              </div>
            </div>
          </Section>
        )}

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
        {!isHidden("monthly_credit_limit") && (
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
        )}

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

        {/* d.2) PERFIL DE NEGOCIO */}
        {!isHidden("business_profile") && (
          <Section title="Perfil de negocio">
            <p className="text-sm text-primo-muted mb-5 -mt-2">
              Este perfil ayuda a la IA a generar ideas de contenido relevantes
              y buscar tendencias de tu industria. Diferente del system prompt
              visual (que es para generar imágenes).
            </p>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tipo de negocio">
                  <input
                    type="text"
                    value={profile.business_type}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        business_type: e.target.value,
                      }))
                    }
                    placeholder="Ej. Academia de baseball"
                    className={inputCls}
                  />
                </Field>
                <Field label="Ubicación" hint="Para trends locales">
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="Ej. El Paso, TX / border region"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Audiencia objetivo">
                <textarea
                  value={profile.target_audience}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      target_audience: e.target.value,
                    }))
                  }
                  placeholder="Ej. Padres de atletas 8-18 años, serios sobre el desarrollo deportivo"
                  rows={2}
                  className={`${inputCls} resize-y`}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Objetivo principal">
                  <select
                    value={profile.main_goal}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, main_goal: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="">Selecciona…</option>
                    {MAIN_GOAL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Detalle del objetivo">
                  <input
                    type="text"
                    value={profile.main_goal_detail}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        main_goal_detail: e.target.value,
                      }))
                    }
                    placeholder="Ej. Llenar clases de verano 2026"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Tono de contenido">
                  <input
                    type="text"
                    value={profile.content_tone}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        content_tone: e.target.value,
                      }))
                    }
                    placeholder="Ej. Motivacional, profesional, no payaso"
                    className={inputCls}
                  />
                </Field>
                <Field label="Temas a evitar">
                  <input
                    type="text"
                    value={profile.avoid_topics}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        avoid_topics: e.target.value,
                      }))
                    }
                    placeholder="Ej. Política, religión, comparaciones directas"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Competencia" hint="Opcional">
                  <textarea
                    value={profile.competitors}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        competitors: e.target.value,
                      }))
                    }
                    placeholder="Ej. Academias X, Y en la zona"
                    rows={2}
                    className={`${inputCls} resize-y`}
                  />
                </Field>
                <Field label="Diferenciadores clave">
                  <textarea
                    value={profile.key_differentiators}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        key_differentiators: e.target.value,
                      }))
                    }
                    placeholder="Ej. Único con tech de tracking, coaches ex-MLB"
                    rows={2}
                    className={`${inputCls} resize-y`}
                  />
                </Field>
              </div>

              <Field label="Oferta / promoción actual" hint="Opcional">
                <input
                  type="text"
                  value={profile.current_offer}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      current_offer: e.target.value,
                    }))
                  }
                  placeholder="Ej. Descuento early-bird summer program"
                  className={inputCls}
                />
              </Field>

              <Field label="Notas adicionales">
                <textarea
                  value={profile.extra_notes}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, extra_notes: e.target.value }))
                  }
                  placeholder="Cualquier contexto extra: eventos próximos, colaboraciones, restricciones, etc."
                  rows={4}
                  className={`${inputCls} leading-relaxed resize-y`}
                />
              </Field>
            </div>
          </Section>
        )}

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
            onClick={() =>
              router.push(
                redirectTo === null ? `/${slug}` : redirectTo ?? "/admin"
              )
            }
            className="inline-flex items-center gap-2 text-sm border border-primo-border text-primo-navy hover:bg-primo-surfaceAlt px-5 py-2.5 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
            {redirectTo === null ? "Listo" : "Cancelar"}
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
