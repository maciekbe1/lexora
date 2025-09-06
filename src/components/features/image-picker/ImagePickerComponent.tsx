import { useAuthStore } from "@/store";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BaseModal } from "@/components/ui";
import { SkeletonView } from "@/components/ui/Skeleton";
import {
  HistoryChips,
  SearchBar,
  SourceButton,
  UnsplashGrid,
} from "./components";
import { useImagePicker } from "./useImagePicker";

export interface ImagePickerComponentProps {
  imageUrl?: string;
  onImageSelected: (url: string) => void;
  placeholder?: string;
}

export function ImagePickerComponent({
  imageUrl,
  onImageSelected,
  placeholder = "Dodaj zdjęcie",
}: ImagePickerComponentProps) {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const {
    modalVisible,
    openModal,
    closeModal,
    unsplashImages,
    searchQuery,
    setSearchQuery,
    submitSearch,
    isLoading,
    isUploading,
    refreshing,
    hasMore,
    loadMoreImages,
    refreshImages,
    pickImageFromDevice,
    selectUnsplashImage,
    recentQueries,
    selectHistoryQuery,
    clearHistory,
    removeHistoryQuery,
    autoSearchEnabled,
    setAutoSearchEnabled,
  } = useImagePicker(user?.id, onImageSelected);
  const removeImage = () => onImageSelected("");
  const screenWidth = Dimensions.get("window").width;
  // BaseModal content has 20px horizontal padding on both sides.
  // Grid now uses no extra horizontal padding; reserve a fixed gap between columns.
  const CONTENT_PADDING = 20;
  const COLUMN_GAP = 12;
  const imageSize = Math.floor(
    (screenWidth - CONTENT_PADDING * 2 - COLUMN_GAP) / 2
  );

  return (
    <>
      <TouchableOpacity style={[styles.container]} onPress={openModal}>
        {imageUrl ? (
          <View style={styles.imageContainer}>
            {!isUploading && (
              <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
            )}
            {isUploading && <SkeletonView style={styles.selectedImage} />}
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.placeholderContainer,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            {isUploading ? (
              <SkeletonView
                style={{ width: "90%", height: 24, borderRadius: 6 }}
              />
            ) : (
              <>
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={colors.mutedText}
                />
                <Text
                  style={[styles.placeholderText, { color: colors.mutedText }]}
                >
                  {placeholder}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      <BaseModal
        visible={modalVisible}
        onClose={closeModal}
        title="Wybierz zdjęcie"
        disableScroll={true}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.buttonRow}>
            <SourceButton
              disabled={isUploading}
              onPress={pickImageFromDevice}
              label={isUploading ? "Przesyłanie..." : "Z urządzenia"}
            />
            <View style={styles.autoSearchToggle}>
              <Text style={[styles.autoLabel, { color: colors.mutedText }]}>Auto-szukaj</Text>
              <Switch
                value={autoSearchEnabled}
                onValueChange={setAutoSearchEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          </View>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={submitSearch}
          />

          {!isLoading && recentQueries.length > 0 && (
            <HistoryChips
              queries={recentQueries}
              onSelect={selectHistoryQuery}
              onClear={clearHistory}
              onRemove={removeHistoryQuery}
            />
          )}
          <UnsplashGrid
            images={unsplashImages}
            size={imageSize}
            onSelect={selectUnsplashImage}
            showLoading={isLoading || isUploading}
            refreshing={refreshing}
            onEnd={loadMoreImages}
            onRefresh={refreshImages}
            hasMore={hasMore}
          />
        </View>
      </BaseModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageContainer: { position: "relative" },
  selectedImage: { width: "100%", height: 120, resizeMode: "cover" },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
  },
  placeholderContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  placeholderText: { marginTop: 8, fontSize: 14, color: "#999" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  autoSearchToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  autoLabel: { fontSize: 12, color: "#666" },
});
