import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { BodyText, CaptionText } from "../../components/ui/ThemedText";
import { useGuideDetails } from "@/hooks/useGuides";

export default function GuideProfileScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: guide, isLoading } = useGuideDetails(id || null);

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#2DD4BF" />
      </View>
    );
  }

  if (!guide) {
    return (
      <View style={styles.notFoundScreen}>
        <Ionicons name="person-outline" size={48} color="#94A3B8" />
        <Text style={styles.notFoundText}>{t("guide.notFound")}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{t("guide.back")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${guide.whatsapp_number.replace(/\D/g, "")}`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: guide.hero_image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <BlurView intensity={50} tint="dark" style={styles.heroBlur} />
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.heroBackButton}
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.heroBottomRow}>
              <Image
                source={{ uri: guide.avatar_url }}
                style={styles.avatar}
              />
              <View style={styles.heroInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.namePrimary}>
                    {guide.name.split(" ")[0]}
                  </Text>

                  {guide.is_verified && (
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>VERIFIED</Text>
                    </View>
                  )}
                </View>

                <View style={styles.locationRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                    style={styles.locationIcon}
                  />
                  <CaptionText style={styles.locationText}>
                    {guide.city}, Kazakhstan • {guide.specialties[0]}
                  </CaptionText>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsWrapper}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {guide.tours_completed}
              </Text>
              <CaptionText style={styles.statLabel}>
                {t("guide.tours")}
              </CaptionText>
            </View>

            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Text style={styles.statValue}>{guide.rating}</Text>
                <Ionicons
                  name="star"
                  size={18}
                  color="#FACC15"
                  style={styles.starIcon}
                />
              </View>
              <CaptionText style={styles.statLabel}>
                {t("guide.rating")}
              </CaptionText>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {guide.experience_years}y
              </Text>
              <CaptionText style={styles.statLabel}>EXP</CaptionText>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>
              {t("guide.aboutMe")}
            </Text>
          </View>

          <GlassCardOnLight style={styles.aboutCard}>
            <BodyText style={styles.bioText}>{guide.bio}</BodyText>
          </GlassCardOnLight>

          <View style={styles.tagsContainer}>
            {guide.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>
                  #{tag.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <View
                style={[styles.sectionAccent, styles.goldAccent]}
              />
              <Text style={styles.sectionTitle}>
                {t("guide.signatureTours")}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {guide.tour_packages.map((pkg) => (
              <GlassCardOnLight
                key={pkg.id}
                style={styles.tourCard}
              >
                <BodyText style={styles.tourTitle}>
                  {pkg.title}
                </BodyText>
                <CaptionText style={styles.tourMeta}>
                  {pkg.duration} ·{" "}
                  {pkg.price.toLocaleString()}
                  {pkg.currency}
                </CaptionText>
                <CaptionText
                  style={styles.tourDescription}
                  numberOfLines={2}
                >
                  {pkg.description}
                </CaptionText>
              </GlassCardOnLight>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={openWhatsApp}
            style={styles.contactButton}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color="#0F172A"
              style={styles.chatIcon}
            />
            <Text style={styles.contactButtonText}>
              {t("guide.contactBook")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centeredScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundScreen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  notFoundText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 16,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#2DD4BF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    height: 280,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 24,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    paddingBottom: 24,
  },
  heroBackButton: {
    position: "absolute",
    top: 56,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  heroInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  namePrimary: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 24,
    color: "#FFF",
    marginRight: 4,
  },
  nameAccent: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 24,
    color: "#2DD4BF",
  },
  verifiedBadge: {
    marginLeft: 8,
    backgroundColor: "#FACC15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 10,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    color: "rgba(255,255,255,0.95)",
  },
  statsWrapper: {
    padding: 24,
  },
  statsCard: {
    flexDirection: "row",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#rgba(0,0,0,0.2)"
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statItemWithBorder: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.06)",
  },
  statValue: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#0F172A",
  },
  statLabel: {
    color: "#64748B",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#2DD4BF",
    marginRight: 10,
  },
  goldAccent: {
    backgroundColor: "#FACC15",
  },
  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: "#0F172A",
  },
  aboutCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  bioText: {
    lineHeight: 24,
    color: "#475569",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 12,
  },
  horizontalScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  tourCard: {
    width: 200,
    borderRadius: 16,
    padding: 14,
  },
  tourTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#0F172A",
  },
  tourMeta: {
    marginBottom: 6,
    color: "#64748B",
  },
  tourDescription: {
    fontSize: 12,
    color: "#94A3B8",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2DD4BF",
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 28,
  },
  chatIcon: {
    marginRight: 10,
  },
  contactButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
  },
});
