import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface FlashcardHintFieldProps {
  value: string;
  onChange: (text: string) => void;
}

export function FlashcardHintField({
  value,
  onChange,
}: FlashcardHintFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("flashcard.hint")} ({t("common.optional")})
      </Text>
      <BottomSheetTextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={t("flashcard.hintPlaceholder")}
        placeholderTextColor={colors.mutedText}
        maxLength={200}
        editable
        autoCapitalize="sentences"
      />
      <Text style={styles.charCounter}>{value.length}/200</Text>
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  charCounter: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
});