export type TravelMode = "foot" | "car";

export interface RouteSegment {
  from: { latitude: number; longitude: number };
  to: { latitude: number; longitude: number };
  durationMinutes: number;
  distanceKm: number;
  geometry: [number, number][]; // [lat, lng] pairs for polyline
}

export interface FullRoute {
  segments: RouteSegment[];
  totalDurationMinutes: number;
  totalDistanceKm: number;
  geometry: [number, number][]; // full polyline
}

/**
 * Decode Google-style encoded polyline to [lat, lng] pairs.
 * OSRM uses polyline encoding with precision 5.
 */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

/**
 * Fetch route between an ordered list of waypoints from OSRM.
 * Returns segments between consecutive points with real road geometry.
 */
export async function getRoute(
  waypoints: { latitude: number; longitude: number }[],
  mode: TravelMode = "foot",
): Promise<FullRoute | null> {
  if (waypoints.length < 2) return null;

  const profile = mode === "car" ? "car" : "foot";
  const coords = waypoints.map((w) => `${w.longitude},${w.latitude}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=polyline&steps=false&alternatives=false`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) return null;

    const route = data.routes[0];
    const fullGeometry = decodePolyline(route.geometry);

    const segments: RouteSegment[] = [];
    const legs = route.legs || [];
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      segments.push({
        from: waypoints[i],
        to: waypoints[i + 1],
        durationMinutes: Math.round(leg.duration / 60),
        distanceKm: Math.round(leg.distance / 100) / 10,
        geometry: [],
      });
    }

    return {
      segments,
      totalDurationMinutes: Math.round(route.duration / 60),
      totalDistanceKm: Math.round(route.distance / 100) / 10,
      geometry: fullGeometry,
    };
  } catch (err) {
    console.warn("OSRM route fetch failed:", err);
    return null;
  }
}

/**
 * Format minutes to human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 мин";
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

/**
 * Format km to human-readable string.
 */
export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}
