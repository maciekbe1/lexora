import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import type { UserDeck } from "@/types/flashcard";
import { t } from "@/locales/i18n";
import { Ionicons } from "@expo/vector-icons";

interface DeckInfoProps {
  deck: UserDeck;
  flashcardCount: number;
  dueToday?: number | null;
  onStartStudy: () => void;
}

export function DeckInfo({ deck, flashcardCount, dueToday, onStartStudy }: DeckInfoProps) {
  const { colors } = useAppTheme();

  const hasCardsToStudy = flashcardCount > 0;
  const hasDueCards = (dueToday ?? 0) > 0;

  return (
    <View style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {flashcardCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>
            {t("deck.cards")}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {dueToday ?? 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>
            {t("deck.dueToday")}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {deck.stats_mastered || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedText }]}>
            {t("deck.mastered")}
          </Text>
        </View>
      </View>

      {/* Study Button */}
      <TouchableOpacity
        style={[
          styles.studyButton,
          {
            backgroundColor: hasCardsToStudy ? colors.primary : colors.mutedText,
            opacity: hasCardsToStudy ? 1 : 0.5
          }
        ]}
        onPress={onStartStudy}
        disabled={!hasCardsToStudy}
      >
        <Ionicons
          name="play"
          size={24}
          color="white"
          style={styles.studyIcon}
        />
        <Text style={styles.studyButtonText}>
          {hasDueCards
            ? t("deck.studyNow", { count: dueToday })
            : hasCardsToStudy
              ? t("deck.startStudy")
              : t("deck.noCards")
          }
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  studyIcon: {
    marginRight: 8,
  },
  studyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});