import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modal } from '@/components/ui/Modal';
import { ThemeMode } from '@/store/theme';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialMode?: ThemeMode; // 'system' | 'light' | 'dark'
  onSave: (mode: ThemeMode) => Promise<boolean> | boolean;
}

export function ThemePreferencesModal({ visible, onClose, initialMode = 'system', onSave }: Props) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [saving, setSaving] = useState(false);

  // Handle modal visibility
  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) setMode(initialMode);
  }, [visible, initialMode]);

  const save = async () => {
    setSaving(true);
    const ok = await onSave(mode);
    setSaving(false);
    if (ok) modalRef.current?.dismiss();
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
    <Modal
      ref={modalRef}
      title="Motyw aplikacji"
      onClose={onClose}
      headerRight={
        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Zapisywanie…' : 'Zapisz'}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.container}>
        <Option value="system" label="Zgodnie z ustawieniami urządzenia" />
        <Option value="light" label="Jasny" />
        <Option value="dark" label="Ciemny" />
      </View>
    </Modal>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

