import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

interface LightScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function LightScreen({ children, style }: LightScreenProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["#E0F2FE", "#FEFCE8", "#F8FAFC"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeContent} edges={["top", "left", "right"]}>
        <View style={styles.grid} pointerEvents="none">
          {Array.from({ length: 50 }).map((_, i) => (
            <View key={i} style={styles.gridRow}>
              {Array.from({ length: 8 }).map((_, j) => (
                <View key={j} style={styles.gridDot} />
              ))}
            </View>
          ))}
        </View>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeContent: {
    flex: 1,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  gridDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#94A3B8",
  },
});
