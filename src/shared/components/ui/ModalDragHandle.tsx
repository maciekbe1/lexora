import { StyleSheet, TouchableOpacity, View } from "react-native";

interface ModalDragHandleProps {
  onPress: () => void;
}

export function ModalDragHandle({ onPress }: ModalDragHandleProps) {
  return (
    <TouchableOpacity
      style={styles.dragIndicatorContainer}
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
    >
      <View style={styles.dragIndicator} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dragIndicatorContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 12,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7c7cc",
  },
});