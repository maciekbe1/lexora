import { CustomFlashcardModal } from "@/components/features/custom-flashcard/CustomFlashcardModal";
import {
  DeckEditModal,
  DeckHeader,
  DeckInfo,
} from "@/components/features/deck";
import { DeckStatistics } from "@/components/features/deck/DeckStatistics";
import DeckOptionsMenu from "@/components/features/deck-options-menu/DeckOptionsMenu";
import { useDeckDetail } from "@/hooks/useDeckDetail";
import React, { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { useDisableBackGestureWhileOverlay } from "@/hooks/useDisableBackGestureWhileOverlay";
import { useNavigation } from "@react-navigation/native";
import { IconButton } from "@/components/ui/core";

export default function DeckDetailScreen() {
  const { colors } = useAppTheme();
  const navigation = useNavigation();
  useDisableBackGestureWhileOverlay();
  const {
    deck,
    flashcards,
    deckName,
    showLoading,
    isDeleting,
    showAddFlashcardModal,
    showEditDeckModal,
    showOptionsMenu,
    editingFlashcard,
    dueToday,
    isReorderMode,
    handleAddFlashcard,
    handleEditDeck,
    handleDeleteFlashcard,
    handleDeleteDeck,
    handleStartStudy,
    handleToggleOptionsMenu,
    handleFlashcardSubmit,
    handleUpdateDeck,
    handleToggleReorderMode,
    modalHandlers,
  } = useDeckDetail();

  // Configure navigation header
  useLayoutEffect(() => {
    if (!deck) return;

    navigation.setOptions({
      title: isReorderMode ? "Układaj fiszki" : deckName,
      headerRight: () => (
        <View style={styles.headerActions}>
          {deck.is_custom && (
            <IconButton
              icon="create-outline"
              variant="glass"
              size="medium"
              onPress={handleEditDeck}
            />
          )}
          <IconButton
            icon="ellipsis-vertical"
            variant="glass"
            size="medium"
            onPress={handleToggleOptionsMenu}
          />
        </View>
      ),
    });
  }, [
    navigation,
    deck,
    deckName,
    isReorderMode,
    handleAddFlashcard,
    handleToggleOptionsMenu,
    handleToggleReorderMode,
    colors.primary,
  ]);



  if (showLoading) {
    // Show empty state with proper background - no skeletons to prevent flash  
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  if (!deck) {
    // Show empty state with proper background - no error message during loading
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <DeckHeader deck={deck} />

      {/* Deck Info and Study Button - Hidden in reorder mode */}
      {!isReorderMode && (
        <DeckInfo
          deck={deck}
          flashcardCount={flashcards.length}
          dueToday={dueToday}
          onStartStudy={handleStartStudy}
        />
      )}

      {/* Statistics View */}
      <DeckStatistics
        deck={deck}
        flashcardCount={flashcards.length}
        dueToday={dueToday}
      />

      {/* Add/Edit Flashcard Modal */}
      <CustomFlashcardModal
        visible={showAddFlashcardModal}
        onClose={modalHandlers.flashcard.hide}
        onCreateFlashcard={handleFlashcardSubmit}
        userDecks={deck ? [deck] : []} // Only show current deck
        preselectedDeckId={deck?.id}
        editingFlashcard={editingFlashcard}
        onDeleteFlashcard={(f) => handleDeleteFlashcard(f, { skipConfirm: true })}
      />

      {/* Edit Deck Modal */}
      <DeckEditModal
        visible={showEditDeckModal}
        onClose={modalHandlers.editDeck.hide}
        onSave={(updates) => {
          // Convert Partial<UserDeck> to the expected format
          handleUpdateDeck({
            name: updates.custom_name || deck.custom_name || deck.deck_name || '',
            description: updates.deck_description || deck.deck_description || '',
            language: updates.deck_language || deck.deck_language || 'pl',
            coverImageUrl: updates.deck_cover_image_url || deck.deck_cover_image_url || '',
          });
        }}
        deck={deck}
      />

      {/* Deck Options Menu */}
      <DeckOptionsMenu
        visible={showOptionsMenu}
        onClose={modalHandlers.optionsMenu.hide}
        onEditDeck={handleEditDeck}
        onDeleteDeck={handleDeleteDeck}
        onToggleReorderMode={handleToggleReorderMode}
        isDeleting={isDeleting}
        isCustomDeck={deck?.is_custom || false}
        isReorderMode={isReorderMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
});
