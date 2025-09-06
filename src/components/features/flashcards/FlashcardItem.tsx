import type { CustomFlashcard } from "@/types/flashcard";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FlashcardItemProps {
  flashcard: CustomFlashcard;
  index: number;
  onEdit: (flashcard: CustomFlashcard) => void;
}

export function FlashcardItem({ flashcard, index, onEdit }: FlashcardItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onEdit(flashcard)}
      style={styles.flashcardItem}
    >
      <View style={styles.flashcardHeader}>
        <Text style={styles.flashcardNumber}>#{index + 1}</Text>
      </View>

      <View style={styles.flashcardContent}>
        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Przód:</Text>
          {flashcard.front_image_url ? (
            <Image
              source={{ uri: flashcard.front_image_url }}
              style={styles.cardImage}
            />
          ) : null}
          <Text style={styles.cardText}>{flashcard.front_text}</Text>
        </View>

        <View style={styles.cardSide}>
          <Text style={styles.sideLabel}>Tył:</Text>
          {flashcard.back_image_url ? (
            <Image
              source={{ uri: flashcard.back_image_url }}
              style={styles.cardImage}
            />
          ) : null}
          <Text style={styles.cardText}>{flashcard.back_text}</Text>
        </View>

        {flashcard.hint_text ? (
          <View style={styles.cardSide}>
            <Text style={styles.sideLabel}>Podpowiedź:</Text>
            <Text style={styles.hintText}>{flashcard.hint_text}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  flashcardItem: {
    backgroundColor: "#ffffff",
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
    color: "#007AFF",
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
    color: "#666",
  },
  cardText: {
    fontSize: 16,
    color: "#1a1a1a",
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
    color: "#666",
    fontStyle: "italic",
  },
});
