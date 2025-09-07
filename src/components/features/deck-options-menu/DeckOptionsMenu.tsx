import React from "react";
import { OptionsMenu } from "@/components/ui/OptionsMenu";
import type { OptionConfig } from "@/components/ui/OptionsMenu";

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
  const options: OptionConfig[] = [
    { icon: 'pencil', title: 'Edytuj talię', subtitle: 'Zmień nazwę, opis lub okładkę', onPress: onEditDeck },
    { icon: 'trash', title: isDeleting ? 'Usuwanie...' : 'Usuń talię', subtitle: isDeleting ? 'Proszę czekać...' : 'Usuń talię i wszystkie fiszki na zawsze', onPress: () => { if (!isDeleting) onDeleteDeck(); }, variant: 'destructive' },
  ];
  return <OptionsMenu visible={visible} onClose={onClose} title="Opcje talii" options={options} maxHeightPercent={0.5} />;
}

export default DeckOptionsMenu;
