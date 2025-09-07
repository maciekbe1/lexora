import { useModalAnimation } from "./useModalAnimation";
import { useModalGestures } from "./useModalGestures";
import { useEffect } from "react";
import { useUIOverlayStore } from "@/store";

interface UseBaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function useBaseModal({ visible, onClose }: UseBaseModalProps) {
  const { incOverlay, decOverlay } = useUIOverlayStore();
  // Track overlay visibility globally to control back gestures
  useEffect(() => {
    if (visible) {
      incOverlay();
      return () => decOverlay();
    }
    return;
  }, [visible]);

  const {
    translateY,
    backdropOpacity,
    screenHeight,
    dismissWithAnimation,
    resetToBottom,
  } = useModalAnimation(visible, onClose);

  const { panResponder } = useModalGestures({
    translateY,
    backdropOpacity,
    screenHeight,
    dismissWithAnimation,
    resetToBottom,
  });

  return {
    translateY,
    backdropOpacity,
    panResponder,
    dismissWithAnimation,
  };
}
