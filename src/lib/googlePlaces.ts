// ---------------------------------------------------------------
// Live Google rating lookup for a profile's public page.
//
// Requires GOOGLE_PLACES_API_KEY (server-only — never expose this to
// the browser) and the profile owner's Google "Place ID" (found via
// Google's Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id).
//
// Uses Place Details (New): https://places.googleapis.com/v1/places/{placeId}
// Costs money per call (Google's "Atmosphere" tier, which includes
// rating/review count) — this is cached via Next.js's fetch cache for
// an hour so a busy profile doesn't re-bill on every single page view.
// ---------------------------------------------------------------

export type GoogleRating = {
  rating: number;
  reviewCount: number;
  mapsUri: string | null;
};

export async function getGoogleRating(placeId: string): Promise<GoogleRating | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri",
      },
      // Cached for an hour — ratings don't change minute to minute, and this
      // keeps the API bill down since it's shared across every visitor.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data.rating !== "number") return null;

    return {
      rating: data.rating,
      reviewCount: data.userRatingCount || 0,
      mapsUri: data.googleMapsUri || null,
    };
  } catch {
    // Best-effort — the profile still renders fine without a live rating.
    return null;
  }
}
