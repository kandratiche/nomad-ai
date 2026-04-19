import type { AIResponse } from "@/types";
import { createTripApi, deleteTripApi, fetchTripsByUser } from "@/api/tripsApi";

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
  try {
    return await createTripApi(params);
  } catch (error) {
    console.error("saveTrip error:", error);
    return null;
  }
}

export async function getMyTrips(userId: string): Promise<DBTrip[]> {
  try {
    return await fetchTripsByUser(userId);
  } catch (error) {
    console.error("getMyTrips error:", error);
    return [];
  }
}

export async function deleteTrip(id: string): Promise<boolean> {
  try {
    await deleteTripApi(id);
    return true;
  } catch (error) {
    console.error("deleteTrip error:", error);
    return false;
  }
}
