import { localDatabase } from '@/services/local-database';
import { translateText } from '@/services/translation';
import type { CustomFlashcard, UserDeck } from '@/types/flashcard';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

const REVERSE_TRANSLATION_DELAY = 800;
const AUTO_TRANSLATION_DELAY = 500;

export interface UseCustomFlashcardFormParams {
  visible: boolean;
  userDecks: UserDeck[];
  preselectedDeckId?: string;
  editingFlashcard?: CustomFlashcard | null;
  onCreateFlashcard: (
    flashcard: Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void> | void;
}

const normalizeLangCode = (code?: string): string => {
  if (!code) return '';
  const normalizedCode = code.toLowerCase();
  if (normalizedCode.startsWith('en')) return 'en';
  if (normalizedCode.startsWith('es')) return 'es';
  if (normalizedCode.startsWith('de')) return 'de';
  if (normalizedCode.startsWith('fr')) return 'fr';
  if (normalizedCode.startsWith('it')) return 'it';
  if (normalizedCode.startsWith('pl')) return 'pl';
  return normalizedCode.slice(0, 2);
};

const getTargetLanguage = (targetLangOverride: string | null, deckLanguage?: string): string => {
  return normalizeLangCode(targetLangOverride || deckLanguage);
};

const shouldAutoTranslate = (
  backEditedManually: boolean,
  backText: string,
  previousAutoTranslation: string
): boolean => {
  return !backEditedManually || !backText.trim() || backText === previousAutoTranslation;
};

const useFormState = (preselectedDeckId?: string) => {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [hintText, setHintText] = useState('');
  const [frontImageUrl, setFrontImageUrl] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>(preselectedDeckId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLangOverride, setTargetLangOverride] = useState<string | null>(null);
  const [isReverseTranslating, setIsReverseTranslating] = useState(false);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [reverseTranslationSuggestion, setReverseTranslationSuggestion] = useState('');
  const backEditedManuallyRef = useRef(false);
  const lastAutoTranslationRef = useRef('');

  return {
    frontText, setFrontText,
    backText, setBackText,
    hintText, setHintText,
    frontImageUrl, setFrontImageUrl,
    selectedDeck, setSelectedDeck,
    isLoading, setIsLoading,
    isTranslating, setIsTranslating,
    targetLangOverride, setTargetLangOverride,
    isReverseTranslating, setIsReverseTranslating,
    showSuggestionDialog, setShowSuggestionDialog,
    reverseTranslationSuggestion, setReverseTranslationSuggestion,
    backEditedManuallyRef,
    lastAutoTranslationRef
  };
};

export function useCustomFlashcardForm({
  visible,
  userDecks,
  preselectedDeckId,
  editingFlashcard,
  onCreateFlashcard,
}: UseCustomFlashcardFormParams) {
  const {
    frontText, setFrontText,
    backText, setBackText,
    hintText, setHintText,
    frontImageUrl, setFrontImageUrl,
    selectedDeck, setSelectedDeck,
    isLoading, setIsLoading,
    isTranslating, setIsTranslating,
    targetLangOverride, setTargetLangOverride,
    isReverseTranslating, setIsReverseTranslating,
    showSuggestionDialog, setShowSuggestionDialog,
    reverseTranslationSuggestion, setReverseTranslationSuggestion,
    backEditedManuallyRef,
    lastAutoTranslationRef
  } = useFormState(preselectedDeckId);

  // Only custom decks are allowed here
  const customDecks = userDecks.filter((d) => d.is_custom);

  const initializeFormForEditing = () => {
    if (!editingFlashcard) return;
    setFrontText(editingFlashcard.front_text);
    setBackText(editingFlashcard.back_text);
    setHintText(editingFlashcard.hint_text);
    setFrontImageUrl(editingFlashcard.front_image_url);
    setSelectedDeck(editingFlashcard.user_deck_id);
  };

  const initializeFormForCreation = () => {
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
  };

  // Initialize/reset form on open
  useEffect(() => {
    if (!visible) return;

    if (editingFlashcard) {
      initializeFormForEditing();
    } else {
      initializeFormForCreation();
    }
    // Intentionally ignore deps to run only on visibility change
  }, [visible]);

  const performAutoTranslation = async (textToTranslate: string, targetLanguage: string) => {
    try {
      const translatedText = await translateText(textToTranslate.trim(), 'pl', targetLanguage);
      const previousAutoTranslation = lastAutoTranslationRef.current;
      lastAutoTranslationRef.current = translatedText;

      const shouldUpdate = shouldAutoTranslate(
        backEditedManuallyRef.current,
        backText,
        previousAutoTranslation
      );

      if (shouldUpdate) {
        setBackText(translatedText);
      }
    } catch {
      // Silent failure - continue without translation
    } finally {
      setIsTranslating(false);
    }
  };

  // Debounced auto-translation (PL -> deck language or override)
  useEffect(() => {
    if (!visible) return;
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const targetLanguage = getTargetLanguage(targetLangOverride, deck?.deck_language || undefined);

    if (!targetLanguage || !frontText.trim()) return;

    setIsTranslating(true);
    const timer = setTimeout(() => {
      performAutoTranslation(frontText, targetLanguage);
    }, AUTO_TRANSLATION_DELAY);

    return () => clearTimeout(timer);
  }, [frontText, selectedDeck, targetLangOverride, visible, editingFlashcard]);

  const performReverseTranslation = async (textToTranslate: string, sourceLanguage: string) => {
    try {
      const translatedToPolish = await translateText(textToTranslate.trim(), sourceLanguage, 'pl');
      setReverseTranslationSuggestion(translatedToPolish);

      if (!frontText.trim()) {
        setFrontText(translatedToPolish);
      } else {
        setShowSuggestionDialog(true);
      }
    } catch {
      // Silent failure - user can continue without reverse translation
    } finally {
      setIsReverseTranslating(false);
    }
  };

  // Debounced reverse translation (deck language -> PL)
  useEffect(() => {
    if (!visible) return;
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const sourceLanguage = getTargetLanguage(targetLangOverride, deck?.deck_language || undefined);

    if (!sourceLanguage || !backText.trim() || sourceLanguage === 'pl') return;

    setIsReverseTranslating(true);
    const timer = setTimeout(() => {
      performReverseTranslation(backText, sourceLanguage);
    }, REVERSE_TRANSLATION_DELAY);

    return () => clearTimeout(timer);
  }, [backText, selectedDeck, targetLangOverride, visible]);

  const handleReverseSuggestionChoice = (shouldReplace: boolean) => {
    if (shouldReplace && reverseTranslationSuggestion) {
      setFrontText(reverseTranslationSuggestion);
    }
    setShowSuggestionDialog(false);
    setReverseTranslationSuggestion('');
  };

  const showReverseSuggestionDialog = () => {
    if (!reverseTranslationSuggestion) return;

    Alert.alert(
      'Sugestia tłumaczenia',
      `Czy zastąpić tekst przodu fiszki tym tłumaczeniem?\n\n"${reverseTranslationSuggestion}"`,
      [
        { text: 'Zostaw', style: 'cancel', onPress: () => handleReverseSuggestionChoice(false) },
        { text: 'Zastąp', onPress: () => handleReverseSuggestionChoice(true) },
      ]
    );
  };

  const updateLanguageOverrideIfNeeded = async () => {
    if (!visible || !selectedDeck) return;

    const deck = customDecks.find((d) => d.id === selectedDeck);
    const existingLanguage = normalizeLangCode(deck?.deck_language || undefined);

    if (existingLanguage) return;

    try {
      const customDeck = await localDatabase.getCustomDeckById(selectedDeck);
      const language = normalizeLangCode(customDeck?.language);
      if (language) {
        setTargetLangOverride(language);
      }
    } catch {
      // Silent failure - continue without override
    }
  };

  // Fallback: if deck_language missing on the selected deck, try to read from custom_decks
  useEffect(() => {
    updateLanguageOverrideIfNeeded();
  }, [visible, selectedDeck]);

  // Imperative translate action (for editing or manual trigger)
  const translateNow = async (options?: { force?: boolean }) => {
    const deck = customDecks.find((d) => d.id === selectedDeck);
    const targetLanguage = getTargetLanguage(targetLangOverride, deck?.deck_language || undefined);

    if (!targetLanguage || !frontText.trim()) return;

    setIsTranslating(true);

    try {
      const translatedText = await translateText(frontText.trim(), 'pl', targetLanguage);
      const previousAutoTranslation = lastAutoTranslationRef.current;
      lastAutoTranslationRef.current = translatedText;

      const shouldUpdate = options?.force || shouldAutoTranslate(
        backEditedManuallyRef.current,
        backText,
        previousAutoTranslation
      );

      if (shouldUpdate) {
        setBackText(translatedText);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const validateFlashcardForm = (): boolean => {
    if (!frontText.trim()) {
      Alert.alert('Błąd', 'Tekst przedniej strony jest wymagany');
      return false;
    }
    if (!backText.trim()) {
      Alert.alert('Błąd', 'Tekst tylnej strony jest wymagany');
      return false;
    }
    if (!selectedDeck) {
      Alert.alert('Błąd', 'Wybierz talię dla fiszki');
      return false;
    }
    return true;
  };

  const createFlashcardPayload = (selectedUserDeck: UserDeck): Omit<CustomFlashcard, 'id' | 'created_at' | 'updated_at'> => {
    return {
      user_deck_id: selectedDeck,
      front_text: frontText.trim(),
      back_text: backText.trim(),
      hint_text: hintText.trim() || '',
      front_image_url: frontImageUrl || '',
      back_image_url: '',
      front_audio_url: '',
      back_audio_url: '',
      position: 0,
      user_id: selectedUserDeck.user_id,
    };
  };

  const handleCreate = async (): Promise<boolean> => {
    if (!validateFlashcardForm()) {
      return false;
    }

    setIsLoading(true);

    try {
      const deck = customDecks.find((d) => d.id === selectedDeck);
      if (!deck) {
        throw new Error('Selected deck not found');
      }

      const payload = createFlashcardPayload(deck);
      await onCreateFlashcard(payload);
      resetForm();
      return true;
    } catch {
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
    targetLang: getTargetLanguage(
      targetLangOverride,
      customDecks.find((d) => d.id === selectedDeck)?.deck_language || undefined
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

    // reverse translation
    isReverseTranslating,
    showSuggestionDialog,
    reverseTranslationSuggestion,
    handleReverseSuggestionChoice,
    showReverseSuggestionDialog,
  };
}
