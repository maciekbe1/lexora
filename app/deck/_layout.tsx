import { Stack } from "expo-router";
import React from "react";
import { useAppTheme } from "@/theme/useAppTheme";

export default function DeckLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          color: colors.text,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerShown: true,
        }}
      />
    </Stack>
  );
}