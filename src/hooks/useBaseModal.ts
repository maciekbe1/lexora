import { useModalAnimation } from "./useModalAnimation";
import { useModalGestures } from "./useModalGestures";

interface UseBaseModalProps {
  visible: boolean;
  onClose: () => void;
}

export function useBaseModal({ visible, onClose }: UseBaseModalProps) {
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