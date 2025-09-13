import { Modal } from "@/components/ui/Modal";
import {
  SUPPORTED_LANGUAGES,
  getLanguageFlag,
  getLanguageName,
} from "@/constants/languages";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  initialNative?: string; // optional; defaults handled internally
  initialTarget?: string; // optional; defaults handled internally
  onSave: (
    nativeLang: string,
    targetLang: string
  ) => Promise<boolean> | boolean;
}

export function LanguagePreferencesModal({
  visible,
  onClose,
  initialNative,
  initialTarget,
  onSave,
}: Props) {
  const modalRef = useRef<BottomSheetModal>(null);
  const [nativeLang, setNativeLang] = useState<string>(initialNative || "pl");
  const [targetLang, setTargetLang] = useState<string>(initialTarget || "en");
  const [saving, setSaving] = useState(false);

  // Handle modal visibility
  React.useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const save = async () => {
    if (!nativeLang || !targetLang) return;
    if (nativeLang === targetLang) {
      Alert.alert("Uwaga", "Język ojczysty i docelowy są identyczne.");
    }
    setSaving(true);
    const ok = await onSave(nativeLang, targetLang);
    setSaving(false);
    if (ok) modalRef.current?.dismiss();
  };

  // Sync local state with incoming props when the modal is opened or values change
  useEffect(() => {
    if (visible) {
      setNativeLang(initialNative || "pl");
      setTargetLang(initialTarget || "en");
    }
  }, [visible, initialNative, initialTarget]);

  return (
    <Modal
      ref={modalRef}
      title="Twoje języki"
      onClose={onClose}
      headerRight={
        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={[styles.saveButton, { opacity: saving ? 0.5 : 1 }]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Zapisywanie…" : "Zapisz"}
          </Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.section}>
        <Text style={styles.label}>Język ojczysty</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUPPORTED_LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.langChip,
                nativeLang === l.code && styles.langChipActive,
              ]}
              onPress={() => setNativeLang(l.code)}
            >
              <Text
                style={[
                  styles.langChipText,
                  nativeLang === l.code && styles.langChipTextActive,
                ]}
              >
                {getLanguageFlag(l.code)} {getLanguageName(l.code)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Język docelowy</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SUPPORTED_LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.langChip,
                targetLang === l.code && styles.langChipActive,
              ]}
              onPress={() => setTargetLang(l.code)}
            >
              <Text
                style={[
                  styles.langChipText,
                  targetLang === l.code && styles.langChipTextActive,
                ]}
              >
                {getLanguageFlag(l.code)} {getLanguageName(l.code)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#333" },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e3e3e7",
    backgroundColor: "#f9f9fb",
    marginRight: 8,
  },
  langChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  langChipText: { fontSize: 14, color: "#333" },
  langChipTextActive: { color: "#fff", fontWeight: "600" },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
