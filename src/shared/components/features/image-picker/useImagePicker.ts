import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert } from "react-native";
import { storageService } from "@/shared/services/storage";
import { unsplashService, type UnsplashImage } from "@/shared/services/unsplash";

export function useImagePicker(userId: string | undefined, onImageSelected: (url: string) => void) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [unsplashImages, setUnsplashImages] = React.useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Brak uprawnień", "Potrzebujemy dostępu do galerii, aby wybrać zdjęcie.");
      return false;
    }
    return true;
  };

  const pickImageFromDevice = React.useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission || !userId) return;
    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = `flashcard_image_${Date.now()}`;
        const publicUrl = await storageService.uploadImageFromDevice(asset.uri, fileName, userId);
        onImageSelected(publicUrl);
        setModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się przesłać zdjęcia");
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  }, [userId, onImageSelected]);

  const loadFeaturedImages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await unsplashService.getFlashcardPhotos("education");
      setUnsplashImages(response.results);
      setCurrentPage(1);
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się załadować zdjęć");
      console.error("Unsplash featured images error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUnsplash = React.useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) { await loadFeaturedImages(); return; }
    setIsLoading(true);
    try {
      const response = await unsplashService.searchPhotos(query, page, 20, "squarish");
      if (page === 1) setUnsplashImages(response.results);
      else setUnsplashImages((prev) => [...prev, ...response.results]);
      setCurrentPage(page);
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się wyszukać zdjęć");
      console.error("Unsplash search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFeaturedImages]);

  const loadMoreImages = React.useCallback(() => {
    if (!isLoading) searchUnsplash(searchQuery, currentPage + 1);
  }, [isLoading, searchQuery, currentPage, searchUnsplash]);

  const selectUnsplashImage = React.useCallback(async (image: UnsplashImage) => {
    if (!userId) return;
    setIsUploading(true);
    try {
      unsplashService.triggerDownload(image.download_url).catch(() => {});
      const fileName = `unsplash_${image.id}`;
      const publicUrl = await storageService.uploadUnsplashImage(image.urls.regular, fileName, userId);
      onImageSelected(publicUrl);
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się przesłać zdjęcia z Unsplash");
      console.error("Error uploading Unsplash image:", error);
    } finally {
      setIsUploading(false);
    }
  }, [userId, onImageSelected]);

  const openModal = React.useCallback(() => { setModalVisible(true); if (unsplashImages.length === 0) loadFeaturedImages(); }, [unsplashImages.length, loadFeaturedImages]);
  const closeModal = React.useCallback(() => setModalVisible(false), []);
  const submitSearch = React.useCallback(() => { searchUnsplash(searchQuery, 1); }, [searchQuery, searchUnsplash]);

  return { modalVisible, openModal, closeModal, unsplashImages, searchQuery, setSearchQuery, submitSearch, isLoading, isUploading, loadMoreImages, pickImageFromDevice, selectUnsplashImage } as const;
}
