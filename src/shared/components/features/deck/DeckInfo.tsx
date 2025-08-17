import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
  return (
    <>
      {/* Deck Info */}
      <View style={styles.deckInfo}>
        <Text style={styles.deckDescription}>{deckDescription}</Text>
        {deckLanguage && (
          <Text style={styles.deckLanguage}>Język: {deckLanguage}</Text>
        )}
      </View>

      {/* Study Button */}
      <TouchableOpacity style={styles.studyButton} onPress={onStartStudy}>
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
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  deckDescription: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  deckLanguage: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
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
