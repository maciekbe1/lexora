import { MutableRefObject, useRef } from "react";
import { Animated, GestureResponderEvent, PanResponder } from "react-native";

interface UseModalGesturesProps {
  translateY: Animated.Value;
  backdropOpacity: Animated.Value;
  screenHeight: number;
  dismissWithAnimation: () => void;
  resetToBottom: () => void;
  topStartHeight?: number; // px area from top where we immediately capture
  requireScrollTop?: boolean; // when true, only allow swipe when scroll is at top
  scrollOffsetRef?: MutableRefObject<number>;
}

export function useModalGestures({
  translateY,
  backdropOpacity,
  screenHeight,
  dismissWithAnimation,
  resetToBottom,
  topStartHeight = 96,
  requireScrollTop = false,
  scrollOffsetRef,
}: UseModalGesturesProps) {
  // Unified gesture thresholds across modals
  const DRAG_ACTIVATION_DY = 3; // start pan after very slight pull
  const DISMISS_DISTANCE = 80; // pixels to dismiss
  const DISMISS_VELOCITY = 0.75; // velocity threshold to dismiss
  
  const dragOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      // Capture immediately if touch starts within the top capture zone
      onStartShouldSetPanResponder: (evt) => {
        const y = (evt?.nativeEvent as any)?.locationY ?? Number.MAX_SAFE_INTEGER;
        return y <= topStartHeight; // header zone: capture immediately
      },
      onStartShouldSetPanResponderCapture: (evt) => {
        const y = (evt?.nativeEvent as any)?.locationY ?? Number.MAX_SAFE_INTEGER;
        return y <= topStartHeight;
      },
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, g) => {
        const y = (evt?.nativeEvent as any)?.locationY ?? Number.MAX_SAFE_INTEGER;
        const inHeaderZone = y <= topStartHeight;
        const vertical = Math.abs(g.dy) > Math.abs(g.dx);
        // Allow swipe if in header zone regardless of scroll position
        if (inHeaderZone) return vertical && g.dy > DRAG_ACTIVATION_DY;
        // Otherwise require scroll at top if configured
        if (requireScrollTop && scrollOffsetRef && (scrollOffsetRef.current || 0) > 1) return false;
        return vertical && g.dy > DRAG_ACTIVATION_DY;
      },
      onMoveShouldSetPanResponderCapture: (evt: GestureResponderEvent, g) => {
        const y = (evt?.nativeEvent as any)?.locationY ?? Number.MAX_SAFE_INTEGER;
        const inHeaderZone = y <= topStartHeight;
        const vertical = Math.abs(g.dy) > Math.abs(g.dx);
        if (inHeaderZone) return vertical && g.dy > DRAG_ACTIVATION_DY;
        if (requireScrollTop && scrollOffsetRef && (scrollOffsetRef.current || 0) > 1) return false;
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
