import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import * as ImagePicker from "expo-image-picker";
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
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permission needed", "Allow access to photos to set your avatar.");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.[0]) return;

        setUploading(true);
        try {
            const asset = result.assets[0];
            const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD ?? "YOUR_CLOUD_NAME";
            const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET ?? "avatars_unsigned";

            const formData = new FormData();
            formData.append("file", {
                uri: asset.uri,
                type: "image/jpeg",
                name: `avatar_${user.id}.jpg`,
            } as any);
            formData.append("upload_preset", uploadPreset);
            formData.append("folder", "travelme_avatars");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: "POST", body: formData },
            );
            const json = await res.json();

            if (!json.secure_url) {
                Alert.alert("Upload failed", json.error?.message || "Unknown error");
                return;
            }
            setAvatarUrl(json.secure_url);
        } catch (err: any) {
            console.error("Image upload error:", err);
            Alert.alert("Error", err.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        const userId = user?.id;
        if (!userId) return alert(t('editProfile.userNotFound'));
        try {
            setLoading(true);

            const updatePayload: any = { name, phone_number: phoneNumber };
            if (avatarUrl) updatePayload.avatar_url = avatarUrl;

            const { data: profileData, error: profileError } = await supabase
                .from("users")
                .update(updatePayload)
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

                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.avatarPicker}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={36} color="#2DD4BF" />
                            </View>
                        )}
                        <View style={styles.cameraIcon}>
                            {uploading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="camera" size={16} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Tap to change photo</Text>
                </View>

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
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarPicker: {
    position: "relative",
    width: 90,
    height: 90,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#2DD4BF",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#2DD4BF",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  avatarHint: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 13,
  },
});