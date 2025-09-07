import { useEffect, useRef } from "react";
import { useUIOverlayStore } from "@/store";

// Tracks overlay visibility in a centralized store to control system gestures
// and coordinate UI behavior across the app while overlays are present.
export function useOverlayLifecycle(visible: boolean) {
  const { incOverlay, decOverlay } = useUIOverlayStore();
  const countedRef = useRef(false);

  useEffect(() => {
    // Entering visible state: increment once
    if (visible && !countedRef.current) {
      incOverlay();
      countedRef.current = true;
    }
    // Leaving visible state: decrement once
    if (!visible && countedRef.current) {
      decOverlay();
      countedRef.current = false;
    }
    // On unmount: ensure we decrement if still counted
    return () => {
      if (countedRef.current) {
        decOverlay();
        countedRef.current = false;
      }
    };
  }, [visible]);
}
