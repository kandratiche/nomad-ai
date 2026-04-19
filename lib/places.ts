import { fetchAllPlacesApi } from "@/api/placesApi";
import { fetchCitiesApi } from "@/api/citiesApi";

export interface DBPlace {
  id: string;
  title: string;
  type: string;
  rating: number | null;
  safety_score: number;
  image_url: string;
  description: string;
  tags: string[];
  city_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  price_level: number;
  opening_hours: string | null;
  contact: string | null;
  reviews: { count: number; average: number } | null;
  verified: boolean;
}

let cityMap: Record<string, string> | null = null;

async function getCityMap(): Promise<Record<string, string>> {
  if (cityMap) return cityMap;

  try {
    const cities = await fetchCitiesApi();
    cityMap = {};
    for (const city of cities) {
      const key = city.name.toLowerCase();
      if (!cityMap[key]) {
        cityMap[key] = city.id;
      }
    }
    return cityMap;
  } catch (error) {
    console.warn("Failed to load cities:", error);
    return {};
  }
}

export async function resolveCityId(cityName: string): Promise<string | null> {
  const map = await getCityMap();
  return map[cityName.toLowerCase()] || null;
}

let _placesCache: DBPlace[] = [];
let _placesCacheTime = 0;
const PLACES_CACHE_TTL = 5 * 60 * 1000;

export async function fetchAllPlaces(): Promise<DBPlace[]> {
  if (_placesCache.length > 0 && Date.now() - _placesCacheTime < PLACES_CACHE_TTL) {
    return _placesCache;
  }

  try {
    _placesCache = await fetchAllPlacesApi();
    _placesCacheTime = Date.now();
    return _placesCache;
  } catch (error) {
    console.error("Failed to fetch places:", error);
    return _placesCache;
  }
}

export async function fetchPlacesByCity(cityName: string): Promise<DBPlace[]> {
  const all = await fetchAllPlaces();
  return filterByCity(all, cityName);
}

export async function filterByCity(places: DBPlace[], cityName: string): Promise<DBPlace[]> {
  if (!cityName) return places;

  const cityUUID = await resolveCityId(cityName);

  if (cityUUID) {
    const filtered = places.filter((p) => p.city_id === cityUUID);
    if (filtered.length > 0) return filtered;
    console.warn(`City UUID ${cityUUID.substring(0, 8)}... matched no places, returning all`);
  } else {
    console.warn(`Could not resolve city "${cityName}" to UUID`);
    const cityLower = cityName.toLowerCase();
    const filtered = places.filter((p) => {
      const cid = (p.city_id || "").toLowerCase();
      return cid === cityLower || cid.includes(cityLower) || cityLower.includes(cid);
    });
    if (filtered.length > 0) return filtered;
  }

  return places;
}
