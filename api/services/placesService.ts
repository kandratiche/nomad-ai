import type { DBPlace } from "@/lib/places";
import { fetchPlacesApi, fetchPlacePinsApi, getPlaceApi } from "@/api/placesApi";

export interface PlaceFilter {
  city?: string;
  category?: string;
  minSafety?: number;
  search?: string;
}

export async function fetchPlaces(filter?: PlaceFilter): Promise<DBPlace[]> {
  try {
    return await fetchPlacesApi(filter);
  } catch (error) {
    console.error("fetchPlaces error:", error);
    return [];
  }
}

export async function getPlaceDetails(id: string): Promise<DBPlace | null> {
  try {
    return await getPlaceApi(id);
  } catch (error) {
    console.error("getPlaceDetails error:", error);
    return null;
  }
}

export interface PlacePin {
  id: string;
  type: string;
  latitude: number;
  longitude: number;
}

export async function fetchPlacePins(cityName: string): Promise<PlacePin[]> {
  try {
    return await fetchPlacePinsApi(cityName);
  } catch (error) {
    console.error("fetchPlacePins error:", error);
    return [];
  }
}
