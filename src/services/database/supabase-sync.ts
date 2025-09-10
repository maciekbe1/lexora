import { supabase } from '../../../lib/supabase';

/**
 * Sync flashcards from Supabase to local database
 * This ensures we have the latest data from cloud
 */
export async function syncFlashcardsFromSupabase(userDeckId: string, db: any): Promise<boolean> {
  try {
    console.log(`🔄 Checking Supabase for latest flashcard data for deck ${userDeckId}...`);
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ User not authenticated, skipping Supabase sync');
      return false;
    }
    
    // Fetch flashcards from Supabase
    const { data: supabaseFlashcards, error } = await supabase
      .from('custom_flashcards')
      .select('*')
      .eq('user_deck_id', userDeckId)
      .eq('user_id', user.id)
      .order('position', { ascending: true });
    
    if (error) {
      console.error('❌ Failed to fetch flashcards from Supabase:', error);
      return false;
    }
    
    if (!supabaseFlashcards || supabaseFlashcards.length === 0) {
      console.log('⚠️ No flashcards found in Supabase for this deck');
      return false;
    }
    
    console.log(`📥 Found ${supabaseFlashcards.length} flashcards in Supabase`);
    
    // Update local database with Supabase data (without transaction to avoid nested transaction error)
    for (const flashcard of supabaseFlashcards) {
      await db.runAsync(`
        INSERT OR REPLACE INTO custom_flashcards (
          id, user_deck_id, user_id, front_text, back_text, 
          hint_text, front_image_url, back_image_url, 
          front_audio_url, back_audio_url, position, 
          created_at, updated_at, is_dirty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `, [
        flashcard.id,
        flashcard.user_deck_id,
        flashcard.user_id,
        flashcard.front_text,
        flashcard.back_text,
        flashcard.hint_text || '',
        flashcard.front_image_url || '',
        flashcard.back_image_url || '',
        flashcard.front_audio_url || '',
        flashcard.back_audio_url || '',
        flashcard.position,
        flashcard.created_at,
        flashcard.updated_at
      ]);
    }
    
    console.log(`✅ Successfully synced ${supabaseFlashcards.length} flashcards from Supabase to local database`);
    return true;
    
  } catch (error) {
    console.error('❌ Error syncing flashcards from Supabase:', error);
    return false;
  }
}

/**
 * Sync deck from Supabase to local database
 */
export async function syncDeckFromSupabase(deckId: string, db: any): Promise<boolean> {
  try {
    console.log(`🔄 Checking Supabase for latest deck data for ${deckId}...`);
    
    // Get user authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ User not authenticated, skipping Supabase sync');
      return false;
    }
    
    // Fetch deck from Supabase
    const { data: supabaseDeck, error } = await supabase
      .from('user_decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('❌ Failed to fetch deck from Supabase:', error);
      return false;
    }
    
    if (!supabaseDeck) {
      console.log('⚠️ Deck not found in Supabase');
      return false;
    }
    
    console.log(`📥 Found deck in Supabase: ${supabaseDeck.deck_name || 'Unnamed'}`);
    
    // Update local database with Supabase data
    await db.runAsync(`
      INSERT OR REPLACE INTO user_decks (
        id, user_id, template_deck_id, added_at, custom_name,
        is_favorite, is_custom, deck_name, deck_description,
        deck_language, deck_cover_image_url, deck_tags,
        deck_difficulty_level, deck_flashcard_count,
        deck_created_by, deck_is_active, deck_created_at,
        deck_updated_at, stats_new, stats_learning,
        stats_review, stats_mastered, stats_updated_at, is_dirty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [
      supabaseDeck.id,
      supabaseDeck.user_id,
      supabaseDeck.template_deck_id,
      supabaseDeck.added_at,
      supabaseDeck.custom_name,
      supabaseDeck.is_favorite || false,
      supabaseDeck.is_custom || false,
      supabaseDeck.deck_name,
      supabaseDeck.deck_description || '',
      supabaseDeck.deck_language,
      supabaseDeck.deck_cover_image_url || '',
      supabaseDeck.deck_tags || '[]',
      supabaseDeck.deck_difficulty_level || 1,
      supabaseDeck.deck_flashcard_count || 0,
      supabaseDeck.deck_created_by,
      supabaseDeck.deck_is_active !== false ? 1 : 0,
      supabaseDeck.deck_created_at,
      supabaseDeck.deck_updated_at,
      supabaseDeck.stats_new || 0,
      supabaseDeck.stats_learning || 0,
      supabaseDeck.stats_review || 0,
      supabaseDeck.stats_mastered || 0,
      supabaseDeck.stats_updated_at
    ]);
    
    console.log(`✅ Successfully synced deck from Supabase to local database`);
    return true;
    
  } catch (error) {
    console.error('❌ Error syncing deck from Supabase:', error);
    return false;
  }
}