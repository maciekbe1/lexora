import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type DragHandleProps = {
  onPress: () => void;
  // Optional panHandlers for bottom sheets

  panHandlers?: any;
};

export function DragHandle({ onPress, panHandlers }: DragHandleProps) {
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
        <View style={styles.indicator} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingTop: 16, paddingBottom: 10 },
  indicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7c7cc",
  },
});
