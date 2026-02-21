import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText, CaptionText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import { useTranslation } from "react-i18next";
import { useMyTrips } from "@/hooks/useTrips";

export const ExploreTab = () => {
  const { t } = useTranslation();
  const { user } = React.useContext(AuthContext);
  const { data: trips = [], isLoading } = useMyTrips(user?.id || null);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#2DD4BF" style={{ marginTop: 40 }} />;
  }

  if (trips.length === 0) {
    return (
      <GlassCardOnLight style={styles.emptyCard}>
        <Ionicons name="calendar-outline" size={48} color="#94A3B8" style={styles.emptyIcon} />
        <BodyText style={styles.emptyTitle}>{t("trips.noSavedTrips")}</BodyText>
        <CaptionText style={styles.emptySubtitle}>{t("trips.createFromHome")}</CaptionText>
        <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.goHomeButton}>
          <Text style={styles.goHomeText}>{t("trips.goHome")}</Text>
        </TouchableOpacity>
      </GlassCardOnLight>
    );
  }

  return (
    <>
      <View style={styles.countRow}>
        <CaptionText style={styles.countText}>
          {trips.length} {trips.length === 1 ? "маршрут" : "маршрутов"} сохранено
        </CaptionText>
      </View>
      {trips.map((trip) => (
        <TouchableOpacity key={trip.id} activeOpacity={0.9} style={styles.cardWrapper}>
          <GlassCardOnLight style={styles.tripCard}>
            <View style={styles.tripCardContent}>
              {trip.preview_image_url ? (
                <Image source={{ uri: trip.preview_image_url }} style={styles.tripImage} resizeMode="cover" />
              ) : (
                <View style={[styles.tripImage, { backgroundColor: "#E2E8F0", alignItems: "center", justifyContent: "center" }]}>
                  <Ionicons name="map-outline" size={32} color="#94A3B8" />
                </View>
              )}
              <View style={styles.tripOverlay}>
                <View style={styles.tripDateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                  <CaptionText style={styles.tripDateText}>
                    {new Date(trip.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                  </CaptionText>
                </View>
                <Text style={styles.tripTitle} numberOfLines={1}>{trip.title}</Text>
                <Text style={styles.tripCity}>{trip.city}</Text>
                <View style={styles.forwardButton}>
                  <Ionicons name="arrow-forward" size={22} color="#0F172A" />
                </View>
              </View>
            </View>
          </GlassCardOnLight>
        </TouchableOpacity>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  emptyCard: { borderRadius: 24, alignItems: "center", paddingVertical: 48 },
  emptyIcon: { alignSelf: "center", marginBottom: 16 },
  emptyTitle: { marginBottom: 8, textAlign: "center", color: "#0F172A" },
  emptySubtitle: { marginBottom: 20, textAlign: "center", color: "#64748B" },
  goHomeButton: { backgroundColor: "#2DD4BF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  goHomeText: { color: "#FFF", fontWeight: "700", textAlign: "center" },
  countRow: { marginBottom: 12 },
  countText: { color: "#64748B" },
  cardWrapper: { marginBottom: 20 },
  tripCard: { borderRadius: 24, overflow: "hidden", padding: 0 },
  tripCardContent: { height: 180, position: "relative" },
  tripImage: { width: "100%", height: "100%" },
  tripOverlay: {
    position: "absolute", left: 0, right: 0, bottom: 0, padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tripDateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  tripDateText: { color: "rgba(255,255,255,0.95)" },
  tripTitle: { color: "#FFF", fontWeight: "700", fontSize: 20 },
  tripCity: { color: "rgba(255,255,255,0.9)", fontSize: 16 },
  forwardButton: {
    position: "absolute", bottom: 16, right: 16, width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFF", alignItems: "center", justifyContent: "center",
  },
});
