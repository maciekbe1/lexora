import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseModal } from '@/components/ui';
import { ThemeMode } from '@/store/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialMode?: ThemeMode; // 'system' | 'light' | 'dark'
  onSave: (mode: ThemeMode) => Promise<boolean> | boolean;
}

export function ThemePreferencesModal({ visible, onClose, initialMode = 'system', onSave }: Props) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) setMode(initialMode);
  }, [visible, initialMode]);

  const save = async () => {
    setSaving(true);
    const ok = await onSave(mode);
    setSaving(false);
    if (ok) onClose();
  };

  const Option = ({ value, label }: { value: ThemeMode; label: string }) => (
    <TouchableOpacity
      style={[styles.option, mode === value && styles.optionActive]}
      onPress={() => setMode(value)}
    >
      <Text style={[styles.optionText, mode === value && styles.optionTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Motyw aplikacji"
      rightButton={{ text: saving ? 'Zapisywanie…' : 'Zapisz', onPress: save, disabled: saving, loading: saving }}
    >
      <View style={styles.container}>
        <Option value="system" label="Zgodnie z ustawieniami urządzenia" />
        <Option value="light" label="Jasny" />
        <Option value="dark" label="Ciemny" />
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e3e7',
    backgroundColor: '#f9f9fb',
  },
  optionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionText: { fontSize: 16, color: '#1a1a1a' },
  optionTextActive: { color: '#007AFF', fontWeight: '600' },
});

