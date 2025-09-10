import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
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
  isReorderMode?: boolean;
  onExitReorderMode?: () => void;
}

export function DeckHeader({
  deckName,
  flashcardCount,
  isCustomDeck,
  onAddFlashcard,
  onToggleOptions,
  isReorderMode = false,
  onExitReorderMode,
}: DeckHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [showOptions, setShowOptions] = useState(false);

  // Use external control if provided, otherwise use internal state
  const toggleOptions = onToggleOptions || (() => setShowOptions(!showOptions));

  return (
    <>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "default" : "light-content"}
      />
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isReorderMode ? 'Układaj fiszki' : deckName}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedText }]}>
              {isReorderMode ? 'Przeciągnij fiszki, aby zmienić kolejność' : `${flashcardCount} fiszek`}
            </Text>
          </View>
          <View style={styles.rightActions}>
            {isReorderMode ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.doneButton, { backgroundColor: colors.primary }]}
                onPress={onExitReorderMode}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={[styles.doneButtonText, { color: "white" }]}>
                  Gotowe
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {isCustomDeck && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onAddFlashcard}
                  >
                    <Ionicons name="add" size={24} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.menuButton]}
                  onPress={toggleOptions}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
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
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
