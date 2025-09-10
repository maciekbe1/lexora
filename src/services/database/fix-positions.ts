/**
 * Fix flashcard positions that are 0 or invalid
 * Positions should start from 1, not 0
 */
export async function fixFlashcardPositions(db: any, userDeckId: string): Promise<void> {
  try {
    console.log(`🔧 Checking and fixing flashcard positions for deck ${userDeckId}...`);
    
    // Get all flashcards for this deck
    const flashcards = await db.getAllAsync(`
      SELECT id, position FROM custom_flashcards 
      WHERE user_deck_id = ? 
      ORDER BY position ASC, id ASC
    `, [userDeckId]);
    
    if (flashcards.length === 0) {
      console.log('✅ No flashcards to fix');
      return;
    }
    
    // Check if any positions need fixing
    const needsFix = flashcards.some((f: any, index: number) => 
      f.position === 0 || f.position !== index + 1
    );
    
    if (!needsFix) {
      console.log('✅ All positions are correct');
      return;
    }
    
    console.log(`🔧 Fixing positions for ${flashcards.length} flashcards...`);
    
    // Fix positions: ensure they start from 1 and are sequential
    // Don't use transaction here as this might be called within another transaction
    const now = new Date().toISOString();
    for (let i = 0; i < flashcards.length; i++) {
      const correctPosition = i + 1;
      if (flashcards[i].position !== correctPosition) {
        await db.runAsync(`
          UPDATE custom_flashcards 
          SET position = ?, updated_at = ?, is_dirty = 1
          WHERE id = ?
        `, [correctPosition, now, flashcards[i].id]);
        
        console.log(`  Fixed: ${flashcards[i].id} position ${flashcards[i].position} → ${correctPosition}`);
      }
    }
    
    console.log(`✅ Fixed positions for deck ${userDeckId}`);
    
  } catch (error) {
    console.error('❌ Error fixing flashcard positions:', error);
    throw error;
  }
}