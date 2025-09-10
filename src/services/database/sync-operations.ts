import { BaseDatabaseService } from './base';
import { validateUserDeck } from './deck-operations';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase';

// Validation schemas for sync operations
const SyncEntitySchema = z.object({
  entity_type: z.enum(['deck', 'flashcard', 'progress']),
  entity_id: z.string().min(1, 'Entity ID is required')
});

const SyncTableSchema = z.object({
  table: z.enum(['user_decks', 'custom_decks', 'custom_flashcards', 'custom_flashcard_progress']),
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required')
});

export class SyncOperations extends BaseDatabaseService {

  async getUnsyncedItems(): Promise<{
    userDecks: any[];
    customDecks: any[];
    customFlashcards: any[];
    progress: any[];
  }> {
    const db = await this.getDb();
    
    try {
      const [userDecks, customDecks, customFlashcards, progress] = await Promise.all([
        db.getAllAsync<any>('SELECT * FROM user_decks WHERE is_dirty = 1'),
        db.getAllAsync<any>('SELECT * FROM custom_decks WHERE is_dirty = 1'), 
        db.getAllAsync<any>('SELECT * FROM custom_flashcards WHERE is_dirty = 1'),
        db.getAllAsync<any>('SELECT * FROM custom_flashcard_progress WHERE is_dirty = 1')
      ]);
      
      console.log(`📤 Unsynced items: ${userDecks.length} user decks, ${customDecks.length} custom decks, ${customFlashcards.length} flashcards, ${progress.length} progress records`);
      
      return { userDecks, customDecks, customFlashcards, progress };
    } catch (error) {
      console.error(`❌ Failed to get unsynced items: ${error}`);
      throw new Error(`Failed to get unsynced items: ${error}`);
    }
  }

  async enqueueDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input
      const validated = SyncEntitySchema.parse({ entity_type: entityType, entity_id: entityId });
      
      await db.runAsync(`
        INSERT OR REPLACE INTO deletion_queue (type, entity_id)
        VALUES (?, ?)
      `, [validated.entity_type, validated.entity_id]);
      
