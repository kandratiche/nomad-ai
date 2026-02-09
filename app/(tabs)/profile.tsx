import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../../components/ui/LightScreen";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { BodyText, CaptionText } from "../../components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";
import { Alert, Platform } from "react-native";

const SETTINGS_ITEMS = [
  { id: "edit-profile", label: "Edit Profile", sublabel: "Update your profile information", icon: "person-outline" },
  { id: "trips", label: "My Trips", sublabel: "View travel history", icon: "airplane-outline" },
  { id: "interests", label: "Edit Interests", sublabel: "Personalize AI", icon: "sparkles-outline" },
  { id: "sos", label: "SOS Settings", sublabel: "Emergency contacts & alerts", icon: "location-outline", highlight: true, hasDot: true },
  { id: "language", label: "App Language", sublabel: "English (US)", icon: "language-outline" },
];

export default function ProfileScreen() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { user, setUser } = useContext(AuthContext);

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
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      setUser(null);

      if (Platform.OS === "web") {
        alert("Signed out successfully");
        router.replace("/login");
      } else {
        Alert.alert("Signed Out", "You have been logged out", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  console.log(user)

  return (
    <LightScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color="#2DD4BF" />
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.firstName}>{user?.name || "Guest"}</Text>
          </View>
          
          <View style={styles.createdAtRow}>
            <CaptionText style={styles.createdAtLabel}>Joined</CaptionText>
            <Text style={styles.createdAtText}>{createdAt || "Unknown"}</Text>
          </View>

          <View style={styles.statsRow}>
            <GlassCardOnLight style={styles.statCard}>
              <Text style={styles.statNumber}>150</Text>
              <CaptionText style={styles.statCaption}>
                TOURS COMPLETED
              </CaptionText>
            </GlassCardOnLight>

            <GlassCardOnLight style={styles.statCard}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.yearsText}>Yrs</Text>
              <CaptionText style={styles.statCaption}>
                EXPERIENCE
              </CaptionText>
            </GlassCardOnLight>
          </View>
        </View>

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
                onPress={() => item.id === "edit-profile" && handleEditProfile()}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={item.highlight ? "#F59E0B" : "#64748B"}
                  style={styles.settingsIcon}
                />

                <View style={styles.settingsTextContainer}>
                  <BodyText style={styles.settingsTitle}>
                    {item.label}
                  </BodyText>
                  <CaptionText style={styles.settingsSubtitle}>
                    {item.sublabel}
                  </CaptionText>
                </View>

                {item.hasDot && <View style={styles.redDot} />}

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            );
          })}
        </GlassCardOnLight>

        <TouchableOpacity
          onPress={() => handleLogOut()}
          style={styles.signOutButton}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#EF4444"
            style={styles.signOutIcon}
          />
          <Text style={styles.signOutText}>{loading ? "Loading..." : "Sign Out"}</Text>
        </TouchableOpacity>

        <CaptionText style={styles.versionText}>
          {`NOMAD AI (CLOSED BETA)`}
        </CaptionText>
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
    flexDirection: "row",
    marginTop: 20,
    gap: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: "#0F172A",
  },
  yearsText: {
    fontSize: 14,
    color: "#2DD4BF",
    fontWeight: "600",
  },
  statCaption: {
    color: "#64748B",
    marginTop: 2,
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
  versionText: {
    textAlign: "center",
    marginTop: 24,
    color: "#94A3B8",
  },
});
