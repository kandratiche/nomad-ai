import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Clock, MapPin, Crown } from "lucide-react-native";
import { GoldBorderCard } from "./ui/GoldBorderCard";
import { VerifiedBadge } from "./ui/VerifiedBadge";
import { PartyProgress } from "./PartyProgress";
import type { DBTour } from "@/services/toursService";

interface Props {
  tour: DBTour;
  onPress: () => void;
}

export function TourCard({ tour, onPress }: Props) {
  const { t } = useTranslation();
  const isPremium = tour.is_premium || tour.guide_verified;
  const isPartnerTour = !!tour.partner_name;
  const pricePerPerson = isPartnerTour
    ? (tour.price_per_person || 0)
    : (tour.max_people > 0 ? Math.round((tour.price_per_person || 0) / tour.max_people) : (tour.price_per_person || 0));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.wrapper}>
      <GoldBorderCard isPremium={isPremium}>
        {tour.image_url ? (
          <Image source={{ uri: tour.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Crown size={32} color="#2DD4BF" />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.title} numberOfLines={1}>{tour.title}</Text>
            {isPremium && <VerifiedBadge size="sm" />}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color="#94A3B8" />
              <Text style={styles.metaText}>{tour.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color="#94A3B8" />
              <Text style={styles.metaText}>{tour.duration_hours}h</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>{tour.description}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t("tourCard.from")}</Text>
            <Text style={styles.price}>{pricePerPerson.toLocaleString()} ₸</Text>
            <Text style={styles.priceLabel}>{t("tourCard.perPerson")}</Text>
          </View>

          <View style={styles.guideRow}>
            {tour.guide_avatar ? (
              <Image source={{ uri: tour.guide_avatar }} style={styles.guideAvatar} />
            ) : (
              <View style={[styles.guideAvatar, { backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ color: "#2DD4BF", fontWeight: "700", fontSize: 12 }}>
                  {(tour.guide_name || "G")[0]}
                </Text>
              </View>
            )}
            <Text style={styles.guideName}>{tour.guide_name}</Text>
            {tour.guide_verified && <VerifiedBadge size="sm" />}
          </View>

          <PartyProgress
            current={tour.participant_count || 0}
            max={tour.max_people}
            priceTotal={tour.price_per_person}
            isPartnerTour={isPartnerTour}
          />
        </View>
      </GoldBorderCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20, },
  image: { width: "100%", height: 160 },
  imagePlaceholder: {
    backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center",
  },
  content: { padding: 16, gap: 10, },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: "black", marginRight: 8 },
  metaRow: { flexDirection: "row", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: "black", fontSize: 13 },
  description: { color: "black", fontSize: 13, lineHeight: 18 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  priceLabel: { color: "black", fontSize: 12 },
  price: { color: "#2DD4BF", fontSize: 22, fontWeight: "800" },
  guideRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  guideAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: "#2DD4BF" },
  guideName: { color: "black", fontSize: 13, fontWeight: "600" },
});
