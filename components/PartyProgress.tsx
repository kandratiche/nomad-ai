import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Users } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface Props {
  current: number;
  max: number;
  priceTotal: number;
  isPartnerTour?: boolean;
  participants?: { user_avatar?: string; user_name?: string }[];
}

export function PartyProgress({ current, max, priceTotal, isPartnerTour = false, participants = [] }: Props) {
  const progress = useSharedValue(0);
  const fraction = Math.min(current / max, 1);
  const pricePerPerson = isPartnerTour ? (priceTotal || 0) : (max > 0 ? Math.round((priceTotal || 0) / max) : (priceTotal || 0));
  const currentPricePerPerson = isPartnerTour ? (priceTotal || 0) : (current > 0 ? Math.round((priceTotal || 0) / Math.max(current, 1)) : (priceTotal || 0));

  useEffect(() => {
    progress.value = withTiming(fraction, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [fraction]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  const isFull = current >= max;
  const squadLevel = fraction >= 1 ? "GOLD" : fraction >= 0.6 ? "SILVER" : fraction > 0 ? "BRONZE" : null;
  const squadColor = squadLevel === "GOLD" ? "#FFD700" : squadLevel === "SILVER" ? "#C0C0C0" : "#CD7F32";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.countRow}>
          <Users size={16} color="#FFBF00" />
          <Text style={styles.countText}>
            {current}/{max} joined
          </Text>
          {squadLevel && (
            <View style={[styles.squadBadge, { backgroundColor: squadColor + "22", borderColor: squadColor }]}>
              <Text style={[styles.squadBadgeText, { color: squadColor }]}>{squadLevel}</Text>
            </View>
          )}
        </View>
        {!isFull && (
          <Text style={styles.priceHint}>
            Price drops to{" "}
            <Text style={styles.priceGold}>{pricePerPerson.toLocaleString()} ₸</Text>
            /person!
          </Text>
        )}
        {isFull && <Text style={styles.fullText}>SQUAD COMPLETE</Text>}
      </View>

      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, barStyle]} />
      </View>

      {current > 0 && currentPricePerPerson !== pricePerPerson && (
        <Text style={styles.currentPrice}>
          Current: {currentPricePerPerson.toLocaleString()} ₸/person
        </Text>
      )}

      {participants.length > 0 && (
        <View style={styles.avatarRow}>
          {participants.slice(0, 6).map((p, i) => (
            <View key={i} style={[styles.avatarWrap, { marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i }]}>
              {p.user_avatar ? (
                <Image source={{ uri: p.user_avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(p.user_name || "U")[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {participants.length > 6 && (
            <View style={[styles.avatarWrap, { marginLeft: -10 }]}>
              <View style={[styles.avatar, styles.avatarMore]}>
                <Text style={styles.avatarMoreText}>+{participants.length - 6}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", gap: 16, alignItems: "center" },
  countRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  countText: { color: "black", fontWeight: "700", fontSize: 14 },
  priceHint: { color: "black", fontSize: 12 },
  priceGold: { color: "#2DD4BF", fontWeight: "800" },
  fullText: { color: "#10B981", fontWeight: "800", fontSize: 12, letterSpacing: 1 },
  barBg: {
    height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden",
  },
  barFill: {
    height: "100%", borderRadius: 4,
    backgroundColor: "#2DD4BF",
  },
  currentPrice: { color: "black", fontSize: 12 },
  avatarRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  avatarWrap: {},
  avatar: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#2DD4BF",
  },
  avatarPlaceholder: {
    backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { color: "#2DD4BF", fontWeight: "700", fontSize: 13 },
  avatarMore: {
    backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center",
    borderColor: "#475569",
  },
  avatarMoreText: { color: "black", fontWeight: "600", fontSize: 11 },
  squadBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, marginLeft: 6,
  },
  squadBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
});
