import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";

export type CityRecord = { id: string; name: string };

export async function fetchCitiesApi(): Promise<CityRecord[]> {
  const payload = await apiClient.get<ApiEnvelope<CityRecord[]>>(buildBackendPath("/cities"));
  return unwrapData(payload);
}

