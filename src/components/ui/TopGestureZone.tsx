import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

type Props = Omit<ViewProps, "pointerEvents"> & {
  height?: number; // Height of the capture zone
  enabled?: boolean; // When false, renders nothing and doesn't capture
  top?: number; // Optional offset from top (px)
  zIndex?: number; // Layering control for complex stacks
  debugColor?: string; // Optional background color for visual debugging
  pointerEvents?: "auto" | "none" | "box-none" | "box-only"; // override default
};

// Transparent, absolutely positioned zone at the top of a bottom sheet/modal
// that captures downward drag gestures reliably.
export function TopGestureZone({
  height = 64,
  enabled = true,
  top = 0,
  zIndex = 1,
  debugColor,
  style,
  pointerEvents,
  ...rest
}: Props) {
  if (!enabled) return null;
  return (
    <View
      style={[
        styles.zone,
        { height, top, zIndex, backgroundColor: debugColor ?? "transparent" },
        style,
      ]}
      pointerEvents={pointerEvents ?? "auto"}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  zone: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});
