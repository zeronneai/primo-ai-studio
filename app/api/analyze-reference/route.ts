import { NextRequest, NextResponse } from "next/server";
import { getWorkspace } from "@/lib/data/workspaces";
import { mockAnalyzeReference } from "@/lib/mocks/vision-analyzer";

const DEMO_MODE = process.env.DEMO_MODE !== "false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageDataUrl, workspaceSlug, styleSlug } = body;

    if (!imageDataUrl || !workspaceSlug) {
      return NextResponse.json(
        { error: "Missing imageDataUrl or workspaceSlug" },
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

    if (DEMO_MODE) {
      const analysis = await mockAnalyzeReference(imageDataUrl, styleSlug);
      return NextResponse.json({ analysis });
    }

    // ─────────────────────────────────────────────────────────
    // REAL MODE (cuando paguen Anthropic)
    // ─────────────────────────────────────────────────────────
    // TODO: Claude Vision real
    // import Anthropic from "@anthropic-ai/sdk";
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // const msg = await anthropic.messages.create({
    //   model: "claude-...",
    //   messages: [{ role: "user", content: [
    //     { type: "image", source: { type: "base64", ... } },
    //     { type: "text", text: "Analiza el ADN visual y devuelve JSON con
    //       dominant_colors, composition, lighting_style, mood,
    //       typography_style, recurring_elements, quality_score (1-10)." },
    //   ]}],
    // });
    // ... parsear JSON estructurado de la respuesta
    return NextResponse.json(
      { error: "Real mode not implemented yet. Set DEMO_MODE=true." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Analyze reference error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
