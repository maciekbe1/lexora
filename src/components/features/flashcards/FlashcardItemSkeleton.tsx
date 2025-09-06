import { SkeletonView } from "@/components/ui/Skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export function FlashcardItemSkeleton({
  showHint = true,
}: { showHint?: boolean } = {}) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonView style={styles.number} />
        <View style={styles.actions}>
          <SkeletonView style={styles.actionIcon} borderRadius={10} />
          <SkeletonView style={styles.actionIcon} borderRadius={10} />
        </View>
      </View>

      {/* Front side */}
      <View style={styles.section}>
        <SkeletonView style={styles.labelSm} />
        <SkeletonView style={styles.image} />
        <SkeletonView style={styles.textLineLg} />
        <SkeletonView style={styles.textLine} />
      </View>

      {/* Back side */}
      <View style={styles.section}>
        <SkeletonView style={styles.labelSm} />
        <SkeletonView style={styles.image} />
        <SkeletonView style={styles.textLineLg} />
        <SkeletonView style={styles.textLine} />
      </View>

      {/* Hint - conditionally shown */}
      {showHint && (
        <View style={styles.section}>
          <SkeletonView style={styles.labelSm} />
          <SkeletonView style={styles.textLine} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  number: { height: 16, width: 48 },
  actions: { flexDirection: "row", gap: 12 },
  actionIcon: { width: 24, height: 24 },
  section: { marginBottom: 16, gap: 8 },
  labelSm: { height: 14, width: 60 },
  image: { width: "100%", height: 120, borderRadius: 8 },
  textLineLg: { height: 16, width: "80%" },
  textLine: { height: 14, width: "60%" },
});
