import supabase from "@/lib/supabaseClient";

export interface DBTourPackage {
  title: string;
  duration: string;
  price: number;
  currency: string;
  description: string;
}

export interface DBGuide {
  id: string;
  name: string;
  avatar_url: string;
  hero_image_url: string;
  bio: string;
  rating: number;
  review_count: number;
  experience_years: number;
  tours_completed: number;
  languages: string[];
  specialties: string[];
  tags: string[];
  price_per_hour: number;
  currency: string;
  whatsapp_number: string;
  response_time: string;
  city: string;
  is_verified: boolean;
  tour_packages: DBTourPackage[];
}

export async function fetchGuides(city?: string): Promise<DBGuide[]> {
  let query = supabase
    .from("users")
    .select("id, name, avatar_url, home_city, guide_info")
    .eq("roles", "guide");

  if (city) {
    query = query.ilike("home_city", city);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("fetchGuides error:", error);
    return [];
  }

  return data
    .map(mapUserToGuide)
    .sort((a, b) => b.rating - a.rating);
}

export async function getGuideDetails(id: string): Promise<DBGuide | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, avatar_url, home_city, guide_info")
    .eq("id", id)
    .eq("roles", "guide")
    .single();

  if (error || !data) return null;
  return mapUserToGuide(data);
}

function mapUserToGuide(row: any): DBGuide {
  const info = row.guide_info || {};
  return {
    id: row.id,
    name: row.name || "Guide",
    avatar_url: row.avatar_url || "",
    hero_image_url: info.hero_image_url || "",
    bio: info.bio || "",
    rating: info.rating || 0,
    review_count: info.reviews_count || 0,
    experience_years: info.experience_years || 0,
    tours_completed: info.tours_completed || 0,
    languages: info.languages || [],
    specialties: info.specialties || [],
    tags: info.tags || [],
    price_per_hour: info.price || 0,
    currency: info.currency || "₸",
    whatsapp_number: info.whatsapp_number || "",
    response_time: info.response_time || "",
    city: row.home_city || "",
    is_verified: info.is_verified || false,
    tour_packages: (info.tour_packages || []).map((p: any) => ({
      title: p.title || "",
      duration: p.duration || "",
      price: p.price || 0,
      currency: p.currency || "₸",
      description: p.description || "",
    })),
  };
}
