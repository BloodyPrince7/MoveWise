import { NextResponse } from "next/server";
import { SerpApiClient } from "@/lib/serpapi/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = body.apiKey || process.env.SERPAPI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "No API key provided or configured." },
        { status: 400 }
      );
    }

    const client = new SerpApiClient(apiKey);
    const result = await client.search({
      engine: "google",
      q: "Bangalore Whitefield tech parks",
      num: 1,
    });

    return NextResponse.json({
      success: true,
      cached: result.cached,
      message: "SerpApi connection verified successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to verify SerpApi connection.",
      },
      { status: 400 }
    );
  }
}
