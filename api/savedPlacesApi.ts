import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";

export async function getSavedPlacesApi(userId: string): Promise<string[]> {
  const payload = await apiClient.get<ApiEnvelope<string[]>>(buildBackendPath("/saved-places"), {
    query: { userId },
  });
  return unwrapData(payload);
}

export async function savePlaceApi(userId: string, placeId: string): Promise<void> {
  await apiClient.post<unknown>(buildBackendPath("/saved-places"), { userId, placeId });
}

export async function unsavePlaceApi(userId: string, placeId: string): Promise<void> {
  await apiClient.delete<unknown>(buildBackendPath("/saved-places"), {
    query: { userId, placeId },
  });
}

