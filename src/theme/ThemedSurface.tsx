import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { Platform, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAppTheme } from './useAppTheme';

type ThemedSurfaceProps = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
  withBorder?: boolean;
  withShadow?: boolean;
}>;

export function ThemedSurface({ children, style, withBorder = true, withShadow = true }: ThemedSurfaceProps) {
  const { colors, mode } = useAppTheme();
  const progress = useSharedValue(1);
  const prevSurface = useRef(colors.surface);
  const prevBorder = useRef(colors.border);

  useEffect(() => {
    if (prevSurface.current !== colors.surface || prevBorder.current !== colors.border) {
      progress.value = 0;
      prevSurface.current = colors.surface;
      prevBorder.current = colors.border;
      progress.value = withTiming(1, { duration: 220 });
    }
  }, [colors.surface, colors.border]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], [prevSurface.current, colors.surface]),
      borderColor: withBorder
        ? interpolateColor(progress.value, [0, 1], [prevBorder.current, colors.border])
        : undefined,
      borderWidth: withBorder ? 1 : 0,
    } as ViewStyle;
  }, [mode, withBorder]);

  const shadowStyle: ViewStyle = withShadow
    ? Platform.select({
        ios: {
          shadowColor: colors.cardShadow,
          shadowOpacity: mode === 'dark' ? 0.25 : 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        android: {
          elevation: mode === 'dark' ? 2 : 3,
        },
        default: {},
      }) || {}
    : {};

  const composed: any[] = Array.isArray(style) ? [...style] : style ? [style] : [];
  composed.push(animatedStyle, shadowStyle);

  return <Animated.View style={composed}>{children}</Animated.View>;
}

