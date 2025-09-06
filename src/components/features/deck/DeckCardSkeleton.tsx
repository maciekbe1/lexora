import { SkeletonView } from "@/components/ui/Skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export function DeckCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonView style={styles.icon} borderRadius={24} />
        <View style={styles.info}>
          <SkeletonView style={styles.title} />
          <SkeletonView style={styles.subtitle} />
          <SkeletonView style={styles.meta} />
        </View>
        <SkeletonView style={styles.badge} borderRadius={10} />
      </View>
      <View style={styles.statsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.stat}>
            <SkeletonView style={styles.statNumber} />
            <SkeletonView style={styles.statLabel} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
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
    alignItems: "flex-start",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    height: 20,
    width: "60%",
    marginBottom: 8,
  },
  subtitle: {
    height: 16,
    width: "85%",
    marginBottom: 6,
  },
  meta: {
    height: 12,
    width: "30%",
  },
  badge: {
    width: 20,
    height: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    height: 30,
    width: 24,
    marginBottom: 8,
  },
  statLabel: {
    height: 14,
    width: 60,
  },
});
