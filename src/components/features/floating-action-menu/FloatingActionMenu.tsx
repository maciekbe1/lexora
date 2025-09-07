import type { OptionConfig } from "@/components/ui/OptionsMenu";
import { OptionsMenu } from "@/components/ui/OptionsMenu";
import React from "react";

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
  const options: OptionConfig[] = [
    {
      icon: "library",
      title: "Utwórz talię",
      subtitle: "Stwórz własną kolekcję fiszek",
      onPress: onCreateDeck,
    },
    {
      icon: "card",
      title: "Dodaj fiszkę",
      subtitle: "Dodaj fiszkę do istniejącej talii",
      onPress: onCreateFlashcard,
      iconColor: "#34C759",
    },
    {
      icon: "search",
      title: "Przeglądaj talie",
      subtitle: "Wybierz z gotowych kolekcji",
      onPress: onBrowseTemplates,
      iconColor: "#FF9500",
    },
  ];
  return (
    <OptionsMenu
      visible={visible}
      onClose={onClose}
      title="Szybkie akcje"
      options={options}
      maxHeightPercent={0.7}
    />
  );
}

export default FloatingActionMenu;
