import type { ReferenceAnalysis } from "@/types";

// ─────────────────────────────────────────────────────────────
// CLAUDE VISION MOCK
// Simula el análisis estructurado que Claude Vision haría sobre una
// referencia visual subida por el usuario. En modo real (DEMO_MODE=false)
// esto se reemplaza por una llamada a anthropic.messages.create con la
// imagen y un prompt que pide JSON estructurado.
// ─────────────────────────────────────────────────────────────

// Pool de análisis realistas para el ADN visual de Torque
// (baseball / sports editorial). Variados para que cada referencia
// se sienta única.
const ANALYSIS_POOL: ReferenceAnalysis[] = [
  {
    dominant_colors: ["#0A1628", "#2E7AF0", "#F5F5F5", "#1A1A1A"],
    composition:
      "Sujeto centrado rompiendo una capa tipográfica masiva detrás. Jerarquía clara figura-sobre-texto, balance asimétrico con peso hacia la izquierda.",
    lighting_style:
      "Iluminación dramática de alto contraste, key light lateral dura con sombras profundas. Golden hour simulada con tono cálido en los bordes.",
    mood: "Intenso, atlético, premium. Energía cruda tipo campaña Nike x MLB.",
    typography_style:
      "Sans-serif italic ultra-condensada, peso heavy, inclinación ~-8°. Una palabra clave acentuada en azul eléctrico.",
    recurring_elements: [
      "Texto cortado por el sujeto",
      "Logo pequeño en esquina superior",
      "Tono navy dominante",
      "Acento azul royal en una palabra",
    ],
    quality_score: 9,
  },
  {
    dominant_colors: ["#080F1E", "#FFFFFF", "#2E7AF0", "#3A4E5F"],
    composition:
      "Bloques de texto apilados (top/middle/bottom) con el atleta integrado al centro rompiendo los límites. Rejilla editorial estricta.",
    lighting_style:
      "Iluminación editorial limpia y direccional, sombras controladas. Estilo estudio con un toque cinematográfico.",
    mood: "Editorial, sofisticado, ESPN The Magazine. Disciplina y aspiración.",
    typography_style:
      "Mezcla de pesos: titular display gigante + barra horizontal navy con texto medio. Reglas finas blancas separando secciones.",
    recurring_elements: [
      "Barra navy horizontal con texto",
      "Reglas finas blancas",
      "Wordmark inferior izquierda",
      "Composición de tercios",
    ],
    quality_score: 8,
  },
  {
    dominant_colors: ["#0A1628", "#E8A33D", "#FFFFFF", "#162840"],
    composition:
      "Plano cerrado de acción, sujeto en primer plano a ángulo bajo. Profundidad de campo corta que aísla al atleta del fondo.",
    lighting_style:
      "Luz cálida tipo golden hour entrando por ventanas, rim light marcando la silueta. Contraste medio-alto.",
    mood: "Dinámico, en movimiento, autenticidad de entrenamiento real.",
    typography_style:
      "Tipografía condensada en bloque, alineada a un borde. Menos protagonismo del texto, más foco en la acción.",
    recurring_elements: [
      "Ángulo bajo dramático",
      "Bokeh de fondo",
      "Rim light en el sujeto",
      "Encuadre vertical 4:5",
    ],
    quality_score: 7,
  },
  {
    dominant_colors: ["#101820", "#2E7AF0", "#C9D6DF", "#FFFFFF"],
    composition:
      "Retrato documental íntimo, sujeto descentrado siguiendo la regla de tercios. Espacio negativo a un lado para el texto.",
    lighting_style:
      "Iluminación documental suave, una sola fuente cálida lateral. Sombras naturales, sensación honesta.",
    mood: "Íntimo, auténtico, narrativo. Testimonio humano y cercano.",
    typography_style:
      "Titular condensado sobrio sobre el espacio negativo, una palabra acentuada. Jerarquía contenida.",
    recurring_elements: [
      "Espacio negativo para texto",
      "Sujeto a un tercio",
      "Tono navy frío",
      "Acento azul en palabra clave",
    ],
    quality_score: 8,
  },
  {
    dominant_colors: ["#0F1E2D", "#2E7AF0", "#F4C842", "#FFFFFF"],
    composition:
      "Composición simétrica y heroica, sujeto frontal centrado con tipografía enmarcándolo arriba y abajo. Sensación de póster.",
    lighting_style:
      "Iluminación de alto impacto, dos puntos con relleno mínimo. Negros profundos, especular fuerte en el sujeto.",
    mood: "Heroico, aspiracional, máxima energía. Cartel de evento premium.",
    typography_style:
      "Display masivo simétrico, ultra-bold. Contraste tipográfico entre titular gigante y kicker pequeño.",
    recurring_elements: [
      "Simetría central",
      "Tipografía enmarcando al sujeto",
      "Negros profundos",
      "Sensación de póster/cartel",
    ],
    quality_score: 9,
  },
];

function hashString(seed: string): number {
  // Hash determinístico simple (mismo enfoque que los otros mocks)
  return seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export async function mockAnalyzeReference(
  imageUrl: string,
  styleSlug?: string
): Promise<ReferenceAnalysis> {
  // Simular latencia realista de Claude Vision (2.5-3.5s)
  const latency = 2500 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Picking determinístico basado en el contenido de la imagen + estilo
  // para que la misma referencia siempre devuelva el mismo análisis.
  const seed = imageUrl + (styleSlug ?? "");
  const index = hashString(seed) % ANALYSIS_POOL.length;
  return ANALYSIS_POOL[index];
}
