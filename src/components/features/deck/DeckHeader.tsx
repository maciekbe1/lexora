import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const { colors } = useAppTheme();
  const [showOptions, setShowOptions] = useState(false);

  // Use external control if provided, otherwise use internal state
  const toggleOptions = onToggleOptions || (() => setShowOptions(!showOptions));

  return (
    <>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'default' : 'light-content'} />
      <View style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{deckName}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>{flashcardCount} fiszek</Text>
          </View>
          {isCustomDeck && (
            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onAddFlashcard}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.menuButton]}
                onPress={toggleOptions}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: { borderBottomWidth: 1 },
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
  },
  headerSubtitle: {
    fontSize: 14,
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
    borderRadius: 8,
    borderWidth: 1,
  },
});
