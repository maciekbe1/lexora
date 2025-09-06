import type { Language } from "@/types/flashcard";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

export function LanguageTab({
  item,
  selected,
  onSelect,
}: {
  item: Language;
  selected: boolean;
  onSelect: (code: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={[
        styles.languageTab,
        { backgroundColor: colors.surface, borderColor: colors.border },
        selected && { backgroundColor: colors.primary, borderColor: colors.primary },
      ]}
      onPress={() => onSelect(item.code)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text
        style={[
          styles.languageName,
          { color: colors.mutedText },
          selected && { color: '#fff' },
        ]}
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
    borderWidth: 1,
  },
  languageFlag: { fontSize: 16, marginRight: 6 },
  languageName: { fontSize: 14, fontWeight: "500" },
});
