// ─────────────────────────────────────────────────────────────
// HIGGSFIELD MOCK
// Simula generación de imagen retornando URLs de Unsplash temáticas
// Cuando DEMO_MODE=false, esto llama a Higgsfield real
// ─────────────────────────────────────────────────────────────

// IDs base de Unsplash por estilo (sin params de tamaño).
const MOCK_POOL_ESTILO_2 = [
  "photo-1566577739112-5180d4bf9390",
  "photo-1592664474498-bd3b1f8f8c98",
  "photo-1508344928928-7165b67de128",
  "photo-1531415074968-036ba1b575da",
];

const MOCK_POOL_ESTILO_3 = [
  "photo-1521791136064-7986c2920216",
  "photo-1547347298-4074fc3086f0",
  "photo-1517649763962-0c623066013b",
  "photo-1542144612-1b3641ec3459",
];

// Dimensiones de Unsplash por aspect ratio.
const RATIO_DIMENSIONS: Record<string, { w: number; h: number }> = {
  "4:5": { w: 800, h: 1000 },
  "9:16": { w: 720, h: 1280 },
  "1:1": { w: 1080, h: 1080 },
  "16:9": { w: 1280, h: 720 },
  "3:4": { w: 900, h: 1200 },
};

function pickFromPool(pool: string[], seed: string): string {
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

export async function mockGenerateImage(
  prompt: string,
  styleSlug: string,
  aspectRatio: string = "4:5"
): Promise<string> {
  // Simular latencia de generación de imagen (3-5 segundos, más realista)
  const latency = 3000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const pool =
    styleSlug === "estilo_2" ? MOCK_POOL_ESTILO_2 : MOCK_POOL_ESTILO_3;
  const photoId = pickFromPool(pool, prompt);
  const { w, h } = RATIO_DIMENSIONS[aspectRatio] ?? RATIO_DIMENSIONS["4:5"];

  return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop`;
}
