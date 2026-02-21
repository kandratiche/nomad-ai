import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Image,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText, CaptionText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";
import { Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { Crown, Plus, ShieldCheck } from "lucide-react-native";
import { useMyGuideTours } from "@/hooks/useTours";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, setUser, loading } = useContext(AuthContext);

  if (!loading && !user) router.replace("/");

  const isoCreatedAt = user?.created_at;
  const createdAt = isoCreatedAt
    ? new Date(isoCreatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const handleLogOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert(t("profile.error"), error.message);
        return;
      }
      setUser(null);
      if (Platform.OS === "web") {
        alert(t("profile.signOut"));
        router.replace("/");
      } else {
        Alert.alert(t("profile.signOut"), t("profile.signOut"), [
          { text: "OK", onPress: () => router.replace("/") },
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t("profile.error"), t("profile.loading"));
    } finally {
      setIsLoading(false);
    }
  };

  const isGuide = user?.roles === "guide";
  const { data: myTours = [] } = useMyGuideTours(isGuide ? user?.id : null);

  const handleEditProfile = () => router.push("/profile/edit-profile");
  const handleEditInterest = () => router.push("/profile/edit-interest");
  const handleChangeLanguage = () => router.push("/profile/app-language");
  const handleMyTrips = () => router.push("/profile/my-trips");
  const handleSos = () => {
    Alert.alert(
      t("profile.sosSettings"),
      "112 — Emergency\n102 — Police\n103 — Ambulance\n101 — Fire",
      [
        { text: "Call 112", onPress: () => Linking.openURL("tel:112"), style: "destructive" },
        { text: t("tour.cancel"), style: "cancel" },
      ],
    );
  };

  const SETTINGS_ITEMS = [
    { id: "trips", label: t("profile.myTrips"), sublabel: t("profile.viewTravelHistory"), icon: "airplane-outline" },
    { id: "edit-profile", label: t("profile.editProfile"), sublabel: t("profile.updateProfileInfo"), icon: "person-outline" },
    { id: "interests", label: t("profile.editInterests"), sublabel: t("profile.personalizeAI"), icon: "sparkles-outline" },
    { id: "language", label: t("profile.appLanguage"), sublabel: t("profile.language"), icon: "language-outline" },
    { id: "sos", label: t("profile.sosSettings"), sublabel: t("profile.emergencyContacts"), icon: "location-outline", highlight: true, hasDot: true },
  ];

  return (
    <LightScreen>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
            ) : (
              <Ionicons name="person" size={44} color="#2DD4BF" />
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.firstName}>{user?.name || "Guest"}</Text>
          </View>
          <View style={styles.createdAtRow}>
            <CaptionText style={styles.createdAtLabel}>{t("profile.joined")}</CaptionText>
            <Text style={styles.createdAtText}>{createdAt || t("profile.unknown")}</Text>
          </View>
          <View style={styles.statsRow}> 
            <GlassCardOnLight style={styles.statCard}>
              <View style={styles.statContent}>
                <CaptionText style={styles.statCaption}>{t("profile.toursCompleted")}</CaptionText>
                <Text style={styles.statNumber}>{user.trips_completed}</Text>
              </View>
            </GlassCardOnLight>
            <GlassCardOnLight style={styles.statCard}>
              <View style={styles.statContent}>
                <CaptionText style={styles.statCaption}>TOURS JOINED</CaptionText>
                <Text style={styles.statNumber}>{user.tours_joined ?? 0}</Text>
              </View>
            </GlassCardOnLight>
            <GlassCardOnLight style={styles.statCard}>
              <View style={styles.statContent}>
                <CaptionText style={styles.statCaption}>POINTS</CaptionText>
                <Text style={[styles.statNumber, { color: "#FFBF00" }]}>{user.total_points ?? 0}</Text>
              </View>
            </GlassCardOnLight>
          </View>

          {(user.total_points ?? 0) > 0 && (
            <View style={styles.achievementsRow}>
              {(user.tours_joined ?? 0) >= 1 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>🎒</Text>
                  <Text style={styles.achievementLabel}>Explorer</Text>
                </View>
              )}
              {(user.reviews_written ?? 0) >= 1 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementIcon}>✍️</Text>
                  <Text style={styles.achievementLabel}>Reviewer</Text>
                </View>
              )}
              {(user.total_points ?? 0) >= 100 && (
                <View style={[styles.achievementBadge, { borderColor: "#FFD700" }]}>
                  <Text style={styles.achievementIcon}>⭐</Text>
                  <Text style={[styles.achievementLabel, { color: "#FFD700" }]}>Star Nomad</Text>
                </View>
              )}
              {(user.tours_joined ?? 0) >= 5 && (
                <View style={[styles.achievementBadge, { borderColor: "#7C3AED" }]}>
                  <Text style={styles.achievementIcon}>🏆</Text>
                  <Text style={[styles.achievementLabel, { color: "#7C3AED" }]}>Veteran</Text>
                </View>
              )}
            </View>
          )}
        </View>


        {isGuide ? (
          <View style={styles.guideSection}>
            <View style={styles.guideBadgeRow}>
              <View style={styles.guideBadgeIcon}>
                <ShieldCheck size={20} color="#0F172A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideBadgeTitle}>NOMAD GUIDE</Text>
                <Text style={styles.guideBadgeSub}>{myTours.length} {myTours.length === 1 ? "tour" : "tours"} created</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[styles.createTourButton, { flex: 1 }]}
                onPress={() => router.push("/create-tour")}
              >
                <Plus size={18} color="#0F172A" />
                <Text style={styles.createTourText}>New Tour</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createTourButton, { flex: 1, backgroundColor: "rgba(255,191,0,0.15)" }]}
                onPress={() => router.push("/guide-dashboard")}
              >
                <Crown size={18} color="#FFBF00" />
                <Text style={[styles.createTourText, { color: "#FFBF00" }]}>Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.becomeGuideButton}
            onPress={() => router.push("/become-guide")}
          >
            <View style={styles.becomeGuideIcon}>
              <Crown size={20} color="#FFBF00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.becomeGuideTitle}>Become a Guide</Text>
              <Text style={styles.becomeGuideSub}>Share your city, earn money</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFBF00" />
          </TouchableOpacity>
        )}

        <GlassCardOnLight style={styles.settingsCard}>
          {SETTINGS_ITEMS.map((item, index) => {
            const isLast = index === SETTINGS_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingsItem,
                  !isLast && styles.settingsItemBorder,
                  item.highlight && styles.highlightItem,
                ]}
                onPress={() => {
                  if (item.id === "trips") handleMyTrips();
                  else if (item.id === "edit-profile") handleEditProfile();
                  else if (item.id === "interests") handleEditInterest();
                  else if (item.id === "language") handleChangeLanguage();
                  else if (item.id === "sos") handleSos();
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.highlight ? "#F59E0B" : "#64748B"}
                  style={styles.settingsIcon}
                />
                <View style={styles.settingsTextContainer}>
                  <BodyText style={styles.settingsTitle}>{item.label}</BodyText>
                  <CaptionText style={styles.settingsSubtitle}>{item.sublabel}</CaptionText>
                </View>
                {item.hasDot && <View style={styles.redDot} />}
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            );
          })}
        </GlassCardOnLight>

        <TouchableOpacity onPress={handleLogOut} style={styles.signOutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" style={styles.signOutIcon} />
          <Text style={styles.signOutText}>{isLoading ? t("profile.loading") : t("profile.signOut")}</Text>
        </TouchableOpacity>

        <CaptionText style={styles.versionText}>NOMAD AI (CLOSED BETA)</CaptionText>
      </ScrollView>

      {!user && (
        <View style={styles.guestContainer}>
          <View style={styles.guestContent}>
            <CaptionText style={styles.guestText}>{t("profile.guestMessage")}</CaptionText>
            <Button style={styles.guestButton} labelStyle={styles.guestButtonText} onPress={() => router.push("/")}>
              {t("profile.logIn")}
            </Button>
          </View>
        </View>
      )}
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },

  profileContainer: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(45, 212, 191, 0.5)",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  firstName: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 20,
    color: "#0F172A",
    marginRight: 6,
  },

  createdAtRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  createdAtLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginRight: 4,
  },
  createdAtText: {
    fontSize: 12,
    color: "#0F172A",
  },
  statsRow: {
    width: "100%",
    marginTop: 20,
    gap: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: "space-between",
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statCaption: {
    fontSize: 16,
    color: "#64748B",
  },
  statNumber: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: "#0F172A",
  },
  achievementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2DD4BF",
    backgroundColor: "rgba(45,212,191,0.06)",
  },
  achievementIcon: { fontSize: 14 },
  achievementLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2DD4BF",
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 20,
    padding: 0,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  highlightItem: {
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 12,
    margin: 8,
  },
  settingsIcon: {
    marginRight: 14,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    color: "#0F172A",
    fontWeight: "600",
  },
  settingsSubtitle: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 12,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },

  signOutButton: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  signOutIcon: {
    marginRight: 8,
  },
  signOutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  guideSection: {
    marginBottom: 20,
    backgroundColor: "rgba(255,191,0,0.08)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,191,0,0.25)",
    gap: 12,
  },
  guideBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  guideBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFBF00",
    alignItems: "center",
    justifyContent: "center",
  },
  guideBadgeTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: "#0F172A",
    letterSpacing: 1,
  },
  guideBadgeSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  createTourButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFBF00",
    paddingVertical: 12,
    borderRadius: 14,
  },
  createTourText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 14,
  },
  becomeGuideButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255,191,0,0.06)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,191,0,0.2)",
    gap: 12,
  },
  becomeGuideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,191,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  becomeGuideTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0F172A",
  },
  becomeGuideSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    marginTop: 24,
    color: "#94A3B8",
  },
  guestContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 20,
    marginTop: 16,
  },
  guestContent: {
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    gap: 10,
  },
  guestText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  guestButton: {
    width: "100%",
    backgroundColor: "#2DD4BF",
  },
  guestButtonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
});
