import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";

const ICON_SIZE_MEDIUM = 20;
const BORDER_RADIUS_SMALL = 8;

interface SourceButtonProps {
  disabled: boolean;
  onPress: () => void;
  label: string;
}

export function SourceButton({ disabled, onPress, label }: SourceButtonProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.sourceButton,
        { borderColor: colors.primary },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name="phone-portrait"
        size={ICON_SIZE_MEDIUM}
        color={disabled ? colors.mutedText : colors.primary}
      />
      <Text
        style={[
          styles.sourceButtonText,
          { color: colors.primary },
          disabled && { color: colors.mutedText },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_SMALL,
    marginRight: 12,
  },
  sourceButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.5,
  },
});