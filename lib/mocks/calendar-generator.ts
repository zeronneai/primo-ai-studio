import { DEFAULT_PILLARS } from "@/lib/data/content-pillars";
import type {
  Workspace,
  WorkspaceStyle,
  WeeklyCalendar,
  ContentIdea,
  ContentIdeaFormat,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// CALENDAR GENERATOR MOCK
// Simula lo que Claude (con web_search) haría: buscar trends de la
// industria del workspace y generar un calendario semanal de ideas.
// Cada llamada produce contenido DIFERENTE (usa Math.random + timestamp).
// ─────────────────────────────────────────────────────────────

const DAYS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const FORMATS: ContentIdeaFormat[] = ["reel", "carrusel", "post", "story"];

const THEMES = [
  {
    theme: "Semana de autoridad",
    description:
      "Posicionar a la marca como referente: educar, demostrar experiencia y generar confianza.",
  },
  {
    theme: "Semana de comunidad",
    description:
      "Acercar la marca a su audiencia: historias reales, cultura interna y participación.",
  },
  {
    theme: "Semana de conversión",
    description:
      "Empujar hacia la acción: resultados, ofertas y llamados claros sin perder la marca.",
  },
  {
    theme: "Semana de lanzamiento",
    description:
      "Construir expectativa alrededor de una novedad: teaser, reveal y prueba social.",
  },
  {
    theme: "Semana de trends",
    description:
      "Montar la marca sobre lo que está pasando ahora: formatos virales y conversación actual.",
  },
];

// Plantillas de ideas por pilar, con placeholders {industry} / {brand}.
const IDEA_TEMPLATES: Record<
  string,
  Array<{
    title: string;
    hook: string;
    steps: string[];
    caption: string;
    cta: string;
  }>
> = {
  educacion: [
    {
      title: "3 errores que casi todos cometen en {industry}",
      hook: "El #2 te está costando clientes sin que lo notes.",
      steps: [
        "Hook directo a cámara con el error más común",
        "Explica por qué pasa (contexto rápido)",
        "Muestra la forma correcta con un ejemplo",
        "Cierre con el aprendizaje clave",
      ],
      caption:
        "Guárdalo para no volver a cometer estos errores en {industry}. ¿Cuál te sorprendió más?",
      cta: "Guarda este post",
    },
    {
      title: "Lo que nadie te explica sobre {industry}",
      hook: "Si supiera esto antes, me habría ahorrado meses.",
      steps: [
        "Plantea la creencia común (falsa)",
        "Rompe el mito con datos o experiencia",
        "Da el marco correcto en 2 pasos",
        "Invita a aplicarlo hoy",
      ],
      caption:
        "La verdad sobre {industry} que ojalá me hubieran dicho antes.",
      cta: "Comparte con alguien que lo necesite",
    },
  ],
  demostracion: [
    {
      title: "Así se ve {brand} en acción",
      hook: "Míralo funcionar en tiempo real.",
      steps: [
        "Antes: el problema del cliente",
        "El proceso paso a paso",
        "El resultado final en pantalla",
        "Testimonio corto o dato de impacto",
      ],
      caption:
        "Resultados reales de {brand}. Esto es lo que hacemos todos los días.",
      cta: "Escríbenos por DM",
    },
    {
      title: "De cero a resultado con {brand}",
      hook: "En menos de lo que crees.",
      steps: [
        "Punto de partida",
        "La transformación en 3 momentos",
        "Reveal del resultado",
        "Llamado a probarlo",
      ],
      caption: "El antes y después que habla por sí solo.",
      cta: "Agenda tu cita",
    },
  ],
  proceso: [
    {
      title: "Detrás de cámara: un día en {brand}",
      hook: "Lo que no ves cuando todo sale bien.",
      steps: [
        "Apertura mostrando el setup",
        "Los pasos internos del proceso",
        "Un imprevisto real y cómo se resuelve",
        "El resultado que llega al cliente",
      ],
      caption: "Detrás de cada pieza hay un proceso. Este es el nuestro.",
      cta: "Cuéntanos qué quieres ver",
    },
  ],
  cultura: [
    {
      title: "Montamos {brand} en el trend de la semana",
      hook: "Teníamos que hacerlo.",
      steps: [
        "Entra directo al formato viral",
        "Adáptalo al mundo de {industry}",
        "Remate con el toque de la marca",
      ],
      caption: "Cuando el trend y la marca encajan perfecto 🔥",
      cta: "Etiqueta a quien se lo mandarías",
    },
  ],
  cta: [
    {
      title: "La oferta que no vas a querer dejar pasar",
      hook: "Solo por esta semana.",
      steps: [
        "Presenta el beneficio principal",
        "Muestra la prueba (resultado o testimonio)",
        "Explica la oferta con claridad",
        "Llamado con urgencia real",
      ],
      caption: "Es tu momento. Escríbenos antes de que se acabe.",
      cta: "Reserva tu lugar",
    },
  ],
  descanso: [
    {
      title: "Repost: lo mejor de la comunidad",
      hook: "Ustedes lo hacen mejor.",
      steps: [
        "Selecciona el mejor contenido de un cliente",
        "Agrega contexto y agradecimiento",
        "Invita a más gente a participar",
      ],
      caption: "Gracias por tanto. Sigan etiquetándonos 🙌",
      cta: "Etiquétanos en tu próxima historia",
    },
  ],
};

const SPECS_BY_FORMAT: Record<ContentIdeaFormat, string> = {
  reel: "Reel vertical 9:16 · 15-30s · texto grande en pantalla · audio con gancho",
  carrusel: "Carrusel 4:5 · 5-7 slides · primera slide = hook · última = CTA",
  post: "Post 1:1 · imagen fuerte + copy que retiene · CTA claro",
  story: "Story 9:16 · sticker interactivo (encuesta/pregunta) · link o mención",
  repost: "Repost · story o post · crédito visible al autor original",
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** ISO date (YYYY-MM-DD) del lunes de la semana actual (server-safe). */
function currentWeekStart(): string {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function fill(text: string, workspace: Workspace): string {
  const industry = workspace.industry || "tu industria";
  return text
    .replace(/\{industry\}/g, industry)
    .replace(/\{brand\}/g, workspace.name);
}

function buildTrends(workspace: Workspace): string[] {
  const industry = workspace.industry || "tu industria";
  const pool = [
    `Trend: audio en tendencia para ${industry} en TikTok`,
    `Fecha próxima: fin de mes (cierre de objetivos)`,
    `Noticia: nueva feature de Instagram para creadores`,
    `Conversación: hashtag de ${industry} creciendo esta semana`,
    `Formato viral: "un día en la vida" adaptado a ${industry}`,
    `Estacionalidad: pico de búsquedas de ${industry}`,
  ];
  // 2-3 trends variados por generación.
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
}

export async function mockGenerateWeeklyCalendar(input: {
  workspace: Workspace;
  styles: WorkspaceStyle[];
}): Promise<WeeklyCalendar> {
  const { workspace, styles } = input;

  // Latencia realista: web search + generación (3-5s).
  const latency = 3000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const themePick = rand(THEMES);
  const styleSlugs = styles.map((s) => s.slug);

  const ideas: ContentIdea[] = [];
  let counter = 0;

  DAYS.forEach((day) => {
    // 1-3 ideas por día (domingo tiende a descanso).
    const isRestDay = day === "domingo";
    const count = isRestDay ? 1 : 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      const pillar = isRestDay
        ? DEFAULT_PILLARS.find((p) => p.slug === "descanso")!
        : rand(DEFAULT_PILLARS.filter((p) => p.slug !== "descanso"));

      const templates = IDEA_TEMPLATES[pillar.slug] ?? IDEA_TEMPLATES.educacion;
      const tpl = rand(templates);
      const format = isRestDay ? "repost" : rand(FORMATS);

      const title = fill(tpl.title, workspace);
      counter += 1;

      ideas.push({
        id: `idea_${Date.now()}_${counter}_${Math.floor(
          Math.random() * 10000
        )}`,
        day,
        pillar: pillar.slug,
        format,
        title,
        hook: fill(tpl.hook, workspace),
        specs: SPECS_BY_FORMAT[format],
        steps: tpl.steps.map((s) => fill(s, workspace)),
        caption: fill(tpl.caption, workspace),
        hashtags: buildHashtags(workspace),
        cta: tpl.cta,
        suggested_style_slug:
          styleSlugs.length > 0 ? rand(styleSlugs) : undefined,
        suggested_image_title: title.toUpperCase().slice(0, 60),
      });
    }
  });

  return {
    workspace_id: workspace.id,
    week_start: currentWeekStart(),
    theme: themePick.theme,
    theme_description: themePick.description,
    ideas,
    trends_used: buildTrends(workspace),
    generated_at: new Date().toISOString(),
  };
}

function buildHashtags(workspace: Workspace): string[] {
  const base = (workspace.industry || "marca")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  const brand = workspace.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const generic = ["contenido", "tips", "reels", "marca", "estrategia"];
  const picked = [...generic].sort(() => Math.random() - 0.5).slice(0, 3);
  return [`#${brand}`, `#${base}`, ...picked.map((g) => `#${g}`)];
}
