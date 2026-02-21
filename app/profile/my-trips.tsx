import React, { useContext, useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text
} from "react-native";
import { router } from "expo-router";
import { useTranslation } from 'react-i18next';
import { LightScreen } from "@/components/ui/LightScreen";
import { GlassCardOnLight } from "@/components/ui/GlassCard";
import { AuthContext } from "@/context/authContext";
import { Ionicons } from "@expo/vector-icons";
import { SplitTitle } from "@/components/ui/SplitTitle";

export default function MyTripsScreen() {
    const { t } = useTranslation();
    const { user, setUser } = useContext(AuthContext);

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
                    first={t('myTrips.titleFirst')} 
                    second={t('myTrips.titleSecond')} 
                    style={styles.title} 
                />

                <GlassCardOnLight style={styles.card}>
                    {user.trips_completed === 0 ? (
                        <Text style={[styles.label, { fontSize: 20 }]}>{t("myTrips.noTrips")}</Text>                        
                    ) : (
                        <Text style={styles.label}>Not ready yet</Text>
                    )}
                </GlassCardOnLight>


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