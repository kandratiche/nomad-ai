import React, { useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Share, Platform, Alert, ActivityIndicator, Modal, TextInput, RefreshControl, Linking,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MapPin, Clock, Users, Share2, Crown, Calendar, CheckCircle, XCircle, Instagram, Navigation, Tag } from "lucide-react-native";
import { AuthContext } from "@/context/authContext";
import { GoldBorderCard } from "@/components/ui/GoldBorderCard";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { PartyProgress } from "@/components/PartyProgress";
import TourChat from "@/components/TourChat";
import { useTourDetails, useJoinTour, useUpdateParticipant, useTourReviews, useSubmitReview } from "@/hooks/useTours";

export default function TourDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useContext(AuthContext);
  const { data: tour, isLoading, refetch } = useTourDetails(id || null);
  const joinMutation = useJoinTour();
  const updateParticipant = useUpdateParticipant();
  const { data: reviews = [] } = useTourReviews(id || null);
  const submitReviewMut = useSubmitReview();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { t } = useTranslation();

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color="#FFBF00" />
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Crown size={48} color="#475569" />
        <Text style={styles.notFound}>{t("tour.notFound")}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>{t("tour.goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPremium = tour.is_premium || tour.guide_verified;
  const isPartnerTour = !!tour.partner_name;
  const pricePerPerson = isPartnerTour ? (tour.price_per_person || 0) : (tour.max_people > 0 ? Math.round((tour.price_per_person || 0) / tour.max_people) : (tour.price_per_person || 0));
  const myParticipation = tour.participants?.find((p) => p.user_id === user?.id && p.status !== "cancelled");
  const alreadyJoined = !!myParticipation;
  const myStatus = myParticipation?.status;
  const isFull = (tour.participant_count || 0) >= tour.max_people;
  const isOwner = tour.guide_id === user?.id;

  const handleJoinPress = () => setShowConfirm(true);

  const handleConfirmJoin = () => {
    if (!user?.id) return;
    setShowConfirm(false);
    joinMutation.mutate(
      { tourId: tour.id, userId: user.id },
      {
        onSuccess: () => {
          refetch();
          const msg = "Заявка отправлена! Гид подтвердит в течение 24ч.";
          Platform.OS === "web" ? alert(msg) : Alert.alert("Заявка отправлена!", msg);
        },
        onError: (err: any) => Alert.alert("Error", err?.message || "Failed to join"),
      },
    );
  };

  const handleParticipantAction = (participantId: string, status: "paid" | "cancelled") => {
    const label = status === "paid" ? "подтвердить" : "отклонить";
    const action = () => updateParticipant.mutate(
      { participantId, status },
      { onSuccess: () => refetch() },
    );
    if (Platform.OS === "web") { action(); return; }
    Alert.alert("Подтвердить?", `Вы хотите ${label} участника?`, [
      { text: "Отмена", style: "cancel" },
      { text: label === "подтвердить" ? "Да" : "Отклонить", onPress: action },
    ]);
  };

  const handleShare = async () => {
    const deepLink = `nomadai://tour/${tour.id}`;
    const message = `🌟 ${tour.title}\n📍 ${tour.city} · ${tour.duration_hours}h\n💰 from ${pricePerPerson.toLocaleString()} ₸/person\n\nJoin my squad! ${deepLink}`;
    try {
      await Share.share({ message, title: tour.title });
    } catch {}
  };

  const startDate = tour.start_date ? new Date(tour.start_date) : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2DD4BF" />}
      >
        <View style={styles.imageContainer}>
          {tour.image_url ? (
            <Image source={{ uri: tour.image_url }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={[styles.heroImage, styles.imagePlaceholder]}>
              <Crown size={48} color="#2DD4BF" />
            </View>
          )}
          <TouchableOpacity onPress={() => router.replace("/explore")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Share2 size={20} color="#FFF" />
          </TouchableOpacity>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={14} color="#0F172A" />
              <Text style={styles.premiumText}>{t("tour.premium")}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{tour.title}</Text>
            {isPremium && <VerifiedBadge size="md" />}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#2DD4BF" />
              <Text style={styles.metaText}>{tour.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#2DD4BF" />
              <Text style={styles.metaText}>{tour.duration_hours}h</Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color="#2DD4BF" />
              <Text style={styles.metaText}>max {tour.max_people}</Text>
            </View>
          </View>

          {startDate && (
            <View style={styles.dateRow}>
              <Calendar size={16} color="#A78BFA" />
              <Text style={styles.dateText}>
                {startDate.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
          )}

          <GoldBorderCard isPremium={isPremium} style={{ marginTop: 16 }}>
            <View style={{ padding: 16 }}>
              <Text style={styles.description}>{tour.description || t("tour.noDescription")}</Text>
            </View>
          </GoldBorderCard>

          {tour.partner_name && (
            <TouchableOpacity
              style={styles.partnerBadge}
              onPress={() => tour.partner_instagram && Linking.openURL(tour.partner_instagram)}
              activeOpacity={tour.partner_instagram ? 0.7 : 1}
            >
              <View style={styles.partnerLeft}>
                <View style={styles.partnerIcon}>
                  <Crown size={16} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.partnerName}>{tour.partner_name}</Text>
                  <Text style={styles.partnerLabel}>Партнёр</Text>
                </View>
              </View>
              {tour.partner_instagram && (
                <View style={styles.instagramBtn}>
                  <Instagram size={16} color="#E1306C" />
                  <Text style={styles.instagramText}>Instagram</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {tour.itinerary && tour.itinerary.length > 0 && (
            <View style={styles.itinerarySection}>
              <Text style={styles.sectionTitle}>ПРОГРАММА ТУРА</Text>
              {tour.itinerary.map((item, idx) => {
                const showDayHeader = item.day && (idx === 0 || tour.itinerary![idx - 1]?.day !== item.day);
                return (
                  <React.Fragment key={idx}>
                    {showDayHeader && (
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayHeaderText}>День {item.day}</Text>
                      </View>
                    )}
                    <View style={styles.itineraryItem}>
                      <View style={styles.itineraryDot} />
                      {item.time && <Text style={styles.itineraryTime}>{item.time}</Text>}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itineraryTitle}>{item.title}</Text>
                        {item.desc && <Text style={styles.itineraryDesc}>{item.desc}</Text>}
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {tour.included && tour.included.length > 0 && (
            <View style={styles.includedSection}>
              <Text style={styles.sectionTitle}>ВКЛЮЧЕНО В СТОИМОСТЬ</Text>
              <View style={styles.includedChips}>
                {tour.included.map((item, idx) => (
                  <View key={idx} style={styles.includedChip}>
                    <CheckCircle size={12} color="#10B981" />
                    <Text style={styles.includedChipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {tour.available_dates && tour.available_dates.length > 0 && (
            <View style={styles.datesSection}>
              <Text style={styles.sectionTitle}>ВЫБЕРИТЕ ДАТУ</Text>
              <View style={styles.datesChips}>
                {tour.available_dates.map((d, idx) => {
                  const isSelected = selectedDate === d;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                      onPress={() => setSelectedDate(isSelected ? null : d)}
                      activeOpacity={0.7}
                    >
                      <Calendar size={12} color={isSelected ? "#FFF" : "#A78BFA"} />
                      <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {(tour.pickup_location || tour.pickup_time) && (
            <View style={styles.pickupSection}>
              <Text style={styles.sectionTitle}>ТОЧКА СБОРА</Text>
              <View style={styles.pickupCard}>
                <Navigation size={18} color="#2DD4BF" />
                <View style={{ flex: 1 }}>
                  {tour.pickup_time && (
                    <Text style={styles.pickupTime}>{tour.pickup_time}</Text>
                  )}
                  {tour.pickup_location && (
                    <Text style={styles.pickupAddress}>{tour.pickup_location}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>{t("tour.pricePerPerson")}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{pricePerPerson.toLocaleString()}</Text>
              <Text style={styles.priceCurrency}>₸</Text>
            </View>
            <Text style={styles.priceTotal}>
              {isPartnerTour ? "Цена за 1 человека за тур" : `Total: ${tour.price_per_person.toLocaleString()} ₸ for ${tour.max_people} people`}
            </Text>
            {tour.child_discount != null && tour.child_discount > 0 && (
              <View style={styles.childDiscountRow}>
                <Tag size={12} color="#A78BFA" />
                <Text style={styles.childDiscountText}>
                  Скидка детям: -{tour.child_discount.toLocaleString()} ₸
                </Text>
              </View>
            )}
          </View>

          <View style={styles.partySection}>
            <Text style={styles.sectionTitle}>{t("tour.squadStatus")}</Text>
            <PartyProgress
              current={tour.participant_count || 0}
              max={tour.max_people}
              priceTotal={tour.price_per_person}
              isPartnerTour={isPartnerTour}
              participants={tour.participants}
            />
          </View>

          <TouchableOpacity onPress={() => router.push(`/guide/${tour.guide_id}`)} style={styles.guideCard}>
            {tour.guide_avatar ? (
              <Image source={{ uri: tour.guide_avatar }} style={styles.guideAvatar} />
            ) : (
              <View style={[styles.guideAvatar, styles.guideAvatarPlaceholder]}>
                <Text style={{ color: "#2DD4BF", fontWeight: "700" }}>{(tour.guide_name || "G")[0]}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.guideName}>{tour.guide_name}</Text>
              <Text style={styles.guideLabel}>{t("tour.yourGuide")}</Text>
            </View>
            {tour.guide_verified && <VerifiedBadge size="sm" label="VERIFIED" />}
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>

          <View style={styles.reviewsSection}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>{t("tour.reviews")} ({reviews.length})</Text>
              {alreadyJoined && myStatus === "paid" && (
                <TouchableOpacity onPress={() => setShowReviewModal(true)} style={styles.writeReviewBtn}>
                  <Ionicons name="star" size={14} color="#2DD4BF" />
                  <Text style={styles.writeReviewText}>{t("tour.writeReview")}</Text>
                </TouchableOpacity>
              )}
            </View>
            {reviews.length > 0 && (
              <View style={styles.ratingOverview}>
                <Text style={styles.ratingBig}>
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </Text>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name="star"
                      size={14}
                      color={s <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? "#2DD4BF" : "#334155"}
                    />
                  ))}
                </View>
                <Text style={styles.ratingCount}>{reviews.length} reviews</Text>
              </View>
            )}
            {reviews.slice(0, 5).map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  {r.user_avatar ? (
                    <Image source={{ uri: r.user_avatar }} style={{ width: 28, height: 28, borderRadius: 14 }} />
                  ) : (
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#2DD4BF", fontSize: 11, fontWeight: "700" }}>{(r.user_name || "U")[0]}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.user_name}</Text>
                    <View style={{ flexDirection: "row", gap: 1 }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons key={s} name="star" size={10} color={s <= r.rating ? "#2DD4BF" : "#334155"} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString()}</Text>
                </View>
                {r.text ? <Text style={styles.reviewText}>{r.text}</Text> : null}
              </View>
            ))}
          </View>

          {tour.tags && tour.tags.length > 0 && (
            <View style={styles.tagRow}>
              {tour.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {isOwner && tour.participants && tour.participants.length > 0 && (
            <View style={styles.participantsSection}>
              <Text style={styles.sectionTitle}>{t("tour.participants")}</Text>
              {tour.participants.map((p) => (
                <View key={p.id} style={styles.participantRow}>
                  {p.user_avatar ? (
                    <Image source={{ uri: p.user_avatar }} style={styles.participantAvatar} />
                  ) : (
                    <View style={[styles.participantAvatar, { backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" }]}>
                      <Text style={{ color: "#2DD4BF", fontWeight: "700", fontSize: 12 }}>{(p.user_name || "U")[0]}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.participantName}>{p.user_name}</Text>
                    <View style={[styles.statusBadge, p.status === "paid" ? styles.statusConfirmed : styles.statusPending]}>
                      <Text style={[styles.statusText, p.status === "paid" ? styles.statusTextConfirmed : styles.statusTextPending]}>
                        {p.status === "paid" ? t("tour.confirmed") : t("tour.pending")}
                      </Text>
                    </View>
                  </View>
                  {p.status === "pending" && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleParticipantAction(p.id, "paid")}
                      >
                        <CheckCircle size={20} color="#10B981" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleParticipantAction(p.id, "cancelled")}
                      >
                        <XCircle size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {!isOwner && isPartnerTour && tour.partner_whatsapp && (
        <View style={styles.bottomBar}>
          {alreadyJoined ? (
            <View style={styles.statusRow}>
              {myStatus === "paid" ? (
                <>
                  <View style={styles.statusIconWrap}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.joinedText}>{t("tour.confirmed")}</Text>
                    <Text style={styles.joinedSub}>Оплата подтверждена оператором</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.statusIconWrap, { backgroundColor: "rgba(255,191,0,0.1)" }]}>
                    <Ionicons name="time" size={24} color="#2DD4BF" />
                  </View>
                  <View>
                    <Text style={styles.pendingText}>Ожидает подтверждения</Text>
                    <Text style={styles.joinedSub}>Оператор подтвердит после оплаты</Text>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.bottomActions}>
              <NeonButton
                title={selectedDate ? `Забронировать на ${selectedDate}` : "Выберите дату"}
                onPress={() => {
                  if (!selectedDate) {
                    Platform.OS === "web" ? alert("Сначала выберите дату тура") : Alert.alert("Выберите дату", "Пожалуйста, выберите дату тура выше");
                    return;
                  }
                  if (!user?.id) return;
                  const msg = encodeURIComponent(
                    `Здравствуйте! Хочу забронировать тур "${tour.title}" на ${selectedDate}.\nИмя: ${user?.name || "—"}\nЦена: ${tour.price_per_person.toLocaleString()} ₸`
                  );
                  const waUrl = `https://wa.me/${tour.partner_whatsapp}?text=${msg}`;
                  Linking.openURL(waUrl);
                  joinMutation.mutate(
                    { tourId: tour.id, userId: user.id },
                    { onSuccess: () => refetch() },
                  );
                }}
                disabled={!selectedDate}
                icon={<Ionicons name="logo-whatsapp" size={20} color="#0F172A" />}
                style={{ flex: 1 }}
              />
              <TouchableOpacity onPress={handleShare} style={styles.shareBottomButton}>
                <Share2 size={22} color="#2DD4BF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {!isOwner && !isPartnerTour && (
        <View style={styles.bottomBar}>
          {alreadyJoined ? (
            <View style={styles.statusRow}>
              <TouchableOpacity style={styles.chatFloatBtn} onPress={() => setShowChat(true)}>
                <Ionicons name="chatbubbles" size={20} color="#7C3AED" />
              </TouchableOpacity>
              {myStatus === "paid" ? (
                <>
                  <View style={styles.statusIconWrap}>
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.joinedText}>{t("tour.confirmed")}</Text>
                    <Text style={styles.joinedSub}>{t("tour.guideConfirmed")}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.statusIconWrap, { backgroundColor: "rgba(255,191,0,0.1)" }]}>
                    <Ionicons name="time" size={24} color="#2DD4BF" />
                  </View>
                  <View>
                    <Text style={styles.pendingText}>{t("tour.requestSent")}</Text>
                    <Text style={styles.joinedSub}>{t("tour.guideWillConfirm")}</Text>
                  </View>
                </>
              )}
            </View>
          ) : isFull ? (
            <View style={styles.joinedRow}>
              <Text style={styles.fullText}>{t("tour.squadFull")}</Text>
            </View>
          ) : (
            <View style={styles.bottomActions}>
              <NeonButton
                title={t("tour.joinParty")}
                onPress={handleJoinPress}
                loading={joinMutation.isPending}
                icon={<Users size={20} color="#0F172A" />}
                style={{ flex: 1 }}
              />
              <TouchableOpacity onPress={handleShare} style={styles.shareBottomButton}>
                <Share2 size={22} color="#2DD4BF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isOwner && (
        <View style={styles.bottomBar}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <NeonButton
              title={t("tour.assembleSquad")}
              onPress={handleShare}
              icon={<Share2 size={20} color="#0F172A" />}
              variant="gold"
              style={{ flex: 1 }}
            />
            <TouchableOpacity style={styles.chatBottomBtn} onPress={() => setShowChat(true)}>
              <Ionicons name="chatbubbles" size={22} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Crown size={32} color="#2DD4BF" />
            <Text style={styles.modalTitle}>{t("tour.joinTour")}</Text>
            <Text style={styles.modalDesc}>
              Ты подаёшь заявку на тур "{tour.title}".{"\n"}
              Гид подтвердит участие в течение 24 часов.
            </Text>
            <View style={styles.modalPriceRow}>
              <Text style={styles.modalPriceLabel}>Стоимость:</Text>
              <Text style={styles.modalPrice}>{pricePerPerson.toLocaleString()} ₸/чел</Text>
            </View>
            <NeonButton title={t("tour.confirm")} onPress={handleConfirmJoin} loading={joinMutation.isPending} />
            <TouchableOpacity onPress={() => setShowConfirm(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>{t("tour.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showReviewModal} transparent animationType="slide" onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t("tour.rateTour")}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginVertical: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                  <Ionicons name="star" size={32} color={s <= reviewRating ? "#FFBF00" : "#334155"} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder={t("tour.shareExperience")}
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
            />
            <NeonButton
              title={t("tour.submit")}
              loading={submitReviewMut.isPending}
              onPress={() => {
                if (!user?.id || !id) return;
                submitReviewMut.mutate(
                  { tourId: id, userId: user.id, rating: reviewRating, text: reviewText },
                  { onSuccess: () => { setShowReviewModal(false); setReviewText(""); } },
                );
              }}
            />
            <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>{t("tour.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {(alreadyJoined || isOwner) && id && (
        <TourChat
          visible={showChat}
          tourId={id}
          tourTitle={tour.title}
          onClose={() => setShowChat(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  center: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 120 },
  notFound: { color: "#64748B", fontSize: 16, marginTop: 12 },
  backLink: { marginTop: 16, backgroundColor: "#1E293B", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  backLinkText: { color: "black", fontWeight: "600" },

  imageContainer: { height: 280, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  imagePlaceholder: { backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  backButton: {
    position: "absolute", top: 56, left: 24, width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center",
  },
  shareButton: {
    position: "absolute", top: 56, right: 24, width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center",
  },
  premiumBadge: {
    position: "absolute", bottom: 16, left: 16, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#2DD4BF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  premiumText: { color: "#0F172A", fontWeight: "800", fontSize: 11, letterSpacing: 1 },

  content: { padding: 24 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  title: { 
    flex: 1, 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#0F172A",
    letterSpacing: -0.5 
  },
  metaRow: { flexDirection: "row", gap: 20, marginBottom: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#475569", fontSize: 14 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  dateText: { color: "#A78BFA", fontSize: 14, fontWeight: "600" },
  description: { color: "#334155", fontSize: 14, lineHeight: 22 },

  priceCard: {
    marginTop: 20, backgroundColor: "rgba(255,191,0,0.06)", borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: "rgba(255,191,0,0.15)",
  },
  priceLabel: { color: "#2DD4BF", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 },
  priceValue: { color: "#0F172A", fontSize: 36, fontWeight: "800" },
  priceCurrency: { color: "#2DD4BF", fontSize: 20, fontWeight: "700" },
  priceTotal: { color: "#64748B", fontSize: 13, marginTop: 4 },

  partySection: { marginTop: 24 },
  sectionTitle: { color: "#2DD4BF", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },

  guideCard: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  guideAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#2DD4BF" },
  guideAvatarPlaceholder: { backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  guideName: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
  guideLabel: { color: "#64748B", fontSize: 12 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 20 },
  tag: { backgroundColor: "rgba(255,191,0,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  tagText: { color: "#2DD4BF", fontSize: 12, fontWeight: "600" },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: "rgb(255,255,255)", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.15)",
  },
  bottomActions: { flexDirection: "row", gap: 12 },
  shareBottomButton: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: "#2dd4be11",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2dd4be62",
  },
  joinedRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 8 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  statusIconWrap: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(16,185,129,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  joinedText: { color: "#10B981", fontWeight: "700", fontSize: 16 },
  pendingText: { color: "#2DD4BF", fontWeight: "700", fontSize: 16 },
  joinedSub: { color: "#64748B", fontSize: 12, marginTop: 2 },
  fullText: { color: "#64748B", fontWeight: "800", fontSize: 14, letterSpacing: 1 },

  participantsSection: { marginTop: 24 },
  participantRow: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  participantAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: "#2DD4BF" },
  participantName: { color: "#0F172A", fontWeight: "600", fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start", marginTop: 4 },
  statusConfirmed: { backgroundColor: "rgba(16,185,129,0.15)" },
  statusPending: { backgroundColor: "rgba(255,191,0,0.15)" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusTextConfirmed: { color: "#10B981" },
  statusTextPending: { color: "#2DD4BF" },
  actionButtons: { flexDirection: "row", gap: 8 },
  confirmBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(16,185,129,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  rejectBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center", justifyContent: "center",
  },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: 24,
  },
  modalCard: {
    backgroundColor: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380,
    alignItems: "center", gap: 16, borderWidth: 1, borderColor: "rgba(255,191,0,0.2)",
  },
  modalTitle: { color: "#0F172A", fontSize: 20, fontWeight: "800" },
  modalDesc: { color: "#94A3B8", fontSize: 14, textAlign: "center", lineHeight: 20 },
  modalPriceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalPriceLabel: { color: "#64748B", fontSize: 14 },
  modalPrice: { color: "#2DD4BF", fontSize: 18, fontWeight: "800" },
  modalCancel: { paddingVertical: 8 },
  modalCancelText: { color: "#64748B", fontSize: 14, fontWeight: "600" },

  reviewsSection: { marginTop: 24 },
  writeReviewBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,191,0,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  writeReviewText: { color: "#2DD4BF", fontSize: 12, fontWeight: "600" },
  ratingOverview: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  ratingBig: { color: "#2DD4BF", fontSize: 28, fontWeight: "800" },
  ratingCount: { color: "#64748B", fontSize: 12 },
  reviewCard: {
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.05)",
  },
  reviewName: { color: "#0F172A", fontWeight: "600", fontSize: 13 },
  reviewDate: { color: "#475569", fontSize: 11 },
  reviewText: { color: "#CBD5E1", fontSize: 13, lineHeight: 19 },
  chatFloatBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(124,58,237,0.15)",
    alignItems: "center", justifyContent: "center", marginLeft: "auto",
  },
  chatBottomBtn: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(124,58,237,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(124,58,237,0.3)",
  },
  reviewInput: {
    width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14,
    padding: 14, color: "#FFF", fontSize: 14, minHeight: 80,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    textAlignVertical: "top", marginBottom: 12,
  },

  partnerBadge: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 16, backgroundColor: "#FFF7ED", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "rgba(234,179,8,0.25)",
  },
  partnerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  partnerIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#2DD4BF",
    alignItems: "center", justifyContent: "center",
  },
  partnerName: { color: "#0F172A", fontWeight: "700", fontSize: 15 },
  partnerLabel: { color: "#64748B", fontSize: 11 },
  instagramBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(225,48,108,0.08)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
  },
  instagramText: { color: "#E1306C", fontSize: 12, fontWeight: "600" },

  itinerarySection: { marginTop: 20 },
  dayHeader: {
    marginTop: 12, marginBottom: 6, paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: "rgba(45,212,191,0.08)", borderRadius: 8, alignSelf: "flex-start",
  },
  dayHeaderText: { color: "#2DD4BF", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  itineraryItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8,
    paddingLeft: 4, borderLeftWidth: 2, borderLeftColor: "rgba(45,212,191,0.2)", marginLeft: 6,
  },
  itineraryDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#2DD4BF",
    marginTop: 5, marginLeft: -5,
  },
  itineraryTime: { color: "#2DD4BF", fontSize: 12, fontWeight: "700", width: 70 },
  itineraryTitle: { color: "#0F172A", fontSize: 14, fontWeight: "600" },
  itineraryDesc: { color: "#64748B", fontSize: 12, marginTop: 2 },

  includedSection: { marginTop: 20 },
  includedChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  includedChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(16,185,129,0.06)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(16,185,129,0.15)",
  },
  includedChipText: { color: "#0F172A", fontSize: 13 },

  datesSection: { marginTop: 20 },
  datesChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dateChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(167,139,250,0.06)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.15)",
  },
  dateChipText: { color: "#6D28D9", fontSize: 13, fontWeight: "500" },
  dateChipSelected: {
    backgroundColor: "#7C3AED", borderColor: "#7C3AED",
  },
  dateChipTextSelected: { color: "#FFF" },

  pickupSection: { marginTop: 20 },
  pickupCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(45,212,191,0.04)", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: "rgba(45,212,191,0.12)",
  },
  pickupTime: { color: "#0F172A", fontSize: 18, fontWeight: "800" },
  pickupAddress: { color: "#475569", fontSize: 13, marginTop: 2 },

  childDiscountRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  childDiscountText: { color: "#7C3AED", fontSize: 13, fontWeight: "600" },
});
