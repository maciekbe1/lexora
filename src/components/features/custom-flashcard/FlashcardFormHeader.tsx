import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { t } from "@/locales/i18n";

interface FlashcardFormHeaderProps {
  isEditing: boolean;
  isLoading: boolean;
  hasSelectedDeck: boolean;
  onSave: () => void;
}

export function FlashcardFormHeader({
  isEditing,
  isLoading,
  hasSelectedDeck,
  onSave,
}: FlashcardFormHeaderProps) {
  const isDisabled = isLoading || !hasSelectedDeck;

  return (
    <TouchableOpacity
      onPress={onSave}
      disabled={isDisabled}
      style={[styles.saveButton, { opacity: isDisabled ? 0.5 : 1 }]}
    >
      <Text style={styles.saveButtonText}>
        {isEditing ? t("common.save") : t("common.add")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});