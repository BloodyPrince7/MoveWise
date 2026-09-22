import { NextResponse } from "next/server";
import { processFollowUpRefinement } from "@/lib/agent/recommender";
import { AgentResearchResponse } from "@/types/relocation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentResponse = body.currentResponse;
    const userMessage = body.userMessage || body.message;
    const geminiApiKey = body.geminiApiKey;

    if (!currentResponse || !userMessage) {
      return NextResponse.json(
        { error: "currentResponse and userMessage are required." },
        { status: 400 }
      );
    }

    const refinement = await processFollowUpRefinement(
      currentResponse as AgentResearchResponse,
      userMessage,
      geminiApiKey || process.env.GEMINI_API_KEY
    );

    return NextResponse.json({
      success: true,
      data: refinement,
    });
  } catch (error: any) {
    console.error("[API:AgentRefineError]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process follow-up refinement." },
      { status: 500 }
    );
  }
}
