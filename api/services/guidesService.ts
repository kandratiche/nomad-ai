import { fetchGuidesApi, getGuideDetailsApi } from "@/api/guidesApi";

export interface DBTourPackage {
  id?: string;
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
  try {
    const data = await fetchGuidesApi(city);
    return data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } catch (error) {
    console.error("fetchGuides error:", error);
    return [];
  }
}

export async function getGuideDetails(id: string): Promise<DBGuide | null> {
  try {
    return await getGuideDetailsApi(id);
  } catch (error) {
    console.error("getGuideDetails error:", error);
    return null;
  }
}
