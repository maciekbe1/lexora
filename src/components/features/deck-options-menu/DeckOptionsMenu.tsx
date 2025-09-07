import { CancelFooterButton } from "@/components/ui/CancelFooterButton";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeckOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  isDeleting?: boolean;
}

export function DeckOptionsMenu({
  visible,
  onClose,
  onEditDeck,
  onDeleteDeck,
  isDeleting = false,
}: DeckOptionsMenuProps) {
  const { colors, mode } = useAppTheme();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const menuHeightRef = React.useRef(0);
  const isClosingRef = React.useRef(false);

  // Unified gesture thresholds (same as BaseModal)
  const DRAG_ACTIVATION_DY = 6;
  const DISMISS_DISTANCE = 100;
  const DISMISS_VELOCITY = 1.0;

  const animateIn = React.useCallback(() => {
    translateY.setValue(200);
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      mass: 1,
      stiffness: 120,
    }).start();
    backdropOpacity.setValue(0);
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [translateY, backdropOpacity]);

  const dismissWithAnimation = React.useCallback(
    (afterClose?: unknown) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      const distance =
        menuHeightRef.current > 0 ? menuHeightRef.current + 40 : 200;
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: distance,
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
        // Run the follow-up action (e.g., open edit modal) after closing
        // Defer to the next frame to avoid scheduling updates during insertion
        requestAnimationFrame(() => {
          isClosingRef.current = false;
          if (typeof afterClose === "function") (afterClose as () => void)();
        });
      });
    },
    [onClose, translateY, backdropOpacity]
  );

  React.useEffect(() => {
    if (visible) {
      animateIn();
    }
  }, [visible, animateIn]);

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && g.dy > DRAG_ACTIVATION_DY,
      onPanResponderMove: (_evt, g) => {
        const dy = Math.max(0, g.dy);
        translateY.setValue(dy);
        const screenHeight = Dimensions.get("window").height || 800;
        backdropOpacity.setValue(Math.max(0, 1 - dy / screenHeight));
      },
      onPanResponderRelease: (_evt, g) => {
        const shouldDismiss =
          g.vy > DISMISS_VELOCITY || g.dy > DISMISS_DISTANCE;
        if (shouldDismiss) dismissWithAnimation();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  const handleEditDeck = () => {
    dismissWithAnimation(() => {
      onEditDeck();
    });
  };

  const handleDeleteDeck = () => {
    dismissWithAnimation(() => {
      onDeleteDeck();
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={() => dismissWithAnimation()}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.optionsMenu,
          { transform: [{ translateY }] },
          { backgroundColor: colors.surface },
        ]}
        onLayout={(e) => {
          menuHeightRef.current = e.nativeEvent.layout.height;
        }}
      >
        <View
          style={styles.dragIndicatorContainer}
          {...panResponder.panHandlers}
          pointerEvents="box-only"
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => dismissWithAnimation()}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <View style={styles.dragIndicator} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContent}>
          <Text style={[styles.menuTitle, { color: colors.text }]}>
            Opcje talii
          </Text>

          <TouchableOpacity
            style={[
              styles.optionItem,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={handleEditDeck}
          >
            <View
              style={[styles.optionIcon, { backgroundColor: colors.surface }]}
            >
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Edytuj talię
              </Text>
              <Text
                style={[styles.optionSubtitle, { color: colors.mutedText }]}
              >
                Zmień nazwę, opis lub okładkę
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionItem,
              {
                backgroundColor: (mode === "dark"
                  ? "rgba(255,59,48,0.10)"
                  : "#fff5f5") as any,
                borderColor: colors.border,
              },
            ]}
            onPress={handleDeleteDeck}
            disabled={isDeleting}
          >
            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor: (mode === "dark"
                    ? "rgba(255,59,48,0.10)"
                    : "#fff5f5") as any,
                },
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FF3B30" />
              ) : (
                <Ionicons name="trash" size={20} color="#FF3B30" />
              )}
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={[styles.optionTitle, styles.deleteText]}>
                {isDeleting ? "Usuwanie..." : "Usuń talię"}
              </Text>
              <Text style={[styles.optionSubtitle, styles.deleteSubtitle]}>
                {isDeleting
                  ? "Proszę czekać..."
                  : "Usuń talię i wszystkie fiszki na zawsze"}
              </Text>
            </View>
          </TouchableOpacity>
          <CancelFooterButton onPress={() => dismissWithAnimation()} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 1000,
  },
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
  optionsMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    width: "100%",
    maxHeight: "50%",
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
  menuContent: {
    paddingVertical: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 20,
  },
  menuFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    marginTop: 8,
  },
  dragIndicatorContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 6,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c7c7cc",
  },
  optionItem: {
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editIcon: {
    backgroundColor: "#f0f8ff",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  deleteText: {
    color: "#FF3B30",
  },
  deleteSubtitle: {
    color: "#FF3B30",
  },
});
