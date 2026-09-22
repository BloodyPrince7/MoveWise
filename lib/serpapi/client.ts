/**
 * SerpApi Client Module
 * Provides server-side query orchestration, in-memory caching, rate-limiting, and error handling.
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours cache

export interface SerpApiSearchParams {
  engine?: string;
  q?: string;
  query?: string;
  location?: string;
  google_domain?: string;
  gl?: string;
  hl?: string;
  ll?: string;
  type?: string;
  check_in_date?: string;
  check_out_date?: string;
  adults?: number;
  currency?: string;
  [key: string]: any;
}

export class SerpApiClient {
  private apiKey: string;
  private isDebug: boolean;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_KEY || "";
    this.isDebug = process.env.SERPAPI_DEBUG === "true" || process.env.NODE_ENV === "development";
  }

  public hasValidKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 10;
  }

  private generateCacheKey(params: SerpApiSearchParams): string {
    const keys = Object.keys(params).sort();
    const sortedObj = keys.reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {} as Record<string, any>);
    return JSON.stringify(sortedObj);
  }

  public async search(params: SerpApiSearchParams): Promise<{ data: any; cached: boolean }> {
    const cacheKey = this.generateCacheKey(params);
    const cached = memoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      if (this.isDebug) {
        console.log(`[SerpApi:CACHE_HIT] engine=${params.engine || "google"} query="${params.q || params.query || ""}"`);
      }
      return { data: cached.data, cached: true };
    }

    if (!this.hasValidKey()) {
      throw new Error(
        "SERPAPI_KEY is not configured or is invalid. Please configure your key in .env.local or enable Demo Mode."
      );
    }

    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("api_key", this.apiKey);

    // Default engine to google if not set
    if (!params.engine) {
      url.searchParams.set("engine", "google");
    }

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && key !== "api_key") {
        url.searchParams.set(key, String(value));
      }
    }

    if (this.isDebug) {
      console.log(`[SerpApi:FETCH] engine=${params.engine || "google"} query="${params.q || params.query || ""}"`);
    }

    const startTime = Date.now();
    let response: Response;

    try {
      response = await fetch(url.toString(), {
        headers: {
          "User-Agent": "MoveWise-AI-Relocation-Agent/1.0",
        },
        // Prevent hanging requests with a 15s timeout
        signal: AbortSignal.timeout(15000),
      });
    } catch (err: any) {
      console.error(`[SerpApi:NETWORK_ERROR] ${err.message}`);
      throw new Error(`Failed to reach SerpApi: ${err.message}`);
    }

    if (!response.ok) {
      let errorBody = "";
      try {
        const errorJson = await response.json();
        errorBody = errorJson.error || JSON.stringify(errorJson);
      } catch {
        errorBody = await response.text();
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`SerpApi Authentication Error: ${errorBody || "Invalid API Key"}`);
      }
      if (response.status === 429) {
        throw new Error("SerpApi Rate Limit / Quota Exceeded. Please try again later or switch to Demo Mode.");
      }
      throw new Error(`SerpApi error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    const elapsedMs = Date.now() - startTime;

    if (this.isDebug) {
      console.log(`[SerpApi:SUCCESS] took ${elapsedMs}ms`);
    }

    // Cache result
    memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return { data, cached: false };
  }
}
