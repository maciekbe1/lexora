import { useEffect } from "react";
import { useUIOverlayStore } from "@/store";

// Tracks overlay visibility in a centralized store to control system gestures
// and coordinate UI behavior across the app while overlays are present.
export function useOverlayLifecycle(visible: boolean) {
  const { incOverlay, decOverlay } = useUIOverlayStore();

  useEffect(() => {
    if (visible) {
      incOverlay();
      return () => decOverlay();
    }
    return;
  }, [visible]);
}

