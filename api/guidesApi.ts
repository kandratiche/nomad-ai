import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import type { DBGuide } from "@/api/services/guidesService";

export async function fetchGuidesApi(city?: string): Promise<DBGuide[]> {
  const payload = await apiClient.get<ApiEnvelope<DBGuide[]>>(buildBackendPath("/guides"), {
    query: { city },
  });
  return unwrapData(payload);
}

export async function getGuideDetailsApi(id: string): Promise<DBGuide | null> {
  const payload = await apiClient.get<ApiEnvelope<DBGuide | null>>(buildBackendPath(`/guides/${id}`));
  return unwrapData(payload);
}

