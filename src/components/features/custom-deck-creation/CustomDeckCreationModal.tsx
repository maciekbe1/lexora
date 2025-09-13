import { ImagePickerComponent } from "@/components/features/image-picker";
import { Modal } from "@/components/ui/Modal";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";
import type { CustomDeck } from "@/types/flashcard";
import React, { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

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
  const { colors } = useAppTheme();
  const modalRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle modal visibility
  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

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
      modalRef.current?.dismiss();
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
    <Modal
      ref={modalRef}
      title="Nowa talia"
      onClose={onClose}
      headerRight={
        <TouchableOpacity
          onPress={handleCreate}
          disabled={isLoading}
          style={[styles.createButton, { opacity: isLoading ? 0.5 : 1 }]}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? "Tworzenie..." : "Stwórz"}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Nazwa talii *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder="np. Moje słówka hiszpańskie"
          placeholderTextColor={colors.mutedText}
          maxLength={100}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Opis (opcjonalnie)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Krótki opis talii..."
          placeholderTextColor={colors.mutedText}
          multiline
          numberOfLines={3}
          maxLength={250}
        />
      </View>

      {renderLanguageSelector()}

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Zdjęcie okładki (opcjonalnie)</Text>
        <ImagePickerComponent
          imageUrl={coverImageUrl}
          onImageSelected={setCoverImageUrl}
          placeholder="Dodaj zdjęcie okładki"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Tagi (opcjonalnie)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
          value={tags}
          onChangeText={setTags}
          placeholder="np. podstawy, słówka, gramatyka"
          placeholderTextColor={colors.mutedText}
          maxLength={200}
        />
        <Text style={styles.helper}>Oddziel tagi przecinkami</Text>
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
    marginBottom: 8,
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
