import { UserDeck } from "@/shared/types/flashcard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeckSelectorProps {
  customDecks: UserDeck[];
  selectedDeck: string;
  onSelectDeck: (deckId: string) => void;
}

export function DeckSelector({
  customDecks,
  selectedDeck,
  onSelectDeck,
}: DeckSelectorProps) {
  if (customDecks.length === 0) {
    return (
      <View style={styles.noDeckContainer}>
        <Ionicons name="information-circle-outline" size={24} color="#999" />
        <Text style={styles.noDeckText}>
          Najpierw utwórz własną talię, aby móc dodać fiszki
        </Text>
      </View>
    );
  }

  if (customDecks.length === 1) {
    const deck = customDecks[0];
    return (
      <View style={styles.singleDeckContainer}>
        <Text style={styles.label}>Talia:</Text>
        <View style={styles.singleDeck}>
          <Text style={styles.singleDeckName}>
            {deck.deck_name || deck.custom_name || "Talia bez nazwy"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>Wybierz talię *</Text>
      <ScrollView
        style={styles.deckSelector}
        showsVerticalScrollIndicator={false}
      >
        {customDecks.map((deck) => (
          <TouchableOpacity
            key={deck.id}
            style={[
              styles.deckOption,
              selectedDeck === deck.id && styles.deckOptionSelected,
            ]}
            onPress={() => onSelectDeck(deck.id)}
          >
            <View style={styles.deckOptionIcon}>
              <Ionicons
                name={
                  selectedDeck === deck.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={24}
                color={selectedDeck === deck.id ? "#007AFF" : "#999"}
              />
            </View>
            <View style={styles.deckOptionInfo}>
              <Text
                style={[
                  styles.deckOptionName,
                  selectedDeck === deck.id && styles.deckOptionNameSelected,
                ]}
              >
                {deck.deck_name || deck.custom_name || "Talia bez nazwy"}
              </Text>
              <Text style={styles.deckOptionMeta}>
                Język: {deck.deck_language || "nieznany"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  deckSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  deckOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  deckOptionSelected: {
    backgroundColor: "#f0f8ff",
  },
  deckOptionIcon: {
    marginRight: 12,
  },
  deckOptionInfo: {
    flex: 1,
  },
  deckOptionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  deckOptionNameSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  deckOptionMeta: {
    fontSize: 12,
    color: "#666",
  },
  singleDeckContainer: {
    marginBottom: 24,
  },
  singleDeck: {
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
  },
  singleDeckName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  noDeckContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDeckText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});
