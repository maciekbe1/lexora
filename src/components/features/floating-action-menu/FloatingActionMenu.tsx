import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DeckOptionItem } from '@/components/features/deck-options-menu';

interface FloatingActionMenuProps {
  visible: boolean;
  onClose: () => void;
  onCreateDeck: () => void;
  onCreateFlashcard: () => void;
  onBrowseTemplates: () => void;
}

interface ActionOptionConfig {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const MODAL_HEIGHT_PERCENT = 0.7;
const MODAL_TITLE = 'Szybkie akcje';

// Icon constants following Clean Code principles
const ICONS = {
  LIBRARY: 'library',
  CARD: 'card',
  SEARCH: 'search',
} as const;

// Color constants for consistent theming
const ICON_COLORS = {
  CREATE_FLASHCARD: '#34C759',
  BROWSE_TEMPLATES: '#FF9500',
} as const;

// Text constants - no magic strings
const ACTION_TITLES = {
  CREATE_DECK: 'Utwórz talię',
  ADD_FLASHCARD: 'Dodaj fiszkę',
  BROWSE_TEMPLATES: 'Przeglądaj talie',
} as const;

const ACTION_SUBTITLES = {
  CREATE_DECK: 'Stwórz własną kolekcję fiszek',
  ADD_FLASHCARD: 'Dodaj fiszkę do istniejącej talii',
  BROWSE_TEMPLATES: 'Wybierz z gotowych kolekcji',
} as const;

export default function FloatingActionMenu(props: FloatingActionMenuProps) {
  const {
    visible,
    onClose,
    onCreateDeck,
    onCreateFlashcard,
    onBrowseTemplates,
  } = props;

  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const createDeckOption = (): ActionOptionConfig => ({
    icon: ICONS.LIBRARY,
    title: ACTION_TITLES.CREATE_DECK,
    subtitle: ACTION_SUBTITLES.CREATE_DECK,
    onPress: onCreateDeck,
  });

  const createFlashcardOption = (): ActionOptionConfig => ({
    icon: ICONS.CARD,
    title: ACTION_TITLES.ADD_FLASHCARD,
    subtitle: ACTION_SUBTITLES.ADD_FLASHCARD,
    onPress: onCreateFlashcard,
    iconColor: ICON_COLORS.CREATE_FLASHCARD,
  });

  const browseTemplatesOption = (): ActionOptionConfig => ({
    icon: ICONS.SEARCH,
    title: ACTION_TITLES.BROWSE_TEMPLATES,
    subtitle: ACTION_SUBTITLES.BROWSE_TEMPLATES,
    onPress: onBrowseTemplates,
    iconColor: ICON_COLORS.BROWSE_TEMPLATES,
  });

  const handleOptionPress = (onPress: () => void): void => {
    onPress();
    onClose();
  };

  const getMenuOptions = (): ActionOptionConfig[] => [
    createDeckOption(),
    createFlashcardOption(),
    browseTemplatesOption(),
  ];

  const snapPoints = [`${Math.round(MODAL_HEIGHT_PERCENT * 100)}%`];
  const options = getMenuOptions();

  return (
    <Modal
      ref={modalRef}
      title={MODAL_TITLE}
      onClose={onClose}
      snapPoints={snapPoints}
      scrollable={false}
    >
      <View style={styles.container}>
        {options.map((option, index) => (
          <DeckOptionItem
            key={index}
            icon={option.icon}
            {...(option.iconColor && { iconColor: option.iconColor })}
            title={option.title}
            subtitle={option.subtitle}
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
