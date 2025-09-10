export interface TemplateDeck {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
  tags: string[];
  difficulty_level: number;
  flashcard_count: number;
  language: string; // Language code: en, pl, es, de, fr, it, etc
  is_active: boolean;
  created_by: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string; // Emoji flag
}

export interface UserDeck {
  id: string;
  user_id: string;
  template_deck_id?: string | null | undefined; // Optional for custom decks, can be null from database
  added_at: string;
  custom_name?: string | null | undefined;
  is_favorite: boolean | null; // Can be null from database
  is_custom: boolean | null; // Can be null from database

  // Unified deck data (populated for both template and custom decks)
  deck_name?: string | null | undefined;
  deck_description?: string | null | undefined;
  deck_language?: string | null | undefined;
  deck_cover_image_url?: string | null | undefined;
  deck_tags?: string[]; // Always an array after validation transformation
  deck_difficulty_level?: number | null | undefined;
  deck_flashcard_count?: number | null | undefined;
  deck_created_by?: string | null | undefined;
  deck_is_active?: boolean | null | undefined;
  deck_created_at?: string | null | undefined;
  deck_updated_at?: string | null | undefined;

  // Study stats (local)
  stats_new?: number | null | undefined;
  stats_learning?: number | null | undefined;
  stats_review?: number | null | undefined;
  stats_mastered?: number | null | undefined;
  due_today?: number; // computed locally for dashboard

}

// Custom deck created by user
export interface CustomDeck {
  id: string;
  user_id: string;
  name: string;
  description: string;
  language: string;
  cover_image_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface TemplateFlashcard {
  id: string;
  template_deck_id: string;
  front_text: string;
  back_text: string;
  position: number;
  created_at: string;
  updated_at: string;
  front_image_url?: string;
  back_image_url?: string;
  front_audio_url?: string;
  back_audio_url?: string;
  hint_text?: string;
}

// Custom flashcard created by user
export interface CustomFlashcard {
  id: string;
  user_deck_id: string; // Links to UserDeck (custom deck)
  front_text: string;
  back_text: string;
  position: number;
  created_at: string;
  updated_at: string;
  front_image_url: string;
  back_image_url: string;
  front_audio_url: string;
  back_audio_url: string;
  hint_text: string;
  user_id: string;
}

export interface DeckStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
}

export interface FlashcardStats {
  id: string;
  template_flashcard_id: string;
  user_id: string;
  easiness_factor: number;
  repetitions: number;
  interval_days: number;
  next_review_date: string;
  status: 'new' | 'learning' | 'review' | 'mastered';
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export type StudySession = {
  id: string;
  deck_id: string;
  started_at: string;
  completed_at?: string;
  cards_studied: number;
  correct_answers: number;
  user_id: string;
};
