import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import type { AIResponse } from "@/types";

export interface BackendTrip {
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

export async function fetchTripsByUser(userId: string): Promise<BackendTrip[]> {
  const payload = await apiClient.get<ApiEnvelope<BackendTrip[]>>(buildBackendPath("/trips"), {
    query: { userId },
  });
  return unwrapData(payload);
}

export async function createTripApi(params: {
  userId: string;
  title: string;
  city: string;
  routeJson: AIResponse;
  previewImageUrl?: string;
  totalSafetyScore?: number;
  totalDuration?: string;
  estimatedCost?: string;
}): Promise<BackendTrip> {
  const payload = await apiClient.post<ApiEnvelope<BackendTrip>, Record<string, unknown>>(
    buildBackendPath("/trips"),
    {
      userId: params.userId,
      title: params.title,
      city: params.city,
      routeJson: params.routeJson,
      previewImageUrl: params.previewImageUrl || "",
      totalSafetyScore: params.totalSafetyScore || 0,
      totalDuration: params.totalDuration || "",
      estimatedCost: params.estimatedCost || "",
    },
  );

  return unwrapData(payload);
}

export async function deleteTripApi(id: string): Promise<void> {
  await apiClient.delete<unknown>(buildBackendPath(`/trips/${id}`));
}
