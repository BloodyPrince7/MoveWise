import { SerpApiClient } from "./client";
import { PlaceItem, SourceCitation } from "@/types/relocation";

export interface LocalPlacesResult {
  query: string;
  items: PlaceItem[];
  totalFound: number;
  source: SourceCitation;
}

export async function searchLocalPlaces(
  client: SerpApiClient,
  categoryQuery: string,
  locality: string,
  city: string,
  maxResults = 5
): Promise<LocalPlacesResult> {
  const query = `${categoryQuery} in ${locality} ${city}`;

  try {
    const { data } = await client.search({
      engine: "google_maps",
      q: query,
      type: "search",
      gl: "in",
      hl: "en",
    });

    const items: PlaceItem[] = [];
    const localResults = data.local_results || data.places || [];

    if (Array.isArray(localResults)) {
      for (const place of localResults.slice(0, maxResults)) {
        // Compute or extract distance if available or approximate
        items.push({
          id: place.place_id || place.data_id || `place-${Math.random().toString(36).substring(2, 9)}`,
          title: place.title || place.name || "Local Spot",
          rating: place.rating,
          reviewsCount: place.reviews,
          address: place.address,
          distanceKm: place.distance ? parseFloat(place.distance) : undefined,
          category: place.type || place.category,
          thumbnail: place.thumbnail,
          link: place.link,
          snippet: place.description || place.snippet,
          priceLevel: place.price,
          verifiedSource: "SerpApi Google Maps Engine",
        });
      }
    }

    const source: SourceCitation = {
      title: `Google Maps - ${categoryQuery} in ${locality}`,
      url: `https://www.google.com/maps/search/${encodeURIComponent(query)}`,
      query,
      engine: "google_maps",
      accessedAt: new Date().toISOString(),
    };

    return {
      query,
      items,
      totalFound: items.length,
      source,
    };
  } catch (err: any) {
    console.warn(`[SerpApi:LocalWarning] Failed place search for ${query}: ${err.message}`);
    return {
      query,
      items: [],
      totalFound: 0,
      source: {
        title: `Google Maps - ${categoryQuery} in ${locality}`,
        query,
        engine: "google_maps",
        accessedAt: new Date().toISOString(),
      },
    };
  }
}
