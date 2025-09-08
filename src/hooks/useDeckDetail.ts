import { localDatabase } from '@/services/local-database';
import { useAuthStore, useDeckDetailStore } from "@/store";
import type { CustomFlashcard } from "@/types/flashcard";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert } from 'react-native';
import { useDeckManagement } from './useDeckManagement';

export function useDeckDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { removeDeck } = useDeckManagement(user);

  // Modal states
  const [showAddFlashcardModal, setShowAddFlashcardModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<CustomFlashcard | null>(null);

  // Use deck detail store
  const {
    deck,
    flashcards,
    dueToday,
    isRefreshing,
    isDeleting,
    loadDeckData,
    refreshDeck,
    resetDeck,
  } = useDeckDetailStore();

  // Initialize deck data on mount
  useEffect(() => {
    if (user?.id && id) {
      loadDeckData(user.id, id);
    }
  }, [user?.id, id, loadDeckData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => resetDeck();
  }, [resetDeck]);

  // Loading state - disable loading screen to prevent flash  
  const showLoading = false;

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

  // Refresh deck data when this screen regains focus (e.g., after a study session)
  useFocusEffect(
    useCallback(() => {
      if (user?.id && id) {
        loadDeckData(user.id, id);
      }
    }, [user?.id, id, loadDeckData])
  );

  // Handle refresh
  const onRefresh = useCallback(async () => {
    if (user?.id && id) {
      await refreshDeck(user.id, id);
    }
  }, [user?.id, id, refreshDeck]);

  // CRUD operations
  const handleCreateFlashcard = useCallback(async (
    flashcardData: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">
  ) => {
    if (!user || !deck) return;
    try {
      // Create flashcard locally
      const flashcardId = require('expo-crypto').randomUUID();
      const now = new Date().toISOString();
      const newFlashcard: CustomFlashcard = {
        id: flashcardId,
        ...flashcardData,
        user_deck_id: deck.id,
        user_id: user.id,
        position: flashcards.length + 1,
        created_at: now,
        updated_at: now,
      };

      await localDatabase.insertCustomFlashcard(newFlashcard);
      await localDatabase.recalculateDeckStats(deck.id);
      
      // Reload data
      if (user?.id && id) {
        await loadDeckData(user.id, id);
      }
      
      Alert.alert("Sukces", "Fiszka została dodana!");
    } catch (error) {
      console.error("Error creating flashcard:", error);
      Alert.alert("Błąd", "Nie udało się dodać fiszki");
    }
  }, [user, deck, flashcards.length, id, loadDeckData]);

  const handleStartStudy = useCallback(() => {
    if (!deck) return;
    if (flashcards.length === 0) {
      Alert.alert(
        "Brak fiszek",
        "Dodaj najpierw fiszki do talii, żeby rozpocząć naukę"
      );
      return;
    }
    router.push({ pathname: `/study/${deck.id}` as any });
  }, [deck, flashcards.length]);

  // Placeholder handlers for now
  const handleUpdateFlashcard = useCallback(async (
    _flashcardData: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">,
    _editingFlashcard: CustomFlashcard
  ) => {
    Alert.alert("Info", "Update flashcard - coming soon");
  }, []);

  const handleDeleteFlashcard = useCallback(async (
    _flashcard: CustomFlashcard,
    _options?: { skipConfirm?: boolean }
  ) => {
    Alert.alert("Info", "Delete flashcard - coming soon");
  }, []);

  const handleUpdateDeck = useCallback(async (_deckData: {
    name: string;
    description: string;
    language: string;
    coverImageUrl: string;
  }) => {
    Alert.alert("Info", "Update deck - coming soon");
  }, []);

  const handleDeleteDeck = useCallback(async () => {
    if (!deck) return;
    
    const deckName = deck.deck_name || 'tę talię';

    const hasProgress = false; // TODO: Calculate progress from actual data

    let message: string;
    if (deck.is_custom) {
      message = hasProgress
        ? `Czy na pewno chcesz usunąć "${deckName}" całkowicie?\n\nUWAGA: Usuniesz talię, wszystkie fiszki, zdjęcia i cały postęp na zawsze. Tej operacji nie można cofnąć!`
        : `Czy na pewno chcesz usunąć "${deckName}" całkowicie?\n\nUsuniesz talię i wszystkie fiszki na zawsze. Tej operacji nie można cofnąć!`;
    } else {
      message = hasProgress
        ? `Czy na pewno chcesz usunąć "${deckName}" z kolekcji?\n\nUWAGA: Stracisz cały postęp nauki dla tej talii.`
        : `Czy na pewno chcesz usunąć "${deckName}" z kolekcji?`;
    }

    Alert.alert(
      deck.is_custom ? 'Usuń talię całkowicie' : 'Usuń z kolekcji',
      message,
      [
        { text: 'Nie', style: 'cancel' },
        {
          text: 'Tak',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDeck(deck);
              // Navigate back only after successful deletion
              router.back();
            } catch (error) {
              console.error('Failed to delete deck:', error);
            }
          },
        },
      ]
    );
  }, [deck, removeDeck]);

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
    dueToday,

    // States
    refreshing: isRefreshing,
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
