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
    set({ isLoading: true });
    
    try {
      // Load all data in parallel
      const [userDecks, dueCount] = await Promise.all([
        localDatabase.getUserDecks(userId),
        localDatabase.getDeckDueCount(deckId).catch(() => 0)
      ]);

      const foundDeck = userDecks.find((d) => d.id === deckId);
      if (!foundDeck) {
        set({ deck: null, flashcards: [], dueToday: null });
        return;
      }

      // Load flashcards if it's a custom deck
      const deckFlashcards = foundDeck.is_custom 
        ? await localDatabase.getCustomFlashcards(deckId)
        : [];

      // Atomic update - all data at once to prevent visual jumps
      set({
        deck: foundDeck,
        flashcards: deckFlashcards,
        dueToday: dueCount,
      });
    } catch (error) {
      console.error('Error loading deck data:', error);
      set({ deck: null, flashcards: [], dueToday: null });
    } finally {
      set({ isLoading: false });
    }
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