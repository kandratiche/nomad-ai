import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Animated,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HOLD_DURATION_MS = 1500;

type SafetyButtonVariant = "floating" | "header" | "compact";

interface SafetyButtonProps {
  variant?: SafetyButtonVariant;
  onEmergencyCall?: () => void;
  onContactGuide?: () => void;
  guideWhatsAppNumber?: string;
}

export function SafetyButton({
  variant = "floating",
  onEmergencyCall,
  onContactGuide,
  guideWhatsAppNumber = "77001234567",
}: SafetyButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.15,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showEmergencyOptions = () => {
    triggerScale();
    Alert.alert(
      "Emergency Options",
      "Choose an action:",
      [
        {
          text: "Call 112 (Emergency)",
          onPress: () => {
            onEmergencyCall?.();
            Linking.openURL("tel:112");
          },
        },
        {
          text: "Contact Guide (WhatsApp)",
          onPress: () => {
            onContactGuide?.();
            const url = `https://wa.me/${guideWhatsAppNumber.replace(/\D/g, "")}`;
            Linking.openURL(url);
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handlePressIn = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: HOLD_DURATION_MS,
      useNativeDriver: false,
    }).start();
    holdTimer.current = setTimeout(() => {
      showEmergencyOptions();
    }, HOLD_DURATION_MS);
  };

  const handlePressOut = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
  };

  const isFloating = variant === "floating";
  const isHeader = variant === "header";
  const isCompact = variant === "compact";

  const buttonContent = (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.touchable,
        isFloating && styles.floatingTouchable,
        isHeader && styles.headerTouchable,
        isCompact && styles.compactTouchable,
      ]}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          isFloating && styles.floatingIconWrapper,
          isHeader && styles.headerIconWrapper,
          isCompact && styles.compactIconWrapper,
          { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
        ]}
      >
        <Ionicons name="shield-checkmark" size={isCompact ? 18 : 24} color="#EF4444" />
      </Animated.View>
      {!isCompact && (
        <Text style={[styles.label, isHeader && styles.headerLabel]}>SOS</Text>
      )}
    </TouchableOpacity>
  );

  if (isFloating) {
    return (
      <View style={styles.floatingContainer} pointerEvents="box-none">
        {buttonContent}
      </View>
    );
  }

  return buttonContent;
}

const styles = StyleSheet.create({
  touchable: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingTouchable: {
    padding: 4,
  },
  headerTouchable: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactTouchable: {
    padding: 6,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  floatingIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  compactIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  headerLabel: {
    fontSize: 13,
  },
  floatingContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
});
