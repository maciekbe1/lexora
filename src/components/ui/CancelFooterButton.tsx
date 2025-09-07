import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label?: string;
  onPress: () => void;
};

export function CancelFooterButton({ label = "Anuluj", onPress }: Props) {
  const { colors, mode } = useAppTheme();
  return (
    <View
      style={[
        styles.menuFooter,
        { borderTopColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.actionItem,
          styles.cancelAction,
          {
            backgroundColor:
              mode === "dark" ? "rgba(255,59,48,0.10)" : "#fff0f0",
            borderColor: mode === "dark" ? colors.border : "#ffe0e0",
          },
        ]}
        onPress={onPress}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="close" size={24} color="#FF3B30" />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  cancelAction: {
    backgroundColor: "#fff0f0",
    borderWidth: 1,
    borderColor: "#ffe0e0",
    marginTop: 8,
  },
  menuFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    marginTop: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
});
