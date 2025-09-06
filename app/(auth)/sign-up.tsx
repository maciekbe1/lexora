import { LanguagePreferencesModal } from "@/components/features/preferences/LanguagePreferencesModal";
import { useAuthStore, usePreferencesStore } from "@/store";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { nativeLanguage, targetLanguage, initDefaults, setNative, setTarget, saveToServer } = usePreferencesStore();
  React.useEffect(() => { initDefaults(); }, []);
  const [showLangs, setShowLangs] = useState(false);
  const { signUp, loading, error } = useAuthStore();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Błąd", "Podaj email i hasło");
      return;
    }
    try {
      await signUp(email, password);
      // After sign-up, store preferences for this user
      const uid = useAuthStore.getState().user?.id;
      if (uid) {
        await saveToServer(uid);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      Alert.alert("Błąd rejestracji", error || "Nie udało się utworzyć konta");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Załóż konto</Text>
          <Text style={styles.subtitle}>Ustal od razu swoje języki</Text>
        </View>

        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Hasło"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.langPickerButton}
          onPress={() => setShowLangs(true)}
        >
          <Text style={styles.langPickerText}>Ustaw języki (obecnie: {nativeLanguage.toUpperCase()} → {targetLanguage.toUpperCase()})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? "Tworzenie..." : "Utwórz konto"}
          </Text>
        </TouchableOpacity>

        <LanguagePreferencesModal
          visible={showLangs}
          onClose={() => setShowLangs(false)}
          initialNative={nativeLanguage}
          initialTarget={targetLanguage}
          onSave={async (n, t) => {
            setNative(n);
            setTarget(t);
            return true;
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#666" },
  formGroup: { marginBottom: 16 },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  langPickerButton: {
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 8,
    marginBottom: 16,
  },
  langPickerText: { color: "#007AFF", fontWeight: "600" },
  signUpButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  signUpButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
});
