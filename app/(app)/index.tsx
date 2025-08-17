import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { TemplateDeckSelectionModal } from "../../src/shared/components/features/template-deck-selection";
import { FloatingActionButton } from "../../src/shared/components/ui/FloatingActionButton";

import { useAppInitialization } from "../../src/shared/hooks/useAppInitialization";
import { useDeckManagement } from "../../src/shared/hooks/useDeckManagement";
import type { UserDeck } from "../../src/shared/types/flashcard";

import { CustomDeckCreationModal } from "@/shared/components/features/custom-deck-creation/CustomDeckCreationModal";
import { CustomFlashcardModal } from "@/shared/components/features/custom-flashcard/CustomFlashcardModal";
import { DeckCard } from "@/shared/components/features/deck/DeckCard";
import { EmptyDeckState } from "@/shared/components/features/deck/EmptyDeckState";
import { FloatingActionMenu } from "@/shared/components/features/floating-action-menu/FloatingActionMenu";
import { AppHeader } from "@/shared/components/ui";
import { useAuthStore } from "../../src/store/auth";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { isInitialized } = useAppInitialization(user);
  const {
    userDecks,
    refreshing,
    fetchUserDecks,
    onRefresh,
    createCustomDeck,
    createCustomFlashcard,
  } = useDeckManagement(user);

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCustomDeckModal, setShowCustomDeckModal] = useState(false);
  const [showCustomFlashcardModal, setShowCustomFlashcardModal] =
    useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Load user decks when app is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchUserDecks();
    }
  }, [isInitialized]);

  const handleDeckPress = (userDeck: UserDeck) => {
    router.push(`/deck/${userDeck.id}`);
  };

  // FAB action handlers
  const handleFABPress = () => setShowActionMenu(true);
  const handleCreateDeck = () => {
    setShowActionMenu(false);
    setShowCustomDeckModal(true);
  };
  const handleCreateFlashcard = () => {
    setShowActionMenu(false);
    setShowCustomFlashcardModal(true);
  };
  const handleBrowseTemplates = () => {
    setShowActionMenu(false);
    setShowTemplateModal(true);
  };

  const renderDeckItem = ({ item }: { item: UserDeck }) => (
    <DeckCard item={item} onPress={handleDeckPress} />
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Moja Nauka" showAddButton={false} />

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
            onBrowseTemplates={() => setShowTemplateModal(true)}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <FloatingActionButton onPress={handleFABPress} />

      <FloatingActionMenu
        visible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onCreateDeck={handleCreateDeck}
        onCreateFlashcard={handleCreateFlashcard}
        onBrowseTemplates={handleBrowseTemplates}
      />

      {/* Modals */}
      <TemplateDeckSelectionModal
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onDeckAdded={fetchUserDecks}
      />

      <CustomDeckCreationModal
        visible={showCustomDeckModal}
        onClose={() => setShowCustomDeckModal(false)}
        onCreateDeck={createCustomDeck}
      />

      <CustomFlashcardModal
        visible={showCustomFlashcardModal}
        onClose={() => setShowCustomFlashcardModal(false)}
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
