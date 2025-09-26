import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  PressableProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { GlassCard } from "./GlassCard";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ListItemProps extends Omit<PressableProps, "style"> {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  variant?: "default" | "glass" | "card";
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  showDivider?: boolean;
  badge?: number | string;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon = "chevron-forward",
  rightText,
  leftComponent,
  rightComponent,
  variant = "default",
  style,
  titleStyle,
  subtitleStyle,
  showDivider = false,
  badge,
  onPress,
  ...props
}: ListItemProps) {
  const { colors } = useAppTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <>
      <View style={styles.leftSection}>
        {leftComponent || (leftIcon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={leftIcon}
              size={24}
              color={colors.primary}
            />
          </View>
        ))}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
              titleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                { color: colors.mutedText },
                subtitleStyle,
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>
              {typeof badge === "number" && badge > 99 ? "99+" : badge}
            </Text>
          </View>
        )}
        {rightText && (
          <Text style={[styles.rightText, { color: colors.mutedText }]}>
            {rightText}
          </Text>
        )}
        {rightComponent || (onPress && rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.mutedText}
          />
        ))}
      </View>
    </>
  );

  if (variant === "glass") {
    return (
      <GlassCard
        style={{...styles.glassContainer, ...style}}
        onPress={onPress as any}
        padding={0}
      >
        <View style={styles.listItemContent}>
          {content}
        </View>
      </GlassCard>
    );
  }

  const containerStyle: ViewStyle = {
    ...styles.container,
    ...(variant === "card" && {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginHorizontal: 16,
      marginVertical: 4,
    }),
    ...style,
  };

  if (!onPress) {
    return (
      <View style={containerStyle}>
        {content}
        {showDivider && (
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.border },
            ]}
          />
        )}
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[containerStyle, animatedStyle]}
      {...props}
    >
      {content}
      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: colors.border },
          ]}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
  },
  glassContainer: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightText: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 0,
  },
});
