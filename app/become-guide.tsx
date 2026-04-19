import React, { useState, useContext } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
  Alert, Platform, KeyboardAvoidingView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ShieldCheck, Sparkles } from "lucide-react-native";
import { AuthContext } from "@/context/authContext";
import { NeonButton } from "@/components/ui/NeonButton";
import { updateUserApi } from "@/api/services/authApi";

const SPECIALTIES = [
  "City Tours", "Food Tours", "Photography Walks", "Mountain Tours",
  "Sunset Views", "Architecture Tours", "Museum Tours", "Family Tours",
  "Desert Adventures", "Cultural Walks", "Nightlife Tours", "Instagram Spots",
];

const LANGUAGES = ["Kazakh", "Russian", "English", "Chinese", "Korean", "Turkish"];

export default function BecomeGuideScreen() {
  const { t } = useTranslation();
  const { user, setUser } = useContext(AuthContext);
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("");
  const [whatsapp, setWhatsapp] = useState(user?.phone_number || "");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["Russian"]);
  const [loading, setLoading] = useState(false);

  const toggleSpec = (s: string) =>
    setSelectedSpecs((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleLang = (l: string) =>
    setSelectedLangs((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  const handleSubmit = async () => {
    if (!bio.trim() || !price || selectedSpecs.length === 0 || !whatsapp) {
      const msg = t("guide.fillAll");
      Platform.OS === "web" ? alert(msg) : Alert.alert("Ошибка", msg);
      return;
    }

    setLoading(true);
    try {
      const guideInfo = {
        bio: bio.trim(),
        price: parseInt(price, 10),
        currency: "₸",
        rating: 0,
        reviews_count: 0,
        experience_years: 0,
        tours_completed: 0,
        languages: selectedLangs,
        specialties: selectedSpecs,
        tags: selectedSpecs.slice(0, 3),
        whatsapp_number: whatsapp.replace(/\D/g, ""),
        response_time: "< 1 hour",
        hero_image_url: "",
        is_verified: false,
        tour_packages: [],
        schedule: {},
      };

      const updated = await updateUserApi({ roles: "guide", guide_info: guideInfo });
      if (!updated) throw new Error("Failed to become guide");
      setUser(updated);

      const msg = t("guide.nowGuide");
      if (Platform.OS === "web") {
        alert(msg);
        router.replace("/create-tour");
      } else {
        Alert.alert(t("guide.congrats"), msg, [
          { text: t("guide.createTour"), onPress: () => router.replace("/create-tour") },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Ошибка", err.message || t("guide.somethingWrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <ShieldCheck size={40} color="#2DD4BF" />
            </View>
            <Text style={styles.heroTitle}>{t("guide.becomeTitle")}</Text>
            <Text style={styles.heroSub}>{t("guide.becomeDesc")}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t("guide.aboutYou")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder={t("guide.bioPlaceholder")}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>{t("guide.pricePerHour")}</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="8500"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />

            <Text style={styles.label}>{t("guide.whatsapp")}</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder={t("guide.phonePlaceholder")}
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t("guide.specialties")}</Text>
            <View style={styles.chipGrid}>
              {SPECIALTIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, selectedSpecs.includes(s) && styles.chipActive]}
                  onPress={() => toggleSpec(s)}
                >
                  <Text style={[styles.chipText, selectedSpecs.includes(s) && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>{t("guide.languages")}</Text>
            <View style={styles.chipGrid}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.chip, selectedLangs.includes(l) && styles.chipActive]}
                  onPress={() => toggleLang(l)}
                >
                  <Text style={[styles.chipText, selectedLangs.includes(l) && styles.chipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <NeonButton
            title={loading ? t("guide.submitting") : t("guide.becomeGuide")}
            onPress={handleSubmit}
            loading={loading}
            icon={<Sparkles size={20} color="#0F172A" />}
            style={{ marginTop: 32 }}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFF" },
  scroll: { padding: 24, paddingBottom: 60 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#156459ff",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  hero: { alignItems: "center", marginBottom: 32 },
  heroIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#156459ff",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "Montserrat_800ExtraBold", fontSize: 28, color: "#0F172A",
    textAlign: "center", letterSpacing: 2, lineHeight: 36,
  },
  heroSub: { color: "#94A3B8", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 },
  form: { gap: 16 },
  label: { color: "#2DD4BF", fontWeight: "700", fontSize: 13, letterSpacing: 1, marginBottom: -8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "#156459ff",
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#0F172A", fontSize: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "#94A3B8",
  },
  chipActive: { backgroundColor: "#156459ff", borderColor: "#2DD4BF" },
  chipText: { color: "#94A3B8", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#2DD4BF", fontWeight: "700" },
});
