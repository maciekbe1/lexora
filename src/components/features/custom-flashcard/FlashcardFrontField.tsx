import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface FlashcardFrontFieldProps {
  value: string;
  isTranslating: boolean;
  onChange: (text: string) => void;
}

export function FlashcardFrontField({
  value,
  isTranslating,
  onChange,
}: FlashcardFrontFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.formGroup}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("flashcard.front")} *
        </Text>
        <View
          style={[
            styles.langBadge,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Text style={[styles.langText, { color: colors.text }]}>🇵🇱 PL</Text>
        </View>
      </View>
      {isTranslating && (
        <Text
          style={[
            styles.translatingHint,
            { color: colors.mutedText, marginBottom: 4 },
          ]}
        >
          {t("common.loading")}
        </Text>
      )}
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
        placeholder={t("flashcard.frontPlaceholder")}
        placeholderTextColor={colors.mutedText}
        multiline
        numberOfLines={3}
        maxLength={500}
        editable
        autoCapitalize="sentences"
      />
      <Text style={styles.charCounter}>{value.length}/500</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 0,
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  langText: {
    fontSize: 12,
    fontWeight: "600",
  },
  translatingHint: {
    fontSize: 12,
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
  charCounter: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
});