import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoadingScreen } from "../src/shared/components/ui/LoadingScreen";
import { useAuthStore } from "../src/store/auth";

export default function RootLayout() {
  const { user, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, [initialize]);

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
  if (loading) {
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
        <Slot />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
