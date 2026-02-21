import supabase from "@/lib/supabaseClient";
import type { DBPlace } from "@/lib/places";

export interface PlaceFilter {
  city?: string;
  category?: string;
  minSafety?: number;
  search?: string;
}

export async function fetchPlaces(filter?: PlaceFilter): Promise<DBPlace[]> {
  let query = supabase
    .from("places")
    .select(
      "id, title, type, rating, safety_score, image_url, description, tags, city_id, coordinates, address, price_level, opening_hours, contact, reviews, verified",
    );

  if (filter?.city) {
    const { data: cities } = await supabase
      .from("cities")
      .select("id")
      .ilike("name", filter.city);
    if (cities && cities.length > 0) {
      query = query.eq("city_id", cities[0].id);
    }
  }

  if (filter?.minSafety) {
    query = query.gte("safety_score", filter.minSafety);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("fetchPlaces error:", error);
    return [];
  }

  return data.map((p: any) => ({
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
}

export async function getPlaceDetails(id: string): Promise<DBPlace | null> {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    type: data.type || "",
    rating: data.rating,
    safety_score: data.safety_score || 90,
    image_url: data.image_url || "",
    description: data.description || "",
    tags: data.tags || [],
    city_id: data.city_id || "",
    latitude: data.coordinates?.latitude ?? null,
    longitude: data.coordinates?.longitude ?? null,
    address: data.address || null,
    price_level: data.price_level ?? 0,
    opening_hours: data.opening_hours || null,
    contact: data.contact || null,
    reviews: data.reviews || null,
    verified: data.verified || false,
  };
}
