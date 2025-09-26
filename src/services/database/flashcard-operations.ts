import type { CustomFlashcard } from '@/types/flashcard';
import { z } from 'zod';
import { BaseDatabaseService } from './base';

// Validation schemas
const CustomFlashcardSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  user_deck_id: z.string().min(1, 'User deck ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  front_text: z.string().min(1, 'Front text is required'),
  back_text: z.string().min(1, 'Back text is required'),
  front_image_url: z.string().optional(),
  back_image_url: z.string().optional(),
  front_audio_url: z.string().optional(),
  back_audio_url: z.string().optional(),
  hint_text: z.string().optional(),
  position: z.number().min(0, 'Position must be non-negative'),
  created_at: z.string().min(1, 'Created date is required'),
  updated_at: z.string().min(1, 'Updated date is required')
});

const TemplateFlashcardSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  template_deck_id: z.string().min(1, 'Template deck ID is required'),
  front_text: z.string().min(1, 'Front text is required'),
  back_text: z.string().min(1, 'Back text is required'),
  front_image_url: z.string().optional(),
  back_image_url: z.string().optional(),
  position: z.number().min(0, 'Position must be non-negative').default(0),
  created_at: z.string().default(() => new Date().toISOString()),
  updated_at: z.string().default(() => new Date().toISOString())
});

export class FlashcardOperations extends BaseDatabaseService {

