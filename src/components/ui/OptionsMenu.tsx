import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, ModalProps } from './Modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { OptionItem } from '../features/deck-options-menu/components/OptionItem';

export interface OptionConfig {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
}

export interface OptionsMenuProps extends Omit<ModalProps, 'children'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: OptionConfig[];
  maxHeightPercent?: number;
}

export function OptionsMenu({
  visible,
  onClose,
  title,
  options,
  maxHeightPercent = 0.6,
  ...modalProps
}: OptionsMenuProps) {
  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const handleOptionPress = (onPress: () => void) => {
    onPress();
    onClose();
  };

  const snapPoints = [`${Math.round(maxHeightPercent * 100)}%`];

  return (
    <Modal
      ref={modalRef}
      {...(title && { title })}
      onClose={onClose}
      snapPoints={snapPoints}
      scrollable={false}
      {...modalProps}
    >
      <View style={styles.container}>
        {options.map((option, index) => (
          <OptionItem
            key={index}
            icon={option.icon}
            {...(option.iconColor && { iconColor: option.iconColor })}
            title={option.title}
            {...(option.subtitle && { subtitle: option.subtitle })}
            onPress={() => handleOptionPress(option.onPress)}
          />
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
  },
});