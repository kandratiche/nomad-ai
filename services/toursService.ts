import supabase from "@/lib/supabaseClient";

export interface TourItineraryItem {
  day?: number;
  time?: string;
  title: string;
  desc?: string;
}

export interface DBTour {
  id: string;
  guide_id: string;
  title: string;
  description: string;
  price_per_person: number;
  max_people: number;
  duration_hours: number;
  is_premium: boolean;
  status: "active" | "draft" | "completed" | "cancelled";
  start_date: string | null;
  image_url: string;
  city: string;
  tags: string[];
  created_at: string;
  participant_count?: number;
  guide_name?: string;
  guide_avatar?: string;
  guide_verified?: boolean;
  participants?: DBParticipant[];
  partner_name?: string | null;
  partner_instagram?: string | null;
  partner_whatsapp?: string | null;
  itinerary?: TourItineraryItem[] | null;
  included?: string[] | null;
  available_dates?: string[] | null;
  pickup_location?: string | null;
  pickup_time?: string | null;
  child_discount?: number | null;
}

export interface DBParticipant {
  id: string;
  user_id: string;
  status: "paid" | "pending" | "cancelled";
  joined_at: string;
  user_name?: string;
  user_avatar?: string;
}

export async function fetchTours(city?: string): Promise<DBTour[]> {
  let query = supabase
    .from("tours")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (city) {
    query = query.ilike("city", city);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("fetchTours error:", error);
    return [];
  }
  if (data.length === 0) return [];

  const guideIds = [...new Set(data.map((t: any) => t.guide_id))];
  const tourIds = data.map((t: any) => t.id);

  const [guidesRes, countsRes] = await Promise.all([
    supabase.from("users").select("id, name, avatar_url, guide_info").in("id", guideIds),
    supabase.from("tour_participants").select("tour_id").in("tour_id", tourIds).neq("status", "cancelled"),
  ]);

  const guideMap = new Map((guidesRes.data || []).map((g: any) => [g.id, g]));
  const countMap: Record<string, number> = {};
  for (const row of countsRes.data || []) {
    countMap[row.tour_id] = (countMap[row.tour_id] || 0) + 1;
  }

  return data.map((t: any) => {
    const guide = guideMap.get(t.guide_id);
    return {
      ...t,
      participant_count: countMap[t.id] || 0,
      guide_name: guide?.name || "Guide",
      guide_avatar: guide?.avatar_url || "",
      guide_verified: guide?.guide_info?.is_verified || false,
    };
  });
}

export async function getTourDetails(id: string): Promise<DBTour | null> {
  const { data: tour, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !tour) return null;

  const [guideRes, partsRes] = await Promise.all([
    supabase.from("users").select("id, name, avatar_url, guide_info").eq("id", tour.guide_id).single(),
    supabase.from("tour_participants").select("id, user_id, status, joined_at").eq("tour_id", id).neq("status", "cancelled"),
  ]);

  const guide = guideRes.data;
  const parts = partsRes.data || [];

  const userIds = parts.map((p: any) => p.user_id);
  const users = userIds.length > 0
    ? (await supabase.from("users").select("id, name, avatar_url").in("id", userIds)).data || []
    : [];
  const userMap = new Map(users.map((u: any) => [u.id, u]));

  return {
    ...tour,
    participant_count: parts.length,
    guide_name: guide?.name || "Guide",
    guide_avatar: guide?.avatar_url || "",
    guide_verified: guide?.guide_info?.is_verified || false,
    participants: parts.map((p: any) => {
      const u = userMap.get(p.user_id);
      return { ...p, user_name: u?.name || "User", user_avatar: u?.avatar_url || "" };
    }),
  };
}

export async function createTour(params: {
  guideId: string;
  title: string;
  description: string;
  priceTotal: number;
  maxPeople: number;
  durationHours: number;
  startDate?: string;
  imageUrl?: string;
  city: string;
  tags?: string[];
  isPremium?: boolean;
  status?: "active" | "draft";
}): Promise<DBTour | null> {
  const { data, error } = await supabase
    .from("tours")
    .insert({
      guide_id: params.guideId,
      title: params.title,
      description: params.description,
      price_per_person: params.priceTotal,
      max_people: params.maxPeople,
      duration_hours: params.durationHours,
      start_date: params.startDate || null,
      image_url: params.imageUrl || "",
      city: params.city,
      tags: params.tags || [],
      is_premium: params.isPremium || false,
      status: params.status || "active",
    })
    .select()
    .single();

  if (error) { console.error("createTour error:", error); return null; }
  return data as DBTour;
}

export async function joinTour(tourId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("tour_participants")
    .insert({ tour_id: tourId, user_id: userId, status: "pending" });
  if (error) { console.error("joinTour error:", error); return false; }

  awardPoints(userId, 10, "join").catch(() => {});
  return true;
}

export async function leaveTour(tourId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from("tour_participants")
    .update({ status: "cancelled" })
    .eq("tour_id", tourId)
    .eq("user_id", userId);
  if (error) { console.error("leaveTour error:", error); return false; }
  return true;
}

