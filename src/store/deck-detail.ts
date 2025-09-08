import { localDatabase } from '@/services/local-database';
import type { CustomFlashcard, UserDeck } from '@/types/flashcard';
import { create } from 'zustand';

interface DeckDetailState {
  // Current deck data
  deck: UserDeck | null;
  flashcards: CustomFlashcard[];
  dueToday: number | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isDeleting: boolean;
  
  // Actions
  loadDeckData: (userId: string, deckId: string) => Promise<void>;
  refreshDeck: (userId: string, deckId: string) => Promise<void>;
  updateDeckData: (deck: UserDeck, flashcards: CustomFlashcard[], dueToday: number) => void;
  setDeleting: (deleting: boolean) => void;
  resetDeck: () => void;
}

export const useDeckDetailStore = create<DeckDetailState>((set, get) => ({
  // Initial state
  deck: null,
  flashcards: [],
  dueToday: null,
  isLoading: false,
  isRefreshing: false,
  isDeleting: false,

  // Load deck data (atomic update to prevent flashing)
  loadDeckData: async (userId: string, deckId: string) => {
    // Don't set isLoading to prevent flash during navigation
    
    try {
      // Load only essential data first for fastest render
      const userDecks = await localDatabase.getUserDecks(userId);
      const foundDeck = userDecks.find((d) => d.id === deckId);
      
      if (!foundDeck) {
        set({ deck: null, flashcards: [], dueToday: null });
        return;
      }

      // Load flashcards - custom or template
      const deckFlashcards = foundDeck.is_custom 
        ? await localDatabase.getCustomFlashcards(deckId)
        : await localDatabase.getTemplateFlashcards(foundDeck.template_deck_id!);

      // Fast update with essential data - use flashcard count as fallback
      set({
        deck: foundDeck,
        flashcards: deckFlashcards,
        dueToday: deckFlashcards.length, // Use total count temporarily
      });

      // Load due count in background and update
      localDatabase.getDeckDueCount(deckId)
        .then(dueCount => {
          set(state => ({ ...state, dueToday: dueCount }));
        })
        .catch(() => {
          // Keep the fallback value
        });
    } catch (error) {
      console.error('Error loading deck data:', error);
      set({ deck: null, flashcards: [], dueToday: null });
    }
    // Don't set isLoading: false to avoid extra re-renders
  },

  // Refresh deck data 
  refreshDeck: async (userId: string, deckId: string) => {
    set({ isRefreshing: true });
    await get().loadDeckData(userId, deckId);
    set({ isRefreshing: false });
  },

  // Update deck data after CRUD operations
  updateDeckData: (deck: UserDeck, flashcards: CustomFlashcard[], dueToday: number) => {
    set({ deck, flashcards, dueToday });
  },

  // Set deleting state
  setDeleting: (deleting: boolean) => {
    set({ isDeleting: deleting });
  },

  // Reset deck data (on unmount or error)
  resetDeck: () => {
    set({
      deck: null,
      flashcards: [],
      dueToday: null,
      isLoading: false,
      isRefreshing: false,
      isDeleting: false,
    });
  },
}));