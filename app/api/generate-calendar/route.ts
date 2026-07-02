import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import { mockGenerateWeeklyCalendar } from "@/lib/mocks/calendar-generator";

const DEMO_MODE = process.env.DEMO_MODE !== "false";

// Costo (créditos) de refrescar el calendario. Más caro que una imagen
// porque implica web search + generación larga.
const CALENDAR_COST = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { workspaceSlug } = body;

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: "Missing workspaceSlug" },
        { status: 400 }
      );
    }

    const workspace = getWorkspace(workspaceSlug);
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    const styles = getWorkspaceStyles(workspace.id);

    if (DEMO_MODE) {
      // Mock: siempre permite (no descuenta créditos reales).
      const calendar = await mockGenerateWeeklyCalendar({ workspace, styles });
      return NextResponse.json({ calendar, cost: CALENDAR_COST });
    }

    // ─────────────────────────────────────────────────────────
    // REAL MODE: Claude API con web_search tool
    // ─────────────────────────────────────────────────────────
    // 1. Verificar créditos disponibles del workspace (>= CALENDAR_COST).
    // 2. Ensamblar el contexto estratégico completo (perfil de negocio +
    //    estilos + instrucciones) con buildCalendarContext:
    //      import { buildCalendarContext } from "@/lib/prompts/calendar-context";
    //      const system = buildCalendarContext(workspace, styles);
    // 3. anthropic.messages.create({
    //      model: "claude-...",
    //      system,
    //      tools: [{ type: "web_search_20250305", name: "web_search" }],
    //      messages: [{ role: "user", content:
    //        "Genera el calendario semanal de contenido. Primero busca
    //         trends/noticias/fechas relevantes con web search, luego
    //         devuelve JSON con theme, theme_description, ideas[],
    //         trends_used[]." }],
    //    })
    // 4. Claude busca en la web, razona y genera ideas custom.
    // 5. Parsear el JSON estructurado → WeeklyCalendar.
    // 6. Descontar CALENDAR_COST créditos del workspace.
    return NextResponse.json(
      { error: "Real mode not implemented yet. Set DEMO_MODE=true." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Generate calendar error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
