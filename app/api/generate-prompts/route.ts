import { NextRequest, NextResponse } from "next/server";
import { getWorkspace, getWorkspaceStyles } from "@/lib/data/workspaces";
import { getContentType } from "@/lib/data/content-types";
import { mockGeneratePrompts } from "@/lib/mocks/claude";

const DEMO_MODE = process.env.DEMO_MODE !== "false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      workspaceSlug,
      title,
      context,
      styleSlugs,
      hasImage,
      references,
      contentTypeSlug,
    } = body;

    if (!workspaceSlug || !title || !styleSlugs?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const allStyles = getWorkspaceStyles(workspace.id);
    const selectedStyles = allStyles.filter((s) =>
      styleSlugs.includes(s.slug)
    );

    if (selectedStyles.length === 0) {
      return NextResponse.json(
        { error: "No valid styles selected" },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      // Mock mode: simulate Claude
      const result = await mockGeneratePrompts({
        title,
        context: context || "",
        styles: selectedStyles,
        imageProvided: !!hasImage,
        references: Array.isArray(references) ? references : [],
        contentType: getContentType(contentTypeSlug),
      });
      return NextResponse.json(result);
    }

    // ─────────────────────────────────────────────────────────
    // REAL MODE (cuando paguen Anthropic)
    // ─────────────────────────────────────────────────────────
    // TODO: Implementar llamada real a Claude
    // import Anthropic from "@anthropic-ai/sdk";
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // ... usar buildWorkspaceSystemPrompt + claude.messages.create
    return NextResponse.json(
      { error: "Real mode not implemented yet. Set DEMO_MODE=true." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Generate prompts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
