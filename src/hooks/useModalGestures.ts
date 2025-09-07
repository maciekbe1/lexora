import { useRef } from "react";
import { Animated, GestureResponderEvent, PanResponder } from "react-native";

interface UseModalGesturesProps {
  translateY: Animated.Value;
  backdropOpacity: Animated.Value;
  screenHeight: number;
  dismissWithAnimation: () => void;
  resetToBottom: () => void;
}

export function useModalGestures({
  translateY,
  backdropOpacity,
  screenHeight,
  dismissWithAnimation,
  resetToBottom,
}: UseModalGesturesProps) {
  // Unified gesture thresholds across modals
  const DRAG_ACTIVATION_DY = 3; // start pan after very slight pull
  const DISMISS_DISTANCE = 80; // pixels to dismiss
  const DISMISS_VELOCITY = 0.75; // velocity threshold to dismiss
  
  const dragOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      // Improve capture so downward swipes over interactive children still work
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g) => {
        const vertical = Math.abs(g.dy) > Math.abs(g.dx);
        return vertical && g.dy > DRAG_ACTIVATION_DY;
      },
      onMoveShouldSetPanResponderCapture: (_: GestureResponderEvent, g) => {
        const vertical = Math.abs(g.dy) > Math.abs(g.dx);
        return vertical && g.dy > DRAG_ACTIVATION_DY;
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        dragOffset.current = 0;
      },
      onPanResponderMove: (_evt, g) => {
        const dy = Math.max(0, g.dy);
        dragOffset.current = dy;
        translateY.setValue(dy);
        backdropOpacity.setValue(Math.max(0, 1 - dy / screenHeight));
      },
      onPanResponderRelease: (_evt, g) => {
        const shouldDismiss =
          g.vy > DISMISS_VELOCITY || dragOffset.current > DISMISS_DISTANCE;
        if (shouldDismiss) {
          dismissWithAnimation();
        } else {
          resetToBottom();
        }
      },
    })
  ).current;

  return {
    panResponder,
  };
}
