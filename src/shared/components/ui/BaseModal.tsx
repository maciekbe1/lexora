import { ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  showCancel = true,
}: BaseModalProps) {
  // Unified gesture thresholds across modals
  const DRAG_ACTIVATION_DY = 6; // start pan after slight pull
  const DISMISS_DISTANCE = 100; // pixels to dismiss
  const DISMISS_VELOCITY = 1.0; // velocity threshold to dismiss
  // Animation for swipe to dismiss - use useRef to prevent recreation
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const screenHeight = useRef(Dimensions.get("window").height).current;
  const dragOffset = useRef(0);

  const isClosingRef = useRef(false);
  const dismissWithAnimation = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset the guard shortly after parent hides the modal
      requestAnimationFrame(() => {
        isClosingRef.current = false;
      });
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g) => {
        const vertical = Math.abs(g.dy) > Math.abs(g.dx);
        return vertical && g.dy > DRAG_ACTIVATION_DY;
      },
      onPanResponderGrant: () => {
        dragOffset.current = 0;
      },
      onPanResponderMove: (_evt, g) => {
        const dy = Math.max(0, g.dy);
        dragOffset.current = dy;
        translateY.setValue(dy);
        backdropOpacity.setValue(Math.max(0, 1 - dy / screenHeight));
      },
      onPanResponderRelease: (_evt, g) => {
        const shouldDismiss =
          g.vy > DISMISS_VELOCITY || dragOffset.current > DISMISS_DISTANCE;
        if (shouldDismiss) {
          dismissWithAnimation();
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Start from bottom and animate in
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 100,
          overshootClamping: false,
          restSpeedThreshold: 0.1,
          restDisplacementThreshold: 0.1,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset to bottom when hidden
      translateY.setValue(screenHeight);
      backdropOpacity.setValue(0);
    }
  }, [visible, translateY, backdropOpacity, screenHeight]);

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
        <View style={styles.modalContent}>
          {/* Drag area with gestures */}
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            {/* Drag indicator (tap to close) */}
            <TouchableOpacity
              style={styles.dragIndicatorContainer}
              activeOpacity={0.7}
              onPress={dismissWithAnimation}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <View style={styles.dragIndicator} />
            </TouchableOpacity>

            <View style={styles.header}>
              {showCancel ? (
                <TouchableOpacity
                  onPress={dismissWithAnimation}
                  style={styles.cancelButton}
                  accessibilityRole="button"
                  accessibilityLabel="Anuluj"
                >
                  <Text style={styles.cancelText}>Anuluj</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.leftButtonPlaceholder} />
              )}
              <Text style={styles.title}>{title}</Text>
              <View style={styles.headerRightContainer}>
                {headerRight ? (
                  headerRight
                ) : rightButton ? (
                  <TouchableOpacity
                    onPress={rightButton.onPress}
                    style={[
                      styles.rightButton,
                      (rightButton.disabled || rightButton.loading) &&
                        styles.rightButtonDisabled,
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
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cancelButton: { padding: 8 },
  cancelText: { color: "#007AFF", fontSize: 16 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
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
  rightButtonPlaceholder: {
    width: 60, // Same width as typical button
  },
  leftButtonPlaceholder: {
    width: 60,
  },
  headerRightContainer: {
    minWidth: 60,
    alignItems: "flex-end",
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
