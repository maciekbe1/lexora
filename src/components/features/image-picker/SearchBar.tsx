import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/theme/useAppTheme";
import { t } from "@/locales/i18n";

const ICON_SIZE_MEDIUM = 20;
const BORDER_RADIUS_SMALL = 8;

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.searchContainer, { borderBottomColor: colors.border }]}>
      <BottomSheetTextInput
        style={[
          styles.searchInput,
          { borderColor: colors.border, color: colors.text },
        ]}
        placeholder={t("imagePicker.searchPlaceholder")}
        placeholderTextColor={colors.mutedText}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSubmit}>
        <Ionicons name="search" size={ICON_SIZE_MEDIUM} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_SMALL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
  },
});