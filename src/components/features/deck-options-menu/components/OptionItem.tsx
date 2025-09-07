import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

export function OptionItem({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      style={[
        styles.item,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Ionicons
          name={icon as any}
          size={20}
          color={iconColor || colors.primary}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedText }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  subtitle: { fontSize: 14 },
});
