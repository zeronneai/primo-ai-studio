import type { ContentType } from "@/types";

// ─────────────────────────────────────────────────────────────
// CONTENT TYPES
// Formatos de salida que el usuario puede generar. El aspect ratio
// se inyecta dinámicamente en el prompt y en el placeholder de la imagen.
// ─────────────────────────────────────────────────────────────

export const CONTENT_TYPES: ContentType[] = [
  {
    slug: "thumbnail",
    label: "Thumbnail vertical",
    description: "Formato vertical 4:5 para feed.",
    aspect_ratio: "4:5",
    dimensions: "1080x1350",
    aspect_label_en: "vertical 4:5 portrait format",
    icon_name: "Image",
  },
  {
    slug: "story",
    label: "Story / Reel",
    description: "Vertical 9:16 para stories y reels.",
    aspect_ratio: "9:16",
    dimensions: "1080x1920",
    aspect_label_en:
      "vertical 9:16 story format with focal point in top 60% safe zone",
    icon_name: "Smartphone",
  },
  {
    slug: "post_square",
    label: "Post cuadrado",
    description: "Cuadrado 1:1 clásico de feed.",
    aspect_ratio: "1:1",
    dimensions: "1080x1080",
    aspect_label_en: "square 1:1 format",
    icon_name: "Square",
  },
  {
    slug: "banner",
    label: "Banner horizontal",
    description: "Horizontal 16:9 para web y video.",
    aspect_ratio: "16:9",
    dimensions: "1920x1080",
    aspect_label_en: "horizontal 16:9 banner format",
    icon_name: "MonitorPlay",
  },
  {
    slug: "flyer",
    label: "Flyer vertical",
    description: "Vertical 3:4 tipo póster.",
    aspect_ratio: "3:4",
    dimensions: "1080x1440",
    aspect_label_en: "vertical 3:4 poster flyer format",
    icon_name: "FileText",
  },
];

export const DEFAULT_CONTENT_TYPE: ContentType = CONTENT_TYPES[0]; // thumbnail

export function getContentType(slug?: string | null): ContentType {
  return CONTENT_TYPES.find((t) => t.slug === slug) ?? DEFAULT_CONTENT_TYPE;
}

/** aspect_ratio → clase de Tailwind para los preview cards. */
export function contentTypeToAspectClass(ratio: string): string {
  switch (ratio) {
    case "9:16":
      return "aspect-[9/16]";
    case "1:1":
      return "aspect-square";
    case "16:9":
      return "aspect-video";
    case "3:4":
      return "aspect-[3/4]";
    case "4:5":
    default:
      return "aspect-[4/5]";
  }
}
