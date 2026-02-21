import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from 'react-i18next';
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText, CaptionText } from "@/components/ui/ThemedText";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { AuthContext } from "@/context/authContext";

export default function WelcomeScreen() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  
  useEffect(() => { 
      if (user) {
          router.replace("/home");
      }
  }, [user]);
  
  return (
    <LightScreen>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <SplitTitle first="Nomad" second="AI" />
        </View>
        <BodyText style={styles.description}>
          {t('welcome.description')}
        </BodyText>

        <GlassCardOnLight style={styles.loginCard}>
          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            style={styles.buttonContent}
          >
            <Ionicons name="person-outline" size={24} color="#0F172A" style={styles.icon} />
            <Text style={styles.loginButtonText}>{t('welcome.login')}</Text>
          </TouchableOpacity>
        </GlassCardOnLight>

        <GlassCardOnLight style={styles.signupCard}>
          <TouchableOpacity
            onPress={() => router.replace("/auth/register")}
            style={styles.buttonContent}
          >
            <Ionicons name="person-outline" size={24} color="#2DD4BF" style={styles.icon} />
            <Text style={styles.signupButtonText}>{t('welcome.signup')}</Text>
          </TouchableOpacity>
        </GlassCardOnLight>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => Linking.openURL("https://example.com/terms")}>
            <CaptionText style={styles.linkText}>{t('welcome.terms')}</CaptionText>
          </TouchableOpacity>
          <CaptionText style={styles.separator}>•</CaptionText>
          <TouchableOpacity onPress={() => Linking.openURL("https://example.com/privacy")}>
            <CaptionText style={styles.linkText}>{t('welcome.privacy')}</CaptionText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logoTextPrimary: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 32,
    color: "#0F172A",
  },
  logoTextSecondary: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 32,
    color: "#2DD4BF",
  },
  description: {
    textAlign: "center",
    marginBottom: 48,
    color: "#475569",
    fontSize: 16,
  },
  loginCard: {
    marginBottom: 16,
    borderRadius: 20,
  },
  signupCard: {
    marginBottom: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.5)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  icon: {
    marginRight: 12,
  },
  loginButtonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButtonText: {
    color: "#2DD4BF",
    fontSize: 16,
    fontWeight: "600",
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  linkText: {
    color: "#2DD4BF",
  },
  separator: {
    color: "#94A3B8",
  },
});