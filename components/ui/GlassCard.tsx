import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  intensity?: number;
  tint?: "light" | "dark" | "default";
}

export function GlassCard({
  children,
  className = "",
  style,
  intensity = 20,
  tint = "dark",
}: GlassCardProps) {
  return (
    <View style={[styles.outer, style]} className={className}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function GlassCardOnLight({
  children,
  style,
  contentStyle,
  ...rest
}: Omit<GlassCardProps, "intensity" | "tint"> & { contentStyle?: ViewStyle }) {
  return (
    <View style={[styles.outer, styles.lightCard, style]} className={rest.className}>
      <View style={[styles.content, { backgroundColor: "rgba(255,255,255,0.85)" }, contentStyle]}>
        {children}
      </View>
    </View>
  );
}

export function GlassCardLight({ children, className, style }: Omit<GlassCardProps, "intensity" | "tint">) {
  return (
    <GlassCard className={className} style={style} intensity={25} tint="light">
      {children}
    </GlassCard>
  );
}

export function GlassCardDark({ children, className, style }: Omit<GlassCardProps, "intensity" | "tint">) {
  return (
    <GlassCard className={className} style={style} intensity={40} tint="dark">
      {children}
    </GlassCard>
  );
}

export function GlassCardPrimary({ children, className, style }: Omit<GlassCardProps, "intensity" | "tint">) {
  return (
    <View style={[styles.outer, style]} className={className}>
      <LinearGradient
        colors={["rgba(45, 212, 191, 0.15)", "rgba(45, 212, 191, 0.05)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    borderRadius: 16,
  },
  content: {
    padding: 16,
    backgroundColor: "transparent",
  },
  lightCard: {
    backgroundColor: "rgba(255,255,255,0.9)",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
});
