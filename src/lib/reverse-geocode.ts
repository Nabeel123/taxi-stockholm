/** Reverse geocode for “use my location” in booking; OSM Nominatim (same family as route geocode). */
export async function reverseGeocodeToAddress(lat: number, lon: number): Promise<string | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      format: "json",
      addressdetails: "1",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "BookArlandaTaxi/1.0 (https://bookarlandataxi.se)",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string; error?: string };
    if (data.error) return null;
    const line = data.display_name?.trim();
    return line || null;
  } catch {
    return null;
  }
}
