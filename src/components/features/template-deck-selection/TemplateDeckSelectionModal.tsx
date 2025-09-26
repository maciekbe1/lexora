import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BottomSheetModal, BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { useAuthStore } from "@/store";
import { SUPPORTED_LANGUAGES, getLanguageName } from "@/constants/languages";
import { MODAL_CONFIG } from "@/constants/modalConfig";
import type { TemplateDeck } from "@/types/flashcard";
import { TemplateDeckCard } from "./TemplateDeckCard";
import { useTemplateDeckSelection } from "./useTemplateDeckSelection";
import { Modal } from "@/components/ui/Modal";

export interface TemplateDeckSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onDeckAdded: () => void;
}

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  de: "🇩🇪",
  fr: "🇫🇷",
  pl: "🇵🇱",
};

export function TemplateDeckSelectionModal({
  visible,
  onClose,
  onDeckAdded,
}: TemplateDeckSelectionModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const { user } = useAuthStore();
  const [showLanguages, setShowLanguages] = useState(false);

  const {
    templateDecks,
    userDeckIds,
    selectedLanguage,
    setSelectedLanguage,
    loading,
    addingDeckId,
    addDeckToCollection,
    refreshData,
  } = useTemplateDeckSelection(user?.id);

  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
      refreshData?.();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const handleAddDeck = (deck: TemplateDeck) => {
    addDeckToCollection(deck, () => {
      Alert.alert(
        "Sukces",
        `Talia "${deck.name}" została dodana do Twojej kolekcji!`,
        [
          {
            text: "OK",
            onPress: () => {
              onDeckAdded();
              modalRef.current?.dismiss();
            },
          },
        ]
      );
    });
  };

  const headerRight = (
    <TouchableOpacity
      onPress={() => setShowLanguages(true)}
      style={[
        styles.languageButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={styles.flagIcon}>
        {LANGUAGE_FLAGS[selectedLanguage] || "🌍"}
      </Text>
      <Text style={[styles.languageText, { color: colors.text }]}>
        {getLanguageName(selectedLanguage).slice(0, 2).toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (showLanguages) {
      return (
        <>
          <View style={styles.languageHeader}>
            <TouchableOpacity
              onPress={() => setShowLanguages(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.languageTitle, { color: colors.text }]}>
              Wybierz język
            </Text>
          </View>

          <BottomSheetScrollView
            contentContainerStyle={styles.languageList}
            showsVerticalScrollIndicator={false}
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => {
                  setSelectedLanguage(language.code);
                  setShowLanguages(false);
                }}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.code && styles.languageItemActive,
                  selectedLanguage === language.code && {
                    backgroundColor: `${colors.primary}10`,
                  }
                ]}
              >
                <View style={styles.languageInfo}>
                  <Text style={styles.languageFlag}>
                    {LANGUAGE_FLAGS[language.code] || "🌍"}
                  </Text>
                  <Text
                    style={[
                      styles.languageName,
                      { color: colors.text },
                      selectedLanguage === language.code && {
                        color: colors.primary,
                        fontWeight: "600",
                      }
                    ]}
                  >
                    {language.name}
                  </Text>
                </View>
                {selectedLanguage === language.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </>
      );
    }

    if (loading) {
      return (
        <BottomSheetView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            Ładowanie dostępnych tali...
          </Text>
        </BottomSheetView>
      );
    }

    if (templateDecks.length === 0) {
      return (
        <BottomSheetView style={styles.emptyState}>
          <Ionicons name="library-outline" size={80} color={colors.mutedText} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Brak dostępnych tali
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            {`Nie ma dostępnych tali w języku ${getLanguageName(selectedLanguage)}`}
          </Text>
        </BottomSheetView>
      );
    }

    return (
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.deckList,
          { paddingBottom: insets.bottom + MODAL_CONFIG.PADDING.BOTTOM_SAFE }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {templateDecks.map((item, index) => (
          <React.Fragment key={item.id}>
            <TemplateDeckCard
              item={item}
              isAdded={userDeckIds.has(item.id)}
              isAdding={addingDeckId === item.id}
              onAdd={() => handleAddDeck(item)}
            />
            {index < templateDecks.length - 1 && <View style={{ height: 12 }} />}
          </React.Fragment>
        ))}
      </BottomSheetScrollView>
    );
  };

  return (
    <Modal
      ref={modalRef}
      title="Przegląd tali"
      onClose={onClose}
      headerRight={headerRight}
    >
      {renderContent()}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    minHeight: 56,
  },
  headerLeft: {
    width: 60,
  },
  headerRight: {
    width: 60,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  flagIcon: {
    fontSize: 16,
  },
  languageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  languageTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  languageList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  languageItemActive: {
    borderRadius: 12,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  languageFlag: {
    fontSize: 28,
  },
  languageName: {
    fontSize: 17,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  deckList: {
    paddingHorizontal: MODAL_CONFIG.PADDING.HORIZONTAL,
    paddingTop: MODAL_CONFIG.PADDING.VERTICAL,
    paddingBottom: MODAL_CONFIG.PADDING.BOTTOM_SAFE,
  },
});
