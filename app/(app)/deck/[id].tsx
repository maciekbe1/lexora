import { CustomFlashcardModal } from "@/shared/components/features/custom-flashcard/CustomFlashcardModal";
import {
  DeckEditModal,
  DeckHeader,
  DeckHeaderSkeleton,
  DeckInfo,
  DeckInfoSkeleton,
} from "@/shared/components/features/deck";
import { DeckOptionsMenu } from "@/shared/components/features/deck-options-menu";
import {
  EmptyFlashcardsState,
  FlashcardItem,
  FlashcardItemSkeleton,
} from "@/shared/components/features/flashcards";
import { useDeckDetail } from "@/shared/hooks";
import type { CustomFlashcard } from "@/shared/types/flashcard";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DeckDetailScreen() {
  const insets = useSafeAreaInsets();
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
    modalHandlers,
  } = useDeckDetail();

  // Render flashcard item using the FlashcardItem component
  const renderFlashcardItem = ({
    item,
    index,
  }: {
    item: CustomFlashcard;
    index: number;
  }) => (
    <FlashcardItem
      flashcard={item}
      index={index}
      onEdit={handleEditFlashcard}
      onDelete={handleDeleteFlashcard}
    />
  );

  // Render empty state using the EmptyFlashcardsState component
  const renderEmptyState = () => (
    <EmptyFlashcardsState
      isCustomDeck={deck?.is_custom || false}
      onAddFlashcard={modalHandlers.flashcard.show}
    />
  );

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <DeckHeaderSkeleton />
        <DeckInfoSkeleton />
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={(i) => String(i)}
          renderItem={() => <FlashcardItemSkeleton />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 16 },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={styles.errorContainer}>
        <DeckHeader
          deckName="Błąd"
          flashcardCount={0}
          isCustomDeck={false}
          onAddFlashcard={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <DeckHeader
        deckName={deckName}
        flashcardCount={flashcards.length}
        isCustomDeck={deck.is_custom || false}
        onAddFlashcard={handleAddFlashcard}
        onToggleOptions={handleToggleOptionsMenu}
      />

      {/* Deck Info and Study Button */}
      <DeckInfo
        deckDescription={deckDescription}
        deckLanguage={deck.deck_language}
        flashcardCount={flashcards.length}
        onStartStudy={handleStartStudy}
      />

      {/* Flashcards List */}
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
      />

      {/* Add/Edit Flashcard Modal */}
      <CustomFlashcardModal
        visible={showAddFlashcardModal}
        onClose={modalHandlers.flashcard.hide}
        onCreateFlashcard={handleFlashcardSubmit}
        userDecks={deck ? [deck] : []} // Only show current deck
        preselectedDeckId={deck?.id}
        editingFlashcard={editingFlashcard}
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
        isDeleting={isDeleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
});
