import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { LightScreen } from "../components/ui/LightScreen";
import { GlassCardOnLight } from "../components/ui/GlassCard";
import { BodyText, CaptionText } from "../components/ui/ThemedText";
import { ALMATY_ITINERARY } from "../constants/mockData";

const safetyColor = (level: string) => {
  switch (level) {
    case "safe":
      return "#10B981";
    case "warning":
      return "#F59E0B";
    case "danger":
      return "#EF4444";
    default:
      return "#10B981";
  }
};

export default function TimelineScreen() {
  const { t } = useTranslation(); // Добавьте
  const itinerary = ALMATY_ITINERARY;
  const guideWhatsApp = "77001234567";

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      t('timeline.bookMessage', { title: itinerary.title })
    );
    Linking.openURL(`https://wa.me/${guideWhatsApp}?text=${message}`);
  };

  return (
    <LightScreen>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.safetyBanner}>
          <View style={styles.safetyDot} />
          <CaptionText style={styles.safetyText}>{t('timeline.analyzingSafety')}</CaptionText>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <Text style={styles.title}>{t('timeline.yourNight')}</Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.title}>{t('timeline.in')} </Text>
          <Text style={styles.highlight}>Almaty</Text>
        </View>

        <View style={styles.summaryCards}>
          <GlassCardOnLight style={styles.summaryCard}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" style={styles.icon} />
            <CaptionText style={styles.cardText}>
              {itinerary.totalSafetyScore}% {t('timeline.safe')}
            </CaptionText>
          </GlassCardOnLight>

          <GlassCardOnLight style={styles.summaryCard}>
            <Ionicons name="time-outline" size={18} color="#2DD4BF" style={styles.icon} />
            <CaptionText style={styles.cardText}>{itinerary.totalDuration}</CaptionText>
          </GlassCardOnLight>

          <GlassCardOnLight style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={18} color="#FACC15" style={styles.icon} />
            <CaptionText style={styles.cardText} numberOfLines={1}>
              {itinerary.estimatedCost}
            </CaptionText>
          </GlassCardOnLight>
        </View>

        <View style={styles.stopsContainer}>
          {itinerary.stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopRow}>
              <View style={styles.timelineColumn}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: safetyColor(stop.safetyLevel) },
                  ]}
                />
                {index < itinerary.stops.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.stopContent}>
                <GlassCardOnLight style={styles.stopCard}>
                  <View style={styles.stopCardContent}>
                    <View style={styles.stopHeader}>
                      <Text style={styles.stopTime}>{stop.time}</Text>
                      <View style={styles.safeBadge}>
                        <Text style={styles.safeBadgeText}>{t('timeline.safeZone')}</Text>
                      </View>
                    </View>

                    <BodyText style={styles.stopTitle}>{stop.title}</BodyText>
                    <CaptionText style={styles.stopDescription}>
                      {stop.title.includes("Meeting")
                        ? t('timeline.meetingPoint')
                        : t('timeline.nextStop')}
                    </CaptionText>

                    <View style={styles.stopImageWrapper}>
                      <Image
                        source={{ uri: stop.imageUrl }}
                        style={styles.stopImage}
                        resizeMode="cover"
                      />
                      <View style={styles.visibilityOverlay}>
                        <Ionicons name="eye-outline" size={12} color="#FFF" style={styles.iconSmall} />
                        <Text style={styles.visibilityText}>{t('timeline.highVisibility')}</Text>
                      </View>
                    </View>

                    <View style={styles.walkInfo}>
                      <Ionicons name="walk-outline" size={14} color="#64748B" style={styles.iconSmall} />
                      <CaptionText style={styles.walkText}>
                        {t('timeline.walk')}: 15 {t('timeline.min')} • {t('timeline.flatTerrain')}
                      </CaptionText>
                    </View>
                  </View>
                </GlassCardOnLight>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={openWhatsApp}>
          <Text style={styles.bookText}>{t('timeline.bookEverything')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#0F172A" />
        </TouchableOpacity>
      </ScrollView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  safetyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(167, 139, 250, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  safetyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A78BFA",
    marginRight: 6,
  },
  safetyText: {
    color: "#6D28D9",
    fontWeight: "600",
    fontSize: 12,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#0F172A",
    marginBottom: 0,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  highlight: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#2DD4BF",
  },
  summaryCards: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  cardText: {
    color: "#64748B",
    fontSize: 12,
  },
  stopsContainer: {
    marginLeft: 12,
  },
  stopRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  timelineColumn: {
    alignItems: "center",
    width: 32,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#F8FAFC",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#A78BFA",
    marginVertical: 4,
    minHeight: 40,
    opacity: 0.5,
  },
  stopContent: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 24,
  },
  stopCard: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
  },
  stopCardContent: {
    padding: 14,
  },
  stopHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  stopTime: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  safeBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  safeBadgeText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 10,
  },
  stopTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 4,
  },
  stopDescription: {
    color: "#64748B",
    marginBottom: 10,
  },
  stopImageWrapper: {
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
  },
  stopImage: {
    width: "100%",
    height: "100%",
  },
  visibilityOverlay: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  iconSmall: {
    marginRight: 4,
  },
  visibilityText: {
    color: "#FFF",
    fontSize: 11,
  },
  walkInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  walkText: {
    color: "#64748B",
  },
  bookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2DD4BF",
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  bookText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
});