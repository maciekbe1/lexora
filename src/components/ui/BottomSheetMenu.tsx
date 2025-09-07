import { useAppTheme } from "@/theme/useAppTheme";
import React from "react";
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type BottomSheetMenuProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPercent?: number | undefined;
};

export function BottomSheetMenu({
  visible,
  onClose,
  children,
  maxHeightPercent = 0.7,
}: BottomSheetMenuProps) {
  const { colors } = useAppTheme();
  const translateY = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const menuHeightRef = React.useRef(0);
  const isClosingRef = React.useRef(false);

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

  const dismissWithAnimation = React.useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    const distance =
      menuHeightRef.current > 0 ? menuHeightRef.current + 40 : 260;
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
      requestAnimationFrame(() => {
        isClosingRef.current = false;
      });
    });
  }, [onClose, translateY, backdropOpacity]);

  React.useEffect(() => {
    if (visible) animateIn();
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

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={dismissWithAnimation}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY }] },
          {
            backgroundColor: colors.surface,
            maxHeight: `${Math.round(maxHeightPercent * 100)}%`,
          },
        ]}
        onLayout={(e) => {
          menuHeightRef.current = e.nativeEvent.layout.height;
        }}
      >
        <View
          style={styles.handle}
          {...panResponder.panHandlers}
          pointerEvents="box-only"
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={dismissWithAnimation}
            hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
          >
            <View
              style={[styles.indicator, { backgroundColor: colors.border }]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{children}</View>
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
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  handle: { alignItems: "center", paddingTop: 12, paddingBottom: 6 },
  indicator: { width: 36, height: 4, borderRadius: 2 },
  content: { paddingVertical: 12 },
});
