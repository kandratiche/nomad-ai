import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LightScreen } from "../../components/ui/LightScreen";
import { GlassCardOnLight } from "../../components/ui/GlassCard";
import { SafetyButton } from "../../components/SafetyButton";
import { BodyText, HeadingText, CaptionText } from "../../components/ui/ThemedText";
import { TRENDING_EXPERIENCES } from "../../constants/mockData";
import { AuthContext } from "@/context/authContext";

const QUICK_ACTIONS = [
  { id: "date", label: "Date Night", icon: "heart" },
  { id: "budget", label: "Budget Eats", icon: "wallet" },
  { id: "views", label: "Best Views", icon: "eye" },
  { id: "culture", label: "Culture", icon: "book" },
  { id: "nature", label: "Nature", icon: "leaf" },
  { id: "local", label: "Local Vibes", icon: "people" },
];

export default function HomeScreen() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const { user, loading } = useContext(AuthContext);

  console.log(user);

  if (!loading && !user) {
    router.replace("/login");
  }

  const handleSend = () => {
    if (!input.trim() && !isThinking) return;
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      router.push("/timeline");
    }, 1500);
  };

  const handleQuickAction = () => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      router.push("/timeline");
    }, 1500);
  };

  return (
    <LightScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#2DD4BF" />
            </View>
            <View style={styles.profileText}>
              <BodyText style={styles.profileName}>
                {user?.name || "Guest"}
              </BodyText>
              <CaptionText style={styles.profileStatus}>● Online</CaptionText>
            </View>
          </TouchableOpacity>

          <View style={styles.cityContainer}>
            <Ionicons name="location" size={14} color="#2DD4BF" style={styles.cityIcon} />
            <CaptionText style={styles.cityText}>
              {user?.home_city || "Unknown"}
            </CaptionText>
          </View>
        </View>

        <View style={styles.contentContainer}>

          <GlassCardOnLight style={styles.inputCard} contentStyle={styles.inputCardContent}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask for a plan..."
              placeholderTextColor="#94A3B8"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </GlassCardOnLight>

          <CaptionText style={styles.sectionLabel}>Quick actions</CaptionText>
          <View style={styles.quickActionsContainer}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity key={action.id} onPress={handleQuickAction} activeOpacity={0.8}>
                <View style={styles.quickActionButton}>
                  <Ionicons name={action.icon as any} size={18} color="#2DD4BF" style={styles.quickActionIcon} />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {isThinking && (
            <GlassCardOnLight style={styles.thinkingCard}>
              <View style={styles.thinkingDot} />
              <ActivityIndicator size="small" color="#A78BFA" style={styles.thinkingSpinner} />
              <BodyText style={styles.thinkingText}>AI is thinking...</BodyText>
            </GlassCardOnLight>
          )}

          <HeadingText style={styles.sectionHeading}>Trending</HeadingText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingContainer}>
            {TRENDING_EXPERIENCES.map((exp) => (
              <TouchableOpacity
                key={exp.id}
                onPress={() => router.push("/timeline")}
                activeOpacity={0.9}
                style={styles.trendingCardWrapper}
              >
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
        </View>
      </ScrollView>


      <SafetyButton variant="floating" />
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 120,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  profileButton: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  profileText: { 
    marginLeft: 12 
  },
  profileName: { 
    fontWeight: "600", 
    color: "#0F172A" 
  },
  profileStatus: { 
    color: "#10B981", 
    fontSize: 13 
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cityIcon: { 
    marginRight: 4 
  },
  cityText: { 
    color: "#2DD4BF", 
    fontSize: 13 
  },

  inputCard: { 
    borderRadius: 24, 
    marginBottom: 20 
  },
  inputCardContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12, 
    paddingHorizontal: 16 
  },
  input: { 
    flex: 1, 
    minWidth: 0, 
    color: "#0F172A", 
    fontSize: 16, 
    paddingVertical: 4 
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  sectionLabel: { 
    marginBottom: 12, 
    color: "#64748B" 
  },
  quickActionsContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 10, 
    marginBottom: 28 
  },
  quickActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  quickActionIcon: { 
    marginRight: 6 
  },
  quickActionLabel: { 
    color: "#475569", 
    fontSize: 14, 
    fontWeight: "500" 
  },

  thinkingCard: {
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  thinkingDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: "#A78BFA", 
    marginRight: 8, 
    opacity: 0.8 
  },
  thinkingSpinner: { 
    marginRight: 8 
  },
  thinkingText: { 
    color: "#A78BFA" 
  },

  sectionHeading: { 
    marginBottom: 16, 
    color: "#0F172A" 
  },
  trendingContainer: { 
    gap: 16, 
    paddingRight: 24 
  },
  trendingCardWrapper: { 
    width: 180 
  },
  trendingCard: { 
    borderRadius: 20, 
    overflow: "hidden", 
    padding: 0 
  },
  trendingImageWrapper: { 
    height: 120, 
    borderRadius: 16, 
    overflow: "hidden", 
    position: "relative" 
  },
  trendingImage: { 
    width: "100%", 
    height: "100%" 
  },
  trendingOverlay: { 
    position: "absolute", 
    left: 0, 
    right: 0, 
    bottom: 0, 
    padding: 12, 
    backgroundColor: "rgba(0,0,0,0.5)" 
  },
  trendingTitle: { 
    color: "#FFF", 
    fontWeight: "700", 
    fontSize: 15 
  },
  trendingScoreRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 4 
  },
  trendingScore: { 
    color: "rgba(255,255,255,0.9)", 
    fontSize: 12, 
    marginLeft: 4 
  },
});
