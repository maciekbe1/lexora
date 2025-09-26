import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import type { UserDeck } from "@/types/flashcard";

interface DeckHeaderProps {
  deck: UserDeck;
}

export function DeckHeader({ deck }: DeckHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {deck.custom_name || deck.deck_name}
      </Text>
      {deck.deck_description && (
        <Text style={[styles.description, { color: colors.mutedText }]}>
          {deck.deck_description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
});