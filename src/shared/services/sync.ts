import { supabase } from '../../../lib/supabase';
import type { CustomFlashcard } from '@/shared/types/flashcard';
import { localDatabase } from './local-database';

export class SyncService {
  private isSyncing = false;

  /**
   * Sync all local changes to remote database
   */
  async syncToRemote(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;
    try {
      console.log('Starting sync to remote...');
      
      // Get unsynced items from local database
      const unsyncedItems = await localDatabase.getUnsyncedItems();
      
      // Sync custom decks first (dependencies)
      await this.syncCustomDecks(unsyncedItems.customDecks);
      
      // Sync user decks
      await this.syncUserDecks(unsyncedItems.userDecks);
      
      // Sync custom flashcards
      await this.syncCustomFlashcards(unsyncedItems.customFlashcards);
      
      console.log('Sync to remote completed');
    } catch (error) {
      console.error('Error syncing to remote:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync from remote database to local
   */
  async syncFromRemote(userId: string): Promise<void> {
    try {
      console.log('Starting sync from remote...');
      
      // Fetch user's data from remote
      const { data: userDecks } = await supabase
        .from('user_decks')
        .select('*')
        .eq('user_id', userId);

      const { data: customDecks } = await supabase
        .from('custom_decks')
        .select('*')
        .eq('user_id', userId);

      if (userDecks) {
        for (const deck of userDecks) {
          await localDatabase.insertUserDeck(deck);
        }
      }

      if (customDecks) {
        for (const deck of customDecks) {
          // Ensure tags is an array if it comes as JSON string from remote
          const deckToInsert = {
            ...deck,
            tags: typeof deck.tags === 'string' ? JSON.parse(deck.tags) : deck.tags
          };
          await localDatabase.insertCustomDeck(deckToInsert);
        }
      }

      // Fetch flashcards for custom decks
      if (userDecks) {
        const customUserDecks = userDecks.filter(deck => deck.is_custom);
        
        for (const userDeck of customUserDecks) {
          const { data: flashcards } = await supabase
            .from('custom_flashcards')
            .select('*')
            .eq('user_deck_id', userDeck.id);

          if (flashcards) {
            for (const flashcard of flashcards) {
              await localDatabase.insertCustomFlashcard(flashcard);
            }
          }
        }
      }

      // After syncing from remote, recalculate flashcard counts for all custom decks
      await localDatabase.fixDeckNames(); // This now includes fixing flashcard counts
      
      console.log('Sync from remote completed');
    } catch (error) {
      console.error('Error syncing from remote:', error);
      throw error;
    }
  }

  /**
   * Bi-directional sync (both ways)
   */
  async fullSync(userId: string): Promise<void> {
    try {
      // First sync local changes to remote
      await this.syncToRemote();

      // Then sync remote changes to local
      await this.syncFromRemote(userId);

      console.log('Full sync completed');
    } catch (error) {
      console.error('Error in full sync:', error);
      throw error;
    }
  }

  /**
   * Sync custom decks to remote
   */
  private async syncCustomDecks(customDecks: any[]): Promise<void> {
    if (customDecks.length === 0) return;

    try {
      // Check if custom_decks table exists
      const { error: testError } = await supabase
        .from('custom_decks')
        .select('id')
        .limit(1);

      if (testError && testError.code === 'PGRST106') {
        console.log('custom_decks table does not exist, skipping sync');
        return;
      }

      // Remove duplicates by id before syncing
      const uniqueDecks = customDecks.filter((deck, index, self) => 
        index === self.findIndex(d => d.id === deck.id)
      );

      const decksToSync = uniqueDecks.map(row => {
        // Try to parse tags, if it's a JSON string convert to array, otherwise use empty array
        let tags;
        try {
          if (typeof row.tags === 'string') {
            tags = JSON.parse(row.tags);
          } else {
            tags = row.tags || [];
          }
        } catch {
          console.log(`Failed to parse tags for deck ${row.id}: ${row.tags}`);
          tags = [];
        }

        // Log what we're about to send for debugging
        console.log(`Syncing deck ${row.id}: tags type=${typeof tags}, value=${JSON.stringify(tags)}`);

        const deckData = {
          id: row.id,
          user_id: row.user_id,
          name: row.name,
          description: row.description,
          language: row.language,
          cover_image_url: row.cover_image_url,
          is_active: Boolean(row.is_active),
          created_at: row.created_at,
          updated_at: row.updated_at,
          // Skip tags entirely for now to avoid PostgreSQL issues
          // tags: tags,
        };

        return deckData;
      });

      if (uniqueDecks.length !== customDecks.length) {
        console.log(`Removed ${customDecks.length - uniqueDecks.length} duplicate custom decks before sync`);
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('custom_decks')
        .upsert(decksToSync);

      if (error) throw error;

      // Mark as synced in local database
      const ids = customDecks.map(deck => deck.id);
      await localDatabase.markAsSynced('custom_decks', ids);
      
      console.log(`Synced ${customDecks.length} custom decks`);
    } catch (error) {
      console.error('Error syncing custom decks:', error);
      throw error;
    }
  }

  /**
   * Sync user decks to remote
   */
  private async syncUserDecks(userDecks: any[]): Promise<void> {
    if (userDecks.length === 0) return;

    try {
      // Check which columns exist in the remote database
      const { error: testError } = await supabase
        .from('user_decks')
        .select('is_custom, deck_name, deck_cover_image_url')
        .limit(1);

      let decksToSync;

      if (testError && testError.code === 'PGRST204') {
        // Some columns don't exist, use basic fields only
        console.log('Advanced columns not found, syncing basic fields only');
        decksToSync = userDecks.map(row => ({
          id: row.id,
          user_id: row.user_id,
          template_deck_id: row.template_deck_id || null,
          custom_name: row.custom_name,
          is_favorite: Boolean(row.is_favorite),
          added_at: row.added_at,
        }));
      } else {
        // Advanced columns exist, check specifically which ones
        const { data: columnTest } = await supabase
          .from('user_decks')
          .select('is_custom')
          .limit(1);

        if (columnTest !== null) {
          // Basic custom deck support exists
          decksToSync = userDecks.map(row => ({
            id: row.id,
            user_id: row.user_id,
            template_deck_id: row.template_deck_id || null,
            custom_name: row.custom_name,
            is_favorite: Boolean(row.is_favorite),
            is_custom: Boolean(row.is_custom),
            added_at: row.added_at,
          }));
        } else {
          // Fallback to minimal fields
          decksToSync = userDecks.map(row => ({
            id: row.id,
            user_id: row.user_id,
            template_deck_id: row.template_deck_id || null,
            custom_name: row.custom_name,
            is_favorite: Boolean(row.is_favorite),
            added_at: row.added_at,
          }));
        }
      }

      // Remove duplicates by id before syncing
      const uniqueDecksToSync = decksToSync.filter((deck, index, self) => 
        index === self.findIndex(d => d.id === deck.id)
      );

      if (uniqueDecksToSync.length !== decksToSync.length) {
        console.log(`Removed ${decksToSync.length - uniqueDecksToSync.length} duplicate user decks before sync`);
      }

      // Upsert to Supabase
      const { error } = await supabase
        .from('user_decks')
        .upsert(uniqueDecksToSync);

      if (error) throw error;

      // Mark as synced
      const ids = userDecks.map(deck => deck.id);
      await localDatabase.markAsSynced('user_decks', ids);
      
      console.log(`Synced ${userDecks.length} user decks`);
    } catch (error) {
      console.error('Error syncing user decks:', error);
      throw error;
    }
  }

  /**
   * Sync custom flashcards to remote
   */
  private async syncCustomFlashcards(flashcards: any[]): Promise<void> {
    if (flashcards.length === 0) return;

    try {
      // Check if custom_flashcards table exists
      const { error: testError } = await supabase
        .from('custom_flashcards')
        .select('id')
        .limit(1);

      if (testError && testError.code === 'PGRST106') {
        console.log('custom_flashcards table does not exist, skipping sync');
        return;
      }

      const flashcardsToSync: CustomFlashcard[] = flashcards.map(row => ({
        id: row.id,
        user_deck_id: row.user_deck_id,
        user_id: row.user_id,
        front_text: row.front_text,
        back_text: row.back_text,
        hint_text: row.hint_text,
        front_image_url: row.front_image_url,
        back_image_url: row.back_image_url,
        front_audio_url: row.front_audio_url,
        back_audio_url: row.back_audio_url,
        position: row.position,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      // Upsert to Supabase
      const { error } = await supabase
        .from('custom_flashcards')
        .upsert(flashcardsToSync);

      if (error) throw error;

      // Mark as synced
      const ids = flashcards.map(card => card.id);
      await localDatabase.markAsSynced('custom_flashcards', ids);
      
      console.log(`Synced ${flashcards.length} custom flashcards`);
    } catch (error) {
      console.error('Error syncing custom flashcards:', error);
      throw error;
    }
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      // Simple connectivity check with Supabase
      const { error } = await supabase
        .from('user_decks')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Auto-sync when online (called periodically)
   */
  async autoSync(userId: string): Promise<void> {
    try {
      const online = await this.isOnline();
      if (!online) {
        console.log('Device is offline, skipping auto-sync');
        return;
      }

      await this.fullSync(userId);
    } catch (error) {
      console.log('Auto-sync failed:', error);
      // Don't throw error for auto-sync failures
    }
  }
}

export const syncService = new SyncService();
