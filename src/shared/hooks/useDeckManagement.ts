import { localDatabase } from '@/shared/services/local-database';
import { storageService } from '@/shared/services/storage';
import { syncService } from '@/shared/services/sync';
import type { CustomDeck, CustomFlashcard, UserDeck } from '@/shared/types/flashcard';
import { User } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../lib/supabase';

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

async function deleteCustomDeckCompletelyHelper(userDeck: UserDeck) {
  const flashcards = await localDatabase.getCustomFlashcards(userDeck.id);
  for (const f of flashcards) {
    await deleteImageSafe(f.front_image_url);
    await deleteImageSafe(f.back_image_url);
  }
  await deleteImageSafe(userDeck.deck_cover_image_url);
  await localDatabase.clearCustomDeck(userDeck.id);
}

function buildCustomDeck(user: User, deckData: Omit<CustomDeck, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const deckId = Crypto.randomUUID();
  const customDeck: CustomDeck = { id: deckId, user_id: user.id, ...deckData, created_at: now, updated_at: now };
  const userDeck: UserDeck = {
    id: deckId,
    user_id: user.id,
    custom_name: deckData.name,
    is_favorite: false,
    is_custom: true,
    added_at: now,
    deck_name: deckData.name,
    deck_description: deckData.description,
    deck_language: deckData.language,
    deck_cover_image_url: deckData.cover_image_url,
    deck_tags: deckData.tags,
    deck_difficulty_level: 1,
    deck_flashcard_count: 0,
    deck_created_by: user.id,
    deck_is_active: deckData.is_active,
    deck_created_at: now,
    deck_updated_at: now,
  };
  return { customDeck, userDeck };
}

function buildCustomFlashcard(
  flashcardData: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'>,
  nextPosition: number
): CustomFlashcard {
  const now = new Date().toISOString();
  const id = Crypto.randomUUID();
  return { id, ...flashcardData, position: nextPosition, created_at: now, updated_at: now };
}

async function insertAndSyncUserDeck(userId: string, deck: UserDeck) {
  await localDatabase.insertUserDeck(deck);
  await syncUser(userId);
}

async function insertAndSyncCustomDeck(userId: string, deck: CustomDeck) {
  await localDatabase.insertCustomDeck(deck);
  await syncUser(userId);
}

async function insertAndSyncFlashcard(userId: string, flashcard: CustomFlashcard) {
  await localDatabase.insertCustomFlashcard(flashcard);
  await syncUser(userId);
}

export function useDeckManagement(user: User | null) {
  const [userDecks, setUserDecks] = useState<UserDeck[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // One-time data sanity handled during app initialization (localDatabase.initialize)
  // Avoid running additional fixers here to reduce extra I/O on navigation.

  const fetchUserDecks = async () => {
    if (!user) return;

    try {
      const localDecks = await localDatabase.getUserDecks(user.id);

      if (localDecks.length > 0) {
        console.log(`Loaded ${localDecks.length} decks from local database`);
        setUserDecks(localDecks);

        syncService
          .autoSync(user.id)
          .catch((error) => console.log('Background sync failed:', error));

        // Do not show skeleton when we already have local data
        setIsLoading(false);
        return;
      }

      // Cold start: no local data — show loading while fetching remote
      setIsLoading(true);
      console.log('No local data, fetching from remote...');
      const { data, error } = await supabase
        .from('user_decks')
        .select(`
          *,
          template_deck:template_decks(*)
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching user decks:', error);
        setUserDecks([]);
      } else {
        setUserDecks(data || []);

        if (data) {
          for (const deck of data) {
            await localDatabase.insertUserDeck(deck);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user decks:', error);
      setUserDecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchUserDecks(); setRefreshing(false); };

  const deleteCustomDeckCompletely = async (userDeck: UserDeck) => {
    try { await deleteCustomDeckCompletelyHelper(userDeck); await fetchUserDecks(); Alert.alert('Sukces', 'Talia została całkowicie usunięta'); }
    catch (error) { console.error('Error deleting custom deck:', error); Alert.alert('Błąd', 'Nie udało się całkowicie usunąć talii'); }
  };

  const removeTemplateFromCollection = async (userDeck: UserDeck) => {
    try {
      const { error } = await supabase.from('user_decks').delete().eq('id', userDeck.id);
      if (error) { console.error('Error removing deck:', error); Alert.alert('Błąd', 'Nie udało się usunąć talii'); }
      else { await fetchUserDecks(); Alert.alert('Sukces', 'Talia została usunięta z kolekcji'); }
    } catch (error) { console.error('Error removing deck:', error); Alert.alert('Błąd', 'Nie udało się usunąć talii'); }
  };

  const removeDeck = async (userDeck: UserDeck) => {
    const deckName = userDeck.deck_name || 'tę talię';

    const hasProgress = false; // TODO: Calculate progress from actual data

    let message: string;
    if (userDeck.is_custom) {
      message = hasProgress
        ? `Czy na pewno chcesz usunąć "${deckName}" całkowicie?\n\nUWAGA: Usuniesz talię, wszystkie fiszki, zdjęcia i cały postęp na zawsze. Tej operacji nie można cofnąć!`
        : `Czy na pewno chcesz usunąć "${deckName}" całkowicie?\n\nUsuniesz talię i wszystkie fiszki na zawsze. Tej operacji nie można cofnąć!`;
    } else {
      message = hasProgress
        ? `Czy na pewno chcesz usunąć "${deckName}" z kolekcji?\n\nUWAGA: Stracisz cały postęp nauki dla tej talii.`
        : `Czy na pewno chcesz usunąć "${deckName}" z kolekcji?`;
    }

    Alert.alert(
      userDeck.is_custom ? 'Usuń talię całkowicie' : 'Usuń z kolekcji',
      message,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userDeck.is_custom) {
                await deleteCustomDeckCompletely(userDeck);
              } else {
                await removeTemplateFromCollection(userDeck);
              }
            } catch (error) {
              console.error('Error removing deck:', error);
              Alert.alert('Błąd', 'Nie udało się usunąć talii');
            }
          },
        },
      ]
    );
  };

  const createCustomDeck = async (
    deckData: Omit<CustomDeck, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const { customDeck, userDeck } = buildCustomDeck(user, deckData);
      await insertAndSyncCustomDeck(user.id, customDeck);
      await insertAndSyncUserDeck(user.id, userDeck);
      await fetchUserDecks();
      Alert.alert('Sukces', 'Talia została utworzona!');
    } catch (error) {
      console.error('Error creating custom deck:', error);
      Alert.alert('Błąd', 'Nie udało się utworzyć talii');
    }
  };

  const createCustomFlashcard = async (
    flashcardData: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const existingCards = await localDatabase.getCustomFlashcards(
        flashcardData.user_deck_id
      );
      const customFlashcard = buildCustomFlashcard(flashcardData, existingCards.length + 1);
      await insertAndSyncFlashcard(user.id, customFlashcard);
      await fetchUserDecks();
      Alert.alert('Sukces', 'Fiszka została dodana!');
    } catch (error) {
      console.error('Error creating custom flashcard:', error);
      Alert.alert('Błąd', 'Nie udało się dodać fiszki');
    }
  };

  return {
    userDecks,
    refreshing,
    isLoading,
    fetchUserDecks,
    onRefresh,
    removeDeck,
    createCustomDeck,
    createCustomFlashcard,
  };
}
