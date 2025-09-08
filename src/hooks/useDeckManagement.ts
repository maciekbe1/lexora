import { localDatabase } from '@/services/local-database';
import { storageService } from '@/services/storage';
import type { CustomDeck, CustomFlashcard, UserDeck } from '@/types/flashcard';
import { User } from '@supabase/supabase-js';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';

// Helpers extracted to reduce hook size
// Removed syncUser - sync happens only on login and manual refresh



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

async function insertUserDeck(deck: UserDeck) {
  await localDatabase.insertUserDeck(deck);
}

async function insertCustomDeck(deck: CustomDeck) {
  await localDatabase.insertCustomDeck(deck);
}

async function insertFlashcard(flashcard: CustomFlashcard) {
  await localDatabase.insertCustomFlashcard(flashcard);
}

export function useDeckManagement(user: User | null) {
  const [userDecks, setUserDecks] = useState<UserDeck[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // One-time data sanity handled during app initialization (localDatabase.initialize)
  // Avoid running additional fixers here to reduce extra I/O on navigation.

  const fetchUserDecks = async () => {
    if (!user) return;
    
    console.log('🔄 fetchUserDecks called');
    try {
      // First, get remote decks to ensure sync
      const { data: remoteDecks, error: remoteError } = await supabase
        .from('user_decks')
        .select('*')
        .eq('user_id', user.id);
        
      if (remoteError) {
        console.error('Error fetching remote decks:', remoteError);
      } else if (remoteDecks) {
        console.log(`📡 Found ${remoteDecks.length} decks in remote database`);
        
        // Sync any missing decks to local database (except those marked for deletion)
        const pendingDeletions = await localDatabase.getPendingDeletions();
        const deletionIds = new Set(pendingDeletions.map(d => d.record_id));
        
        for (const remoteDeck of remoteDecks) {
          try {
            // Skip syncing decks that are marked for deletion locally
            if (!deletionIds.has(remoteDeck.id)) {
              await localDatabase.insertUserDeck(remoteDeck);
            } else {
              console.log(`⏭️ Skipping sync for deck ${remoteDeck.id} - marked for deletion`);
            }
          } catch (error) {
            console.log(`⚠️ Deck ${remoteDeck.id} sync failed:`, error);
          }
        }
      }
      
      const localDecks = await localDatabase.getUserDecks(user.id);
      console.log(`🔍 Raw local decks count: ${localDecks.length}`);

      const withDue = await (async () => {
        const result = await Promise.all(
          localDecks.map(async (d) => {
            try {
              const due = await localDatabase.getDeckDueCount(d.id);
              return { ...d, due_today: due } as UserDeck;
            } catch {
              return { ...d } as UserDeck;
            }
          })
        );
        return result;
      })();

      if (withDue.length > 0) {
        console.log(`✅ Loaded ${localDecks.length} decks from local database`);
        console.log('📋 Deck names:', withDue.map(d => d.deck_name || d.custom_name));
        console.log('🆔 Deck IDs:', withDue.map(d => `${d.id} (${d.is_custom ? 'custom' : 'template'})`));
        setUserDecks(withDue);

        // Do not show skeleton when we already have local data
        setIsLoading(false);
        return;
      }

      // Cold start: no local data — get from local only (sync already done at app init)
      setIsLoading(true);
      console.log('No local data found after app initialization');
      setUserDecks([]);
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
      console.log(`🗑️ Removing template deck ${userDeck.id} from collection`);
      
      // Delete from remote database immediately
      const { error: remoteError } = await supabase
        .from('user_decks')
        .delete()
        .eq('id', userDeck.id)
        .eq('user_id', user!.id);
        
      if (remoteError) {
        console.error('Error removing deck from remote:', remoteError);
        Alert.alert('Błąd', 'Nie udało się usunąć talii ze zdalnej bazy');
        throw remoteError;
      }
      
      // Delete from local database immediately
      await localDatabase.deleteUserDeck(userDeck.id);
      
      console.log(`✅ Successfully removed template deck ${userDeck.id} from collection`);
      
      await fetchUserDecks();
      // No success alert - just return success
    } catch (error) { 
      console.error('Error removing deck:', error); 
      Alert.alert('Błąd', 'Nie udało się usunąć talii'); 
      throw error; // Re-throw so caller knows it failed
    }
  };

  const removeDeck = async (userDeck: UserDeck) => {
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
  };

  const createCustomDeck = async (
    deckData: Omit<CustomDeck, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const { customDeck, userDeck } = buildCustomDeck(user, deckData);
      await insertCustomDeck(customDeck);
      await insertUserDeck(userDeck);
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
      await insertFlashcard(customFlashcard);
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
