import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface DeckDescriptionFieldProps {
  value: string;
  onChange: (text: string) => void;
}

export function DeckDescriptionField({
  value,
  onChange,
}: DeckDescriptionFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("deck.description")} ({t("common.optional")})
      </Text>
      <BottomSheetTextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={t("deck.descriptionPlaceholder")}
        placeholderTextColor={colors.mutedText}
        multiline
        numberOfLines={3}
        maxLength={250}
      />
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
});