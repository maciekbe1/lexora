import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { TemplateDeckSelectionModal } from "@/components/features/template-deck-selection";
import { FloatingActionButton } from "@/components/ui";
import { useDashboard } from "@/hooks";
import type { UserDeck } from "@/types/flashcard";

import { CustomDeckCreationModal } from "@/components/features/custom-deck-creation";
import { CustomFlashcardModal } from "@/components/features/custom-flashcard";
import {
  DeckCard,
  DeckCardSkeleton,
  EmptyDeckState,
} from "@/components/features/deck";
import { FloatingActionMenu } from "@/components/features/floating-action-menu";
import { AppHeader } from "@/components/ui";

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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#007AFF"
                colors={["#007AFF"]}
                progressBackgroundColor="#ffffff"
              />
            }
            ListEmptyComponent={
              <EmptyDeckState onBrowseTemplates={modalHandlers.template.show} />
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
