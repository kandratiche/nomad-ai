import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZES = {
  sm: { icon: 14, badge: 22, fontSize: 10 },
  md: { icon: 16, badge: 28, fontSize: 11 },
  lg: { icon: 20, badge: 34, fontSize: 12 },
};

export function VerifiedBadge({ size = "md", label }: Props) {
  const glow = useSharedValue(0.4);
  const s = SIZES[size];

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value,
  }));

  return (
    <Animated.View style={[styles.badge, { width: label ? undefined : s.badge, height: s.badge, borderRadius: s.badge / 2 }, glowStyle]}>
      <ShieldCheck size={s.icon} color="#0F172A" strokeWidth={2.5} />
      {label && <Text style={[styles.label, { fontSize: s.fontSize }]}>{label}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFBF00",
    paddingHorizontal: 8,
    gap: 4,
    shadowColor: "#FFBF00",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 6,
  },
  label: {
    color: "#0F172A",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
