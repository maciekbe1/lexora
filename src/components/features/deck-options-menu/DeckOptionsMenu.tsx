import React, { useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DeckOptionItem } from './DeckOptionItem';

interface DeckOptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onEditDeck: () => void;
  onDeleteDeck: () => void;
  onToggleReorderMode?: () => void;
  isDeleting?: boolean;
  isCustomDeck?: boolean;
  isReorderMode?: boolean;
}

interface DeckOptionConfig {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

const MODAL_HEIGHT_PERCENT = 0.5;
const MODAL_TITLE = 'Opcje talii';

// Text constants following Clean Code principles - no magic strings
const OPTION_TITLES = {
  EDIT_DECK: 'Edytuj talię',
  FINISH_REORDER: 'Zakończ układanie',
  START_REORDER: 'Układaj fiszki',
  DELETE_DECK: 'Usuń talię',
  DELETING: 'Usuwanie...',
} as const;

const OPTION_SUBTITLES = {
  EDIT_DECK: 'Zmień nazwę, opis lub okładkę',
  FINISH_REORDER: 'Wróć do normalnego widoku',
  START_REORDER: 'Zmień kolejność fiszek przeciągając',
  DELETE_DECK: 'Usuń talię i wszystkie fiszki na zawsze',
  DELETING_WAIT: 'Proszę czekać...',
} as const;

const ICONS = {
  EDIT: 'pencil',
  CHECK: 'check',
  MOVE: 'move',
  DELETE: 'trash',
} as const;

export default function DeckOptionsMenu(props: DeckOptionsMenuProps) {
  const {
    visible,
    onClose,
    onEditDeck,
    onDeleteDeck,
    onToggleReorderMode,
    isDeleting = false,
    isCustomDeck = false,
    isReorderMode = false,
  } = props;

  const modalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const createEditDeckOption = (): DeckOptionConfig => ({
    icon: ICONS.EDIT,
    title: OPTION_TITLES.EDIT_DECK,
    subtitle: OPTION_SUBTITLES.EDIT_DECK,
    onPress: onEditDeck,
  });

  const createReorderOption = (): DeckOptionConfig => ({
    icon: isReorderMode ? ICONS.CHECK : ICONS.MOVE,
    title: isReorderMode ? OPTION_TITLES.FINISH_REORDER : OPTION_TITLES.START_REORDER,
    subtitle: isReorderMode ? OPTION_SUBTITLES.FINISH_REORDER : OPTION_SUBTITLES.START_REORDER,
    onPress: onToggleReorderMode!,
  });

  const createDeleteOption = (): DeckOptionConfig => ({
    icon: ICONS.DELETE,
    title: isDeleting ? OPTION_TITLES.DELETING : OPTION_TITLES.DELETE_DECK,
    subtitle: isDeleting ? OPTION_SUBTITLES.DELETING_WAIT : OPTION_SUBTITLES.DELETE_DECK,
    onPress: handleDeletePress,
  });

  const handleDeletePress = (): void => {
    if (!isDeleting) {
      onDeleteDeck();
    }
  };

  const handleOptionPress = (onPress: () => void): void => {
    onPress();
    onClose();
  };

  const getMenuOptions = (): DeckOptionConfig[] => {
    const options: DeckOptionConfig[] = [createEditDeckOption()];

    if (isCustomDeck && onToggleReorderMode) {
      options.push(createReorderOption());
    }

    options.push(createDeleteOption());

    return options;
  };

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
      {options.map((option, index) => (
        <DeckOptionItem
            key={index}
            icon={option.icon}
            {...(option.iconColor && { iconColor: option.iconColor })}
            title={option.title}
            {...(option.subtitle && { subtitle: option.subtitle })}
            onPress={() => handleOptionPress(option.onPress)}
        />
      ))}
    </Modal>
  );
}
