import {
  createTourApi,
  fetchToursApi,
  getGuideToursApi,
  getMyBookingsApi,
  getTourDetailsApi,
  getTourReviewsApi,
  joinTourApi,
  leaveTourApi,
  submitTourReviewApi,
  updateParticipantStatusApi,
} from "@/api/toursApi";

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
  try {
    return await fetchToursApi(city);
  } catch (error) {
    console.error("fetchTours error:", error);
    return [];
  }
}

export async function getTourDetails(id: string): Promise<DBTour | null> {
  try {
    return await getTourDetailsApi(id);
  } catch (error) {
    console.error("getTourDetails error:", error);
    return null;
  }
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
  try {
    return await createTourApi({
      guideId: params.guideId,
      title: params.title,
      description: params.description,
      priceTotal: params.priceTotal,
      maxPeople: params.maxPeople,
      durationHours: params.durationHours,
      startDate: params.startDate || null,
      imageUrl: params.imageUrl || "",
      city: params.city,
      tags: params.tags || [],
      isPremium: params.isPremium || false,
      status: params.status || "active",
    });
  } catch (error) {
    console.error("createTour error:", error);
    return null;
  }
}

export async function joinTour(tourId: string, userId: string): Promise<boolean> {
  try {
    await joinTourApi(tourId, userId);
    return true;
  } catch (error) {
    console.error("joinTour error:", error);
    return false;
  }
}

export async function leaveTour(tourId: string, userId: string): Promise<boolean> {
  try {
    await leaveTourApi(tourId, userId);
    return true;
  } catch (error) {
    console.error("leaveTour error:", error);
    return false;
  }
}

export async function getMyTours(guideId: string): Promise<DBTour[]> {
  try {
    return await getGuideToursApi(guideId);
  } catch (error) {
    console.error("getMyTours error:", error);
    return [];
  }
}

export async function updateParticipantStatus(
  participantId: string,
  status: "paid" | "cancelled",
): Promise<boolean> {
  try {
    await updateParticipantStatusApi(participantId, status);
    return true;
  } catch (error) {
    console.error("updateParticipantStatus error:", error);
    return false;
  }
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
  try {
    return await getMyBookingsApi(userId);
  } catch (error) {
    console.error("getMyBookings error:", error);
    return [];
  }
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
  try {
    return await getTourReviewsApi(tourId);
  } catch (error) {
    console.error("getTourReviews error:", error);
    return [];
  }
}

export async function submitReview(
  tourId: string,
  userId: string,
  rating: number,
  text: string,
): Promise<boolean> {
  try {
    await submitTourReviewApi(tourId, userId, rating, text);
    return true;
  } catch (error) {
    console.error("submitReview error:", error);
    return false;
  }
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
    } catch {
      // try next model
    }
  }
  return draft;
}
