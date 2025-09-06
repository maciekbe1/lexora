import { useDeferredLoading } from "@/shared/hooks/useDeferredLoading";
import { useFlashcardManagement } from "@/shared/hooks/useFlashcardManagement";
import type { CustomFlashcard } from "@/shared/types/flashcard";
import { useAuthStore } from "@/store";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export function useDeckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  // Modal states
  const [showAddFlashcardModal, setShowAddFlashcardModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<CustomFlashcard | null>(null);

  // Use the flashcard management hook
  const {
    deck,
    flashcards,
    refreshing,
    isLoading,
    isDeleting,
    onRefresh,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUpdateDeck,
    handleDeleteDeck,
    handleStartStudy,
  } = useFlashcardManagement(user, id!);

  // Loading state
  const showLoading = useDeferredLoading(isLoading, 200);

  // Derived data
  const deckName = deck?.deck_name || deck?.custom_name || "Talia bez nazwy";
  const deckDescription = deck?.deck_description || "Brak opisu";

  // Note: Avoid auto-closing via effects to prevent scheduling updates
  // during insertion phase in React 19. We close the options menu
  // directly in action handlers instead.

  // Handlers
  const handleEditFlashcard = (flashcard: CustomFlashcard) => {
    setEditingFlashcard(flashcard);
    setShowAddFlashcardModal(true);
  };

  const handleAddFlashcard = () => {
    setShowOptionsMenu(false);
    setShowAddFlashcardModal(true);
  };

  const handleEditDeck = () => {
    setShowOptionsMenu(false);
    setShowEditDeckModal(true);
  };

  const handleToggleOptionsMenu = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  // Modal handlers
  const modalHandlers = {
    flashcard: {
      show: () => setShowAddFlashcardModal(true),
      hide: () => {
        setShowAddFlashcardModal(false);
        setEditingFlashcard(null);
      },
    },
    editDeck: {
      show: () => setShowEditDeckModal(true),
      hide: () => {
        setShowEditDeckModal(false);
      },
    },
    optionsMenu: {
      show: () => setShowOptionsMenu(true),
      hide: () => setShowOptionsMenu(false),
      toggle: () => setShowOptionsMenu((v) => !v),
    },
  };

  // Create flashcard handler that handles both create and update
  const handleFlashcardSubmit = editingFlashcard
    ? (data: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">) => 
        handleUpdateFlashcard(data, editingFlashcard)
    : handleCreateFlashcard;

  return {
    // Route params
    deckId: id,
    // Data
    deck,
    flashcards,
    deckName,
    deckDescription,

    // States
    refreshing,
    showLoading,
    isDeleting,
    showAddFlashcardModal,
    showEditDeckModal,
    showOptionsMenu,
    editingFlashcard,

    // Handlers
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

    // Modal handlers
    modalHandlers,
  };
}
