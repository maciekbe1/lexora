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
          front_text TEXT NOT NULL,
          back_text TEXT NOT NULL,
          front_image_url TEXT,
          back_image_url TEXT,
          position INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          is_dirty INTEGER DEFAULT 1,
          FOREIGN KEY (user_deck_id) REFERENCES user_decks(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
          flashcard_id TEXT PRIMARY KEY,
          status TEXT DEFAULT 'new',
          last_study_date TEXT,
          next_due_date TEXT,
          repetition_number INTEGER DEFAULT 0,
          easiness_factor REAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
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
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          UNIQUE(entity_type, entity_id)
        );
      `);

      // Run migrations
      await this.ensureStatsColumns(db);
      await this.migrateToUnifiedModel(db);
      await this.ensureProgressTable(db);
      
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
    const checkColumns = `
      SELECT name FROM pragma_table_info('user_decks');
    `;

    const existingColumns = await db.getAllAsync(checkColumns);
    const columnNames = existingColumns.map((col: any) => col.name);

    const requiredColumns = [
      'deck_name', 'deck_description', 'deck_language', 'deck_cover_image_url',
      'deck_tags', 'deck_difficulty_level', 'deck_flashcard_count', 
      'deck_created_by', 'deck_is_active', 'deck_created_at', 'deck_updated_at',
      'stats_new', 'stats_learning', 'stats_review', 'stats_mastered'
    ];

    for (const column of requiredColumns) {
      if (!columnNames.includes(column)) {
        console.log(`Adding missing column: ${column}`);
        let columnType = 'TEXT DEFAULT ""';
        if (column.startsWith('stats_') || column === 'deck_difficulty_level' || column === 'deck_flashcard_count') {
          columnType = 'INTEGER DEFAULT 0';
        } else if (column === 'deck_is_active') {
          columnType = 'INTEGER DEFAULT 1';
        } else if (column.endsWith('_at')) {
          columnType = 'TEXT DEFAULT ""';
        } else if (column === 'deck_tags') {
          columnType = 'TEXT DEFAULT "[]"';
        }
        
        await db.execAsync(`
          ALTER TABLE user_decks ADD COLUMN ${column} ${columnType};
        `);
      }
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
    const customUserDecks = await db.getAllAsync<any>(`
      SELECT id, user_id FROM user_decks WHERE is_custom = 1 AND template_deck_id IS NOT NULL
    `);

    for (const userDeck of customUserDecks) {
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
  }

  private async ensureProgressTable(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS custom_flashcard_progress (
          flashcard_id TEXT PRIMARY KEY,
          status TEXT DEFAULT 'new',
          last_study_date TEXT,
          next_due_date TEXT,
          repetition_number INTEGER DEFAULT 0,
          easiness_factor REAL DEFAULT 2.5,
          interval_days INTEGER DEFAULT 1,
          is_dirty INTEGER DEFAULT 1
        );
      `);
      console.log('✅ Progress table ensured');
    } catch (error) {
      console.warn('⚠️ Progress table creation failed (might already exist):', error);
    }
  }
}