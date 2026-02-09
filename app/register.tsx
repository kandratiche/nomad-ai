import { LightScreen } from "@/components/ui/LightScreen";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TextInput, TouchableOpacity, Platform, Alert } from "react-native";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { StyleSheet } from "react-native";
import supabase from "@/lib/supabaseClient";
import { AuthContext } from "@/context/authContext";

export default function UserRegister() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { user, setUser } = useContext(AuthContext);

const handleRegister = async () => {
  if (!email || !password || !confirmPassword || !name) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match");
    return;
  }

  if (password.length < 6) {
    Alert.alert("Error", "Password must be at least 6 characters");
    return;
  }

  setLoading(true);

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert("Registration Failed", authError.message);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) throw new Error("User ID not returned");

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .update({ name })
      .eq("id", userId)
      .select()
      .single();

    if (profileError) {
      Alert.alert("Error", profileError.message);
      return;
    }

    console.log("User registered:", profileData);

    setUser(profileData); // update context
    router.replace("/city-select"); // immediate redirect

  } catch (err: any) {
    console.error("Unexpected error:", err);
    Alert.alert("Error", err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  return (
    <LightScreen>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <SplitTitle first="Register " second="Account" style={styles.title} />

        <View style={styles.screenContainer}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
              <TextInput
                placeholder="Enter the name"
                value={name}
                onChangeText={setName}
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="name"
                style={styles.input}
                placeholderTextColor="#94A3B8"
                returnKeyType="next"
                editable={!loading}
              />
            </GlassCardOnLight>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
              <TextInput
                placeholder="Enter the email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                placeholderTextColor="#94A3B8"
                returnKeyType="next"
                editable={!loading}
              />
            </GlassCardOnLight>
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                returnKeyType="next"
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </GlassCardOnLight>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                style={styles.input}
                editable={!loading}
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </GlassCardOnLight>
          </View>

          {/* Register Button */}
          <View style={styles.fieldContainer}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginLeft: 0,
        paddingBottom: 12,
    },
    backButton: {
        top: 24,
        left: 24,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(241,245,249,0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        marginTop: 50,
        marginBottom: 20,
        marginLeft: 24,
    },
    glassCard: {
        borderRadius: 24,
        marginBottom: 20,
    },
    glassCardContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        color: "#0F172A",
        fontSize: 16,
        paddingVertical: 4,
        ...(Platform.OS === 'web' && { outlineStyle: 'none' })
    },
    fieldContainer: {
        marginBottom: 8,
        width: "90%",
    },
    screenContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 124,
    },
    button: {
        width: '100%',
        marginTop: 12,
        borderRadius: 24,
        backgroundColor: "#2DD4BF",
        paddingVertical: 16,
        paddingHorizontal: 16,
        alignItems: 'center',  
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "600",
    }
});