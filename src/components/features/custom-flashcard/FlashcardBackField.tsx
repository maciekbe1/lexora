import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useAppTheme } from "@/theme/useAppTheme";
import { getLanguageFlag, SUPPORTED_LANGUAGES } from "@/constants/languages";
import { t } from "@/locales/i18n";

interface FlashcardBackFieldProps {
  value: string;
  targetLang: string;
  isTranslating: boolean;
  showLangPicker: boolean;
  onChange: (text: string) => void;
  onMarkEdited: () => void;
  onToggleLangPicker: () => void;
  onSelectLanguage: (langCode: string) => void;
  onTranslate: () => void;
}

export function FlashcardBackField({
  value,
  targetLang,
  isTranslating,
  showLangPicker,
  onChange,
  onMarkEdited,
  onToggleLangPicker,
  onSelectLanguage,
  onTranslate,
}: FlashcardBackFieldProps) {
  const { colors } = useAppTheme();

  const handleTextChange = (text: string) => {
    onMarkEdited();
    onChange(text);
  };

  const handleLanguageSelect = (langCode: string) => {
    onSelectLanguage(langCode);
    onToggleLangPicker();
  };

  return (
    <View style={styles.formGroup}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("flashcard.back")} *
        </Text>
        <View style={styles.rowRight}>
          <View
            style={[
              styles.langBadge,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text style={[styles.langText, { color: colors.text }]}>
              {`${getLanguageFlag(targetLang || "")} ${(
                targetLang || "??"
              ).toUpperCase()}`}
            </Text>
          </View>
          <TouchableOpacity onPress={onToggleLangPicker}>
            <Text style={styles.changeLangButton}>{t("common.edit")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onTranslate}>
            <Text style={styles.changeLangButton}>{t("actions.translate")}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showLangPicker && (
        <LanguagePicker
          currentLang={targetLang}
          onSelectLanguage={handleLanguageSelect}
        />
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
        onChangeText={handleTextChange}
        placeholder={t("flashcard.backPlaceholder")}
        placeholderTextColor={colors.mutedText}
        multiline
        numberOfLines={3}
        maxLength={500}
        editable
        autoCapitalize="sentences"
      />
      <View style={styles.rowBetween}>
        <Text style={styles.charCounter}>{value.length}/500</Text>
        {isTranslating && (
          <Text style={[styles.translatingHint, { color: colors.mutedText }]}>
            {t("common.loading")}
          </Text>
        )}
      </View>
    </View>
  );
}

function LanguagePicker({
  currentLang,
  onSelectLanguage,
}: {
  currentLang: string;
  onSelectLanguage: (langCode: string) => void;
}) {
  return (
    <View style={styles.langPicker}>
      {SUPPORTED_LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          onPress={() => onSelectLanguage(lang.code)}
        >
          <Text
            style={[
              styles.langOption,
              lang.code === currentLang && styles.langOptionActive,
            ]}
          >
            {`${lang.flag} ${lang.name}`}
          </Text>
        </TouchableOpacity>
      ))}
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
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  changeLangButton: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  langPicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e3e3e7",
    borderRadius: 8,
    overflow: "hidden",
  },
  langOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontSize: 14,
    color: "#1a1a1a",
  },
  langOptionActive: {
    backgroundColor: "#f5f7ff",
    color: "#007AFF",
    fontWeight: "600",
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCounter: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  translatingHint: {
    fontSize: 12,
  },
});