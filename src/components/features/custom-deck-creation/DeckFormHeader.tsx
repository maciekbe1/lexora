import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface DeckFormHeaderProps {
  isLoading: boolean;
  onSubmit: () => void;
}

export function DeckFormHeader({ isLoading, onSubmit }: DeckFormHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onSubmit}
      disabled={isLoading}
      style={[
        styles.createButton,
        {
          backgroundColor: colors.primary,
          opacity: isLoading ? 0.5 : 1
        }
      ]}
    >
      <Text style={styles.createButtonText}>
        {isLoading ? t("common.loading") : t("common.create")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginHorizontal: 0,
    alignItems: "center",
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});