"use client";

import {
  Workflow,
  Brain,
  Layers,
  ImageIcon,
  Ratio,
  FlaskConical,
} from "lucide-react";
import { CONTENT_TYPES } from "@/lib/data/content-types";

export default function AyudaPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="font-bold text-3xl text-primo-navy tracking-tight mb-2">
        Cómo funciona Primo AI Studio
      </h1>
      <p className="text-primo-muted mb-10">
        Guía rápida del flujo completo y de cada pieza del producto.
      </p>

      {/* a) El flujo completo */}
      <Section icon={<Workflow className="h-5 w-5" />} title="El flujo completo">
        <ol className="space-y-3">
          {[
            "Creas un workspace (nombre + email del cliente).",
            "Lo configuras: system prompt, estilos signature, referencias visuales.",
            "Invitas al cliente (su email ya quedó como owner del workspace).",
            "El cliente entra y genera contenido on-brand al instante.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="h-6 w-6 shrink-0 rounded-full bg-primo-accent text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-primo-navy">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      {/* b) System prompt */}
      <Section
        icon={<Brain className="h-5 w-5" />}
        title="Qué es el System Prompt"
      >
        <p>
          Es el &ldquo;cerebro de marca&rdquo;. Aquí defines identidad,
          audiencia, paleta, tipografía y reglas. Claude lee esto en cada
          generación para mantener coherencia. Entre más detallado, mejores
          resultados.
        </p>
      </Section>

      {/* c) Estilos signature */}
      <Section
        icon={<Layers className="h-5 w-5" />}
        title="Qué son los Estilos Signature"
      >
        <p>
          Plantillas visuales recurrentes de la marca (ej. &ldquo;flyer de
          evento&rdquo;, &ldquo;post editorial&rdquo;). Cada uno tiene un
          template que guía la composición. El cliente elige cuál usar al
          generar.
        </p>
      </Section>

      {/* d) Referencias visuales */}
      <Section
        icon={<ImageIcon className="h-5 w-5" />}
        title="Qué son las Referencias Visuales"
      >
        <p>
          Trabajos ya hechos que subes como ejemplos. La IA los analiza
          (colores, mood, composición) y los usa como ADN visual. Entre más
          referencias de calidad, más consistente el output.
        </p>
      </Section>

      {/* e) Tipos de contenido */}
      <Section
        icon={<Ratio className="h-5 w-5" />}
        title="Tipos de contenido"
      >
        <p className="mb-3">
          Al generar, el cliente elige el formato de salida. El aspect ratio se
          inyecta en el prompt y en la imagen:
        </p>
        <ul className="space-y-2">
          {CONTENT_TYPES.map((t) => (
            <li key={t.slug} className="flex items-center gap-3">
              <span className="font-mono text-xs text-primo-accent w-12 shrink-0">
                {t.aspect_ratio}
              </span>
              <span className="text-primo-navy font-medium">{t.label}</span>
              <span className="text-primo-muted text-sm">
                · {t.dimensions}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* f) Demo vs producción */}
      <Section
        icon={<FlaskConical className="h-5 w-5" />}
        title="Modo demo vs producción"
      >
        <p>
          En modo demo, las generaciones son simuladas (placeholders). Con las
          APIs conectadas (Claude + Higgsfield), las generaciones son reales.
        </p>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 bg-primo-surface border border-primo-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-full bg-primo-accent/10 text-primo-accent flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-bold text-lg text-primo-navy">{title}</h2>
      </div>
      <div className="text-primo-navy leading-relaxed text-[15px] pl-12">
        {children}
      </div>
    </section>
  );
}
