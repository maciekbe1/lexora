import { BaseDatabaseService } from './base';

export class DebugSync extends BaseDatabaseService {
  async debugDeckUpdate(deckId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      console.log('🔍 DEBUG: Checking deck before and after update');
      
      // Get deck before
      const before = await db.getFirstAsync<any>(`
        SELECT id, deck_name, custom_name, deck_description, is_dirty, deck_updated_at
        FROM user_decks 
        WHERE id = ?
      `, [deckId]);
      
      console.log('📦 BEFORE UPDATE:', {
        id: before?.id,
        deck_name: before?.deck_name,
        custom_name: before?.custom_name,
        is_dirty: before?.is_dirty,
        deck_updated_at: before?.deck_updated_at
      });
      
      // Simulate an update
      const newName = `Test Update ${Date.now()}`;
      const newDesc = `Updated at ${new Date().toISOString()}`;
      const now = new Date().toISOString();
      
      await db.runAsync(`
        UPDATE user_decks 
        SET deck_name = ?, 
            deck_description = ?,
            deck_updated_at = ?,
            is_dirty = 1
        WHERE id = ?
      `, [newName, newDesc, now, deckId]);
      
      // Get deck after
      const after = await db.getFirstAsync<any>(`
        SELECT id, deck_name, custom_name, deck_description, is_dirty, deck_updated_at
        FROM user_decks 
        WHERE id = ?
      `, [deckId]);
      
      console.log('📦 AFTER UPDATE:', {
        id: after?.id,
        deck_name: after?.deck_name, 
        custom_name: after?.custom_name,
        is_dirty: after?.is_dirty,
        deck_updated_at: after?.deck_updated_at
      });
      
      // Check if the update was successful
      if (after?.deck_name === newName) {
        console.log('✅ Update successful - deck name changed');
      } else {
        console.log('❌ Update failed - deck name unchanged');
      }
      
    } catch (error) {
      console.error('❌ Debug error:', error);
    }
  }
  
  async listAllDecks(userId: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      const decks = await db.getAllAsync<any>(`
        SELECT id, deck_name, custom_name, is_custom, is_dirty 
        FROM user_decks 
        WHERE user_id = ?
        ORDER BY added_at DESC
      `, [userId]);
      
      console.log(`📚 Found ${decks.length} decks for user ${userId}:`);
      decks.forEach((deck: any) => {
        console.log(`  - ${deck.id}: "${deck.deck_name || deck.custom_name || 'Unnamed'}" (custom: ${deck.is_custom}, dirty: ${deck.is_dirty})`);
      });
    } catch (error) {
      console.error('❌ Error listing decks:', error);
    }
  }
}