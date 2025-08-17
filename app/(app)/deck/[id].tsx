import { CustomFlashcardModal } from "@/shared/components/features/custom-flashcard/CustomFlashcardModal";
import { DeckEditModal } from "@/shared/components/features/deck-edit";
import { DeckHeader } from "@/shared/components/features/deck/DeckHeader";
import { DeckInfo } from "@/shared/components/features/deck/DeckInfo";
import { EmptyFlashcardsState } from "@/shared/components/features/flashcards/EmptyFlashcardsState";
import { FlashcardItem } from "@/shared/components/features/flashcards/FlashcardItem";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useFlashcardManagement } from "../../../src/shared/hooks/useFlashcardManagement";
import type { CustomFlashcard } from "../../../src/shared/types/flashcard";
import { useAuthStore } from "../../../src/store/auth";

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [showAddFlashcardModal, setShowAddFlashcardModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] =
    useState<CustomFlashcard | null>(null);

  // Use the custom hook for all deck and flashcard management
  const {
    deck,
    flashcards,
    refreshing,
    isLoading,
    onRefresh,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUpdateDeck,
    handleDeleteDeck,
    handleStartStudy,
  } = useFlashcardManagement(user, id!);

  // Edit flashcard
  const handleEditFlashcard = (flashcard: CustomFlashcard) => {
    setEditingFlashcard(flashcard);
    setShowAddFlashcardModal(true);
  };

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
      onAddFlashcard={() => setShowAddFlashcardModal(true)}
    />
  );

  // Handle loading and error states
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <DeckHeader
          deckName="Ładowanie..."
          flashcardCount={0}
          isCustomDeck={false}
          onAddFlashcard={() => {}}
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

  // Extract deck information with legacy fallbacks
  const deckName = deck.deck_name || deck.custom_name || "Talia bez nazwy";
  const deckDescription = deck.deck_description || "Brak opisu";

  return (
    <View style={styles.container}>
      {/* Header */}
      <DeckHeader
        deckName={deckName}
        flashcardCount={flashcards.length}
        isCustomDeck={deck.is_custom || false}
        onAddFlashcard={() => setShowAddFlashcardModal(true)}
        onEditDeck={() => setShowEditDeckModal(true)}
        onDeleteDeck={handleDeleteDeck}
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
        onClose={() => {
          setShowAddFlashcardModal(false);
          setEditingFlashcard(null);
        }}
        onCreateFlashcard={
          editingFlashcard
            ? (data) => handleUpdateFlashcard(data, editingFlashcard)
            : handleCreateFlashcard
        }
        userDecks={deck ? [deck] : []} // Only show current deck
        preselectedDeckId={deck?.id}
        editingFlashcard={editingFlashcard}
      />

      {/* Edit Deck Modal */}
      <DeckEditModal
        visible={showEditDeckModal}
        onClose={() => setShowEditDeckModal(false)}
        onSave={handleUpdateDeck}
        deck={deck}
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
