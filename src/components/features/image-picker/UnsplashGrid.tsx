import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SkeletonView } from "@/components/ui/Skeleton";
import type { UnsplashImage } from "@/services/unsplash";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

const GRID_COLUMNS = 2;
const SKELETON_ITEMS = 6;

interface UnsplashGridProps {
  images: UnsplashImage[];
  size: number;
  onSelect: (image: UnsplashImage) => void;
  showLoading: boolean;
  refreshing: boolean;
  onEnd: () => void;
  onRefresh: () => void;
  hasMore: boolean;
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
}: UnsplashGridProps) {
  const { colors } = useAppTheme();

  const renderSkeleton = () => (
    <View style={[styles.unsplashImage, { width: size, height: size }]}>
      <SkeletonView style={styles.unsplashImageContent} />
    </View>
  );

  const renderTile = ({ item }: { item: UnsplashImage }) => (
    <UnsplashTile image={item} size={size} onSelect={onSelect} />
  );

  if (images.length === 0 && showLoading) {
    const skeletons = Array.from({ length: SKELETON_ITEMS }, (_, i) => i);
    return (
      <FlatList
        data={skeletons}
        keyExtractor={(i) => `sk-${i}`}
        renderItem={renderSkeleton}
        numColumns={GRID_COLUMNS}
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
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.imagesContent}
      onEndReached={onEnd}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={
        <GridFooter
          showFooter={images.length > 0}
          showLoading={showLoading}
          hasMore={hasMore}
          colors={colors}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

interface GridFooterProps {
  showFooter: boolean;
  showLoading: boolean;
  hasMore: boolean;
  colors: any;
}

function GridFooter({ showFooter, showLoading, hasMore, colors }: GridFooterProps) {
  if (!showFooter) return null;

  return (
    <View style={styles.loadingContainer}>
      {showLoading && hasMore ? (
        <>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedText }]}>
            {t("imagePicker.loadingMore")}
          </Text>
        </>
      ) : !hasMore ? (
        <Text style={[styles.loadingText, { color: colors.mutedText }]}>
          {t("imagePicker.noMoreResults")}
        </Text>
      ) : null}
    </View>
  );
}

interface UnsplashTileProps {
  image: UnsplashImage;
  size: number;
  onSelect: (image: UnsplashImage) => void;
}

function UnsplashTile({ image, size, onSelect }: UnsplashTileProps) {
  const [loaded, setLoaded] = React.useState(false);

  const imageUri = image.urls.small_s3 || image.urls.small || image.urls.thumb;

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
        source={{ uri: imageUri }}
        style={styles.unsplashImageContent}
        onLoadEnd={() => setLoaded(true)}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imagesContent: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  unsplashImage: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  unsplashImageContent: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  tileSkeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});