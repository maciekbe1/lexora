import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/useAppTheme';

export function DeleteOption({ isDeleting, onPress }: { isDeleting?: boolean; onPress: () => void }) {
  const { colors, mode } = useAppTheme();
  const backgroundColor = mode === 'dark' ? 'rgba(255,59,48,0.10)' : '#fff5f5';
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor, borderColor: colors.border }]}
      onPress={onPress}
      disabled={isDeleting}
    >
      <View style={[styles.iconWrap, { backgroundColor }]}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#FF3B30" />
        ) : (
          <Ionicons name="trash" size={20} color="#FF3B30" />
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: '#FF3B30' }]}>{isDeleting ? 'Usuwanie...' : 'Usuń talię'}</Text>
        <Text style={[styles.subtitle, { color: '#FF3B30' }]}>
          {isDeleting ? 'Proszę czekać...' : 'Usuń talię i wszystkie fiszki na zawsze'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  subtitle: { fontSize: 14 },
});

