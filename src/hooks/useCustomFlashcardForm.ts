import { localDatabase } from '@/services/local-database';
import { translateText } from '@/services/translation';
import type { CustomFlashcard, UserDeck } from '@/types/flashcard';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

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
  const normalizeLangCode = (code?: string) => {
    if (!code) return '';
    const c = code.toLowerCase();
    if (c.startsWith('en')) return 'en';
    if (c.startsWith('es')) return 'es';
    if (c.startsWith('de')) return 'de';
    if (c.startsWith('fr')) return 'fr';
    if (c.startsWith('it')) return 'it';
    if (c.startsWith('pl')) return 'pl';
    return c.slice(0,2);
  };
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>(preselectedDeckId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLangOverride, setTargetLangOverride] = useState<string | null>(null);

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
      setSelectedDeck(editingFlashcard.user_deck_id);
    } else {
      setFrontText('');
      setBackText('');
      setHintText('');
      setFrontImageUrl('');
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
  }, [visible]);

  // Debounced auto-translation (PL -> deck language or override)
  useEffect(() => {
    if (!visible) return;
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const targetLang = normalizeLangCode(targetLangOverride || deck?.deck_language || undefined);

    if (!targetLang || !frontText.trim()) return;

    setIsTranslating(true);
    const t = setTimeout(async () => {
      try {
        const translated = await translateText(frontText.trim(), 'pl', targetLang);
        const prevAuto = lastAutoTranslationRef.current;
        lastAutoTranslationRef.current = translated;
        // In editing mode, still allow auto-translate if user hasn't edited back manually or it's equal to previous auto value
        const shouldWrite = !backEditedManuallyRef.current || !backText.trim() || backText === prevAuto;
        if (shouldWrite) {
          setBackText(translated);
        }
      } finally {
        setIsTranslating(false);
      }
    }, 500);

    return () => clearTimeout(t);
  }, [frontText, selectedDeck, targetLangOverride, visible, editingFlashcard]);

  // Fallback: if deck_language missing on the selected deck, try to read from custom_decks
  useEffect(() => {
    if (!visible || !selectedDeck) return;
    (async () => {
      const deck = customDecks.find((d) => d.id === selectedDeck);
      const existing = normalizeLangCode(deck?.deck_language || undefined);
      if (!existing) {
        const cd = await localDatabase.getCustomDeckById(selectedDeck);
        const lang = normalizeLangCode(cd?.language);
        if (lang) {
          setTargetLangOverride(lang);
        }
      }
    })();
  }, [visible, selectedDeck]);

  // Imperative translate action (for editing or manual trigger)
  const translateNow = async (opts?: { force?: boolean }) => {
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const targetLang = normalizeLangCode(targetLangOverride || deck?.deck_language || undefined);
    if (!targetLang || !frontText.trim()) return;
    setIsTranslating(true);
    try {
      const translated = await translateText(frontText.trim(), 'pl', targetLang);
      const prevAuto = lastAutoTranslationRef.current;
      lastAutoTranslationRef.current = translated;
      const shouldWrite = opts?.force || !backEditedManuallyRef.current || !backText.trim() || backText === prevAuto;
      if (shouldWrite) {
        setBackText(translated);
      }
    } finally {
      setIsTranslating(false);
    }
  };

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
        back_image_url: '',
        front_audio_url: '',
        back_audio_url: '',
        position: 0,
        user_id: deck.user_id,
      };

      await onCreateFlashcard(payload);
      resetForm();
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (!preselectedDeckId) setSelectedDeck('');
  };

  return {
    // data
    customDecks,
    targetLang: normalizeLangCode(
      targetLangOverride || customDecks.find((d) => d.id === selectedDeck)?.deck_language || undefined
    ),

    // state
    frontText,
    backText,
    hintText,
    frontImageUrl,
    selectedDeck,
    isLoading,
    isTranslating,

    // setters
    setFrontText,
    setBackText,
    setHintText,
    setFrontImageUrl,
    setSelectedDeck,
    setTargetLangOverride,
    markBackEdited: () => (backEditedManuallyRef.current = true),

    // actions
    handleCreate,
    resetForm,
    translateNow,
  };
}
