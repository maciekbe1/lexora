import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import type { UserDeck } from "@/shared/types/flashcard";
import { BaseModal } from "@/shared/components/ui";
import { ImagePickerComponent } from "@/shared/components/features/image-picker";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    if (!description.trim()) {
      Alert.alert("Błąd", "Opis talii jest wymagany");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        language: language.trim() || "pl",
        coverImageUrl: coverImageUrl || "",
      });

      onClose();
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się zapisać zmian");
      console.error("Save deck error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Edytuj talię"
      rightButton={{
        text: "Zapisz",
        onPress: handleSave,
        disabled: isLoading,
        loading: isLoading,
      }}
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
        <Text style={styles.label}>Opis talii *</Text>
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
