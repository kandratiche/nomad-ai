import React, { useState, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView, Image, ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Sparkles, Eye, Crown } from "lucide-react-native";
import { AuthContext } from "@/context/authContext";
import { NeonButton } from "@/components/ui/NeonButton";
import { GoldBorderCard } from "@/components/ui/GoldBorderCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useCreateTour } from "@/hooks/useTours";
import { enhanceDescriptionWithAI } from "@/services/toursService";

export default function CreateTourScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const params = useLocalSearchParams<{
    prefillTitle?: string; prefillDescription?: string;
    prefillCity?: string; prefillTags?: string;
  }>();
  const isGuide = user?.roles === "guide";
  const guideInfo = user?.guide_info || {};
  const createMutation = useCreateTour();

  const [title, setTitle] = useState(params.prefillTitle || "");
  const [description, setDescription] = useState(params.prefillDescription || "");
  const [price, setPrice] = useState("");
  const [maxPeople, setMaxPeople] = useState("4");
  const [duration, setDuration] = useState("3");
  const [imageUrl, setImageUrl] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tags] = useState<string[]>(() => {
    try { return params.prefillTags ? JSON.parse(params.prefillTags) : []; } catch { return []; }
  });

  if (!isGuide) {
    return (
      <View style={[styles.screen, { alignItems: "center", justifyContent: "center", padding: 24 }]}>
        <Crown size={48} color="#FFBF00" />
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
          {t("createTour.becomeGuide")}
        </Text>
        <NeonButton title={t("guide.becomeGuide")} onPress={() => router.push("/become-guide")} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const handleEnhance = async () => {
    if (!description.trim()) return;
    setEnhancing(true);
    try {
      const enhanced = await enhanceDescriptionWithAI(description, title, user?.home_city || "Kazakhstan");
      setDescription(enhanced);
    } catch (err) {
      console.error("AI enhance failed:", err);
    } finally {
      setEnhancing(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !price) {
      const msg = t("createTour.fillRequired");
      Platform.OS === "web" ? alert(msg) : Alert.alert(t("createTour.error"), msg);
      return;
    }

    createMutation.mutate(
      {
        guideId: user.id,
        title: title.trim(),
        description: description.trim(),
        priceTotal: parseInt(price, 10),
        maxPeople: parseInt(maxPeople, 10) || 4,
        durationHours: parseFloat(duration) || 3,
        imageUrl,
        city: params.prefillCity || user.home_city || "Almaty",
        tags: tags.length > 0 ? tags : undefined,
        isPremium: guideInfo.is_verified || false,
        status: "active",
      },
      {
        onSuccess: () => {
          const msg = t("createTour.created");
          if (Platform.OS === "web") { alert(msg); router.back(); }
          else Alert.alert(t("createTour.success"), msg, [{ text: "OK", onPress: () => router.back() }]);
        },
        onError: (err: any) => Alert.alert(t("createTour.error"), err?.message || t("createTour.createFailed")),
      },
    );
  };

  const pricePerPerson = parseInt(price, 10) && parseInt(maxPeople, 10)
    ? Math.round(parseInt(price, 10) / parseInt(maxPeople, 10))
    : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("createTour.title")}</Text>
            <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={styles.previewToggle}>
              <Eye size={20} color={showPreview ? "#FFBF00" : "#64748B"} />
            </TouchableOpacity>
          </View>

          {showPreview ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.previewLabel}>{t("createTour.preview")}</Text>
              <GoldBorderCard isPremium={guideInfo.is_verified}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: "100%", height: 120, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }}>
                    <Crown size={32} color="#FFBF00" />
                  </View>
                )}
                <View style={{ padding: 16, gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ flex: 1, fontSize: 18, fontWeight: "800", color: "#FFF" }}>{title || t("createTour.tourTitle")}</Text>
                    {guideInfo.is_verified && <VerifiedBadge size="sm" />}
                  </View>
                  <Text style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 18 }} numberOfLines={3}>{description || t("createTour.description")}</Text>
                  {pricePerPerson > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
                      <Text style={{ color: "#64748B", fontSize: 12 }}>from</Text>
                      <Text style={{ color: "#FFBF00", fontSize: 22, fontWeight: "800" }}>{pricePerPerson.toLocaleString()} ₸</Text>
                      <Text style={{ color: "#64748B", fontSize: 12 }}>/person</Text>
                    </View>
                  )}
                </View>
              </GoldBorderCard>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>{t("createTour.tourTitle")}</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Sunset Almaty Experience" placeholderTextColor="#475569" />

              <View style={styles.descHeader}>
                <Text style={styles.label}>{t("createTour.description")}</Text>
                <TouchableOpacity onPress={handleEnhance} disabled={enhancing} style={styles.aiButton}>
                  {enhancing ? <ActivityIndicator size="small" color="#FFBF00" /> : <Sparkles size={16} color="#FFBF00" />}
                  <Text style={styles.aiButtonText}>{enhancing ? t("createTour.enhancing") : `✨ ${t("createTour.enhanceAI")}`}</Text>
                </TouchableOpacity>
              </View>
              <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder={t("createTour.descPlaceholder")} placeholderTextColor="#475569" multiline numberOfLines={5} />

              <Text style={styles.label}>{t("createTour.totalPrice")}</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="40000" placeholderTextColor="#475569" keyboardType="numeric" />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("createTour.maxPeople")}</Text>
                  <TextInput style={styles.input} value={maxPeople} onChangeText={setMaxPeople} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t("createTour.duration")}</Text>
                  <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
                </View>
              </View>

              <Text style={styles.label}>{t("createTour.photoUrl")}</Text>
              <TextInput style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="#475569" />

              {pricePerPerson > 0 && (
                <View style={styles.priceHint}>
                  <Text style={styles.priceHintText}>
                    {t("createTour.priceHint")} <Text style={{ color: "#FFBF00", fontWeight: "800" }}>{pricePerPerson.toLocaleString()} ₸/чел</Text>
                  </Text>
                </View>
              )}

              <NeonButton
                title={createMutation.isPending ? t("createTour.creating") : t("createTour.publish")}
                onPress={handleCreate}
                loading={createMutation.isPending}
                icon={<Crown size={20} color="#0F172A" />}
                style={{ marginTop: 8 }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F172A" },
  scroll: { padding: 24, paddingBottom: 60 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#FFF", letterSpacing: 2 },
  previewToggle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  previewLabel: { color: "#FFBF00", fontWeight: "700", fontSize: 12, letterSpacing: 1, marginBottom: 12 },
  form: { gap: 16, marginTop: 16 },
  label: { color: "#FFBF00", fontWeight: "700", fontSize: 12, letterSpacing: 1 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,191,0,0.15)",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#FFF", fontSize: 15,
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  descHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  aiButton: {
    flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,191,0,0.1)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,191,0,0.3)",
  },
  aiButtonText: { color: "#FFBF00", fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", gap: 12 },
  priceHint: {
    backgroundColor: "rgba(255,191,0,0.08)", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "rgba(255,191,0,0.15)",
  },
  priceHintText: { color: "#94A3B8", fontSize: 13 },
});
