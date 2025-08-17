import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppHeader } from "@/shared/components/ui";
import { useAuthStore } from "@/store";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "toggle" | "action" | "info";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleSignOut = () => {
    Alert.alert("Wyloguj się", "Czy na pewno chcesz się wylogować?", [
      { text: "Anuluj", style: "cancel" },
      {
        text: "Wyloguj",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert("Błąd", "Nie udało się wylogować");
          }
        },
      },
    ]);
  };

  const handleExportData = () => {
    Alert.alert("Eksport danych", "Funkcja eksportu będzie wkrótce dostępna");
  };

  const handleImportData = () => {
    Alert.alert("Import danych", "Funkcja importu będzie wkrótce dostępna");
  };

  const handleBackup = () => {
    Alert.alert("Kopia zapasowa", "Funkcja backup będzie wkrótce dostępna");
  };

  const handleAbout = () => {
    Alert.alert(
      "O aplikacji",
      "Lexora v1.0.0\n\nAplikacja do nauki języków obcych z wykorzystaniem fiszek i algorytmu SM-2.\n\nStworzona z ❤️ dla uczących się języków."
    );
  };

  const handleSupport = () => {
    Alert.alert("Pomoc", "Centrum pomocy będzie wkrótce dostępne");
  };

  const handlePrivacy = () => {
    Alert.alert("Prywatność", "Polityka prywatności będzie wkrótce dostępna");
  };

  const settings: SettingItem[] = [
    // Account section
    {
      id: "account",
      title: "Konto",
      subtitle: user?.email || "Niezalogowany",
      icon: "person-circle",
      type: "info",
    },

    // Learning preferences
    {
      id: "notifications",
      title: "Powiadomienia",
      subtitle: "Otrzymuj przypomnienia o nauce",
      icon: "notifications",
      type: "toggle",
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: "daily-reminders",
      title: "Codzienne przypomnienia",
      subtitle: "Przypominaj o codziennej nauce",
      icon: "time",
      type: "toggle",
      value: dailyReminders,
      onToggle: setDailyReminders,
    },
    {
      id: "sound-effects",
      title: "Dźwięki",
      subtitle: "Efekty dźwiękowe w aplikacji",
      icon: "volume-high",
      type: "toggle",
      value: soundEffects,
      onToggle: setSoundEffects,
    },

    // Data management
    {
      id: "backup",
      title: "Kopia zapasowa",
      subtitle: "Zabezpiecz swoje dane",
      icon: "cloud-upload",
      type: "action",
      onPress: handleBackup,
    },
    {
      id: "export",
      title: "Eksport danych",
      subtitle: "Wyeksportuj swoje fiszki",
      icon: "download",
      type: "action",
      onPress: handleExportData,
    },
    {
      id: "import",
      title: "Import danych",
      subtitle: "Zaimportuj fiszki z pliku",
      icon: "document-text",
      type: "action",
      onPress: handleImportData,
    },

    // App info & support
    {
      id: "support",
      title: "Pomoc i wsparcie",
      subtitle: "Centrum pomocy",
      icon: "help-circle",
      type: "action",
      onPress: handleSupport,
    },
    {
      id: "privacy",
      title: "Prywatność",
      subtitle: "Polityka prywatności",
      icon: "shield-checkmark",
      type: "action",
      onPress: handlePrivacy,
    },
    {
      id: "about",
      title: "O aplikacji",
      subtitle: "Wersja i informacje",
      icon: "information-circle",
      type: "action",
      onPress: handleAbout,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.type === "info" && styles.infoItem]}
      onPress={item.onPress}
      disabled={item.type === "info"}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon as any} size={22} color="#007AFF" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === "toggle" && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: "#f0f0f0", true: "#007AFF" }}
            thumbColor="#ffffff"
          />
        )}
        {item.type === "action" && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Ustawienia" showAddButton={false} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          {settings.map(renderSettingItem)}
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <Text style={styles.signOutText}>Wyloguj się</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Lexora v1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Zbudowano z ❤️ dla uczących się języków
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    backgroundColor: "#ffffff",
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoItem: {
    backgroundColor: "#f8f9fa",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  settingRight: {
    marginLeft: 12,
  },
  signOutContainer: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: "#C7C7CC",
    textAlign: "center",
  },
});
