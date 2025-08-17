import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonViewProps {
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

/**
 * Lightweight shimmer-ish skeleton view without external deps.
 * Uses an animated highlight bar moving across a dim base.
 */
export function SkeletonView({ style, borderRadius = 6 }: SkeletonViewProps) {
  const translate = useRef(new Animated.Value(-1)).current; // -1..1

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translate, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translate]);

  // Interpolate translateX from width via percentage (using transform scale)
  const translateX = translate.interpolate({ inputRange: [-1, 1], outputRange: [-150, 150] });

  return (
    <View style={[styles.base, { borderRadius }, style]}> 
      <Animated.View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            borderRadius,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#E9ECEF',
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: '#F3F5F7',
    opacity: 0.6,
  },
});

