import type { CustomFlashcard, UserDeck } from "@/shared/types/flashcard";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { DeckSelector } from "@/shared/components/features/deck";
import { ImagePickerComponent } from "@/shared/components/features/image-picker";
import { BaseModal } from "@/shared/components/ui";
import {
  useCustomFlashcardForm,
  UseCustomFlashcardFormParams,
} from "@/shared/hooks";

interface CustomFlashcardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateFlashcard: (
    flashcard: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">
  ) => void;
  userDecks: UserDeck[]; // Only custom decks
  preselectedDeckId?: string;
  editingFlashcard?: CustomFlashcard | null;
}

export function CustomFlashcardModal({
  visible,
  onClose,
  onCreateFlashcard,
  userDecks,
  preselectedDeckId,
  editingFlashcard,
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
    frontText,
    backText,
    hintText,
    frontImageUrl,
    backImageUrl,
    selectedDeck,
    isLoading,
    isTranslating,
    setFrontText,
    setBackText,
    setHintText,
    setFrontImageUrl,
    setBackImageUrl,
    setSelectedDeck,
    markBackEdited,
    handleCreate,
  } = useCustomFlashcardForm(params);

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
            <Text style={styles.label}>Przód fiszki *</Text>
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
              onImageSelected={setFrontImageUrl}
              placeholder="Dodaj zdjęcie do przodu fiszki"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tył fiszki *</Text>
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
            <Text style={styles.label}>Zdjęcie tyłu (opcjonalnie)</Text>
            <ImagePickerComponent
              imageUrl={backImageUrl}
              onImageSelected={setBackImageUrl}
              placeholder="Dodaj zdjęcie do tyłu fiszki"
            />
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
        </>
      )}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
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
  translatingHint: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
