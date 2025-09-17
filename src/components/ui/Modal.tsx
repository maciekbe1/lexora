import React, { forwardRef, ReactNode, useCallback, useMemo } from 'react';
import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

export interface ModalProps extends Partial<BottomSheetModalProps> {
  children: ReactNode;
  title?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  scrollable?: boolean;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  headerRight?: ReactNode;
  fullHeight?: boolean;
}

export const Modal = forwardRef<BottomSheetModal, ModalProps>(
  (
    {
      children,
      title,
      showHandle = true,
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

    const snapPoints = useMemo(() => {
      if (customSnapPoints) return customSnapPoints;
      if (fullHeight) return ['95%'];
      return ['50%', '90%'];
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

    const ContentWrapper = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        handleIndicatorStyle={[
          styles.handleIndicator,
          { backgroundColor: colors.border },
          !showHandle && styles.hiddenHandle,
        ]}
        backgroundStyle={{
          backgroundColor: colors.surface,
        }}
        {...bottomSheetProps}
      >
        {(title || showCloseButton) && (
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            {showCloseButton && (
              <TouchableOpacity
                onPress={() => {
                  if (ref && 'current' in ref && ref.current) {
                    ref.current.dismiss();
                  }
                }}
                style={styles.closeButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            )}

            {title && (
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            )}

            {headerRight ? (
              <View style={styles.headerRight}>{headerRight}</View>
            ) : (
              <View style={styles.headerRightPlaceholder} />
            )}
          </View>
        )}

        <ContentWrapper
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ContentWrapper>
      </BottomSheetModal>
    );
  }
);

Modal.displayName = 'Modal';

const styles = StyleSheet.create({
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  hiddenHandle: {
    opacity: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    minWidth: 32,
  },
  headerRightPlaceholder: {
    width: 32,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});