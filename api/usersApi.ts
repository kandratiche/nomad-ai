import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";

export async function updateCurrentUserApi(updateData: Record<string, unknown>): Promise<any> {
  const payload = await apiClient.patch<ApiEnvelope<any>>(buildBackendPath("/users/me"), updateData);
  return unwrapData(payload);
}

export async function getUserProfileApi(userId: string): Promise<any> {
  const payload = await apiClient.get<ApiEnvelope<any>>(buildBackendPath(`/users/${userId}`));
  return unwrapData(payload);
}

