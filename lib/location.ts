import * as Location from "expo-location";

export interface UserLocation {
  latitude: number;
  longitude: number;
}

/**
 * Request location permission and get the user's current position.
 * Returns null if permission denied or unavailable.
 */
export async function getUserLocation(): Promise<UserLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.warn("Location permission denied");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };
  } catch (err) {
    console.warn("Failed to get location:", err);
    return null;
  }
}

/**
 * Haversine distance in km between two points.
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display: "0.3 km" or "2.1 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

/**
 * Estimate walking time from distance.
 */
export function estimateWalkingTime(km: number): string {
  const minutes = Math.round(km / 0.08); // ~5 km/h walking speed → ~0.08 km/min
  if (minutes < 1) return "1 мин";
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  }
  return `${minutes} мин`;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
