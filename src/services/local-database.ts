import type { CustomDeck, CustomFlashcard, UserDeck } from '@/types/flashcard';
import * as SQLite from 'expo-sqlite';
import { supabase } from '../../lib/supabase';

export class LocalDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  constructor() {
    // Database will be opened in initialize()
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync('lexora_local.db');
    }
    return this.db;
  }

  /**
   * Initialize the local database with all required tables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const db = await this.getDb();
      
      // Create base tables first
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_decks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          template_deck_id TEXT,
          custom_name TEXT,
          is_favorite INTEGER DEFAULT 0,
          is_custom INTEGER DEFAULT 0,
          added_at TEXT NOT NULL,
          is_dirty INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS custom_decks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT DEFAULT '',
          language TEXT NOT NULL,
          cover_image_url TEXT DEFAULT '',
          tags TEXT DEFAULT '[]',
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_dirty INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS custom_flashcards (
          id TEXT PRIMARY KEY,
          user_deck_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          front_text TEXT NOT NULL,
          back_text TEXT NOT NULL,
          hint_text TEXT DEFAULT '',
          front_image_url TEXT DEFAULT '',
          back_image_url TEXT DEFAULT '',
          front_audio_url TEXT DEFAULT '',
          back_audio_url TEXT DEFAULT '',
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_dirty INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_user_decks_user_id ON user_decks (user_id);
        CREATE INDEX IF NOT EXISTS idx_custom_flashcards_deck_id ON custom_flashcards (user_deck_id);

        -- Deletion queue for offline tombstones
        CREATE TABLE IF NOT EXISTS deletion_queue (
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          PRIMARY KEY (entity_type, entity_id)
        );
      `);

      // Migrate user_decks table to unified model
      await this.migrateToUnifiedModel(db);

      this.isInitialized = true;
      console.log('Local database initialized successfully');
    } catch (error) {
      console.error('Error initializing local database:', error);
      throw error;
    }
  }

  /**
   * Migrate user_decks table to unified model by adding new columns
   */
  private async migrateToUnifiedModel(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      // Check if migration is already done
      const tableInfo = await db.getAllAsync("PRAGMA table_info(user_decks)");
      const hasUnifiedColumns = tableInfo.some((col: any) => col.name === 'deck_name');
      
      if (hasUnifiedColumns) {
        console.log('Unified model migration already applied');
        return;
      }

      console.log('Migrating user_decks table to unified model...');
      
      // Add unified deck columns
      await db.execAsync(`
        ALTER TABLE user_decks ADD COLUMN deck_name TEXT;
        ALTER TABLE user_decks ADD COLUMN deck_description TEXT DEFAULT '';
        ALTER TABLE user_decks ADD COLUMN deck_language TEXT;
        ALTER TABLE user_decks ADD COLUMN deck_cover_image_url TEXT DEFAULT '';
        ALTER TABLE user_decks ADD COLUMN deck_tags TEXT DEFAULT '[]';
        ALTER TABLE user_decks ADD COLUMN deck_difficulty_level INTEGER DEFAULT 1;
        ALTER TABLE user_decks ADD COLUMN deck_flashcard_count INTEGER DEFAULT 0;
        ALTER TABLE user_decks ADD COLUMN deck_created_by TEXT;
        ALTER TABLE user_decks ADD COLUMN deck_is_active INTEGER DEFAULT 1;
        ALTER TABLE user_decks ADD COLUMN deck_created_at TEXT;
        ALTER TABLE user_decks ADD COLUMN deck_updated_at TEXT;
      `);

      // Migrate existing custom deck data to unified columns
      await db.execAsync(`
        UPDATE user_decks 
        SET 
          deck_name = (
            SELECT cd.name FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_description = (
            SELECT cd.description FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_language = (
            SELECT cd.language FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_cover_image_url = (
            SELECT cd.cover_image_url FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_tags = (
            SELECT cd.tags FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_created_by = (
            SELECT cd.user_id FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_is_active = (
            SELECT cd.is_active FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_created_at = (
            SELECT cd.created_at FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          ),
          deck_updated_at = (
            SELECT cd.updated_at FROM custom_decks cd 
            WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
          )
        WHERE is_custom = 1;
      `);

      console.log('Successfully migrated user_decks table to unified model');
      
      // Additional fix for existing custom decks that may have missing deck_name
      await this.fixExistingCustomDecks(db);
    } catch (error) {
      console.error('Error migrating to unified model:', error);
      throw error;
    }
  }

  /**
   * Fix existing custom decks that might have missing deck_name values
   */
  private async fixExistingCustomDecks(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      console.log('Fixing existing custom decks with missing deck_name...');

      // Update user_decks where deck_name is NULL or "null" string but custom_name exists
      await db.execAsync(`
        UPDATE user_decks 
        SET deck_name = custom_name
        WHERE is_custom = 1 AND (deck_name IS NULL OR deck_name = 'null') AND custom_name IS NOT NULL
      `);
      
      // Also update from custom_decks table if available
      await db.execAsync(`
        UPDATE user_decks 
        SET 
          deck_name = CASE 
            WHEN deck_name IS NULL OR deck_name = 'null' THEN (
              SELECT cd.name FROM custom_decks cd 
              WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
            )
            ELSE deck_name
          END,
          deck_description = CASE 
            WHEN deck_description IS NULL OR deck_description = 'null' OR deck_description = '' THEN (
              SELECT cd.description FROM custom_decks cd 
              WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
            )
            ELSE deck_description
          END,
          deck_language = CASE 
            WHEN deck_language IS NULL OR deck_language = 'null' THEN (
              SELECT cd.language FROM custom_decks cd 
              WHERE cd.id = user_decks.id AND user_decks.is_custom = 1
            )
            ELSE deck_language
          END
        WHERE is_custom = 1
      `);
      
      console.log('Custom deck fixes completed');
    } catch (error) {
      console.log('Error fixing custom decks:', error);
    }
  }

  // Removed legacy fix methods: fixDeckNames and fixDeckFlashcardCounts (no longer needed)

  /**
   * Insert or update user deck
   */
  async insertUserDeck(deck: UserDeck): Promise<void> {
    try {
      const db = await this.getDb();
      
      
      await db.runAsync(
        `INSERT OR REPLACE INTO user_decks 
         (id, user_id, template_deck_id, custom_name, is_favorite, is_custom, added_at, is_dirty,
          deck_name, deck_description, deck_language, deck_cover_image_url, deck_tags,
          deck_difficulty_level, deck_flashcard_count, deck_created_by, deck_is_active,
          deck_created_at, deck_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deck.id,
          deck.user_id,
          deck.template_deck_id || null,
          deck.custom_name || null,
          deck.is_favorite ? 1 : 0,
          deck.is_custom ? 1 : 0,
          deck.added_at,
          deck.deck_name || null,
          deck.deck_description || null,
          deck.deck_language || null,
          deck.deck_cover_image_url || '',
          JSON.stringify(deck.deck_tags || []),
          deck.deck_difficulty_level || 1,
          deck.deck_flashcard_count || 0,
          deck.deck_created_by || null,
          deck.deck_is_active ? 1 : 0,
          deck.deck_created_at || null,
          deck.deck_updated_at || null,
        ]
      );
    } catch (error) {
      console.error('Error inserting user deck:', error);
      throw error;
    }
  }

  /**
   * Insert or update custom deck
   */
  async insertCustomDeck(deck: CustomDeck): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO custom_decks 
         (id, user_id, name, description, language, cover_image_url, tags, is_active, created_at, updated_at, is_dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          deck.id,
          deck.user_id,
          deck.name,
          deck.description,
          deck.language,
          deck.cover_image_url,
          JSON.stringify(deck.tags),
          deck.is_active ? 1 : 0,
          deck.created_at,
          deck.updated_at,
        ]
      );
    } catch (error) {
      console.error('Error inserting custom deck:', error);
      throw error;
    }
  }

  /**
   * Insert or update custom flashcard
   */
  async insertCustomFlashcard(flashcard: CustomFlashcard): Promise<void> {
    try {
      const db = await this.getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO custom_flashcards 
         (id, user_deck_id, user_id, front_text, back_text, hint_text, front_image_url, back_image_url,
          front_audio_url, back_audio_url, position, created_at, updated_at, is_dirty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          flashcard.id,
          flashcard.user_deck_id,
          flashcard.user_id,
          flashcard.front_text,
          flashcard.back_text,
          flashcard.hint_text,
          flashcard.front_image_url,
          flashcard.back_image_url,
          flashcard.front_audio_url,
          flashcard.back_audio_url,
          flashcard.position,
          flashcard.created_at,
          flashcard.updated_at,
        ]
      );
      // Update deck flashcard count
      await this.updateDeckFlashcardCount(flashcard.user_deck_id);
    } catch (error) {
      console.error('Error inserting custom flashcard:', error);
      throw error;
    }
  }

  /**
   * Update deck flashcard count based on actual flashcard count
   */
  async updateDeckFlashcardCount(userDeckId: string): Promise<void> {
    try {
      const db = await this.getDb();
      
      // Count actual flashcards
      const countResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM custom_flashcards WHERE user_deck_id = ?`,
        [userDeckId]
      );
      
      const actualCount = countResult?.count || 0;
      
      // Update the user_decks table
      await db.runAsync(
        `UPDATE user_decks SET deck_flashcard_count = ?, is_dirty = 1 WHERE id = ?`,
        [actualCount, userDeckId]
      );
    } catch (error) {
      console.error('Error updating deck flashcard count:', error);
      throw error;
    }
  }

  /**
   * Get all user decks for a user (with custom deck data)
   */
  async getUserDecks(userId: string): Promise<UserDeck[]> {
    try {
      const db = await this.getDb();
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM user_decks WHERE user_id = ? ORDER BY added_at DESC`,
        [userId]
      );

      const mappedRows = rows.map(row => {
        const result = {
          id: row.id,
          user_id: row.user_id,
          template_deck_id: row.template_deck_id,
          custom_name: row.custom_name,
          is_favorite: Boolean(row.is_favorite),
          is_custom: Boolean(row.is_custom),
          added_at: row.added_at,
          // Unified deck data
          deck_name: row.deck_name,
          deck_description: row.deck_description,
          deck_language: row.deck_language,
          deck_cover_image_url: row.deck_cover_image_url,
          deck_tags: row.deck_tags ? JSON.parse(row.deck_tags) : [],
          deck_difficulty_level: row.deck_difficulty_level,
          deck_flashcard_count: row.deck_flashcard_count,
          deck_created_by: row.deck_created_by,
          deck_is_active: Boolean(row.deck_is_active),
          deck_created_at: row.deck_created_at,
          deck_updated_at: row.deck_updated_at,
          // Legacy compatibility - populate old fields for backward compatibility
          custom_deck_name: row.deck_name,
          custom_deck_description: row.deck_description,
          custom_deck_language: row.deck_language,
          custom_deck_cover: row.deck_cover_image_url,
        };
        
        // Debug: only log if deck_name is still null/missing after fixes
        if (result.is_custom && (!result.deck_name || result.deck_name === 'null')) {
          console.log(`Custom deck ${result.id} still has invalid deck_name: "${result.deck_name}", custom_name: "${result.custom_name}"`);
        }
        
        
        return result;
      });
      
      return mappedRows;
    } catch (error) {
      console.error('Error getting user decks:', error);
      throw error;
    }
  }

  /**
   * Get custom flashcards for a deck
   */
  async getCustomFlashcards(userDeckId: string): Promise<CustomFlashcard[]> {
    try {
      const db = await this.getDb();
      const rows = await db.getAllAsync<any>(
        `SELECT * FROM custom_flashcards WHERE user_deck_id = ? ORDER BY position ASC`,
        [userDeckId]
      );

      return rows.map(row => ({
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
    } catch (error) {
      console.error('Error getting custom flashcards:', error);
      throw error;
    }
  }

  /**
   * Get items that need to be synced (is_dirty = 1)
   */
  async getUnsyncedItems(): Promise<{
    userDecks: any[];
    customDecks: any[];
    customFlashcards: any[];
  }> {
    try {
      const db = await this.getDb();
      
      const userDecks = await db.getAllAsync('SELECT * FROM user_decks WHERE is_dirty = 1');
      const customDecks = await db.getAllAsync('SELECT * FROM custom_decks WHERE is_dirty = 1');
      const customFlashcards = await db.getAllAsync('SELECT * FROM custom_flashcards WHERE is_dirty = 1');

      // Debug: log custom decks tags to see what format they're in
      customDecks.forEach((deck: any) => {
        console.log(`Unsynced custom deck ${deck.id}: tags="${deck.tags}" (type: ${typeof deck.tags})`);
      });

      return { userDecks, customDecks, customFlashcards };
    } catch (error) {
      console.error('Error getting unsynced items:', error);
      throw error;
    }
  }

  /**
   * Deletion queue (tombstones) API
   */
  async enqueueDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `INSERT OR IGNORE INTO deletion_queue (entity_type, entity_id) VALUES (?, ?)`,
      [entityType, entityId]
    );
  }

  async getDeletionQueue(): Promise<{ entity_type: string; entity_id: string }[]> {
    const db = await this.getDb();
    return db.getAllAsync(`SELECT entity_type, entity_id FROM deletion_queue`);
  }

  async clearDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(
      `DELETE FROM deletion_queue WHERE entity_type = ? AND entity_id = ?`,
      [entityType, entityId]
    );
  }

  /**
   * Mark items as synced
   */
  async markAsSynced(table: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    try {
      const db = await this.getDb();
      const placeholders = ids.map(() => '?').join(',');
      await db.runAsync(
        `UPDATE ${table} SET is_dirty = 0 WHERE id IN (${placeholders})`,
        ids
      );
    } catch (error) {
      console.error('Error marking as synced:', error);
      throw error;
    }
  }

  /**
   * Clear all local data (for logout/reset)
   */
  async clearAllData(): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execAsync(`
        DELETE FROM custom_flashcards;
        DELETE FROM custom_decks;
        DELETE FROM user_decks;
      `);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  /**
   * DEBUG: Clear all decks (local and remote)
   */
  async clearAllDecks(userId: string): Promise<void> {
    try {
      console.log('Clearing all decks for user:', userId);
      
      // First delete from remote
      try {
        await supabase.from('custom_flashcards').delete().eq('user_id', userId);
        await supabase.from('custom_decks').delete().eq('user_id', userId);
        await supabase.from('user_decks').delete().eq('user_id', userId);
        console.log('Cleared all remote decks');
      } catch (error) {
        console.log('Could not clear remote decks:', error);
      }

      // Then delete from local
      const db = await this.getDb();
      await db.runAsync('DELETE FROM custom_flashcards WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM custom_decks WHERE user_id = ?', [userId]);
      await db.runAsync('DELETE FROM user_decks WHERE user_id = ?', [userId]);
      
      console.log('Cleared all local decks');
    } catch (error) {
      console.error('Error clearing all decks:', error);
      throw error;
    }
  }

  /**
   * DEBUG: Show all decks in database
   */
  async debugShowAllDecks(userId: string): Promise<void> {
    try {
      const db = await this.getDb();
      
      console.log('=== DEBUG: All user_decks ===');
      const userDecks = await db.getAllAsync('SELECT * FROM user_decks WHERE user_id = ?', [userId]);
      userDecks.forEach((deck: any) => {
        console.log(`ID: ${deck.id}, Name: ${deck.deck_name || deck.custom_name || 'NO NAME'}, Custom: ${deck.is_custom}, Template: ${deck.template_deck_id}`);
      });

      console.log('=== DEBUG: All custom_decks ===');
      const customDecks = await db.getAllAsync('SELECT * FROM custom_decks WHERE user_id = ?', [userId]);
      customDecks.forEach((deck: any) => {
        console.log(`ID: ${deck.id}, Name: ${deck.name}`);
      });

      console.log('=== DEBUG: All custom_flashcards ===');
      const flashcards = await db.getAllAsync('SELECT * FROM custom_flashcards WHERE user_id = ?', [userId]);
      console.log(`Found ${flashcards.length} custom flashcards`);
      
    } catch (error) {
      console.error('Error showing debug info:', error);
    }
  }

  // Removed legacy cleanup method clearInvalidCustomDecks

  /**
   * Clear a specific custom flashcard
   */
  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    try {
      const db = await this.getDb();
      
      // Get the user_deck_id before deleting to update count later
      const flashcard = await db.getFirstAsync<{ user_deck_id: string }>(
        'SELECT user_deck_id FROM custom_flashcards WHERE id = ?',
        [flashcardId]
      );
      
      // Enqueue tombstone for remote deletion
      await this.enqueueDeletion('flashcard', flashcardId);
      
      // Delete from local database regardless of remote sync result
      await db.runAsync(
        'DELETE FROM custom_flashcards WHERE id = ?',
        [flashcardId]
      );
      
      // Update deck flashcard count if we had the flashcard's deck ID
      if (flashcard?.user_deck_id) {
        await this.updateDeckFlashcardCount(flashcard.user_deck_id);
      }
      
      console.log(`Cleared custom flashcard ${flashcardId} from local database`);
    } catch (error) {
      console.error('Error clearing custom flashcard:', error);
      throw error;
    }
  }

  /**
   * Clear a specific custom deck and all its flashcards
   */
  async clearCustomDeck(deckId: string): Promise<void> {
    try {
      const db = await this.getDb();
      
      // Enqueue tombstone for remote deck deletion (will also delete its flashcards remotely)
      await this.enqueueDeletion('deck', deckId);
      
      // Delete from local database regardless of remote sync result
      console.log(`Deleting flashcards for deck ${deckId}`);
      const flashcardsResult = await db.runAsync(
        'DELETE FROM custom_flashcards WHERE user_deck_id = ?',
        [deckId]
      );
      console.log(`Deleted ${flashcardsResult.changes} flashcards`);
      
      console.log(`Deleting custom deck record ${deckId}`);
      const customDeckResult = await db.runAsync(
        'DELETE FROM custom_decks WHERE id = ?',
        [deckId]
      );
      console.log(`Deleted ${customDeckResult.changes} custom deck records`);
      
      console.log(`Deleting user deck record ${deckId}`);
      const userDeckResult = await db.runAsync(
        'DELETE FROM user_decks WHERE id = ?',
        [deckId]
      );
      console.log(`Deleted ${userDeckResult.changes} user deck records`);
      
      console.log(`Cleared custom deck ${deckId} from local database`);
     
    } catch (error) {
      console.error('Error clearing custom deck:', error);
      throw error;
    }
  }
}

export const localDatabase = new LocalDatabase();
