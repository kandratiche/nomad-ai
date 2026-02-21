import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { BodyText, CaptionText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import { Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { usePlaces } from "@/hooks/usePlaces";
import { useGuides } from "@/hooks/useGuides";
import { useSavedPlaces, useToggleSavedPlace } from "@/hooks/useSavedPlaces";
import { useTours } from "@/hooks/useTours";
import type { DBPlace } from "@/lib/places";
import type { DBGuide } from "@/services/guidesService";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import { TourCard } from "@/components/TourCard";
import { MapView, Marker, isMapAvailable } from "@/lib/maps";
import { BottomSheet, BottomSheetView, BottomSheetBackdrop, isBottomSheetAvailable } from "@/lib/bottomSheet";
import type { TimelineStop } from "@/types";

const { width } = Dimensions.get("window");

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  astana: { latitude: 51.1694, longitude: 71.4491 },
  almaty: { latitude: 43.222, longitude: 76.8512 },
  aktau: { latitude: 43.6352, longitude: 51.1478 },
};

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<"map" | "guides" | "places" | "tours">("map");
  const { user, loading } = useContext(AuthContext);
  const { t } = useTranslation();

  const cityName = user?.home_city || "Almaty";
  const { data: places = [], isLoading: placesLoading } = usePlaces({ city: cityName });
  const { data: guides = [], isLoading: guidesLoading } = useGuides(cityName);
  const { data: tours = [], isLoading: toursLoading } = useTours(cityName);
  const [tourSearch, setTourSearch] = useState("");
  const [tourSort, setTourSort] = useState<"new" | "price" | "popular">("new");
  const { data: savedIds = [] } = useSavedPlaces(user?.id || null);
  const toggleFav = useToggleSavedPlace(user?.id || "");

  const [selectedPlace, setSelectedPlace] = useState<DBPlace | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const bottomSheetRef = useRef<any>(null);
  const snapPoints = useMemo(() => ["35%"], []);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user]);

  const handleChangeCity = () => {
    router.replace({ pathname: "/auth/city-select", params: { new: "false" } });
  };

  const onMarkerPress = useCallback((place: DBPlace) => {
    setSelectedPlace(place);
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const openDetail = useCallback((place: DBPlace) => {
    bottomSheetRef.current?.close();
    const stop: TimelineStop = {
      id: place.id,
      title: place.title,
      time: "",
      imageUrl: place.image_url,
      safetyLevel: (place.safety_score || 90) >= 85 ? "safe" : "warning",
      safetyScore: place.safety_score,
      tags: place.tags,
      description: place.description,
      type: place.type,
      rating: place.rating,
      address: place.address,
      priceLevel: place.price_level,
      openingHours: place.opening_hours,
      contact: place.contact,
      reviewCount: place.reviews?.count || 0,
      verified: place.verified,
      latitude: place.latitude,
      longitude: place.longitude,
    };
    setSelectedPlace(place);
    setDetailVisible(true);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) =>
      BottomSheetBackdrop ? (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.25} />
      ) : null,
    [],
  );

  const cityCoord = CITY_COORDS[(cityName || "almaty").toLowerCase()] || CITY_COORDS.almaty;

  const TabButton = ({ label, tab }: { label: string; tab: typeof activeTab }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <LightScreen>
      <View style={styles.header}>
        <SplitTitle
          first={t("explore.titleFirst")}
          second={t("explore.titleSecond")}
          style={{ marginTop: 0 }}
          textStyle={{ fontSize: 24 }}
        />
        <TouchableOpacity style={styles.cityPill} onPress={handleChangeCity}>
          <Ionicons name="location" size={14} color="#2DD4BF" style={{ marginRight: 4 }} />
          <CaptionText style={{ color: "#475569", fontSize: 12 }}>{cityName}</CaptionText>
        </TouchableOpacity>

        <View style={styles.tabRow}>
          <TabButton label={t("explore.map") || "Карта"} tab="map" />
          <TabButton label="Tours" tab="tours" />
          <TabButton label={t("explore.allGuides")} tab="guides" />
          <TabButton label={t("explore.places")} tab="places" />
        </View>
      </View>

      {activeTab === "map" && (
        <View style={{ flex: 1 }}>
          <ErrorBoundary
            fallback={
              <View style={styles.mapFallback}>
                <Ionicons name="map-outline" size={48} color="#94A3B8" />
                <Text style={styles.mapFallbackText}>
                  Карта недоступна.{"\n"}Нужен development build для react-native-maps.
                </Text>
              </View>
            }
          >
            {isMapAvailable && MapView && Marker ? (
              <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{
                  ...cityCoord,
                  latitudeDelta: 0.12,
                  longitudeDelta: 0.12,
                }}
                showsUserLocation
                showsMyLocationButton
              >
                {places
                  .filter((p) => p.latitude && p.longitude)
                  .map((place) => (
                    <Marker
                      key={place.id}
                      coordinate={{ latitude: place.latitude!, longitude: place.longitude! }}
                      onPress={() => onMarkerPress(place)}
                    >
                      <View style={styles.marker}>
                        <View style={styles.markerInner}>
                          <Ionicons
                            name={markerIcon(place.type)}
                            size={14}
                            color="#2DD4BF"
                          />
                        </View>
                        <View style={styles.markerArrow} />
                      </View>
                    </Marker>
                  ))}
              </MapView>
            ) : (
              <View style={styles.mapFallback}>
                <Ionicons name="map-outline" size={48} color="#94A3B8" />
                <Text style={styles.mapFallbackText}>
                  {Platform.OS === "web"
                    ? "Карта доступна в мобильном приложении"
                    : "Загрузка карты..."}
                </Text>
              </View>
            )}
          </ErrorBoundary>

          {isBottomSheetAvailable && BottomSheet && BottomSheetView && selectedPlace && (
            <BottomSheet
              ref={bottomSheetRef}
              index={-1}
              snapPoints={snapPoints}
              enablePanDownToClose
              backdropComponent={renderBackdrop}
              backgroundStyle={styles.bottomSheetBg}
              handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
            >
              <BottomSheetView style={styles.sheetContent}>
                <View style={styles.sheetRow}>
                  {selectedPlace.image_url ? (
                    <Image source={{ uri: selectedPlace.image_url }} style={styles.sheetImage} />
                  ) : (
                    <View style={[styles.sheetImage, { backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }]}>
                      <Ionicons name="image-outline" size={24} color="#94A3B8" />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.sheetTitle} numberOfLines={1}>{selectedPlace.title}</Text>
                    <View style={styles.sheetMeta}>
                      {selectedPlace.rating != null && (
                        <View style={styles.chip}>
                          <Ionicons name="star" size={12} color="#FACC15" />
                          <Text style={styles.chipText}>{Number(selectedPlace.rating).toFixed(1)}</Text>
                        </View>
                      )}
                      <View style={[styles.chip, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
                        <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                        <Text style={[styles.chipText, { color: "#10B981" }]}>{selectedPlace.safety_score}%</Text>
                      </View>
                    </View>
                    <Text style={styles.sheetDesc} numberOfLines={2}>{selectedPlace.description}</Text>
                  </View>
                </View>

                <View style={styles.sheetTags}>
                  {selectedPlace.tags?.slice(0, 4).map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sheetActions}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => openDetail(selectedPlace)}
                  >
                    <Ionicons name="information-circle-outline" size={18} color="#FFF" />
                    <Text style={styles.detailButtonText}>Подробнее</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.favButton}
                    onPress={() =>
                      toggleFav.mutate({
                        placeId: selectedPlace.id,
                        isSaved: savedIds.includes(selectedPlace.id),
                      })
                    }
                  >
                    <Ionicons
                      name={savedIds.includes(selectedPlace.id) ? "heart" : "heart-outline"}
                      size={22}
                      color={savedIds.includes(selectedPlace.id) ? "#EF4444" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>
              </BottomSheetView>
            </BottomSheet>
          )}
        </View>
      )}

      {activeTab === "guides" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {guidesLoading ? (
            <ActivityIndicator size="large" color="#2DD4BF" style={{ marginTop: 40 }} />
          ) : guides.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Нет гидов для {cityName}</Text>
            </View>
          ) : (
            guides.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                onPress={() => router.push(`/guide/${guide.id}`)}
                activeOpacity={0.9}
                style={styles.cardWrapper}
              >
                <GlassCardOnLight style={styles.card}>
                  <View style={styles.guideCard}>
                    <Image source={{ uri: guide.hero_image_url }} style={styles.guideImage} resizeMode="cover" />
                    <View style={styles.guideOverlay}>
                      <View style={styles.guideInfoRow}>
                        <View>
                          <Text style={styles.guideName}>{guide.name.toUpperCase()}</Text>
                          <CaptionText style={styles.guideSpec}>{guide.specialties[0]}</CaptionText>
                        </View>
                        <Text style={styles.guidePrice}>
                          {guide.price_per_hour.toLocaleString()}{guide.currency}/hr
                        </Text>
                      </View>
                      <View style={styles.guideTagsRow}>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.guideTag}>
                            <CaptionText style={styles.guideTagText}>{tag.toUpperCase()}</CaptionText>
                          </View>
                        ))}
                      </View>
                      <TouchableOpacity
                        style={styles.chatButton}
                        onPress={() => router.push(`/guide/${guide.id}`)}
                      >
                        <Text style={styles.chatButtonText}>{t("explore.chatBook")}</Text>
                      </TouchableOpacity>
                    </View>
                    {guide.is_verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#2DD4BF" style={{ marginRight: 4 }} />
                        <Text style={styles.verifiedText}>{t("explore.verified")}</Text>
                      </View>
                    )}
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#FACC15" />
                      <Text style={styles.ratingText}>{guide.rating}</Text>
                    </View>
                  </View>
                </GlassCardOnLight>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === "places" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {placesLoading ? (
            <ActivityIndicator size="large" color="#2DD4BF" style={{ marginTop: 40 }} />
          ) : places.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>Нет мест для {cityName}</Text>
            </View>
          ) : (
            places.map((place) => {
              const isSaved = savedIds.includes(place.id);
              return (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.9}
                  style={styles.cardWrapper}
                  onPress={() => openDetail(place)}
                >
                  <GlassCardOnLight style={styles.card}>
                    <View style={styles.placeCard}>
                      <Image source={{ uri: place.image_url }} style={styles.placeImage} resizeMode="cover" />
                      <View style={styles.placeInfo}>
                        <View style={styles.placeNameRow}>
                          <BodyText style={styles.placeName} numberOfLines={1}>{place.title}</BodyText>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFav.mutate({ placeId: place.id, isSaved });
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Ionicons
                              name={isSaved ? "heart" : "heart-outline"}
                              size={20}
                              color={isSaved ? "#EF4444" : "#CBD5E1"}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.placeSafetyRow}>
                          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                          <CaptionText style={styles.placeSafetyText}>{place.safety_score}% safe</CaptionText>
                        </View>
                        <View style={styles.placeTagsRow}>
                          {place.tags?.slice(0, 2).map((tag) => (
                            <CaptionText key={tag} style={styles.placeTag}>#{tag}</CaptionText>
                          ))}
                        </View>
                      </View>
                    </View>
                  </GlassCardOnLight>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {activeTab === "tours" && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tourSearchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                value={tourSearch}
                onChangeText={setTourSearch}
                placeholder={t("search.searchTours")}
                placeholderTextColor="#94A3B8"
              />
              {tourSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTourSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.sortRow}>
            {(["new", "price", "popular"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.sortChip, tourSort === s && styles.sortChipActive]}
                onPress={() => setTourSort(s)}
              >
                <Text style={[styles.sortChipText, tourSort === s && styles.sortChipTextActive]}>
                  {s === "new" ? t("search.newest") : s === "price" ? t("search.price") : t("search.popular")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {toursLoading ? (
            <ActivityIndicator size="large" color="#FFBF00" style={{ marginTop: 40 }} />
          ) : (() => {
            let filtered = tours.filter((t) =>
              !tourSearch || t.title.toLowerCase().includes(tourSearch.toLowerCase()) ||
              t.city?.toLowerCase().includes(tourSearch.toLowerCase())
            );
            const ppPrice = (t: any) => t.partner_name ? t.price_per_person : (t.max_people > 0 ? t.price_per_person / t.max_people : t.price_per_person);
            if (tourSort === "price") filtered = [...filtered].sort((a, b) => ppPrice(a) - ppPrice(b));
            else if (tourSort === "popular") filtered = [...filtered].sort((a, b) => (b.participant_count || 0) - (a.participant_count || 0));
            return filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="ticket-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  {tourSearch ? `No tours matching "${tourSearch}"` : `No tours in ${cityName}`}
                </Text>
              </View>
            ) : (
              filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} onPress={() => router.push(`/tour/${tour.id}`)} />
              ))
            );
          })()}
        </ScrollView>
      )}

      <PlaceDetailModal
        visible={detailVisible}
        stop={
          selectedPlace
            ? {
                id: selectedPlace.id,
                title: selectedPlace.title,
                time: "",
                imageUrl: selectedPlace.image_url,
                safetyLevel: (selectedPlace.safety_score || 90) >= 85 ? "safe" : "warning",
                safetyScore: selectedPlace.safety_score,
                tags: selectedPlace.tags,
                description: selectedPlace.description,
                type: selectedPlace.type,
                rating: selectedPlace.rating,
                address: selectedPlace.address,
                priceLevel: selectedPlace.price_level,
                openingHours: selectedPlace.opening_hours,
                contact: selectedPlace.contact,
                verified: selectedPlace.verified,
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }
            : null
        }
        onClose={() => setDetailVisible(false)}
      />

      {!user && (
        <View style={styles.guestOverlay}>
          <View style={styles.guestContent}>
            <CaptionText style={{ color: "#0F172A", fontWeight: "600" }}>{t("explore.guestMessage")}</CaptionText>
            <Button style={styles.guestButton} labelStyle={{ color: "#0F172A", fontWeight: "600" }} onPress={() => router.push("/")}>
              {t("explore.logIn")}
            </Button>
          </View>
        </View>
      )}
    </LightScreen>
  );
}

