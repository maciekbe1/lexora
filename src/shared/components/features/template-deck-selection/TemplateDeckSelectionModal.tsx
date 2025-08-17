import {
  SUPPORTED_LANGUAGES,
  getLanguageName,
} from "@/shared/constants/languages";
import type { TemplateDeck } from "@/shared/types/flashcard";
import { useAuthStore } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BaseModal } from "@/shared/components/ui";
import { LanguageTab } from "./LanguageTab";
import { TemplateDeckCard } from "./TemplateDeckCard";
import { useTemplateDeckSelection } from "./useTemplateDeckSelection";

export interface TemplateDeckSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onDeckAdded: () => void;
}

export function TemplateDeckSelectionModal({
  visible,
  onClose,
  onDeckAdded,
}: TemplateDeckSelectionModalProps) {
  const { user } = useAuthStore();
  const {
    templateDecks,
    userDeckIds,
    selectedLanguage,
    setSelectedLanguage,
    loading,
    addingDeckId,
    addDeckToCollection,
  } = useTemplateDeckSelection(user?.id);

  const availableDecks = templateDecks.filter((d) => !userDeckIds.has(d.id));

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Wybierz talię do nauki"
      disableScroll
    >
      <View style={styles.modalContainer}>
        <View style={styles.languageSelector}>
          <FlatList
            data={SUPPORTED_LANGUAGES}
            renderItem={({ item }) => (
              <LanguageTab
                item={item}
                selected={selectedLanguage === item.code}
                onSelect={setSelectedLanguage}
              />
            )}
            keyExtractor={(item) => item.code}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageTabsContainer}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Ładowanie dostępnych tali...</Text>
          </View>
        ) : (
          <FlatList
            data={availableDecks}
            renderItem={({ item }: { item: TemplateDeck }) => (
              <TemplateDeckCard
                item={item}
                isAdded={userDeckIds.has(item.id)}
                isAdding={addingDeckId === item.id}
                onAdd={() =>
                  addDeckToCollection(item, () => {
                    Alert.alert(
                      "Sukces",
                      `Talia "${item.name}" została dodana do Twojej kolekcji!`,
                      [
                        {
                          text: "OK",
                          onPress: () => {
                            onDeckAdded();
                            onClose();
                          },
                        },
                      ]
                    );
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={true}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Ionicons name="library-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyText}>
                  {templateDecks.length === 0
                    ? `Brak dostępnych tali w języku ${getLanguageName(
                        selectedLanguage
                      )}`
                    : `Wszystkie talie z języka ${getLanguageName(
                        selectedLanguage
                      )} zostały już dodane do kolekcji`}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "transparent" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  list: { paddingTop: 8, paddingBottom: 20 },
  separator: { height: 10 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 16,
    textAlign: "center",
  },
  languageSelector: {
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    marginBottom: 8,
  },
  languageTabsContainer: { paddingHorizontal: 0, paddingVertical: 8 },
});
