"use client";

import type { WeeklyCalendar } from "@/types";

// ─────────────────────────────────────────────────────────────
// CALENDAR STORE (localStorage)
// key: "primo_calendars" → objeto { [workspaceId::weekStart]: WeeklyCalendar }
// Solo la semana actual importa; guardamos por (workspace, semana).
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "primo_calendars";

type CalendarMap = Record<string, WeeklyCalendar>;

function keyOf(workspaceId: string, weekStart: string): string {
  return `${workspaceId}::${weekStart}`;
}

function readAll(): CalendarMap {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CalendarMap) : {};
  } catch {
    return {};
  }
}

function writeAll(map: CalendarMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** ISO date (YYYY-MM-DD) del lunes de la semana actual. */
export function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo, 1 = lunes, ...
  const diffToMonday = (day + 6) % 7; // lunes → 0, domingo → 6
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

/** Calendario de la semana actual para un workspace (o null). */
export function getWeeklyCalendar(
  workspaceId: string,
  weekStart: string = getCurrentWeekStart()
): WeeklyCalendar | null {
  const map = readAll();
  return map[keyOf(workspaceId, weekStart)] ?? null;
}

export function saveWeeklyCalendar(calendar: WeeklyCalendar): void {
  if (typeof window === "undefined") return;
  const map = readAll();
  map[keyOf(calendar.workspace_id, calendar.week_start)] = calendar;
  writeAll(map);
}

/** Limpia semanas distintas a la actual (mantiene localStorage ligero). */
export function clearOldCalendars(): void {
  if (typeof window === "undefined") return;
  const current = getCurrentWeekStart();
  const map = readAll();
  const kept: CalendarMap = {};
  for (const [k, v] of Object.entries(map)) {
    if (v.week_start === current) kept[k] = v;
  }
  writeAll(kept);
}
