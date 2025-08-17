import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface DeckHeaderProps {
  deckName: string;
  flashcardCount: number;
  isCustomDeck: boolean;
  onAddFlashcard: () => void;
  onToggleOptions?: () => void;
}

export function DeckHeader({
  deckName,
  flashcardCount,
  isCustomDeck,
  onAddFlashcard,
  onToggleOptions,
}: DeckHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showOptions, setShowOptions] = useState(false);

  // Use external control if provided, otherwise use internal state
  const toggleOptions = onToggleOptions || (() => setShowOptions(!showOptions));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{deckName}</Text>
            <Text style={styles.headerSubtitle}>{flashcardCount} fiszek</Text>
          </View>
          {isCustomDeck && (
            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onAddFlashcard}
              >
                <Ionicons name="add" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.menuButton]}
                onPress={toggleOptions}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    minHeight: 44,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  menuButton: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
});
