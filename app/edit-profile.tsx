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
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { BodyText } from "@/components/ui/ThemedText";
import { AuthContext } from "@/context/authContext";
import supabase from "@/lib/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { SplitTitle } from "@/components/ui/SplitTitle";

export default function EditProfileScreen() {
    const { user } = useContext(AuthContext);

    const [name, setName] = useState(user?.user_metadata?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.user_metadata?.phone || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
    try {
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            data: {
                name: name,
                phone: phoneNumber,
            },
        });


        if (error) {
            setError(error.message);
            Alert.alert("Error", error.message);
            return;
        }

        if (Platform.OS === "web") {
            alert("Profile updated!");
            router.back();
        } else {
            Alert.alert("Success", "Profile updated!", [
                { text: "OK", onPress: () => router.back() },
            ]);
        }

    } catch (err) {
        console.error(err);
        Alert.alert("Error", "Something went wrong");
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

            <SplitTitle first="Edit " second="Profile" style={styles.title} />

            <GlassCardOnLight style={styles.card}>
                <BodyText style={styles.label}>Your Name</BodyText>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    placeholder="Enter your name"
                />

                <BodyText style={styles.label}>Phone Number</BodyText>
                <TextInput
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    style={styles.input}
                    keyboardType="phone-pad"
                    placeholder="Enter your phone number"
                />
                
                <Text style={{ color: "red", marginTop: 8 }}>
                    {error}
                </Text>
            </GlassCardOnLight>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
            >
                <BodyText style={styles.saveText}>
                    {loading ? "Saving..." : "Save Changes"}
                </BodyText>
            </TouchableOpacity>

            </View>
        </LightScreen>
    );
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
