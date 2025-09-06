import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

interface DeckInfoProps {
  deckDescription: string;
  deckLanguage?: string | undefined;
  flashcardCount: number;
  onStartStudy: () => void;
}

export function DeckInfo({
  deckDescription,
  deckLanguage,
  flashcardCount,
  onStartStudy,
}: DeckInfoProps) {
  const { colors } = useAppTheme();
  return (
    <>
      {/* Deck Info */}
      <View style={[styles.deckInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.deckDescription, { color: colors.text }]}>{deckDescription}</Text>
        {deckLanguage && (
          <Text style={[styles.deckLanguage, { color: colors.mutedText }]}>Język: {deckLanguage}</Text>
        )}
      </View>

      {/* Study Button */}
      <TouchableOpacity style={[styles.studyButton, { backgroundColor: colors.primary }]} onPress={onStartStudy}>
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.studyButtonText}>
          Rozpocznij naukę {flashcardCount > 0 && `(${flashcardCount})`}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  deckInfo: {
    padding: 16,
    marginBottom: 8,
  },
  deckDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  deckLanguage: {
    fontSize: 14,
    marginTop: 8,
  },
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  studyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
