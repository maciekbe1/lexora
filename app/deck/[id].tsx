import { CustomFlashcardModal } from "@/components/features/custom-flashcard/CustomFlashcardModal";
import {
  DeckEditModal,
  DeckHeader,
  DeckInfo,
} from "@/components/features/deck";
import { DeckOptionsMenu } from "@/components/features/deck-options-menu";
import {
  EmptyFlashcardsState,
  FlashcardItem,
  ReorderModeList,
} from "@/components/features/flashcards";
import { useDeckDetail } from "@/hooks/useDeckDetail";
import type { CustomFlashcard } from "@/types/flashcard";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import { useDisableBackGestureWhileOverlay } from "@/hooks/useDisableBackGestureWhileOverlay";

export default function DeckDetailScreen() {
  const { colors } = useAppTheme();
  useDisableBackGestureWhileOverlay();
  const {
    deck,
    flashcards,
    deckName,
    deckDescription,
    refreshing,
    showLoading,
    isDeleting,
    showAddFlashcardModal,
    showEditDeckModal,
    showOptionsMenu,
    editingFlashcard,
    dueToday,
    isReorderMode,
    isSyncing,
    syncError,
    onRefresh,
    handleEditFlashcard,
    handleAddFlashcard,
    handleEditDeck,
    handleDeleteFlashcard,
    handleDeleteDeck,
    handleStartStudy,
    handleToggleOptionsMenu,
    handleFlashcardSubmit,
    handleUpdateDeck,
    handleReorderFlashcards,
    handleToggleReorderMode,
    modalHandlers,
  } = useDeckDetail();

  // Check if drag is enabled for custom decks only
  const isDragEnabled = deck?.is_custom || false;


  // Render flashcard item
  const renderFlashcardItem = ({
    item,
    index,
  }: {
    item: CustomFlashcard;
    index: number;
  }) => {
    return (
      <FlashcardItem 
        flashcard={item} 
        index={index} 
        onEdit={deck?.is_custom ? handleEditFlashcard : (() => {})} 
      />
    );
  };

  // Render empty state using the EmptyFlashcardsState component
  const renderEmptyState = () => (
    <EmptyFlashcardsState
      isCustomDeck={deck?.is_custom || false}
      onAddFlashcard={modalHandlers.flashcard.show}
    />
  );

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
      <DeckHeader
        deckName={deckName}
        flashcardCount={flashcards.length}
        isCustomDeck={deck.is_custom || false}
        onAddFlashcard={handleAddFlashcard}
        onToggleOptions={handleToggleOptionsMenu}
        isReorderMode={isReorderMode}
        onExitReorderMode={handleToggleReorderMode}
      />

      {/* Deck Info and Study Button - Hidden in reorder mode */}
      {!isReorderMode && (
        <DeckInfo
          deckDescription={deckDescription}
          deckLanguage={deck.deck_language || undefined}
          flashcardCount={flashcards.length}
          dueToday={dueToday}
          stats={{
            new: deck.stats_new ?? 0,
            learning: deck.stats_learning ?? 0,
            mastered: deck.stats_mastered ?? 0,
          }}
          onStartStudy={handleStartStudy}
        />
      )}

      {/* Flashcards List */}
      {isReorderMode && isDragEnabled ? (
        <ReorderModeList
          flashcards={flashcards}
          onReorder={handleReorderFlashcards}
          isSyncing={isSyncing}
          syncError={syncError}
        />
      ) : (
        <FlatList
          data={flashcards}
          renderItem={renderFlashcardItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            flashcards.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          scrollEnabled={true}
        />
      )}

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
        onSave={handleUpdateDeck}
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
});
