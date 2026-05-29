import { NextRequest, NextResponse } from "next/server";
import { mockGenerateImage } from "@/lib/mocks/higgsfield";

const DEMO_MODE = process.env.DEMO_MODE !== "false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, styleSlug } = body;

    if (!prompt || !styleSlug) {
      return NextResponse.json(
        { error: "Missing prompt or styleSlug" },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      const imageUrl = await mockGenerateImage(prompt, styleSlug);
      return NextResponse.json({ imageUrl });
    }

    // ─────────────────────────────────────────────────────────
    // REAL MODE (cuando paguen Higgsfield)
    // ─────────────────────────────────────────────────────────
    // TODO: llamada real a Higgsfield API
    return NextResponse.json(
      { error: "Real mode not implemented yet. Set DEMO_MODE=true." },
      { status: 501 }
    );
  } catch (error) {
    console.error("Generate image error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
