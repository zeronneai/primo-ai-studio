import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Hace unos minutos";
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convierte un texto a slug: minúsculas, sin acentos, espacios → guiones,
 * solo [a-z0-9-]. Útil para slugs de workspace y de estilos.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico → guion
    .replace(/^-+|-+$/g, "") // sin guiones al inicio/fin
    .replace(/-{2,}/g, "-"); // colapsar guiones repetidos
}

/**
 * Redimensiona una imagen (dataURL) en el navegador vía canvas para
 * reducir drásticamente el peso antes de guardarla en localStorage.
 * - Lado más largo limitado a `maxSize` px (mantiene aspect ratio)
 * - Re-encoda a JPEG con `quality`
 * Si algo falla, devuelve el dataURL original sin romper el flujo.
 */
export async function downscaleImage(
  dataUrl: string,
  maxSize: number = 1200,
  quality: number = 0.85
): Promise<string> {
  if (typeof document === "undefined") return dataUrl;

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;

        if (width >= height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
