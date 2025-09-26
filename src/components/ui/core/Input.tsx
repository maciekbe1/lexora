import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: "default" | "glass" | "filled";
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = "default",
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const animatedLabelStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      focusAnimation.value,
      [0, 1],
      [0, -24]
    );
    const scale = interpolate(
      focusAnimation.value,
      [0, 1],
      [1, 0.85]
    );
    return {
      transform: [
        { translateY: props.value || isFocused ? -24 : translateY },
        { scale: props.value || isFocused ? 0.85 : scale },
      ],
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      error
        ? "#FF3B30"
        : isFocused
        ? colors.primary
        : colors.border,
      { duration: 200 }
    ),
    borderWidth: isFocused ? 2 : 1,
  }));

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "glass":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          overflow: "hidden",
        };
      case "filled":
        return {
          backgroundColor: colors.surface,
        };
      default:
        return {
          backgroundColor: colors.background,
        };
    }
  };

  const inputContainerStyle: ViewStyle = {
    ...getVariantStyle(),
    borderRadius: 12,
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            animatedLabelStyle,
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.label,
              {
                color: error
                  ? "#FF3B30"
                  : isFocused
                  ? colors.primary
                  : colors.mutedText,
              },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      )}

      <Animated.View
        style={[
          inputContainerStyle,
          animatedBorderStyle,
        ]}
      >
        {variant === "glass" && (
          <>
            <BlurView
              intensity={20}
              tint="light"
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.glassBorder,
                { borderRadius: 12 },
              ]}
            />
          </>
        )}

        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.mutedText}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingTop: label ? 12 : 0,
            },
            style,
          ]}
          placeholderTextColor={colors.mutedText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.mutedText}
            />
          </Pressable>
        )}
      </Animated.View>

      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: error ? "#FF3B30" : colors.mutedText,
            },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    position: "absolute",
    left: 16,
    top: 16,
    zIndex: 1,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIconButton: {
    padding: 8,
    margin: -8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});