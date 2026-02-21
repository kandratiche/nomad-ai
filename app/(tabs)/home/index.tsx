import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { SafetyButton } from "@/components/SafetyButton";
import { BodyText, HeadingText, CaptionText } from "@/components/ui/ThemedText";
import { TRENDING_EXPERIENCES } from "../../../constants/mockData";
import { AuthContext } from "@/context/authContext";
import { Button } from "react-native-paper";
import i18n from "@/app/i18n";
import { useTranslation } from "react-i18next";
import { generateAIResponse, replaceOption, getCachedPlaces } from "@/lib/ai";
import { getUserLocation, formatDistance, type UserLocation } from "@/lib/location";
import PlaceDetailModal from "@/components/PlaceDetailModal";
import RouteMapModal from "@/components/RouteMapModal";
import type { TimelineStop, AIResponse, StructuredSection, SectionOption, ConfidenceLevel } from "@/types";
import { useSaveTrip } from "@/hooks/useTrips";

const QUICK_ACTIONS = [
  { id: "coffee", icon: "cafe", prompt: "хочу кофе", labelKey: "home.quickActionCoffee" },
  { id: "food", icon: "restaurant", prompt: "хочу поесть", labelKey: "home.quickActionFood" },
  { id: "views", icon: "eye", prompt: "красивые виды", labelKey: "home.quickActionViews" },
  { id: "culture", icon: "book", prompt: "культурный тур по городу", labelKey: "home.quickActionCulture" },
  { id: "nature", icon: "leaf", prompt: "прогулка на природе", labelKey: "home.quickActionNature" },
  { id: "evening", icon: "moon", prompt: "план на вечер, поужинать и куда-нибудь сходить", labelKey: "home.quickActionEvening" },
  { id: "business", icon: "briefcase", prompt: "свободен вечером в командировке, поужинать спокойно", labelKey: "home.quickActionBusiness" },
  { id: "budget", icon: "wallet", prompt: "что-то классное и недорогое", labelKey: "home.quickActionBudget" },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedStop, setSelectedStop] = useState<TimelineStop | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [routeMapVisible, setRouteMapVisible] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const scrollRef = useRef<ScrollView>(null);
  const saveTripMutation = useSaveTrip();

  const openDetail = (stop: TimelineStop) => {
    setSelectedStop(stop);
    setDetailVisible(true);
  };

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user]);

  useEffect(() => {
    getUserLocation().then(setUserLocation).catch(() => {});
  }, []);

  const callAI = async (prompt: string) => {
    const city = user?.home_city || "Almaty";
    const interests = user?.interests || [];
    setIsThinking(true);
    setIsChatting(false);
    setAiResponse(null);
    setErrorMsg(null);

    try {
      const result = await generateAIResponse({ prompt, city, interests, userLocation });
      setAiResponse(result);
      setIsChatting(true);
    } catch (err: any) {
      console.error("AI Error:", err);
      const msg = err?.message || "Something went wrong";
      setErrorMsg(msg);
      if (Platform.OS === "web") {
        alert(t("home.aiError") + ": " + msg);
      } else {
        Alert.alert(t("home.aiError"), msg);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    callAI(input.trim());
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    callAI(prompt);
  };

  const handleChangeCity = () => {
    router.replace({ pathname: "/auth/city-select", params: { new: "false" } });
  };

  const handleEndChat = () => {
    setIsChatting(false);
    setAiResponse(null);
    setInput("");
  };


  const handleReplace = (sectionIdx: number, optionIdx: number) => {
    if (!aiResponse) return;
    const places = getCachedPlaces();
    const updated = replaceOption(aiResponse, sectionIdx, optionIdx, places, userLocation);
    setAiResponse(updated);
  };


  const getRouteStops = (resp: AIResponse): TimelineStop[] => {
    return resp.sections
      .map(s => s.options[0]?.place)
      .filter(Boolean);
  };


  const safetyColor = (level: string) => {
    switch (level) {
      case "safe": return "#10B981";
      case "warning": return "#F59E0B";
      case "danger": return "#EF4444";
      default: return "#10B981";
    }
  };

  const handleEvents = () => {
    router.push("/explore");
  };


  const renderStructuredResponse = (resp: AIResponse) => (
    <View style={styles.chatContainer}>
      <Text style={styles.responseTitle}>{resp.title}</Text>

      {resp.sections.map((section, sIdx) => (
        <View key={`section-${sIdx}`} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionEmojiCircle}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.timeRange ? (
                <Text style={styles.sectionTime}>{section.timeRange}</Text>
              ) : null}
            </View>
          </View>

          {section.options.length === 0 && (
            <View style={styles.markerDivider}>
              <View style={styles.markerLine} />
            </View>
          )}

          {section.options.map((opt, oIdx) => (
            <View key={opt.place.id} style={styles.optionCard}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openDetail(opt.place)}
                style={styles.optionTouchable}
              >
                <View style={styles.optionNumberBadge}>
                  <Text style={styles.optionNumberText}>{oIdx + 1}</Text>
                </View>

                {/* Image thumbnail */}
                {opt.place.imageUrl ? (
                  <Image
                    source={{ uri: opt.place.imageUrl }}
                    style={styles.optionImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.optionImage, styles.optionImagePlaceholder]}>
                    <Ionicons name="image-outline" size={20} color="#CBD5E1" />
                  </View>
                )}

                <View style={styles.optionBody}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionTitle} numberOfLines={1}>{opt.place.title}</Text>
                    {opt.place.verified && (
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    )}
                  </View>

                  <View style={styles.whyRow}>
                    <Text style={styles.optionWhy} numberOfLines={2}>{opt.why}</Text>
                    {opt.confidenceLevel && (
                      <View style={[
                        styles.confidenceBadge,
                        opt.confidenceLevel === "verified" && styles.confidenceVerified,
                        opt.confidenceLevel === "ai_generated" && styles.confidenceAI,
                        opt.confidenceLevel === "low_confidence" && styles.confidenceLow,
                      ]}>
                        <Ionicons
                          name={
                            opt.confidenceLevel === "verified" ? "checkmark-circle" :
                            opt.confidenceLevel === "ai_generated" ? "sparkles" : "alert-circle"
                          }
                          size={10}
                          color={
                            opt.confidenceLevel === "verified" ? "#059669" :
                            opt.confidenceLevel === "ai_generated" ? "#D97706" : "#EA580C"
                          }
                        />
                        <Text style={[
                          styles.confidenceText,
                          opt.confidenceLevel === "verified" && { color: "#059669" },
                          opt.confidenceLevel === "ai_generated" && { color: "#D97706" },
                          opt.confidenceLevel === "low_confidence" && { color: "#EA580C" },
                        ]}>
                          {opt.confidenceLevel === "verified" ? t("home.confidenceVerified") :
                           opt.confidenceLevel === "ai_generated" ? "AI" : t("home.confidenceCheck")}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.optionMeta}>
                    {opt.budgetHint ? (
                      <View style={styles.optionChip}>
                        <Text style={styles.optionBudgetText}>{opt.budgetHint}</Text>
                      </View>
                    ) : null}
                    {opt.place.rating != null && opt.place.rating > 0 ? (
                      <View style={styles.optionChip}>
                        <Ionicons name="star" size={10} color="#FACC15" />
                        <Text style={styles.optionChipText}>{opt.place.rating.toFixed(1)}</Text>
                      </View>
                    ) : null}
                    {opt.place.distanceKm != null ? (
                      <View style={styles.optionChip}>
                        <Ionicons name="navigate-outline" size={10} color="#A78BFA" />
                        <Text style={styles.optionChipText}>{formatDistance(opt.place.distanceKm)}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.optionChip, { backgroundColor: safetyColor(opt.place.safetyLevel) + "18" }]}>
                      <Ionicons name="shield-checkmark" size={10} color={safetyColor(opt.place.safetyLevel)} />
                      <Text style={[styles.optionChipText, { color: safetyColor(opt.place.safetyLevel) }]}>
                        {opt.place.safetyScore}%
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleReplace(sIdx, oIdx)}
                style={styles.replaceButton}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="refresh-outline" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity
        style={styles.showRouteButton}
        onPress={() => setRouteMapVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="map" size={20} color="#FFF" />
        <Text style={styles.showRouteButtonText}>{t("home.showRoute")}</Text>
      </TouchableOpacity>

      {user?.id && (
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={() => {
            const allStops = resp.sections.flatMap((s) => s.options.map((o) => o.place));
            saveTripMutation.mutate({
              userId: user.id,
              title: resp.title,
              city: user.home_city || "Almaty",
              routeJson: resp,
              previewImageUrl: allStops[0]?.imageUrl || "",
              totalSafetyScore: Math.round(allStops.reduce((s, p) => s + p.safetyScore, 0) / (allStops.length || 1)),
            });
          }}
        >
          <Ionicons
            name={saveTripMutation.isSuccess ? "checkmark-circle" : "bookmark-outline"}
            size={20}
            color={saveTripMutation.isSuccess ? "#10B981" : "#FFF"}
          />
          <Text style={styles.saveButtonText}>
            {saveTripMutation.isPending ? t("home.saveRouteSaving") : saveTripMutation.isSuccess ? t("home.saveRouteSaved") : t("home.saveRoute")}
          </Text>
        </TouchableOpacity>
      )}

      {user?.roles === "guide" && (
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: "rgba(255,191,0,0.15)", borderColor: "rgba(255,191,0,0.3)", borderWidth: 1 }]}
          activeOpacity={0.85}
          onPress={() => {
            const allStops = resp.sections.flatMap((s) => s.options.map((o) => o.place));
            const descParts = resp.sections.map((s) => `${s.emoji} ${s.title}: ${s.options.map((o) => o.place.title).join(", ")}`);
            const tags = resp.sections.flatMap((s) => s.options.map((o) => o.place.title.split(/\s+/)[0].toLowerCase())).slice(0, 5);
            router.push({
              pathname: "/create-tour",
              params: {
                prefillTitle: resp.title,
                prefillDescription: descParts.join("\n"),
                prefillCity: user.home_city || "Almaty",
                prefillTags: JSON.stringify(tags),
              },
            });
          }}
        >
          <Ionicons name="megaphone-outline" size={20} color="#FFBF00" />
          <Text style={[styles.saveButtonText, { color: "#FFBF00" }]}>{t("home.publishAsTour")}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.newSearchButton} onPress={handleEndChat} activeOpacity={0.85}>
        <Text style={styles.newSearchButtonText}>{t("home.newSearch")}</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LightScreen>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/profile")}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#2DD4BF" />
            </View>
            <View style={styles.profileText}>
              <BodyText style={styles.profileName}>{user?.name || "Guest"}</BodyText>
              <CaptionText style={styles.profileStatus}>{i18n.t("home.profileOnline")}</CaptionText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cityContainer} onPress={handleChangeCity}>
            <Ionicons name="location" size={14} color="#2DD4BF" style={styles.cityIcon} />
            <CaptionText style={styles.cityText}>{user?.home_city || i18n.t("home.unknownCity")}</CaptionText>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <GlassCardOnLight style={styles.inputCard} contentStyle={styles.inputCardContent}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={i18n.t("home.askPlan")}
              placeholderTextColor="#94A3B8"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </GlassCardOnLight>

          {isThinking && (
            <GlassCardOnLight style={styles.thinkingCard}>
              <View style={styles.thinkingDot} />
              <ActivityIndicator size="small" color="#A78BFA" style={styles.thinkingSpinner} />
              <BodyText style={styles.thinkingText}>{i18n.t("home.aiThinking")}</BodyText>
            </GlassCardOnLight>
          )}

          {errorMsg && !isThinking && !isChatting ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={32} color="#F59E0B" />
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => input.trim() && callAI(input.trim())} activeOpacity={0.8}>
                <Text style={styles.retryButtonText}>{t("home.retry")}</Text>
              </TouchableOpacity>
            </View>
          ) : isChatting && aiResponse ? (
            renderStructuredResponse(aiResponse)
          ) : !isThinking ? (
            <View>
              <CaptionText style={styles.sectionLabel}>{i18n.t("home.quickActions")}</CaptionText>
              <View style={styles.quickActionsContainer}>
                {QUICK_ACTIONS.map((action) => (
                  <TouchableOpacity key={action.id} onPress={() => handleQuickAction(action.prompt)} activeOpacity={0.8}>
                    <View style={styles.quickActionButton}>
                      <Ionicons name={action.icon as any} size={18} color="#2DD4BF" style={styles.quickActionIcon} />
                      <Text style={styles.quickActionLabel}>{t(action.labelKey)}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <HeadingText style={styles.sectionHeading}>{i18n.t("home.trending")}</HeadingText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
                {TRENDING_EXPERIENCES.map((exp) => (
                  <TouchableOpacity key={exp.id} onPress={() => router.push("/timeline")} activeOpacity={0.9} style={styles.trendingCardWrapper}>
                    <GlassCardOnLight style={styles.trendingCard}>
                      <View style={styles.trendingImageWrapper}>
                        <Image source={{ uri: exp.imageUrl }} style={styles.trendingImage} resizeMode="cover" />
                        <View style={styles.trendingOverlay}>
                          <Text style={styles.trendingTitle} numberOfLines={2}>{exp.title}</Text>
                          <View style={styles.trendingScoreRow}>
                            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
                            <Text style={styles.trendingScore}>{exp.safetyScore}%</Text>
                          </View>
                        </View>
                      </View>
                    </GlassCardOnLight>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.eventsButton} onPress={handleEvents} activeOpacity={0.85}>
                <Text style={styles.eventsButtonText}>{t("home.events", { city: user?.home_city || t("home.unknownCity") })}</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <PlaceDetailModal
        visible={detailVisible}
        stop={selectedStop}
        onClose={() => setDetailVisible(false)}
      />
      <RouteMapModal
        visible={routeMapVisible}
        stops={aiResponse ? getRouteStops(aiResponse) : []}
        onClose={() => setRouteMapVisible(false)}
      />
      <SafetyButton variant="floating" />
      {!user && (
        <View style={styles.guestContainer}>
          <View style={styles.guestContent}>
            <CaptionText style={styles.guestText}>{i18n.t("home.guestMessage")}</CaptionText>
            <Button style={styles.guestButton} labelStyle={styles.guestButtonText} onPress={() => router.push("/")}>
              {i18n.t("home.logIn")}
            </Button>
          </View>
        </View>
      )}
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingBottom: 120 },
  headerContainer: {
    paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24,
  },
  contentContainer: { paddingHorizontal: 24 },
  profileButton: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
  },
  profileText: { marginLeft: 12 },
  profileName: { fontWeight: "600", color: "#0F172A" },
  profileStatus: { color: "#10B981", fontSize: 13 },
  cityContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
  },
  cityIcon: { marginRight: 4 },
  cityText: { color: "#2DD4BF", fontSize: 13 },
  inputCard: { borderRadius: 24, marginBottom: 20 },
  inputCardContent: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16 },
  input: { flex: 1, minWidth: 0, color: "#0F172A", fontSize: 16, paddingVertical: 4 },
  sendButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#2DD4BF",
    alignItems: "center", justifyContent: "center", marginLeft: 12,
  },
  sectionLabel: { marginBottom: 12, color: "#64748B" },
  quickActionsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28 },
  quickActionButton: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
  },
  quickActionIcon: { marginRight: 6 },
  quickActionLabel: { color: "#475569", fontSize: 14, fontWeight: "500" },
  thinkingCard: { borderRadius: 16, marginBottom: 24, flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  thinkingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#A78BFA", marginRight: 8, opacity: 0.8 },
  thinkingSpinner: { marginRight: 8 },
  thinkingText: { color: "#A78BFA" },
  sectionHeading: { marginBottom: 16, color: "#0F172A" },
  trendingContainer: { gap: 16, paddingRight: 24 },
  trendingCardWrapper: { width: 180 },
  trendingCard: { borderRadius: 20, overflow: "hidden", padding: 0 },
  trendingImageWrapper: { height: 120, borderRadius: 16, overflow: "hidden", position: "relative" },
  trendingImage: { width: "100%", height: "100%" },
  trendingOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: "rgba(0,0,0,0.5)" },
  trendingTitle: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  trendingScoreRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  trendingScore: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginLeft: 4 },
  guestContainer: { position: "absolute", bottom: 60, left: 0, right: 0, zIndex: 10, padding: 20, marginTop: 16 },
  guestContent: {
    flexDirection: "column", alignItems: "center", padding: 20, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,1)", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", gap: 10,
  },
  guestText: { color: "#0F172A", fontWeight: "600" },
  guestButton: { width: "100%", backgroundColor: "#2DD4BF" },
  guestButtonText: { color: "#0F172A", fontWeight: "600" },

  // ─── Error state ───
  errorContainer: {
    alignItems: "center", padding: 24, backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16, marginBottom: 16, gap: 12,
  },
  errorText: { fontSize: 14, color: "#64748B", textAlign: "center" },
  retryButton: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: "#2DD4BF",
  },
  retryButtonText: { color: "#FFF", fontWeight: "600", fontSize: 14 },

  // ─── Structured Response ───

  chatContainer: { paddingBottom: 20 },

  responseTitle: {
    fontSize: 28, fontWeight: "800", color: "#0F172A", marginBottom: 20, letterSpacing: -0.5,
  },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", marginBottom: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)",
  },
  sectionEmojiCircle: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: "#F0EEFF",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  sectionEmoji: { fontSize: 20 },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  sectionTime: { fontSize: 13, color: "#A78BFA", fontWeight: "600", marginTop: 2 },

  // Option card
  optionCard: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.04)",
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    }),
  },
  optionTouchable: {
    flex: 1, flexDirection: "row", alignItems: "flex-start", padding: 12,
  },
  optionNumberBadge: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#2DD4BF",
    alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 2,
  },
  optionNumberText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  optionImage: {
    width: 60, height: 60, borderRadius: 12, marginRight: 10,
  },
  optionImagePlaceholder: {
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  optionBody: { flex: 1 },
  optionTitleRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", flex: 1 },
  whyRow: { marginBottom: 6 },
  optionWhy: { fontSize: 13, color: "#475569", lineHeight: 18, marginBottom: 4 },
  confidenceBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 3,
  },
  confidenceVerified: { backgroundColor: "#ECFDF5" },
  confidenceAI: { backgroundColor: "#FFFBEB" },
  confidenceLow: { backgroundColor: "#FFF7ED" },
  confidenceText: { fontSize: 10, fontWeight: "700" },
  optionMeta: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  optionChip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC",
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, gap: 3,
  },
  optionChipText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  optionBudgetText: { fontSize: 11, fontWeight: "700", color: "#10B981" },

  // Marker (meeting/event divider)
  markerDivider: {
    alignItems: "center", paddingVertical: 4,
  },
  markerLine: {
    width: 2, height: 24, backgroundColor: "#E2E8F0", borderRadius: 1,
  },

  // Replace button
  replaceButton: {
    padding: 10, alignSelf: "flex-start", marginTop: 4,
  },

  // ─── Buttons ───
  showRouteButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#A78BFA", paddingVertical: 16, borderRadius: 16, marginTop: 8, gap: 10,
  },
  showRouteButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  saveButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#0F172A", paddingVertical: 16, borderRadius: 16, marginTop: 8, gap: 8,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  newSearchButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#2DD4BF", paddingVertical: 16, borderRadius: 16, marginTop: 8, gap: 8,
  },
  newSearchButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  eventsButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#2DD4BF", paddingVertical: 16, borderRadius: 16, marginTop: 8, gap: 8,
  },
  eventsButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
