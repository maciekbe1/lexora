import { BaseDatabaseService } from './base';

export class SyncOperations extends BaseDatabaseService {

  async getUnsyncedItems(): Promise<{
    userDecks: any[];
    customDecks: any[];
    customFlashcards: any[];
    progress: any[];
  }> {
    const db = await this.getDb();
    
    const [userDecks, customDecks, customFlashcards, progress] = await Promise.all([
      db.getAllAsync<any>('SELECT * FROM user_decks WHERE is_dirty = 1'),
      db.getAllAsync<any>('SELECT * FROM custom_decks WHERE is_dirty = 1'), 
      db.getAllAsync<any>('SELECT * FROM custom_flashcards WHERE is_dirty = 1'),
      db.getAllAsync<any>('SELECT * FROM custom_flashcard_progress WHERE is_dirty = 1')
    ]);
    
    console.log(`📤 Unsynced items: ${userDecks.length} user decks, ${customDecks.length} custom decks, ${customFlashcards.length} flashcards, ${progress.length} progress records`);
    
    return { userDecks, customDecks, customFlashcards, progress };
  }

  async enqueueDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    
    await db.runAsync(`
      INSERT OR REPLACE INTO deletion_queue (entity_type, entity_id)
      VALUES (?, ?)
    `, [entityType, entityId]);
    
    console.log(`🗑️ Enqueued deletion: ${entityType} ${entityId}`);
  }

  async getPendingDeletions(): Promise<Array<{entity_type: string, entity_id: string, record_id: string}>> {
    const db = await this.getDb();
    
    const rows = await db.getAllAsync<any>(`
      SELECT entity_type, entity_id, id as record_id FROM deletion_queue
    `);
    
    console.log(`🗑️ Found ${rows.length} pending deletions`);
    return rows;
  }

  async getDeletionQueue(): Promise<{ entity_type: string; entity_id: string }[]> {
    const db = await this.getDb();
    return await db.getAllAsync<any>('SELECT entity_type, entity_id FROM deletion_queue');
  }

  async clearDeletion(entityType: 'deck' | 'flashcard', entityId: string): Promise<void> {
    const db = await this.getDb();
    
    await db.runAsync(`
      DELETE FROM deletion_queue 
      WHERE entity_type = ? AND entity_id = ?
    `, [entityType, entityId]);
    
    console.log(`✅ Cleared deletion from queue: ${entityType} ${entityId}`);
  }

  async markAsSynced(table: string, ids: string[]): Promise<void> {
    const db = await this.getDb();
    
    if (ids.length === 0) return;
    
    const placeholders = ids.map(() => '?').join(',');
    
    await db.runAsync(`
      UPDATE ${table} 
      SET is_dirty = 0 
      WHERE id IN (${placeholders})
    `, ids);
    
    console.log(`✅ Marked ${ids.length} ${table} records as synced`);
  }
}