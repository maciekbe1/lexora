import { EdgeBackGesture } from "@/components/EdgeBackGesture";
import { LoadingScreen } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/store";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { user, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { initializing, initializedForUserId, initializeIfNeeded } =
    useAppStore();

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
        <EdgeBackGesture>
          <Stack
            screenOptions={{
              headerShown: false, // keep custom headers; gestures still enabled
              gestureEnabled: true,
              fullScreenGestureEnabled: Platform.OS === "ios",
              animation: Platform.OS === "ios" ? "default" : "slide_from_right",
              gestureDirection: "horizontal",
            }}
          >
            <Stack.Screen name="(app)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="deck/[id]" />
          </Stack>
        </EdgeBackGesture>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
