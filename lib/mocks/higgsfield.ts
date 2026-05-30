// ─────────────────────────────────────────────────────────────
// HIGGSFIELD MOCK
// Simula generación de imagen retornando URLs de Unsplash temáticas
// Cuando DEMO_MODE=false, esto llama a Higgsfield real
// ─────────────────────────────────────────────────────────────

const MOCK_IMAGE_POOL_ESTILO_2 = [
  "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1592664474498-bd3b1f8f8c98?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=1000&fit=crop",
];

const MOCK_IMAGE_POOL_ESTILO_3 = [
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1542144612-1b3641ec3459?w=800&h=1000&fit=crop",
];

function pickFromPool(pool: string[], seed: string): string {
  const hash = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

export async function mockGenerateImage(
  prompt: string,
  styleSlug: string
): Promise<string> {
  // Simular latencia de generación de imagen (3-5 segundos, más realista)
  const latency = 3000 + Math.random() * 2000;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const pool =
    styleSlug === "estilo_2"
      ? MOCK_IMAGE_POOL_ESTILO_2
      : MOCK_IMAGE_POOL_ESTILO_3;

  return pickFromPool(pool, prompt);
}
