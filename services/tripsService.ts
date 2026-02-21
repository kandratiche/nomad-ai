import supabase from "@/lib/supabaseClient";
import type { AIResponse } from "@/types";

export interface DBTrip {
  id: string;
  user_id: string;
  title: string;
  city: string;
  route_json: AIResponse;
  preview_image_url: string;
  total_safety_score: number;
  total_duration: string;
  estimated_cost: string;
  is_public: boolean;
  scheduled_at: string | null;
  created_at: string;
}

export async function saveTrip(params: {
  userId: string;
  title: string;
  city: string;
  routeJson: AIResponse;
  previewImageUrl?: string;
  totalSafetyScore?: number;
  totalDuration?: string;
  estimatedCost?: string;
}): Promise<DBTrip | null> {
  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: params.userId,
      title: params.title,
      city: params.city,
      route_json: params.routeJson,
      preview_image_url: params.previewImageUrl || "",
      total_safety_score: params.totalSafetyScore || 0,
      total_duration: params.totalDuration || "",
      estimated_cost: params.estimatedCost || "",
    })
    .select()
    .single();

  if (error) {
    console.error("saveTrip error:", error);
    return null;
  }
  return data as DBTrip;
}

export async function getMyTrips(userId: string): Promise<DBTrip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("getMyTrips error:", error);
    return [];
  }
  return data as DBTrip[];
}

export async function deleteTrip(id: string): Promise<boolean> {
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) {
    console.error("deleteTrip error:", error);
    return false;
  }
  return true;
}
