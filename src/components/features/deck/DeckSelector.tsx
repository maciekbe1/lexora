import { UserDeck } from "@/types/flashcard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

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
  const { colors, mode } = useAppTheme();
  const selectedBg = mode === 'dark' ? 'rgba(10,132,255,0.10)' : '#E3F2FD';

  if (customDecks.length === 0) {
    return (
      <View style={styles.noDeckContainer}>
        <Ionicons name="information-circle-outline" size={24} color={colors.mutedText} />
        <Text style={[styles.noDeckText, { color: colors.mutedText }]}>
          Najpierw utwórz własną talię, aby móc dodać fiszki
        </Text>
      </View>
    );
  }

  if (customDecks.length === 1) {
    const deck = customDecks[0];
    return (
      <View style={styles.singleDeckContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Talia:</Text>
        <View style={[styles.singleDeck, { backgroundColor: selectedBg, borderColor: colors.primary }]}>
          <Text style={[styles.singleDeckName, { color: colors.primary }]}>
            {deck.deck_name || deck.custom_name || "Talia bez nazwy"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.text }]}>Wybierz talię *</Text>
      <ScrollView
        style={[styles.deckSelector, { borderColor: colors.border, backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
      >
        {customDecks.map((deck) => (
          <TouchableOpacity
            key={deck.id}
            style={[
              styles.deckOption,
              { borderBottomColor: colors.border },
              selectedDeck === deck.id && [{ backgroundColor: selectedBg }],
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
                color={selectedDeck === deck.id ? colors.primary : colors.mutedText}
              />
            </View>
            <View style={styles.deckOptionInfo}>
              <Text
                style={[
                  styles.deckOptionName,
                  { color: colors.text },
                  selectedDeck === deck.id && [{ color: colors.primary }],
                ]}
              >
                {deck.deck_name || deck.custom_name || "Talia bez nazwy"}
              </Text>
              <Text style={[styles.deckOptionMeta, { color: colors.mutedText }]}>
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
    marginBottom: 8,
  },
  deckSelector: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
  },
  deckOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
    marginBottom: 2,
  },
  deckOptionMeta: {
    fontSize: 12,
  },
  singleDeckContainer: {
    marginBottom: 24,
  },
  singleDeck: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  singleDeckName: {
    fontSize: 16,
    fontWeight: "500",
  },
  noDeckContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDeckText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },
});
