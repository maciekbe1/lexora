import type { CustomFlashcard } from "@/types/flashcard";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

interface FlashcardItemProps {
  flashcard: CustomFlashcard;
  index: number;
  onEdit: (flashcard: CustomFlashcard) => void;
}

export function FlashcardItem({ flashcard, index, onEdit }: FlashcardItemProps) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onEdit(flashcard)}
      style={[styles.flashcardItem, { backgroundColor: colors.surface }]}
    >
      <View style={styles.flashcardHeader}>
        <Text style={[styles.flashcardNumber, { color: colors.primary }]}>#{index + 1}</Text>
      </View>

      <View style={styles.flashcardContent}>
        <View style={styles.cardSide}>
          <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Przód:</Text>
          {flashcard.front_image_url ? (
            <Image
              source={{ uri: flashcard.front_image_url }}
              style={styles.cardImage}
            />
          ) : null}
          <Text style={[styles.cardText, { color: colors.text }]}>{flashcard.front_text}</Text>
        </View>

        <View style={styles.cardSide}>
          <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Tył:</Text>
          {flashcard.back_image_url ? (
            <Image
              source={{ uri: flashcard.back_image_url }}
              style={styles.cardImage}
            />
          ) : null}
          <Text style={[styles.cardText, { color: colors.text }]}>{flashcard.back_text}</Text>
        </View>

        {flashcard.hint_text ? (
          <View style={styles.cardSide}>
            <Text style={[styles.sideLabel, { color: colors.mutedText }]}>Podpowiedź:</Text>
            <Text style={[styles.hintText, { color: colors.mutedText }]}>{flashcard.hint_text}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flashcardItem: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  flashcardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  flashcardNumber: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Removed separate action buttons; whole card is tappable
  flashcardContent: {
    gap: 16,
  },
  cardSide: {
    gap: 8,
  },
  sideLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardText: {
    fontSize: 16,
    lineHeight: 22,
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  hintText: {
    fontSize: 14,
    fontStyle: "italic",
  },
});
