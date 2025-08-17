import { ImagePickerComponent } from "@/shared/components/features/image-picker";
import { BaseModal } from "@/shared/components/ui";
import { SUPPORTED_LANGUAGES } from "@/shared/constants/languages";
import type { CustomDeck } from "@/shared/types/flashcard";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CustomDeckCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateDeck: (
    deck: Omit<CustomDeck, "id" | "user_id" | "created_at" | "updated_at">
  ) => void;
}

export function CustomDeckCreationModal({
  visible,
  onClose,
  onCreateDeck,
}: CustomDeckCreationModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Błąd", "Nazwa talii jest wymagana");
      return;
    }

    setIsLoading(true);
    try {
      const newDeck: Omit<
        CustomDeck,
        "id" | "user_id" | "created_at" | "updated_at"
      > = {
        name: name.trim(),
        description: description.trim() || "",
        language: selectedLanguage,
        cover_image_url: coverImageUrl || "",
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        is_active: true,
      };

      await onCreateDeck(newDeck);

      // Reset form
      setName("");
      setDescription("");
      setSelectedLanguage("en");
      setCoverImageUrl("");
      setTags("");
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się stworzyć talii");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLanguageSelector = () => (
    <View style={styles.languageContainer}>
      <Text style={styles.label}>Język:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.languageScroll}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              selectedLanguage === language.code &&
                styles.languageButtonSelected,
            ]}
            onPress={() => setSelectedLanguage(language.code)}
          >
            <Text style={styles.languageFlag}>{language.flag}</Text>
            <Text
              style={[
                styles.languageName,
                selectedLanguage === language.code &&
                  styles.languageNameSelected,
              ]}
            >
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Nowa talia"
      rightButton={{
        text: isLoading ? "Tworzenie..." : "Stwórz",
        onPress: handleCreate,
        disabled: isLoading,
        loading: isLoading,
      }}
    >
      <View style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nazwa talii *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="np. Moje słówka hiszpańskie"
            placeholderTextColor="#999"
            maxLength={100}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Opis (opcjonalnie)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Krótki opis talii..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            maxLength={250}
          />
        </View>

        {renderLanguageSelector()}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Zdjęcie okładki (opcjonalnie)</Text>
          <ImagePickerComponent
            imageUrl={coverImageUrl}
            onImageSelected={setCoverImageUrl}
            placeholder="Dodaj zdjęcie okładki"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tagi (opcjonalnie)</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="np. podstawy, słówka, gramatyka"
            placeholderTextColor="#999"
            maxLength={200}
          />
          <Text style={styles.helper}>Oddziel tagi przecinkami</Text>
        </View>
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  helper: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  languageContainer: {
    marginBottom: 24,
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
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  languageButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageName: {
    fontSize: 14,
    color: "#333",
  },
  languageNameSelected: {
    color: "#fff",
    fontWeight: "500",
  },
});
