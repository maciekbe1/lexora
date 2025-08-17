import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { UnsplashImage } from "@/shared/services/unsplash";
import { SkeletonView } from "@/shared/components/ui/Skeleton";

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

export function HistoryChips({
  queries,
  onSelect,
  onClear,
  onRemove,
}: {
  queries: string[];
  onSelect: (q: string) => void;
  onClear?: () => void;
  onRemove?: (q: string) => void;
}) {
  if (!queries || queries.length === 0) return null;
  return (
    <View style={styles.historyContainer}>
      <View style={styles.historyChips}>
        {queries.map((q) => (
          <View key={q} style={styles.chip}>
            <TouchableOpacity style={styles.chipTextWrap} onPress={() => onSelect(q)}>
              <Text style={styles.chipText} numberOfLines={1}>
                {q.length > 30 ? `${q.slice(0, 27)}…` : q}
              </Text>
            </TouchableOpacity>
            {onRemove ? (
              <TouchableOpacity style={styles.chipClose} onPress={() => onRemove(q)} accessibilityLabel={`Usuń ${q} z historii`}>
                <Ionicons name="close" size={12} color="#666" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>
      {onClear ? (
        <TouchableOpacity onPress={onClear} accessibilityLabel="Wyczyść historię">
          <Text style={styles.clearHistoryText}>Wyczyść</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function UnsplashGrid({
  images,
  size,
  onSelect,
  showLoading,
  refreshing,
  onEnd,
  onRefresh,
  hasMore,
}: {
  images: UnsplashImage[];
  size: number;
  onSelect: (img: UnsplashImage) => void;
  showLoading: boolean;
  refreshing: boolean;
  onEnd: () => void;
  onRefresh: () => void;
  hasMore: boolean;
}) {
  const renderSkeleton = () => (
    <View style={[styles.unsplashImage, { width: size, height: size }]}>
      <SkeletonView style={styles.unsplashImageContent} />
    </View>
  );

  const renderTile = ({ item }: { item: UnsplashImage }) => (
    <UnsplashTile image={item} size={size} onSelect={onSelect} />
  );

  if (images.length === 0 && showLoading) {
    const skeletons = Array.from({ length: 6 }, (_, i) => i);
    return (
      <FlatList
        data={skeletons}
        keyExtractor={(i) => `sk-${i}`}
        renderItem={renderSkeleton}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.imagesContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      data={images}
      keyExtractor={(img) => img.id}
      renderItem={renderTile}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.imagesContent}
      onEndReached={onEnd}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={
        images.length > 0 ? (
          <View style={styles.loadingContainer}>
            {showLoading && hasMore ? (
              <>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Ładowanie kolejnych zdjęć…</Text>
              </>
            ) : !hasMore ? (
              <Text style={styles.loadingText}>Brak dalszych wyników</Text>
            ) : null}
          </View>
        ) : null
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

function UnsplashTile({
  image,
  size,
  onSelect,
}: {
  image: UnsplashImage;
  size: number;
  onSelect: (img: UnsplashImage) => void;
}) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <TouchableOpacity
      style={[styles.unsplashImage, { width: size, height: size }]}
      onPress={() => onSelect(image)}
      activeOpacity={0.8}
    >
      {!loaded && (
        <View style={styles.tileSkeletonOverlay}>
          <SkeletonView style={styles.unsplashImageContent} />
        </View>
      )}
      <Image
        source={{ uri: image.urls.small_s3 || image.urls.small || image.urls.thumb }}
        style={styles.unsplashImageContent}
        onLoadEnd={() => setLoaded(true)}
      />
    </TouchableOpacity>
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
    paddingVertical: 10,
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
  imagesContent: { paddingTop: 12, paddingBottom: 4 },
  columnWrapper: { justifyContent: 'space-between' },
  unsplashImage: { marginBottom: 12, borderRadius: 8, overflow: "hidden" },
  unsplashImageContent: { width: "100%", height: "100%", resizeMode: "cover" },
  tileSkeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  historyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  chip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 10,
    paddingRight: 6,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  chipTextWrap: { paddingRight: 6 },
  chipText: {
    color: '#333',
    fontSize: 12,
  },
  chipClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF3',
    marginLeft: 2,
  },
  clearHistoryText: {
    color: '#8E8E93',
    fontSize: 12,
  },
  loadingContainer: { padding: 20, alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  disabledButton: { opacity: 0.5 },
  disabledText: { color: "#999" },
});
