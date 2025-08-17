import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { TemplateDeck } from "../../../types/flashcard";

const getDifficultyColor = (level: number) => {
  switch (level) {
    case 1:
      return "#34C759";
    case 2:
      return "#32D74B";
    case 3:
      return "#FF9500";
    case 4:
      return "#FF6B35";
    case 5:
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
};

const getDifficultyText = (level: number) => {
  switch (level) {
    case 1:
      return "Łatwy";
    case 2:
      return "Średni";
    case 3:
      return "Trudny";
    case 4:
      return "Bardzo trudny";
    case 5:
      return "Ekspert";
    default:
      return "Nieznany";
  }
};

export function TemplateDeckCard({
  item,
  isAdded,
  isAdding,
  onAdd,
}: {
  item: TemplateDeck;
  isAdded: boolean;
  isAdding: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={styles.deckCard}>
      <View style={styles.deckHeader}>
        <View style={styles.deckIcon}>
          <Ionicons name="library" size={24} color="#007AFF" />
        </View>
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{item.name}</Text>
          <Text style={styles.deckDescription}>
            {item.description || "Brak opisu"}
          </Text>
          <View style={styles.deckMeta}>
            <Text style={styles.deckCount}>{item.flashcard_count} fiszek</Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(item.difficulty_level) },
              ]}
            >
              <Text style={styles.difficultyText}>
                {getDifficultyText(item.difficulty_level)}
              </Text>
            </View>
          </View>
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.addButton,
          isAdded && styles.addButtonAdded,
          isAdding && styles.addButtonAdding,
        ]}
        onPress={onAdd}
        disabled={isAdded || isAdding}
      >
        {isAdding ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Ionicons
              name={isAdded ? "checkmark" : "add"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.addButtonText}>
              {isAdded ? "Dodane" : "Dodaj"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  deckCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deckInfo: { flex: 1 },
  deckName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  deckMeta: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  deckCount: { fontSize: 12, color: "#8E8E93", marginRight: 12 },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: { fontSize: 10, fontWeight: "600", color: "#ffffff" },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: { fontSize: 10, color: "#666" },
  moreTagsText: { fontSize: 10, color: "#8E8E93", fontStyle: "italic" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  addButtonAdded: { backgroundColor: "#34C759" },
  addButtonAdding: { backgroundColor: "#8E8E93" },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
