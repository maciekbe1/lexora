import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetModal, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Modal } from "@/components/ui/Modal";
import { ImagePickerComponent } from "@/components/features/image-picker";
import { useAppTheme } from "@/theme/useAppTheme";
import type { UserDeck } from "@/types/flashcard";
import { t } from "@/locales/i18n";

interface DeckEditModalProps {
  visible: boolean;
  deck: UserDeck | null;
  onClose: () => void;
  onSave: (updates: Partial<UserDeck>) => void;
}

export function DeckEditModal({
  visible,
  deck,
  onClose,
  onSave,
}: DeckEditModalProps) {
  const { colors } = useAppTheme();
  const modalRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState(deck?.custom_name || deck?.deck_name || "");
  const [description, setDescription] = useState(deck?.deck_description || "");
  const [coverImage, setCoverImage] = useState(deck?.deck_cover_image_url || "");

  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      setName(deck?.custom_name || deck?.deck_name || "");
      setDescription(deck?.deck_description || "");
      setCoverImage(deck?.deck_cover_image_url || "");
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible, deck]);

  const handleSave = () => {
    onSave({
      custom_name: name,
      deck_description: description,
      deck_cover_image_url: coverImage,
    });
    modalRef.current?.dismiss();
  };

  return (
    <Modal
      ref={modalRef}
      title={t("deck.editDeck")}
      onClose={onClose}
      headerRight={
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>{t("common.save")}</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("deck.deckName")}
        </Text>
        <BottomSheetTextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder={t("deck.deckNamePlaceholder")}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("deck.description")}
        </Text>
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
          value={description}
          onChangeText={setDescription}
          placeholder={t("deck.descriptionPlaceholder")}
          placeholderTextColor={colors.mutedText}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {t("deck.coverImage")}
        </Text>
        <ImagePickerComponent
          imageUrl={coverImage}
          onImageSelected={setCoverImage}
          placeholder={t("deck.addCoverImage")}
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