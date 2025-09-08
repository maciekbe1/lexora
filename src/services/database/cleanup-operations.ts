import { BaseDatabaseService } from './base';

export class CleanupOperations extends BaseDatabaseService {

  async clearAllData(): Promise<void> {
    const db = await this.getDb();
    
    console.log('🧹 Clearing all local data...');
    
    await db.execAsync(`
      DELETE FROM custom_flashcard_progress;
      DELETE FROM custom_flashcards;
      DELETE FROM custom_decks;
      DELETE FROM user_decks;
      DELETE FROM template_flashcards;
      DELETE FROM deletion_queue;
    `);
    
    console.log('✅ All local data cleared');
  }

  async clearAllDecks(userId: string): Promise<void> {
    const db = await this.getDb();
    
    console.log(`🧹 Clearing all decks for user: ${userId}`);
    
    await db.runAsync(`
      DELETE FROM custom_flashcard_progress 
      WHERE flashcard_id IN (
        SELECT cf.id FROM custom_flashcards cf
        JOIN user_decks ud ON ud.id = cf.user_deck_id
        WHERE ud.user_id = ?
      )
    `, [userId]);
    
    await db.runAsync(`
      DELETE FROM custom_flashcards 
      WHERE user_deck_id IN (
        SELECT id FROM user_decks WHERE user_id = ?
      )
    `, [userId]);
    
    await db.runAsync(`DELETE FROM custom_decks WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_decks WHERE user_id = ?`, [userId]);
    
    console.log('✅ All user decks cleared');
  }

  async debugShowAllDecks(userId: string): Promise<void> {
    const db = await this.getDb();
    
    console.log(`\n🔍 DEBUG: All decks for user ${userId}`);
    
    const userDecks = await db.getAllAsync<any>(`
      SELECT id, deck_name, is_custom, template_deck_id, stats_new, stats_learning, stats_review, stats_mastered
      FROM user_decks 
      WHERE user_id = ?
      ORDER BY added_at DESC
    `, [userId]);
    
    console.log(`📋 Found ${userDecks.length} user decks:`);
    userDecks.forEach((deck, i) => {
      console.log(`  ${i + 1}. ${deck.deck_name} (${deck.is_custom ? 'custom' : 'template'}) - ID: ${deck.id}`);
      console.log(`     Template ID: ${deck.template_deck_id || 'N/A'}`);
      console.log(`     Stats: ${deck.stats_new} new, ${deck.stats_learning} learning, ${deck.stats_review} review, ${deck.stats_mastered} mastered`);
    });
    
    const customDecks = await db.getAllAsync<any>(`
      SELECT id, name, user_id FROM custom_decks WHERE user_id = ?
    `, [userId]);
    
    console.log(`📋 Found ${customDecks.length} custom decks:`);
    customDecks.forEach((deck, i) => {
      console.log(`  ${i + 1}. ${deck.name} - ID: ${deck.id}`);
    });
    
    const deletionQueue = await db.getAllAsync<any>(`
      SELECT entity_type, entity_id FROM deletion_queue
    `);
    
    console.log(`🗑️ Found ${deletionQueue.length} items in deletion queue:`);
    deletionQueue.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.entity_type}: ${item.entity_id}`);
    });
    
    console.log('🔍 DEBUG: End of deck listing\n');
  }

  async clearCustomFlashcard(flashcardId: string): Promise<void> {
    const db = await this.getDb();
    
    console.log(`🗑️ Clearing custom flashcard: ${flashcardId}`);
    
    await db.runAsync(`DELETE FROM custom_flashcards WHERE id = ?`, [flashcardId]);
    await db.runAsync(`DELETE FROM custom_flashcard_progress WHERE flashcard_id = ?`, [flashcardId]);
    
    console.log(`✅ Custom flashcard cleared: ${flashcardId}`);
  }

  async clearCustomDeck(deckId: string): Promise<void> {
    const db = await this.getDb();
    
    console.log(`🗑️ Clearing custom deck: ${deckId}`);
    
    await db.runAsync(`
      DELETE FROM custom_flashcard_progress 
      WHERE flashcard_id IN (
        SELECT id FROM custom_flashcards WHERE user_deck_id = ?
      )
    `, [deckId]);
    
    await db.runAsync(`DELETE FROM custom_flashcards WHERE user_deck_id = ?`, [deckId]);
    await db.runAsync(`DELETE FROM user_decks WHERE id = ?`, [deckId]);
    
    await db.runAsync(`DELETE FROM custom_decks WHERE id = ?`, [deckId]);
    
    console.log(`✅ Custom deck cleared: ${deckId}`);
  }
}