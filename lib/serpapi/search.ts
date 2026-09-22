import { SerpApiClient } from "./client";
import { SourceCitation } from "@/types/relocation";

export interface LocalitySearchResult {
  query: string;
  snippets: string[];
  sources: SourceCitation[];
}

export async function searchLocalityRentAndGuides(
  client: SerpApiClient,
  locality: string,
  city: string
): Promise<LocalitySearchResult> {
  const query = `average rent 1BHK 2BHK in ${locality} ${city} locality guide`;

  try {
    const { data } = await client.search({
      engine: "google",
      q: query,
      gl: "in",
      hl: "en",
    });

    const snippets: string[] = [];
    const sources: SourceCitation[] = [];

    if (data.organic_results && Array.isArray(data.organic_results)) {
      for (const res of data.organic_results.slice(0, 4)) {
        if (res.snippet) snippets.push(res.snippet);
        sources.push({
          title: res.title || `Information on ${locality}`,
          url: res.link,
          query,
          engine: "google",
          accessedAt: new Date().toISOString(),
        });
      }
    }

    if (data.answer_box?.snippet) {
      snippets.unshift(data.answer_box.snippet);
    }

    return {
      query,
      snippets,
      sources,
    };
  } catch (err: any) {
    console.warn(`[SerpApi:SearchWarning] Failed search for ${locality}: ${err.message}`);
    return {
      query,
      snippets: [],
      sources: [],
    };
  }
}
