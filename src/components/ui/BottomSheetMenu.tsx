import { useAppTheme } from "@/theme/useAppTheme";
import { useBaseModal } from "@/hooks/useBaseModal";
import React from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { TopGestureZone } from "@/components/ui/TopGestureZone";

type BottomSheetMenuProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode | ((dismiss: () => void) => React.ReactNode);
  maxHeightPercent?: number | undefined;
};

export function BottomSheetMenu({
  visible,
  onClose,
  children,
  maxHeightPercent = 0.7,
}: BottomSheetMenuProps) {
  const { colors } = useAppTheme();
  const { translateY, backdropOpacity, panResponder, dismissWithAnimation } = useBaseModal({ visible, onClose });

  const dismiss = React.useCallback(() => dismissWithAnimation(), [dismissWithAnimation]);
  const rendered = typeof children === 'function' ? (children as (d: () => void) => React.ReactNode)(dismiss) : children;
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
      >
        {/* Top gesture zone to reliably catch downward drags on the header area */}
        <TopGestureZone height={96} pointerEvents="box-only" {...panResponder.panHandlers as any} />
        <View
          style={styles.handle}
          pointerEvents="box-only"
          {...panResponder.panHandlers}
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

        <View style={styles.content} pointerEvents="box-none">
          {rendered}
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
