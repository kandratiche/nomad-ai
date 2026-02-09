import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../components/ui/LightScreen";
import { BodyText } from "../components/ui/ThemedText";
import { INTERESTS } from "../constants/mockData";

const INTEREST_IMAGES: Record<string, string> = {
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  culture: "https://images.unsplash.com/photo-1567596434663-f8c2d2e1e8a8?w=400",
  nightlife: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400",
  nature: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
  adventure: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
  shopping: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
  photography: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",
  wellness: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400",
  family: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400",
  budget: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400",
  luxury: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400",
  local: "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=400",
};

export default function VibeCheckScreen() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["nature", "nightlife"]));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    router.replace("/home");
  };

  return (
    <LightScreen>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.push("/city-select")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.progressBar}>
          <View style={styles.progressFilled} />
        </View>

        <Text style={styles.title}>WHAT MOVES</Text>
        <Text style={styles.subtitle}>YOU?</Text>
        <BodyText style={styles.description}>
          Select your interests so Nomad AI can craft your perfect adventure.
        </BodyText>

        <View style={styles.grid}>
          {INTERESTS.map((item) => {
            const isSelected = selected.has(item.id);
            const imageUrl = INTEREST_IMAGES[item.id] || INTEREST_IMAGES.local;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggle(item.id)}
                activeOpacity={0.9}
                style={styles.gridItem}
              >
                <View style={[styles.card, isSelected && styles.cardSelected]}>
                  <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                  <View style={styles.overlay} />
                  <Text style={styles.cardText} numberOfLines={2}>
                    {item.label.toUpperCase()}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>LET'S GO</Text>
          <Text style={styles.rocket}>🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(241,245,249,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFilled: {
    width: "33%",
    height: "100%",
    backgroundColor: "#2DD4BF",
    borderRadius: 2,
  },
  title: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 28,
    color: "#64748B",
    marginBottom: 12,
  },
  description: {
    marginBottom: 24,
    color: "#475569",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  gridItem: {
    width: "47%",
  },
  card: {
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#2DD4BF",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardText: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
  },
  continueButton: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  continueText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
  rocket: {
    fontSize: 16,
  },
});
