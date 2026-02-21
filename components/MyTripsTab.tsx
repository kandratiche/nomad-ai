import React from "react";
import { Text, TouchableOpacity, StyleSheet, View, Image, ActivityIndicator, Alert, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText, CaptionText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import { useTranslation } from "react-i18next";
import { Menu } from "react-native-paper";
import { useMyTrips, useDeleteTrip } from "@/hooks/useTrips";

export const MyTripsTab = () => {
  const { t } = useTranslation();
  const { user } = React.useContext(AuthContext);
  const [period, setPeriod] = React.useState<"past" | "future">("past");
  const [menuVisible, setMenuVisible] = React.useState(false);

  const { data: trips = [], isLoading } = useMyTrips(user?.id || null);
  const deleteMutation = useDeleteTrip();

  const now = new Date();
  const pastTrips = trips.filter((t) => !t.scheduled_at || new Date(t.scheduled_at) < now);
  const futureTrips = trips.filter((t) => t.scheduled_at && new Date(t.scheduled_at) >= now);
  const displayTrips = period === "past" ? pastTrips : futureTrips;

  const handleDelete = (id: string) => {
    const doDelete = () => deleteMutation.mutate(id);
    if (Platform.OS === "web") {
      if (confirm("Удалить поездку?")) doDelete();
    } else {
      Alert.alert("Удалить?", "Эта поездка будет удалена.", [
        { text: "Отмена", style: "cancel" },
        { text: "Удалить", style: "destructive", onPress: doDelete },
      ]);
    }
  };

  return (
    <View>
      <View style={styles.dropdownWrapper}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchorPosition="bottom"
          contentStyle={styles.menuContent}
          anchor={
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setMenuVisible(true)} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{period === "past" ? "Past Trips" : "Future Trips"}</Text>
              <Ionicons name={menuVisible ? "chevron-up" : "chevron-down"} size={18} color="#0F172A" />
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={() => { setPeriod("future"); setMenuVisible(false); }} title="Future Trips" titleStyle={styles.menuItemText} />
          <Menu.Item onPress={() => { setPeriod("past"); setMenuVisible(false); }} title="Past Trips" titleStyle={styles.menuItemText} />
        </Menu>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2DD4BF" style={{ marginTop: 40 }} />
      ) : displayTrips.length === 0 ? (
        <GlassCardOnLight style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
          <BodyText style={styles.emptyTitle}>
            {period === "past" ? t("trips.noPastTrips") : "Нет запланированных поездок"}
          </BodyText>
          <CaptionText style={styles.emptySubtitle}>{t("trips.createFromHome")}</CaptionText>
          <TouchableOpacity onPress={() => router.push("/(tabs)")} style={styles.goHomeButton}>
            <Text style={styles.goHomeText}>{t("trips.goHome")}</Text>
          </TouchableOpacity>
        </GlassCardOnLight>
      ) : (
        displayTrips.map((trip) => (
          <TouchableOpacity key={trip.id} activeOpacity={0.9} style={styles.cardWrapper}>
            <GlassCardOnLight style={styles.tripCard}>
              <View style={styles.tripContent}>
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
                    <CaptionText style={{ color: "rgba(255,255,255,0.95)" }}>
                      {new Date(trip.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </CaptionText>
                  </View>
                  <Text style={styles.tripTitle} numberOfLines={1}>{trip.title}</Text>
                  <Text style={styles.tripCity}>{trip.city}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(trip.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </GlassCardOnLight>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownWrapper: { alignItems: "flex-end", marginBottom: 20 },
  dropdownTrigger: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#F1F5F9", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, minWidth: 160,
  },
  dropdownText: { fontWeight: "600", fontSize: 14, color: "#0F172A" },
  menuContent: { borderRadius: 16, backgroundColor: "#FFFFFF", marginTop: 4, width: 160 },
  menuItemText: { fontSize: 14, fontWeight: "500", color: "#334155" },
  emptyCard: { borderRadius: 24, alignItems: "center", paddingVertical: 48 },
  emptyTitle: { marginBottom: 8, textAlign: "center", color: "#0F172A" },
  emptySubtitle: { marginBottom: 20, textAlign: "center", color: "#64748B" },
  goHomeButton: { backgroundColor: "#2DD4BF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  goHomeText: { color: "#FFF", fontWeight: "700", textAlign: "center" },
  cardWrapper: { marginBottom: 16 },
  tripCard: { borderRadius: 24, overflow: "hidden", padding: 0 },
  tripContent: { height: 180, position: "relative" },
  tripImage: { width: "100%", height: "100%" },
  tripOverlay: {
    position: "absolute", left: 0, right: 0, bottom: 0, padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tripDateRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  tripTitle: { color: "#FFF", fontWeight: "700", fontSize: 20 },
  tripCity: { color: "rgba(255,255,255,0.9)", fontSize: 16 },
  deleteButton: {
    position: "absolute", top: 12, right: 12, width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center",
  },
});
