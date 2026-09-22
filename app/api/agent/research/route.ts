import { NextResponse } from "next/server";
import { executeRelocationResearch } from "@/lib/agent/researcher";
import { UserConstraints } from "@/types/relocation";
import { DEFAULT_DEMO_CONSTRAINTS } from "@/lib/serpapi/demoData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const constraints: UserConstraints = body.constraints || DEFAULT_DEMO_CONSTRAINTS;
    const serpApiKey = body.serpApiKey || process.env.SERPAPI_KEY;
    const geminiApiKey = body.geminiApiKey || process.env.GEMINI_API_KEY;

    // Execute research with dynamic parameter generation
    const response = await executeRelocationResearch(constraints, undefined, serpApiKey, geminiApiKey);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("[API:AgentResearchError]", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute relocation research." },
      { status: 500 }
    );
  }
}
