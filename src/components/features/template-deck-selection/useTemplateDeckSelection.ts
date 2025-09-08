import { localDatabase } from "@/services/local-database";
import type { TemplateDeck, UserDeck } from "@/types/flashcard";
import * as Crypto from "expo-crypto";
import React from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../lib/supabase";

export function useTemplateDeckSelection(userId?: string) {
  const [templateDecks, setTemplateDecks] = React.useState<TemplateDeck[]>([]);
  const [userDeckIds, setUserDeckIds] = React.useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("en");
  const [loading, setLoading] = React.useState(true);
  const [addingDeckId, setAddingDeckId] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data: templates, error: templatesError } = await supabase
        .from("template_decks")
        .select("*")
        .eq("is_active", true)
        .eq("language", selectedLanguage)
        .order("difficulty_level", { ascending: true });
      
      console.log(`🔍 Found ${templates?.length || 0} template decks for language '${selectedLanguage}'`);
      console.log('📝 Available template decks:', templates?.map(t => t.name) || []);
      if (templatesError) {
        console.error("Error fetching template decks:", templatesError);
        Alert.alert("Błąd", "Nie udało się załadować dostępnych tali");
        return;
      }
      const { data: userDecks, error: userDecksError } = await supabase
        .from("user_decks")
        .select("template_deck_id")
        .eq("user_id", userId)
        .not("template_deck_id", "is", null); // Only template decks, not custom ones
      if (userDecksError) {
        console.error("Error fetching user decks:", userDecksError);
      }
      
      setTemplateDecks(templates || []);
      const remoteDeckIds = userDecks?.map((ud) => ud.template_deck_id).filter(Boolean) || [];
      
      // Check deletion queue and filter out deleted decks
      const pendingDeletions = await localDatabase.getPendingDeletions();
      const deletionIds = new Set(pendingDeletions.filter(d => d.entity_type === 'deck').map(d => d.entity_id));
      
      // Filter out decks that are marked for deletion
      const activeDeckIds = remoteDeckIds.filter(id => !deletionIds.has(id));
      
      console.log(`👤 Found ${remoteDeckIds.length} user decks in remote database`);
      console.log(`🗑️ Found ${deletionIds.size} decks marked for deletion`);
      console.log('🔑 Active template deck IDs in collection:', activeDeckIds);
      setUserDeckIds(new Set(activeDeckIds));
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Błąd", "Wystąpił problem podczas ładowania danych");
    } finally {
      setLoading(false);
    }
  }, [selectedLanguage, userId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDeckToCollection = React.useCallback(
    async (templateDeck: TemplateDeck, onSuccess?: () => void) => {
      if (!userId || addingDeckId) return;
      setAddingDeckId(templateDeck.id);
      try {
        // Create user deck record for both remote and local
        const now = new Date().toISOString();
        const userDeckId = Crypto.randomUUID();
        const userDeck: UserDeck = {
          id: userDeckId, // Generate unique ID for user deck
          user_id: userId,
          template_deck_id: templateDeck.id,
          added_at: now,
          is_favorite: false,
          is_custom: false,
          
          // Unified deck data from template
          deck_name: templateDeck.name,
          deck_description: templateDeck.description || '',
          deck_language: templateDeck.language,
          deck_cover_image_url: templateDeck.cover_image_url || '',
          deck_tags: templateDeck.tags,
          deck_difficulty_level: templateDeck.difficulty_level,
          deck_flashcard_count: templateDeck.flashcard_count,
          deck_created_by: templateDeck.created_by === 'system' ? userId : templateDeck.created_by,
          deck_is_active: templateDeck.is_active,
          deck_created_at: templateDeck.created_at,
          deck_updated_at: templateDeck.updated_at,
          
          // Initialize stats
          stats_new: templateDeck.flashcard_count,
          stats_learning: 0,
          stats_review: 0,
          stats_mastered: 0,
        };
        
        // Insert to remote (Supabase)
        const { error } = await supabase.from("user_decks").insert(userDeck);
        if (error) {
          // Check if it's a duplicate key error (deck already exists)
          if (error.code === '23505') {
            console.log(`ℹ️ Deck already exists in remote database, skipping remote insert`);
            
            // Find the existing deck ID from remote database
            const { data: existingDecks } = await supabase
              .from("user_decks")
              .select("id")
              .eq("user_id", userId)
              .eq("template_deck_id", templateDeck.id);
              
            const existingDeckId = existingDecks?.[0]?.id;
            if (existingDeckId) {
              console.log(`🔍 Found existing deck ID: ${existingDeckId}, clearing from deletion queue`);
              await localDatabase.clearDeletion('deck', existingDeckId);
              console.log(`🔄 Removed deck ${existingDeckId} from deletion queue`);
              
              // Update userDeck to use existing ID for consistency
              userDeck.id = existingDeckId;
            } else {
              console.log(`⚠️ Could not find existing deck ID for template ${templateDeck.id}`);
            }
          } else {
            console.error("Error adding deck to remote:", error);
            Alert.alert("Błąd", "Nie udało się dodać talii do kolekcji");
            return;
          }
        } else {
          console.log(`✅ Successfully added deck to remote database`);
        }
        
        // Insert to local database
        console.log(`💾 Inserting UserDeck to local database: ${userDeck.deck_name}`);
        await localDatabase.insertUserDeck(userDeck);
        console.log(`✅ Successfully inserted UserDeck to local database`);
        
        // Fetch and insert template flashcards
        console.log(`🔍 Fetching template flashcards for deck ${templateDeck.id} (${templateDeck.name})`);
        const { data: templateFlashcards, error: flashcardsError } = await supabase
          .from("template_flashcards")
          .select("*")
          .eq("template_deck_id", templateDeck.id)
          .order("position", { ascending: true });
        
        if (flashcardsError) {
          console.error("❌ Error fetching template flashcards:", flashcardsError);
        } else {
          console.log(`📦 Found ${templateFlashcards?.length || 0} template flashcards`);
          if (templateFlashcards && templateFlashcards.length > 0) {
            // Insert flashcards to local database (they will be used by the study session)
            for (const flashcard of templateFlashcards) {
              console.log(`💾 Inserting flashcard: ${flashcard.front_text}`);
              await localDatabase.insertTemplateFlashcard(flashcard);
            }
            console.log(`✅ Added ${templateFlashcards.length} flashcards for template deck ${templateDeck.name}`);
          } else {
            console.log(`⚠️  No flashcards found for template deck ${templateDeck.name}`);
          }
        }
        
        setUserDeckIds((prev) => new Set([...prev, templateDeck.id]));
        console.log('🎉 Template deck addition completed, calling onSuccess callback');
        onSuccess?.();
      } catch (error) {
        console.error("Error adding deck:", error);
        Alert.alert("Błąd", "Wystąpił problem podczas dodawania talii");
      } finally {
        setAddingDeckId(null);
      }
    },
    [userId, addingDeckId]
  );

  return {
    templateDecks,
    userDeckIds,
    selectedLanguage,
    setSelectedLanguage,
    loading,
    addingDeckId,
    addDeckToCollection,
    refreshData: fetchData, // Export fetchData so we can call it manually
  } as const;
}
