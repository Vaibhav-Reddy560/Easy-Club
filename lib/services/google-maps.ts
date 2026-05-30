/**
 * Google Maps Integration Service
 * Handles venue searching and location verification.
 */

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_FONTS_API_KEY; // Fallback to fonts key if it has Maps enabled

export async function searchVenue(query: string) {
  if (!GOOGLE_MAPS_KEY) {
    console.warn("[Google Maps] API Key missing.");
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_KEY}`
    );
    const data = await response.json();
    
    if (data.status !== "OK") {
      throw new Error(`Google Maps Error: ${data.status}`);
    }

    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      rating: place.rating,
      location: place.geometry.location,
    }));
  } catch (error) {
    console.error("[Google Maps] Search failed:", error);
    return [];
  }
}
