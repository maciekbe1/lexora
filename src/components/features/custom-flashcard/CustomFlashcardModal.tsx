import type { CustomFlashcard, UserDeck } from "@/types/flashcard";
import React, { useRef } from "react";

import { DeckSelector } from "@/components/features/deck";
import { Modal } from "@/components/ui/Modal";
import { useCustomFlashcardForm, UseCustomFlashcardFormParams } from "@/hooks";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { t } from "@/locales/i18n";
import {
  FlashcardFormHeader,
  FlashcardFrontField,
  FlashcardBackField,
  FlashcardHintField,
  FlashcardImageField,
  FlashcardDeleteButton,
} from "./";

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
  const modalRef = useRef<BottomSheetModal>(null);
  const [showLangPicker, setShowLangPicker] = React.useState(false);
  const params: UseCustomFlashcardFormParams = {
    visible,
    userDecks,
    onCreateFlashcard,
  };

  // Handle modal visibility
  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);
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
    isReverseTranslating,
    showSuggestionDialog,
    showReverseSuggestionDialog,
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

  // Handle suggestion dialog display
  React.useEffect(() => {
    if (showSuggestionDialog) {
      showReverseSuggestionDialog();
    }
  }, [showSuggestionDialog]);

  const handleCreateAndClose = async () => {
    const ok = await handleCreate();
    if (ok) modalRef.current?.dismiss();
  };

  return (
    <Modal
      ref={modalRef}
      title={editingFlashcard ? t("flashcard.editCard") : t("flashcard.createFlashcard")}
      onClose={onClose}
      fullHeight={false}
      headerRight={
        <FlashcardFormHeader
          isEditing={!!editingFlashcard}
          isLoading={isLoading}
          hasSelectedDeck={!!selectedDeck}
          onSave={handleCreateAndClose}
        />
      }
    >
      <DeckSelector
        customDecks={customDecks}
        selectedDeck={selectedDeck}
        onSelectDeck={setSelectedDeck}
      />

      {customDecks.length > 0 && (
        <>
          <FlashcardFrontField
            value={frontText}
            isTranslating={isReverseTranslating}
            onChange={setFrontText}
          />

          <FlashcardImageField
            imageUrl={frontImageUrl}
            onImageSelected={(url) => setFrontImageUrl(url || "")}
          />

          <FlashcardBackField
            value={backText}
            targetLang={targetLang}
            isTranslating={isTranslating}
            showLangPicker={showLangPicker}
            onChange={setBackText}
            onMarkEdited={markBackEdited}
            onToggleLangPicker={() => setShowLangPicker(!showLangPicker)}
            onSelectLanguage={(langCode) => {
              setTargetLangOverride(langCode);
              setShowLangPicker(false);
            }}
            onTranslate={() => translateNow({ force: true })}
          />

          <FlashcardHintField value={hintText} onChange={setHintText} />

          {editingFlashcard && onDeleteFlashcard && (
            <FlashcardDeleteButton
              flashcard={editingFlashcard}
              onDelete={onDeleteFlashcard}
              onClose={onClose}
            />
          )}
        </>
      )}
    </Modal>
  );
}