function markerIcon(type?: string): any {
  switch ((type || "").toLowerCase()) {
    case "restaurant": case "food": return "restaurant";
    case "cafe": case "coffee": return "cafe";
    case "park": case "nature": return "leaf";
    case "museum": case "culture": return "book";
    case "shopping": return "bag-handle";
    case "sports": return "fitness";
    default: return "location";
  }
}

const styles = StyleSheet.create({
  header: { paddingTop: 24, paddingHorizontal: 24, paddingBottom: 12 },
  cityPill: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, alignSelf: "flex-start", marginTop: 4,
  },
  tabRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  tabButton: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  activeTab: { backgroundColor: "#0F172A" },
  tabText: { color: "#64748B", fontWeight: "600", fontSize: 13 },
  activeTabText: { color: "#FFF" },

  // Map
  mapFallback: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "#E2E8F0", margin: 24, borderRadius: 16,
  },
  mapFallbackText: { color: "#64748B", textAlign: "center", marginTop: 12, fontSize: 13, lineHeight: 20 },

  // Marker
  marker: { alignItems: "center" },
  markerInner: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#0F172A",
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#2DD4BF",
  },
  markerArrow: {
    width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#0F172A",
    marginTop: -1,
  },

  // Bottom sheet
  bottomSheetBg: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 20 },
  sheetRow: { flexDirection: "row", alignItems: "flex-start" },
  sheetImage: { width: 80, height: 80, borderRadius: 14 },
  sheetTitle: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#0F172A" },
  sheetMeta: { flexDirection: "row", gap: 8, marginTop: 6 },
  chip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 3,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  sheetDesc: { fontSize: 13, color: "#64748B", marginTop: 6, lineHeight: 18 },
  sheetTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tagPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, color: "#475569", fontWeight: "500" },
  sheetActions: { flexDirection: "row", alignItems: "center", marginTop: 16, gap: 10 },
  detailButton: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#2DD4BF", paddingVertical: 14, borderRadius: 16, gap: 8,
  },
  detailButtonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  favButton: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center",
  },

  // Tour search/sort
  tourSearchRow: { marginBottom: 10 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A" },
  sortRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  sortChipActive: { backgroundColor: "#0F172A" },
  sortChipText: { color: "#64748B", fontWeight: "600", fontSize: 12 },
  sortChipTextActive: { color: "#FFF" },

  // Shared card styles
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140 },
  cardWrapper: { marginBottom: 16 },
  card: { borderRadius: 20, overflow: "hidden", padding: 0 },
  empty: { alignItems: "center", marginTop: 60, gap: 12 },
  emptyText: { color: "#64748B", fontSize: 15 },

  // Guide cards
  guideCard: { height: 200, position: "relative" },
  guideImage: { width: "100%", height: "100%" },
  guideOverlay: {
    position: "absolute", left: 0, right: 0, bottom: 0, padding: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  guideInfoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  guideName: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#0F172A" },
  guideSpec: { color: "#64748B", marginTop: 2 },
  guidePrice: { color: "#2DD4BF", fontWeight: "700", fontSize: 16 },
  guideTagsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, gap: 6 },
  guideTag: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  guideTagText: { color: "#475569", fontSize: 11 },
  chatButton: {
    marginTop: 12, backgroundColor: "#2DD4BF", paddingVertical: 10, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  chatButtonText: { color: "#0F172A", fontWeight: "700", fontSize: 13 },
  verifiedBadge: {
    position: "absolute", top: 12, left: 12, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  verifiedText: { fontSize: 11, fontWeight: "600", color: "#0F172A" },
  ratingBadge: {
    position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  ratingText: { fontSize: 12, fontWeight: "600", color: "#0F172A", marginLeft: 4 },

  // Place cards
  placeCard: { height: 140, flexDirection: "row" },
  placeImage: { width: 140, height: 140 },
  placeInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
  placeNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  placeName: { fontWeight: "700", fontSize: 16, color: "#0F172A", flex: 1, marginRight: 8 },
  placeSafetyRow: { flexDirection: "row", alignItems: "center" },
  placeSafetyText: { marginLeft: 4, color: "#64748B" },
  placeTagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  placeTag: { color: "#64748B", fontSize: 11 },

  // Guest overlay
  guestOverlay: {
    position: "absolute", bottom: 60, left: 0, right: 0, zIndex: 10, padding: 20,
  },
  guestContent: {
    flexDirection: "column", alignItems: "center", padding: 20, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,1)", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", gap: 10,
  },
  guestButton: { width: "100%", backgroundColor: "#2DD4BF" },
});
