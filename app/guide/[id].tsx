import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Linking } from "react-native";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { BodyText, CaptionText } from "../../components/ui/ThemedText";
import { GUIDES } from "@/constants/mockData";

export default function GuideProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = GUIDES.find((g) => g.id === id) ?? GUIDES[0];

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${guide.whatsappNumber.replace(/\D/g, "")}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 280, position: "relative" }}>
          <Image source={{ uri: guide.heroImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          <BlurView intensity={50} tint="dark" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingTop: 24, paddingHorizontal: 24, justifyContent: "flex-end", paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", top: 56, left: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Image source={{ uri: guide.avatarUrl }} style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "rgba(255,255,255,0.5)" }} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                  <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 24, color: "#FFF", marginRight: 4 }}>{guide.name.split(" ")[0]}.</Text>
                  <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 24, color: "#2DD4BF" }}>NOMAD</Text>
                  {guide.verified && (
                    <View style={{ marginLeft: 8, backgroundColor: "#FACC15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ color: "#0F172A", fontWeight: "700", fontSize: 10 }}>VERIFIED</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" style={{ marginRight: 4 }} />
                  <CaptionText style={{ color: "rgba(255,255,255,0.95)" }}>Almaty, Kazakhstan • {guide.specialties[0]}</CaptionText>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: -20 }}>
          <GlassCardOnLight style={{ flexDirection: "row", paddingVertical: 16, paddingHorizontal: 20, borderRadius: 20 }}>
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "rgba(0,0,0,0.06)" }}>
              <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 22, color: "#0F172A" }}>{guide.toursCompleted}</Text>
              <CaptionText style={{ color: "#64748B", marginTop: 2 }}>TOURS</CaptionText>
            </View>
            <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "rgba(0,0,0,0.06)" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 22, color: "#0F172A" }}>{guide.rating}</Text>
                <Ionicons name="star" size={18} color="#FACC15" style={{ marginLeft: 4 }} />
              </View>
              <CaptionText style={{ color: "#64748B", marginTop: 2 }}>RATING</CaptionText>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 22, color: "#0F172A" }}>{guide.experienceYears}y</Text>
              <CaptionText style={{ color: "#64748B", marginTop: 2 }}>EXP</CaptionText>
            </View>
          </GlassCardOnLight>
        </View>

        <View style={{ paddingHorizontal: 24, marginTop: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: "#2DD4BF", marginRight: 10 }} />
            <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#0F172A" }}>ABOUT ME</Text>
          </View>
          <GlassCardOnLight style={{ borderRadius: 16, marginBottom: 20 }}>
            <BodyText style={{ lineHeight: 24, color: "#475569" }}>{guide.bio}</BodyText>
          </GlassCardOnLight>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {guide.tags.map((tag) => (
              <View key={tag} style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: "#0F172A", fontWeight: "600", fontSize: 12 }}>#{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 4, height: 20, borderRadius: 2, backgroundColor: "#FACC15", marginRight: 10 }} />
              <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 16, color: "#0F172A" }}>SIGNATURE TOURS</Text>
            </View>
            <Text style={{ color: "#2DD4BF", fontWeight: "700", fontSize: 13 }}>VIEW ALL →</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
            {guide.tourPackages.map((pkg) => (
              <GlassCardOnLight key={pkg.id} style={{ width: 200, borderRadius: 16, padding: 14 }}>
                <BodyText style={{ fontWeight: "700", marginBottom: 4, color: "#0F172A" }}>{pkg.title}</BodyText>
                <CaptionText style={{ marginBottom: 6, color: "#64748B" }}>{pkg.duration} · {pkg.price.toLocaleString()}{pkg.currency}</CaptionText>
                <CaptionText style={{ fontSize: 12, color: "#94A3B8" }} numberOfLines={2}>{pkg.description}</CaptionText>
              </GlassCardOnLight>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={openWhatsApp}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2DD4BF", paddingVertical: 16, borderRadius: 20, marginTop: 28 }}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#0F172A" style={{ marginRight: 10 }} />
            <Text style={{ color: "#0F172A", fontWeight: "700", fontSize: 16 }}>CONTACT / BOOK</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
