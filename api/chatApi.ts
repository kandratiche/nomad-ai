import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import type { ChatMessage } from "@/api/services/chatService";

export async function fetchTourMessagesApi(tourId: string): Promise<ChatMessage[]> {
  const payload = await apiClient.get<ApiEnvelope<ChatMessage[]>>(buildBackendPath(`/tours/${tourId}/messages`));
  return unwrapData(payload);
}

export async function sendTourMessageApi(tourId: string, userId: string, text: string): Promise<ChatMessage | null> {
  const payload = await apiClient.post<ApiEnvelope<ChatMessage | null>>(buildBackendPath(`/tours/${tourId}/messages`), {
    userId,
    text,
  });
  return unwrapData(payload);
}

