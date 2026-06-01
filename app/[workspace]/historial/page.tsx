"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { getWorkspace } from "@/lib/data/workspaces";
import { getGenerations } from "@/lib/data/generations-store";
import {
  getContentType,
  contentTypeToAspectClass,
} from "@/lib/data/content-types";
import { formatDate } from "@/lib/utils";
import { readableTextOn } from "@/lib/utils/palette";
import type { Generation, Workspace } from "@/types";

export default function HistorialPage() {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ws = getWorkspace(slug);
    if (!ws) {
      notFound();
      return;
    }
    setWorkspace(ws);
    setGenerations(getGenerations(ws.id));
    setLoading(false);
  }, [slug]);

  if (loading || !workspace) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="shimmer h-12 w-64 rounded-md mb-4" />
        <div className="shimmer h-4 w-96 rounded-md" />
      </div>
    );
  }

  const accent = workspace.brand_colors.accent;
  const onAccent = readableTextOn(accent);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-sm text-ws-text-muted mb-2">
            {workspace.name} · Historial
          </div>
          <h1 className="font-display text-4xl tracking-tight">
            GENERACIONES
          </h1>
          <p className="text-ws-text-muted text-sm mt-2">
            {generations.length}{" "}
            {generations.length === 1 ? "pieza generada" : "piezas generadas"}
          </p>
        </div>
        <Link
          href={`/${workspace.slug}/crear`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent, color: onAccent }}
        >
          <Plus className="h-4 w-4" />
          Nuevo contenido
        </Link>
      </div>

      {generations.length === 0 ? (
        <div className="bg-ws-surface border border-ws-border rounded-lg p-12 text-center">
          <p className="text-ws-text-muted mb-4">
            Aún no has generado ninguna pieza
          </p>
          <Link
            href={`/${workspace.slug}/crear`}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: workspace.brand_colors.accent }}
          >
            <Plus className="h-4 w-4" />
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => {
            const type = getContentType(gen.content_type_slug);
            const imgAspect = contentTypeToAspectClass(type.aspect_ratio);
            return (
              <div
                key={gen.id}
                className="bg-ws-surface border border-ws-border rounded-lg p-6 fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-2xl tracking-tight">
                        {gen.title}
                      </h3>
                      <span
                        className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: accent + "20",
                          color: accent,
                        }}
                      >
                        {type.label} · {type.aspect_ratio}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ws-text-muted">
                      <Calendar className="h-3 w-3" />
                      {formatDate(gen.created_at)}
                    </div>
                  </div>
                </div>

                {gen.scene_description && (
                  <p className="text-sm text-ws-text-muted mb-4 italic">
                    &ldquo;{gen.scene_description}&rdquo;
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(gen.generated_images || {}).map(
                    ([styleSlug, imageUrl]) => (
                      <div key={styleSlug} className="space-y-2">
                        <div className="text-xs font-mono text-ws-text-muted">
                          {styleSlug}
                        </div>
                        <div
                          className={`${imgAspect} bg-ws-bg rounded-md overflow-hidden border border-ws-border`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={gen.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
