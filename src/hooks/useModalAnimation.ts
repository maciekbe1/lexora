import { useEffect, useRef } from "react";
import { Animated, Dimensions } from "react-native";

export function useModalAnimation(visible: boolean, onClose: () => void) {
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const screenHeight = useRef(Dimensions.get("window").height).current;
  const isClosingRef = useRef(false);

  const dismissWithAnimation = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset the guard shortly after parent hides the modal
      requestAnimationFrame(() => {
        isClosingRef.current = false;
      });
    });
  };

  const resetToBottom = () => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Start from bottom and animate in
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 100,
          overshootClamping: false,
          restSpeedThreshold: 0.1,
          restDisplacementThreshold: 0.1,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset to bottom when hidden
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
    }
  }, [visible, translateY, backdropOpacity, screenHeight]);

  return {
    translateY,
    backdropOpacity,
    screenHeight,
    dismissWithAnimation,
    resetToBottom,
  };
}