  /**
   * Background sync for custom flashcards - call separately from loading
   * This ensures critical loading path remains fast like template decks
   */
  async syncCustomFlashcardsInBackground(userDeckId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      console.log(`🔄 Background sync for deck ${userDeckId}...`);
      
      // Position fixing removed - file no longer exists
      
      // Sync from Supabase in background
      try {
        const { syncFlashcardsFromSupabase } = await import('./supabase-sync');
        await syncFlashcardsFromSupabase(userDeckId, db);
      } catch (syncError) {
        console.log('⚠️ Background Supabase sync failed:', syncError);
      }
    } catch (error) {
      console.error('❌ Background sync error:', error);
    }
  }

  async insertCustomFlashcard(flashcard: CustomFlashcard): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input
      const validatedFlashcard = CustomFlashcardSchema.parse(flashcard);
      
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_flashcards 
        (id, user_deck_id, user_id, front_text, back_text, front_image_url, back_image_url, 
         front_audio_url, back_audio_url, hint_text, position, created_at, updated_at, is_dirty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        validatedFlashcard.id,
        validatedFlashcard.user_deck_id,
        validatedFlashcard.user_id,
        validatedFlashcard.front_text,
        validatedFlashcard.back_text,
        validatedFlashcard.front_image_url || null,
        validatedFlashcard.back_image_url || null,
        validatedFlashcard.front_audio_url || null,
        validatedFlashcard.back_audio_url || null,
        validatedFlashcard.hint_text || null,
        validatedFlashcard.position,
        validatedFlashcard.created_at,
        validatedFlashcard.updated_at,
        1
      ]);
      
      console.log(`✅ CustomFlashcard inserted: ${validatedFlashcard.front_text}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for CustomFlashcard: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to insert CustomFlashcard: ${error}`);
      throw new Error(`Failed to insert CustomFlashcard: ${error}`);
    }
  }

  async getTemplateFlashcards(templateDeckId: string): Promise<any[]> {
    const db = await this.getDb();
    
    try {
      if (!templateDeckId || typeof templateDeckId !== 'string') {
        throw new Error('Invalid templateDeckId: must be a non-empty string');
      }
      
      const rows = await db.getAllAsync<any>(`
        SELECT * FROM template_flashcards 
        WHERE template_deck_id = ? 
        ORDER BY position ASC
      `, [templateDeckId]);
      
      console.log(`📦 Retrieved ${rows.length} template flashcards for deck ${templateDeckId}`);
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get template flashcards for ${templateDeckId}: ${error}`);
      throw new Error(`Failed to get template flashcards: ${error}`);
    }
  }

  async insertTemplateFlashcard(flashcard: any): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Validate input
      const validatedFlashcard = TemplateFlashcardSchema.parse(flashcard);
      
      await db.runAsync(`
        INSERT OR REPLACE INTO template_flashcards 
        (id, template_deck_id, front_text, back_text, front_image_url, back_image_url, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        validatedFlashcard.id,
        validatedFlashcard.template_deck_id,
        validatedFlashcard.front_text,
        validatedFlashcard.back_text,
        validatedFlashcard.front_image_url || null,
        validatedFlashcard.back_image_url || null,
        validatedFlashcard.position,
        validatedFlashcard.created_at,
        validatedFlashcard.updated_at
      ]);
      
      console.log(`✅ TemplateFlashcard inserted: ${validatedFlashcard.front_text}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = `Validation failed for TemplateFlashcard: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
        console.error(`❌ ${errorMessage}`);
        throw new Error(errorMessage);
      }
      console.error(`❌ Failed to insert TemplateFlashcard: ${error}`);
      throw new Error(`Failed to insert TemplateFlashcard: ${error}`);
    }
  }

  async getCustomFlashcards(userDeckId: string): Promise<CustomFlashcard[]> {
    const db = await this.getDb();
    
    try {
      if (!userDeckId || typeof userDeckId !== 'string') {
        throw new Error('Invalid userDeckId: must be a non-empty string');
      }
      
      // Note: Position fixing and Supabase sync moved to background operations
      // for instant loading performance matching template decks
      
      const rows = await db.getAllAsync<any>(`
        SELECT * FROM custom_flashcards 
        WHERE user_deck_id = ? 
        ORDER BY position ASC
      `, [userDeckId]);

      console.log(`📦 Retrieved ${rows.length} custom flashcards for deck ${userDeckId}`);
      console.log('📋 Flashcard positions:', rows.map(r => ({ id: r.id, position: r.position, is_dirty: r.is_dirty })));
      
      return rows.map(row => ({
        id: row.id,
        user_deck_id: row.user_deck_id,
        user_id: row.user_id || '',
        front_text: row.front_text,
        back_text: row.back_text,
        front_image_url: row.front_image_url || '',
        back_image_url: row.back_image_url || '',
        front_audio_url: row.front_audio_url || '',
        back_audio_url: row.back_audio_url || '',
        hint_text: row.hint_text || '',
        position: row.position,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error(`❌ Failed to get custom flashcards for ${userDeckId}: ${error}`);
      throw new Error(`Failed to get custom flashcards: ${error}`);
    }
  }

  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (!flashcardId || typeof flashcardId !== 'string') {
        throw new Error('Invalid flashcardId: must be a non-empty string');
      }
      
      console.log(`🗑️ Clearing custom flashcard: ${flashcardId}`);
      
      await db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM custom_flashcards WHERE id = ?`, [flashcardId]);
        await db.runAsync(`DELETE FROM custom_flashcard_progress WHERE flashcard_id = ?`, [flashcardId]);
      });
      
      console.log(`✅ Custom flashcard cleared: ${flashcardId}`);
    } catch (error) {
      console.error(`❌ Failed to clear custom flashcard ${flashcardId}: ${error}`);
      throw new Error(`Failed to clear custom flashcard: ${error}`);
    }
  }

  async updateFlashcardPosition(flashcardId: string, newPosition: number): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (!flashcardId || typeof flashcardId !== 'string') {
        throw new Error('Invalid flashcardId: must be a non-empty string');
      }
      if (typeof newPosition !== 'number' || newPosition < 0) {
        throw new Error('Invalid newPosition: must be a non-negative number');
      }
      
      const result = await db.runAsync(`
        UPDATE custom_flashcards 
        SET position = ?, updated_at = ?, is_dirty = 1
        WHERE id = ?
      `, [newPosition, new Date().toISOString(), flashcardId]);
      
      if (result.changes === 0) {
        console.warn(`⚠️ No flashcard found to update position for: ${flashcardId}`);
      } else {
        console.log(`✅ Flashcard ${flashcardId} position updated to ${newPosition}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update flashcard position: ${error}`);
      throw new Error(`Failed to update flashcard position: ${error}`);
    }
  }

  async updateMultipleFlashcardPositions(updates: Array<{ id: string; position: number }>): Promise<void> {
    const db = await this.getDb();
    
    try {
      if (!Array.isArray(updates) || updates.length === 0) {
        console.log('⚠️ No updates to process');
        return;
      }
      
      // Validate updates
      for (const update of updates) {
        if (!update.id || typeof update.id !== 'string') {
          throw new Error(`Invalid update.id: must be a non-empty string`);
        }
        if (typeof update.position !== 'number' || update.position < 0) {
          throw new Error(`Invalid update.position for ${update.id}: must be a non-negative number`);
        }
      }
      
      await db.withTransactionAsync(async () => {
        const now = new Date().toISOString();
        for (const update of updates) {
          // Ensure position is never 0 (positions should start from 1)
          const validPosition = Math.max(1, update.position);
          await db.runAsync(`
            UPDATE custom_flashcards 
            SET position = ?, updated_at = ?, is_dirty = 1
            WHERE id = ?
          `, [validPosition, now, update.id]);
        }
      });
      
      console.log(`✅ Updated positions for ${updates.length} flashcards`);
    } catch (error) {
      console.error(`❌ Failed to update multiple flashcard positions: ${error}`);
      throw new Error(`Failed to update multiple flashcard positions: ${error}`);
    }
  }
}