import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface EmptyDeckStateProps {
  onBrowseTemplates: () => void;
}

export function EmptyDeckState({ onBrowseTemplates }: EmptyDeckStateProps) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="library-outline" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>Brak tali w kolekcji</Text>
      <Text style={styles.emptyText}>
        Dodaj swoją pierwszą talię z predefiniowanych kolekcji, żeby rozpocząć
        naukę
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onBrowseTemplates}>
        <Text style={styles.emptyButtonText}>Przeglądaj talie</Text>
      </TouchableOpacity>
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
