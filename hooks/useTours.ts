import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTours, getTourDetails, createTour, joinTour, getMyTours,
  updateParticipantStatus, getMyBookings, getTourReviews, submitReview,
} from "@/services/toursService";

export function useTours(city?: string) {
  return useQuery({
    queryKey: ["tours", city],
    queryFn: () => fetchTours(city),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTourDetails(id: string | null) {
  return useQuery({
    queryKey: ["tour", id],
    queryFn: () => getTourDetails(id!),
    enabled: !!id,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyGuideTours(guideId: string | null) {
  return useQuery({
    queryKey: ["myTours", guideId],
    queryFn: () => getMyTours(guideId!),
    enabled: !!guideId,
  });
}

export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tours"] });
      qc.invalidateQueries({ queryKey: ["myTours"] });
    },
  });
}

export function useJoinTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, userId }: { tourId: string; userId: string }) =>
      joinTour(tourId, userId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["tour", vars.tourId] });
      qc.invalidateQueries({ queryKey: ["tours"] });
      qc.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}

export function useUpdateParticipant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ participantId, status }: { participantId: string; status: "paid" | "cancelled" }) =>
      updateParticipantStatus(participantId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tour"] });
      qc.invalidateQueries({ queryKey: ["myTours"] });
    },
  });
}

export function useMyBookings(userId: string | null) {
  return useQuery({
    queryKey: ["myBookings", userId],
    queryFn: () => getMyBookings(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useTourReviews(tourId: string | null) {
  return useQuery({
    queryKey: ["tourReviews", tourId],
    queryFn: () => getTourReviews(tourId!),
    enabled: !!tourId,
    staleTime: 2 * 60_000,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tourId, userId, rating, text }: { tourId: string; userId: string; rating: number; text: string }) =>
      submitReview(tourId, userId, rating, text),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["tourReviews", vars.tourId] });
    },
  });
}
