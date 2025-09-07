import { useAppTheme } from "@/theme/useAppTheme";
import React from "react";
import { StyleSheet, Text } from "react-native";

export function MenuHeader({ title }: { title: string }) {
  const { colors } = useAppTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
});
