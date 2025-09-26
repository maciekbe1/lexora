import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

interface DeckLanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

export function DeckLanguageSelector({
  selectedLanguage,
  onSelectLanguage,
}: DeckLanguageSelectorProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.languageContainer}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("settings.language")}:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.languageScroll}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <LanguageOption
            key={language.code}
            language={language}
            isSelected={selectedLanguage === language.code}
            onSelect={() => onSelectLanguage(language.code)}
            colors={colors}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface LanguageOptionProps {
  language: { code: string; flag: string; name: string };
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
}

function LanguageOption({
  language,
  isSelected,
  onSelect,
  colors,
}: LanguageOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.languageButton,
        {
          borderColor: isSelected ? "#007AFF" : colors.border,
          backgroundColor: isSelected ? "#007AFF" : colors.surface,
        },
      ]}
      onPress={onSelect}
    >
      <Text style={styles.languageFlag}>{language.flag}</Text>
      <Text
        style={[
          styles.languageName,
          { color: isSelected ? "#fff" : colors.text },
          isSelected && styles.languageNameSelected,
        ]}
      >
        {language.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  languageContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  languageScroll: {
    marginTop: 8,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageName: {
    fontSize: 14,
  },
  languageNameSelected: {
    fontWeight: "500",
  },
});