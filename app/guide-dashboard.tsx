import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  View, Text, ScrollView, TouchableOpacity, Image, StyleSheet,
  Alert, Platform, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Crown, Plus, CheckCircle, XCircle, Users } from "lucide-react-native";
import { AuthContext } from "@/context/authContext";
import { useMyGuideTours, useUpdateParticipant } from "@/hooks/useTours";
import { NeonButton } from "@/components/ui/NeonButton";
import { GoldBorderCard } from "@/components/ui/GoldBorderCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { getTourDetails } from "@/services/toursService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function GuideDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { data: tours = [], isLoading } = useMyGuideTours(user?.id || null);
  const [expandedTour, setExpandedTour] = React.useState<string | null>(null);

  if (!user || user.roles !== "guide") {
    return (
      <View style={[styles.screen, styles.center]}>
        <Crown size={48} color="#475569" />
        <Text style={styles.emptyText}>{t("guide.onlyGuides")}</Text>
        <NeonButton title={t("tour.goBack")} onPress={() => router.back()} variant="dark" style={{ marginTop: 16 }} />
      </View>
    );
  }

  const pendingTotal = 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("guide.myTours")}</Text>
          <TouchableOpacity onPress={() => router.push("/create-tour")} style={styles.addButton}>
            <Plus size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tours.length}</Text>
            <Text style={styles.statLabel}>{t("guide.tours")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tours.filter(tour => tour.status === "active").length}</Text>
            <Text style={styles.statLabel}>{t("guide.active")}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{tours.filter(tour => tour.status === "draft").length}</Text>
            <Text style={styles.statLabel}>{t("guide.drafts")}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#FFBF00" style={{ marginTop: 40 }} />
        ) : tours.length === 0 ? (
          <View style={styles.emptyState}>
            <Crown size={48} color="#475569" />
            <Text style={styles.emptyText}>{t("guide.noTours")}</Text>
            <NeonButton
              title={t("guide.createFirst")}
              onPress={() => router.push("/create-tour")}
              icon={<Plus size={20} color="#0F172A" />}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          tours.map((tour) => (
            <TourDashboardCard
              key={tour.id}
              tour={tour}
              expanded={expandedTour === tour.id}
              onToggle={() => setExpandedTour(expandedTour === tour.id ? null : tour.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TourDashboardCard({ tour, expanded, onToggle }: { tour: any; expanded: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const { data: details, isLoading } = useQuery({
    queryKey: ["tour", tour.id],
    queryFn: () => getTourDetails(tour.id),
    enabled: expanded,
  });
  const updateParticipant = useUpdateParticipant();
  const qc = useQueryClient();

  const handleAction = (participantId: string, status: "paid" | "cancelled") => {
    updateParticipant.mutate(
      { participantId, status },
      { onSuccess: () => qc.invalidateQueries({ queryKey: ["tour", tour.id] }) },
    );
  };

  const pendingCount = details?.participants?.filter((p: any) => p.status === "pending").length || 0;

  return (
    <View style={styles.tourCard}>
      <TouchableOpacity onPress={onToggle} style={styles.tourCardHeader} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.tourTitle} numberOfLines={1}>{tour.title}</Text>
            <View style={[styles.statusPill, tour.status === "active" ? styles.activePill : styles.draftPill]}>
              <Text style={[styles.statusPillText, tour.status === "active" ? { color: "#10B981" } : { color: "#64748B" }]}>
                {tour.status}
              </Text>
            </View>
          </View>
          <Text style={styles.tourMeta}>{tour.city} · {tour.duration_hours}h · {tour.price_per_person?.toLocaleString()} ₸</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
          </View>
        )}
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.tourCardBody}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFBF00" style={{ marginVertical: 12 }} />
          ) : !details?.participants || details.participants.length === 0 ? (
            <Text style={styles.noParticipants}>{t("guide.noParticipants")}</Text>
          ) : (
            details.participants.map((p: any) => (
              <View key={p.id} style={styles.participantRow}>
                {p.user_avatar ? (
                  <Image source={{ uri: p.user_avatar }} style={styles.pAvatar} />
                ) : (
                  <View style={[styles.pAvatar, { backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }]}>
                    <Text style={{ color: "#FFBF00", fontWeight: "700", fontSize: 11 }}>{(p.user_name || "U")[0]}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.pName}>{p.user_name}</Text>
                  <Text style={[styles.pStatus, p.status === "paid" ? { color: "#10B981" } : { color: "#FFBF00" }]}>
                    {p.status === "paid" ? t("tour.confirmed") : t("tour.pending")}
                  </Text>
                </View>
                {p.status === "pending" && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={styles.actionConfirm}
                      onPress={() => handleAction(p.id, "paid")}
                    >
                      <CheckCircle size={18} color="#10B981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionReject}
                      onPress={() => handleAction(p.id, "cancelled")}
                    >
                      <XCircle size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
          <TouchableOpacity
            style={styles.viewTourButton}
            onPress={() => router.push(`/tour/${tour.id}`)}
          >
            <Text style={styles.viewTourText}>{t("guide.viewTourPage")}</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFBF00" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F172A" },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { padding: 24, paddingBottom: 60 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: "#FFF", letterSpacing: 2 },
  addButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFBF00",
    alignItems: "center", justifyContent: "center",
  },

  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  statNumber: { color: "#FFBF00", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "#64748B", fontSize: 12, marginTop: 4 },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#64748B", fontSize: 16, marginTop: 12 },

  tourCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", overflow: "hidden",
  },
  tourCardHeader: {
    flexDirection: "row", alignItems: "center", padding: 16, gap: 12,
  },
  tourTitle: { color: "#FFF", fontWeight: "700", fontSize: 15, flex: 1 },
  tourMeta: { color: "#64748B", fontSize: 12, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activePill: { backgroundColor: "rgba(16,185,129,0.15)" },
  draftPill: { backgroundColor: "rgba(100,116,139,0.15)" },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  pendingBadge: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFBF00",
    alignItems: "center", justifyContent: "center",
  },
  pendingBadgeText: { color: "#0F172A", fontSize: 11, fontWeight: "800" },

  tourCardBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  noParticipants: { color: "#475569", fontSize: 13, paddingVertical: 12, textAlign: "center" },

  participantRow: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)",
  },
  pAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: "#FFBF00" },
  pName: { color: "#FFF", fontWeight: "600", fontSize: 13 },
  pStatus: { fontSize: 11, fontWeight: "600", marginTop: 1 },
  actionConfirm: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  actionReject: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center", justifyContent: "center",
  },

  viewTourButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 12, paddingVertical: 10, borderRadius: 12,
    backgroundColor: "rgba(255,191,0,0.08)", borderWidth: 1, borderColor: "rgba(255,191,0,0.15)",
  },
  viewTourText: { color: "#FFBF00", fontSize: 13, fontWeight: "600" },
});
