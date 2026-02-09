import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../../components/ui/LightScreen";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { SplitTitle } from "../../components/ui/SplitTitle";
import { BodyText, CaptionText } from "../../components/ui/ThemedText";
import { GUIDES, PLACES } from "../../constants/mockData";
import { AuthContext } from "@/context/authContext";

const { width } = Dimensions.get("window");

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<"guides" | "places">("guides");
  const { user } = useContext(AuthContext);

  return (
    <LightScreen>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <SplitTitle
            first="EXPLORE "
            second="GUIDES"
            style={styles.splitTitle}
            textStyle={styles.splitTitleText}
          />
        </View>

        <View style={styles.cityContainer}>
          <Ionicons name="location" size={14} color="#2DD4BF" style={styles.cityIcon} />
          <CaptionText style={styles.cityText}>
            {user?.home_city || "Unknown"}
          </CaptionText>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("guides")}
            style={[styles.tabButton, activeTab === "guides" && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === "guides" && styles.activeTabText]}>
              ALL GUIDES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("places")}
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>PLACES</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapGrid}>
            {[...Array(24)].map((_, i) => (
              <View key={i} style={styles.gridCell} />
            ))}
          </View>
          <View style={styles.mapMarkerBlue} />
          <View style={styles.mapMarkerYellow} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeTab === "guides" &&
            GUIDES.map((guide) => (
              <TouchableOpacity
                key={guide.id}
                onPress={() => router.push(`/guide/${guide.id}`)}
                activeOpacity={0.9}
                style={styles.cardWrapper}
              >
                <GlassCardOnLight style={styles.card}>
                  <View style={styles.guideCard}>
                    <Image
                      source={{ uri: guide.heroImageUrl }}
                      style={styles.guideImage}
                      resizeMode="cover"
                    />

                    <View style={styles.guideOverlay}>
                      <View style={styles.guideInfoRow}>
                        <View>
                          <Text style={styles.guideName}>{guide.name.toUpperCase()}</Text>
                          <CaptionText style={styles.guideSpecialty}>
                            {guide.specialties[0]}
                          </CaptionText>
                        </View>
                        <Text style={styles.guidePrice}>
                          {guide.pricePerHour.toLocaleString()}
                          {guide.currency}/hr
                        </Text>
                      </View>

                      <View style={styles.guideTagsRow}>
                        {guide.tags.slice(0, 3).map((tag) => (
                          <View key={tag} style={styles.tag}>
                            <CaptionText style={styles.tagText}>{tag.toUpperCase()}</CaptionText>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity style={styles.chatButton}>
                        <Text style={styles.chatButtonText}>CHAT / BOOK →</Text>
                      </TouchableOpacity>
                    </View>

                    {guide.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#2DD4BF"
                          style={styles.verifiedIcon}
                        />
                        <Text style={styles.verifiedText}>VERIFIED</Text>
                      </View>
                    )}

                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#FACC15" />
                      <Text style={styles.ratingText}>{guide.rating}</Text>
                    </View>
                  </View>
                </GlassCardOnLight>
              </TouchableOpacity>
            ))}

          {activeTab === "places" &&
            PLACES.map((place) => (
              <TouchableOpacity key={place.id} activeOpacity={0.9} style={styles.cardWrapper}>
                <GlassCardOnLight style={styles.card}>
                  <View style={styles.placeCard}>
                    <Image
                      source={{ uri: place.imageUrl }}
                      style={styles.placeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.placeInfo}>
                      <BodyText style={styles.placeName}>{place.name}</BodyText>

                      <View style={styles.placeSafetyRow}>
                        <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                        <CaptionText style={styles.placeSafetyText}>
                          {place.safetyScore}% safe
                        </CaptionText>
                      </View>

                      <View style={styles.placeTagsRow}>
                        {place.tags.slice(0, 2).map((tag) => (
                          <CaptionText key={tag} style={styles.placeTag}>
                            #{tag}
                          </CaptionText>
                        ))}
                      </View>
                    </View>
                  </View>
                </GlassCardOnLight>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  splitTitle: {
    marginTop: 0,
  },
  splitTitleText: {
    fontSize: 24,
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cityIcon: {
    marginRight: 4,
  },
  cityText: {
    color: "#475569",
    fontSize: 12,
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  activeTab: {
    backgroundColor: "#0F172A",
  },
  tabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 13,
  },
  activeTabText: {
    color: "#FFF",
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  mapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 8,
    gap: 6,
  },
  gridCell: {
    width: (width - 48 - 48) / 6,
    height: 20,
    backgroundColor: "#CBD5E1",
    borderRadius: 4,
    opacity: 0.6,
  },
  mapMarkerBlue: {
    position: "absolute",
    top: 30,
    left: 40,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2DD4BF",
  },
  mapMarkerYellow: {
    position: "absolute",
    top: 70,
    left: 100,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FACC15",
  },
  scrollContent: {
    paddingBottom: 140,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
  },
  guideCard: {
    height: 200,
    position: "relative",
  },
  guideImage: {
    width: "100%",
    height: "100%",
  },
  guideOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  guideInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guideName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  guideSpecialty: {
    color: "#64748B",
    marginTop: 2,
  },
  guidePrice: {
    color: "#2DD4BF",
    fontWeight: "700",
    fontSize: 16,
  },
  guideTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    color: "#475569",
    fontSize: 11,
  },
  chatButton: {
    marginTop: 12,
    backgroundColor: "#2DD4BF",
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chatButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 13,
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedIcon: {
    marginRight: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0F172A",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 4,
  },
  placeCard: {
    height: 140,
    flexDirection: "row",
  },
  placeImage: {
    width: 140,
    height: 140,
  },
  placeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  placeName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0F172A",
  },
  placeSafetyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeSafetyText: {
    marginLeft: 4,
    color: "#64748B",
  },
  placeTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  placeTag: {
    color: "#64748B",
    fontSize: 11,
  },
});
