import type { CustomDeck, UserDeck } from '@/types/flashcard';
import { BaseDatabaseService } from './base';
import { z } from 'zod';

// Data transformation utilities
const transformDeckTags = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (value === '' || value === 'null' || value === 'undefined') return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const transformNullableString = (value: any): string | null => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return typeof value === 'string' ? value : null;
};

const transformNullableNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
};

const transformNullableBoolean = (value: any): boolean | null => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
  }
  return null;
};

// Updated validation schema that handles database nulls and JSON strings
const UserDeckSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  template_deck_id: z.preprocess(transformNullableString, z.string().nullable().optional()),
  custom_name: z.preprocess(transformNullableString, z.string().nullable().optional()),
  is_favorite: z.preprocess(transformNullableBoolean, z.boolean().nullable().default(false)),
  is_custom: z.preprocess(transformNullableBoolean, z.boolean().nullable().default(false)),
  added_at: z.string().min(1, 'Added date is required'),
  deck_name: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_description: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_language: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_cover_image_url: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_tags: z.preprocess(transformDeckTags, z.array(z.string()).default([])),
  deck_difficulty_level: z.preprocess(transformNullableNumber, z.number().min(1).max(5).nullable().optional()),
  deck_flashcard_count: z.preprocess(transformNullableNumber, z.number().min(0).nullable().optional()),
  deck_created_by: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_is_active: z.preprocess(transformNullableBoolean, z.boolean().nullable().optional()),
  deck_created_at: z.preprocess(transformNullableString, z.string().nullable().optional()),
  deck_updated_at: z.preprocess(transformNullableString, z.string().nullable().optional()),
  stats_new: z.preprocess(transformNullableNumber, z.number().min(0).nullable().optional()),
  stats_learning: z.preprocess(transformNullableNumber, z.number().min(0).nullable().optional()),
  stats_review: z.preprocess(transformNullableNumber, z.number().min(0).nullable().optional()),
  stats_mastered: z.preprocess(transformNullableNumber, z.number().min(0).nullable().optional())
});

// Validation helper with better error reporting
export const validateUserDeck = (data: any): { success: true; data: z.infer<typeof UserDeckSchema> } | { success: false; error: string; details: string[] } => {
  try {
    const result = UserDeckSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        return `${path}${issue.message}`;
      });
      const mainError = `UserDeck validation failed: ${details[0]}`;
      return { success: false, error: mainError, details };
    }
    return { success: false, error: 'Unknown validation error', details: [String(error)] };
  }
};

const CustomDeckSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  language: z.string().min(1, 'Language is required'),
  cover_image_url: z.string().default(''),
  tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  created_at: z.string().min(1, 'Created date is required'),
  updated_at: z.string().min(1, 'Updated date is required')
});

export class DeckOperations extends BaseDatabaseService {
  
  async insertUserDeck(deck: UserDeck): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input using new validation helper
      const validation = validateUserDeck(deck);
      if (!validation.success) {
        console.error(`❌ ${validation.error}`, validation.details);
        throw new Error(validation.error);
      }
      
      const validatedDeck = validation.data;
      
