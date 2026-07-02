import type { Workspace, WorkspaceStyle } from "@/types";

// ─────────────────────────────────────────────────────────────
// CALENDAR CONTEXT BUILDER
// Ensambla el system prompt que se le manda a Claude para generar el
// calendario semanal de contenido. Combina el perfil de negocio, el
// workspace, los estilos disponibles e instrucciones fijas de estructura.
// Si no hay perfil de negocio, degrada con elegancia usando industry +
// system_prompt.
// ─────────────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  leads: "generar leads",
  ventas: "ventas directas",
  awareness: "awareness de marca",
  comunidad: "construir comunidad",
  otro: "otro objetivo",
};

function line(label: string, value?: string): string | null {
  const v = (value ?? "").trim();
  return v ? `- ${label}: ${v}` : null;
}

export function buildCalendarContext(
  workspace: Workspace,
  styles: WorkspaceStyle[]
): string {
  const profile = workspace.business_profile;
  const industry = workspace.industry || "su industria";

  // ── Bloque de negocio ──
  const businessLines: string[] = [];
  businessLines.push(`- Marca: ${workspace.name}`);
  businessLines.push(`- Industria: ${industry}`);

  if (profile) {
    const goalLabel = GOAL_LABELS[profile.main_goal] ?? profile.main_goal;
    [
      line("Tipo de negocio", profile.business_type),
      line("Audiencia objetivo", profile.target_audience),
      line("Ubicación", profile.location),
      goalLabel ? `- Objetivo principal: ${goalLabel}` : null,
      line("Detalle del objetivo", profile.main_goal_detail),
      line("Competencia", profile.competitors),
      line("Oferta / promoción actual", profile.current_offer),
      line("Tono de contenido", profile.content_tone),
      line("Temas a evitar", profile.avoid_topics),
      line("Diferenciadores clave", profile.key_differentiators),
      line("Notas adicionales", profile.extra_notes),
    ]
      .filter((l): l is string => !!l)
      .forEach((l) => businessLines.push(l));
  } else if (workspace.system_prompt) {
    // Fallback: sin perfil, damos al menos el contexto visual/identidad.
    businessLines.push(
      `- Contexto de marca (system prompt): ${workspace.system_prompt.trim()}`
    );
  }

  // ── Estilos disponibles ──
  const styleLines =
    styles.length > 0
      ? styles
          .map(
            (s) =>
              `- ${s.name} (slug: ${s.slug})${
                s.description ? ` — ${s.description}` : ""
              }`
          )
          .join("\n")
      : "- (Sin estilos signature definidos aún)";

  // ── Ubicación para web search ──
  const searchLocation =
    profile?.location?.trim() || industry;
  const searchBusiness = profile?.business_type?.trim() || industry;

  return `Eres el estratega de contenido de la marca "${workspace.name}". Tu trabajo es diseñar un CALENDARIO SEMANAL de contenido (7 días) coherente con el negocio y su objetivo.

CONTEXTO DE NEGOCIO
${businessLines.join("\n")}

ESTILOS SIGNATURE DISPONIBLES (para sugerir cuál usar por idea)
${styleLines}

QUÉ BUSCAR CON WEB SEARCH
Busca tendencias actuales de ${searchBusiness} en ${searchLocation}, noticias relevantes de la industria, fechas/eventos próximos que apliquen, y formatos de contenido que estén funcionando ahora en redes sociales para este tipo de negocio. Usa esos hallazgos para que las ideas sean oportunas y específicas, no genéricas.

ESTRUCTURA A GENERAR
- 7 días (lunes a domingo), con 1-3 ideas por día (el domingo puede ser descanso/repost).
- Cada día asigna un pilar de contenido variado: educación/valor, demostración/producto, detrás de cámara/proceso, cultura/trend, CTA/resultado/oferta, descanso/repost.
- Cada idea debe incluir: formato (reel | carrusel | post | story | repost), título corto, hook, specs del formato, guion (3-4 pasos), caption, hashtags, CTA, y sugerir un estilo signature (slug) apropiado + un título de imagen para el generador.
- Respeta el tono definido y evita explícitamente los temas a evitar.
- Devuelve JSON estructurado con: theme, theme_description, ideas[], trends_used[].`;
}
