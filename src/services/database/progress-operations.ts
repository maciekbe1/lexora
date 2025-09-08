import { BaseDatabaseService } from './base';

export class ProgressOperations extends BaseDatabaseService {

  async getStudyQueue(deckId: string) {
    const db = await this.getDb();
    
    const userDeck = await db.getFirstAsync<any>(`
      SELECT * FROM user_decks WHERE id = ?
    `, [deckId]);
    
    if (!userDeck) {
      console.warn(`UserDeck not found: ${deckId}`);
      return [];
    }
    
    const isCustomDeck = userDeck.is_custom;
    
    let flashcards;
    if (isCustomDeck) {
      flashcards = await db.getAllAsync<any>(`
        SELECT 
          cf.id,
          cf.front_text,
          cf.back_text,
          cf.front_image_url,
          cf.back_image_url,
          cf.position,
          COALESCE(p.status, 'new') as progress_status,
          p.next_due_date,
          p.last_study_date,
          p.repetition_number,
          p.easiness_factor,
          p.interval_days
        FROM custom_flashcards cf
        LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = cf.id
        WHERE cf.user_deck_id = ?
        ORDER BY cf.position ASC
      `, [deckId]);
    } else {
      flashcards = await db.getAllAsync<any>(`
        SELECT 
          tf.id,
          tf.front_text,
          tf.back_text,
          tf.front_image_url,
          tf.back_image_url,
          tf.position,
          COALESCE(p.status, 'new') as progress_status,
          p.next_due_date,
          p.last_study_date,
          p.repetition_number,
          p.easiness_factor,
          p.interval_days
        FROM template_flashcards tf
        LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = tf.id
        WHERE tf.template_deck_id = ?
        ORDER BY tf.position ASC
      `, [userDeck.template_deck_id]);
    }
    
    console.log(`📚 Study queue for deck ${deckId}: ${flashcards.length} flashcards`);
    return flashcards;
  }

  async getDeckDueCount(deckId: string): Promise<number> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0];
    
    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM custom_flashcard_progress p
      JOIN custom_flashcards cf ON cf.id = p.flashcard_id
      WHERE cf.user_deck_id = ? AND (p.next_due_date <= ? OR p.next_due_date IS NULL)
    `, [deckId, today]);
    
    return result?.count || 0;
  }

  async getAllProgressData() {
    const db = await this.getDb();
    
    const rows = await db.getAllAsync<any>(`
      SELECT 
        flashcard_id, status, last_study_date, next_due_date,
        repetition_number, easiness_factor, interval_days, is_dirty
      FROM custom_flashcard_progress
      WHERE is_dirty = 1
    `);
    
    console.log(`📊 Retrieved ${rows.length} progress records for sync`);
    return rows;
  }

  async upsertProgressData(progress: any) {
    const db = await this.getDb();
    
    try {
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_flashcard_progress
        (flashcard_id, status, last_study_date, next_due_date, repetition_number, easiness_factor, interval_days, is_dirty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        progress.flashcard_id,
        progress.status || 'new',
        progress.last_study_date,
        progress.next_due_date,
        progress.repetition_number || 0,
        progress.easiness_factor || 2.5,
        progress.interval_days || 1,
        progress.is_dirty ?? 1
      ]);
      
      console.log(`✅ Progress upserted for flashcard: ${progress.flashcard_id}`);
    } catch (error) {
      console.error(`❌ Failed to upsert progress:`, error);
      throw error;
    }
  }

  async applyAnswer(_deckId: string, flashcardId: string, knew: boolean) {
    const db = await this.getDb();
    
    console.log(`🎯 Applying answer for flashcard ${flashcardId}: knew=${knew}`);
    
    const existingProgress = await db.getFirstAsync<any>(`
      SELECT * FROM custom_flashcard_progress WHERE flashcard_id = ?
    `, [flashcardId]);
    
    const now = new Date();
    const today = now.toISOString();
    
    let newStatus: string;
    let newRepetition: number;
    let newEasinessFactor: number;
    let newInterval: number;
    let nextDueDate: string;
    
    if (existingProgress) {
      newRepetition = existingProgress.repetition_number || 0;
      newEasinessFactor = existingProgress.easiness_factor || 2.5;
      newInterval = existingProgress.interval_days || 1;
    } else {
      newRepetition = 0;
      newEasinessFactor = 2.5;
      newInterval = 1;
    }
    
    if (knew) {
      newRepetition += 1;
      if (newRepetition === 1) {
        newInterval = 1;
        newStatus = 'learning';
      } else if (newRepetition === 2) {
        newInterval = 6;
        newStatus = 'learning';
      } else {
        newInterval = Math.round(newInterval * newEasinessFactor);
        newStatus = 'mastered';
      }
      
      newEasinessFactor = Math.max(1.3, newEasinessFactor + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02)));
    } else {
      newRepetition = 0;
      newInterval = 1;
      newStatus = 'new';
      newEasinessFactor = Math.max(1.3, newEasinessFactor - 0.2);
    }
    
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + newInterval);
    nextDueDate = nextDue.toISOString();
    
    await db.runAsync(`
      INSERT OR REPLACE INTO custom_flashcard_progress
      (flashcard_id, status, last_study_date, next_due_date, repetition_number, easiness_factor, interval_days, is_dirty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      flashcardId,
      newStatus,
      today,
      nextDueDate,
      newRepetition,
      newEasinessFactor,
      newInterval,
      1
    ]);
    
    console.log(`✅ Progress updated: ${newStatus}, next due: ${nextDueDate}, interval: ${newInterval}d`);
  }

  async cleanupOrphanedProgress(): Promise<void> {
    const db = await this.getDb();
    
    await db.runAsync(`
      DELETE FROM custom_flashcard_progress 
      WHERE flashcard_id NOT IN (
        SELECT id FROM custom_flashcards
        UNION
        SELECT id FROM template_flashcards
      )
    `);
    
    console.log('✅ Orphaned progress records cleaned up');
  }

  async debugDeckStats(deckId: string, operation: string): Promise<void> {
    const db = await this.getDb();
    
    const deck = await db.getFirstAsync<any>(`SELECT * FROM user_decks WHERE id = ?`, [deckId]);
    const progressCounts = await db.getAllAsync<any>(`
      SELECT 
        COALESCE(p.status, 'new') as status,
        COUNT(*) as count
      FROM custom_flashcards cf
      LEFT JOIN custom_flashcard_progress p ON p.flashcard_id = cf.id
      WHERE cf.user_deck_id = ?
      GROUP BY COALESCE(p.status, 'new')
    `, [deckId]);
    
    console.log(`📊 DEBUG ${operation} - Deck ${deckId}:`);
    console.log('  Stored stats:', { 
      new: deck?.stats_new, 
      learning: deck?.stats_learning, 
      review: deck?.stats_review, 
      mastered: deck?.stats_mastered 
    });
    console.log('  Actual counts:', progressCounts);
  }
}