import React from "react";
import { Alert } from "react-native";
import { supabase } from "../../../../../lib/supabase";
import type { TemplateDeck } from "@/shared/types/flashcard";

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
      if (templatesError) {
        console.error("Error fetching template decks:", templatesError);
        Alert.alert("Błąd", "Nie udało się załadować dostępnych tali");
        return;
      }
      const { data: userDecks, error: userDecksError } = await supabase
        .from("user_decks")
        .select("template_deck_id")
        .eq("user_id", userId);
      if (userDecksError) {
        console.error("Error fetching user decks:", userDecksError);
      }
      setTemplateDecks(templates || []);
      setUserDeckIds(new Set(userDecks?.map((ud) => ud.template_deck_id) || []));
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
        const { error } = await supabase.from("user_decks").insert({
          user_id: userId,
          template_deck_id: templateDeck.id,
        });
        if (error) {
          console.error("Error adding deck:", error);
          Alert.alert("Błąd", "Nie udało się dodać talii do kolekcji");
          return;
        }
        setUserDeckIds((prev) => new Set([...prev, templateDeck.id]));
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
  } as const;
}
