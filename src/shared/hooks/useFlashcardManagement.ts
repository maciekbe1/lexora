import { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { localDatabase } from '../services/local-database';
import { storageService } from '../services/storage';
import { syncService } from '../services/sync';
import type { CustomFlashcard, UserDeck } from '../types/flashcard';

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
  for (const f of flashcards) {
    await deleteFlashcardResources(userId, f);
  }
  await deleteImageSafe(deck.deck_cover_image_url);
  await localDatabase.clearCustomDeck(deck.id);
  await syncUser(userId);
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

export function useFlashcardManagement(user: User | null, deckId: string) {
  const [deck, setDeck] = useState<UserDeck | null>(null);
  const [flashcards, setFlashcards] = useState<CustomFlashcard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load deck and flashcards
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
    if (!user || !deck) return;

    Alert.alert(
      "Usuń talię",
      `Czy na pewno chcesz usunąć "${deck.deck_name || 'tę talię'}" całkowicie?\n\nUWAGA: Usuniesz talię, wszystkie fiszki, zdjęcia i cały postęp na zawsze. Tej operacji nie można cofnąć!`,
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user || !deck) return;
              await deleteDeckResources(user.id, deck, flashcards);
              Alert.alert("Sukces", "Talia została usunięta", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error("Error deleting deck:", error);
              Alert.alert("Błąd", "Nie udało się usunąć talii");
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
    onRefresh,
    handleCreateFlashcard,
    handleUpdateFlashcard,
    handleDeleteFlashcard,
    handleUpdateDeck,
    handleDeleteDeck,
    handleStartStudy,
  };
}
