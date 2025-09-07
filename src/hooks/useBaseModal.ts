import { useModalAnimation } from "./useModalAnimation";
import { useModalGestures } from "./useModalGestures";
import { useOverlayLifecycle } from "./useOverlayLifecycle";

interface UseBaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function useBaseModal({ visible, onClose }: UseBaseModalProps) {
  // Track overlay visibility globally to control back gestures
  useOverlayLifecycle(visible);

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
