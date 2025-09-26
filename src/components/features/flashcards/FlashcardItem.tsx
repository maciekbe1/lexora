import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import type { CustomFlashcard, TemplateFlashcard } from "@/types/flashcard";

interface FlashcardItemProps {
  flashcard: CustomFlashcard | TemplateFlashcard;
  onPress: () => void;
  onLongPress?: () => void;
}

export function FlashcardItem({
  flashcard,
  onPress,
  onLongPress,
}: FlashcardItemProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.frontText, { color: colors.text }]} numberOfLines={2}>
          {flashcard.front_text}
        </Text>
        <Text style={[styles.backText, { color: colors.mutedText }]} numberOfLines={1}>
          {flashcard.back_text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  frontText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
  },
});