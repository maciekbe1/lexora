import { BaseModal } from "@/components/ui";
import {
  SUPPORTED_LANGUAGES,
  getLanguageFlag,
  getLanguageName,
} from "@/constants/languages";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [nativeLang, setNativeLang] = useState<string>(initialNative || "pl");
  const [targetLang, setTargetLang] = useState<string>(initialTarget || "en");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!nativeLang || !targetLang) return;
    if (nativeLang === targetLang) {
      Alert.alert("Uwaga", "Język ojczysty i docelowy są identyczne.");
    }
    setSaving(true);
    const ok = await onSave(nativeLang, targetLang);
    setSaving(false);
    if (ok) onClose();
  };

  // Sync local state with incoming props when the modal is opened or values change
  useEffect(() => {
    if (visible) {
      setNativeLang(initialNative || "pl");
      setTargetLang(initialTarget || "en");
    }
  }, [visible, initialNative, initialTarget]);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Twoje języki"
      rightButton={{
        text: saving ? "Zapisywanie…" : "Zapisz",
        onPress: save,
        disabled: saving,
        loading: saving,
      }}
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
    </BaseModal>
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
});
