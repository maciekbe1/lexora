import { localDatabase } from '@/services/local-database';
import { storageService } from '@/services/storage';
import { syncService } from '@/services/sync';
import type { CustomFlashcard, UserDeck } from '@/types/flashcard';
import { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Helpers extracted to reduce hook size
async function syncUser(userId: string) {
  try {
    await syncService.autoSync(userId);
  } catch (error) {
    console.log('Could not sync to remote:', error);
  }
}

async function deleteImageSafe(url?: string | null) {
  if (!url) return;
  try {
    await storageService.deleteImage(url);
  } catch (error) {
    console.log('Failed to delete image:', error);
  }
}

async function deleteFlashcardResources(userId: string, flashcard: CustomFlashcard) {
  await deleteImageSafe(flashcard.front_image_url);
  await deleteImageSafe(flashcard.back_image_url);
  await localDatabase.clearCustomFlashcard(flashcard.id);
  await syncUser(userId);
}

async function deleteDeckResources(userId: string, deck: UserDeck, flashcards: CustomFlashcard[]) {
  console.log(`Starting deletion of deck ${deck.id} with ${flashcards.length} flashcards`);
  
  for (const f of flashcards) {
    console.log(`Deleting flashcard ${f.id}`);
    await deleteFlashcardResources(userId, f);
  }
  
  console.log(`Deleting deck cover image: ${deck.deck_cover_image_url}`);
  await deleteImageSafe(deck.deck_cover_image_url);
  
  console.log(`Clearing custom deck ${deck.id} from database`);
  await localDatabase.clearCustomDeck(deck.id);
  
  // Skip sync for now to prevent deck from being restored from remote
  // console.log(`Syncing deletion to remote for user ${userId}`);
  // await syncUser(userId);
  
  console.log(`Deck deletion completed for ${deck.id} (sync skipped)`);
}

function buildNewFlashcard(
  user: User,
  deck: UserDeck,
  existing: CustomFlashcard[],
  data: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'>
): CustomFlashcard {
  const now = new Date().toISOString();
  const flashcardId = require('expo-crypto').randomUUID();
  return {
    id: flashcardId,
    ...data,
    user_deck_id: deck.id,
    user_id: user.id,
    position: existing.length + 1,
    created_at: now,
    updated_at: now,
  };
}

async function upsertFlashcard(userId: string, flashcard: CustomFlashcard) {
  await localDatabase.insertCustomFlashcard(flashcard);
  await syncUser(userId);
}

async function upsertDeck(userId: string, deck: UserDeck) {
  await localDatabase.insertUserDeck(deck);
  await syncUser(userId);
}

// eslint-disable-next-line max-lines-per-function
export function useFlashcardManagement(user: User | null, deckId: string) {
  const [deck, setDeck] = useState<UserDeck | null>(null);
  const [flashcards, setFlashcards] = useState<CustomFlashcard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  // Offline-first: avoid initial skeleton; show existing local data immediately
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load deck and flashcards (local-first)
  const loadDeckData = async () => {
    if (!user || !deckId) return;

    try {
      // Load deck details
      const userDecks = await localDatabase.getUserDecks(user.id);
      const foundDeck = userDecks.find((d) => d.id === deckId);

      if (!foundDeck) {
        Alert.alert("Błąd", "Nie znaleziono talii");
        router.back();
        return;
      }

      setDeck(foundDeck);

      // Load flashcards if it's a custom deck
      if (foundDeck.is_custom) {
        const deckFlashcards = await localDatabase.getCustomFlashcards(deckId);
        setFlashcards(deckFlashcards);
      } else {
        // For template decks, we would load template flashcards here
        setFlashcards([]);
      }
    } catch (error) {
      console.error("Error loading deck data:", error);
      Alert.alert("Błąd", "Nie udało się załadować danych talii");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when params change (do not toggle global loading)
  useEffect(() => {
    loadDeckData();
  }, [user?.id, deckId]);

  // Handle refresh
  const onRefresh = async () => { setRefreshing(true); await loadDeckData(); setRefreshing(false); };

  // Create new flashcard
  const handleCreateFlashcard = async (
    flashcardData: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">
  ) => {
    if (!user || !deck) return;
    try {
      const newFlashcard = buildNewFlashcard(user, deck, flashcards, flashcardData);
      await upsertFlashcard(user.id, newFlashcard);
      await loadDeckData();
      Alert.alert("Sukces", "Fiszka została dodana!");
    } catch (error) {
      console.error("Error creating flashcard:", error);
      Alert.alert("Błąd", "Nie udało się dodać fiszki");
    }
  };

  // Update existing flashcard
  const handleUpdateFlashcard = async (
    flashcardData: Omit<CustomFlashcard, "id" | "created_at" | "updated_at">,
    editingFlashcard: CustomFlashcard
  ) => {
    if (!user || !editingFlashcard) return;
    try {
      const updatedFlashcard: CustomFlashcard = {
        ...editingFlashcard,
        ...flashcardData,
        updated_at: new Date().toISOString(),
      };
      await upsertFlashcard(user.id, updatedFlashcard);
      await loadDeckData();
      Alert.alert("Sukces", "Fiszka została zaktualizowana!");
    } catch (error) {
      console.error("Error updating flashcard:", error);
      Alert.alert("Błąd", "Nie udało się zaktualizować fiszki");
    }
  };

  // Delete flashcard
  const handleDeleteFlashcard = async (flashcard: CustomFlashcard) => {
    Alert.alert(
      "Usuń fiszkę",
      "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user) return;
              await deleteFlashcardResources(user.id, flashcard);
              await loadDeckData();
              Alert.alert("Sukces", "Fiszka została usunięta");
            } catch (error) {
              console.error("Error deleting flashcard:", error);
              Alert.alert("Błąd", "Nie udało się usunąć fiszki");
            }
          },
        },
      ]
    );
  };

  // Start study session
  const handleStartStudy = () => {
    if (!deck) return;

    if (flashcards.length === 0) {
      Alert.alert(
        "Brak fiszek",
        "Dodaj najpierw fiszki do talii, żeby rozpocząć naukę"
      );
      return;
    }

    Alert.alert("Nauka", `Rozpoczynamy naukę z ${flashcards.length} fiszek!`);
    // TODO: Navigate to study session
  };

  // Update deck
  const handleUpdateDeck = async (deckData: {
    name: string;
    description: string;
    language: string;
    coverImageUrl: string;
  }) => {
    if (!user || !deck) return;
    try {
      const updatedDeck: UserDeck = {
        ...deck,
        deck_name: deckData.name,
        deck_description: deckData.description,
        deck_language: deckData.language,
        deck_cover_image_url: deckData.coverImageUrl,
        deck_updated_at: new Date().toISOString(),
      };
      
      // If this is a custom deck, also update the custom_decks table
      if (deck.is_custom) {
        const updatedCustomDeck = {
          id: deck.id,
          user_id: user.id,
          name: deckData.name,
          description: deckData.description,
          language: deckData.language,
          cover_image_url: deckData.coverImageUrl,
          tags: deck.deck_tags || [],
          is_active: deck.deck_is_active ?? true,
          created_at: deck.deck_created_at || deck.added_at,
          updated_at: new Date().toISOString(),
        };
        await localDatabase.insertCustomDeck(updatedCustomDeck);
      }
      
      await upsertDeck(user.id, updatedDeck);
      await loadDeckData();
      Alert.alert("Sukces", "Talia została zaktualizowana!");
    } catch (error) {
      console.error("Error updating deck:", error);
      Alert.alert("Błąd", "Nie udało się zaktualizować talii");
    }
  };

  // Delete deck with all content
  const handleDeleteDeck = async () => {
    console.log('handleDeleteDeck called', { user: !!user, deck: !!deck, isDeleting });
    if (!user || !deck || isDeleting) {
      console.log('handleDeleteDeck early return', { user: !!user, deck: !!deck, isDeleting });
      return;
    }

    Alert.alert(
      "Usuń talię",
      `Czy na pewno chcesz usunąć "${deck.deck_name || 'tę talię'}" całkowicie?\n\nUWAGA: Usuniesz talię, wszystkie fiszki, zdjęcia i cały postęp na zawsze. Tej operacji nie można cofnąć!`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            console.log('User confirmed deck deletion');
            try {
              if (!user || !deck) {
                console.log('Missing user or deck for deletion', { user: !!user, deck: !!deck });
                return;
              }
              
              console.log('Setting isDeleting to true');
              setIsDeleting(true);
              
              console.log('Starting deleteDeckResources');
              // Delete deck resources BEFORE navigating back
              await deleteDeckResources(user.id, deck, flashcards);
              
              console.log('Waiting 1 second for remote deletion to propagate');
              // Wait for remote deletion to propagate
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              console.log('Navigating back to main screen');
              // Navigate back after deletion is complete
              router.back();
              
              console.log('Deck deletion successful, showing alert');
              // Show success toast/alert without blocking navigation
              Alert.alert("Sukces", "Talia została usunięta");
            } catch (error) {
              console.error("Error deleting deck:", error);
              Alert.alert("Błąd", "Nie udało się usunąć talii");
            } finally {
              console.log('Setting isDeleting to false');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Initialize on mount
  useEffect(() => {
    loadDeckData();
  }, [user, deckId]);

  return {
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
  };
}
