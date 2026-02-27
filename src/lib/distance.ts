const MAX_DISTANCE_KM = 47;

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function geocode(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "User-Agent": "TaxiBookingApp" } }
    );
    const data = await res.json();
    if (!data?.length) return null;
    const [first] = data;
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch {
    return null;
  }
}

export async function getDrivingDistance(
  from: GeocodeResult,
  to: GeocodeResult
): Promise<{ distanceKm: number; durationMin: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const route = data.routes[0];
    const distanceKm = route.distance / 1000;
    const durationMin = Math.round(route.duration / 60);
    return { distanceKm, durationMin };
  } catch {
    return null;
  }
}

export async function calculateRouteDistance(
  pickupAddress: string,
  dropoffAddress: string
): Promise<{
  distanceKm: number | null;
  durationMin: number | null;
  withinLimit: boolean;
  error?: string;
}> {
  const pickup = await geocode(pickupAddress);
  const dropoff = await geocode(dropoffAddress);

  if (!pickup) {
    return { distanceKm: null, durationMin: null, withinLimit: false, error: "Could not find pickup location" };
  }
  if (!dropoff) {
    return { distanceKm: null, durationMin: null, withinLimit: false, error: "Could not find drop-off location" };
  }

  const result = await getDrivingDistance(pickup, dropoff);
  if (!result) {
    return { distanceKm: null, durationMin: null, withinLimit: false, error: "Could not calculate route" };
  }

  return {
    distanceKm: Math.round(result.distanceKm * 10) / 10,
    durationMin: result.durationMin,
    withinLimit: result.distanceKm <= MAX_DISTANCE_KM,
  };
}

export { MAX_DISTANCE_KM };
