import { ModalDragHandle } from "@/components/ui/ModalDragHandle";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { useBaseModal } from "@/hooks/useBaseModal";
import { useAppTheme } from "@/theme/useAppTheme";
import { ThemedSurface } from "@/theme/ThemedSurface";
import { ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  headerRight?: ReactNode; // Custom header right slot (icon, action, etc.)
  rightButton?: {
    text: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  height?: "80%" | "90%"; // Default height options
  disableScroll?: boolean; // When true, renders children without internal ScrollView
  showCancel?: boolean; // When false, hides the left cancel button
}

export function BaseModal({
  visible,
  onClose,
  title,
  children,
  headerRight,
  rightButton,
  height = "90%",
  disableScroll = false,
  showCancel = false,
}: BaseModalProps) {
  const { colors } = useAppTheme();
  const { translateY, backdropOpacity, panResponder, dismissWithAnimation } =
    useBaseModal({
      visible,
      onClose,
    });

  return (
    <Modal
      visible={visible}
      onRequestClose={dismissWithAnimation}
      animationType="none"
      transparent={true}
    >
      {/* Animated backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={dismissWithAnimation}
        />
      </Animated.View>

      {/* Modal content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            height,
            transform: [{ translateY }],
          },
        ]}
      >
        <ThemedSurface style={[styles.modalContent]} withBorder={false} withShadow={true}>
          {/* Drag area with gestures */}
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <ModalDragHandle onPress={dismissWithAnimation} />
            <ModalHeader
              title={title}
              onClose={dismissWithAnimation}
              headerRight={headerRight}
              rightButton={rightButton}
              showCancel={showCancel}
            />
          </View>

          {/* Scrollable content area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 20}
          >
            {disableScroll ? (
              <View style={styles.contentNoScroll}>{children}</View>
            ) : (
              <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                bounces={true}
              >
                {children}
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </ThemedSurface>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  dragArea: {
    // Only the drag area handles pan gestures
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contentNoScroll: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
});
