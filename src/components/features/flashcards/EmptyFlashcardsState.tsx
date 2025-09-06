import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyFlashcardsStateProps {
  isCustomDeck: boolean;
  onAddFlashcard: () => void;
}

export function EmptyFlashcardsState({
  isCustomDeck,
  onAddFlashcard,
}: EmptyFlashcardsStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Brak fiszek</Text>
      <Text style={styles.emptyText}>
        {isCustomDeck
          ? "Dodaj swoją pierwszą fiszkę do tej talii"
          : "Ta talia nie zawiera jeszcze fiszek"}
      </Text>
      {isCustomDeck && (
        <TouchableOpacity style={styles.emptyButton} onPress={onAddFlashcard}>
          <Text style={styles.emptyButtonText}>Dodaj fiszkę</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
