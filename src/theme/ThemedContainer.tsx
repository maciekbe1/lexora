import React, { PropsWithChildren, useEffect, useRef } from 'react';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from './useAppTheme';

export function ThemedContainer({ children }: PropsWithChildren) {
  const { colors, mode } = useAppTheme();
  const progress = useSharedValue(1);
  const prevBg = useRef(colors.background);

  useEffect(() => {
    // When background color changes (mode switch), animate between old and new
    const nextBg = colors.background;
    if (prevBg.current !== nextBg) {
      progress.value = 0;
      prevBg.current = nextBg; // update for next cycle after animation start
      progress.value = withTiming(1, { duration: 250 });
    }
  }, [colors.background]);

  const animatedStyle = useAnimatedStyle(() => {
    // Note: prevBg.current is updated at start of animation; store it in closure
    return {
      flex: 1,
      backgroundColor: interpolateColor(progress.value, [0, 1], [prevBg.current, colors.background]),
    };
  }, [mode]);

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

