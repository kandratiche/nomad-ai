import { fetchTourMessagesApi, sendTourMessageApi } from "@/api/chatApi";
import { runtimeConfig } from "@/lib/runtimeConfig";

export interface ChatMessage {
  id: string;
  tour_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export async function fetchMessages(tourId: string): Promise<ChatMessage[]> {
  try {
    return await fetchTourMessagesApi(tourId);
  } catch (error) {
    console.error("fetchMessages error:", error);
    return [];
  }
}

export async function sendMessage(
  tourId: string,
  userId: string,
  text: string,
): Promise<ChatMessage | null> {
  try {
    return await sendTourMessageApi(tourId, userId, text);
  } catch (error) {
    console.error("sendMessage error:", error);
    return null;
  }
}

export function subscribeToMessages(
  tourId: string,
  onMessage: (msg: ChatMessage) => void,
) {
  let stopped = false;
  const knownIds = new Set<string>();

  const tick = async () => {
    if (stopped) return;

    try {
      const items = await fetchMessages(tourId);
      for (const item of items) {
        if (!knownIds.has(item.id)) {
          knownIds.add(item.id);
          onMessage(item);
        }
      }
    } catch {}
  };

  tick();
  const timer = setInterval(tick, runtimeConfig.chatPollIntervalMs);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
