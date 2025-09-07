import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeckInfoProps {
  deckDescription: string;
  deckLanguage?: string | undefined;
  flashcardCount: number;
  onStartStudy: () => void;
  dueToday?: number | null;
  stats?: { new: number; learning: number; mastered: number };
}

export function DeckInfo({
  deckDescription,
  deckLanguage,
  flashcardCount,
  onStartStudy,
  dueToday,
  stats,
}: DeckInfoProps) {
  const { colors } = useAppTheme();
  return (
    <>
      {/* Deck Info */}
      <View style={[styles.deckInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.deckDescription, { color: colors.text }]}>
          {deckDescription}
        </Text>
        {deckLanguage && (
          <Text style={[styles.deckLanguage, { color: colors.mutedText }]}>
            Język: {deckLanguage}
          </Text>
        )}
        {stats && (
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#34C759" }]}>{stats.new}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Nowe</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#FF9500" }]}>{stats.learning}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Uczę się</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: "#007AFF" }]}>{stats.mastered}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedText }]}>Opanowane</Text>
            </View>
          </View>
        )}
      </View>

      {/* Study Button */}
      <TouchableOpacity
        style={[styles.studyButton, { backgroundColor: colors.primary }]}
        onPress={onStartStudy}
      >
        <Ionicons name="play" size={20} color="#fff" />
        <Text style={styles.studyButtonText}>
          Rozpocznij naukę
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  deckInfo: {
    padding: 16,
    marginBottom: 8,
  },
  deckDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
  deckLanguage: {
    fontSize: 14,
    marginTop: 8,
  },
  statsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  studyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 8,
  },
  studyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
});
