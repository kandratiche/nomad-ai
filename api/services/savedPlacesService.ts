import { getSavedPlacesApi, savePlaceApi, unsavePlaceApi } from "@/api/savedPlacesApi";

export async function getSavedPlaces(userId: string): Promise<string[]> {
  try {
    return await getSavedPlacesApi(userId);
  } catch (error) {
    console.error("getSavedPlaces error:", error);
    return [];
  }
}

export async function toggleSavedPlace(
  userId: string,
  placeId: string,
  currentlySaved: boolean,
): Promise<boolean> {
  try {
    if (currentlySaved) {
      await unsavePlaceApi(userId, placeId);
    } else {
      await savePlaceApi(userId, placeId);
    }
    return true;
  } catch (error) {
    console.error("toggleSavedPlace error:", error);
    return false;
  }
}
