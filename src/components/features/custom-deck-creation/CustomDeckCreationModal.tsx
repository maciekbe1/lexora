import type { CustomDeck } from "@/types/flashcard";
import React, { useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useAppTheme } from "@/theme/useAppTheme";
import { MODAL_CONFIG } from "@/constants/modalConfig";
import { t } from "@/locales/i18n";
import {
  DeckFormHeader,
  DeckNameField,
  DeckDescriptionField,
  DeckLanguageSelector,
  DeckCoverImageField,
  DeckTagsField,
} from "./";
import { Modal } from "@/components/ui/Modal";

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
  // const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
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
      Alert.alert(t("common.error"), t("deck.nameRequired"));
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
      Alert.alert(t("common.error"), t("deck.createError"));
    } finally {
      setIsLoading(false);
    }
  };


  // Using shared Modal header; no custom header here

  const renderContent = () => (
    <BottomSheetScrollView
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + MODAL_CONFIG.PADDING.BOTTOM_SAFE }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <DeckNameField value={name} onChange={setName} />

      <DeckDescriptionField value={description} onChange={setDescription} />

      <DeckLanguageSelector
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
      />

      <DeckCoverImageField
        imageUrl={coverImageUrl}
        onImageSelected={setCoverImageUrl}
      />

      <DeckTagsField value={tags} onChange={setTags} />

      <DeckFormHeader isLoading={isLoading} onSubmit={handleCreate} />
    </BottomSheetScrollView>
  );

  return (
    <Modal
      ref={modalRef}
      title={t("deck.newDeck")}
      onClose={onClose}
    >
      {renderContent()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {},
  headerLeft: {},
  headerRight: {},
  title: {},
  content: {
    paddingHorizontal: MODAL_CONFIG.PADDING.HORIZONTAL,
    paddingTop: MODAL_CONFIG.PADDING.VERTICAL,
  },
});
