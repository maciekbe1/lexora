import type { CustomFlashcard, UserDeck } from "@/types/flashcard";
import React from "react";
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

import { DeckSelector } from "@/components/features/deck";
import { ImagePickerComponent } from "@/components/features/image-picker";
import { BaseModal } from "@/components/ui";
import { getLanguageFlag, SUPPORTED_LANGUAGES } from "@/constants/languages";
import { useCustomFlashcardForm, UseCustomFlashcardFormParams } from "@/hooks";

interface CustomFlashcardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFlashcard: (
    flashcard: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">
  ) => void;
  userDecks: UserDeck[]; // Only custom decks
  preselectedDeckId?: string;
  editingFlashcard?: CustomFlashcard | null;
  onDeleteFlashcard?: (flashcard: CustomFlashcard) => void;
}

export function CustomFlashcardModal({
  visible,
  onClose,
  onCreateFlashcard,
  userDecks,
  preselectedDeckId,
  editingFlashcard,
  onDeleteFlashcard,
}: CustomFlashcardModalProps) {
  const { colors } = useAppTheme();
  const params: UseCustomFlashcardFormParams = {
    visible,
    userDecks,
    onCreateFlashcard,
  };
  if (preselectedDeckId !== undefined)
    params.preselectedDeckId = preselectedDeckId;
  if (editingFlashcard !== undefined)
    params.editingFlashcard = editingFlashcard;

  const {
    customDecks,
    targetLang,
    frontText,
    backText,
    hintText,
    frontImageUrl,
    selectedDeck,
    isLoading,
    isTranslating,
    setFrontText,
    setBackText,
    setHintText,
    setFrontImageUrl,
    setSelectedDeck,
    setTargetLangOverride,
    markBackEdited,
    handleCreate,
    translateNow,
  } = useCustomFlashcardForm(params);

  const [showLangPicker, setShowLangPicker] = React.useState(false);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={editingFlashcard ? "Edytuj fiszkę" : "Nowa fiszka"}
      requireScrollTopForSwipe
      disableTopGestureZone
      rightButton={{
        text: editingFlashcard ? "Zapisz" : "Stwórz",
        onPress: async () => {
          const ok = await handleCreate();
          if (ok) onClose();
        },
        disabled: isLoading || !selectedDeck,
        loading: isLoading,
      }}
    >
      <DeckSelector
        customDecks={customDecks}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />

      {customDecks.length > 0 && (
        <>
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Przód fiszki *</Text>
              <View style={[styles.langBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <Text style={[styles.langText, { color: colors.text }]}>🇵🇱 PL</Text>
              </View>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={frontText}
              onChangeText={setFrontText}
              placeholder="np. Jak to powiedzieć po hiszpańsku?"
              placeholderTextColor={colors.mutedText}
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={true}
              autoCapitalize="sentences"
            />
            <Text style={styles.charCounter}>{frontText.length}/500</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Zdjęcie przodu (opcjonalnie)</Text>
            <ImagePickerComponent
              imageUrl={frontImageUrl}
              onImageSelected={(url) => {
                setFrontImageUrl(url);
              }}
              placeholder="Dodaj zdjęcie do przodu fiszki"
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.text }]}>Tył fiszki *</Text>
              <View style={styles.rowRight}>
                <View style={[styles.langBadge, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <Text style={[styles.langText, { color: colors.text }]}>
                    {`${getLanguageFlag(targetLang || "")} ${(targetLang || "??").toUpperCase()}`}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowLangPicker((v) => !v)}>
                  <Text style={styles.changeLangButton}>
                    Zmień
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => translateNow({ force: true })}>
                  <Text style={styles.changeLangButton}>
                    Tłumacz
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {showLangPicker && (
              <View style={styles.langPicker}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      setTargetLangOverride(lang.code);
                      setShowLangPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.langOption,
                        lang.code === targetLang && styles.langOptionActive,
                      ]}
                    >
                      {`${lang.flag} ${lang.name}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={backText}
              onChangeText={(t) => {
                markBackEdited();
                setBackText(t);
              }}
              placeholder="np. Hola, ¿cómo estás?"
              placeholderTextColor={colors.mutedText}
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={true}
              autoCapitalize="sentences"
            />
            <View style={styles.rowBetween}>
              <Text style={styles.charCounter}>{backText.length}/500</Text>
              {isTranslating && (<Text style={[styles.translatingHint, { color: colors.mutedText }]}>Tłumaczę…</Text>)}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Podpowiedź (opcjonalnie)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              value={hintText}
              onChangeText={setHintText}
              placeholder="np. Podstawowe powitanie"
              placeholderTextColor={colors.mutedText}
              maxLength={200}
              editable={true}
              autoCapitalize="sentences"
            />
            <Text style={styles.charCounter}>{hintText.length}/200</Text>
          </View>
          {editingFlashcard && onDeleteFlashcard ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Akcje</Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Usuń fiszkę",
                    "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.",
                    [
                      { text: "Anuluj", style: "cancel" },
                      {
                        text: "Usuń",
                        style: "destructive",
                        onPress: () => {
                          onDeleteFlashcard(editingFlashcard);
                          onClose();
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.deleteButton}>
                  Usuń fiszkę
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}
    </BaseModal>
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
    color: "#333",
    marginBottom: 0,
  },
  langBadge: {
    backgroundColor: "#f0f0f3",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e3e3e7",
  },
  langText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
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
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  translatingHint: {
    fontSize: 12,
    color: "#8E8E93",
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
