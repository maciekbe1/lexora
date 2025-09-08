import type { CustomDeck, UserDeck } from '@/types/flashcard';
import { BaseDatabaseService } from './base';

export class DeckOperations extends BaseDatabaseService {
  
  async insertUserDeck(deck: UserDeck): Promise<void> {
    const db = await this.getDb();
    
    try {
      await db.runAsync(`
        INSERT OR REPLACE INTO user_decks (
          id, user_id, template_deck_id, custom_name, is_favorite, is_custom, added_at,
          deck_name, deck_description, deck_language, deck_cover_image_url, deck_tags,
          deck_difficulty_level, deck_flashcard_count, deck_created_by, deck_is_active,
          deck_created_at, deck_updated_at, stats_new, stats_learning, stats_review, stats_mastered,
          is_dirty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        deck.id,
        deck.user_id,
        deck.template_deck_id || null,
        deck.custom_name || null,
        deck.is_favorite ? 1 : 0,
        deck.is_custom ? 1 : 0,
        deck.added_at,
        deck.deck_name || '',
        deck.deck_description || '',
        deck.deck_language || '',
        deck.deck_cover_image_url || '',
        JSON.stringify(deck.deck_tags || []),
        deck.deck_difficulty_level || 1,
        deck.deck_flashcard_count || 0,
        deck.deck_created_by || '',
        deck.deck_is_active ? 1 : 0,
        deck.deck_created_at || '',
        deck.deck_updated_at || '',
        deck.stats_new || 0,
        deck.stats_learning || 0,
        deck.stats_review || 0,
        deck.stats_mastered || 0,
        1
      ]);

      console.log(`✅ UserDeck inserted successfully: ${deck.deck_name} (${deck.id})`);
    } catch (error) {
      console.error(`❌ Failed to insert UserDeck:`, error);
      throw error;
    }
  }

  async insertCustomDeck(deck: CustomDeck): Promise<void> {
    const db = await this.getDb();
    
    try {
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_decks 
        (id, user_id, name, description, language, cover_image_url, tags, is_active, created_at, updated_at, is_dirty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        deck.id,
        deck.user_id,
        deck.name,
        deck.description || '',
        deck.language,
        deck.cover_image_url || '',
        JSON.stringify(deck.tags || []),
        deck.is_active ? 1 : 0,
        deck.created_at,
        deck.updated_at,
        1
      ]);
      
      console.log(`✅ CustomDeck inserted: ${deck.name}`);
    } catch (error) {
      console.error(`❌ Failed to insert CustomDeck:`, error);
      throw error;
    }
  }

  async deleteUserDeck(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    await db.runAsync(`DELETE FROM user_decks WHERE id = ?`, [userDeckId]);
    console.log(`✅ UserDeck deleted: ${userDeckId}`);
  }

  async updateDeckFlashcardCount(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM custom_flashcards 
      WHERE user_deck_id = ?
    `, [userDeckId]);
    
    const count = result?.count || 0;
    
    await db.runAsync(`
      UPDATE user_decks 
      SET deck_flashcard_count = ?, updated_at = ? 
      WHERE id = ?
    `, [count, new Date().toISOString(), userDeckId]);
    
    console.log(`✅ Updated deck flashcard count: ${count} for deck ${userDeckId}`);
  }

  async getUserDecks(userId: string): Promise<UserDeck[]> {
    const db = await this.getDb();
    
    const rows = await db.getAllAsync<any>(`
      SELECT * FROM user_decks 
      WHERE user_id = ? 
      ORDER BY added_at DESC
    `, [userId]);

    return rows.map(row => ({
      ...row,
      is_favorite: Boolean(row.is_favorite),
      is_custom: Boolean(row.is_custom),
      deck_is_active: Boolean(row.deck_is_active),
      deck_tags: JSON.parse(row.deck_tags || '[]')
    }));
  }

  async getCustomDeckById(id: string): Promise<CustomDeck | null> {
    const db = await this.getDb();
    
    const row = await db.getFirstAsync<any>(`
      SELECT * FROM custom_decks WHERE id = ?
    `, [id]);

    if (!row) return null;

    return {
      ...row,
      is_active: Boolean(row.is_active),
      tags: JSON.parse(row.tags || '[]')
    };
  }

  async updateDeckStats(userDeckId: string, deltas: { new?: number; learning?: number; review?: number; mastered?: number }): Promise<void> {
    const db = await this.getDb();
    
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
      SET ${updates.join(', ')}, updated_at = datetime('now') 
      WHERE id = ?
    `, values);
    
    console.log(`✅ Updated deck stats for ${userDeckId}:`, deltas);
  }

  async recalculateDeckStats(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
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
      SET stats_new = ?, stats_learning = ?, stats_review = ?, stats_mastered = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [nextNew, nextLearning, nextReview, nextMastered, userDeckId]);
    
    console.log(`✅ Deck statistics recalculated for: ${userDeckId}`);
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
        SET deck_name = ?
        WHERE id = ?
      `, [deckName, deck.id]);
      
      console.log(`✅ Fixed deck name for ${deck.id}: ${deckName}`);
    }
    
    console.log('✅ Custom deck names fixed');
  }
}