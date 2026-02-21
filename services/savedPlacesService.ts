import supabase from "@/lib/supabaseClient";

export async function getSavedPlaces(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data.map((d: any) => d.place_id);
}

export async function toggleSavedPlace(
  userId: string,
  placeId: string,
  currentlySaved: boolean,
): Promise<boolean> {
  if (currentlySaved) {
    const { error } = await supabase
      .from("saved_places")
      .delete()
      .eq("user_id", userId)
      .eq("place_id", placeId);
    return !error;
  } else {
    const { error } = await supabase
      .from("saved_places")
      .insert({ user_id: userId, place_id: placeId });
    return !error;
  }
}
