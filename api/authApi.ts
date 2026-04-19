import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";

export type AuthPayload = {
  user?: any;
  profile?: any;
  accessToken?: string;
  token?: string;
  jwt?: string;
};

export async function registerApi(payload: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthPayload> {
  const result = await apiClient.post<ApiEnvelope<AuthPayload>>(buildBackendPath("/auth/register"), payload, {
    auth: false,
  });
  return unwrapData(result);
}

export async function loginApi(payload: {
  email: string;
  password: string;
}): Promise<AuthPayload> {
  const result = await apiClient.post<ApiEnvelope<AuthPayload>>(buildBackendPath("/auth/login"), payload, {
    auth: false,
  });
  return unwrapData(result);
}

export async function meApi(): Promise<any> {
  const result = await apiClient.get<ApiEnvelope<any>>(buildBackendPath("/auth/me"));
  return unwrapData(result);
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post<unknown>(buildBackendPath("/auth/logout"), {});
  } catch {
    // logout should always clear local session even if backend request fails
  }
}

