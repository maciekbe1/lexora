import type { Language } from "@/types/flashcard";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export function LanguageTab({
  item,
  selected,
  onSelect,
}: {
  item: Language;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.languageTab, selected && styles.languageTabSelected]}
      onPress={() => onSelect(item.code)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text
        style={[styles.languageName, selected && styles.languageNameSelected]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  languageTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  languageTabSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  languageFlag: { fontSize: 16, marginRight: 6 },
  languageName: { fontSize: 14, fontWeight: "500", color: "#666" },
  languageNameSelected: { color: "#ffffff" },
});
