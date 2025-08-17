import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useFlashcardManagement, useDeferredLoading } from "@/shared/hooks";
import { useAuthStore } from "@/store";
import type { CustomFlashcard } from "@/shared/types/flashcard";

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

  // Auto-close options menu when any modal opens
  useEffect(() => {
    if (showAddFlashcardModal || showEditDeckModal) {
      setShowOptionsMenu(false);
    }
  }, [showAddFlashcardModal, showEditDeckModal]);

  // Handlers
  const handleEditFlashcard = (flashcard: CustomFlashcard) => {
    setEditingFlashcard(flashcard);
    setShowAddFlashcardModal(true);
  };

  const handleAddFlashcard = () => {
    setShowAddFlashcardModal(true);
  };

  const handleEditDeck = () => {
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
      toggle: () => setShowOptionsMenu(!showOptionsMenu),
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