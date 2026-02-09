import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../../components/ui/LightScreen";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { SplitTitle } from "../../components/ui/SplitTitle";
import { BodyText, CaptionText } from "../../components/ui/ThemedText";
import { SAVED_TRIPS } from "../../constants/mockData";
import { AuthContext } from "@/context/authContext";

export default function TripsScreen() {
  const { user } = useContext(AuthContext);

  return (
    <LightScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <CaptionText style={styles.welcomeText}>WELCOME BACK</CaptionText>
            <BodyText style={styles.userName}>{user?.name || "Guest"}</BodyText>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          <SplitTitle first="MY " second="TRIPS" textStyle={styles.titleText} />
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabText}>Past</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabText}>Saved</Text>
          </TouchableOpacity>
        </View>

        {SAVED_TRIPS.length === 0 ? (
          <GlassCardOnLight style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" style={styles.emptyIcon} />
            <BodyText style={styles.emptyTitle}>No saved trips yet</BodyText>
            <CaptionText style={styles.emptySubtitle}>
              Create one from Home with the AI agent
            </CaptionText>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              style={styles.goHomeButton}
            >
              <Text style={styles.goHomeText}>Go to Home</Text>
            </TouchableOpacity>
          </GlassCardOnLight>
        ) : (
          <>
            <View style={styles.nextAdventureRow}>
              <CaptionText style={styles.nextAdventureText}>NEXT ADVENTURE</CaptionText>
              <Text style={styles.nextAdventureDate}>IN 2 DAYS</Text>
            </View>

            {SAVED_TRIPS.map((trip, idx) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => router.push("/timeline")}
                activeOpacity={0.9}
                style={styles.cardWrapper}
              >
                <GlassCardOnLight style={styles.tripCard}>
                  <View style={styles.tripCardContent}>
                    <Image
                      source={{ uri: trip.previewImageUrl }}
                      style={styles.tripImage}
                      resizeMode="cover"
                    />

                    <View style={styles.bookedBadge}>
                      <View style={styles.bookedIndicator} />
                      <Text style={styles.bookedText}>BOOKED</Text>
                    </View>

                    <View style={styles.tripOverlay}>
                      <View style={styles.tripDateRow}>
                        <Ionicons name="calendar-outline" size={14} color="#FFF" style={styles.calendarIcon} />
                        <CaptionText style={styles.tripDateText}>Feb 6, 19:00</CaptionText>
                      </View>

                      <Text style={styles.tripTitle}>{idx === 0 ? "DATE NIGHT" : trip.title}</Text>
                      <Text style={styles.tripCity}>{trip.cityName}</Text>

                      <TouchableOpacity style={styles.forwardButton}>
                        <Ionicons name="arrow-forward" size={22} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCardOnLight>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 4,
  },
  welcomeText: {
    color: "#64748B",
    marginBottom: 2,
  },
  userName: {
    fontWeight: "700",
    fontSize: 18,
    color: "#0F172A",
  },
  notificationButton: {
    marginLeft: "auto",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  titleText: {
    fontSize: 28,
  },
  tabRow: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  activeTab: {
    backgroundColor: "#0F172A",
  },
  activeTabText: {
    color: "#FFF",
  },
  emptyCard: {
    borderRadius: 24,
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: "center",
    color: "#0F172A",
  },
  emptySubtitle: {
    marginBottom: 20,
    textAlign: "center",
    color: "#64748B",
  },
  goHomeButton: {
    backgroundColor: "#2DD4BF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  goHomeText: {
    color: "#FFF",
    fontWeight: "700",
    textAlign: "center",
  },
  nextAdventureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  nextAdventureText: {
    color: "#64748B",
  },
  nextAdventureDate: {
    color: "#2DD4BF",
    fontWeight: "700",
    fontSize: 13,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  tripCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 0,
  },
  tripCardContent: {
    height: 180,
    position: "relative",
  },
  tripImage: {
    width: "100%",
    height: "100%",
  },
  bookedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
    marginRight: 6,
  },
  bookedText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  tripOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  tripDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  calendarIcon: {
    marginRight: 4,
  },
  tripDateText: {
    color: "rgba(255,255,255,0.95)",
  },
  tripTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 20,
  },
  tripCity: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
  },
  forwardButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
