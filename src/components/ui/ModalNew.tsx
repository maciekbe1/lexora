import React, { forwardRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { MODAL_CONFIG } from "@/constants/modalConfig";
import { useWindowDimensions } from "react-native";

export interface ModalProps extends Partial<BottomSheetModalProps> {
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  scrollable?: boolean;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  headerRight?: React.ReactNode;
  fullHeight?: boolean;
}

export const Modal = forwardRef<BottomSheetModal, ModalProps>(
  (
    {
      children,
      title,
      showCloseButton = true,
      scrollable = true,
      snapPoints: customSnapPoints,
      onClose,
      headerRight,
      fullHeight = false,
      ...bottomSheetProps
    },
    ref
  ) => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();
    const { height: screenHeight } = useWindowDimensions();

    // Unified max height for all modals: 85% of screen
    const MAX_SHEET_HEIGHT_PX = useMemo(
      () => Math.round((MODAL_CONFIG.MAX_HEIGHT_PERCENTAGE / 100) * screenHeight),
      [screenHeight]
    );
    const HEADER_MIN_HEIGHT = 56; // matches styles.header minHeight
    const CONTENT_MAX_HEIGHT = Math.max(0, MAX_SHEET_HEIGHT_PX - HEADER_MIN_HEIGHT);

    // Prefer dynamic sizing for small content; fall back to fixed points when requested
    const dynamicSizingEnabled = !customSnapPoints && !fullHeight;
    const snapPoints = useMemo(() => {
      if (customSnapPoints) return customSnapPoints;
      if (fullHeight) return ["95%"]; // near-full height sheet
      // When not using dynamic sizing, keep consistent large/max points
      return [MODAL_CONFIG.SNAP_POINTS.LARGE, MODAL_CONFIG.SNAP_POINTS.MAX];
    }, [customSnapPoints, fullHeight]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
      },
      [onClose]
    );

    const sheetProps = dynamicSizingEnabled ? {} : { snapPoints };

    return (
      <BottomSheetModal
        ref={ref}
        {...sheetProps}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.border },
        ]}
        backgroundStyle={{
          backgroundColor: colors.surface,
          borderTopLeftRadius: MODAL_CONFIG.BORDER_RADIUS,
          borderTopRightRadius: MODAL_CONFIG.BORDER_RADIUS,
        }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        enableDynamicSizing={dynamicSizingEnabled}
        enablePanDownToClose={true}
        topInset={Math.max(insets.top, MODAL_CONFIG.PADDING.BOTTOM_SAFE)}
        {...bottomSheetProps}
      >
        <View style={{ flex: 1 }}>
          {/* Fixed Header */}
          {(title || showCloseButton || headerRight) && (
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={styles.headerLeft}>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={() => {
                      if (ref && "current" in ref && ref.current) {
                        ref.current.dismiss();
                      }
                    }}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.headerCenter}>
                {title && (
                  <Text style={[styles.title, { color: colors.text }]}>
                    {title}
                  </Text>
                )}
              </View>

              <View style={styles.headerRight}>
                {headerRight}
              </View>
            </View>
          )}

          {/* Scrollable Content with unified max height. If content is small, sheet auto-sizes. */}
          <View style={{ flex: 1 }}>
            {scrollable ? (
              <BottomSheetScrollView
                // Max height ensures consistent cap across modals; small content shrinks.
                style={[{ maxHeight: CONTENT_MAX_HEIGHT }]}
                contentContainerStyle={[
                  styles.scrollContent,
                  {
                    paddingBottom:
                      insets.bottom + MODAL_CONFIG.PADDING.BOTTOM_SAFE,
                    // Allow content to shrink when small
                    flexGrow: 0,
                  },
                ]}
                showsVerticalScrollIndicator={false}
                bounces={true}
              >
                {children}
              </BottomSheetScrollView>
            ) : (
              <BottomSheetView
                style={[
                  styles.viewContent,
                  // Cap non-scroll content; note: overflowing content may be clipped
                  { maxHeight: CONTENT_MAX_HEIGHT },
                  {
                    paddingBottom:
                      insets.bottom + MODAL_CONFIG.PADDING.BOTTOM_SAFE,
                  },
                ]}
              >
                {children}
              </BottomSheetView>
            )}
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

Modal.displayName = "Modal";

const styles = StyleSheet.create({
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODAL_CONFIG.PADDING.HORIZONTAL,
    paddingVertical: MODAL_CONFIG.PADDING.VERTICAL,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: MODAL_CONFIG.PADDING.HORIZONTAL,
    paddingTop: MODAL_CONFIG.PADDING.VERTICAL,
  },
  viewContent: {
    flex: 1,
    paddingHorizontal: MODAL_CONFIG.PADDING.HORIZONTAL,
    paddingTop: MODAL_CONFIG.PADDING.VERTICAL,
  },
});
