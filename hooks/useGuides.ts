import { useQuery } from "@tanstack/react-query";
import { fetchGuides, getGuideDetails } from "@/services/guidesService";

export function useGuides(city?: string) {
  return useQuery({
    queryKey: ["guides", city],
    queryFn: () => fetchGuides(city),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGuideDetails(id: string | null) {
  return useQuery({
    queryKey: ["guide", id],
    queryFn: () => getGuideDetails(id!),
    enabled: !!id,
  });
}
