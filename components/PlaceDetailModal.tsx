import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TimelineStop } from "@/types";

interface Props {
  visible: boolean;
  stop: TimelineStop | null;
  onClose: () => void;
}

// Price level → display
const PRICE_LABELS: Record<number, { label: string; range: string }> = {
  0: { label: "Бесплатно", range: "" },
  1: { label: "Бюджетно", range: "₸500 – 2 000" },
  2: { label: "Средне", range: "₸2 000 – 5 000" },
  3: { label: "Выше среднего", range: "₸5 000 – 10 000" },
  4: { label: "Премиум", range: "₸10 000 – 25 000" },
  5: { label: "Люкс", range: "₸25 000+" },
};

// Generate AI tips based on tags and type
function generateTips(stop: TimelineStop): string[] {
  const tips: string[] = [];
  const tags = (stop.tags || []).map((t) => t.toLowerCase());
  const type = (stop.type || "").toLowerCase();

  if (tags.includes("family") || tags.includes("kids") || tags.includes("playground"))
    tips.push("Подходит для семьи с детьми");
  if (tags.includes("romantic") || tags.includes("date"))
    tips.push("Отличное место для свидания");
  if (tags.includes("outdoor") || tags.includes("nature") || tags.includes("park"))
    tips.push("На открытом воздухе — оденьтесь по погоде");
  if (tags.includes("cozy") || tags.includes("wifi") || tags.includes("work"))
    tips.push("Уютное место для работы с ноутбуком");
  if (tags.includes("food") || tags.includes("kazakh") || tags.includes("traditional"))
    tips.push("Попробуйте казахскую кухню");
  if (tags.includes("free"))
    tips.push("Бесплатный вход");
  if (tags.includes("crowded"))
    tips.push("Может быть людно — лучше приходить утром");
  if (tags.includes("view") || tags.includes("sunset") || tags.includes("photo"))
    tips.push("Отличное место для фотографий");
  if (tags.includes("indoor"))
    tips.push("Подходит для любой погоды");
  if (type === "museum" || tags.includes("museum"))
    tips.push("Планируйте 1-2 часа на осмотр");
  if (type === "cafe" || type === "restaurant" || tags.includes("coffee"))
    tips.push("Рекомендуем забронировать столик заранее");

  if (stop.verified) tips.push("Проверенное место ✓");

  return tips.slice(0, 4);
}

// Type → display name
function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    cafe: "Кафе",
    restaurant: "Ресторан",
    attraction: "Достопримечательность",
    park: "Парк",
    museum: "Музей",
    culture: "Культура",
    shopping: "Шоппинг",
    sports: "Спорт",
    entertainment: "Развлечения",
  };
  return map[(type || "").toLowerCase()] || type || "";
}

