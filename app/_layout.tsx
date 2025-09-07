import { EdgeBackGesture } from "@/components/EdgeBackGesture";
import { LanguagePreferencesModal } from "@/components/features/preferences/LanguagePreferencesModal";
import { LoadingScreen } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { useAppStore, useAuthStore, usePreferencesStore } from "@/store";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedContainer } from "@/theme/ThemedContainer";
import { useUIOverlayStore } from "@/store";

export default function RootLayout() {
  const { user, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { initializing, initializedForUserId, initializeIfNeeded } =
    useAppStore();
  const { effective } = useTheme();
  const prefsStore = usePreferencesStore();
  const {
    nativeLanguage,
    targetLanguage,
    hasServerRecord,
    loadFromServer,
    saveToServer,
    initDefaults,
  } = prefsStore;
  const [showLangPrefs, setShowLangPrefs] = useState(false);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize app services per-user at root
  useEffect(() => {
    if (user?.id) {
      initializeIfNeeded(user.id);
    }
  }, [user?.id, initializeIfNeeded]);

  // Load preferences for signed-in user (and set device defaults if missing)
  useEffect(() => {
    if (user?.id) {
      initDefaults();
      loadFromServer(user.id);
    }
  }, [user?.id]);

  // Auth guard - redirect based on authentication state
  useEffect(() => {
    if (loading) return; // Wait for auth to load

    const currentPath = segments.join("/");
    const isOnAuthPath = currentPath.includes("auth");
    const isOnAppPath = currentPath.includes("app") || currentPath === "";

    console.log("Auth Guard:", {
      user: !!user,
      currentPath,
      isOnAuthPath,
      isOnAppPath,
    });

    if (!user && !isOnAuthPath) {
      // User not authenticated, redirect to sign-in
      console.log("Redirecting to sign-in: user not authenticated");
      router.push("/sign-in" as any);
    } else if (user && isOnAuthPath) {
      // User authenticated but on auth screen, redirect to app
      console.log("Redirecting to app: user authenticated");
      router.push("/" as any);
    }
  }, [user, segments, loading, router]);

  // For OAuth sign-ups or accounts without prefs, prompt once after sign-in
  useEffect(() => {
    if (user && !hasServerRecord) setShowLangPrefs(true);
    else setShowLangPrefs(false);
  }, [user?.id, hasServerRecord]);

  // Show loading state while initializing
  if (loading || (user && (initializing || initializedForUserId !== user.id))) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <LoadingScreen message="Initializing Lexora..." />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={effective === "dark" ? "light" : "dark"} />
        <ThemedContainer>
        <EdgeBackGesture>
          {/** Disable native back-swipe when any overlay is visible (iOS) */}
          <OverlayBackGestureGuard>
          <Stack
            screenOptions={{
              headerShown: false, // keep custom headers; gestures still enabled
              gestureEnabled: useUIOverlayStore.getState().overlayCount === 0,
              fullScreenGestureEnabled:
                Platform.OS === "ios" && useUIOverlayStore.getState().overlayCount === 0,
              animation: Platform.OS === "ios" ? "default" : "slide_from_right",
              gestureDirection: "horizontal",
            }}
          >
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="deck/[id]" />
            <Stack.Screen name="study/[deckId]" />
          </Stack>
          </OverlayBackGestureGuard>
          {showLangPrefs && (
            <LanguagePreferencesModal
              visible={showLangPrefs}
              onClose={() => setShowLangPrefs(false)}
              initialNative={nativeLanguage}
              initialTarget={targetLanguage}
              onSave={async (nativeLang, targetLang) => {
                if (!user?.id) return false;
                // Update local store first
                usePreferencesStore.getState().setNative(nativeLang);
                usePreferencesStore.getState().setTarget(targetLang);
                const ok = await saveToServer(user.id);
                return ok;
              }}
            />
          )}
        </EdgeBackGesture>
        </ThemedContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Forces a re-render of Stack when overlayCount changes so screenOptions pick up the new value
function OverlayBackGestureGuard({ children }: { children: React.ReactNode }) {
  // Subscribe to overlayCount to force re-render when it changes
  useUIOverlayStore((s) => s.overlayCount);
  return <>{children}</>;
}
