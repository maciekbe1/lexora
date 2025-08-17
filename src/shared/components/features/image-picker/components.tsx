import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { UnsplashImage } from "../../../services/unsplash";

export function SourceButton({
  disabled,
  onPress,
  label,
}: {
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.sourceButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name="phone-portrait"
        size={20}
        color={disabled ? "#999" : "#007AFF"}
      />
      <Text style={[styles.sourceButtonText, disabled && styles.disabledText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (t: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Szukaj zdjęć..."
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSubmit}>
        <Ionicons name="search" size={20} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
}

export function UnsplashGrid({
  images,
  size,
  onSelect,
  showLoading,
  loadingText,
  onEnd,
}: {
  images: UnsplashImage[];
  size: number;
  onSelect: (img: UnsplashImage) => void;
  showLoading: boolean;
  loadingText: string;
  onEnd: () => void;
}) {
  return (
    <ScrollView
      style={styles.imagesContainer}
      showsVerticalScrollIndicator={false}
      onScrollEndDrag={onEnd}
    >
      <View style={styles.imagesGrid}>
        {images.map((image) => (
          <TouchableOpacity
            key={image.id}
            style={[styles.unsplashImage, { width: size, height: size }]}
            onPress={() => onSelect(image)}
          >
            <Image
              source={{ uri: image.urls.thumb }}
              style={styles.unsplashImageContent}
            />
          </TouchableOpacity>
        ))}
      </View>
      {showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 8,
    marginRight: 12,
  },
  sourceButtonText: {
    marginLeft: 8,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: { padding: 8 },
  imagesContainer: { flex: 1 },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  unsplashImage: { marginBottom: 8, borderRadius: 8, overflow: "hidden" },
  unsplashImageContent: { width: "100%", height: "100%", resizeMode: "cover" },
  loadingContainer: { padding: 20, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  disabledButton: { opacity: 0.5 },
  disabledText: { color: "#999" },
});
