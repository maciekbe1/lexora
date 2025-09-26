import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ImagePickerComponent } from "@/components/features/image-picker";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface DeckCoverImageFieldProps {
  imageUrl: string;
  onImageSelected: (url: string) => void;
}

export function DeckCoverImageField({
  imageUrl,
  onImageSelected,
}: DeckCoverImageFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("deck.coverImage")} ({t("common.optional")})
      </Text>
      <ImagePickerComponent
        imageUrl={imageUrl}
        onImageSelected={onImageSelected}
        placeholder={t("deck.addCoverImage")}
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
});