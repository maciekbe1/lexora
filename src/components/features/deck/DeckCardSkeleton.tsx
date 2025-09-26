import React from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonView } from "@/components/ui/Skeleton";

export function DeckCardSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonView style={styles.skeleton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  skeleton: {
    height: 120,
    borderRadius: 12,
  },
});