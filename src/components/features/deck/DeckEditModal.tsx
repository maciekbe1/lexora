import { ImagePickerComponent } from "@/components/features/image-picker";
import { Modal } from "@/components/ui/Modal";
import type { UserDeck } from "@/types/flashcard";
import React, { useEffect, useState, useRef } from "react";
import { Alert, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface DeckEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (deckData: {
    name: string;
    description: string;
    language: string;
    coverImageUrl: string;
  }) => void;
  deck: UserDeck | null;
}

export function DeckEditModal({
  visible,
  onClose,
  onSave,
  deck,
}: DeckEditModalProps) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle modal visibility
  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  // Initialize form with deck data
  useEffect(() => {
    if (!visible || !deck) return;

    setName(deck.deck_name || "");
    setDescription(deck.deck_description || "");
    setLanguage(deck.deck_language || "");
    setCoverImageUrl(deck.deck_cover_image_url || "");
  }, [visible, deck]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Błąd", "Nazwa talii jest wymagana");
      return;
    }

    setIsLoading(true);
    try {
      onSave({
        name: name.trim(),
        description: description.trim(),
        language: language.trim() || "pl",
        coverImageUrl: coverImageUrl || "",
      });

      modalRef.current?.dismiss();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać zmian");
      console.error("Save deck error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      ref={modalRef}
      title="Edytuj talię"
      onClose={onClose}
      headerRight={
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={[styles.saveButton, { opacity: isLoading ? 0.5 : 1 }]}
        >
          <Text style={styles.saveButtonText}>
            Zapisz
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nazwa talii *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="np. Hiszpański - podstawy"
          placeholderTextColor="#999"
          maxLength={100}
          editable={true}
          autoCapitalize="sentences"
        />
        <Text style={styles.charCounter}>{name.length}/100</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Opis talii (opcjonalnie)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="np. Podstawowe słowa i zwroty w języku hiszpańskim"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          maxLength={500}
          editable={true}
          autoCapitalize="sentences"
        />
        <Text style={styles.charCounter}>{description.length}/500</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Język</Text>
        <TextInput
          style={styles.input}
          value={language}
          onChangeText={setLanguage}
          placeholder="np. hiszpański, angielski, niemiecki"
          placeholderTextColor="#999"
          maxLength={50}
          editable={true}
          autoCapitalize="words"
        />
        <Text style={styles.charCounter}>{language.length}/50</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Okładka talii (opcjonalnie)</Text>
        <ImagePickerComponent
          imageUrl={coverImageUrl}
          onImageSelected={setCoverImageUrl}
          placeholder="Dodaj okładkę do talii"
        />
      </View>
    </Modal>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
