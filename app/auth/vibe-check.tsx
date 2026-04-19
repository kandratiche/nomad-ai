import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../../components/ui/LightScreen";
import { BodyText } from "../../components/ui/ThemedText";
import { INTERESTS } from "@/constants/mockData";
import { AuthContext } from "@/context/authContext";
import { useTranslation } from "react-i18next";
import { updateUserApi } from "@/api/services/authApi";

export const INTEREST_IMAGES: Record<string, string> = {
  food:        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
  culture:     "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400",
  nightlife:   "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400",
  nature:      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
  adventure:   "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400",
  shopping:    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400",
  photography: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400",
  wellness:    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400",
  family:      "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400",
  budget:      "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400",
  luxury:      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400",
  local:       "https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=400",
};

const RADIUS = 16;

const InterestCard = React.memo(({
  item,
  isSelected,
  onPress,
}: {
  item: { id: string; label: string };
  isSelected: boolean;
  onPress: () => void;
}) => {
  const imageUrl = INTEREST_IMAGES[item.id] || INTEREST_IMAGES.local;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.gridItem}>
      <View style={styles.cardWrapper}>

        {/*
          KEY FIX for Android:
          NO overflow:"hidden" anywhere.
          borderRadius applied directly to Image — Android handles this correctly
          and does NOT remount the image on parent re-render.
        */}
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Overlay with same borderRadius as image */}
        <View style={styles.overlay} />

        {/* Label */}
        <Text style={styles.cardText} numberOfLines={2}>
          {item.label.toUpperCase()}
        </Text>

        {/* Selection ring — always rendered, opacity toggle only */}
        <View
          style={[styles.selectionRing, { opacity: isSelected ? 1 : 0 }]}
          pointerEvents="none"
        />

        {/* Checkmark — always rendered, opacity toggle only */}
        <View
          style={[styles.checkmark, { opacity: isSelected ? 1 : 0 }]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark" size={16} color="#FFF" />
        </View>

      </View>
    </TouchableOpacity>
  );
});

export default function VibeCheckScreen() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(new Set(["nature", "nightlife"]));
  const { user, setUser } = useContext(AuthContext);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = async () => {
    if (selected.size === 0) return Alert.alert(t("vibeCheck.selectInterest"));
    if (!user?.id) return Alert.alert(t("vibeCheck.userNotFound"));
    try {
      const updatedProfile = await updateUserApi({ interests: Array.from(selected) });
      if (!updatedProfile) throw new Error("Failed to update interests");
      setUser(updatedProfile);
      router.replace("/home");
    } catch (err: any) {
      console.error("Error updating user profile:", err);
      Alert.alert(t("vibeCheck.updateFailed"));
    }
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

        <Text style={styles.title}>{t("vibeCheck.title")}</Text>
        <Text style={styles.subtitle}>{t("vibeCheck.subtitle")}</Text>
        <BodyText style={styles.description}>{t("vibeCheck.description")}</BodyText>

        <View style={styles.grid}>
          {INTERESTS.map((item) => (
            <InterestCard
              key={item.id}
              item={item}
              isSelected={selected.has(item.id)}
              onPress={() => toggle(item.id)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>{t("vibeCheck.continue")}</Text>
          <Text style={styles.rocket}>🚀</Text>
        </TouchableOpacity>
      </ScrollView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(241,245,249,0.95)",
    alignItems: "center", justifyContent: "center", marginBottom: 10,
  },
  progressBar: {
    height: 4, backgroundColor: "#E2E8F0", borderRadius: 2,
    marginBottom: 24, overflow: "hidden", // overflow:hidden только здесь — не на карточках
  },
  progressFilled: { width: "33%", height: "100%", backgroundColor: "#2DD4BF", borderRadius: 2 },
  title: { fontFamily: "Montserrat_700Bold", fontSize: 28, color: "#0F172A", marginBottom: 4 },
  subtitle: { fontFamily: "Montserrat_700Bold", fontSize: 28, color: "#64748B", marginBottom: 12 },
  description: { marginBottom: 24, color: "#475569", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 },
  gridItem: { width: "47%" },

  // НЕТ overflow:"hidden" — это и есть главный фикс для Android
  cardWrapper: {
    height: 120,
    borderRadius: RADIUS,
    position: "relative",
  },

  // borderRadius прямо на Image — Android поддерживает это без перемонтирования
  cardImage: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS,
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardText: {
    position: "absolute", left: 12, right: 12, bottom: 12,
    color: "#FFF", fontWeight: "700", fontSize: 14,
  },

  // Всегда в дереве, переключаем только opacity
  selectionRing: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS,
    borderWidth: 2.5,
    borderColor: "#2DD4BF",
  },
  checkmark: {
    position: "absolute", top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "#2DD4BF",
    alignItems: "center", justifyContent: "center",
  },

  continueButton: {
    backgroundColor: "#0F172A", paddingVertical: 16, borderRadius: 24,
    alignItems: "center", flexDirection: "row", justifyContent: "center",
  },
  continueText: { color: "#FFF", fontWeight: "700", fontSize: 16, marginRight: 8 },
  rocket: { fontSize: 16 },
});
