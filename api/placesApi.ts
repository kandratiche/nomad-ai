import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import type { DBPlace } from "@/lib/places";

export async function fetchPlacesApi(filter?: {
  city?: string;
  category?: string;
  minSafety?: number;
  search?: string;
}): Promise<DBPlace[]> {
  const payload = await apiClient.get<ApiEnvelope<DBPlace[]>>(buildBackendPath("/places"), {
    query: {
      city: filter?.city,
      category: filter?.category,
      minSafety: filter?.minSafety,
      search: filter?.search,
    },
  });
  return unwrapData(payload);
}

export async function getPlaceApi(id: string): Promise<DBPlace | null> {
  const payload = await apiClient.get<ApiEnvelope<DBPlace | null>>(buildBackendPath(`/places/${id}`));
  return unwrapData(payload);
}

export async function fetchPlacePinsApi(cityName: string): Promise<
  { id: string; type: string; latitude: number; longitude: number }[]
> {
  const payload = await apiClient.get<ApiEnvelope<{ id: string; type: string; latitude: number; longitude: number }[]>>(
    buildBackendPath("/places/pins"),
    { query: { city: cityName } },
  );
  return unwrapData(payload);
}

export async function fetchAllPlacesApi(): Promise<DBPlace[]> {
  const payload = await apiClient.get<ApiEnvelope<DBPlace[]>>(buildBackendPath("/places"));
  return unwrapData(payload);
}

