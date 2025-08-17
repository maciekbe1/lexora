import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "@/store";

import { BaseModal } from "@/shared/components/ui";
import { SearchBar, SourceButton, UnsplashGrid } from "./components";
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
    loadMoreImages,
    pickImageFromDevice,
    selectUnsplashImage,
  } = useImagePicker(user?.id, onImageSelected);
  const removeImage = () => onImageSelected("");
  const screenWidth = Dimensions.get("window").width;
  const imageSize = (screenWidth - 48) / 2;

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={openModal}>
        {imageUrl ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={32} color="#999" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      <BaseModal
        visible={modalVisible}
        onClose={closeModal}
        title="Wybierz zdjęcie"
      >
        <View style={styles.modalContainer}>
          <View style={styles.buttonRow}>
            <SourceButton
              disabled={isUploading}
              onPress={pickImageFromDevice}
              label={isUploading ? "Przesyłanie..." : "Z urządzenia"}
            />
          </View>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={submitSearch}
          />
          <UnsplashGrid
            images={unsplashImages}
            size={imageSize}
            onSelect={selectUnsplashImage}
            showLoading={isLoading || isUploading}
            loadingText={
              isUploading ? "Przesyłanie zdjęcia..." : "Ładowanie..."
            }
            onEnd={loadMoreImages}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
