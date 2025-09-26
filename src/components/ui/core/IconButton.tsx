import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  View,
  TouchableOpacityProps,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

type IconButtonVariant = "glass" | "filled" | "ghost" | "tinted";
type IconButtonSize = "small" | "medium" | "large";

interface IconButtonProps extends Omit<TouchableOpacityProps, "style"> {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  backgroundColor?: string;
  badge?: number | boolean;
  style?: ViewStyle;
}

const SIZES = {
  small: {
    container: 32,
    icon: 18,
    padding: 7,
  },
  medium: {
    container: 40,
    icon: 22,
    padding: 9,
  },
  large: {
    container: 48,
    icon: 26,
    padding: 11,
  },
};

export function IconButton({
  icon,
  variant = "glass",
  size = "medium",
  color,
  backgroundColor,
  badge,
  style,
  disabled = false,
  onPress,
  ...props
}: IconButtonProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const sizeConfig = SIZES[size];
  const iconColor = color || (variant === "filled" ? "#FFFFFF" : colors.primary);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    rotate.value = withTiming(10, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    rotate.value = withTiming(0, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
        };
      case "filled":
        return {
          backgroundColor: backgroundColor || colors.primary,
        };
      case "tinted":
        return {
          backgroundColor: `${colors.primary}15`,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {};
    }
  };

  const containerStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius: sizeConfig.container / 2,
    padding: sizeConfig.padding,
    alignItems: "center",
    justifyContent: "center",
    ...getVariantStyle(),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const renderIcon = () => (
    <>
      <Ionicons
        name={icon}
        size={sizeConfig.icon}
        color={iconColor}
      />
      {badge !== undefined && (
        <View style={[
          styles.badge,
          {
            backgroundColor: "#FF3B30",
            top: -2,
            right: -2,
          }
        ]} />
      )}
    </>
  );

  if (variant === "glass") {
    return (
      <AnimatedTouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[containerStyle, animatedStyle]}
        {...props}
      >
        <BlurView
          intensity={20}
          tint="light"
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: sizeConfig.container / 2 },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.glassBorder,
            { borderRadius: sizeConfig.container / 2 },
          ]}
        />
        {renderIcon()}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[containerStyle, animatedStyle]}
      {...props}
    >
      {renderIcon()}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  glassBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  badge: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});