import { LightScreen } from "@/components/ui/LightScreen";
import { router } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TextInput, TouchableOpacity, Platform, Alert, StyleSheet, KeyboardAvoidingView } from "react-native";
import { SplitTitle } from "@/components/ui/SplitTitle";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { registerUserApi } from "@/services/authApi";
import { AuthContext } from "@/context/authContext";
import { useTranslation } from "react-i18next";

export default function UserRegister() {
  const { t } = useTranslation();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleRegister = async () => {
  setLoading(true);
  const data = await registerUserApi({ email, password, confirmPassword, name });
  setLoading(false);

  if (!data) return;

  router.replace({
    pathname: "/auth/city-select",
    params: { new: "true" },
  });
};

  return (
    <LightScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <SplitTitle 
            first={t("userRegister.titleFirst")} 
            second={t("userRegister.titleSecond")} 
            style={styles.title} 
          />

          <View style={styles.screenContainer}>
            <View style={styles.fieldContainer}>
              <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
                <TextInput
                  placeholder={t("userRegister.namePlaceholder")}
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

            <View style={styles.fieldContainer}>
              <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
                <TextInput
                  placeholder={t("userRegister.emailPlaceholder")}
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

            <View style={styles.fieldContainer}>
              <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
                <TextInput
                  placeholder={t("userRegister.passwordPlaceholder")}
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

            <View style={styles.fieldContainer}>
              <GlassCardOnLight style={styles.glassCard} contentStyle={styles.glassCardContent}>
                <TextInput
                  placeholder={t("userRegister.confirmPasswordPlaceholder")}
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

            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => handleRegister()}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? t("userRegister.registering") : t("userRegister.register")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LightScreen>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  headerContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginLeft: 0, 
    paddingBottom: 12 
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
    justifyContent: "center" 
  },
  title: { 
    marginTop: 50, 
    marginBottom: 20, 
    marginLeft: 24 
  },
  glassCard: { 
    borderRadius: 24, 
    marginBottom: 20 
  },
  glassCardContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  input: { 
    flex: 1, 
    color: "#0F172A", 
    fontSize: 16, 
    paddingVertical: 4, 
    ...(Platform.OS === "web" && { outlineStyle: "none" }) 
  },
  fieldContainer: { 
    marginBottom: 8, 
    width: "90%" 
  },
  screenContainer: { 
    flex: 1, 
    alignItems: "center", 
    marginBottom: 124 
  },
  button: { 
    width: "100%", 
    marginTop: 12, 
    borderRadius: 24, 
    backgroundColor: "#2DD4BF", 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    alignItems: "center" 
  },
  buttonDisabled: { 
    opacity: 0.5 
  },
  buttonText: { 
    color: "#FFF", 
    fontSize: 16, 
    fontWeight: "600" 
  },
});
