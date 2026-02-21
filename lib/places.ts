import supabase from "./supabaseClient";

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
  // Detail fields
  address: string | null;
  price_level: number;         // 0=free, 1=cheap → 5=luxury
  opening_hours: string | null;
  contact: string | null;
  reviews: { count: number; average: number } | null;
  verified: boolean;
}

// Cache city name → UUID mapping (fetched once)
let cityMap: Record<string, string> | null = null;

async function getCityMap(): Promise<Record<string, string>> {
  if (cityMap) return cityMap;

  const { data, error } = await supabase.from("cities").select("id, name");
  if (error || !data) {
    console.warn("Failed to load cities table:", error);
    return {};
  }

  cityMap = {};
  for (const city of data) {
    const key = city.name.toLowerCase();
    if (!cityMap[key]) {
      cityMap[key] = city.id;
    }
  }
  return cityMap;
}

export async function resolveCityId(cityName: string): Promise<string | null> {
  const map = await getCityMap();
  return map[cityName.toLowerCase()] || null;
}

/**
 * Fetch all places from Supabase with full detail fields.
 */
let _placesCache: DBPlace[] = [];
let _placesCacheTime = 0;
const PLACES_CACHE_TTL = 5 * 60 * 1000; // 5 min

export async function fetchAllPlaces(): Promise<DBPlace[]> {
  if (_placesCache.length > 0 && Date.now() - _placesCacheTime < PLACES_CACHE_TTL) {
    return _placesCache;
  }

  const { data, error } = await supabase
    .from("places")
    .select("id, title, type, rating, safety_score, image_url, description, tags, city_id, coordinates, address, price_level, opening_hours, contact, reviews, verified");

  if (error || !data) {
    console.error("Failed to fetch places:", error);
    return _placesCache;
  }

  _placesCache = data.map((p: any) => ({
    id: p.id,
    title: p.title,
    type: p.type || "",
    rating: p.rating,
    safety_score: p.safety_score || 90,
    image_url: p.image_url || "",
    description: p.description || "",
    tags: p.tags || [],
    city_id: p.city_id || "",
    latitude: p.coordinates?.latitude ?? null,
    longitude: p.coordinates?.longitude ?? null,
    address: p.address || null,
    price_level: p.price_level ?? 0,
    opening_hours: p.opening_hours || null,
    contact: p.contact || null,
    reviews: p.reviews || null,
    verified: p.verified || false,
  }));
  _placesCacheTime = Date.now();
  return _placesCache;
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