      await db.runAsync(`
        INSERT OR REPLACE INTO user_decks (
          id, user_id, template_deck_id, custom_name, is_favorite, is_custom, added_at,
          deck_name, deck_description, deck_language, deck_cover_image_url, deck_tags,
          deck_difficulty_level, deck_flashcard_count, deck_created_by, deck_is_active,
          deck_created_at, deck_updated_at, stats_new, stats_learning, stats_review, stats_mastered,
          is_dirty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        validatedDeck.id,
        validatedDeck.user_id,
        validatedDeck.template_deck_id || null,
        validatedDeck.custom_name || null,
        validatedDeck.is_favorite ? 1 : 0,
        validatedDeck.is_custom ? 1 : 0,
        validatedDeck.added_at,
        validatedDeck.deck_name || '',
        validatedDeck.deck_description || '',
        validatedDeck.deck_language || '',
        validatedDeck.deck_cover_image_url || '',
        JSON.stringify(validatedDeck.deck_tags || []),
        validatedDeck.deck_difficulty_level || 1,
        validatedDeck.deck_flashcard_count || 0,
        validatedDeck.deck_created_by || '',
        validatedDeck.deck_is_active !== null && validatedDeck.deck_is_active !== undefined ? (validatedDeck.deck_is_active ? 1 : 0) : null,
        validatedDeck.deck_created_at || '',
        validatedDeck.deck_updated_at || '',
        validatedDeck.stats_new || 0,
        validatedDeck.stats_learning || 0,
        validatedDeck.stats_review || 0,
        validatedDeck.stats_mastered || 0,
        1
      ]);

      console.log(`✅ UserDeck inserted successfully: ${validatedDeck.deck_name || 'Unnamed'} (${validatedDeck.id})`);
    } catch (error) {
      // Error handling is now done in validateUserDeck
      console.error(`❌ Failed to insert UserDeck: ${error}`);
      throw new Error(`Failed to insert UserDeck: ${error}`);
    }
  }

  async insertCustomDeck(deck: CustomDeck): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input
      const validatedDeck = CustomDeckSchema.parse(deck);
      
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_decks 
        (id, user_id, name, description, language, cover_image_url, tags, is_active, created_at, updated_at, is_dirty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        validatedDeck.id,
        validatedDeck.user_id,
        validatedDeck.name,
        validatedDeck.description,
        validatedDeck.language,
        validatedDeck.cover_image_url,
        JSON.stringify(validatedDeck.tags),
        validatedDeck.is_active ? 1 : 0,
        validatedDeck.created_at,
        validatedDeck.updated_at,
        1
      ]);
      
      console.log(`✅ CustomDeck inserted: ${validatedDeck.name}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for CustomDeck: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to insert CustomDeck: ${error}`);
      throw new Error(`Failed to insert CustomDeck: ${error}`);
    }
  }

  async deleteUserDeck(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (!userDeckId || typeof userDeckId !== 'string') {
        throw new Error('Invalid userDeckId: must be a non-empty string');
      }
      
      const result = await db.runAsync(`DELETE FROM user_decks WHERE id = ?`, [userDeckId]);
      
      if (result.changes === 0) {
        console.warn(`⚠️ No UserDeck found with id: ${userDeckId}`);
      } else {
        console.log(`✅ UserDeck deleted: ${userDeckId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete UserDeck ${userDeckId}:`, error);
      throw new Error(`Failed to delete UserDeck: ${error}`);
    }
  }

  async updateDeckFlashcardCount(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (!userDeckId || typeof userDeckId !== 'string') {
        throw new Error('Invalid userDeckId: must be a non-empty string');
      }
      
      const result = await db.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM custom_flashcards 
        WHERE user_deck_id = ?
      `, [userDeckId]);
      
      const count = result?.count || 0;
      
      const updateResult = await db.runAsync(`
        UPDATE user_decks 
        SET deck_flashcard_count = ?, deck_updated_at = ? 
        WHERE id = ?
      `, [count, new Date().toISOString(), userDeckId]);
      
      if (updateResult.changes === 0) {
        console.warn(`⚠️ No UserDeck found to update flashcard count for: ${userDeckId}`);
      } else {
        console.log(`✅ Updated deck flashcard count: ${count} for deck ${userDeckId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update deck flashcard count for ${userDeckId}:`, error);
      throw new Error(`Failed to update deck flashcard count: ${error}`);
    }
  }

  async getUserDecks(userId: string): Promise<UserDeck[]> {
    const db = await this.getDb();
    
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId: must be a non-empty string');
      }
      
      const rows = await db.getAllAsync<any>(`
        SELECT * FROM user_decks 
        WHERE user_id = ? 
        ORDER BY added_at DESC
      `, [userId]);

