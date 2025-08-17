import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import type { CustomFlashcard, UserDeck } from "@/shared/types/flashcard";

import { BaseModal } from "@/shared/components/ui";
import { DeckSelector } from "@/shared/components/features/deck";
import { ImagePickerComponent } from "@/shared/components/features/image-picker";

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
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [hintText, setHintText] = useState("");
  const [frontImageUrl, setFrontImageUrl] = useState("");
  const [backImageUrl, setBackImageUrl] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<string>(
    preselectedDeckId || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter to only custom decks (not template decks)
  const customDecks = userDecks.filter((deck) => deck.is_custom);

  // Initialize form with editing data or reset
  useEffect(() => {
    if (!visible) return; // Only run when modal becomes visible

    if (editingFlashcard) {
      // Editing mode - populate fields
      setFrontText(editingFlashcard.front_text);
      setBackText(editingFlashcard.back_text);
      setHintText(editingFlashcard.hint_text);
      setFrontImageUrl(editingFlashcard.front_image_url);
      setBackImageUrl(editingFlashcard.back_image_url);
      setSelectedDeck(editingFlashcard.user_deck_id);
    } else {
      // Create mode - reset fields
      setFrontText("");
      setBackText("");
      setHintText("");
      setFrontImageUrl("");
      setBackImageUrl("");

      // Set deck selection
      if (
        preselectedDeckId &&
        customDecks.find((deck) => deck.id === preselectedDeckId)
      ) {
        setSelectedDeck(preselectedDeckId);
      } else if (customDecks.length === 1) {
        setSelectedDeck(customDecks[0].id);
      } else {
        setSelectedDeck("");
      }
    }
  }, [visible]); // Only depend on modal visibility to prevent loops

  const handleCreate = async () => {
    if (!frontText.trim()) {
      Alert.alert("Błąd", "Tekst przedniej strony jest wymagany");
      return;
    }

    if (!backText.trim()) {
      Alert.alert("Błąd", "Tekst tylnej strony jest wymagany");
      return;
    }

    if (!selectedDeck) {
      Alert.alert("Błąd", "Wybierz talię dla fiszki");
      return;
    }

    setIsLoading(true);
    try {
      const selectedDeckData = customDecks.find(
        (deck) => deck.id === selectedDeck
      );
      if (!selectedDeckData) {
        throw new Error("Selected deck not found");
      }

      const newFlashcard: Omit<
        CustomFlashcard,
        "id" | "created_at" | "updated_at"
      > = {
        user_deck_id: selectedDeck,
        front_text: frontText.trim(),
        back_text: backText.trim(),
        hint_text: hintText.trim() || "",
        front_image_url: frontImageUrl || "",
        back_image_url: backImageUrl || "",
        front_audio_url: "",
        back_audio_url: "",
        position: 0, // Will be set by the backend based on existing cards
        user_id: selectedDeckData.user_id,
      };

      await onCreateFlashcard(newFlashcard);

      // Reset form
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się utworzyć fiszki");
      console.error("Create flashcard error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFrontText("");
    setBackText("");
    setHintText("");
    setFrontImageUrl("");
    setBackImageUrl("");
    if (!preselectedDeckId) {
      setSelectedDeck("");
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={editingFlashcard ? "Edytuj fiszkę" : "Nowa fiszka"}
      rightButton={{
        text: editingFlashcard ? "Zapisz" : "Stwórz",
        onPress: handleCreate,
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
              onChangeText={setBackText}
              placeholder="np. Hola, ¿cómo estás?"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              maxLength={500}
              editable={true}
              autoCapitalize="sentences"
            />
            <Text style={styles.charCounter}>{backText.length}/500</Text>
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
});
