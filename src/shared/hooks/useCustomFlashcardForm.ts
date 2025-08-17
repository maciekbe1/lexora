import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { CustomFlashcard, UserDeck } from '@/shared/types/flashcard';
import { translateText } from '@/shared/services/translation';

export interface UseCustomFlashcardFormParams {
  visible: boolean;
  userDecks: UserDeck[];
  preselectedDeckId?: string;
  editingFlashcard?: CustomFlashcard | null;
  onCreateFlashcard: (
    flashcard: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void> | void;
}

export function useCustomFlashcardForm({
  visible,
  userDecks,
  preselectedDeckId,
  editingFlashcard,
  onCreateFlashcard,
}: UseCustomFlashcardFormParams) {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>(preselectedDeckId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const backEditedManuallyRef = useRef(false);
  const lastAutoTranslationRef = useRef('');

  // Only custom decks are allowed here
  const customDecks = userDecks.filter((d) => d.is_custom);

  // Initialize/reset form on open
  useEffect(() => {
    if (!visible) return;

    if (editingFlashcard) {
      setFrontText(editingFlashcard.front_text);
      setBackText(editingFlashcard.back_text);
      setHintText(editingFlashcard.hint_text);
      setFrontImageUrl(editingFlashcard.front_image_url);
      setBackImageUrl(editingFlashcard.back_image_url);
      setSelectedDeck(editingFlashcard.user_deck_id);
    } else {
      setFrontText('');
      setBackText('');
      setHintText('');
      setFrontImageUrl('');
      setBackImageUrl('');
      backEditedManuallyRef.current = false;
      lastAutoTranslationRef.current = '';

      if (preselectedDeckId && customDecks.find((d) => d.id === preselectedDeckId)) {
        setSelectedDeck(preselectedDeckId);
      } else if (customDecks.length === 1) {
        setSelectedDeck(customDecks[0].id);
      } else {
        setSelectedDeck('');
      }
    }
    // Intentionally ignore deps to run only on visibility change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Debounced auto-translation (PL -> deck language) when creating
  useEffect(() => {
    if (!visible || editingFlashcard) return;
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const targetLang = deck?.deck_language || '';

    if (!targetLang || !frontText.trim()) return;

    setIsTranslating(true);
    const t = setTimeout(async () => {
      try {
        const translated = await translateText(frontText.trim(), 'pl', targetLang);
        const prevAuto = lastAutoTranslationRef.current;
        lastAutoTranslationRef.current = translated;
        const shouldWrite = !backEditedManuallyRef.current || !backText.trim() || backText === prevAuto;
        if (shouldWrite) {
          setBackText(translated);
        }
      } finally {
        setIsTranslating(false);
      }
    }, 500);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frontText, selectedDeck, visible]);

  const handleCreate = async () => {
    if (!frontText.trim()) {
      Alert.alert('Błąd', 'Tekst przedniej strony jest wymagany');
      return;
    }
    if (!backText.trim()) {
      Alert.alert('Błąd', 'Tekst tylnej strony jest wymagany');
      return;
    }
    if (!selectedDeck) {
      Alert.alert('Błąd', 'Wybierz talię dla fiszki');
      return;
    }

    setIsLoading(true);
    try {
      const deck = customDecks.find((d) => d.id === selectedDeck);
      if (!deck) throw new Error('Selected deck not found');

      const payload: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'> = {
        user_deck_id: selectedDeck,
        front_text: frontText.trim(),
        back_text: backText.trim(),
        hint_text: hintText.trim() || '',
        front_image_url: frontImageUrl || '',
        back_image_url: backImageUrl || '',
        front_audio_url: '',
        back_audio_url: '',
        position: 0,
        user_id: deck.user_id,
      };

      await onCreateFlashcard(payload);
      resetForm();
      return true;
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się utworzyć fiszki');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFrontText('');
    setBackText('');
    setHintText('');
    setFrontImageUrl('');
    setBackImageUrl('');
    if (!preselectedDeckId) setSelectedDeck('');
  };

  return {
    // data
    customDecks,

    // state
    frontText,
    backText,
    hintText,
    frontImageUrl,
    backImageUrl,
    selectedDeck,
    isLoading,
    isTranslating,

    // setters
    setFrontText,
    setBackText,
    setHintText,
    setFrontImageUrl,
    setBackImageUrl,
    setSelectedDeck,
    markBackEdited: () => (backEditedManuallyRef.current = true),

    // actions
    handleCreate,
    resetForm,
  };
}
