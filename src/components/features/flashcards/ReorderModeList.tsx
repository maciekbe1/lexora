import type { CustomFlashcard } from "@/types/flashcard";
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ReorderModeListProps {
  flashcards: CustomFlashcard[];
  onReorder: (data: CustomFlashcard[]) => void;
  isSyncing?: boolean;
  syncError?: string | null;
}

export function ReorderModeList({
  flashcards,
  onReorder,
  isSyncing = false,
  syncError = null,
}: ReorderModeListProps) {
  const { colors } = useAppTheme();

  const renderSyncStatus = () => {
    if (!isSyncing && !syncError) return null;

    return (
      <View style={[styles.syncStatus, { backgroundColor: colors.surface }]}>
        {isSyncing ? (
          <View style={styles.syncingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.syncText, { color: colors.mutedText }]}>
              Synchronizacja kolejności...
            </Text>
          </View>
        ) : syncError ? (
          <View style={styles.syncErrorContainer}>
            <Ionicons name="warning" size={16} color="#FF3B30" />
            <Text style={[styles.syncText, { color: "#FF3B30" }]}>
              Błąd synchronizacji: {syncError}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<CustomFlashcard>) => {
    const index = getIndex() ?? 0;
    
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={0.95}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            drag();
          }}
          disabled={isActive}
          style={[
            styles.item,
            {
              backgroundColor: colors.surface,
              opacity: isActive ? 0.95 : 1,
              elevation: isActive ? 8 : 3,
            },
          ]}
        >
          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.position, { color: colors.primary }]}>
              #{index + 1}
            </Text>
            <Text
              style={[styles.frontText, { color: colors.text }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.front_text}
            </Text>
          </View>

          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <Ionicons
              name="reorder-three"
              size={24}
              color={colors.mutedText}
            />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      {renderSyncStatus()}
      <DraggableFlatList
        data={flashcards}
        onDragEnd={({ data }) => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onReorder(data);
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  syncStatus: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  syncingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  syncText: {
    fontSize: 14,
    fontWeight: "500",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  separator: {
    height: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  position: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 32,
  },
  frontText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  dragHandle: {
    padding: 8,
    marginLeft: 8,
  },
});