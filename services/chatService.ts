import supabase from "@/lib/supabaseClient";

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
  const { data, error } = await supabase
    .from("tour_messages")
    .select("*")
    .eq("tour_id", tourId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error || !data) return [];

  const userIds = [...new Set(data.map((m: any) => m.user_id))];
  if (userIds.length === 0) return [];

  const { data: users } = await supabase
    .from("users")
    .select("id, name, avatar_url")
    .in("id", userIds);

  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return data.map((m: any) => {
    const u = userMap.get(m.user_id);
    return {
      ...m,
      user_name: u?.name || "User",
      user_avatar: u?.avatar_url || "",
    };
  });
}

export async function sendMessage(
  tourId: string,
  userId: string,
  text: string,
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("tour_messages")
    .insert({ tour_id: tourId, user_id: userId, text })
    .select()
    .single();

  if (error) {
    console.error("sendMessage error:", error);
    return null;
  }

  // Award 2 points per message (fire-and-forget, first 50 messages)
  supabase.from("users").select("total_points").eq("id", userId).single().then(({ data: u }) => {
    if (u) supabase.from("users").update({ total_points: (u.total_points || 0) + 2 }).eq("id", userId);
  }).catch(() => {});

  return data as ChatMessage;
}

export function subscribeToMessages(
  tourId: string,
  onMessage: (msg: any) => void,
) {
  const channel = supabase
    .channel(`tour-chat-${tourId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "tour_messages", filter: `tour_id=eq.${tourId}` },
      (payload) => onMessage(payload.new),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
