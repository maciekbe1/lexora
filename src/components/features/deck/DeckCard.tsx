import { UserDeck } from "@/types/flashcard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

interface DeckCardProps {
  item: UserDeck;
  onPress: (deck: UserDeck) => void;
}

export function DeckCard({ item, onPress }: DeckCardProps) {
  const { colors } = useAppTheme();
  // Use unified deck data with legacy fallbacks
  const deckName = item.deck_name || item.custom_name || "Talia bez nazwy";
  const description =
    item.deck_description && item.deck_description.trim()
      ? item.deck_description.trim()
      : "Brak opisu";
  const flashcardCount = item.deck_flashcard_count || 0;
  const newCount = item.stats_new ?? flashcardCount;
  const learningCount = item.stats_learning ?? 0;
  const reviewCount = item.stats_review ?? 0;
  const masteredCount = item.stats_mastered ?? 0;

  return (
    <TouchableOpacity style={[styles.deckCard, { backgroundColor: colors.surface }]} onPress={() => onPress(item)}>
      <View style={styles.deckHeader}>
        <View style={styles.deckIcon}>
          <Ionicons name="library" size={24} color={colors.primary} />
        </View>
        <View style={styles.deckInfo}>
          <Text style={[styles.deckName, { color: colors.text }]}>{deckName}</Text>
          <Text style={[styles.deckDescription, { color: colors.mutedText }]}>{description}</Text>
          <Text style={[styles.deckCount, { color: colors.mutedText }]}>{flashcardCount} fiszek</Text>
        </View>
        {item.is_favorite && (
          <View style={styles.favoriteIcon}>
            <Ionicons name="heart" size={20} color="#FF3B30" />
          </View>
        )}
      </View>

      <View style={styles.deckStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#34C759" }]}>
            {newCount}
          </Text>
          <Text style={styles.statLabel}>Nowe</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF9500" }]}>{learningCount}</Text>
          <Text style={styles.statLabel}>Uczę się</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF3B30" }]}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Powtórka</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#007AFF" }]}>{masteredCount}</Text>
          <Text style={styles.statLabel}>Opanowane</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deckCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  deckInfo: {
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  deckName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  deckCount: {
    fontSize: 12,
  },
  deckStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: "#8E8E93",
    fontWeight: "500",
  },
});
