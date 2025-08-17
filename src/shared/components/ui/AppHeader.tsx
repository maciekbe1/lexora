import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddFlashcard?: () => void;
  onAddLesson?: () => void;
  onSmartCreate?: () => void;
}

export function AppHeader({
  title,
  showAddButton = true,
  onAddFlashcard,
  onAddLesson,
  onSmartCreate,
}: AppHeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const insets = useSafeAreaInsets();

  const handleAddPress = () => {
    if (Platform.OS === "ios") {
      // Use native ActionSheet on iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Anuluj",
            "Dodaj Fiszkę",
            "Dodaj Lekcję",
            "Smart Tworzenie",
          ],
          cancelButtonIndex: 0,
          title: "Co chcesz dodać?",
        },
        (buttonIndex) => {
          if (buttonIndex === 1) onAddFlashcard?.();
          if (buttonIndex === 2) onAddLesson?.();
          if (buttonIndex === 3) onSmartCreate?.();
        }
      );
    } else {
      // Show modal on Android
      setShowAddModal(true);
    }
  };

  const handleModalOption = (action: () => void) => {
    setShowAddModal(false);
    setTimeout(action, 100); // Small delay to let modal close
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showAddButton && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Android Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Co chcesz dodać?</Text>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleModalOption(() => onAddFlashcard?.())}
            >
              <Ionicons name="library" size={20} color="#007AFF" />
              <Text style={styles.modalOptionText}>Dodaj Fiszkę</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleModalOption(() => onAddLesson?.())}
            >
              <Ionicons name="book" size={20} color="#007AFF" />
              <Text style={styles.modalOptionText}>Dodaj Lekcję</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => handleModalOption(() => onSmartCreate?.())}
            >
              <Ionicons name="bulb" size={20} color="#007AFF" />
              <Text style={styles.modalOptionText}>Smart Tworzenie</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelOptionText}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 44, // Ensure minimum touch target height
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 40,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginLeft: 12,
  },
  cancelOption: {
    justifyContent: "center",
    borderBottomWidth: 0,
  },
  cancelOptionText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
