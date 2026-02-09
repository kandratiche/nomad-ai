import React, { useContext, useState } from "react";
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
import { CITIES } from "../constants/mockData";
import { LightScreen } from "../components/ui/LightScreen";
import { GlassCardOnLight } from "../components/ui/GlassCard";
import { SplitTitle } from "../components/ui/SplitTitle";
import { CaptionText } from "../components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";

const CITY_SUBTITLES: Record<string, string> = {
  Astana: "Futuristic City",
  Almaty: "Mountains",
  Aktau: "Seaside",
};

export default function CitySelectScreen() {
  const [selectedId, setSelectedId] = React.useState<string | null>("Almaty");
  const { user, setUser } = useContext(AuthContext);

  console.log("City select", selectedId);

  const handleContinue = async () => {
    if (!selectedId) return alert("Please select a city");
    if (!user?.id) return alert("User not found");

    try {
      const { data: updatedProfile, error } = await supabase
        .from("users")
        .update({ home_city: selectedId })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      console.log("Updated profile:", updatedProfile);

      setUser(updatedProfile);

      router.replace("/vibe-check");
    } catch (err: any) {
      console.error("Error updating city:", err);
      alert(err.message || "Something went wrong");
    }
  };


  return (
    <LightScreen>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.push("/")
            }
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.stepDots}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === 1 ? "#2DD4BF" : "#E2E8F0" },
                ]}
              />
            ))}
          </View>
        </View>

        <SplitTitle first="Where do we " second="start?" style={styles.title} />

        <TouchableOpacity style={styles.locateButton} onPress={handleContinue}>
          <Ionicons
            name="compass-outline"
            size={20}
            color="#2DD4BF"
            style={styles.locateIcon}
          />
          <Text style={styles.locateText}>LOCATE ME</Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {CITIES.map((city) => {
            const isSelected = selectedId === city.id;
            console.log(city.id);
            return (
              <TouchableOpacity
                key={city.id}
                onPress={() => setSelectedId(city.id)}
                activeOpacity={0.9}
                style={styles.cityWrapper}
              >
                <GlassCardOnLight
                  style={[
                    styles.cityCard,
                    isSelected && { borderWidth: 2, borderColor: "#2DD4BF" },
                  ]}
                >
                  <View style={styles.cityCardContent}>
                    <Image
                      source={{ uri: city.imageUrl }}
                      style={styles.cityImage}
                      resizeMode="cover"
                    />

                    <View style={styles.cityOverlay}>
                      <View style={styles.cityInfoRow}>
                        <View>
                          <Text style={styles.cityName}>{city.name}</Text>
                          <View style={styles.citySubtitleRow}>
                            <View
                              style={[
                                styles.cityIndicator,
                                {
                                  backgroundColor: isSelected
                                    ? "#FACC15"
                                    : "#2DD4BF",
                                },
                              ]}
                            />
                            <CaptionText style={styles.citySubtitle}>
                              {CITY_SUBTITLES[city.id] || city.country}
                            </CaptionText>
                          </View>
                        </View>

                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={18} color="#FFF" />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </GlassCardOnLight>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.forwardButton} onPress={handleContinue}>
          <Ionicons name="arrow-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    top: 56,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(241,245,249,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDots: {
    top: 56,
    right: 24,
    zIndex: 10,
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    marginTop: 50,
    marginBottom: 20,
  },
  locateButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2DD4BF",
    backgroundColor: "#FFF",
    marginBottom: 24,
  },
  locateIcon: {
    marginRight: 8,
  },
  locateText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 15,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  cityWrapper: {
    marginBottom: 16,
  },
  cityCard: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
  },
  cityCardContent: {
    height: 140,
    position: "relative",
  },
  cityImage: {
    width: "100%",
    height: "100%",
  },
  cityOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cityInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityName: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },
  citySubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  cityIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  citySubtitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 13,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
  },
  forwardButton: {
    position: "absolute",
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
});
