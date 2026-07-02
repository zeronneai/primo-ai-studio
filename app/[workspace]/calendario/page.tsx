"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import {
  RefreshCw,
  Loader2,
  CalendarDays,
  Wand2,
  Eye,
  X,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import {
  getWeeklyCalendar,
  saveWeeklyCalendar,
  getCurrentWeekStart,
} from "@/lib/data/calendar-store";
import { getPillar } from "@/lib/data/content-pillars";
import { readableTextOn } from "@/lib/utils/palette";
import type {
  Workspace,
  WorkspaceStyle,
  WeeklyCalendar,
  ContentIdea,
  ContentIdeaFormat,
} from "@/types";

const DAY_ORDER = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];

const FORMAT_LABELS: Record<ContentIdeaFormat, string> = {
  reel: "Reel",
  carrusel: "Carrusel",
  post: "Post",
  story: "Story",
  repost: "Repost",
};

const CALENDAR_COST = 10;

function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-MX", { day: "numeric", month: "long" });
  return `Semana del ${fmt(start)} al ${fmt(end)}`;
}

export default function CalendarioPage() {
  const params = useParams<{ workspace: string }>();
  const slug = params.workspace;
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [styles, setStyles] = useState<WorkspaceStyle[]>([]);
  const [calendar, setCalendar] = useState<WeeklyCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [detail, setDetail] = useState<ContentIdea | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = getCurrentWeekStart();

  useEffect(() => {
    const ws = getWorkspace(slug);
    if (!ws) {
      notFound();
      return;
    }
    setWorkspace(ws);
    setStyles(getWorkspaceStyles(ws.id));
    setCalendar(getWeeklyCalendar(ws.id, weekStart));
    setLoading(false);
  }, [slug, weekStart]);

  async function handleGenerate() {
    if (!workspace) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug: workspace.slug }),
      });
      if (!res.ok) throw new Error("Calendar generation failed");
      const data: { calendar: WeeklyCalendar } = await res.json();
      saveWeeklyCalendar(data.calendar);
      setCalendar(data.calendar);
    } catch (e) {
      console.error(e);
      setError("No se pudieron generar las ideas. Intenta de nuevo.");
    } finally {
      setGenerating(false);
    }
  }

  function goToGenerate(idea: ContentIdea) {
    if (!workspace) return;
    const p = new URLSearchParams();
    if (idea.suggested_image_title)
      p.set("title", idea.suggested_image_title);
    if (idea.suggested_style_slug)
      p.set("style", idea.suggested_style_slug);
    p.set("from", "calendar");
    router.push(`/${workspace.slug}/crear?${p.toString()}`);
  }

  const ideasByDay = useMemo(() => {
    const map: Record<string, ContentIdea[]> = {};
    (calendar?.ideas ?? []).forEach((idea) => {
      (map[idea.day] ??= []).push(idea);
    });
    return map;
  }, [calendar]);

  if (loading || !workspace) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="shimmer h-12 w-64 rounded-md mb-4" />
        <div className="shimmer h-4 w-96 rounded-md" />
      </div>
    );
  }

  const accent = workspace.brand_colors.accent;
  const onAccent = readableTextOn(accent);
  const hasCalendar = !!calendar;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="text-sm text-ws-text-muted mb-2">
            {workspace.name} · Calendario
          </div>
          <h1 className="font-display text-4xl tracking-tight">
            CALENDARIO DE CONTENIDO
          </h1>
          <p className="text-ws-text-muted text-sm mt-2">
            {formatWeekLabel(weekStart)}
          </p>
        </div>
        {hasCalendar && (
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
              style={{ backgroundColor: accent, color: onAccent }}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {generating
                ? "Generando…"
                : `Refrescar ideas (${CALENDAR_COST} créditos)`}
            </button>
            <span className="text-[11px] text-ws-text-muted max-w-[240px] text-right">
              Claude buscará tendencias actuales de tu industria y generará
              ideas frescas.
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400 mb-6">{error}</p>}

      {/* Estado vacío */}
      {!hasCalendar && (
        <div className="bg-ws-surface border border-ws-border rounded-2xl p-12 text-center">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: accent + "20", color: accent }}
          >
            <CalendarDays className="h-7 w-7" />
          </div>
          <h2 className="font-bold text-xl text-ws-text mb-2">
            Aún no has generado ideas para esta semana
          </h2>
          <p className="text-ws-text-muted max-w-md mx-auto mb-6">
            Claude buscará tendencias actuales de {workspace.industry} y armará
            un calendario semanal de contenido on-brand, listo para generar.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando tendencias y generando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generar mi primer calendario
              </>
            )}
          </button>
        </div>
      )}

      {/* Calendario */}
      {hasCalendar && calendar && (
        <>
          {/* Banner de la semana */}
          <div
            className="rounded-2xl p-5 mb-6 border bg-ws-accent/10"
            style={{ borderColor: accent + "55" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4" style={{ color: accent }} />
              <h2 className="font-bold text-ws-text">{calendar.theme}</h2>
            </div>
            <p className="text-sm text-ws-text-muted">
              {calendar.theme_description}
            </p>
            {!!calendar.trends_used?.length && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-ws-text-muted">
                  <TrendingUp className="h-3 w-3" />
                  Basado en:
                </span>
                {calendar.trends_used.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full bg-ws-surface border border-ws-border text-ws-text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Días */}
          <div className="space-y-4">
            {DAY_ORDER.filter((d) => ideasByDay[d]?.length).map((day) => (
              <div
                key={day}
                className="bg-ws-surface border border-ws-border rounded-xl p-5"
              >
                <h3 className="font-display text-xl tracking-tight capitalize mb-3">
                  {day}
                </h3>
                <div className="space-y-2">
                  {ideasByDay[day].map((idea) => {
                    const pillar = getPillar(idea.pillar);
                    return (
                      <div
                        key={idea.id}
                        className="flex items-center gap-3 bg-ws-bg border border-ws-border rounded-lg p-3 flex-wrap"
                      >
                        <span
                          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: accent, color: onAccent }}
                        >
                          {FORMAT_LABELS[idea.format]}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: accent + "20",
                            color: accent,
                          }}
                        >
                          {pillar.label}
                        </span>
                        <span className="text-sm text-ws-text flex-1 min-w-[180px]">
                          {idea.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setDetail(idea)}
                            className="inline-flex items-center gap-1.5 text-xs text-ws-text-muted hover:text-ws-text border border-ws-border rounded-md px-2.5 py-1.5 transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver detalle
                          </button>
                          <button
                            onClick={() => goToGenerate(idea)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 transition-opacity hover:opacity-90"
                            style={{ backgroundColor: accent, color: onAccent }}
                          >
                            <Wand2 className="h-3.5 w-3.5" />
                            Generar pieza
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de detalle */}
      {detail && (
        <IdeaDetailModal
          idea={detail}
          accent={accent}
          onAccent={onAccent}
          onClose={() => setDetail(null)}
          onGenerate={() => {
            const idea = detail;
            setDetail(null);
            goToGenerate(idea);
          }}
        />
      )}
    </div>
  );
}

function IdeaDetailModal({
  idea,
  accent,
  onAccent,
  onClose,
  onGenerate,
}: {
  idea: ContentIdea;
  accent: string;
  onAccent: string;
  onClose: () => void;
  onGenerate: () => void;
}) {
  const pillar = getPillar(idea.pillar);
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-ws-surface border border-ws-border rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-ws-border">
          <div className="flex items-center gap-2 flex-wrap pr-4">
            <span
              className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent, color: onAccent }}
            >
              {FORMAT_LABELS[idea.format]}
            </span>
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ backgroundColor: accent + "20", color: accent }}
            >
              {pillar.label}
            </span>
            <span className="text-xs text-ws-text-muted capitalize">
              {idea.day}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ws-text-muted hover:text-ws-text transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <h2 className="font-display text-2xl tracking-tight">{idea.title}</h2>

          <Field label="Hook">
            <p className="text-sm text-ws-text italic">
              &ldquo;{idea.hook}&rdquo;
            </p>
          </Field>

          <Field label="Specs">
            <p className="text-sm text-ws-text-muted">{idea.specs}</p>
          </Field>

          <Field label="Guion">
            <ol className="space-y-1.5">
              {idea.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-ws-text">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: accent, color: onAccent }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Field>

          <Field label="Caption">
            <p className="text-sm text-ws-text">{idea.caption}</p>
          </Field>

          <Field label="Hashtags">
            <div className="flex flex-wrap gap-1.5">
              {idea.hashtags.map((h) => (
                <span
                  key={h}
                  className="text-xs px-2 py-0.5 rounded-full bg-ws-bg border border-ws-border text-ws-text-muted"
                >
                  {h}
                </span>
              ))}
            </div>
          </Field>

          <Field label="CTA">
            <p className="text-sm text-ws-text">{idea.cta}</p>
          </Field>

          <button
            onClick={onGenerate}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent, color: onAccent }}
          >
            <Wand2 className="h-4 w-4" />
            Generar esta pieza
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-ws-text-muted block mb-1.5">
        {label}
      </span>
      {children}
    </div>
  );
}
