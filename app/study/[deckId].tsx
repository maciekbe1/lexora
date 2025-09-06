import { localDatabase } from "@/services/local-database";
import { ThemedSurface } from "@/theme/ThemedSurface";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StudyScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const total = cards.length || 1;
  const progress = (index + 1) / total;

  useEffect(() => {
    (async () => {
      if (!deckId) return;
      const queue = await localDatabase.getStudyQueue(deckId);
      setCards(queue);
    })();
  }, [deckId]);

  const card = cards[index];

  const onBack = () => router.back();

  const onShowAnswer = () => setShowAnswer(true);

  const nextCard = () => {
    const next = index + 1;
    if (next >= cards.length) {
      // Session finished: return to previous deck screen to avoid duplicate stack entries
      router.back();
    } else {
      setIndex(next);
      setShowAnswer(false);
    }
  };

  const onDidntKnow = async () => {
    try {
      if (deckId && card?.id)
        await localDatabase.applyAnswer(deckId, card.id, false);
    } catch (e) {
      console.log("applyAnswer failed (didnt know):", e);
    } finally {
      nextCard();
    }
  };

  const onKnew = async () => {
    try {
      if (deckId && card?.id)
        await localDatabase.applyAnswer(deckId, card.id, true);
    } catch (e) {
      console.log("applyAnswer failed (knew):", e);
    } finally {
      nextCard();
    }
  };

  if (!card) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onBack} style={styles.topBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.text }]}>Nauka</Text>
          <View style={styles.topBtn} />
        </View>
        <View style={styles.centerEmpty}>
          <Text style={{ color: colors.mutedText }}>Brak fiszek do nauki</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            paddingHorizontal: 16,
          },
        ]}
      >
        <TouchableOpacity onPress={onBack} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]}>Nauka</Text>
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.mutedText}
          />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View
        style={[styles.progressWrap, { marginTop: 8, paddingHorizontal: 16 }]}
      >
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.mutedText }]}>
          {index + 1}/{total}
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        <ThemedSurface style={styles.card}>
          {(() => {
            const uri = !showAnswer
              ? card.front_image_url
              : card.back_image_url || card.front_image_url;
            return uri ? (
              <Image source={{ uri }} style={styles.cardImage} />
            ) : null;
          })()}
          <Text style={[styles.cardText, { color: colors.text }]}>
            {!showAnswer ? card.front_text : card.back_text}
          </Text>
        </ThemedSurface>
      </View>

      {/* Bottom actions */}
      <View
        style={[
          styles.bottom,
          { paddingHorizontal: 16, paddingBottom: insets.bottom + 24 },
        ]}
      >
        {!showAnswer ? (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={onShowAnswer}
          >
            <Text style={styles.primaryBtnText}>Pokaż odpowiedź</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onDidntKnow}
            >
              <Ionicons name="close" size={18} color="#FF3B30" />
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                Nie wiedziałem
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onKnew}
            >
              <Ionicons name="checkmark" size={18} color="#34C759" />
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                Wiedziałem
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  topBtn: { padding: 6 },
  topTitle: { fontSize: 16, fontWeight: "600" },
  progressWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  progressBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { marginTop: 6, fontSize: 12, textAlign: "right" },
  cardWrap: { flex: 1, padding: 16 },
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
    resizeMode: "cover",
  },
  cardText: { fontSize: 20, textAlign: "center" },
  bottom: { padding: 16 },
  primaryBtn: { paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  row: { flexDirection: "row", gap: 12 },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600" },
  centerEmpty: { flex: 1, alignItems: "center", justifyContent: "center" },
});
