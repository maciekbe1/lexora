import { useEffect } from "react";
import { Platform } from "react-native";
import { useNavigation } from "expo-router";
import { useUIOverlayStore } from "@/store";

// Disables the native back-swipe gesture while any modal/sheet overlay is visible.
// Keeps behavior consistent across screens without duplicating effects.
export function useDisableBackGestureWhileOverlay() {
  const navigation = useNavigation();
  const overlayCount = useUIOverlayStore((s) => s.overlayCount);

  useEffect(() => {
    // @ts-ignore - runtime options available on native-stack
    navigation.setOptions({
      gestureEnabled: overlayCount === 0,
      fullScreenGestureEnabled: overlayCount === 0 && Platform.OS === "ios",
    });
  }, [overlayCount, navigation]);
}

