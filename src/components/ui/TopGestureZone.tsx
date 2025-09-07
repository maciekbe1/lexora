import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

type Props = Omit<ViewProps, "pointerEvents"> & {
  height?: number; // Height of the capture zone
  enabled?: boolean; // When false, renders nothing and doesn't capture
  top?: number; // Optional offset from top (px)
  zIndex?: number; // Layering control for complex stacks
  debugColor?: string; // Optional background color for visual debugging
  pointerEvents?: "auto" | "none" | "box-none" | "box-only"; // override default
  excludeRightWidth?: number; // px area on the right kept free (e.g., right button)
  excludeLeftWidth?: number; // px area on the left kept free (e.g., cancel)
};

// Transparent, absolutely positioned zone at the top of a bottom sheet/modal
// that captures downward drag gestures reliably.
export function TopGestureZone({
  height = 64,
  enabled = true,
  top = 0,
  zIndex = 10,
  debugColor,
  style,
  pointerEvents,
  excludeRightWidth = 0,
  excludeLeftWidth = 0,
  ...rest
}: Props) {
  if (!enabled) return null;
  const pe = pointerEvents ?? "box-only";
  return (
    <View
      style={[styles.zoneWrap, { top, zIndex }]}
      pointerEvents="box-none"
    >
      {/* Left capture area (excludes left and right reserved widths) */}
      <View
        style={[
          styles.capture,
          {
            left: excludeLeftWidth,
            right: excludeRightWidth,
            height,
            backgroundColor: debugColor ?? "transparent",
          },
          style,
        ]}
        pointerEvents={pe}
        {...rest}
      />
      {/* Left excluded area */}
      {excludeLeftWidth > 0 && (
        <View style={[styles.excludeLeft, { width: excludeLeftWidth, height }]} pointerEvents="none" />
      )}
      {/* Right excluded area */}
      {excludeRightWidth > 0 && (
        <View style={[styles.excludeRight, { width: excludeRightWidth, height }]} pointerEvents="none" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  zoneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  capture: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  excludeLeft: {
    position: "absolute",
    left: 0,
  },
  excludeRight: {
    position: "absolute",
    right: 0,
  },
});
