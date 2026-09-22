import { SerpApiClient } from "./client";
import { HotelItem } from "@/types/relocation";

export async function searchTemporaryHotels(
  client: SerpApiClient,
  location: string,
  city: string
): Promise<HotelItem[]> {
  const query = `hotels in ${location} ${city}`;
  const now = new Date();
  const checkIn = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const checkOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  try {
    const { data } = await client.search({
      engine: "google_hotels",
      q: query,
      check_in_date: checkIn,
      check_out_date: checkOut,
      gl: "in",
      hl: "en",
      currency: "INR",
    });

    const hotels: HotelItem[] = [];
    const properties = data.properties || [];

    for (const prop of properties.slice(0, 4)) {
      const priceNum = prop.rate_per_night?.extracted_lowest || prop.rate_per_night?.lowest;
      hotels.push({
        id: prop.hotel_id || `hotel-${Math.random().toString(36).substring(2, 9)}`,
        title: prop.name || "City Hotel",
        pricePerNightInr: typeof priceNum === "number" ? priceNum : undefined,
        priceFormatted: prop.rate_per_night?.lowest ? `₹${prop.rate_per_night.lowest}/night` : "Check dates",
        rating: prop.overall_rating,
        reviewsCount: prop.reviews,
        distanceDescription: prop.distance_to_center || `Near ${location}`,
        neighborhood: location,
        thumbnail: prop.images?.[0]?.thumbnail,
        link: prop.link,
        amenities: prop.amenities?.slice(0, 5) || ["WiFi", "Air Conditioning"],
        sourceEngine: "google_hotels",
      });
    }

    return hotels;
  } catch (err: any) {
    console.warn(`[SerpApi:HotelsWarning] Failed hotel search for ${query}: ${err.message}`);
    return [];
  }
}
