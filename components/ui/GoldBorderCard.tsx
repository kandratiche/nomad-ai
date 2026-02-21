import React from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  borderWidth?: number;
  isPremium?: boolean;
}

export function GoldBorderCard({ children, style, borderWidth = 2, isPremium = true }: Props) {
  if (!isPremium) {
    return (
      <View style={[styles.card, styles.normalBorder, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FFBF00", "#FFD700", "#FFBF00", "rgba(255,191,0,0.2)", "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientBorder, { padding: borderWidth, borderRadius: 22 }, style]}
    >
      <View style={styles.innerCard}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    shadowColor: "#FFBF00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  innerCard: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
  },
  normalBorder: {
  shadowColor: "#2DD4BF",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 10,

  elevation: 6,
},
});
