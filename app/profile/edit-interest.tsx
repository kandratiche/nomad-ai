import { useContext, useState } from "react";
import { AuthContext } from "@/context/authContext";
import { INTEREST_IMAGES } from "../auth/vibe-check";
import { INTERESTS } from "@/constants/mockData";
import { LightScreen } from "@/components/ui/LightScreen";
import { ScrollView } from "react-native-gesture-handler";
import { TouchableOpacity, StyleSheet, View, Image, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { Button } from "react-native-paper";
import { updateUserApi } from "@/api/services/authApi";

const RADIUS = 16;

// Отдельный компонент — стабильное дерево, Image не перемонтируется
const InterestCard = ({
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

        {/* Image с borderRadius напрямую — без overflow:hidden */}
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />

        <View style={styles.overlay} />

        <Text style={styles.cardText} numberOfLines={2}>
          {item.label.toUpperCase()}
        </Text>

        {/* Всегда в дереве, переключаем только opacity */}
        <View style={[styles.selectionRing, { opacity: isSelected ? 1 : 0 }]} pointerEvents="none" />
        <View style={[styles.checkmark, { opacity: isSelected ? 1 : 0 }]} pointerEvents="none">
          <Ionicons name="checkmark" size={16} color="#FFF" />
        </View>

      </View>
    </TouchableOpacity>
  );
};

export default function EditInterestScreen() {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);

  const interestsRaw = user?.interests;
  const interestsArray = Array.isArray(interestsRaw)
    ? interestsRaw
    : JSON.parse(typeof interestsRaw === "string" ? interestsRaw : "[]");

  const [interests, setInterests] = useState<string[]>(interestsArray || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = (id: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return Array.from(next);
    });
  };

  const handleSave = async () => {
    if (interests.length === 0) return alert(t("editInterest.selectAtLeast"));
    if (!user?.id) return alert(t("editInterest.userNotFound"));

    try {
      setIsLoading(true);
      const updatedProfile = await updateUserApi({ interests: Array.from(interests) });
      if (!updatedProfile) throw new Error("Failed to update interests");
      setUser(updatedProfile);
      router.replace("/profile");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert(t("editInterest.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LightScreen>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push("/profile")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <SplitTitle first={t("editInterest.titleFirst")} second={t("editInterest.titleSecond")} />

        <View style={styles.grid}>
          {INTERESTS.map((item) => (
            <InterestCard
              key={item.id}
              item={item}
              isSelected={interests.includes(item.id)}
              onPress={() => toggle(item.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.saveContainer}>
        <Button
          style={styles.saveButton}
          labelStyle={styles.saveButtonText}
          onPress={handleSave}
        >
          {isLoading ? t("editInterest.saving") : t("editInterest.save")}
        </Button>
      </View>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 24 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", paddingBottom: 12 },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(241,245,249,0.95)",
    alignItems: "center", justifyContent: "center",
  },
  grid: {
    flexDirection: "row", flexWrap: "wrap",
    marginTop: 16, gap: 12, marginBottom: 128,
  },
  gridItem: { width: "47%" },

  // НЕТ overflow:"hidden" — ключевой фикс для Android
  cardWrapper: {
    height: 120,
    borderRadius: RADIUS,
    position: "relative",
  },
  // borderRadius прямо на Image
  cardImage: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
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
  // Всегда в дереве — только opacity меняется
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
  saveContainer: {
    position: "absolute", bottom: 16, left: 0, right: 0,
    zIndex: 10, padding: 20,
  },
  saveButton: { width: "100%", height: 50, justifyContent: "center", backgroundColor: "#2DD4BF" },
  saveButtonText: { color: "#0F172A", fontWeight: "600", fontSize: 18 },
});
