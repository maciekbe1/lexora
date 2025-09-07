import { useModalAnimation } from "./useModalAnimation";
import { useModalGestures } from "./useModalGestures";
import { useOverlayLifecycle } from "./useOverlayLifecycle";
import { MutableRefObject } from "react";

interface UseBaseModalProps {
  visible: boolean;
  onClose: () => void;
  requireScrollTopForSwipe?: boolean;
  scrollOffsetRef?: MutableRefObject<number>;
}

export function useBaseModal({ visible, onClose, requireScrollTopForSwipe = false, scrollOffsetRef }: UseBaseModalProps) {
  // Track overlay visibility globally to control back gestures
  useOverlayLifecycle(visible);

  const {
    translateY,
    backdropOpacity,
    screenHeight,
    dismissWithAnimation,
    resetToBottom,
  } = useModalAnimation(visible, onClose);

  const effectiveRef = (scrollOffsetRef ?? ({ current: 0 } as MutableRefObject<number>));
  const { panResponder } = useModalGestures({
    translateY,
    backdropOpacity,
    screenHeight,
    dismissWithAnimation,
    resetToBottom,
    topStartHeight: 96,
    requireScrollTop: requireScrollTopForSwipe,
    scrollOffsetRef: effectiveRef,
  });

  return {
    translateY,
    backdropOpacity,
    panResponder,
    dismissWithAnimation,
  };
}
