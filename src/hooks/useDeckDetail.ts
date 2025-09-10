import { localDatabase } from '@/services/local-database';
import { useAuthStore, useDeckDetailStore } from "@/store";
import type { CustomFlashcard, UserDeck } from "@/types/flashcard";
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
  
  // Reorder mode state
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Use deck detail store
  const {
    deck,
    flashcards,
    dueToday,
    isRefreshing,
    isDeleting,
    isSyncing,
    syncError,
    loadDeckData,
    refreshDeck,
    resetDeck,
    setSyncing,
    setSyncError,
    setSyncSuccess,
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

  const handleToggleReorderMode = () => {
    setShowOptionsMenu(false); // Close options menu when toggling reorder
    setIsReorderMode(!isReorderMode);
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

  const handleUpdateDeck = useCallback(async (deckData: {
    name: string;
    description: string;
    language: string;
    coverImageUrl: string;
  }) => {
    if (!deck || !user) return;
    
    try {
      console.log('🔄 Updating deck with new data:', deckData);
      console.log('📦 Current deck before update:', {
        id: deck.id,
        deck_name: deck.deck_name,
        custom_name: deck.custom_name
      });
      
      // Update deck using insertUserDeck (it does INSERT OR REPLACE)
      const updatedDeck: UserDeck = {
        ...deck,
        deck_name: deckData.name,
        deck_description: deckData.description,
        deck_language: deckData.language,
        deck_cover_image_url: deckData.coverImageUrl,
        deck_updated_at: new Date().toISOString()
      };
      
      console.log('📝 Saving updated deck to database:', {
        id: updatedDeck.id,
        deck_name: updatedDeck.deck_name,
        deck_description: updatedDeck.deck_description
      });
      
      await localDatabase.insertUserDeck(updatedDeck);
      
      console.log('✅ Deck saved to local database');
      
      // Reload deck data to show changes immediately
      if (user?.id && id) {
        console.log('🔄 Reloading deck data...');
        await loadDeckData(user.id, id);
        console.log('✅ Deck data reloaded');
      }
      
      // Trigger sync to Supabase in the background
      setSyncing(true);
      setSyncError(null);
      
      try {
        const syncResult = await localDatabase.syncToCloud();
        if (syncResult) {
          setSyncSuccess();
          console.log('✅ Deck updated and synced to cloud successfully');
        } else {
          setSyncError('Failed to sync deck updates to cloud');
          console.warn('⚠️ Deck updated locally but sync failed');
        }
      } catch (syncError) {
        const errorMessage = syncError instanceof Error ? syncError.message : 'Unknown sync error';
        setSyncError(errorMessage);
        console.error('❌ Deck sync error:', syncError);
      }
      
      Alert.alert("Sukces", "Talia została zaktualizowana");
    } catch (error) {
      console.error('Error updating deck:', error);
      Alert.alert("Błąd", "Nie udało się zaktualizować talii");
    }
  }, [deck, user, id, loadDeckData, setSyncing, setSyncError, setSyncSuccess]);

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

  const syncFlashcardPositions = useCallback(async () => {
    if (!user || !deck) return;
    
    setSyncing(true);
    setSyncError(null);
    
    try {
      // Use the sync operation from the database service
      const result = await localDatabase.syncFlashcardPositions();
      
      if (result.success) {
        setSyncSuccess();
        console.log(`✅ Synced ${result.synced} flashcard positions`);
      } else {
        setSyncError(result.error || 'Sync failed');
        console.error('❌ Flashcard position sync failed:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      setSyncError(errorMessage);
      console.error('❌ Flashcard position sync error:', error);
    }
  }, [user, deck, setSyncing, setSyncError, setSyncSuccess]);

  const handleReorderFlashcards = useCallback(async (reorderedFlashcards: CustomFlashcard[]) => {
    if (!user || !deck || !deck.is_custom) return;
    
    try {
      // Update positions in the database (this marks flashcards as dirty)
      const updates = reorderedFlashcards.map((card, index) => ({
        id: card.id,
        position: index + 1
      }));
      
      await localDatabase.updateMultipleFlashcardPositions(updates);
      
      // Don't reload data - the UI already has the correct order
      // Just trigger sync to save to cloud
      await syncFlashcardPositions();
      
    } catch (error) {
      console.error('Error reordering flashcards:', error);
      Alert.alert("Błąd", "Nie udało się zmienić kolejności fiszek");
    }
  }, [user, deck, syncFlashcardPositions]);

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
    isReorderMode,
    
    // Sync states
    isSyncing,
    syncError,

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
    handleReorderFlashcards,
    handleToggleReorderMode,

    // Modal handlers
    modalHandlers,
  };
}
