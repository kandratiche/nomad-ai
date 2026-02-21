import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyTrips, saveTrip, deleteTrip } from "@/services/tripsService";

export function useMyTrips(userId: string | null) {
  return useQuery({
    queryKey: ["trips", userId],
    queryFn: () => getMyTrips(userId!),
    enabled: !!userId,
  });
}

export function useSaveTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}
