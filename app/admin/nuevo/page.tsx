"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, SlidersHorizontal, Rocket } from "lucide-react";
import { WorkspaceForm } from "@/components/admin/WorkspaceForm";
import { useToast } from "@/components/Toast";
import {
  getAllWorkspaces,
  saveWorkspace,
} from "@/lib/data/workspaces-store";
import { addMember } from "@/lib/data/members-store";
import { generatePaletteFromPrimary } from "@/lib/utils/palette";
import { slugify } from "@/lib/utils";
import type { Workspace } from "@/types";

type Mode = "quick" | "full";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_SYSTEM_PROMPT =
  "Define la identidad de tu marca, audiencia objetivo, tono, paleta y reglas para los outputs. El sistema usará esto para generar contenido coherente con tu marca.";

const inputCls =
  "w-full bg-primo-surface border border-primo-border rounded-md px-3 py-2.5 text-sm text-primo-text placeholder:text-primo-muted focus:outline-none focus:border-primo-accent transition-colors";

export default function NuevoWorkspacePage() {
  const [mode, setMode] = useState<Mode>("quick");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-sm text-primo-muted mb-2">
          <Link href="/admin" className="hover:text-primo-navy transition-colors">
            Workspaces
          </Link>{" "}
          / Nuevo
        </div>
        <h1 className="font-bold text-3xl text-primo-navy tracking-tight">
          Nuevo workspace
        </h1>
      </div>

      {/* Mode toggle */}
      <div className="inline-flex items-center gap-1 p-1 bg-primo-surfaceAlt border border-primo-border rounded-full mb-8">
        <ModeTab
          active={mode === "quick"}
          onClick={() => setMode("quick")}
          icon={<Zap className="h-4 w-4" />}
          label="Modo rápido"
        />
        <ModeTab
          active={mode === "full"}
          onClick={() => setMode("full")}
          icon={<SlidersHorizontal className="h-4 w-4" />}
          label="Modo completo"
        />
      </div>

      {mode === "quick" ? <QuickCreate /> : <WorkspaceForm mode="create" />}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
        active
          ? "bg-primo-accent text-white"
          : "text-primo-muted hover:text-primo-navy"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickCreate() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  function handleNameChange(v: string) {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  function handleCreate() {
    const cleanName = name.trim();
    const cleanSlug = slugify(slug);
    const cleanEmail = ownerEmail.trim().toLowerCase();

    if (!cleanName) {
      showToast("El nombre es obligatorio", "error");
      return;
    }
    if (!cleanSlug) {
      showToast("El slug es obligatorio", "error");
      return;
    }
    if (getAllWorkspaces().some((w) => w.slug === cleanSlug)) {
      showToast(`El slug "/${cleanSlug}" ya está en uso`, "error");
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      showToast("Email del owner inválido", "error");
      return;
    }

    setSaving(true);
    try {
      const workspace: Workspace = {
        id: `ws_${Date.now()}`,
        slug: cleanSlug,
        name: cleanName,
        logo_url: null,
        brand_colors: generatePaletteFromPrimary("#475569"),
        industry: industry.trim() || "General",
        monthly_credit_limit: 500,
        system_prompt: DEFAULT_SYSTEM_PROMPT,
        is_custom: true,
      };

      saveWorkspace(workspace);
      addMember(workspace.id, cleanEmail, "owner");

      showToast("Workspace creado. Ahora configúralo antes de invitar al cliente.");
      // White-glove: el admin lo arma de una vez antes de dar acceso.
      router.push(`/${cleanSlug}/configuracion`);
    } catch (e) {
      console.error(e);
      showToast("Error al crear. Intenta de nuevo.", "error");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="bg-primo-surface border border-primo-border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-primo-navy mb-1.5">
            Nombre del cliente/marca
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej. El Toro Law"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primo-navy mb-1.5">
            Slug
            <span className="text-primo-muted font-normal ml-2 text-xs">
              La URL será /{slug || "slug"}
            </span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="el-toro-law"
            className={`${inputCls} font-mono`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primo-navy mb-1.5">
            Email del owner
          </label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="cliente@empresa.com"
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primo-navy mb-1.5">
            Industry
            <span className="text-primo-muted font-normal ml-2 text-xs">
              Opcional
            </span>
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Ej. Legal, Restaurant"
            className={inputCls}
          />
        </div>

        <p className="text-xs text-primo-muted leading-relaxed">
          Después de crear el workspace, configúralo tú mismo (logo, colores,
          estilos, referencias) antes de dar acceso al cliente.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primo-accent text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Rocket className="h-4 w-4" />
            {saving ? "Creando…" : "Crear workspace y enviar acceso"}
          </button>
        </div>
      </div>
    </div>
  );
}
