import { BaseDatabaseService } from './base';
import * as SQLite from 'expo-sqlite';

export class DatabaseSchema extends BaseDatabaseService {
  private isInitialized = false;

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
          is_dirty INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS custom_flashcards (
          id TEXT PRIMARY KEY,
          user_deck_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          front_text TEXT NOT NULL,
          back_text TEXT NOT NULL,
          front_image_url TEXT,
          back_image_url TEXT,
          front_audio_url TEXT,
          back_audio_url TEXT,
          hint_text TEXT,
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_dirty INTEGER DEFAULT 1,
          FOREIGN KEY (user_deck_id) REFERENCES user_decks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
          flashcard_id TEXT PRIMARY KEY,
          user_deck_id TEXT,
          status TEXT DEFAULT 'new',
          last_reviewed_at TEXT,
          next_review_at TEXT,
          repetition INTEGER DEFAULT 0,
          easiness_factor REAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
          correct_count INTEGER DEFAULT 0,
          incorrect_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          is_dirty INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS template_flashcards (
          id TEXT PRIMARY KEY,
          template_deck_id TEXT NOT NULL,
          front_text TEXT NOT NULL,
          back_text TEXT NOT NULL,
          front_image_url TEXT,
          back_image_url TEXT,
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS deletion_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
          UNIQUE(type, entity_id)
        );
      `);

      // Run migrations
      await this.ensureStatsColumns(db);
      await this.migrateToUnifiedModel(db);
      await this.ensureProgressTable(db);
      await this.migrateDeletionQueue(db);
      
      // Fix legacy data
      await this.fixExistingCustomDecks(db);

      this.isInitialized = true;
      console.log('✅ Local database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize local database:', error);
      throw error;
    }
  }

  private async ensureStatsColumns(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      // Ensure user_decks columns
      const userDecksColumns = await db.getAllAsync(`SELECT name FROM pragma_table_info('user_decks')`);
      const userDecksColumnNames = userDecksColumns.map((col: any) => col.name);

      const requiredUserDecksColumns = [
        'deck_name', 'deck_description', 'deck_language', 'deck_cover_image_url',
        'deck_tags', 'deck_difficulty_level', 'deck_flashcard_count', 
        'deck_created_by', 'deck_is_active', 'deck_created_at', 'deck_updated_at',
        'stats_new', 'stats_learning', 'stats_review', 'stats_mastered', 'stats_updated_at'
      ];

      for (const column of requiredUserDecksColumns) {
        if (!userDecksColumnNames.includes(column)) {
          console.log(`Adding missing user_decks column: ${column}`);
          let columnType = 'TEXT DEFAULT ""';
          if (column.startsWith('stats_') || column === 'deck_difficulty_level' || column === 'deck_flashcard_count') {
            columnType = 'INTEGER DEFAULT 0';
          } else if (column === 'deck_is_active') {
            columnType = 'INTEGER DEFAULT 1';
          } else if (column.endsWith('_at')) {
            columnType = column === 'stats_updated_at' ? 'TEXT DEFAULT CURRENT_TIMESTAMP' : 'TEXT DEFAULT ""';
          } else if (column === 'deck_tags') {
            columnType = 'TEXT DEFAULT "[]"';
          }
          
          await db.execAsync(`ALTER TABLE user_decks ADD COLUMN ${column} ${columnType};`);
        }
      }

      // Ensure custom_flashcards columns
      const flashcardsColumns = await db.getAllAsync(`SELECT name FROM pragma_table_info('custom_flashcards')`);
      const flashcardsColumnNames = flashcardsColumns.map((col: any) => col.name);

      const requiredFlashcardsColumns = [
        'user_id', 'front_audio_url', 'back_audio_url', 'hint_text'
      ];

      for (const column of requiredFlashcardsColumns) {
        if (!flashcardsColumnNames.includes(column)) {
          console.log(`Adding missing custom_flashcards column: ${column}`);
          let columnType = 'TEXT';
          if (column === 'user_id') {
            columnType = 'TEXT NOT NULL DEFAULT ""';
          }
          
          await db.execAsync(`ALTER TABLE custom_flashcards ADD COLUMN ${column} ${columnType};`);
        }
      }

    } catch (error) {
      console.error('❌ Failed to ensure required columns:', error);
      throw new Error(`Failed to add required database columns: ${error}`);
    }
  }

  private async migrateToUnifiedModel(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      const userDecks = await db.getAllAsync<any>(`
        SELECT id, template_deck_id, is_custom, deck_name FROM user_decks 
        WHERE deck_name IS NULL OR deck_name = ''
      `);

      for (const deck of userDecks) {
        if (!deck.is_custom && deck.template_deck_id && (!deck.deck_name || deck.deck_name === '')) {
          console.log(`Checking template deck ${deck.template_deck_id} for unified data`);
          
          const templateDecks = await db.getAllAsync<any>(`
            SELECT * FROM template_flashcards WHERE template_deck_id = ?
          `, [deck.template_deck_id]);
          
          if (templateDecks.length > 0) {
            console.log(`Found ${templateDecks.length} template flashcards for deck ${deck.template_deck_id}`);
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Migration to unified model failed (this might be expected):', error);
    }
  }

  private async fixExistingCustomDecks(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      const customUserDecks = await db.getAllAsync<any>(`
        SELECT id, user_id FROM user_decks WHERE is_custom = 1 AND template_deck_id IS NOT NULL
      `);

      for (const userDeck of customUserDecks) {
        if (!userDeck.user_id) {
          console.warn(`⚠️ UserDeck ${userDeck.id} is missing user_id, skipping`);
          continue;
        }

        const deckExists = await db.getFirstAsync<any>(`
          SELECT id FROM custom_decks WHERE id = ?
        `, [userDeck.template_deck_id]);

        if (!deckExists) {
          console.log(`Creating missing custom deck for user_deck ${userDeck.id}`);
          
          const customDeck = {
            id: userDeck.template_deck_id || `custom_${Date.now()}`,
            user_id: userDeck.user_id,
            name: 'Custom Deck',
            description: '',
            language: 'en',
            cover_image_url: '',
            tags: '[]',
            is_active: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_dirty: 1
          };

          await db.runAsync(`
            INSERT OR IGNORE INTO custom_decks 
            (id, user_id, name, description, language, cover_image_url, tags, is_active, created_at, updated_at, is_dirty)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            customDeck.id,
            customDeck.user_id,
            customDeck.name,
            customDeck.description,
            customDeck.language,
            customDeck.cover_image_url,
            customDeck.tags,
            customDeck.is_active,
            customDeck.created_at,
            customDeck.updated_at,
            customDeck.is_dirty
          ]);
        }
      }

      // Fix missing user_id in custom_flashcards
      await this.fixCustomFlashcardUserIds(db);
      
    } catch (error) {
      console.error('❌ Failed to fix existing custom decks:', error);
      throw new Error(`Failed to fix custom deck data: ${error}`);
    }
  }

  private async ensureProgressTable(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
          flashcard_id TEXT PRIMARY KEY,
          user_deck_id TEXT,
          status TEXT DEFAULT 'new',
          last_reviewed_at TEXT,
          next_review_at TEXT,
          repetition INTEGER DEFAULT 0,
          easiness_factor REAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
          correct_count INTEGER DEFAULT 0,
          incorrect_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          is_dirty INTEGER DEFAULT 1
        );
      `);
      
      // Ensure all required columns exist (handles cases where table existed but was missing columns)
      const progressColumns = await db.getAllAsync(`SELECT name FROM pragma_table_info('custom_flashcard_progress')`);
      const progressColumnNames = progressColumns.map((col: any) => col.name);
      
      // Migrate old column names to new ones if they exist
      if (progressColumnNames.includes('last_study_date') && !progressColumnNames.includes('last_reviewed_at')) {
        console.log('Migrating last_study_date to last_reviewed_at');
        await db.execAsync(`ALTER TABLE custom_flashcard_progress RENAME COLUMN last_study_date TO last_reviewed_at;`);
      }
      if (progressColumnNames.includes('next_due_date') && !progressColumnNames.includes('next_review_at')) {
        console.log('Migrating next_due_date to next_review_at');
        await db.execAsync(`ALTER TABLE custom_flashcard_progress RENAME COLUMN next_due_date TO next_review_at;`);
      }
      if (progressColumnNames.includes('repetition_number') && !progressColumnNames.includes('repetition')) {
        console.log('Migrating repetition_number to repetition');
        await db.execAsync(`ALTER TABLE custom_flashcard_progress RENAME COLUMN repetition_number TO repetition;`);
      }
      
      // Re-fetch column names after migration
      const updatedProgressColumns = await db.getAllAsync(`SELECT name FROM pragma_table_info('custom_flashcard_progress')`);
      const updatedProgressColumnNames = updatedProgressColumns.map((col: any) => col.name);
      
      const requiredProgressColumns = [
        'user_deck_id', 'last_reviewed_at', 'next_review_at', 'repetition', 'easiness_factor', 'interval_days', 
        'correct_count', 'incorrect_count', 'created_at', 'updated_at', 'is_dirty'
      ];
      
      for (const column of requiredProgressColumns) {
        if (!updatedProgressColumnNames.includes(column)) {
          console.log(`Adding missing custom_flashcard_progress column: ${column}`);
          let columnType = 'TEXT';
          if (column === 'repetition' || column === 'interval_days') {
            columnType = 'INTEGER DEFAULT 1';
          } else if (column === 'is_dirty' || column === 'correct_count' || column === 'incorrect_count') {
            columnType = 'INTEGER DEFAULT 0';
          } else if (column === 'easiness_factor') {
            columnType = 'REAL DEFAULT 2.5';
          } else if (column === 'created_at' || column === 'updated_at') {
            columnType = 'TEXT DEFAULT CURRENT_TIMESTAMP';
          }
          
          await db.execAsync(`ALTER TABLE custom_flashcard_progress ADD COLUMN ${column} ${columnType};`);
        }
      }
      
      console.log('✅ Progress table ensured');
    } catch (error) {
      console.warn('⚠️ Progress table creation failed (might already exist):', error);
    }
  }

  private async migrateDeletionQueue(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      // Check if deletion_queue has the old schema (entity_type column)
      const columns = await db.getAllAsync(`SELECT name FROM pragma_table_info('deletion_queue')`);
      const columnNames = columns.map((col: any) => col.name);
      
      if (columnNames.includes('entity_type') && !columnNames.includes('type')) {
        console.log('🔄 Migrating deletion_queue table schema...');
        
        // Create the new table with correct schema
        await db.execAsync(`
          CREATE TABLE deletion_queue_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
            UNIQUE(type, entity_id)
          );
        `);
        
        // Copy data from old table to new table, mapping entity_type -> type
        await db.execAsync(`
          INSERT INTO deletion_queue_new (type, entity_id, created_at)
          SELECT entity_type, entity_id, strftime('%s', created_at) 
          FROM deletion_queue;
        `);
        
        // Drop old table and rename new table
        await db.execAsync(`DROP TABLE deletion_queue;`);
        await db.execAsync(`ALTER TABLE deletion_queue_new RENAME TO deletion_queue;`);
        
        console.log('✅ deletion_queue table migrated successfully');
      } else if (!columnNames.includes('type')) {
        // Table exists but doesn't have the type column - add it
        console.log('🔄 Adding type column to deletion_queue...');
        await db.execAsync(`ALTER TABLE deletion_queue ADD COLUMN type TEXT NOT NULL DEFAULT 'deck';`);
        console.log('✅ Type column added to deletion_queue');
      }
    } catch (error) {
      console.error('❌ Failed to migrate deletion_queue:', error);
      // Don't throw - continue with initialization
      console.warn('⚠️ deletion_queue migration failed, but continuing...');
    }
  }

  private async fixCustomFlashcardUserIds(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      console.log('🔧 Fixing missing user_id in custom_flashcards...');
      
      // Find flashcards missing user_id and get it from user_deck
      const flashcardsToFix = await db.getAllAsync<any>(`
        SELECT cf.id, ud.user_id 
        FROM custom_flashcards cf
        JOIN user_decks ud ON cf.user_deck_id = ud.id
        WHERE cf.user_id IS NULL OR cf.user_id = ''
      `);

      console.log(`Found ${flashcardsToFix.length} custom flashcards to fix`);
      
      for (const flashcard of flashcardsToFix) {
        if (!flashcard.user_id) {
          console.warn(`⚠️ Cannot fix flashcard ${flashcard.id} - user_deck missing user_id`);
          continue;
        }

        await db.runAsync(`
          UPDATE custom_flashcards 
          SET user_id = ? 
          WHERE id = ?
        `, [flashcard.user_id, flashcard.id]);
        
        console.log(`✅ Fixed user_id for flashcard ${flashcard.id}`);
      }
      
      console.log('✅ Custom flashcard user_ids fixed');
    } catch (error) {
      console.error('❌ Failed to fix custom flashcard user_ids:', error);
      throw new Error(`Failed to fix flashcard user_ids: ${error}`);
    }
  }
}