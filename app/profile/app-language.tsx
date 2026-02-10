import { LightScreen } from "@/components/ui/LightScreen";
import React from "react";
import { TouchableOpacity, View, StyleSheet, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import { changeLanguage } from "../i18n";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";

export const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
    { code: "kz", label: "Қазақша" },
];

export default function AppLanguageScreen() {
    const { t, i18n } = useTranslation();
    const { user, setUser } = React.useContext(AuthContext);

    const [language, setLanguage] = React.useState(user?.languages || i18n.language || "en");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSave = async () => {
        if (!user?.id) return alert(t('language.userNotFound'));
        try {
            setLoading(true);

            const userId = user?.id;
            if (!userId) throw new Error("User ID not returned");

            await changeLanguage(language);

            const { data: profileData, error: profileError } = await supabase
                .from("users")
                .update({ languages: language })
                .eq("id", userId)
                .select()
                .single();

            if (profileError) {
                setError(profileError.message);
                Alert.alert("Error", profileError.message);
                return;
            }

            setUser(profileData);

            if (Platform.OS === "web") {
                alert(t('language.updated'));
                router.replace("/profile");
            } else {
                Alert.alert("Success", t('language.updated'), [
                    { text: "OK", onPress: () => router.replace("/profile") },
                ]);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", t('language.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <LightScreen>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity 
                        onPress={() => { router.push('/profile') }} 
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                <SplitTitle 
                    first={t('language.titleFirst')} 
                    second={t('language.titleSecond')} 
                    style={styles.title} 
                />
                
                <GlassCardOnLight style={styles.settingsCard}>
                    {LANGUAGES.map((item, index) => {
                        const isLast = index === LANGUAGES.length - 1;

                        return (
                            <TouchableOpacity
                                key={item.code}
                                style={[
                                    styles.settingsItem,
                                    !isLast && styles.settingsItemBorder,
                                ]}
                                onPress={() => setLanguage(item.code)}
                            >
                                <View style={styles.settingsTextContainer}>
                                    <BodyText style={[
                                        styles.settingsTitle, 
                                        language === item.code && styles.highlightText
                                    ]}>
                                        {item.label}
                                    </BodyText>
                                </View>
                
                                <Ionicons
                                    name={language === item.code ? "checkmark-circle" : "chevron-forward"}
                                    size={20}
                                    color={language === item.code ? "#2DD4BF" : "#94A3B8"}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </GlassCardOnLight>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <BodyText style={styles.saveText}>
                        {loading ? t('language.saving') : t('language.saveChanges')}
                    </BodyText>
                </TouchableOpacity>

            </View>
        </LightScreen>
    )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 0,
    paddingBottom: 12,
  },
  backButton: {
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(241,245,249,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    color: "#0F172A",
    fontWeight: "700",
    marginVertical: 20,
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
  highlightText: {
    color: "#2DD4BF",
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
  saveButton: {
    marginTop: 24,
    backgroundColor: "#2DD4BF",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});