      // Transform and validate each row using our comprehensive validation system
      return rows.map(row => {
        const validation = validateUserDeck(row);
        if (validation.success) {
          return validation.data;
        } else {
          console.warn(`⚠️ UserDeck validation failed during query for deck ${row.id}:`, validation.details);
          // Return fallback data - better to return partially valid data than fail completely
          return {
            id: row.id || '',
            user_id: row.user_id || userId,
            template_deck_id: row.template_deck_id || null,
            custom_name: row.custom_name || null,
            is_favorite: row.is_favorite ? Boolean(row.is_favorite) : null,
            is_custom: row.is_custom ? Boolean(row.is_custom) : null,
            added_at: row.added_at || new Date().toISOString(),
            deck_name: row.deck_name || null,
            deck_description: row.deck_description || null,
            deck_language: row.deck_language || null,
            deck_cover_image_url: row.deck_cover_image_url || null,
            deck_tags: [], // Safe fallback for failed tag parsing
            deck_difficulty_level: row.deck_difficulty_level || null,
            deck_flashcard_count: row.deck_flashcard_count || null,
            deck_created_by: row.deck_created_by || null,
            deck_is_active: row.deck_is_active ? Boolean(row.deck_is_active) : null,
            deck_created_at: row.deck_created_at || null,
            deck_updated_at: row.deck_updated_at || null,
            stats_new: row.stats_new || null,
            stats_learning: row.stats_learning || null,
            stats_review: row.stats_review || null,
            stats_mastered: row.stats_mastered || null
          } as UserDeck;
        }
      });
    } catch (error) {
      console.error(`❌ Failed to get user decks for ${userId}:`, error);
      // Return empty array instead of throwing to make calling code more resilient
      return [];
    }
  }

  async getCustomDeckById(id: string): Promise<CustomDeck | null> {
    const db = await this.getDb();
    
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid id: must be a non-empty string');
      }
      
      const row = await db.getFirstAsync<any>(`
        SELECT * FROM custom_decks WHERE id = ?
      `, [id]);

      if (!row) return null;

      try {
        return {
          ...row,
          is_active: Boolean(row.is_active),
          tags: JSON.parse(row.tags || '[]')
        };
      } catch (parseError) {
        console.error(`❌ Failed to parse tags for custom deck ${id}:`, parseError);
        return {
          ...row,
          is_active: Boolean(row.is_active),
          tags: []
        };
      }
    } catch (error) {
      console.error(`❌ Failed to get custom deck ${id}:`, error);
      // Return null instead of throwing to make calling code more resilient
      return null;
    }
  }

  async updateDeckStats(userDeckId: string, deltas: { new?: number; learning?: number; review?: number; mastered?: number }): Promise<void> {
    const db = await this.getDb();
    
    try {
      const updates: string[] = [];
      const values: any[] = [];
      
      if (deltas.new !== undefined) {
        updates.push('stats_new = stats_new + ?');
        values.push(deltas.new);
      }
      if (deltas.learning !== undefined) {
        updates.push('stats_learning = stats_learning + ?');
        values.push(deltas.learning);
      }
      if (deltas.review !== undefined) {
        updates.push('stats_review = stats_review + ?');
        values.push(deltas.review);
      }
      if (deltas.mastered !== undefined) {
        updates.push('stats_mastered = stats_mastered + ?');
        values.push(deltas.mastered);
      }
      
      if (updates.length === 0) return;
      
      values.push(userDeckId);
      
      await db.runAsync(`
        UPDATE user_decks 
        SET ${updates.join(', ')}, deck_updated_at = datetime('now') 
        WHERE id = ?
      `, values);
      
      console.log(`✅ Updated deck stats for ${userDeckId}:`, deltas);
    } catch (error) {
      console.error(`❌ Failed to update deck stats for ${userDeckId}:`, error);
      throw new Error(`Failed to update deck stats: ${error}`);
    }
  }

  async recalculateDeckStats(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      console.log(`🔄 Recalculating deck stats for: ${userDeckId}`);
      
      const userDeck = await db.getFirstAsync<any>(`
        SELECT * FROM user_decks WHERE id = ?
      `, [userDeckId]);
      
      if (!userDeck) {
        console.warn(`⚠️ UserDeck not found: ${userDeckId}`);
        return;
      }
      
      const isTemplateDeck = userDeck.template_deck_id && !userDeck.is_custom;
      
      let newRow, learningRow, masteredRow;
      
      if (isTemplateDeck) {
        newRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM template_flashcards f
            LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
           WHERE f.template_deck_id = ? AND (p.flashcard_id IS NULL OR p.status = 'new')`,
          [userDeck.template_deck_id]
        );
        
        learningRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM template_flashcards f
             JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
            WHERE f.template_deck_id = ? AND p.status = 'learning'`,
          [userDeck.template_deck_id]
        );
        
        masteredRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM template_flashcards f
             JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
            WHERE f.template_deck_id = ? AND p.status IN ('mastered', 'review')`,
          [userDeck.template_deck_id]
        );
      } else {
        newRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM custom_flashcards f
            LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
           WHERE f.user_deck_id = ? AND (p.flashcard_id IS NULL OR p.status = 'new')`,
          [userDeckId]
        );
        
        learningRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM custom_flashcards f
             JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
            WHERE f.user_deck_id = ? AND p.status = 'learning'`,
          [userDeckId]
        );
        
        masteredRow = await db.getFirstAsync<any>(
          `SELECT COUNT(*) AS c FROM custom_flashcards f
             JOIN custom_flashcard_progress p ON p.flashcard_id = f.id
            WHERE f.user_deck_id = ? AND p.status IN ('mastered', 'review')`,
          [userDeckId]
        );
      }
      
      const nextNew = Number(newRow?.c || 0);
      const nextLearning = Number(learningRow?.c || 0);
      const nextReview = 0;
      const nextMastered = Number(masteredRow?.c || 0);
      
      console.log(`📊 Recalculated stats for deck ${userDeckId}:`, {
        new: nextNew,
        learning: nextLearning,
        review: nextReview,
        mastered: nextMastered,
        isTemplate: isTemplateDeck
      });
      
      await db.runAsync(`
        UPDATE user_decks 
        SET stats_new = ?, stats_learning = ?, stats_review = ?, stats_mastered = ?, deck_updated_at = datetime('now')
        WHERE id = ?
      `, [nextNew, nextLearning, nextReview, nextMastered, userDeckId]);
      
      console.log(`✅ Deck statistics recalculated for: ${userDeckId}`);
    } catch (error) {
      console.error(`❌ Failed to recalculate deck stats for ${userDeckId}:`, error);
      // Don't throw - this is often called during cleanup and shouldn't block other operations
      console.warn(`⚠️ Continuing despite deck stats recalculation failure for ${userDeckId}`);
    }
  }

  async fixCustomDeckNames(): Promise<void> {
    const db = await this.getDb();
    
    console.log('🔧 Fixing custom deck names...');
    
    const customUserDecks = await db.getAllAsync<any>(`
      SELECT ud.*, cd.name as custom_deck_name 
      FROM user_decks ud
      LEFT JOIN custom_decks cd ON cd.id = ud.template_deck_id
      WHERE ud.is_custom = 1
    `);
    
    console.log(`Found ${customUserDecks.length} custom decks to fix`);
    
    for (const deck of customUserDecks) {
      const deckName = deck.custom_deck_name || deck.deck_name || 'Custom Deck';
      
      await db.runAsync(`
        UPDATE user_decks 
        SET deck_name = ?, deck_updated_at = datetime('now')
        WHERE id = ?
      `, [deckName, deck.id]);
      
      console.log(`✅ Fixed deck name for ${deck.id}: ${deckName}`);
    }
    
    console.log('✅ Custom deck names fixed');
  }
}