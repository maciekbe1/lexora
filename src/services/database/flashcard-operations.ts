import type { CustomFlashcard } from '@/types/flashcard';
import { BaseDatabaseService } from './base';

export class FlashcardOperations extends BaseDatabaseService {

  async insertCustomFlashcard(flashcard: CustomFlashcard): Promise<void> {
    const db = await this.getDb();
    
    try {
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_flashcards 
        (id, user_deck_id, front_text, back_text, front_image_url, back_image_url, position, created_at, updated_at, is_dirty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        flashcard.id,
        flashcard.user_deck_id,
        flashcard.front_text,
        flashcard.back_text,
        flashcard.front_image_url || null,
        flashcard.back_image_url || null,
        flashcard.position,
        flashcard.created_at,
        flashcard.updated_at,
        1
      ]);
      
      console.log(`✅ CustomFlashcard inserted: ${flashcard.front_text}`);
    } catch (error) {
      console.error(`❌ Failed to insert CustomFlashcard:`, error);
      throw error;
    }
  }

  async getTemplateFlashcards(templateDeckId: string): Promise<any[]> {
    const db = await this.getDb();
    
    try {
      const rows = await db.getAllAsync<any>(`
        SELECT * FROM template_flashcards 
        WHERE template_deck_id = ? 
        ORDER BY position ASC
      `, [templateDeckId]);
      
      console.log(`📦 Retrieved ${rows.length} template flashcards for deck ${templateDeckId}`);
      return rows;
    } catch (error) {
      console.error(`❌ Failed to get template flashcards for ${templateDeckId}:`, error);
      return [];
    }
  }

  async insertTemplateFlashcard(flashcard: any): Promise<void> {
    const db = await this.getDb();
    
    try {
      await db.runAsync(`
        INSERT OR REPLACE INTO template_flashcards 
        (id, template_deck_id, front_text, back_text, front_image_url, back_image_url, position, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        flashcard.id,
        flashcard.template_deck_id,
        flashcard.front_text,
        flashcard.back_text,
        flashcard.front_image_url || null,
        flashcard.back_image_url || null,
        flashcard.position || 0,
        flashcard.created_at || new Date().toISOString(),
        flashcard.updated_at || new Date().toISOString()
      ]);
      
      console.log(`✅ TemplateFlashcard inserted: ${flashcard.front_text}`);
    } catch (error) {
      console.error(`❌ Failed to insert TemplateFlashcard:`, error);
      throw error;
    }
  }

  async getCustomFlashcards(userDeckId: string): Promise<CustomFlashcard[]> {
    const db = await this.getDb();
    
    const rows = await db.getAllAsync<any>(`
      SELECT * FROM custom_flashcards 
      WHERE user_deck_id = ? 
      ORDER BY position ASC
    `, [userDeckId]);

    console.log(`📦 Retrieved ${rows.length} custom flashcards for deck ${userDeckId}`);
    
    return rows.map(row => ({
      id: row.id,
      user_deck_id: row.user_deck_id,
      user_id: row.user_id || '',
      front_text: row.front_text,
      back_text: row.back_text,
      front_image_url: row.front_image_url,
      back_image_url: row.back_image_url,
      front_audio_url: row.front_audio_url,
      back_audio_url: row.back_audio_url,
      hint_text: row.hint_text,
      position: row.position,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }

  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    const db = await this.getDb();
    
    console.log(`🗑️ Clearing custom flashcard: ${flashcardId}`);
    
    await db.runAsync(`DELETE FROM custom_flashcards WHERE id = ?`, [flashcardId]);
    await db.runAsync(`DELETE FROM custom_flashcard_progress WHERE flashcard_id = ?`, [flashcardId]);
    
    console.log(`✅ Custom flashcard cleared: ${flashcardId}`);
  }
}