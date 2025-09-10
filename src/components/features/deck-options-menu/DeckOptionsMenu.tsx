import React from "react";
import { OptionsMenu } from "@/components/ui/OptionsMenu";
import type { OptionConfig } from "@/components/ui/OptionsMenu";

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

export function DeckOptionsMenu({
  visible,
  onClose,
  onEditDeck,
  onDeleteDeck,
  onToggleReorderMode,
  isDeleting = false,
  isCustomDeck = false,
  isReorderMode = false,
}: DeckOptionsMenuProps) {
  const options: OptionConfig[] = [
    { icon: 'pencil', title: 'Edytuj talię', subtitle: 'Zmień nazwę, opis lub okładkę', onPress: onEditDeck },
    ...(isCustomDeck && onToggleReorderMode ? [{
      icon: isReorderMode ? 'check' : 'move' as const,
      title: isReorderMode ? 'Zakończ układanie' : 'Układaj fiszki',
      subtitle: isReorderMode ? 'Wróć do normalnego widoku' : 'Zmień kolejność fiszek przeciągając',
      onPress: onToggleReorderMode
    }] : []),
    { icon: 'trash', title: isDeleting ? 'Usuwanie...' : 'Usuń talię', subtitle: isDeleting ? 'Proszę czekać...' : 'Usuń talię i wszystkie fiszki na zawsze', onPress: () => { if (!isDeleting) onDeleteDeck(); }, variant: 'destructive' },
  ];
  return <OptionsMenu visible={visible} onClose={onClose} title="Opcje talii" options={options} maxHeightPercent={0.5} />;
}

export default DeckOptionsMenu;
