import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/authContext";
import { INTEREST_IMAGES } from "../auth/vibe-check";
import { INTERESTS } from "@/constants/mockData";
import { LightScreen } from "@/components/ui/LightScreen";
import { ScrollView } from "react-native-gesture-handler";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import { SplitTitle } from "@/components/ui/SplitTitle";
import { Image, Text } from "react-native";
import { Button } from "react-native-paper";
import supabase from "@/lib/supabaseClient";

export default function EditInterestScreen() {
    const { t } = useTranslation();
    const { user, setUser } = useContext(AuthContext);

    const interestsString = user?.interests;
    const interestsArray = JSON.parse(interestsString || "[]");
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
        if (interests.length === 0) return alert(t('editInterest.selectAtLeast'));
        if (!user?.id) return alert(t('editInterest.userNotFound'));

        try {
            setIsLoading(true);
            const { data: updatedProfile, error } = await supabase
                .from("users")
                .update({ interests: Array.from(interests) })
                .eq("id", user.id)
                .select()
                .single();

            if (error) throw error;

            setUser(updatedProfile);
            router.replace("/profile");
        } catch (error) {
            setIsLoading(false);
            console.error("Error updating user profile:", error);
            alert(t('editInterest.updateFailed'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <LightScreen>
            <ScrollView style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.push("/profile")} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#0F172A" />
                    </TouchableOpacity>
                </View>

                <SplitTitle 
                    first={t('editInterest.titleFirst')} 
                    second={t('editInterest.titleSecond')} 
                />

                <View style={styles.grid}>
                    {INTERESTS.map((item) => {
                        const isSelected = interests.includes(item.id);
                        const imageUrl = INTEREST_IMAGES[item.id] || INTEREST_IMAGES.local;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggle(item.id)}
                                activeOpacity={0.9}
                                style={styles.gridItem}
                            >
                                <View style={[styles.card, isSelected && styles.cardSelected]}>
                                    <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
                                    <View style={styles.overlay} />
                                    <Text style={styles.cardText} numberOfLines={2}>
                                        {item.label.toUpperCase()}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkmark}>
                                            <Ionicons name="checkmark" size={16} color="#FFF" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={styles.saveContainer}>
                <Button 
                    style={styles.saveButton} 
                    labelStyle={styles.saveButtonText}
                    onPress={() => handleSave()}
                >
                    {isLoading ? t('editInterest.saving') : t('editInterest.save')}
                </Button>
            </View>
        </LightScreen>
    )
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
    marginBottom: 128,
  },
  gridItem: {
    width: "47%",
  },
  card: {
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#2DD4BF",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardText: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  checkmark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
  },
  saveContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 20,
    marginTop: 16,
  },
  saveButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    backgroundColor: "#2DD4BF",
  },
  saveButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 18,
  },
});