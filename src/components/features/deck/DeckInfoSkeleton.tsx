import { SkeletonView } from "@/components/ui/Skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export function DeckInfoSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonView style={styles.lineWide} />
      <SkeletonView style={styles.line} />
      <SkeletonView style={styles.metaSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lineWide: { height: 14, width: "85%", marginBottom: 8 },
  line: { height: 14, width: "60%", marginBottom: 12 },
  metaSmall: { height: 10, width: 120 },
});
