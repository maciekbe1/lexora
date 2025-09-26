import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "@/theme/useAppTheme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  borderRadius?: number;
  intensity?: number;
  glassLevel?: "light" | "medium" | "strong";
  animated?: boolean;
  elevation?: number;
  onPress?: () => void;
}

const GLASS_CONFIGS = {
  light: {
    intensity: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.15)",
    gradientColors: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.02)"] as [string, string],
  },
  medium: {
    intensity: 25,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    gradientColors: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"] as [string, string],
  },
  strong: {
    intensity: 35,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.25)",
    gradientColors: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.08)"] as [string, string],
  },
};

export function GlassCard({
  children,
  style,
  padding = 16,
  borderRadius = 16,
  intensity,
  glassLevel = "medium",
  animated = true,
  elevation = 0,
  onPress,
}: GlassCardProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const shadowScale = useSharedValue(1);

  const config = GLASS_CONFIGS[glassLevel];
  const finalIntensity = intensity ?? config.intensity;

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
      shadowScale.value = withTiming(0.95, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      shadowScale.value = withTiming(1, { duration: 100 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
    shadowOpacity: withTiming(shadowScale.value === 1 ? 0.15 : 0.1),
  }));

  const cardStyle: ViewStyle = {
    borderRadius,
    padding,
    overflow: "hidden",
    backgroundColor: config.backgroundColor,
    ...style,
  };

  const shadowContainerStyle: ViewStyle = elevation > 0 ? {
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: elevation * 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: elevation * 3,
    elevation: elevation,
  } : {};

  if (onPress) {
    return (
      <Animated.View style={[shadowContainerStyle, animated && shadowStyle]}>
        <AnimatedPressable
          style={[cardStyle, animated && animatedStyle]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
        <BlurView
          intensity={finalIntensity}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={config.gradientColors}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: config.borderColor,
            },
          ]}
        />
        {children}
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return (
    <View style={shadowContainerStyle}>
      <View style={cardStyle}>
        <BlurView
          intensity={finalIntensity}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={config.gradientColors}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              borderRadius,
              borderWidth: 1,
              borderColor: config.borderColor,
            },
          ]}
        />
        {children}
      </View>
    </View>
  );
}

export function GlassContainer({
  children,
  style,
  ...props
}: Omit<GlassCardProps, "onPress">) {
  return (
    <GlassCard style={style || {}} animated={false} {...props}>
      {children}
    </GlassCard>
  );
}
