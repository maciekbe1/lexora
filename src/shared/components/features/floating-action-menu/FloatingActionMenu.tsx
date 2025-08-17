import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FloatingActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onCreateDeck: () => void;
  onCreateFlashcard: () => void;
  onBrowseTemplates: () => void;
}

export function FloatingActionMenu({
  visible,
  onClose,
  onCreateDeck,
  onCreateFlashcard,
  onBrowseTemplates,
}: FloatingActionMenuProps) {
  const translateY = React.useRef(new Animated.Value(0)).current;
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
  }, [translateY]);

  const dismissWithAnimation = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const distance =
      menuHeightRef.current > 0 ? menuHeightRef.current + 40 : 260;
    Animated.timing(translateY, {
      toValue: distance,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      // Do not reset translateY here; parent will hide the menu.
      // Clear guard on next frame to avoid re-entrancy during unmount.
      requestAnimationFrame(() => {
        isClosingRef.current = false;
      });
    });
  }, [onClose, translateY]);

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

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.overlayBackground}
        onPress={dismissWithAnimation}
      />
      <Animated.View
        style={[styles.actionMenu, { transform: [{ translateY }] }]}
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
            onPress={dismissWithAnimation}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <View style={styles.dragIndicator} />
          </TouchableOpacity>
        </View>
        <View style={styles.menuContent}>
          <ScrollView
            style={styles.menuScroll}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity style={styles.actionItem} onPress={onCreateDeck}>
              <View style={styles.actionIcon}>
                <Ionicons name="library" size={24} color="#007AFF" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Utwórz talię</Text>
                <Text style={styles.actionSubtitle}>
                  Stwórz własną kolekcję fiszek
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={onCreateFlashcard}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="card" size={24} color="#34C759" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Dodaj fiszkę</Text>
                <Text style={styles.actionSubtitle}>
                  Dodaj fiszkę do istniejącej talii
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={onBrowseTemplates}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="search" size={24} color="#FF9500" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Przeglądaj talie</Text>
                <Text style={styles.actionSubtitle}>
                  Wybierz z gotowych kolekcji
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.menuFooter}>
            <TouchableOpacity
              style={[styles.actionItem, styles.cancelAction]}
              onPress={dismissWithAnimation}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="close" size={24} color="#FF3B30" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionTitle, styles.cancelText]}>
                  Anuluj
                </Text>
              </View>
            </TouchableOpacity>
          </View>
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
  },
  overlayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionMenu: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    width: "100%",
    maxHeight: "70%",
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
    maxHeight: "100%",
  },
  menuScroll: {
    flexGrow: 0,
  },
  menuScrollContent: {
    paddingVertical: 12,
  },
  menuFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 16, android: 12, default: 12 }),
    backgroundColor: "#fff",
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
  actionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  cancelText: {
    color: "#FF3B30",
  },
});
