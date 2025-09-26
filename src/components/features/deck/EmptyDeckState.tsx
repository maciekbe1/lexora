import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

export function EmptyDeckState() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {t("deck.emptyDeck")}
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        {t("deck.addCardsPrompt")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});