import type { CustomFlashcard, UserDeck } from "@/types/flashcard";
import React from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

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
  } = useCustomFlashcardForm(params);

  const [showLangPicker, setShowLangPicker] = React.useState(false);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={editingFlashcard ? "Edytuj fiszkę" : "Nowa fiszka"}
      rightButton={{
        text: editingFlashcard ? "Zapisz" : "Stwórz",
        onPress: async () => {
          const ok = await handleCreate();
          if (ok) onClose();
        },
        disabled: isLoading || customDecks.length === 0,
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
              <Text style={styles.label}>Przód fiszki *</Text>
              <View style={styles.langBadge}>
                <Text style={styles.langText}>🇵🇱 PL</Text>
              </View>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={frontText}
              onChangeText={setFrontText}
              placeholder="np. Jak to powiedzieć po hiszpańsku?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={true}
              autoCapitalize="sentences"
            />
            <Text style={styles.charCounter}>{frontText.length}/500</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Zdjęcie przodu (opcjonalnie)</Text>
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
              <Text style={styles.label}>Tył fiszki *</Text>
              <View style={styles.rowRight}>
                <View style={styles.langBadge}>
                  <Text style={styles.langText}>
                    {`${getLanguageFlag(targetLang || "")} ${(targetLang || "??").toUpperCase()}`}
                  </Text>
                </View>
                <Text
                  accessibilityRole="button"
                  style={styles.changeLangButton}
                  onPress={() => setShowLangPicker((v) => !v)}
                >
                  Zmień
                </Text>
              </View>
            </View>
            {showLangPicker && (
              <View style={styles.langPicker}>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <Text
                    key={lang.code}
                    accessibilityRole="button"
                    style={[
                      styles.langOption,
                      lang.code === targetLang && styles.langOptionActive,
                    ]}
                    onPress={() => {
                      setTargetLangOverride(lang.code);
                      setShowLangPicker(false);
                    }}
                  >
                    {`${lang.flag} ${lang.name}`}
                  </Text>
                ))}
              </View>
            )}
            <TextInput
              style={[styles.input, styles.textArea]}
              value={backText}
              onChangeText={(t) => {
                markBackEdited();
                setBackText(t);
              }}
              placeholder="np. Hola, ¿cómo estás?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={true}
              autoCapitalize="sentences"
            />
            <View style={styles.rowBetween}>
              <Text style={styles.charCounter}>{backText.length}/500</Text>
              {isTranslating && (
                <Text style={styles.translatingHint}>Tłumaczę…</Text>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Podpowiedź (opcjonalnie)</Text>
            <TextInput
              style={styles.input}
              value={hintText}
              onChangeText={setHintText}
              placeholder="np. Podstawowe powitanie"
              placeholderTextColor="#999"
              maxLength={200}
              editable={true}
              autoCapitalize="sentences"
            />
            <Text style={styles.charCounter}>{hintText.length}/200</Text>
          </View>
          {editingFlashcard && onDeleteFlashcard ? (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Akcje</Text>
              <Text
                accessibilityRole="button"
                style={styles.deleteButton}
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
                Usuń fiszkę
              </Text>
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
