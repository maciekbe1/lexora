import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

type DragHandleProps = {
  onPress: () => void;
  // Optional panHandlers for bottom sheets

  panHandlers?: any;
};

export function DragHandle({ onPress, panHandlers }: DragHandleProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={styles.container}
      {...(panHandlers || {})}
      pointerEvents="box-only"
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
      >
        <View style={[styles.indicator, { backgroundColor: colors.border }]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 16, paddingBottom: 10 },
  indicator: { width: 36, height: 4, borderRadius: 2 },
});
