import { useQuery } from "@tanstack/react-query";
import { fetchPlaces, getPlaceDetails, type PlaceFilter } from "@/services/placesService";

export function usePlaces(filter?: PlaceFilter) {
  return useQuery({
    queryKey: ["places", filter],
    queryFn: () => fetchPlaces(filter),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlaceDetails(id: string | null) {
  return useQuery({
    queryKey: ["place", id],
    queryFn: () => getPlaceDetails(id!),
    enabled: !!id,
  });
}
