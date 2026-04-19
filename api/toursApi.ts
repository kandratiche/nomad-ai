import { apiClient } from "@/lib/apiClient";
import { unwrapData, type ApiEnvelope } from "@/lib/apiUtils";
import { buildBackendPath } from "@/lib/runtimeConfig";
import type { DBTour, MyBooking, TourReview } from "@/api/services/toursService";

export async function fetchToursApi(city?: string): Promise<DBTour[]> {
  const payload = await apiClient.get<ApiEnvelope<DBTour[]>>(buildBackendPath("/tours"), {
    query: { city },
  });
  return unwrapData(payload);
}

export async function getTourDetailsApi(id: string): Promise<DBTour | null> {
  const payload = await apiClient.get<ApiEnvelope<DBTour | null>>(buildBackendPath(`/tours/${id}`));
  return unwrapData(payload);
}

export async function createTourApi(params: Record<string, unknown>): Promise<DBTour | null> {
  const payload = await apiClient.post<ApiEnvelope<DBTour | null>>(buildBackendPath("/tours"), params);
  return unwrapData(payload);
}

export async function joinTourApi(tourId: string, userId: string): Promise<void> {
  await apiClient.post<unknown>(buildBackendPath(`/tours/${tourId}/participants`), { userId });
}

export async function leaveTourApi(tourId: string, userId: string): Promise<void> {
  await apiClient.delete<unknown>(buildBackendPath(`/tours/${tourId}/participants`), {
    query: { userId },
  });
}

export async function getGuideToursApi(guideId: string): Promise<DBTour[]> {
  const payload = await apiClient.get<ApiEnvelope<DBTour[]>>(buildBackendPath("/tours/guide"), {
    query: { guideId },
  });
  return unwrapData(payload);
}

export async function updateParticipantStatusApi(participantId: string, status: "paid" | "cancelled"): Promise<void> {
  await apiClient.patch<unknown>(buildBackendPath(`/tour-participants/${participantId}`), { status });
}

export async function getMyBookingsApi(userId: string): Promise<MyBooking[]> {
  const payload = await apiClient.get<ApiEnvelope<MyBooking[]>>(buildBackendPath("/tours/bookings"), {
    query: { userId },
  });
  return unwrapData(payload);
}

export async function getTourReviewsApi(tourId: string): Promise<TourReview[]> {
  const payload = await apiClient.get<ApiEnvelope<TourReview[]>>(buildBackendPath(`/tours/${tourId}/reviews`));
  return unwrapData(payload);
}

export async function submitTourReviewApi(tourId: string, userId: string, rating: number, text: string): Promise<void> {
  await apiClient.post<unknown>(buildBackendPath(`/tours/${tourId}/reviews`), {
    userId,
    rating,
    text,
  });
}