export async function getMyTours(guideId: string): Promise<DBTour[]> {
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("guide_id", guideId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as DBTour[];
}

export async function updateParticipantStatus(
  participantId: string,
  status: "paid" | "cancelled",
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tour_participants")
    .update({ status })
    .eq("id", participantId)
    .select()
    .single();

  if (error) {
    console.error("updateParticipantStatus error:", error);
    return false;
  }
  if (!data) {
    console.error("updateParticipantStatus: no rows updated, RLS may be blocking");
    return false;
  }
  console.log("updateParticipantStatus success:", data.id, "->", data.status);
  return true;
}

export interface MyBooking {
  id: string;
  tour_id: string;
  status: "paid" | "pending" | "cancelled";
  joined_at: string;
  tour_title: string;
  tour_city: string;
  tour_image: string;
  tour_price: number;
  tour_max_people: number;
  tour_start_date: string | null;
  guide_name: string;
  guide_avatar: string;
}

export async function getMyBookings(userId: string): Promise<MyBooking[]> {
  const { data: parts, error } = await supabase
    .from("tour_participants")
    .select("id, tour_id, status, joined_at")
    .eq("user_id", userId)
    .neq("status", "cancelled")
    .order("joined_at", { ascending: false });

  if (error || !parts || parts.length === 0) return [];

  const tourIds = [...new Set(parts.map((p: any) => p.tour_id))];
  const { data: tours } = await supabase
    .from("tours")
    .select("id, title, city, image_url, price_per_person, max_people, start_date, guide_id")
    .in("id", tourIds);

  const guideIds = [...new Set((tours || []).map((t: any) => t.guide_id))];
  const { data: guides } = guideIds.length > 0
    ? await supabase.from("users").select("id, name, avatar_url").in("id", guideIds)
    : { data: [] };

  const tourMap = new Map((tours || []).map((t: any) => [t.id, t]));
  const guideMap = new Map((guides || []).map((g: any) => [g.id, g]));

  return parts.map((p: any) => {
    const tour = tourMap.get(p.tour_id) || {};
    const guide = guideMap.get(tour.guide_id) || {};
    return {
      id: p.id,
      tour_id: p.tour_id,
      status: p.status,
      joined_at: p.joined_at,
      tour_title: tour.title || "Tour",
      tour_city: tour.city || "",
      tour_image: tour.image_url || "",
      tour_price: tour.price_per_person || 0,
      tour_max_people: tour.max_people || 4,
      tour_start_date: tour.start_date || null,
      guide_name: guide.name || "Guide",
      guide_avatar: guide.avatar_url || "",
    };
  });
}

export interface TourReview {
  id: string;
  tour_id: string;
  user_id: string;
  rating: number;
  text: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export async function getTourReviews(tourId: string): Promise<TourReview[]> {
  const { data, error } = await supabase
    .from("tour_reviews")
    .select("*")
    .eq("tour_id", tourId)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const userIds = [...new Set(data.map((r: any) => r.user_id))];
  const { data: users } = await supabase.from("users").select("id, name, avatar_url").in("id", userIds);
  const userMap = new Map((users || []).map((u: any) => [u.id, u]));

  return data.map((r: any) => {
    const u = userMap.get(r.user_id);
    return { ...r, user_name: u?.name || "User", user_avatar: u?.avatar_url || "" };
  });
}

export async function submitReview(
  tourId: string, userId: string, rating: number, text: string,
): Promise<boolean> {
  const { error } = await supabase
    .from("tour_reviews")
    .upsert({ tour_id: tourId, user_id: userId, rating, text }, { onConflict: "tour_id,user_id" });
  if (error) { console.error("submitReview error:", error); return false; }

  awardPoints(userId, 15, "review").catch(() => {});
  return true;
}

async function awardPoints(userId: string, points: number, reason: "join" | "review" | "chat") {
  const incField = reason === "join" ? "tours_joined" : reason === "review" ? "reviews_written" : null;
  const { data: current } = await supabase.from("users").select("total_points, tours_joined, reviews_written").eq("id", userId).single();
  if (!current) return;

  const updates: any = { total_points: (current.total_points || 0) + points };
  if (incField) updates[incField] = (current[incField as keyof typeof current] as number || 0) + 1;

  await supabase.from("users").update(updates).eq("id", userId);
}

export async function enhanceDescriptionWithAI(draft: string, title: string, city: string): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return draft;

  const prompt = `You are a premium tour copywriter for ${city}, Kazakhstan.
Take this draft tour description and make it compelling, premium, and engaging.
Add relevant emojis, highlight unique selling points, and create a sense of exclusivity.
Keep it under 200 words. Write in the same language as the draft.

ANTI-HALLUCINATION RULES:
- Use ONLY facts and details present in the draft. NEVER invent locations, prices, or features not mentioned.
- Do not add specific addresses, phone numbers, or opening hours unless they appear in the draft.
- If the draft lacks detail, enhance the tone and style without fabricating new factual claims.
- When uncertain about any detail, omit it rather than guess.

Tour title: "${title}"
Draft: "${draft}"

Return ONLY the enhanced description text, no extra formatting.`;

  const models = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
          }),
        },
      );
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) return text.trim();
    } catch {}
  }
  return draft;
}
