import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Image,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/context/authContext";
import { useTourChat } from "@/hooks/useTourChat";

interface Props {
  visible: boolean;
  tourId: string;
  tourTitle: string;
  onClose: () => void;
}

export default function TourChat({ visible, tourId, tourTitle, onClose }: Props) {
  const { user } = useContext(AuthContext);
  const { messages, loading, sending, send, refresh } = useTourChat(tourId, user?.id || null);
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    send(text);
    setText("");
  };

  const isMyMessage = (userId: string) => userId === user?.id;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{tourTitle}</Text>
            <Text style={styles.headerSub}>Group Chat</Text>
          </View>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="chatbubbles-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Be the first to say hello!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const mine = isMyMessage(item.user_id);
              return (
                <View style={[styles.msgRow, mine && styles.msgRowMine]}>
                  {!mine && (
                    item.user_avatar ? (
                      <Image source={{ uri: item.user_avatar }} style={styles.msgAvatar} />
                    ) : (
                      <View style={[styles.msgAvatar, styles.msgAvatarPlaceholder]}>
                        <Text style={styles.msgAvatarText}>{(item.user_name || "U")[0]}</Text>
                      </View>
                    )
                  )}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                    {!mine && <Text style={styles.msgName}>{item.user_name}</Text>}
                    <Text style={[styles.msgText, mine && styles.msgTextMine]}>{item.text}</Text>
                    <Text style={[styles.msgTime, mine && styles.msgTimeMine]}>
                      {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor="#64748B"
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingTop: Platform.OS === "ios" ? 56 : 16, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: "#1E293B", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#64748B", fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#64748B", fontSize: 16, marginTop: 12, fontWeight: "600" },
  emptySubtext: { color: "#475569", fontSize: 13, marginTop: 4 },

  messageList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: "row", marginBottom: 12, gap: 8, maxWidth: "85%" },
  msgRowMine: { flexDirection: "row-reverse", alignSelf: "flex-end" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginTop: 4 },
  msgAvatarPlaceholder: { backgroundColor: "#334155", alignItems: "center", justifyContent: "center" },
  msgAvatarText: { color: "#7C3AED", fontWeight: "700", fontSize: 11 },

  bubble: { borderRadius: 16, padding: 10, maxWidth: "100%" },
  bubbleOther: { backgroundColor: "#1E293B", borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: "#7C3AED", borderTopRightRadius: 4 },
  msgName: { color: "#7C3AED", fontSize: 11, fontWeight: "700", marginBottom: 2 },
  msgText: { color: "#E2E8F0", fontSize: 14, lineHeight: 20 },
  msgTextMine: { color: "#FFF" },
  msgTime: { color: "#475569", fontSize: 10, marginTop: 4, alignSelf: "flex-end" },
  msgTimeMine: { color: "rgba(255,255,255,0.6)" },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    padding: 12, paddingBottom: Platform.OS === "ios" ? 32 : 12,
    backgroundColor: "#1E293B", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  input: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: "#FFF", fontSize: 14,
    maxHeight: 100, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#7C3AED",
    alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
});
