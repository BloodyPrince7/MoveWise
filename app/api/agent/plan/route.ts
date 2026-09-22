import { NextResponse } from "next/server";
import { extractConstraintsFromPrompt } from "@/lib/llm/client";
import { DEFAULT_DEMO_CONSTRAINTS } from "@/lib/serpapi/demoData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, apiKey } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "A prompt string is required for constraint extraction." },
        { status: 400 }
      );
    }

    const extracted = await extractConstraintsFromPrompt(prompt, apiKey);
    const merged = { ...DEFAULT_DEMO_CONSTRAINTS, ...extracted, additionalNotes: prompt };

    return NextResponse.json({
      success: true,
      constraints: merged,
      source: apiKey ? "gemini-3.5-flash-lite" : "semantic-extractor",
    });
  } catch (error: any) {
    console.error("[API:AgentPlanError]", error);
    return NextResponse.json({ error: error.message || "Failed to process plan" }, { status: 500 });
  }
}
