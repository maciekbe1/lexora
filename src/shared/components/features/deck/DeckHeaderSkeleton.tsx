import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonView } from '@/shared/components/ui/Skeleton';

export function DeckHeaderSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <SkeletonView style={styles.backBtn} borderRadius={12} />
        <View style={styles.center}>
          <SkeletonView style={styles.title} />
          <SkeletonView style={styles.subtitle} />
        </View>
        <View style={styles.rightGroup}>
          <SkeletonView style={styles.addBtn} borderRadius={8} />
          <SkeletonView style={styles.menuBtn} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 24, height: 24, marginRight: 16 },
  center: { flex: 1 },
  title: { height: 20, width: '60%' },
  subtitle: { height: 14, width: 90, marginTop: 6 },
  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: { width: 32, height: 32 },
  menuBtn: { width: 28, height: 28 },
});
