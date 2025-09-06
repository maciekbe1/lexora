import { UserDeck } from "@/types/flashcard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeckCardProps {
  item: UserDeck;
  onPress: (deck: UserDeck) => void;
}

export function DeckCard({ item, onPress }: DeckCardProps) {
  // Use unified deck data with legacy fallbacks
  const deckName = item.deck_name || item.custom_name || "Talia bez nazwy";
  const description =
    item.deck_description && item.deck_description.trim()
      ? item.deck_description.trim()
      : "Brak opisu";
  const flashcardCount = item.deck_flashcard_count || 0;

  return (
    <TouchableOpacity style={styles.deckCard} onPress={() => onPress(item)}>
      <View style={styles.deckHeader}>
        <View style={styles.deckIcon}>
          <Ionicons name="library" size={24} color="#007AFF" />
        </View>
        <View style={styles.deckInfo}>
          <Text style={styles.deckName}>{deckName}</Text>
          <Text style={styles.deckDescription}>{description}</Text>
          <Text style={styles.deckCount}>{flashcardCount} fiszek</Text>
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
            {flashcardCount}
          </Text>
          <Text style={styles.statLabel}>Nowe</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF9500" }]}>{0}</Text>
          <Text style={styles.statLabel}>Uczę się</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#FF3B30" }]}>{0}</Text>
          <Text style={styles.statLabel}>Powtórka</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: "#007AFF" }]}>{0}</Text>
          <Text style={styles.statLabel}>Opanowane</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  deckCard: {
    backgroundColor: "#ffffff",
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
    color: "#1a1a1a",
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  deckCount: {
    fontSize: 12,
    color: "#8E8E93",
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
