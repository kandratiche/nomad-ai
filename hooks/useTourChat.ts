import { useEffect, useState, useCallback } from "react";
import { fetchMessages, sendMessage, subscribeToMessages, type ChatMessage } from "@/services/chatService";

export function useTourChat(tourId: string | null, userId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!tourId) return;
    setLoading(true);
    const msgs = await fetchMessages(tourId);
    setMessages(msgs);
    setLoading(false);
  }, [tourId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!tourId) return;
    const unsub = subscribeToMessages(tourId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, { ...newMsg, user_name: "", user_avatar: "" }];
      });
    });
    return unsub;
  }, [tourId]);

  const send = useCallback(async (text: string) => {
    if (!tourId || !userId || !text.trim()) return;
    setSending(true);
    await sendMessage(tourId, userId, text.trim());
    setSending(false);
  }, [tourId, userId]);

  return { messages, loading, sending, send, refresh: loadMessages };
}
