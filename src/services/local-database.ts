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

        -- Progress per flashcard (local-only)
        CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
          flashcard_id TEXT PRIMARY KEY,
          user_deck_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new', -- new | learning | review | mastered
          correct_count INTEGER DEFAULT 0,
          incorrect_count INTEGER DEFAULT 0,
          repetition INTEGER DEFAULT 0,
          easiness_factor REAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
          next_review_at TEXT,
          last_reviewed_at TEXT,
          created_at TEXT,
          updated_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_progress_deck ON custom_flashcard_progress (user_deck_id);
        CREATE INDEX IF NOT EXISTS idx_progress_next_review ON custom_flashcard_progress (next_review_at);

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
      
      // Fix custom deck names
      await this.fixCustomDeckNames();

      // Ensure study stats columns exist (handles already-migrated DBs)
      await this.ensureStatsColumns(db);

      this.isInitialized = true;
      console.log('Local database initialized successfully');
    } catch (error) {
      console.error('Error initializing local database:', error);
      throw error;
    }
  }

  private async ensureStatsColumns(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      const tableInfo = await db.getAllAsync("PRAGMA table_info(user_decks)");
      const hasNew = tableInfo.some((c: any) => c.name === 'stats_new');
      const hasLearning = tableInfo.some((c: any) => c.name === 'stats_learning');
      const hasReview = tableInfo.some((c: any) => c.name === 'stats_review');
      const hasMastered = tableInfo.some((c: any) => c.name === 'stats_mastered');
      const hasUpdatedAt = tableInfo.some((c: any) => c.name === 'stats_updated_at');

      const alters: string[] = [];
      if (!hasNew) alters.push(`ALTER TABLE user_decks ADD COLUMN stats_new INTEGER DEFAULT 0`);
      if (!hasLearning) alters.push(`ALTER TABLE user_decks ADD COLUMN stats_learning INTEGER DEFAULT 0`);
      if (!hasReview) alters.push(`ALTER TABLE user_decks ADD COLUMN stats_review INTEGER DEFAULT 0`);
      if (!hasMastered) alters.push(`ALTER TABLE user_decks ADD COLUMN stats_mastered INTEGER DEFAULT 0`);
      if (!hasUpdatedAt) alters.push(`ALTER TABLE user_decks ADD COLUMN stats_updated_at TEXT`);

      if (alters.length > 0) {
        await db.execAsync(alters.join(';') + ';');
        // Initialize defaults ONLY for newly added columns (not existing data)
        await db.execAsync(`
          UPDATE user_decks
          SET stats_new = CASE WHEN stats_new IS NULL THEN COALESCE(deck_flashcard_count, 0) ELSE stats_new END,
              stats_learning = CASE WHEN stats_learning IS NULL THEN 0 ELSE stats_learning END,
              stats_review = CASE WHEN stats_review IS NULL THEN 0 ELSE stats_review END,
              stats_mastered = CASE WHEN stats_mastered IS NULL THEN 0 ELSE stats_mastered END,
              stats_updated_at = CASE WHEN stats_updated_at IS NULL THEN datetime('now') ELSE stats_updated_at END
          WHERE stats_new IS NULL OR stats_learning IS NULL OR stats_review IS NULL OR stats_mastered IS NULL;
        `);
      }
    } catch (e) {
      console.error('Error ensuring stats columns:', e);
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
        -- Study stats
        ALTER TABLE user_decks ADD COLUMN stats_new INTEGER DEFAULT 0;
        ALTER TABLE user_decks ADD COLUMN stats_learning INTEGER DEFAULT 0;
        ALTER TABLE user_decks ADD COLUMN stats_review INTEGER DEFAULT 0;
        ALTER TABLE user_decks ADD COLUMN stats_mastered INTEGER DEFAULT 0;
        ALTER TABLE user_decks ADD COLUMN stats_updated_at TEXT;
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

      // Debug: show all deck stats before initialization
      const allDecks = await db.getAllAsync('SELECT id, deck_name, stats_new, stats_learning, stats_mastered, stats_updated_at FROM user_decks');
      console.log('🚀 APP STARTUP - All deck stats before init:', allDecks);

      // Initialize study stats based on flashcard counts ONLY for newly added decks
      const initResult = await db.runAsync(`
        UPDATE user_decks
        SET stats_new = COALESCE(deck_flashcard_count, 0),
            stats_learning = 0,
            stats_review = 0,
            stats_mastered = 0,
            stats_updated_at = datetime('now')
        WHERE stats_new IS NULL AND stats_updated_at IS NULL;
      `);
      
      console.log(`🔧 Initialized stats for ${initResult.changes} new decks`);
      
      // Debug: show all deck stats after initialization  
      const allDecksAfter = await db.getAllAsync('SELECT id, deck_name, stats_new, stats_learning, stats_mastered, stats_updated_at FROM user_decks');
      console.log('✅ APP STARTUP - All deck stats after init:', allDecksAfter);
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
        `INSERT INTO user_decks 
         (id, user_id, template_deck_id, custom_name, is_favorite, is_custom, added_at, is_dirty,
          deck_name, deck_description, deck_language, deck_cover_image_url, deck_tags,
          deck_difficulty_level, deck_flashcard_count, deck_created_by, deck_is_active,
          deck_created_at, deck_updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           user_id = excluded.user_id,
           template_deck_id = excluded.template_deck_id,
           custom_name = excluded.custom_name,
           is_favorite = excluded.is_favorite,
           is_custom = excluded.is_custom,
           added_at = excluded.added_at,
           -- Preserve local deck_name if it's valid, otherwise use remote
           deck_name = CASE 
             WHEN user_decks.deck_name IS NOT NULL AND user_decks.deck_name != '' AND user_decks.deck_name != 'null' 
             THEN user_decks.deck_name 
             ELSE excluded.deck_name 
           END,
           deck_description = excluded.deck_description,
           deck_language = excluded.deck_language,
           deck_cover_image_url = excluded.deck_cover_image_url,
           deck_tags = excluded.deck_tags,
           deck_difficulty_level = excluded.deck_difficulty_level,
           deck_flashcard_count = excluded.deck_flashcard_count,
           deck_created_by = excluded.deck_created_by,
           deck_is_active = excluded.deck_is_active,
           deck_created_at = excluded.deck_created_at,
           deck_updated_at = excluded.deck_updated_at,
           -- Preserve existing statistics if they exist (don't reset to 0)
           stats_new = COALESCE(user_decks.stats_new, excluded.stats_new, 0),
           stats_learning = COALESCE(user_decks.stats_learning, excluded.stats_learning, 0),
           stats_review = COALESCE(user_decks.stats_review, excluded.stats_review, 0),
           stats_mastered = COALESCE(user_decks.stats_mastered, excluded.stats_mastered, 0),
           stats_updated_at = COALESCE(user_decks.stats_updated_at, excluded.stats_updated_at)
        `,
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

  /** Build study queue: always show all flashcards with their progress status */
  async getStudyQueue(deckId: string) {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    const nowIso = new Date().toISOString();
    
    // Get all flashcards with their progress status
    const allCards = await db.getAllAsync<any>(
      `SELECT 
        f.*,
        COALESCE(p.status, 'new') AS progress_status,
        p.next_review_at,
        p.last_reviewed_at,
        p.repetition,
        p.easiness_factor,
        p.interval_days
      FROM custom_flashcards f
      LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
      WHERE f.user_deck_id = ?
      ORDER BY 
        CASE 
          WHEN p.status = 'review' AND (p.next_review_at IS NULL OR p.next_review_at <= ?) THEN 1
          WHEN p.status = 'learning' OR p.status IS NULL THEN 2
          WHEN p.status = 'new' THEN 3
          WHEN p.status = 'mastered' THEN 4
          ELSE 5
        END,
        f.position ASC
      `,
      [deckId, nowIso]
    );

    return allCards;
  }

  /** Count due today (reviews with next_review_at <= now) + learning */
  async getDeckDueCount(deckId: string): Promise<number> {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    const nowIso = new Date().toISOString();
    const reviewRow = await db.getFirstAsync<any>(
      `SELECT COUNT(*) AS c FROM custom_flashcards f
         JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
        WHERE f.user_deck_id = ? AND p.status = 'review' AND (p.next_review_at IS NULL OR p.next_review_at <= ?)`,
      [deckId, nowIso]
    );
    const learningRow = await db.getFirstAsync<any>(
      `SELECT COUNT(*) AS c FROM custom_flashcards f
         JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
        WHERE f.user_deck_id = ? AND p.status = 'learning'`,
      [deckId]
    );
    const due = Number(reviewRow?.c || 0) + Number(learningRow?.c || 0);
    return due;
  }

  /** Get all progress data for sync */
  async getAllProgressData() {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM custom_flashcard_progress`
    );
    
    return rows.map(row => ({
      flashcard_id: row.flashcard_id,
      user_deck_id: row.user_deck_id,
      status: row.status,
      correct_count: row.correct_count,
      incorrect_count: row.incorrect_count,
      repetition: row.repetition,
      easiness_factor: row.easiness_factor,
      interval_days: row.interval_days,
      next_review_at: row.next_review_at,
      last_reviewed_at: row.last_reviewed_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  /** Upsert progress data from sync */
  async upsertProgressData(progress: any) {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    
    await db.runAsync(
      `INSERT INTO custom_flashcard_progress (
        flashcard_id, user_deck_id, status, correct_count, incorrect_count,
        repetition, easiness_factor, interval_days, next_review_at, 
        last_reviewed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(flashcard_id) DO UPDATE SET
        status = excluded.status,
        correct_count = excluded.correct_count,
        incorrect_count = excluded.incorrect_count,
        repetition = excluded.repetition,
        easiness_factor = excluded.easiness_factor,
        interval_days = excluded.interval_days,
        next_review_at = excluded.next_review_at,
        last_reviewed_at = excluded.last_reviewed_at,
        updated_at = excluded.updated_at
      `,
      [
        progress.flashcard_id,
        progress.user_deck_id,
        progress.status,
        progress.correct_count,
        progress.incorrect_count,
        progress.repetition,
        progress.easiness_factor,
        progress.interval_days,
        progress.next_review_at,
        progress.last_reviewed_at,
        progress.created_at,
        progress.updated_at
      ]
    );
  }

  /** Apply answer, update per-card progress and aggregate deck stats */
  async applyAnswer(deckId: string, flashcardId: string, knew: boolean) {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    const nowIso = new Date().toISOString();
    const prog = await db.getFirstAsync<any>(
      `SELECT * FROM custom_flashcard_progress WHERE flashcard_id = ?`,
      [flashcardId]
    );
    const oldStatus: 'new' | 'learning' | 'review' | 'mastered' = (prog?.status ?? 'new');

    let nextStatus: 'new' | 'learning' | 'review' | 'mastered' = oldStatus;
    let correct = Number(prog?.correct_count ?? 0);
    let incorrect = Number(prog?.incorrect_count ?? 0);
    let nextReviewAt: string | null = prog?.next_review_at ?? null;

    if (knew) {
      correct += 1;
      if (oldStatus === 'new') {
        nextStatus = 'learning';
        // first success: review in 1 hour
        nextReviewAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      } else if (oldStatus === 'learning') {
        if (correct >= 2) {
          nextStatus = 'review';
          nextReviewAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        } else {
          nextStatus = 'learning';
          nextReviewAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();
        }
      } else if (oldStatus === 'review') {
        if (correct >= 4) {
          nextStatus = 'mastered';
          nextReviewAt = null;
        } else {
          nextStatus = 'review';
          nextReviewAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
        }
      } else if (oldStatus === 'mastered') {
        nextStatus = 'mastered';
        nextReviewAt = null;
      }
    } else {
      incorrect += 1;
      correct = 0;
      nextStatus = 'learning';
      // quick retry window
      nextReviewAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    }

    // Upsert progress
    await db.runAsync(
      `INSERT INTO custom_flashcard_progress (
        flashcard_id, user_deck_id, status, correct_count, incorrect_count, 
        repetition, easiness_factor, interval_days, next_review_at, last_reviewed_at, 
        created_at, updated_at
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(flashcard_id) DO UPDATE SET
         status = excluded.status,
         correct_count = excluded.correct_count,
         incorrect_count = excluded.incorrect_count,
         repetition = excluded.repetition,
         easiness_factor = excluded.easiness_factor,
         interval_days = excluded.interval_days,
         next_review_at = excluded.next_review_at,
         last_reviewed_at = excluded.last_reviewed_at,
         updated_at = excluded.updated_at
      `,
      [
        flashcardId, deckId, nextStatus, correct, incorrect,
        prog?.repetition || 0, prog?.easiness_factor || 2.5, prog?.interval_days || 1,
        nextReviewAt, nowIso, prog?.created_at || nowIso, nowIso
      ]
    );

    // Update aggregate stats by deltas based on transition
    const deltas: { new?: number; learning?: number; review?: number; mastered?: number } = {};
    if (oldStatus !== nextStatus) {
      // decrement from old bucket
      if (oldStatus === 'new') deltas.new = (deltas.new ?? 0) - 1;
      if (oldStatus === 'learning') deltas.learning = (deltas.learning ?? 0) - 1;
      if (oldStatus === 'review') deltas.review = (deltas.review ?? 0) - 1;
      if (oldStatus === 'mastered') deltas.mastered = (deltas.mastered ?? 0) - 1;

      // increment new bucket
      if (nextStatus === 'new') deltas.new = (deltas.new ?? 0) + 1;
      if (nextStatus === 'learning') deltas.learning = (deltas.learning ?? 0) + 1;
      if (nextStatus === 'review') deltas.review = (deltas.review ?? 0) + 1;
      if (nextStatus === 'mastered') deltas.mastered = (deltas.mastered ?? 0) + 1;

      await this.updateDeckStats(deckId, deltas);
    }
  }

  /** Update deck study stats by applying deltas and clamping to >= 0 */
  async updateDeckStats(userDeckId: string, deltas: { new?: number; learning?: number; review?: number; mastered?: number }): Promise<void> {
    const db = await this.getDb();
    const doUpdate = async () => {
      const current = await db.getFirstAsync<any>(
        'SELECT stats_new, stats_learning, stats_review, stats_mastered FROM user_decks WHERE id = ?',
        [userDeckId]
      );
      const curNew = Number(current?.stats_new ?? 0);
      const curLearning = Number(current?.stats_learning ?? 0);
      const curReview = Number(current?.stats_review ?? 0);
      const curMastered = Number(current?.stats_mastered ?? 0);

      const nextNew = Math.max(0, curNew + (deltas.new ?? 0));
      const nextLearning = Math.max(0, curLearning + (deltas.learning ?? 0));
      const nextReview = Math.max(0, curReview + (deltas.review ?? 0));
      const nextMastered = Math.max(0, curMastered + (deltas.mastered ?? 0));

      await db.runAsync(
        `UPDATE user_decks
         SET stats_new = ?, stats_learning = ?, stats_review = ?, stats_mastered = ?, stats_updated_at = datetime('now'), is_dirty = 1
         WHERE id = ?`,
        [nextNew, nextLearning, nextReview, nextMastered, userDeckId]
      );
    };

    try {
      await doUpdate();
    } catch (error: any) {
      const msg = String(error?.message || error);
      if (msg.includes('no such column')) {
        await this.ensureStatsColumns(db);
        await doUpdate();
      } else {
        console.error('Error updating deck stats:', error);
        throw error;
      }
    }
  }

  /** Clean up orphaned progress data (progress without corresponding flashcards) */
  async cleanupOrphanedProgress(): Promise<void> {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    
    const result = await db.runAsync(
      `DELETE FROM custom_flashcard_progress 
       WHERE flashcard_id NOT IN (
         SELECT id FROM custom_flashcards
       )`
    );
    
    console.log(`Cleaned up ${result.changes} orphaned progress records`);
  }

  /** Debug statistics before and after operations */
  async debugDeckStats(deckId: string, operation: string): Promise<void> {
    try {
      const db = await this.getDb();
      const deck = await db.getFirstAsync<any>(
        'SELECT id, deck_name, stats_new, stats_learning, stats_review, stats_mastered, stats_updated_at FROM user_decks WHERE id = ?',
        [deckId]
      );
      console.log(`📊 STATS ${operation}:`, {
        deck: deck?.deck_name || 'Unknown',
        new: deck?.stats_new,
        learning: deck?.stats_learning, 
        review: deck?.stats_review,
        mastered: deck?.stats_mastered,
        updated: deck?.stats_updated_at
      });
    } catch (e) {
      console.log('Failed to debug stats:', e);
    }
  }

  /** Fix deck names for custom decks (repair utility) */
  async fixCustomDeckNames(): Promise<void> {
    const db = await this.getDb();
    
    console.log('🔧 FIXING DECK NAMES - Starting...');
    
    // Debug: show problem decks before fix
    const problemDecks = await db.getAllAsync(`
      SELECT id, deck_name, custom_name, is_custom 
      FROM user_decks 
      WHERE is_custom = 1 AND (deck_name IS NULL OR deck_name = 'null' OR deck_name = '')
    `);
    console.log('🚨 Problem decks before fix:', problemDecks);
    
    // Fix deck_name from custom_name for custom decks
    const result1 = await db.runAsync(`
      UPDATE user_decks 
      SET deck_name = custom_name
      WHERE is_custom = 1 
        AND custom_name IS NOT NULL 
        AND custom_name != ''
        AND (deck_name IS NULL OR deck_name = 'null' OR deck_name = '')
    `);
    
    // Fix deck_name from custom_decks table
    const result2 = await db.runAsync(`
      UPDATE user_decks 
      SET deck_name = (
        SELECT cd.name FROM custom_decks cd 
        WHERE cd.id = user_decks.id
      )
      WHERE is_custom = 1 
        AND (deck_name IS NULL OR deck_name = 'null' OR deck_name = '')
        AND EXISTS (
          SELECT 1 FROM custom_decks cd 
          WHERE cd.id = user_decks.id AND cd.name IS NOT NULL
        )
    `);
    
    console.log(`✅ Fixed ${result1.changes + result2.changes} custom deck names`);
    
    // Debug: show decks after fix
    const decksAfterFix = await db.getAllAsync(`
      SELECT id, deck_name, custom_name, is_custom 
      FROM user_decks 
      WHERE is_custom = 1
    `);
    console.log('✅ All custom decks after fix:', decksAfterFix);
  }

  /** Recalculate deck stats from progress table (repair utility) */
  async recalculateDeckStats(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    await this.ensureProgressTable(db);
    const nowIso = new Date().toISOString();
    
    // Debug: show stats BEFORE recalculation
    await this.debugDeckStats(userDeckId, 'BEFORE RECALC');
    
    // Count each bucket according to learning flow:
    // 1. Nowe: karty bez progressu lub ze statusem 'new'
    const newRow = await db.getFirstAsync<any>(
      `SELECT COUNT(*) AS c FROM custom_flashcards f
        LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
       WHERE f.user_deck_id = ? AND (p.flashcard_id IS NULL OR p.status = 'new')`,
      [userDeckId]
    );
    
    // 2. Uczę się: karty ze statusem 'learning'
    const learningRow = await db.getFirstAsync<any>(
      `SELECT COUNT(*) AS c FROM custom_flashcards f
         JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
        WHERE f.user_deck_id = ? AND p.status = 'learning'`,
      [userDeckId]
    );
    
    // Simplify: remove review stats for now - just show new, learning, mastered
    const nextNew = Number(newRow?.c || 0);
    const nextLearning = Number(learningRow?.c || 0);
    const nextReview = 0; // Always 0 for now
    
    // 3. Opanowane: wszystkie inne karty (mastered + review)
    const masteredRow = await db.getFirstAsync<any>(
      `SELECT COUNT(*) AS c FROM custom_flashcards f
         JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
        WHERE f.user_deck_id = ? AND p.status IN ('mastered', 'review')`,
      [userDeckId]
    );
    const nextMastered = Number(masteredRow?.c || 0);

    console.log(`🔄 Recalculating deck ${userDeckId}: new=${nextNew}, learning=${nextLearning}, mastered=${nextMastered}`);

    await db.runAsync(
      `UPDATE user_decks
         SET stats_new = ?, stats_learning = ?, stats_review = ?, stats_mastered = ?, stats_updated_at = datetime('now'), is_dirty = 1
       WHERE id = ?`,
      [nextNew, nextLearning, nextReview, nextMastered, userDeckId]
    );
    
    // Debug: show stats AFTER recalculation  
    await this.debugDeckStats(userDeckId, 'AFTER RECALC');
  }

  /** Ensure progress table exists (safe to call repeatedly) */
  private async ensureProgressTable(db: SQLite.SQLiteDatabase): Promise<void> {
    // First create basic table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
        flashcard_id TEXT PRIMARY KEY,
        user_deck_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        correct_count INTEGER DEFAULT 0,
        incorrect_count INTEGER DEFAULT 0,
        next_review_at TEXT,
        last_reviewed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_progress_deck ON custom_flashcard_progress (user_deck_id);
      CREATE INDEX IF NOT EXISTS idx_progress_next_review ON custom_flashcard_progress (next_review_at);
    `);

    // Check and add missing columns one by one
    const columns = await db.getAllAsync<{name: string}>(`PRAGMA table_info(custom_flashcard_progress)`);
    const columnNames = columns.map(col => col.name);

    if (!columnNames.includes('repetition')) {
      await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN repetition INTEGER DEFAULT 0`);
    }

    if (!columnNames.includes('easiness_factor')) {
      await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN easiness_factor REAL DEFAULT 2.5`);
    }

    if (!columnNames.includes('interval_days')) {
      await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN interval_days INTEGER DEFAULT 1`);
    }

    if (!columnNames.includes('created_at')) {
      await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN created_at TEXT`);
    }

    if (!columnNames.includes('updated_at')) {
      await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN updated_at TEXT`);
    }

    // Update existing records that have NULL values in the new columns
    const nowIso = new Date().toISOString();
    await db.execAsync(`
      UPDATE custom_flashcard_progress 
      SET 
        repetition = COALESCE(repetition, 0),
        easiness_factor = COALESCE(easiness_factor, 2.5),
        interval_days = COALESCE(interval_days, 1),
        created_at = COALESCE(created_at, '${nowIso}'),
        updated_at = COALESCE(updated_at, '${nowIso}')
      WHERE repetition IS NULL OR easiness_factor IS NULL OR interval_days IS NULL 
        OR created_at IS NULL OR updated_at IS NULL;
    `);
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
          // Stats
          stats_new: row.stats_new ?? 0,
          stats_learning: row.stats_learning ?? 0,
          stats_review: row.stats_review ?? 0,
          stats_mastered: row.stats_mastered ?? 0,
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
   * Get a custom deck by id (from custom_decks)
   */
  async getCustomDeckById(id: string): Promise<CustomDeck | null> {
    try {
      const db = await this.getDb();
      const row = await db.getFirstAsync<any>('SELECT * FROM custom_decks WHERE id = ?', [id]);
      if (!row) return null;
      return {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        description: row.description,
        language: row.language,
        cover_image_url: row.cover_image_url,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as CustomDeck;
    } catch (error) {
      console.error('Error getting custom deck by id:', error);
      return null;
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
