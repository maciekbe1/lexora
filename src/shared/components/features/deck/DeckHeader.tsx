import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
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
  onEditDeck?: () => void;
  onDeleteDeck?: () => void;
}

export function DeckHeader({
  deckName,
  flashcardCount,
  isCustomDeck,
  onAddFlashcard,
  onEditDeck,
  onDeleteDeck,
}: DeckHeaderProps) {
  const insets = useSafeAreaInsets();
  const [showOptions, setShowOptions] = useState(false);

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
                onPress={() => setShowOptions(!showOptions)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Options menu overlay */}
        {showOptions && isCustomDeck && (
          <Modal transparent visible={showOptions} animationType="none">
            <Pressable
              style={styles.optionsOverlay}
              onPress={() => setShowOptions(false)}
            >
              <View style={styles.optionsMenu}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setShowOptions(false);
                    onEditDeck?.();
                  }}
                >
                  <Ionicons name="pencil" size={20} color="#007AFF" />
                  <Text style={styles.optionText}>Edytuj talię</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionItem, styles.deleteOption]}
                  onPress={() => {
                    setShowOptions(false);
                    onDeleteDeck?.();
                  }}
                >
                  <Ionicons name="trash" size={20} color="#FF3B30" />
                  <Text style={[styles.optionText, styles.deleteText]}>
                    Usuń talię
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}
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
  optionsOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100, // Approximate header height
    paddingRight: 16,
  },
  optionsMenu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 150,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  deleteOption: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  deleteText: {
    color: "#FF3B30",
  },
});
