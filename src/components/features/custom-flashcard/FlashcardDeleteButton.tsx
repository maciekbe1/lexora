import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { CustomFlashcard } from "@/types/flashcard";
import { t } from "@/locales/i18n";

interface FlashcardDeleteButtonProps {
  flashcard: CustomFlashcard;
  onDelete: (flashcard: CustomFlashcard) => void;
  onClose: () => void;
}

export function FlashcardDeleteButton({
  flashcard,
  onDelete,
  onClose,
}: FlashcardDeleteButtonProps) {
  const handleDelete = () => {
    Alert.alert(t("flashcard.deleteCard"), t("flashcard.confirmDelete"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          onDelete(flashcard);
          onClose();
        },
      },
    ]);
  };

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>{t("common.actions")}</Text>
      <TouchableOpacity onPress={handleDelete}>
        <Text style={styles.deleteButton}>{t("flashcard.deleteCard")}</Text>
      </TouchableOpacity>
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
    color: "#333",
  },
  deleteButton: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 12,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 8,
  },
});