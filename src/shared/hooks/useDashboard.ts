import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import type { UserDeck } from "@/shared/types/flashcard";
import { useAppStore } from "@/store";
import { useDeckManagement } from "@/shared/hooks/useDeckManagement";
import { useDeferredLoading } from "@/shared/hooks/useDeferredLoading";
import { useAuthStore } from "@/store";

export function useDashboard() {
  const { user } = useAuthStore();
  const { initializedForUserId, initializing } = useAppStore();
  const isInitialized = Boolean(user) && initializedForUserId === user!.id && !initializing;
  const {
    userDecks,
    refreshing,
    isLoading,
    fetchUserDecks,
    onRefresh,
    createCustomDeck,
    createCustomFlashcard,
  } = useDeckManagement(user);

  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCustomDeckModal, setShowCustomDeckModal] = useState(false);
  const [showCustomFlashcardModal, setShowCustomFlashcardModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Load user decks when app is initialized
  useEffect(() => {
    if (isInitialized) {
      fetchUserDecks();
    }
  }, [isInitialized]);

  // Refresh decks when screen comes into focus (e.g., after deleting a deck)
  // Only if more than 1 second has passed since last fetch to avoid spam
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (isInitialized && now - lastFetchTime > 1000) {
        setLastFetchTime(now);
        fetchUserDecks();
      }
    }, [isInitialized, lastFetchTime])
  );

  // Exposed pull-to-refresh + header refresh that also stamps last fetch time
  const handleRefresh = useCallback(async () => {
    setLastFetchTime(Date.now());
    await onRefresh();
  }, [onRefresh]);

  // Refresh on app resume from background (throttled: 30s)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        const now = Date.now();
        if (isInitialized && now - lastFetchTime > 30_000) {
          setLastFetchTime(now);
          fetchUserDecks();
        }
      }
    });
    return () => sub.remove();
  }, [isInitialized, lastFetchTime, fetchUserDecks]);

  // Navigation handlers
  const handleDeckPress = (userDeck: UserDeck) => {
    router.push(`/deck/${userDeck.id}`);
  };

  // FAB action handlers
  const handleFABPress = () => setShowActionMenu(true);
  
  const handleCreateDeck = () => {
    setShowActionMenu(false);
    setShowCustomDeckModal(true);
  };
  
  const handleCreateFlashcard = () => {
    setShowActionMenu(false);
    setShowCustomFlashcardModal(true);
  };
  
  const handleBrowseTemplates = () => {
    setShowActionMenu(false);
    setShowTemplateModal(true);
  };

  // Modal handlers
  const modalHandlers = {
    template: {
      show: () => setShowTemplateModal(true),
      hide: () => setShowTemplateModal(false),
    },
    customDeck: {
      show: () => setShowCustomDeckModal(true),
      hide: () => setShowCustomDeckModal(false),
    },
    customFlashcard: {
      show: () => setShowCustomFlashcardModal(true),
      hide: () => setShowCustomFlashcardModal(false),
    },
    actionMenu: {
      show: () => setShowActionMenu(true),
      hide: () => setShowActionMenu(false),
    },
  };

  // Loading state
  const isDecksLoading = !isInitialized || isLoading;
  const showLoading = useDeferredLoading(isDecksLoading, 200);

  return {
    // Data
    userDecks,
    refreshing,
    showLoading,
    
    // Modal states
    showTemplateModal,
    showCustomDeckModal,
    showCustomFlashcardModal,
    showActionMenu,
    
    // Handlers
    handleDeckPress,
    handleFABPress,
    handleCreateDeck,
    handleCreateFlashcard,
    handleBrowseTemplates,
    onRefresh: handleRefresh,
    
    // Modal handlers
    modalHandlers,
    
    // Actions
    createCustomDeck,
    createCustomFlashcard,
    fetchUserDecks,
  };
}
