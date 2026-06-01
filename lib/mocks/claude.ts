import type { WorkspaceStyle, ReferenceAsset, ContentType } from "@/types";

// ─────────────────────────────────────────────────────────────
// CLAUDE MOCK
// Simula respuestas realistas de Claude para la demo
// Cuando DEMO_MODE=false, esto se reemplaza por llamadas reales
// ─────────────────────────────────────────────────────────────

type MockGenerationInput = {
  title: string;
  context: string;
  styles: WorkspaceStyle[];
  imageProvided: boolean;
  references?: ReferenceAsset[];
  contentType?: ContentType;
};

type MockGenerationOutput = {
  scene_description_es: string;
  styles: Record<string, string>;
  references_used: number;
};

// Pool de descripciones de escena (variadas para que cada generación sea distinta)
const SCENE_POOL = [
  "Coach trabajando con joven atleta en facility indoor de baseball, iluminación dramática, postura de bateo, ambiente premium training",
  "Pitcher juvenil en mound bajo iluminación cálida, expresión concentrada, raw athletic energy",
  "Atleta en estación de entrenamiento con equipo profesional, golden hour through windows, profesional environment",
  "Grupo de jóvenes entrenando en línea, coach observando, intensidad disciplinada, premium facility",
  "Catcher en posición listo para recibir, primer plano dramático, low-angle composition",
  "Padre de atleta sentado en entrevista, lighting documental, expresión auténtica, ambiente íntimo",
];

function pickScene(seed: string): string {
  // Picking determinístico basado en el título (consistencia en la demo)
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SCENE_POOL[hash % SCENE_POOL.length];
}

function fillTemplate(
  template: string,
  scene: string,
  title: string,
  aspectLabel: string
): string {
  const filled = template
    .replace(/\[SCENE\]/g, scene)
    .replace(/\[TITLE\]/g, title.toUpperCase());

  // Si el template aún menciona el formato 4:5 hardcoded, lo reemplazamos
  // dinámicamente por el del content type elegido. Si no lo menciona, lo
  // añadimos al final del prompt.
  const verticalRe = /vertical 4:5 format\.?/i;
  if (verticalRe.test(filled)) {
    return filled.replace(verticalRe, `${capitalize(aspectLabel)}.`);
  }
  const trimmed = filled.replace(/\s*$/, "").replace(/\.?$/, "");
  return `${trimmed}. Format: ${aspectLabel}.`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Devuelve el valor más frecuente de una lista (para colores dominantes)
function mostCommon(values: string[]): string[] {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([v]) => v);
}

/**
 * Construye una frase de "ADN visual" a partir de los análisis de las
 * referencias del workspace. Simula que Claude consultó las referencias:
 * usa los colores dominantes más comunes + el mood/lighting de 1-2 refs.
 */
function buildReferenceContext(references: ReferenceAsset[]): string {
  const analyzed = references.filter((r) => r.analysis);
  if (analyzed.length === 0) return "";

  const allColors = analyzed.flatMap((r) => r.analysis!.dominant_colors);
  const topColors = mostCommon(allColors).slice(0, 3);

  // Tomar mood + lighting de 1-2 referencias (las primeras analizadas)
  const sample = analyzed.slice(0, 2);
  const moods = sample.map((r) => r.analysis!.mood.replace(/\.$/, ""));
  const lighting = sample[0].analysis!.lighting_style.replace(/\.$/, "");

  const parts: string[] = [];
  if (topColors.length) {
    parts.push(`paleta dominante observada ${topColors.join(", ")}`);
  }
  parts.push(`iluminación tipo ${lighting.toLowerCase()}`);
  if (moods.length) {
    parts.push(`mood ${moods.join(" / ").toLowerCase()}`);
  }

  return `Coherente con el ADN visual del workspace (${parts.join("; ")}).`;
}

export async function mockGeneratePrompts(
  input: MockGenerationInput
): Promise<MockGenerationOutput> {
  // Simular latencia realista de API (1.2-2.5s)
  const latency = 1200 + Math.random() * 1300;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const references = input.references ?? [];
  const referenceContext = buildReferenceContext(references);
  const referencesUsed = references.filter((r) => r.analysis).length;

  const baseScene = pickScene(input.title + input.context);
  // Inyectar el contexto de referencias en la descripción de escena
  const scene = referenceContext
    ? `${baseScene}. ${referenceContext}`
    : baseScene;

  const aspectLabel =
    input.contentType?.aspect_label_en ?? "vertical 4:5 portrait format";

  const styles: Record<string, string> = {};
  input.styles.forEach((style) => {
    styles[style.slug] = fillTemplate(
      style.template_prompt,
      scene,
      input.title,
      aspectLabel
    );
  });

  return {
    scene_description_es: scene,
    styles,
    references_used: referencesUsed,
  };
}
