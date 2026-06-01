import { NextRequest, NextResponse } from "next/server";
import { mockGenerateImage } from "@/lib/mocks/higgsfield";
import { getContentType } from "@/lib/data/content-types";

const DEMO_MODE = process.env.DEMO_MODE !== "false";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, styleSlug, contentTypeSlug } = body;

    if (!prompt || !styleSlug) {
      return NextResponse.json(
        { error: "Missing prompt or styleSlug" },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      const aspectRatio = getContentType(contentTypeSlug).aspect_ratio;
      const imageUrl = await mockGenerateImage(prompt, styleSlug, aspectRatio);
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
