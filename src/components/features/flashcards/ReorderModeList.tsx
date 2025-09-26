import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "@/theme/useAppTheme";
import type { CustomFlashcard, TemplateFlashcard } from "@/types/flashcard";
import { Ionicons } from "@expo/vector-icons";

interface ReorderModeListProps {
  flashcards: (CustomFlashcard | TemplateFlashcard)[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete?: (flashcard: CustomFlashcard | TemplateFlashcard) => void;
}

export function ReorderModeList({
  flashcards,
  onReorder: _onReorder,
  onDelete,
}: ReorderModeListProps) {
  const { colors } = useAppTheme();

  const renderItem = ({ item }: { item: CustomFlashcard | TemplateFlashcard }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.dragHandle}
        onPress={() => {}}
      >
        <Ionicons name="reorder-three" size={24} color={colors.mutedText} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.frontText, { color: colors.text }]} numberOfLines={1}>
          {item.front_text}
        </Text>
        <Text style={[styles.backText, { color: colors.mutedText }]} numberOfLines={1}>
          {item.back_text}
        </Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={flashcards}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  frontText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  backText: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});