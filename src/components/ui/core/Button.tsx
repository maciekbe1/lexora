import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
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

type ButtonVariant = "primary" | "secondary" | "glass" | "ghost" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const SIZES = {
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 16,
    borderRadius: 10,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    iconSize: 20,
    borderRadius: 12,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    iconSize: 24,
    borderRadius: 14,
  },
};

export function Button({
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  loading = false,
  fullWidth = false,
  children,
  style,
  textStyle,
  disabled = false,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const sizeConfig = SIZES[size];

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(0.8, { duration: 100 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    opacity.value = withTiming(1, { duration: 100 });
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
        };
      case "secondary":
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case "glass":
        return {
          backgroundColor: "transparent",
          overflow: "hidden",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          backgroundColor: "#FF3B30",
        };
      default:
        return {};
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "secondary":
      case "ghost":
        return colors.text;
      case "glass":
        return colors.text;
      default:
        return colors.text;
    }
  };

  const buttonStyle: ViewStyle = {
    ...sizeConfig,
    ...getVariantStyle(),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...(fullWidth && { width: "100%" }),
    ...(disabled && { opacity: 0.5 }),
    ...style,
  };

  const textColor = getTextColor();

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={textColor}
              style={styles.leftIcon}
            />
          )}
          {typeof children === "string" ? (
            <Text
              style={[
                styles.text,
                {
                  fontSize: sizeConfig.fontSize,
                  color: textColor,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={sizeConfig.iconSize}
              color={textColor}
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </>
  );

  if (variant === "glass") {
    return (
      <AnimatedTouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[buttonStyle, animatedStyle]}
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
            { borderRadius: sizeConfig.borderRadius },
          ]}
        />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.glassBorder,
            { borderRadius: sizeConfig.borderRadius },
          ]}
        />
        {renderContent()}
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[buttonStyle, animatedStyle]}
      {...props}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});