export default function PlaceDetailModal({ visible, stop, onClose }: Props) {
  if (!stop) return null;

  const price = PRICE_LABELS[stop.priceLevel || 0] || PRICE_LABELS[0];
  const tips = generateTips(stop);
  const isFood = ["cafe", "restaurant"].includes((stop.type || "").toLowerCase());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {/* Hero Image */}
            <View style={styles.imageContainer}>
              {stop.imageUrl ? (
                <Image source={{ uri: stop.imageUrl }} style={styles.heroImage} resizeMode="cover" />
              ) : (
                <View style={[styles.heroImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={48} color="#CBD5E1" />
                </View>
              )}
              <View style={styles.imageOverlay}>
                {stop.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                    <Text style={styles.verifiedText}>Проверено</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.detailContent}>
              {/* Title & Type */}
              <View style={styles.titleRow}>
                <Text style={styles.title}>{stop.title}</Text>
                {getTypeLabel(stop.type) ? (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{getTypeLabel(stop.type)}</Text>
                  </View>
                ) : null}
              </View>

              {/* Rating & Safety */}
              <View style={styles.statsRow}>
                {stop.rating != null && stop.rating > 0 && (
                  <View style={styles.statChip}>
                    <Ionicons name="star" size={14} color="#FACC15" />
                    <Text style={styles.statText}>{stop.rating.toFixed(1)}</Text>
                  </View>
                )}
                <View style={[styles.statChip, { backgroundColor: stop.safetyLevel === "safe" ? "#ECFDF5" : "#FEF3C7" }]}>
                  <Ionicons name="shield-checkmark" size={14} color={stop.safetyLevel === "safe" ? "#10B981" : "#F59E0B"} />
                  <Text style={[styles.statText, { color: stop.safetyLevel === "safe" ? "#10B981" : "#F59E0B" }]}>
                    {stop.safetyScore}%
                  </Text>
                </View>
                {stop.reviewCount != null && stop.reviewCount > 0 && (
                  <View style={styles.statChip}>
                    <Ionicons name="chatbubble-outline" size={13} color="#64748B" />
                    <Text style={styles.statText}>{stop.reviewCount} отзывов</Text>
                  </View>
                )}
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {stop.tags.map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Description */}
              {stop.description ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Описание</Text>
                  <Text style={styles.descriptionText}>{stop.description}</Text>
                </View>
              ) : null}

              {/* Price / Average Check */}
              {(stop.priceLevel || 0) > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    {isFood ? "Средний чек" : "Стоимость"}
                  </Text>
                  <View style={styles.priceRow}>
                    <View style={styles.priceChips}>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <Text
                          key={level}
                          style={[
                            styles.priceDot,
                            level <= (stop.priceLevel || 0) ? styles.priceDotActive : {},
                          ]}
                        >
                          ₸
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.priceLabel}>
                      {price.label}{price.range ? ` • ${price.range}` : ""}
                    </Text>
                  </View>
                </View>
              )}

              {/* Opening Hours */}
              {stop.openingHours && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Время работы</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={16} color="#2DD4BF" />
                    <Text style={styles.infoText}>{stop.openingHours}</Text>
                  </View>
                </View>
              )}

              {/* Address */}
              {stop.address && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Адрес</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={16} color="#2DD4BF" />
                    <Text style={styles.infoText}>{stop.address}</Text>
                  </View>
                </View>
              )}

              {/* Distance */}
              {stop.distanceKm != null && (
                <View style={styles.infoRow}>
                  <Ionicons name="navigate-outline" size={16} color="#A78BFA" />
                  <Text style={styles.infoText}>
                    {stop.distanceKm < 1
                      ? `${Math.round(stop.distanceKm * 1000)} м от предыдущей точки`
                      : `${stop.distanceKm.toFixed(1)} км от предыдущей точки`}
                  </Text>
                </View>
              )}

              {/* AI Tips */}
              {tips.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Советы</Text>
                  {tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Text style={styles.tipIcon}>💡</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Contact / Menu */}
              {stop.contact && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    const url = stop.contact!.startsWith("http") ? stop.contact! : `tel:${stop.contact}`;
                    Linking.openURL(url).catch(() => {});
                  }}
                >
                  <Ionicons name="call-outline" size={18} color="#FFF" />
                  <Text style={styles.actionButtonText}>Связаться</Text>
                </TouchableOpacity>
              )}

              {/* Food-specific: Menu prompt */}
              {isFood && (
                <View style={styles.menuHint}>
                  <Ionicons name="restaurant-outline" size={16} color="#64748B" />
                  <Text style={styles.menuHintText}>
                    Меню можно посмотреть на месте или запросить у заведения
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: Dimensions.get("window").height * 0.88,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    height: 220,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  detailContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceChips: {
    flexDirection: "row",
    gap: 2,
  },
  priceDot: {
    fontSize: 16,
    color: "#CBD5E1",
    fontWeight: "700",
  },
  priceDotActive: {
    color: "#10B981",
  },
  priceLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
    backgroundColor: "#FFFBEB",
    padding: 10,
    borderRadius: 10,
  },
  tipIcon: {
    fontSize: 14,
  },
  tipText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2DD4BF",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  menuHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuHintText: {
    fontSize: 13,
    color: "#64748B",
    flex: 1,
  },
});
