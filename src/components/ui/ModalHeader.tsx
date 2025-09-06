import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  headerRight?: ReactNode;
  rightButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  } | undefined;
  showCancel?: boolean;
}

export function ModalHeader({
  title,
  onClose,
  headerRight,
  rightButton,
  showCancel = false,
}: ModalHeaderProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {showCancel ? (
        <TouchableOpacity
          onPress={onClose}
          style={styles.cancelButton}
          accessibilityRole="button"
          accessibilityLabel="Anuluj"
        >
          <Text style={[styles.cancelText, { color: colors.primary }]}>Anuluj</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.leftButtonPlaceholder} />
      )}
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      <View style={styles.headerRightContainer}>
        {headerRight ? (
          headerRight
        ) : rightButton ? (
          <TouchableOpacity
            onPress={rightButton.onPress}
            style={[
              styles.rightButton,
              (rightButton.disabled || rightButton.loading) && styles.rightButtonDisabled,
            ]}
            disabled={rightButton.disabled || rightButton.loading}
          >
            <Text style={styles.rightButtonText}>
              {rightButton.loading ? "Ładowanie..." : rightButton.text}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cancelButton: { 
    padding: 8 
  },
  cancelText: { fontSize: 16 },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  rightButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rightButtonDisabled: {
    opacity: 0.5,
  },
  rightButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  leftButtonPlaceholder: {
    width: 60,
  },
  headerRightContainer: {
    minWidth: 60,
    alignItems: "flex-end",
  },
});
