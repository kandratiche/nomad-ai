import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSavedPlaces, toggleSavedPlace } from "@/services/savedPlacesService";

export function useSavedPlaces(userId: string | null) {
  return useQuery({
    queryKey: ["savedPlaces", userId],
    queryFn: () => getSavedPlaces(userId!),
    enabled: !!userId,
  });
}

export function useToggleSavedPlace(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ placeId, isSaved }: { placeId: string; isSaved: boolean }) =>
      toggleSavedPlace(userId, placeId, isSaved),
    onMutate: async ({ placeId, isSaved }) => {
      await qc.cancelQueries({ queryKey: ["savedPlaces", userId] });
      const prev = qc.getQueryData<string[]>(["savedPlaces", userId]);
      qc.setQueryData<string[]>(["savedPlaces", userId], (old = []) =>
        isSaved ? old.filter((id) => id !== placeId) : [...old, placeId],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["savedPlaces", userId], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["savedPlaces", userId] }),
  });
}
