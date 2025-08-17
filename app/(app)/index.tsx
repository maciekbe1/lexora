import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { TemplateDeckSelectionModal } from "@/shared/components/features/template-deck-selection";
import { FloatingActionButton } from "@/shared/components/ui";
import { useDashboard } from "@/shared/hooks";
import type { UserDeck } from "@/shared/types/flashcard";

import { CustomDeckCreationModal } from "@/shared/components/features/custom-deck-creation";
import { CustomFlashcardModal } from "@/shared/components/features/custom-flashcard";
import {
  DeckCard,
  DeckCardSkeleton,
  EmptyDeckState,
} from "@/shared/components/features/deck";
import { FloatingActionMenu } from "@/shared/components/features/floating-action-menu";
import { AppHeader } from "@/shared/components/ui";

export default function DashboardScreen() {
  const {
    userDecks,
    refreshing,
    showLoading,
    showTemplateModal,
    showCustomDeckModal,
    showCustomFlashcardModal,
    showActionMenu,
    handleDeckPress,
    handleFABPress,
    handleCreateDeck,
    handleCreateFlashcard,
    handleBrowseTemplates,
    onRefresh,
    modalHandlers,
    createCustomDeck,
    createCustomFlashcard,
    fetchUserDecks,
  } = useDashboard();

  const renderDeckItem = ({ item }: { item: UserDeck }) => (
    <DeckCard item={item} onPress={handleDeckPress} />
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Moja Nauka" showAddButton={false} />

      {showLoading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => <DeckCardSkeleton />}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={[styles.list]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <>
          <FlatList
            data={userDecks}
            renderItem={renderDeckItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.list,
              userDecks.length === 0 && styles.emptyList,
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <EmptyDeckState
                onBrowseTemplates={modalHandlers.template.show}
              />
            }
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <FloatingActionButton onPress={handleFABPress} />

          <FloatingActionMenu
            visible={showActionMenu}
            onClose={modalHandlers.actionMenu.hide}
            onCreateDeck={handleCreateDeck}
            onCreateFlashcard={handleCreateFlashcard}
            onBrowseTemplates={handleBrowseTemplates}
          />
        </>
      )}

      {/* Modals */}
      <TemplateDeckSelectionModal
        visible={showTemplateModal}
        onClose={modalHandlers.template.hide}
        onDeckAdded={fetchUserDecks}
      />

      <CustomDeckCreationModal
        visible={showCustomDeckModal}
        onClose={modalHandlers.customDeck.hide}
        onCreateDeck={createCustomDeck}
      />

      <CustomFlashcardModal
        visible={showCustomFlashcardModal}
        onClose={modalHandlers.customFlashcard.hide}
        onCreateFlashcard={createCustomFlashcard}
        userDecks={userDecks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
