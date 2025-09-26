import { useAuthStore } from "@/store";
import { useAppTheme } from "@/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Modal } from "@/components/ui/Modal";
import { SkeletonView } from "@/components/ui/Skeleton";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  HistoryChips,
  SearchBar,
  SourceButton,
  UnsplashGrid,
} from "./ImagePickerElements";
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
  const modalRef = useRef<BottomSheetModal>(null);
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
  // Modal content has 20px horizontal padding on both sides.

  // Handle modal visibility
  React.useEffect(() => {
    if (modalVisible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [modalVisible]);
  // Grid now uses no extra horizontal padding; reserve a fixed gap between columns.
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
              <Ionicons name="close-circle" size={ICON_SIZE} color="#fff" />
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
                  size={ICON_SIZE_LARGE}
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

      <Modal
        ref={modalRef}
        title="Wybierz zdjęcie"
        onClose={closeModal}
        scrollable={false}
        fullHeight
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
      </Modal>
    </>
  );
}

// Named constants for styling
const IMAGE_HEIGHT = 120;
const BORDER_RADIUS = 8;
const ICON_SIZE = 24;
const REMOVE_BUTTON_RADIUS = 12;
const BUTTON_SPACING = 8;
const ICON_SIZE_LARGE = 32;
const CONTENT_PADDING = 20;
const COLUMN_GAP = 12;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
  },
  imageContainer: { position: "relative" },
  selectedImage: { width: "100%", height: IMAGE_HEIGHT, resizeMode: "cover" },
  removeButton: {
    position: "absolute",
    top: BUTTON_SPACING,
    right: BUTTON_SPACING,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: REMOVE_BUTTON_RADIUS,
  },
  placeholderContainer: {
    height: IMAGE_HEIGHT,
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
    paddingVertical: BUTTON_SPACING,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  autoSearchToggle: { flexDirection: "row", alignItems: "center", gap: BUTTON_SPACING },
  autoLabel: { fontSize: 12, color: "#666" },
});