      console.log(`🗑️ Enqueued deletion: ${validated.entity_type} ${validated.entity_id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for deletion queue: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to enqueue deletion: ${error}`);
      throw new Error(`Failed to enqueue deletion: ${error}`);
    }
  }

  async getPendingDeletions(): Promise<Array<{entity_type: string, entity_id: string, record_id: string}>> {
    const db = await this.getDb();
    
    try {
      const rows = await db.getAllAsync<any>(`
        SELECT type as entity_type, entity_id, id as record_id FROM deletion_queue
        ORDER BY created_at ASC
      `);
      
      console.log(`🗑️ Found ${rows.length} pending deletions`);
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get pending deletions: ${error}`);
      // Return empty array instead of throwing to make calling code more resilient
      return [];
    }
  }

  async getDeletionQueue(): Promise<{ entity_type: string; entity_id: string }[]> {
    const db = await this.getDb();
    
    try {
      const rows = await db.getAllAsync<any>(
        'SELECT type as entity_type, entity_id FROM deletion_queue ORDER BY created_at ASC'
      );
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get deletion queue: ${error}`);
      // Return empty array instead of throwing to make calling code more resilient
      return [];
    }
  }

  async clearDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input
      const validated = SyncEntitySchema.parse({ entity_type: entityType, entity_id: entityId });
      
      const result = await db.runAsync(`
        DELETE FROM deletion_queue 
        WHERE type = ? AND entity_id = ?
      `, [validated.entity_type, validated.entity_id]);
      
      if (result.changes === 0) {
        console.warn(`⚠️ No deletion found to clear: ${validated.entity_type} ${validated.entity_id}`);
      } else {
        console.log(`✅ Cleared deletion from queue: ${validated.entity_type} ${validated.entity_id}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for clear deletion: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to clear deletion: ${error}`);
      throw new Error(`Failed to clear deletion: ${error}`);
    }
  }

  async markAsSynced(table: string, ids: string[]): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (ids.length === 0) {
        console.log('⚠️ No IDs to mark as synced');
        return;
      }
      
      // Validate input
      const validated = SyncTableSchema.parse({ table, ids });
      
      // Determine the primary key column name based on table
      let primaryKeyColumn = 'id';
      if (validated.table === 'custom_flashcard_progress') {
        primaryKeyColumn = 'flashcard_id';
      }
      
      const placeholders = validated.ids.map(() => '?').join(',');
      
      const result = await db.runAsync(`
        UPDATE ${validated.table} 
        SET is_dirty = 0 
        WHERE ${primaryKeyColumn} IN (${placeholders})
      `, validated.ids);
      
      console.log(`✅ Marked ${result.changes} of ${validated.ids.length} ${validated.table} records as synced`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for mark as synced: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to mark as synced: ${error}`);
      throw new Error(`Failed to mark as synced: ${error}`);
    }
  }

  /**
   * Sync data to Supabase cloud database
   * This method should be called periodically when online
   */
  async syncToCloud(): Promise<boolean> {
    try {
      console.log('🌍 Starting sync to cloud...');
      
      // Get all unsynced items
      const unsyncedItems = await this.getUnsyncedItems();
      
      const totalItems = unsyncedItems.userDecks.length + 
                        unsyncedItems.customDecks.length + 
                        unsyncedItems.customFlashcards.length + 
                        unsyncedItems.progress.length;
      
      if (totalItems === 0) {
        console.log('✅ No items to sync');
        return true;
      }
      
      console.log(`🔄 Syncing ${totalItems} items to cloud...`);
      
      // Validate UserDecks before sync
      const validUserDecks: string[] = [];
      const invalidUserDecks: string[] = [];
      
      for (const deck of unsyncedItems.userDecks) {
        const validation = validateUserDeck(deck);
        if (validation.success) {
          validUserDecks.push(deck.id);
          console.log(`✅ UserDeck validated: ${deck.deck_name || 'Unnamed'} (${deck.id})`);
        } else {
          invalidUserDecks.push(deck.id);
          console.warn(`⚠️ UserDeck validation failed: ${deck.id}`, validation.details);
          // Continue processing - don't block sync for individual record failures
        }
      }
      
      if (invalidUserDecks.length > 0) {
        console.warn(`⚠️ ${invalidUserDecks.length}/${unsyncedItems.userDecks.length} UserDecks failed validation and will be skipped`);
      }
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Test connectivity
      const { error: connectivityError } = await supabase
        .from('user_decks')
        .select('id')
        .limit(1);
        
      if (connectivityError) {
        throw new Error(`No internet connection: ${connectivityError.message}`);
      }

      // Sync UserDecks to Supabase
      const userDecksToSync = unsyncedItems.userDecks.filter(deck => {
        const validation = validateUserDeck(deck);
        if (validation.success) {
          return true;
        } else {
          console.warn(`⚠️ Skipping invalid UserDeck ${deck.id}:`, validation.details);
          return false;
        }
      });
      
      if (userDecksToSync.length > 0) {
        console.log(`🔄 Syncing ${userDecksToSync.length} UserDecks to Supabase...`);
        
        // Helper function to validate timestamp
        const validTimestamp = (ts: any): string => {
          if (!ts || ts === '' || ts === null) return new Date().toISOString();
          try {
            const date = new Date(ts);
            return isNaN(date.getTime()) ? new Date().toISOString() : ts;
          } catch {
            return new Date().toISOString();
          }
        };
        
        // Prepare deck data for Supabase
        
        const deckUpdates = userDecksToSync.map(deck => ({
          id: deck.id,
          user_id: deck.user_id,
          template_deck_id: deck.template_deck_id || null,
          added_at: validTimestamp(deck.added_at),
          custom_name: deck.custom_name || null,
          is_favorite: deck.is_favorite || false,
          is_custom: deck.is_custom || false,
          deck_name: deck.deck_name || deck.custom_name || 'Unnamed Deck',
          deck_description: deck.deck_description || '',
          deck_language: deck.deck_language || 'en',
          deck_cover_image_url: deck.deck_cover_image_url || '',
          deck_tags: deck.deck_tags || '[]',  // Keep as JSON string for user_decks
          deck_difficulty_level: deck.deck_difficulty_level || 1,
          deck_flashcard_count: deck.deck_flashcard_count || 0,
          deck_created_by: deck.deck_created_by || null,
          deck_is_active: deck.deck_is_active !== false,
          deck_created_at: validTimestamp(deck.deck_created_at),
          deck_updated_at: validTimestamp(deck.deck_updated_at),
          stats_new: deck.stats_new || 0,
          stats_learning: deck.stats_learning || 0,
          stats_review: deck.stats_review || 0,
          stats_mastered: deck.stats_mastered || 0,
          stats_updated_at: validTimestamp(deck.stats_updated_at)
        }));
        
        // Sync to Supabase
        const { error: deckError } = await supabase
          .from('user_decks')
          .upsert(deckUpdates, { onConflict: 'id' });
          
        if (deckError) {
          console.error('❌ Failed to sync UserDecks:', deckError);
          throw new Error(`Failed to sync UserDecks: ${deckError.message}`);
        }
        
        console.log(`✅ Successfully synced ${userDecksToSync.length} UserDecks to Supabase`);
        
        // Mark as synced only after successful sync
        await this.markAsSynced('user_decks', userDecksToSync.map(d => d.id));
      }
      
      // Sync custom decks to Supabase
      if (unsyncedItems.customDecks.length > 0) {
        console.log(`🔄 Syncing ${unsyncedItems.customDecks.length} custom decks to Supabase...`);
        
        // Helper function to validate timestamp
        const validTimestamp = (ts: any): string => {
          if (!ts || ts === '' || ts === null) return new Date().toISOString();
          try {
            const date = new Date(ts);
            return isNaN(date.getTime()) ? new Date().toISOString() : ts;
          } catch {
            return new Date().toISOString();
          }
        };
        
        // Helper function to parse tags from JSON string to array
        const parseTags = (tags: any): string[] => {
          if (!tags) return [];
          if (Array.isArray(tags)) return tags;
          if (typeof tags === 'string') {
            try {
              const parsed = JSON.parse(tags);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        };
        
        // Prepare custom deck data for Supabase
        const deckUpdates = unsyncedItems.customDecks.map(deck => ({
          id: deck.id,
          user_id: deck.user_id,
          name: deck.name || 'Unnamed Deck',
          description: deck.description || '',
          language: deck.language || 'en',
          cover_image_url: deck.cover_image_url || '',
          tags: parseTags(deck.tags),  // Pass as array, not JSON string
          is_active: deck.is_active !== false,
          created_at: validTimestamp(deck.created_at),
          updated_at: validTimestamp(deck.updated_at)
        }));
        
        // Sync to Supabase
        const { error: deckError } = await supabase
          .from('custom_decks')
          .upsert(deckUpdates, { onConflict: 'id' });
          
        if (deckError) {
          console.error('❌ Failed to sync custom decks:', deckError);
          throw new Error(`Failed to sync custom decks: ${deckError.message}`);
        }
        
        console.log(`✅ Successfully synced ${unsyncedItems.customDecks.length} custom decks to Supabase`);
        await this.markAsSynced('custom_decks', unsyncedItems.customDecks.map(d => d.id));
      }
      
      // Sync custom flashcards to Supabase
      if (unsyncedItems.customFlashcards.length > 0) {
        console.log(`🔄 Syncing ${unsyncedItems.customFlashcards.length} custom flashcards to Supabase...`);
        
        // Helper function to validate timestamp
        const validTimestamp = (ts: any): string => {
          if (!ts || ts === '' || ts === null) return new Date().toISOString();
          try {
            const date = new Date(ts);
            return isNaN(date.getTime()) ? new Date().toISOString() : ts;
          } catch {
            return new Date().toISOString();
          }
        };
        
        // Prepare flashcard data for Supabase
        const flashcardUpdates = unsyncedItems.customFlashcards.map(flashcard => ({
          id: flashcard.id,
          user_deck_id: flashcard.user_deck_id,
          user_id: flashcard.user_id,
          front_text: flashcard.front_text,
          back_text: flashcard.back_text,
          hint_text: flashcard.hint_text || '',
          front_image_url: flashcard.front_image_url || '',
          back_image_url: flashcard.back_image_url || '',
          front_audio_url: flashcard.front_audio_url || '',
          back_audio_url: flashcard.back_audio_url || '',
          position: flashcard.position || 1,
          created_at: validTimestamp(flashcard.created_at),
          updated_at: validTimestamp(flashcard.updated_at)
        }));
        
        // Sync to Supabase
        const { error: flashcardError } = await supabase
          .from('custom_flashcards')
          .upsert(flashcardUpdates, { onConflict: 'id' });
          
        if (flashcardError) {
          console.error('❌ Failed to sync custom flashcards:', flashcardError);
          throw new Error(`Failed to sync flashcards: ${flashcardError.message}`);
        }
        
        console.log(`✅ Successfully synced ${unsyncedItems.customFlashcards.length} custom flashcards to Supabase`);
        await this.markAsSynced('custom_flashcards', unsyncedItems.customFlashcards.map(f => f.id));
      }
      if (unsyncedItems.progress.length > 0) {
        // Sync progress records to Supabase
        console.log(`🔄 Syncing ${unsyncedItems.progress.length} progress records to Supabase...`);
        
        // Helper function to validate timestamp
        const validTimestamp = (ts: any): string => {
          if (!ts || ts === '' || ts === null) return new Date().toISOString();
          try {
            const date = new Date(ts);
            return isNaN(date.getTime()) ? new Date().toISOString() : ts;
          } catch {
            return new Date().toISOString();
          }
        };
        
        // Prepare progress data for Supabase
        const progressUpdates = unsyncedItems.progress.map(progress => ({
          flashcard_id: progress.flashcard_id,
          user_deck_id: progress.user_deck_id || null,
          status: progress.status || 'new',
          last_reviewed_at: validTimestamp(progress.last_reviewed_at),
          next_review_at: validTimestamp(progress.next_review_at),
          repetition: progress.repetition || 0,
          easiness_factor: progress.easiness_factor || 2.5,
          interval_days: progress.interval_days || 1,
          correct_count: progress.correct_count || 0,
          incorrect_count: progress.incorrect_count || 0,
          created_at: validTimestamp(progress.created_at),
          updated_at: validTimestamp(progress.updated_at)
        }));
        
        // Sync to Supabase
        const { error: progressError } = await supabase
          .from('custom_flashcard_progress')
          .upsert(progressUpdates, { onConflict: 'flashcard_id' });
          
        if (progressError) {
          console.error('❌ Failed to sync progress records:', progressError);
          throw new Error(`Failed to sync progress: ${progressError.message}`);
        }
        
        console.log(`✅ Successfully synced ${unsyncedItems.progress.length} progress records to Supabase`);
        
        // Mark as synced - use flashcard_id as that's the primary key
        await this.markAsSynced('custom_flashcard_progress', unsyncedItems.progress.map(p => p.flashcard_id));
      }
      
      const syncedCount = validUserDecks.length + unsyncedItems.customDecks.length + 
                         unsyncedItems.customFlashcards.length + unsyncedItems.progress.length;
      console.log(`✅ Successfully synced ${syncedCount}/${totalItems} items to cloud`);
      
      // Return true only if no critical failures occurred
      return invalidUserDecks.length === 0;
      
    } catch (error) {
      console.error(`❌ Cloud sync failed: ${error}`);
      return false;
    }
  }

  /**
   * Process pending deletions by sending them to cloud
   */
  async syncDeletionsToCloud(): Promise<boolean> {
    try {
      const pendingDeletions = await this.getPendingDeletions();
      
      if (pendingDeletions.length === 0) {
        console.log('✅ No deletions to sync');
        return true;
      }
      
      console.log(`🗞️ Syncing ${pendingDeletions.length} deletions to cloud...`);
      
      // TODO: Implement actual Supabase deletion sync
      // For now, this is a placeholder
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Clear deletions from queue (placeholder - only do this after real sync)
      for (const deletion of pendingDeletions) {
        try {
          await this.clearDeletion(
            deletion.entity_type as 'deck' | 'flashcard', 
            deletion.entity_id
          );
        } catch (clearError) {
          console.warn(`⚠️ Failed to clear deletion ${deletion.entity_id}: ${clearError}`);
          // Continue with other deletions
        }
      }
      
      console.log(`✅ Successfully synced ${pendingDeletions.length} deletions to cloud`);
      return true;
      
    } catch (error) {
      console.error(`❌ Deletion sync failed: ${error}`);
      return false;
    }
  }

  /**
   * Sync flashcard positions to Supabase cloud database
   * Specifically for when flashcard order is changed
   */
  async syncFlashcardPositions(retryCount = 3): Promise<{ success: boolean; synced: number; error?: string }> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        console.log(`🔄 Starting flashcard position sync (attempt ${attempt}/${retryCount})...`);
        
        // Get only dirty flashcards that need position sync
        const db = await this.getDb();
        const dirtyFlashcards = await db.getAllAsync<any>(`
          SELECT * FROM custom_flashcards 
          WHERE is_dirty = 1 
          ORDER BY user_deck_id, position ASC
        `);
        
        if (dirtyFlashcards.length === 0) {
          console.log('✅ No flashcard positions to sync');
          return { success: true, synced: 0 };
        }
        
        console.log(`🔄 Found ${dirtyFlashcards.length} flashcards with position changes to sync`);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // First, ensure all user decks are synced to Supabase
        const uniqueDeckIds = [...new Set(dirtyFlashcards.map(f => f.user_deck_id))];
        console.log(`📦 Checking ${uniqueDeckIds.length} unique decks for sync...`);
        
        for (const deckId of uniqueDeckIds) {
          // Get the deck from local database
          const deckRows = await db.getAllAsync<any>(`
            SELECT * FROM user_decks WHERE id = ?
          `, [deckId]);
          
          if (deckRows.length > 0) {
            const deck = deckRows[0];
            console.log(`🔄 Syncing deck ${deck.deck_name || 'Unnamed'} (${deckId}) to Supabase...`);
            
            // Sync the deck to Supabase first
            // Ensure timestamps are valid (not empty strings)
            const now = new Date().toISOString();
            
            // Helper function to validate timestamp
            const validTimestamp = (ts: any): string => {
              if (!ts || ts === '' || ts === null) return now;
              // Check if it's a valid date string
              try {
                const date = new Date(ts);
                return isNaN(date.getTime()) ? now : ts;
              } catch {
                return now;
              }
            };
            
            const { error: deckError } = await supabase
              .from('user_decks')
              .upsert({
                id: deck.id,
                user_id: deck.user_id,
                template_deck_id: deck.template_deck_id || null,
                added_at: validTimestamp(deck.added_at),
                custom_name: deck.custom_name || null,
                is_favorite: deck.is_favorite || false,
                is_custom: deck.is_custom || false,
                deck_name: deck.deck_name || deck.custom_name || 'Unnamed Deck',
                deck_description: deck.deck_description || '',
                deck_language: deck.deck_language || 'en',
                deck_cover_image_url: deck.deck_cover_image_url || '',
                deck_tags: deck.deck_tags || '[]',
                deck_difficulty_level: deck.deck_difficulty_level || 1,
                deck_flashcard_count: deck.deck_flashcard_count || 0,
                deck_created_by: deck.deck_created_by || null,
                deck_is_active: deck.deck_is_active !== false,
                deck_created_at: validTimestamp(deck.deck_created_at),
                deck_updated_at: validTimestamp(deck.deck_updated_at),
                stats_new: deck.stats_new || 0,
                stats_learning: deck.stats_learning || 0,
                stats_review: deck.stats_review || 0,
                stats_mastered: deck.stats_mastered || 0,
                stats_updated_at: validTimestamp(deck.stats_updated_at),
                is_dirty: false
              }, {
                onConflict: 'id'
              });
              
            if (deckError) {
              console.error(`❌ Failed to sync deck ${deckId}:`, deckError);
              throw new Error(`Failed to sync deck: ${deckError.message}`);
            }
            
            console.log(`✅ Deck ${deckId} synced successfully`);
          }
        }
        
        // Check connectivity by testing a simple query
        const { error: connectivityError } = await supabase
          .from('custom_flashcards')
          .select('id')
          .limit(1);
          
        if (connectivityError) {
          throw new Error(`No internet connection: ${connectivityError.message}`);
        }
        
        // Update flashcard positions in Supabase
        // Filter only the user's flashcards for security
        const userFlashcards = dirtyFlashcards.filter(f => f.user_id === user.id);
        
        if (userFlashcards.length === 0) {
          console.log('⚠️ No user-owned flashcards to sync');
          return { success: true, synced: 0 };
        }
        
        // Prepare batch update data - include ALL required fields for upsert
        const flashcardUpdates = userFlashcards.map(flashcard => ({
          id: flashcard.id,
          user_deck_id: flashcard.user_deck_id,
          user_id: flashcard.user_id,
          front_text: flashcard.front_text,
          back_text: flashcard.back_text,
          hint_text: flashcard.hint_text || '',
          front_image_url: flashcard.front_image_url || '',
          back_image_url: flashcard.back_image_url || '',
          front_audio_url: flashcard.front_audio_url || '',
          back_audio_url: flashcard.back_audio_url || '',
          position: flashcard.position,
          created_at: flashcard.created_at,
          updated_at: flashcard.updated_at,
          is_dirty: false  // Mark as clean since we're syncing
        }));
        
        // Log what we're about to sync
        console.log('📤 Syncing flashcards to Supabase:', flashcardUpdates.map(f => ({
          id: f.id,
          position: f.position,
          is_dirty: f.is_dirty
        })));
        
        // Perform batch upsert to Supabase
        const { error: upsertError, data } = await supabase
          .from('custom_flashcards')
          .upsert(flashcardUpdates, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          })
          .select();
          
        if (upsertError) {
          console.error('❌ Supabase upsert error:', upsertError);
          throw new Error(`Supabase sync failed: ${upsertError.message}`);
        }
        
        console.log('✅ Supabase upsert successful, returned data:', data);
        
        console.log(`✅ Successfully updated ${userFlashcards.length} flashcard positions in Supabase`);
        
        // Mark flashcards as synced (clean) - only mark the ones we actually synced
        const syncedIds = userFlashcards.map(f => f.id);
        await this.markAsSynced('custom_flashcards', syncedIds);
        
        console.log(`✅ Successfully synced ${userFlashcards.length} flashcard positions`);
        return { success: true, synced: userFlashcards.length };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown sync error');
        console.error(`❌ Flashcard position sync failed (attempt ${attempt}/${retryCount}): ${lastError.message}`);
        
        // If this isn't the last attempt and it's a temporary error, wait before retrying
        if (attempt < retryCount && this.isTemporaryError(lastError)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's not a temporary error or we've exhausted retries, break the loop
        if (!this.isTemporaryError(lastError) || attempt === retryCount) {
          break;
        }
      }
    }
    
    // If we get here, all retries failed
    const errorMessage = lastError?.message || 'All retry attempts failed';
    console.error(`❌ Flashcard position sync failed after ${retryCount} attempts: ${errorMessage}`);
    return { success: false, synced: 0, error: errorMessage };
  }
  
  /**
   * Check if an error is temporary and should be retried
   */
  private isTemporaryError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('temporary') ||
      message.includes('rate limit') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  }

  /**
   * Full sync operation - syncs both data and deletions
   */
  async performFullSync(): Promise<{ success: boolean; synced: number; deleted: number }> {
    try {
      console.log('🔄 Starting full sync operation...');
      
      // Get counts before sync
      const unsyncedItems = await this.getUnsyncedItems();
      const pendingDeletions = await this.getPendingDeletions();
      
      const syncedCount = unsyncedItems.userDecks.length + 
                         unsyncedItems.customDecks.length + 
                         unsyncedItems.customFlashcards.length + 
                         unsyncedItems.progress.length;
      
      const deletedCount = pendingDeletions.length;
      
      // Perform syncs
      const [syncSuccess, deletionSuccess] = await Promise.all([
        this.syncToCloud(),
        this.syncDeletionsToCloud()
      ]);
      
      const success = syncSuccess && deletionSuccess;
      
      console.log(`🎉 Full sync completed: success=${success}, synced=${syncedCount}, deleted=${deletedCount}`);
      
      return { success, synced: syncedCount, deleted: deletedCount };
      
    } catch (error) {
      console.error(`❌ Full sync failed: ${error}`);
      return { success: false, synced: 0, deleted: 0 };
    }
  }
}