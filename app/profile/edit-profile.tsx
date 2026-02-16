import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Text
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { SplitTitle } from "@/components/ui/SplitTitle";

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const { user, setUser } = useContext(AuthContext);

    const [name, setName] = useState(user?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        const userId = user?.id;
        if (!userId) return alert(t('editProfile.userNotFound'));
        try {
            setLoading(true);

            const { data: profileData, error: profileError } = await supabase
                .from("users")
                .update({ name: name, phone_number: phoneNumber })
                .eq("id", userId)
                .select()
                .single();

            if (profileError) {
                Alert.alert(t('editProfile.error'), profileError.message);
                return;
            }

            setUser(profileData);

            if (Platform.OS === "web") {
                alert(t('editProfile.updated'));
                router.replace("/profile");
            } else {
                Alert.alert(t('editProfile.success'), t('editProfile.updated'), [
                    { text: "OK", onPress: () => router.replace("/profile") },
                ]);
            }

        } catch (err) {
            console.error(err);
            Alert.alert(t('editProfile.error'), t('editProfile.somethingWrong'));
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
                    first={t('editProfile.titleFirst')} 
                    second={t('editProfile.titleSecond')} 
                    style={styles.title} 
                />

                <GlassCardOnLight style={styles.card}>
                    <BodyText style={styles.label}>{t('editProfile.yourName')}</BodyText>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholder={t('editProfile.enterName')}
                    />

                    <BodyText style={styles.label}>{t('editProfile.phoneNumber')}</BodyText>
                    <TextInput
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        style={styles.input}
                        keyboardType="phone-pad"
                        placeholder={t('editProfile.enterPhone')}
                    />
                    
                    {error && (
                        <Text style={{ color: "red", marginTop: 8 }}>
                            {error}
                        </Text>
                    )}
                </GlassCardOnLight>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <BodyText style={styles.saveText}>
                        {loading ? t('editProfile.saving') : t('editProfile.save')}
                    </BodyText>
                </TouchableOpacity>

            </View>
        </LightScreen>
    );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  card: {
    padding: 20,
    borderRadius: 20,
  },
  label: {
    marginBottom: 6,
    color: "#64748B",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.7)",
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