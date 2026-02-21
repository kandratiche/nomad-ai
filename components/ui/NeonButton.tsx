import React, { useEffect } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: "gold" | "teal" | "dark";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const VARIANTS = {
  gold: { bg: "#2DD4BF", text: "#0F172A", shadow: "#2DD4BF" },
  teal: { bg: "#2DD4BF", text: "#0F172A", shadow: "#2DD4BF" },
  dark: { bg: "#2DD4BF", text: "#FFF", shadow: "#2DD4BF" },
};

export function NeonButton({ title, onPress, icon, variant = "gold", loading, disabled, style }: Props) {
  const glow = useSharedValue(0.3);
  const v = VARIANTS[variant];

  useEffect(() => {
    if (variant === "gold") {
      glow.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    shadowOpacity: variant === "gold" ? glow.value : 0.3,
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        { backgroundColor: v.bg, shadowColor: v.shadow, opacity: disabled ? 0.5 : 1 },
        animStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: v.text }]}>{title}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
