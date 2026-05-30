import type { WorkspaceStyle } from "@/types";

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
};

type MockGenerationOutput = {
  scene_description_es: string;
  styles: Record<string, string>;
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
  title: string
): string {
  return template
    .replace(/\[SCENE\]/g, scene)
    .replace(/\[TITLE\]/g, title.toUpperCase());
}

export async function mockGeneratePrompts(
  input: MockGenerationInput
): Promise<MockGenerationOutput> {
  // Simular latencia realista de API (1.2-2.5s)
  const latency = 1200 + Math.random() * 1300;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const scene = pickScene(input.title + input.context);

  const styles: Record<string, string> = {};
  input.styles.forEach((style) => {
    styles[style.slug] = fillTemplate(style.template_prompt, scene, input.title);
  });

  return {
    scene_description_es: scene,
    styles,
  };
}
