import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { ImagePickerComponent } from "@/components/features/image-picker";
import { t } from "@/locales/i18n";

interface FlashcardImageFieldProps {
  imageUrl: string | null;
  onImageSelected: (url: string | null) => void;
}

export function FlashcardImageField({
  imageUrl,
  onImageSelected,
}: FlashcardImageFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("flashcard.addImage")}
      </Text>
      {imageUrl !== null ? (
        <ImagePickerComponent
          imageUrl={imageUrl}
          onImageSelected={onImageSelected}
          placeholder={t("flashcard.addImage")}
        />
      ) : (
        <ImagePickerComponent
          onImageSelected={onImageSelected}
          placeholder={t("flashcard.addImage")}
        />
      )}
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